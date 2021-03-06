# dynatrace-metric-utils-js

JavaScript utility for preparing communication with the [Dynatrace Metrics API v2](https://www.dynatrace.com/support/help/dynatrace-api/environment-api/metric-v2/).

## Installation

The library may be built from source or installed from NPM by running:

```shell
npm install @dynatrace/metric-utils
```

## Usage

An example for how to use this library can be found in [example/index.ts](example/index.ts).
It shows how to create metrics lines that can be sent to a [Dynatrace metrics ingest endpoint](https://www.dynatrace.com/support/help/dynatrace-api/environment-api/metric-v2/post-ingest-metrics/) using an HTTP client library.


### MetricFactory

For most basic use-cases, you will first create a `MetricFactory`. Using this `MetricFactory`, you will create individual `Metric`s which will then be serialized into strings.

```typescript
import { MetricFactory } from "@dynatrace/metric-utils";

const factory = new MetricFactory(options);
const gauge = factory.createGauge("my_gauge", dimensions, value, date);
```

See a list of constructor options [below](#constructor-options).

#### Metric Creation Methods

There are three methods to create metrics. Each takes a name, dimension list, value, and an optional date. They return a `Metric` or `undefined`. When a metric is created, its name and dimensions are normalized for ingestion by the Dynatrace Metrics API v2. If a metric cannot be normalized, it will be `undefined`.

- `createGauge` - A single value serialized as `gauge,<value>`
- `createCounterDelta` - A single value serialized as `count,delta=<value>`
- `createSummary` - A summary of multiple values serialized as `gauge,min=<min>,max=<max>,sum=<sum>,count=<count>`

Every metric is serializable using its `metric.serialize()` method, which returns a string. This string can be ingested by the Dynatrace Metrics API v2.

### Dynatrace Metadata Enrichment

When run on a host which has an active OneAgent, the exported function `getDynatraceMetadata` will return a list of dimensions provided by Dynatrace.
If no metadata is found, it will return an empty list.
More information on the underlying feature that is used by the library can be found in the
[Dynatrace documentation](https://www.dynatrace.com/support/help/how-to-use-dynatrace/metrics/metric-ingestion/ingestion-methods/enrich-metrics/) provided by Dynatrace.

### Common constants

The library also provides constants that might be helpful in the projects consuming this library.

To access the constants, call the respective methods from the `apiconstants` package:

```js
const defaultOneAgentEndpoint = getDefaultOneAgentEndpoint()
```

Currently available constants are:

* the default [local OneAgent metric API](https://www.dynatrace.com/support/help/how-to-use-dynatrace/metrics/metric-ingestion/ingestion-methods/local-api/) endpoint (`getDefaultOneAgentEndpoint()`)
* the limit for how many metric lines can be ingested in one request (`getPayloadLinesLimit()`)

### Constructor Options

#### `prefix: string`

A `prefix` will be used to prefix the name of any `Metric` created by the `MetricFactory`. For example, if the prefix `'my_prefix'` is used, a metric created with the name `'my_metric'` will be serialized with the name `'my_prefix.my_metric'`.

```typescript
const factory = new MetricFactory({
    prefix: "my_prefix",
});

const metric = factory.createGauge("my_gauge", [], 10);

console.log(metric.serialize());
// my_prefix.my_gauge 10
```

#### `defaultDimensions: Dimension[]`

`defaultDimensions` is a list of dimensions which will be exported with every metric unless one or more of them is overridden by a metric dimension or one of the static dimensions.

```typescript
const factory = new MetricFactory({
    defaultDimensions: [{ key: 'my_dimension', value: 'value 1'}],
});

const gauge1 = factory.createGauge("my_gauge", [], 10);
const gauge2 = factory.createGauge("my_gauge", [{ key: 'my_dimension', value: 'value 2' }], 10);

console.log(gauge1.serialize());
// my_gauge,my_dimension=value\ 1 10
console.log(gauge2.serialize());
// my_gauge,my_dimension=value\ 2 10
```

#### `staticDimensions: Dimension[]`

`staticDimensions` is a list of dimensions which will be exported with every metric and cannot be overridden by metric dimensions or by default dimensions.

```typescript
const factory = new MetricFactory({
    staticDimensions: [{ key: 'dim', value: 'static'}],
});

const gauge1 = factory.createGauge("my_gauge", [], 10);
const gauge2 = factory.createGauge("my_gauge", [{ key: 'dim', value: 'metric'}], 10);

console.log(gauge1.serialize());
// my_gauge,dim=static 10
console.log(gauge2.serialize());
// my_gauge,dim=static 10
```