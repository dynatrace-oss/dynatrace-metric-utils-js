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

import { getDynatraceMetadata } from "../src/enrichment";
import * as mock from "mock-fs";
import * as assert from "assert";

describe("Enrichment", () => {
    afterEach(() => {
        mock.restore();
    });

    describe("when indirection file does not exist", () => {
        it("should not crash", () => {
            assert.deepStrictEqual(getDynatraceMetadata(), []);
        });
    });

    describe("when indirection file is empty", () => {
        beforeEach(() => {
            mock({
                "dt_metadata_e617c525669e072eebe3d0f08212e8f2.json": ""
            });
        });

        it("should not crash", () => {
            assert.deepStrictEqual(getDynatraceMetadata(), []);
        });
    });


    describe("when the indirection points to a missing file", () => {
        beforeEach(() => {
            mock({
                "dt_metadata_e617c525669e072eebe3d0f08212e8f2.json": "missing.json"
            });
        });

        it("should not crash", () => {
            assert.deepStrictEqual(getDynatraceMetadata(), []);
        });
    });

    describe("when the indirection points to an invalid json file", () => {
        beforeEach(() => {
            mock({
                "dt_metadata_e617c525669e072eebe3d0f08212e8f2.json": "invalid.json",
                "invalid.json": "this is not json"
            });
        });

        it("should not crash", () => {
            assert.deepStrictEqual(getDynatraceMetadata(), []);
        });
    });

    describe("when the indirection file points to a valid json file", () => {
        beforeEach(() => {
            mock({
                "dt_metadata_e617c525669e072eebe3d0f08212e8f2.json": "valid.json",
                "valid.json": JSON.stringify({ property1: "value1" })
            });
        });

        it("should read metadata", () => {
            assert.deepStrictEqual(getDynatraceMetadata(), [{ key: "property1", value: "value1" }]);
        });
    });
});

