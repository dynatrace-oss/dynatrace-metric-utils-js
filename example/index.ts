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

/* eslint-disable no-console */

import { getDefaultOneAgentEndpoint, getDynatraceMetadata, getPayloadLinesLimit, MetricFactory } from "../src";

const factory = new MetricFactory({
    defaultDimensions: [{ key: "this_is_a_key", value: "and its value" }],
    staticDimensions: getDynatraceMetadata(),
    prefix: "prefix"
});

const gauge = factory.createGauge("my_gauge", [{ key: "metric_dimension_key", value: "and value" }], 23, new Date());
const deltaCounter = factory.createCounter("my_counter", [{ key: "metric_dimension_key", value: "and value" }], 23, new Date());
const summary = factory.createSummary("my_counter", [{ key: "metric_dimension_key", value: "and value" }], { min: 3, max: 32, count: 12, sum: 53 }, new Date());

console.log("Dynatrace API Constants:");
console.log(`Limit lines per payload:     ${getPayloadLinesLimit()}`);
console.log(`Default OneAgent endpoint:   ${getDefaultOneAgentEndpoint()}`);
console.log("");

if (gauge == null) {
    console.error("gauge normalization failed");
} else {
    console.log(gauge.serialize());
}

if (deltaCounter == null) {
    console.error("deltaCounter normalization failed");
} else {
    console.log(deltaCounter.serialize());
}

if (summary == null) {
    console.error("summary normalization failed");
} else {
    console.log(summary.serialize());
}
