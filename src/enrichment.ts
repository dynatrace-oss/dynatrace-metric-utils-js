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

import { readFileSync } from "fs";
import { Dimension } from "./metric";

const cIndirectionFilename = "dt_metadata_e617c525669e072eebe3d0f08212e8f2.json";

function readDynatraceMetadata(): Record<string, string> {
    const indirectionFileContents = readFileSync(cIndirectionFilename).toString("utf-8").trim();
    if (indirectionFileContents === "") {
        throw new Error("Dynatrace indirection file is empty");
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(readFileSync(indirectionFileContents).toString("utf8"));
}

/**
 * Return a list of dimensions from Dynatrace to attach to every metric.
 * This function performs synchronous I/O so should only be called once
 * and cached if possible.
 *
 * @returns list of dimensions from Dynatrace
 */
export function getDynatraceMetadata(): Dimension[] {
    try {
        return Object.entries(readDynatraceMetadata())
            .map(([key, value]) => ({ key, value }));
    } catch {
        return [];
    }
}
