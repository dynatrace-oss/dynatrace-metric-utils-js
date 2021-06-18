# dynatrace-metric-utils-js

JavaScript utility for preparing communication with the [Dynatrace Metrics API v2](https://www.dynatrace.com/support/help/dynatrace-api/environment-api/metric-v2/).

## Usage

An example for how to use this library can be found in [example/index.ts](example/index.ts).
It shows how to create metrics lines that can be sent to a [Dynatrace metrics ingest endpoint](https://www.dynatrace.com/support/help/dynatrace-api/environment-api/metric-v2/post-ingest-metrics/) using an HTTP client library.

### Preparation


### Metric line creation

### OneAgent Enrichment

### Common constants

The library also provides constants that might be helpful in the projects consuming this library.

To access the constants, call the respective methods from the `apiconstants` package:

```js
const defaultOneAgentEndpoint = getDefaultOneAgentEndpoint()
```

Currently available constants are:

* the default [local OneAgent metric API](https://www.dynatrace.com/support/help/how-to-use-dynatrace/metrics/metric-ingestion/ingestion-methods/local-api/) endpoint (`getDefaultOneAgentEndpoint()`)
* the limit for how many metric lines can be ingested in one request (`getPayloadLinesLimit()`)
