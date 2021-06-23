/*
Copyright 2021 Dynatrace LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as assert from "assert";
import { Counter, Gauge, MetricFactory, Summary } from "../../src/metric";

describe("MetricFactory", () => {
    let factory: MetricFactory;
    const now = new Date();

    before(() => {
        factory = new MetricFactory();
    });

    it("should create a counter", () => {
        const metric = factory.createCounter("counter_name", [], 25, now);
        assert.ok(metric instanceof Counter);
    });

    it("should create a gauge", () => {
        const metric = factory.createGauge("gauge_name", [], 25, now);
        assert.ok(metric instanceof Gauge);
    });

    it("should create a summary", () => {
        const metric = factory.createSummary("summary_name", [], { min: 1, max: 10, sum: 34, count: 42 }, now);
        assert.ok(metric instanceof Summary);
    });

    it("should serialize metrics", () => {
        const dcnt = factory.createCounter("name", [], 25, now);
        const gauge = factory.createGauge("name", [], 25, now);
        const summary = factory.createSummary("name", [], { min: 1, max: 10, sum: 34, count: 42 }, now);

        assert.strictEqual(dcnt?.serialize(), `name count,delta=25 ${now.valueOf()}`);
        assert.strictEqual(gauge?.serialize(), `name gauge,25 ${now.valueOf()}`);
        assert.strictEqual(summary?.serialize(), `name gauge,min=1,max=10,sum=34,count=42 ${now.valueOf()}`);
    });

    it("should serialize metrics without timestamps", () => {
        const dcnt = factory.createCounter("name", [], 25);
        const gauge = factory.createGauge("name", [], 25);
        const summary = factory.createSummary("name", [], { min: 1, max: 10, sum: 34, count: 42 });

        assert.strictEqual(dcnt?.serialize(), "name count,delta=25");
        assert.strictEqual(gauge?.serialize(), "name gauge,25");
        assert.strictEqual(summary?.serialize(), "name gauge,min=1,max=10,sum=34,count=42");
    });

    it("should not create metrics with invalid names", () => {
        const dcnt = factory.createCounter("", [], 25, now);
        const gauge = factory.createGauge("", [], 25, now);
        const summary = factory.createSummary("", [], { min: 1, max: 10, sum: 34, count: 42 }, now);

        assert.strictEqual(dcnt, null);
        assert.strictEqual(gauge, null);
        assert.strictEqual(summary, null);
    });

    it("should not create metrics with invalid values", () => {
        // @ts-expect-error invalid values should return null metrics
        const dcnt = factory.createCounter("name", [], true, now);
        // @ts-expect-error invalid values should return null metrics
        const gauge = factory.createGauge("name", [], true, now);
        // @ts-expect-error invalid values should return null metrics
        const summary = factory.createSummary("name", [], { min: 1, max: 10, sum: 34, count: true }, now);

        assert.strictEqual(dcnt, null);
        assert.strictEqual(gauge, null);
        assert.strictEqual(summary, null);
    });

    it("should not create metrics with infinite values", () => {
        const dcnt = factory.createCounter("name", [], Infinity, now);
        const gauge = factory.createGauge("name", [], Infinity, now);
        const summary = factory.createSummary("name", [], { min: 1, max: 10, sum: 34, count: Infinity }, now);

        assert.strictEqual(dcnt, null);
        assert.strictEqual(gauge, null);
        assert.strictEqual(summary, null);
    });

    it("should not create metrics with NaN values", () => {
        const dcnt = factory.createCounter("name", [], NaN, now);
        const gauge = factory.createGauge("name", [], NaN, now);
        const summary = factory.createSummary("name", [], { min: 1, max: 10, sum: 34, count: NaN }, now);

        assert.strictEqual(dcnt, null);
        assert.strictEqual(gauge, null);
        assert.strictEqual(summary, null);
    });

    it("should not create metrics with infinite values", () => {
        const dcnt = factory.createCounter("name", [], -Infinity, now);
        const gauge = factory.createGauge("name", [], Infinity, now);
        const summary = factory.createSummary("name", [], { min: 1, max: 10, sum: 34, count: -Infinity }, now);

        assert.strictEqual(dcnt, null);
        assert.strictEqual(gauge, null);
        assert.strictEqual(summary, null);
    });

    it("should include dimensions", () => {
        const dims = [
            { key: "dim", value: "value" }
        ];

        const dcnt = factory.createCounter("name", dims, 25, now);
        const gauge = factory.createGauge("name", dims, 25, now);
        const summary = factory.createSummary("name", dims, { min: 1, max: 10, sum: 34, count: 42 }, now);

        assert.strictEqual(dcnt?.serialize(), `name,dim=value count,delta=25 ${now.valueOf()}`);
        assert.strictEqual(gauge?.serialize(), `name,dim=value gauge,25 ${now.valueOf()}`);
        assert.strictEqual(summary?.serialize(), `name,dim=value gauge,min=1,max=10,sum=34,count=42 ${now.valueOf()}`);
    });

    it("should skip dimensions with invalid keys", () => {
        const dims = [
            { key: "dim", value: "value" },
            { key: "", value: "value2" }
        ];

        const dcnt = factory.createCounter("name", dims, 25, now);
        const gauge = factory.createGauge("name", dims, 25, now);
        const summary = factory.createSummary("name", dims, { min: 1, max: 10, sum: 34, count: 42 }, now);

        assert.strictEqual(dcnt?.serialize(), `name,dim=value count,delta=25 ${now.valueOf()}`);
        assert.strictEqual(gauge?.serialize(), `name,dim=value gauge,25 ${now.valueOf()}`);
        assert.strictEqual(summary?.serialize(), `name,dim=value gauge,min=1,max=10,sum=34,count=42 ${now.valueOf()}`);
    });

    it("should normalize dimension keys", () => {
        const dims = [
            { key: "dim", value: "value" },
            { key: "nörmalize", value: "value" }
        ];

        const dcnt = factory.createCounter("name", dims, 25, now);
        const gauge = factory.createGauge("name", dims, 25, now);
        const summary = factory.createSummary("name", dims, { min: 1, max: 10, sum: 34, count: 42 }, now);

        assert.strictEqual(dcnt?.serialize(), `name,dim=value,n_rmalize=value count,delta=25 ${now.valueOf()}`);
        assert.strictEqual(gauge?.serialize(), `name,dim=value,n_rmalize=value gauge,25 ${now.valueOf()}`);
        assert.strictEqual(summary?.serialize(), `name,dim=value,n_rmalize=value gauge,min=1,max=10,sum=34,count=42 ${now.valueOf()}`);
    });

    it("should skip dimensions with invalid values", () => {
        const dims = [
            { key: "dim", value: "value" },
            { key: "dim2", value: "" }
        ];

        const dcnt = factory.createCounter("name", dims, 25, now);
        const gauge = factory.createGauge("name", dims, 25, now);
        const summary = factory.createSummary("name", dims, { min: 1, max: 10, sum: 34, count: 42 }, now);

        assert.strictEqual(dcnt?.serialize(), `name,dim=value,dim2= count,delta=25 ${now.valueOf()}`);
        assert.strictEqual(gauge?.serialize(), `name,dim=value,dim2= gauge,25 ${now.valueOf()}`);
        assert.strictEqual(summary?.serialize(), `name,dim=value,dim2= gauge,min=1,max=10,sum=34,count=42 ${now.valueOf()}`);
    });

    it("should normalize and escape dimension values", () => {
        const dims = [
            { key: "dim", value: "value" },
            { key: "dim2", value: "a\u0000\u0000\u0000b\"quoted\"" }
        ];

        const dcnt = factory.createCounter("name", dims, 25, now);
        const gauge = factory.createGauge("name", dims, 25, now);
        const summary = factory.createSummary("name", dims, { min: 1, max: 10, sum: 34, count: 42 }, now);

        assert.strictEqual(dcnt?.serialize(), `name,dim=value,dim2=a_b\\"quoted\\" count,delta=25 ${now.valueOf()}`);
        assert.strictEqual(gauge?.serialize(), `name,dim=value,dim2=a_b\\"quoted\\" gauge,25 ${now.valueOf()}`);
        assert.strictEqual(summary?.serialize(), `name,dim=value,dim2=a_b\\"quoted\\" gauge,min=1,max=10,sum=34,count=42 ${now.valueOf()}`);
    });

    describe("with prefix", () => {
        before(() => {
            factory = new MetricFactory({ prefix: "prefix" });
        });

        it("should serialize metrics", () => {
            const dcnt = factory.createCounter("name", [], 25, now);
            const gauge = factory.createGauge("name", [], 25, now);
            const summary = factory.createSummary("name", [], { min: 1, max: 10, sum: 34, count: 42 }, now);

            assert.strictEqual(dcnt?.serialize(), `prefix.name count,delta=25 ${now.valueOf()}`);
            assert.strictEqual(gauge?.serialize(), `prefix.name gauge,25 ${now.valueOf()}`);
            assert.strictEqual(summary?.serialize(), `prefix.name gauge,min=1,max=10,sum=34,count=42 ${now.valueOf()}`);
        });
    });

    describe("with prefix with trailing .", () => {
        before(() => {
            factory = new MetricFactory({ prefix: "prefix." });
        });

        it("should serialize metrics", () => {
            const dcnt = factory.createCounter("name", [], 25, now);
            const gauge = factory.createGauge("name", [], 25, now);
            const summary = factory.createSummary("name", [], { min: 1, max: 10, sum: 34, count: 42 }, now);

            assert.strictEqual(dcnt?.serialize(), `prefix.name count,delta=25 ${now.valueOf()}`);
            assert.strictEqual(gauge?.serialize(), `prefix.name gauge,25 ${now.valueOf()}`);
            assert.strictEqual(summary?.serialize(), `prefix.name gauge,min=1,max=10,sum=34,count=42 ${now.valueOf()}`);
        });
    });

    describe("with default dimensions", () => {
        before(() => {
            factory = new MetricFactory({ defaultDimensions: [{ key: "from", value: "default" }] });
        });

        it("should serialize metrics", () => {
            const dcnt = factory.createCounter("name", [], 25, now);
            const gauge = factory.createGauge("name", [], 25, now);
            const summary = factory.createSummary("name", [], { min: 1, max: 10, sum: 34, count: 42 }, now);

            assert.strictEqual(dcnt?.serialize(), `name,from=default count,delta=25 ${now.valueOf()}`);
            assert.strictEqual(gauge?.serialize(), `name,from=default gauge,25 ${now.valueOf()}`);
            assert.strictEqual(summary?.serialize(), `name,from=default gauge,min=1,max=10,sum=34,count=42 ${now.valueOf()}`);
        });

        it("should prioritize metric dimensions over default", () => {
            const dcnt = factory.createCounter("name", [{ key: "from", value: "metric" }], 25, now);
            const gauge = factory.createGauge("name", [{ key: "from", value: "metric" }], 25, now);
            const summary = factory.createSummary("name", [{ key: "from", value: "metric" }], { min: 1, max: 10, sum: 34, count: 42 }, now);

            assert.strictEqual(dcnt?.serialize(), `name,from=metric count,delta=25 ${now.valueOf()}`);
            assert.strictEqual(gauge?.serialize(), `name,from=metric gauge,25 ${now.valueOf()}`);
            assert.strictEqual(summary?.serialize(), `name,from=metric gauge,min=1,max=10,sum=34,count=42 ${now.valueOf()}`);
        });
    });

    describe("with static dimensions", () => {
        before(() => {
            factory = new MetricFactory({ staticDimensions: [{ key: "from", value: "static" }] });
        });

        it("should serialize metrics", () => {
            const dcnt = factory.createCounter("name", [], 25, now);
            const gauge = factory.createGauge("name", [], 25, now);
            const summary = factory.createSummary("name", [], { min: 1, max: 10, sum: 34, count: 42 }, now);

            assert.strictEqual(dcnt?.serialize(), `name,from=static count,delta=25 ${now.valueOf()}`);
            assert.strictEqual(gauge?.serialize(), `name,from=static gauge,25 ${now.valueOf()}`);
            assert.strictEqual(summary?.serialize(), `name,from=static gauge,min=1,max=10,sum=34,count=42 ${now.valueOf()}`);
        });

        it("should prioritize static dimensions over metric", () => {
            const dcnt = factory.createCounter("name", [{ key: "from", value: "metric" }], 25, now);
            const gauge = factory.createGauge("name", [{ key: "from", value: "metric" }], 25, now);
            const summary = factory.createSummary("name", [{ key: "from", value: "metric" }], { min: 1, max: 10, sum: 34, count: 42 }, now);

            assert.strictEqual(dcnt?.serialize(), `name,from=static count,delta=25 ${now.valueOf()}`);
            assert.strictEqual(gauge?.serialize(), `name,from=static gauge,25 ${now.valueOf()}`);
            assert.strictEqual(summary?.serialize(), `name,from=static gauge,min=1,max=10,sum=34,count=42 ${now.valueOf()}`);
        });
    });
});
