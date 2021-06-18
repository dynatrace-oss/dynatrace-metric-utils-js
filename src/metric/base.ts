/*
Copyright 2020 Dynatrace LLC

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

import { Dimension, Metric } from "./types";

export abstract class BaseMetric<T> implements Metric {
    protected key: string;
    protected dimensions: Dimension[];
    protected value: T;
    protected timestamp?: number;

    constructor(key: string, dimensions: Dimension[], value: T, timestamp?: number) {
        this.key = key;
        this.dimensions = dimensions;
        this.value = value;
        this.timestamp = timestamp;
    }

    public serialize(): string {
        let line = this.key;
        if (this.dimensions.length > 0) {
            line = `${line},${this.dimensions.map(({ key, value }) => `${key}=${value}`).join(",")}`;
        }

        line = `${line} ${this.serializeValue()}`;

        if (this.timestamp != null) {
            line = `${line} ${this.timestamp}`;
        }

        return line;
    }

    protected abstract serializeValue(): string;
}



