# The BareScript Library Models

## Table of Contents

- [args.bare](#var.vPublish=true&var.vSingle=true&args-bare)
- [data.bare](#var.vPublish=true&var.vSingle=true&data-bare)
- [dataLineChart.bare](#var.vPublish=true&var.vSingle=true&datalinechart-bare)
- [dataTable.bare](#var.vPublish=true&var.vSingle=true&datatable-bare)
- [diff.bare](#var.vPublish=true&var.vSingle=true&diff-bare)
- [pager.bare](#var.vPublish=true&var.vSingle=true&pager-bare)
- [regex](#var.vPublish=true&var.vSingle=true&regex)
- [system](#var.vPublish=true&var.vSingle=true&system)

---

## args.bare

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

## data.bare

### struct DataAggregation

The data aggregation model

| Name       | Type                                                        | Attributes                 | Description                     |
|------------|-------------------------------------------------------------|----------------------------|---------------------------------|
| categories | string []                                                   | optional<br>len(array) > 0 | The aggregation category fields |
| measures   | [DataAggregationMeasure](#struct-dataaggregationmeasure) [] | len(array) > 0             | The aggregation measures        |

### enum DataAggregationFunction

The aggregation function enumeration

| Value   | Description                                  |
|---------|----------------------------------------------|
| average | The average of the measure values            |
| count   | The count of the measure values              |
| max     | The greatest of the measure values           |
| min     | The least of the measure values              |
| stddev  | The standard deviation of the measure values |
| sum     | The sum of the measure values                |

### struct DataAggregationMeasure

The aggregation measure model

| Name     | Type                                                     | Attributes | Description                       |
|----------|----------------------------------------------------------|------------|-----------------------------------|
| field    | string                                                   |            | The aggregation measure field     |
| function | [DataAggregationFunction](#enum-dataaggregationfunction) |            | The aggregation function          |
| name     | string                                                   | optional   | The aggregated-measure field name |

---

## dataLineChart.bare

### struct DataLineChart

A line chart model

| Name       | Type                                                                  | Attributes                 | Description                                     |
|------------|-----------------------------------------------------------------------|----------------------------|-------------------------------------------------|
| title      | string                                                                | optional                   | The chart title                                 |
| width      | int                                                                   | optional                   | The chart width                                 |
| height     | int                                                                   | optional                   | The chart height                                |
| precision  | int                                                                   | optional<br>value >= 0     | The numeric formatting precision (default is 2) |
| datetime   | [DataLineChartDatetimeFormat](#enum-datalinechartdatetimeformat)      | optional                   | The datetime format                             |
| x          | string                                                                |                            | The line chart's X-axis field                   |
| y          | string []                                                             | len(array) > 0             | The line chart's Y-axis fields                  |
| color      | string                                                                | optional                   | The color encoding field                        |
| colorOrder | string []                                                             | optional<br>len(array) > 0 | The color encoding value order                  |
| xTicks     | [DataLineChartAxisTicks](#struct-datalinechartaxisticks)              | optional                   | The X-axis tick marks                           |
| yTicks     | [DataLineChartAxisTicks](#struct-datalinechartaxisticks)              | optional                   | The Y-axis tick marks                           |
| xLines     | [DataLineChartAxisAnnotation](#struct-datalinechartaxisannotation) [] | optional<br>len(array) > 0 | The X-axis annotations                          |
| yLines     | [DataLineChartAxisAnnotation](#struct-datalinechartaxisannotation) [] | optional<br>len(array) > 0 | The Y-axis annotations                          |

### struct DataLineChartAxisAnnotation

An axis annotation

| Name  | Type   | Attributes | Description          |
|-------|--------|------------|----------------------|
| value | any    |            | The axis value       |
| label | string | optional   | The annotation label |

### struct DataLineChartAxisTicks

The axis tick mark model

| Name  | Type | Attributes             | Description                                                          |
|-------|------|------------------------|----------------------------------------------------------------------|
| count | int  | optional<br>value >= 0 | The count of evenly-spaced tick marks. The default is 3.             |
| start | any  | optional               | The value of the first tick mark. Default is the minimum axis value. |
| end   | any  | optional               | The value of the last tick mark. Default is the maximum axis value.  |
| skip  | int  | optional<br>value > 0  | The number of tick mark labels to skip after a rendered label        |

### enum DataLineChartDatetimeFormat

A datetime format

| Value | Description               |
|-------|---------------------------|
| year  | ISO datetime year format  |
| month | ISO datetime month format |
| day   | ISO datetime day format   |

---

## dataTable.bare

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

## diff.bare

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

## pager.bare

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

## regex

### struct RegexMatch

A regex match model

| Name   | Type      | Attributes | Description                                                                                                      |
|--------|-----------|------------|------------------------------------------------------------------------------------------------------------------|
| index  | int       | value >= 0 | The zero-based index of the match in the input string                                                            |
| input  | string    |            | The input string                                                                                                 |
| groups | string {} |            | The matched groups. The "0" key is the full match text. Ordered (non-named) groups use keys "1", "2", and so on. |

---

## system

### struct SystemFetchRequest

A fetch request model

| Name    | Type      | Attributes | Description         |
|---------|-----------|------------|---------------------|
| url     | string    |            | The resource URL    |
| body    | string    | optional   | The request body    |
| headers | string {} | optional   | The request headers |
