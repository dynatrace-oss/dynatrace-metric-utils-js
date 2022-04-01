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
import { Counter, Gauge, Summary } from "../../src/metric";

const testDate = new Date(1624028522292);

describe("Metric", () => {
    describe("Counter", () => {
        it("should serialize a value", () => {
            const metric = new Counter("key", [], 1, testDate);
            assert.strictEqual(metric.serialize(), "key count,delta=1 1624028522292");
        });

        it("should make a best effort with non-numeric input", () => {
            // @ts-expect-error non-numeric input
            const metric = new Counter("key", [], "3", testDate);
            assert.strictEqual(metric.serialize(), "key count,delta=3 1624028522292");
        });
    });
    describe("Gauge", () => {
        it("should serialize a value", () => {
            const metric = new Gauge("key", [], 1, testDate);
            assert.strictEqual(metric.serialize(), "key gauge,1 1624028522292");
        });

        it("should make a best effort with non-numeric input", () => {
            // @ts-expect-error non-numeric input
            const metric = new Gauge("key", [], "3", testDate);
            assert.strictEqual(metric.serialize(), "key gauge,3 1624028522292");
        });
    });
    describe("Summary", () => {
        it("should serialize a value", () => {
            const metric = new Summary("key", [], { min: 1, max: 10, sum: 34, count: 42 }, testDate);
            assert.strictEqual(metric.serialize(), "key gauge,min=1,max=10,sum=34,count=42 1624028522292");
        });

        it("should make a best effort with non-numeric input", () => {
            // @ts-expect-error non-numeric input
            const metric = new Summary("key", [], { min: "1", max: "10", sum: "34", count: "42" }, testDate);
            assert.strictEqual(metric.serialize(), "key gauge,min=1,max=10,sum=34,count=42 1624028522292");
        });
    });
});
