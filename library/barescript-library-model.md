# The BareScript Library Models

## Table of Contents

- [\<args.bare\>](#var.vPublish=true&var.vSingle=true&args-bare)
- [\<dataTable.bare\>](#var.vPublish=true&var.vSingle=true&datatable-bare)
- [\<diff.bare\>](#var.vPublish=true&var.vSingle=true&diff-bare)
- [\<pager.bare\>](#var.vPublish=true&var.vSingle=true&pager-bare)
- [Aggregation](#var.vPublish=true&var.vSingle=true&aggregation)
- [Line Chart](#var.vPublish=true&var.vSingle=true&line-chart)
- [RegexMatch](#var.vPublish=true&var.vSingle=true&regexmatch)
- [SystemFetch](#var.vPublish=true&var.vSingle=true&systemfetch)

---

## \<args.bare\>

### struct ArgsArgument

An argument model

| Name        | Type                       | Attributes                 | Description                                                                                                           |
|-------------|----------------------------|----------------------------|-----------------------------------------------------------------------------------------------------------------------|
| name        | string                     | len(value) > 0             | The argument name                                                                                                     |
| type        | [ArgsType](#enum-argstype) | optional                   | The argument type                                                                                                     |
| global      | string                     | optional<br>len(value) > 0 | The argument's global variable name                                                                                   |
| explicit    | bool                       | optional                   | If true, the argument is explicit. An explicit argument is only included in the URL if it is in the arguments object. |
| default     | any                        | optional                   | The default argument value                                                                                            |
| description | string                     | optional<br>len(value) > 0 | The argument description                                                                                              |

### typedef ArgsArguments

An argument model list

| Type                                    | Attributes     |
|-----------------------------------------|----------------|
| [ArgsArgument](#struct-argsargument) [] | len(array) > 0 |

### enum ArgsType

An argument value type

| Value    |
|----------|
| bool     |
| date     |
| datetime |
| float    |
| int      |
| string   |

---

## \<dataTable.bare\>

### struct DataTable

A data table model

| Name       | Type                                                     | Attributes                 | Description                                        |
|------------|----------------------------------------------------------|----------------------------|----------------------------------------------------|
| fields     | string []                                                | optional<br>len(array) > 0 | The table's fields                                 |
| categories | string []                                                | optional<br>len(array) > 0 | The table's category fields                        |
| formats    | [DataTableFieldFormat](#struct-datatablefieldformat) {}  | optional<br>len(dict) > 0  | The field formatting for "categories" and "fields" |
| precision  | int                                                      | optional<br>value >= 0     | The numeric formatting precision (default is 2)    |
| datetime   | [DataTableDatetimeFormat](#enum-datatabledatetimeformat) | optional                   | The datetime format                                |
| trim       | bool                                                     | optional                   | If true, trim formatted values (default is true)   |

### enum DataTableDatetimeFormat

A datetime format

| Value | Description               |
|-------|---------------------------|
| year  | ISO datetime year format  |
| month | ISO datetime month format |
| day   | ISO datetime day format   |

### enum DataTableFieldAlignment

A field alignment

| Value  |
|--------|
| left   |
| right  |
| center |

### struct DataTableFieldFormat

A data table field formatting model

| Name     | Type                                                     | Attributes | Description                                  |
|----------|----------------------------------------------------------|------------|----------------------------------------------|
| align    | [DataTableFieldAlignment](#enum-datatablefieldalignment) | optional   | The field alignment                          |
| nowrap   | bool                                                     | optional   | If true, don't wrap text                     |
| markdown | bool                                                     | optional   | If true, format the field as Markdown        |
| header   | string                                                   | optional   | The field header (default is the field name) |

---

## \<diff.bare\>

### struct Difference

A difference

| Name  | Type                                   | Description                       |
|-------|----------------------------------------|-----------------------------------|
| type  | [DifferenceType](#enum-differencetype) | The type of difference            |
| lines | string []                              | The text lines of this difference |

### enum DifferenceType

A difference type

| Value     | Description             |
|-----------|-------------------------|
| Identical | The lines are identical |
| Add       | The lines were added    |
| Remove    | The lines were removed  |

### typedef Differences

A list of text line differences

| Type                                |
|-------------------------------------|
| [Difference](#struct-difference) [] |

---

## \<pager.bare\>

### struct Pager

A pager application model

| Name  | Type                              | Attributes     | Description             |
|-------|-----------------------------------|----------------|-------------------------|
| pages | [PagerPage](#struct-pagerpage) [] | len(array) > 0 | The application's pages |

### struct PagerPage

A page model

| Name   | Type                                  | Attributes | Description                 |
|--------|---------------------------------------|------------|-----------------------------|
| name   | string                                |            | The page name               |
| hidden | bool                                  | optional   | If true, the page is hidden |
| type   | [PagerPageType](#union-pagerpagetype) |            | The page type               |

### struct PagerPageFunction

A page function

| Name     | Type   | Attributes | Description       |
|----------|--------|------------|-------------------|
| function | any    |            | The page function |
| title    | string | optional   | The page title    |

### struct PagerPageLink

A page link

| Name | Type   | Description  |
|------|--------|--------------|
| url  | string | The link URL |

### struct PagerPageMarkdown

A Markdown resource page

| Name | Type   | Description               |
|------|--------|---------------------------|
| url  | string | The Markdown resource URL |

### union PagerPageType

The page type

| Name     | Type                                           | Description              |
|----------|------------------------------------------------|--------------------------|
| function | [PagerPageFunction](#struct-pagerpagefunction) | A function page          |
| markdown | [PagerPageMarkdown](#struct-pagerpagemarkdown) | A markdown resource page |
| link     | [PagerPageLink](#struct-pagerpagelink)         | A navigation link        |

---

## Aggregation

### struct Aggregation

A data aggregation specification

| Name       | Type                                                | Attributes                 | Description                     |
|------------|-----------------------------------------------------|----------------------------|---------------------------------|
| categories | string []                                           | optional<br>len(array) > 0 | The aggregation category fields |
| measures   | [AggregationMeasure](#struct-aggregationmeasure) [] | len(array) > 0             | The aggregation measures        |

### enum AggregationFunction

An aggregation function

| Value   | Description                                    |
|---------|------------------------------------------------|
| average | The average of the measure's values            |
| count   | The count of the measure's values              |
| max     | The greatest of the measure's values           |
| min     | The least of the measure's values              |
| stddev  | The standard deviation of the measure's values |
| sum     | The sum of the measure's values                |

### struct AggregationMeasure

An aggregation measure specification

| Name     | Type                                             | Attributes | Description                       |
|----------|--------------------------------------------------|------------|-----------------------------------|
| field    | string                                           |            | The aggregation measure field     |
| function | [AggregationFunction](#enum-aggregationfunction) |            | The aggregation function          |
| name     | string                                           | optional   | The aggregated-measure field name |

---

## Line Chart

### struct LineChart

A line chart model

| Name       | Type                                                          | Attributes                 | Description                                     |
|------------|---------------------------------------------------------------|----------------------------|-------------------------------------------------|
| title      | string                                                        | optional                   | The chart title                                 |
| width      | int                                                           | optional                   | The chart width                                 |
| height     | int                                                           | optional                   | The chart height                                |
| precision  | int                                                           | optional<br>value >= 0     | The numeric formatting precision (default is 2) |
| datetime   | [LineChartDatetimeFormat](#enum-linechartdatetimeformat)      | optional                   | The datetime format                             |
| x          | string                                                        |                            | The line chart's X-axis field                   |
| y          | string []                                                     | len(array) > 0             | The line chart's Y-axis fields                  |
| color      | string                                                        | optional                   | The color encoding field                        |
| colorOrder | string []                                                     | optional<br>len(array) > 0 | The color encoding value order                  |
| xTicks     | [LineChartAxisTicks](#struct-linechartaxisticks)              | optional                   | The X-axis tick marks                           |
| yTicks     | [LineChartAxisTicks](#struct-linechartaxisticks)              | optional                   | The Y-axis tick marks                           |
| xLines     | [LineChartAxisAnnotation](#struct-linechartaxisannotation) [] | optional<br>len(array) > 0 | The X-axis annotations                          |
| yLines     | [LineChartAxisAnnotation](#struct-linechartaxisannotation) [] | optional<br>len(array) > 0 | The Y-axis annotations                          |

### struct LineChartAxisAnnotation

An axis annotation

| Name  | Type   | Attributes | Description          |
|-------|--------|------------|----------------------|
| value | any    |            | The axis value       |
| label | string | optional   | The annotation label |

### struct LineChartAxisTicks

The axis tick mark model

| Name  | Type | Attributes             | Description                                                          |
|-------|------|------------------------|----------------------------------------------------------------------|
| count | int  | optional<br>value >= 0 | The count of evenly-spaced tick marks. The default is 3.             |
| start | any  | optional               | The value of the first tick mark. Default is the minimum axis value. |
| end   | any  | optional               | The value of the last tick mark. Default is the maximum axis value.  |
| skip  | int  | optional<br>value > 0  | The number of tick mark labels to skip after a rendered label        |

### enum LineChartDatetimeFormat

A datetime format

| Value | Description               |
|-------|---------------------------|
| year  | ISO datetime year format  |
| month | ISO datetime month format |
| day   | ISO datetime day format   |

---

## RegexMatch

### struct RegexMatch

A regex match model

| Name   | Type      | Attributes | Description                                                                                                      |
|--------|-----------|------------|------------------------------------------------------------------------------------------------------------------|
| index  | int       | value >= 0 | The zero-based index of the match in the input string                                                            |
| input  | string    |            | The input string                                                                                                 |
| groups | string {} |            | The matched groups. The "0" key is the full match text. Ordered (non-named) groups use keys "1", "2", and so on. |

---

## SystemFetch

### struct SystemFetchRequest

A fetch request model

| Name    | Type      | Attributes | Description         |
|---------|-----------|------------|---------------------|
| url     | string    |            | The resource URL    |
| body    | string    | optional   | The request body    |
| headers | string {} | optional   | The request headers |
