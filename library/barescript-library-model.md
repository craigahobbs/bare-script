# The BareScript Library Models

## Table of Contents

- [args.bare](#var.vPublish=true&var.vSingle=true&args-bare)
- [baredoc.bare](#var.vPublish=true&var.vSingle=true&baredoc-bare)
- [data.bare](#var.vPublish=true&var.vSingle=true&data-bare)
- [dataLineChart.bare](#var.vPublish=true&var.vSingle=true&datalinechart-bare)
- [dataTable.bare](#var.vPublish=true&var.vSingle=true&datatable-bare)
- [diff.bare](#var.vPublish=true&var.vSingle=true&diff-bare)
- [markdown.bare](#var.vPublish=true&var.vSingle=true&markdown-bare)
- [markdownElements.bare](#var.vPublish=true&var.vSingle=true&markdownelements-bare)
- [markdownHighlight.bare](#var.vPublish=true&var.vSingle=true&markdownhighlight-bare)
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

## baredoc.bare

### struct BaredocConfig

The baredoc documentation application configuration

| Name     | Type                                        | Attributes | Description                                          |
|----------|---------------------------------------------|------------|------------------------------------------------------|
| title    | string                                      |            | The documentation title                              |
| content  | string                                      | optional   | The optional top-level Markdown content resource URL |
| sections | [BaredocSection](#struct-baredocsection) [] |            | The documentation sections                           |

### struct BaredocFunction

A library function

| Name   | Type                                                          | Attributes | Description                                        |
|--------|---------------------------------------------------------------|------------|----------------------------------------------------|
| name   | string                                                        |            | The function name                                  |
| group  | string                                                        |            | The function group (e.g. "Math")                   |
| doc    | string []                                                     |            | The function's documentation Markdown lines        |
| args   | [BaredocFunctionArgument](#struct-baredocfunctionargument) [] | optional   | The function arguments                             |
| return | string []                                                     | optional   | The function return's documentation Markdown lines |
| ignore | bool                                                          | optional   | If true, ignore the function                       |

### struct BaredocFunctionArgument

A function argument

| Name | Type      | Description                                 |
|------|-----------|---------------------------------------------|
| name | string    | The argument name                           |
| doc  | string [] | The argument's documentation Markdown lines |

### struct BaredocGroup

A library function group's content and description (the group is defined by the library functions)

| Name        | Type   | Attributes | Description                                                                    |
|-------------|--------|------------|--------------------------------------------------------------------------------|
| name        | string |            | The group name (matches a library function group)                              |
| content     | string | optional   | The optional group Markdown content resource URL (defaults to the description) |
| description | string | optional   | The optional brief group description Markdown for the index page               |

### struct BaredocLibrary

A library documentation model

| Name      | Type                                          | Description           |
|-----------|-----------------------------------------------|-----------------------|
| functions | [BaredocFunction](#struct-baredocfunction) [] | The library functions |

### struct BaredocSection

A documentation section

| Name   | Type                                    | Attributes | Description                                                                                    |
|--------|-----------------------------------------|------------|------------------------------------------------------------------------------------------------|
| title  | string                                  |            | The section title                                                                              |
| url    | string                                  |            | The section's library documentation JSON resource URL                                          |
| groups | [BaredocGroup](#struct-baredocgroup) [] | optional   | Optional content and descriptions for the groups (groups are defined by the library functions) |

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

## markdown.bare

### struct Markdown

Markdown document

| Name  | Type                                   | Description                   |
|-------|----------------------------------------|-------------------------------|
| parts | [MarkdownPart](#union-markdownpart) [] | The markdown document's parts |

### struct MarkdownBlockQuote

Block quote markdown part

| Name  | Type                                   | Description             |
|-------|----------------------------------------|-------------------------|
| parts | [MarkdownPart](#union-markdownpart) [] | The block quote's parts |

### enum MarkdownCharacterStyle

Character style enum

| Value         |
|---------------|
| bold          |
| italic        |
| strikethrough |

### struct MarkdownCodeBlock

Code block markdown part

| Name            | Type      | Attributes                 | Description                           |
|-----------------|-----------|----------------------------|---------------------------------------|
| language        | string    | optional<br>len(value) > 0 | The code block's language             |
| lines           | string [] |                            | The code block's text lines           |
| startLineNumber | int       | optional<br>value >= 1     | The code block's starting line number |

### struct MarkdownImageSpan

Image span

| Name  | Type   | Attributes                 | Description                |
|-------|--------|----------------------------|----------------------------|
| src   | string |                            | The image URL              |
| title | string | optional<br>len(value) > 0 | The image's title          |
| alt   | string |                            | The image's alternate text |

### struct MarkdownLinkRef

Link reference span

| Name  | Type                                   | Description                                                               |
|-------|----------------------------------------|---------------------------------------------------------------------------|
| spans | [MarkdownSpan](#union-markdownspan) [] | The link reference link span or its text's spans (if reference not found) |

### struct MarkdownLinkSpan

Link span

| Name  | Type                                   | Attributes                 | Description         |
|-------|----------------------------------------|----------------------------|---------------------|
| href  | string                                 |                            | The link's URL      |
| title | string                                 | optional<br>len(value) > 0 | The image's title   |
| spans | [MarkdownSpan](#union-markdownspan) [] |                            | The contained spans |

### struct MarkdownList

List markdown part

| Name  | Type                                            | Attributes             | Description                                      |
|-------|-------------------------------------------------|------------------------|--------------------------------------------------|
| start | int                                             | optional<br>value >= 0 | The list is numbered and this is starting number |
| items | [MarkdownListItem](#struct-markdownlistitem) [] | len(array) > 0         | The list's items                                 |

### struct MarkdownListItem

List item

| Name  | Type                                   | Description      |
|-------|----------------------------------------|------------------|
| parts | [MarkdownPart](#union-markdownpart) [] | The list's parts |

### struct MarkdownParagraph

Paragraph markdown part

| Name  | Type                                                   | Attributes | Description              |
|-------|--------------------------------------------------------|------------|--------------------------|
| style | [MarkdownParagraphStyle](#enum-markdownparagraphstyle) | optional   | The paragraph style      |
| spans | [MarkdownSpan](#union-markdownspan) []                 |            | The paragraph span array |

### enum MarkdownParagraphStyle

Paragraph style enum

| Value |
|-------|
| h1    |
| h2    |
| h3    |
| h4    |
| h5    |
| h6    |

### union MarkdownPart

Markdown document part

| Name      | Type                                             | Attributes | Description                          |
|-----------|--------------------------------------------------|------------|--------------------------------------|
| paragraph | [MarkdownParagraph](#struct-markdownparagraph)   |            | A paragraph                          |
| hr        | int                                              | value == 1 | A horizontal rule (value is ignored) |
| list      | [MarkdownList](#struct-markdownlist)             |            | A list                               |
| quote     | [MarkdownBlockQuote](#struct-markdownblockquote) |            | A block quote                        |
| codeBlock | [MarkdownCodeBlock](#struct-markdowncodeblock)   |            | A code block                         |
| table     | [MarkdownTable](#struct-markdowntable)           |            | A table                              |

### union MarkdownSpan

Paragraph span

| Name    | Type                                           | Attributes     | Description                   |
|---------|------------------------------------------------|----------------|-------------------------------|
| text    | string                                         | len(value) > 0 | Text span                     |
| br      | int                                            | value == 1     | Line break (value is ignored) |
| style   | [MarkdownStyleSpan](#struct-markdownstylespan) |                | Style span                    |
| link    | [MarkdownLinkSpan](#struct-markdownlinkspan)   |                | Link span                     |
| image   | [MarkdownImageSpan](#struct-markdownimagespan) |                | Image span                    |
| linkRef | [MarkdownLinkRef](#struct-markdownlinkref)     |                | Link reference span           |
| code    | string                                         | len(value) > 0 | Code span                     |

### struct MarkdownStyleSpan

Style span

| Name  | Type                                                   | Description                |
|-------|--------------------------------------------------------|----------------------------|
| style | [MarkdownCharacterStyle](#enum-markdowncharacterstyle) | The span's character style |
| spans | [MarkdownSpan](#union-markdownspan) []                 | The contained spans        |

### struct MarkdownTable

Table markdown part

| Name    | Type                                                      | Attributes                 | Description                    |
|---------|-----------------------------------------------------------|----------------------------|--------------------------------|
| headers | [MarkdownTableRow](#typedef-markdowntablerow)             |                            | The table header cell array    |
| aligns  | [MarkdownTableAlignment](#enum-markdowntablealignment) [] | len(array) > 0             | The table cell alignment array |
| rows    | [MarkdownTableRow](#typedef-markdowntablerow) []          | optional<br>len(array) > 0 | The table data                 |

### enum MarkdownTableAlignment

Table cell alignment

| Value  |
|--------|
| left   |
| right  |
| center |

### typedef MarkdownTableCell

A table cell

| Type                                   |
|----------------------------------------|
| [MarkdownSpan](#union-markdownspan) [] |

### typedef MarkdownTableRow

A table row

| Type                                               | Attributes     |
|----------------------------------------------------|----------------|
| [MarkdownTableCell](#typedef-markdowntablecell) [] | len(array) > 0 |

---

## markdownElements.bare

### struct MarkdownElementsCodeBlock

A Markdown code block

| Name            | Type      | Attributes | Description                                                     |
|-----------------|-----------|------------|-----------------------------------------------------------------|
| language        | string    | optional   | The code block language                                         |
| lines           | string [] |            | The code block lines                                            |
| startLineNumber | float     | optional   | Optional (default is 1). The code block's starting line number. |

### struct MarkdownElementsOptions

The markdownElements options object

| Name          | Type                                                              | Description                                                                                                                                                                                                                                                                                                                                                                                   |
|---------------|-------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| codeBlocks    | [MarkdownElementsCodeBlock](#struct-markdownelementscodeblock) {} | Optional (default is null). The map of code block language to render function. A code block render function takes two arguments: [codeBlock](#struct-markdownelementscodeblock), the code block model, and [options](#struct-markdownelementsoptions), the markdownElements options object. It returns the code block's [element model](https://github.com/craigahobbs/element-model#readme). |
| copyLinks     | bool                                                              | Optional (default is false). If true, generate copy links.                                                                                                                                                                                                                                                                                                                                    |
| urlFn         | any                                                               | Optional (default is null). The URL modifier function. A URL modifier function takes a single string argument `url`, and returns the modified URL string.                                                                                                                                                                                                                                     |
| headerIds     | bool                                                              | Optional (default is false). If true, generate header IDs.                                                                                                                                                                                                                                                                                                                                    |
| usedHeaderIds | any {}                                                            | The set of used header IDs                                                                                                                                                                                                                                                                                                                                                                    |

---

## markdownHighlight.bare

### struct MarkdownHighlight

Code syntax-highlighting model

| Name         | Type      | Attributes                 | Description                                                       |
|--------------|-----------|----------------------------|-------------------------------------------------------------------|
| names        | string [] | len(array) > 0             | The language names/aliases. The first name is the preferred name. |
| builtin      | string [] | optional<br>len(array) > 0 | Built-in regular expressions                                      |
| comment      | string [] | optional<br>len(array) > 0 | Comment regular expressions                                       |
| keyword      | string [] | optional<br>len(array) > 0 | Keyword regular expressions                                       |
| literal      | string [] | optional<br>len(array) > 0 | Literal regular expressions                                       |
| preprocessor | string [] | optional<br>len(array) > 0 | Preprocessor regular expressions                                  |
| string       | string [] | optional<br>len(array) > 0 | String regular expressions                                        |
| tag          | string [] | optional<br>len(array) > 0 | Tag regular expressions                                           |

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
