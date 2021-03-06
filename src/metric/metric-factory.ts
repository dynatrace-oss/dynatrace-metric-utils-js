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

import { normalizeDimensions, normalizeMetricKey } from "../normalize";
import { Counter } from "./counter";
import { Gauge } from "./gauge";
import { Dimension, Metric } from "./types";
import { Summary, SummaryValue } from "./summary";

export interface MetricFactoryOptions {
    prefix?: string;
    defaultDimensions?: Dimension[];
    staticDimensions?: Dimension[];
}

export class MetricFactory {
    private _prefix?: string;
    private _defaultDimensions: Dimension[];
    private _staticDimensions: Dimension[];

    /**
     * Return a new Metric Factory. If default dimensions are provided, they will be normalized.
     */
    constructor(options?: MetricFactoryOptions) {
        this._prefix = options?.prefix;
        this._defaultDimensions = this._deduplicateDimensions(
            normalizeDimensions(
                options?.defaultDimensions ?? []
            )
        );
        this._staticDimensions = options?.staticDimensions ?? [];
    }

    /**
     * Create a delta counter with a prefixed and normalized key and normalized dimensions.
     * Use a delta counter when a value represents only the change from the previous count.
     * Returns null if key normalization fails to produce a valid metric key.
     * If no explicit timestamp is provided, the server will use the current time when
     * the metric is ingested.
     */
    public createCounterDelta(name: string, dimensions: Dimension[], value: number, timestamp?: Date): Metric | null {
        const key = normalizeMetricKey(this._getKey(name));
        if (!key) {
            return null;
        }
        if (typeof value !== "number" || !isFinite(value)) {
            return null;
        }
        return new Counter(key, this._getDimensions(dimensions), value, timestamp);
    }

    /**
     * Create a gauge with a prefixed and normalized key and normalized dimensions.
     * Use a gauge when a value represents an observed measurement.
     * Returns null if key normalization fails to produce a valid metric key.
     * If no explicit timestamp is provided, the server will use the current time when
     * the metric is ingested.
     */
    public createGauge(name: string, dimensions: Dimension[], value: number, timestamp?: Date): Metric | null {
        const key = normalizeMetricKey(this._getKey(name));
        if (!key) {
            return null;
        }
        if (typeof value !== "number" || !isFinite(value)) {
            return null;
        }
        return new Gauge(key, this._getDimensions(dimensions), value, timestamp);
    }

    /**
     * Create a summary with a prefixed and normalized key and normalized dimensions.
     * Use a summary when individual data points and exact values are not needed.
     * Returns null if key normalization fails to produce a valid metric key.
     * If no explicit timestamp is provided, the server will use the current time when
     * the metric is ingested.
     */
    public createSummary(name: string, dimensions: Dimension[], value: SummaryValue, timestamp?: Date): Metric | null {
        const key = normalizeMetricKey(this._getKey(name));
        if (!key) {
            return null;
        }

        const min = value.min;
        const max = value.max;
        const count = value.count;
        const sum = value.sum;

        if (
            (typeof min !== "number" || !isFinite(min)) ||
            (typeof max !== "number" || !isFinite(max)) ||
            (typeof count !== "number" || !isFinite(count)) ||
            (typeof sum !== "number" || !isFinite(sum))
        ) {
            return null;
        }
        return new Summary(key, this._getDimensions(dimensions), { min, max, count, sum }, timestamp);
    }

    /**
     * Get the metric key with prefix if applicable
     */
    private _getKey(name: string): string {
        if (this._prefix != null) {
            return `${this._prefix}.${name}`;
        }
        return name;
    }

    /**
     * Get dimension list including default dimensions and OneAgent metadata if set
     */
    private _getDimensions(dimensions: Dimension[]): Dimension[] {
        return this._deduplicateDimensions([
            ...this._defaultDimensions,
            ...normalizeDimensions(dimensions),
            ...this._staticDimensions
        ]);
    }

    private _deduplicateDimensions(dimensions: Dimension[]): Dimension[] {
        const found: Record<string, Dimension> = {};

        dimensions.forEach(d => {
            found[d.key] = d;
        });

        return Object.values(found);
    }
}
