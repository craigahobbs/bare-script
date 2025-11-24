# The BareScript Library

Welcome to the [BareScript](https://craigahobbs.github.io/bare-script/language/) library
documentation.

**Note:** Section names ending with ".bare" are include libraries. All other sections are builtin
globals.


## Table of Contents

- [Markdown](#var.vPublish=true&var.vSingle=true&markdown)
- [args.bare](#var.vPublish=true&var.vSingle=true&args-bare)
- [array](#var.vPublish=true&var.vSingle=true&array)
- [baredoc.bare](#var.vPublish=true&var.vSingle=true&baredoc-bare)
- [coverage](#var.vPublish=true&var.vSingle=true&coverage)
- [data](#var.vPublish=true&var.vSingle=true&data)
- [dataTable.bare](#var.vPublish=true&var.vSingle=true&datatable-bare)
- [datetime](#var.vPublish=true&var.vSingle=true&datetime)
- [diff.bare](#var.vPublish=true&var.vSingle=true&diff-bare)
- [forms.bare](#var.vPublish=true&var.vSingle=true&forms-bare)
- [json](#var.vPublish=true&var.vSingle=true&json)
- [markdownUp.bare](#var.vPublish=true&var.vSingle=true&markdownup-bare)
- [markdownUp.bare: data](#var.vPublish=true&var.vSingle=true&markdownup-bare-data)
- [markdownUp.bare: document](#var.vPublish=true&var.vSingle=true&markdownup-bare-document)
- [markdownUp.bare: draw](#var.vPublish=true&var.vSingle=true&markdownup-bare-draw)
- [markdownUp.bare: elementModel](#var.vPublish=true&var.vSingle=true&markdownup-bare-elementmodel)
- [markdownUp.bare: localStorage](#var.vPublish=true&var.vSingle=true&markdownup-bare-localstorage)
- [markdownUp.bare: markdown](#var.vPublish=true&var.vSingle=true&markdownup-bare-markdown)
- [markdownUp.bare: sessionStorage](#var.vPublish=true&var.vSingle=true&markdownup-bare-sessionstorage)
- [markdownUp.bare: url](#var.vPublish=true&var.vSingle=true&markdownup-bare-url)
- [markdownUp.bare: window](#var.vPublish=true&var.vSingle=true&markdownup-bare-window)
- [math](#var.vPublish=true&var.vSingle=true&math)
- [number](#var.vPublish=true&var.vSingle=true&number)
- [object](#var.vPublish=true&var.vSingle=true&object)
- [pager.bare](#var.vPublish=true&var.vSingle=true&pager-bare)
- [regex](#var.vPublish=true&var.vSingle=true&regex)
- [schema](#var.vPublish=true&var.vSingle=true&schema)
- [schemaDoc.bare](#var.vPublish=true&var.vSingle=true&schemadoc-bare)
- [string](#var.vPublish=true&var.vSingle=true&string)
- [system](#var.vPublish=true&var.vSingle=true&system)
- [unittest.bare](#var.vPublish=true&var.vSingle=true&unittest-bare)
- [unittestMock.bare](#var.vPublish=true&var.vSingle=true&unittestmock-bare)
- [url](#var.vPublish=true&var.vSingle=true&url)

---

## Markdown

### Function Index

- [markdownElements](#var.vPublish=true&var.vSingle=true&markdownelements)

---

### markdownElements

Generate an element model from a Markdown model

#### Arguments

**markdownModel -**
The [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')

**generic -**
Optional (default is false). If true, render markdown elements in a generic context.

#### Returns

The rendered Markdown [element model](https://github.com/craigahobbs/element-model#readme)

---

## args.bare

The "args.bare" include library contains functions for parsing/validating a MarkdownUp application's
URL arguments, and functions for creating MarkdownUp application URLs and links.

Consider the following example of an application that sums numbers. First, include the "args.bare"
library and define an [arguments model] with three floating point number URL arguments: "value1",
"value2" and "value3".

~~~ bare-script
include <args.bare>

arguments = [ \
    {'name': 'value1', 'type': 'float', 'default': 0}, \
    {'name': 'value2', 'type': 'float', 'default': 0}, \
    {'name': 'value3', 'type': 'float', 'default': 0} \
]
~~~

Next, parse the arguments with the [argsParse] function.

~~~ bare-script
args = argsParse(arguments)
~~~

You access arguments by name from the "args" object.

~~~ bare-script
value1 = objectGet(args, 'value1')
value2 = objectGet(args, 'value2')
value3 = objectGet(args, 'value3')
sum = value1 + value2 + value3
markdownPrint('The sum is: ' + sum)
~~~

You can create links to the application using the [argsLink] function.

~~~ bare-script
markdownPrint( \
    '', argsLink(arguments, 'Value1 Less', {'value1': value1 - 1}), \
    '', argsLink(arguments, 'Value1 More', {'value1': value1 + 1}), \
    '', argsLink(arguments, 'Value2 Less', {'value2': value2 - 1}), \
    '', argsLink(arguments, 'Value2 More', {'value2': value2 + 1}), \
    '', argsLink(arguments, 'Value3 Less', {'value3': value3 - 1}), \
    '', argsLink(arguments, 'Value3 More', {'value3': value3 + 1}) \
)
~~~

By default, any argument previously supplied to the application is included in the link (unless
overridden by null). All arguments are cleared by setting the [argsLink] "explicit" argument to
true. Arguments may also be marked "explicit" individually in the [arguments model].

~~~ bare-script
markdownPrint('', argsLink(arguments, 'Reset', null, true))
~~~


[argsLink]: include.html#var.vGroup='args.bare'&argslink
[argsParse]: include.html#var.vGroup='args.bare'&argsparse
[arguments model]: includeModel.html#var.vName='ArgsArguments'


### Function Index

- [argsHelp](#var.vPublish=true&var.vSingle=true&argshelp)
- [argsLink](#var.vPublish=true&var.vSingle=true&argslink)
- [argsParse](#var.vPublish=true&var.vSingle=true&argsparse)
- [argsURL](#var.vPublish=true&var.vSingle=true&argsurl)
- [argsValidate](#var.vPublish=true&var.vSingle=true&argsvalidate)

---

### argsHelp

Generate the [arguments model's](model.html#var.vName='ArgsArguments') help content

#### Arguments

**arguments -**
The [arguments model](model.html#var.vName='ArgsArguments')

#### Returns

The array of help Markdown line strings

---

### argsLink

Create a Markdown link text to a MarkdownUp application URL

#### Arguments

**arguments -**
The [arguments model](model.html#var.vName='ArgsArguments')

**text -**
The link text

**args -**
Optional (default is null). The arguments object.

**explicit -**
Optional (default is false). If true, arguments are only included in the URL if they are in the arguments object.

**headerText -**
Optional (default is null). If non-null, the URL's header text.
The special "_top" header ID scrolls to the top of the page.

**url -**
Optional (default is null). If non-null, the MarkdownUp URL hash parameter.

#### Returns

The Markdown link text

---

### argsParse

Parse an [arguments model](model.html#var.vName='ArgsArguments').
Argument globals are validated and added to the arguments object using the argument name.

#### Arguments

**arguments -**
The [arguments model](model.html#var.vName='ArgsArguments')

#### Returns

The arguments object

---

### argsURL

Create a MarkdownUp application URL

#### Arguments

**arguments -**
The [arguments model](model.html#var.vName='ArgsArguments')

**args -**
Optional (default is null). The arguments object. Null argument values are excluded from the URL.

**explicit -**
Optional (default is false). If true, arguments are only included in the URL if they are in the arguments object.

**headerText -**
Optional (default is null). If non-null, the URL's header text.
The special "_top" header ID scrolls to the top of the page.

**url -**
Optional (default is null). If non-null, the MarkdownUp URL hash parameter.

#### Returns

The MarkdownUp application URL

---

### argsValidate

Validate an arguments model

#### Arguments

**arguments -**
The [arguments model](model.html#var.vName='ArgsArguments')

#### Returns

The validated [arguments model](model.html#var.vName='ArgsArguments') or null if validation fails

---

## array

Array functions provide operations for creating, manipulating, and querying arrays. Arrays are
ordered collections of values that can be created using array literal syntax (e.g., `[1, 2, 3]`) or
with the [arrayNew](#var.vGroup='array'&arraynew) function.

To access and modify array elements, use the [arrayGet](#var.vGroup='array'&arrayget) and
[arraySet](#var.vGroup='array'&arrayset) functions:

~~~ bare-script
values = [1, 2, 3, 4, 5]
firstValue = arrayGet(values, 0)
arraySet(values, 0, 10)
~~~

Arrays can be extended, sliced, and manipulated in various ways:

~~~ bare-script
# Add elements to the end
arrayPush(values, 6, 7, 8)

# Remove and return the last element
lastValue = arrayPop(values)

# Create a copy of part of an array
subset = arraySlice(values, 1, 4)

# Join array elements into a string
text = arrayJoin(values, ', ')
~~~

Arrays can also be sorted, searched, and flattened:

~~~ bare-script
# Sort an array
arraySorted = arraySort([3, 1, 4, 1, 5, 9])

# Find an element
index = arrayIndexOf(values, 3)

# Flatten nested arrays
nested = [[1, 2], [3, [4, 5]]]
flat = arrayFlat(nested, 2)
~~~


### Function Index

- [arrayCopy](#var.vPublish=true&var.vSingle=true&arraycopy)
- [arrayDelete](#var.vPublish=true&var.vSingle=true&arraydelete)
- [arrayExtend](#var.vPublish=true&var.vSingle=true&arrayextend)
- [arrayFlat](#var.vPublish=true&var.vSingle=true&arrayflat)
- [arrayGet](#var.vPublish=true&var.vSingle=true&arrayget)
- [arrayIndexOf](#var.vPublish=true&var.vSingle=true&arrayindexof)
- [arrayJoin](#var.vPublish=true&var.vSingle=true&arrayjoin)
- [arrayLastIndexOf](#var.vPublish=true&var.vSingle=true&arraylastindexof)
- [arrayLength](#var.vPublish=true&var.vSingle=true&arraylength)
- [arrayNew](#var.vPublish=true&var.vSingle=true&arraynew)
- [arrayNewSize](#var.vPublish=true&var.vSingle=true&arraynewsize)
- [arrayPop](#var.vPublish=true&var.vSingle=true&arraypop)
- [arrayPush](#var.vPublish=true&var.vSingle=true&arraypush)
- [arraySet](#var.vPublish=true&var.vSingle=true&arrayset)
- [arrayShift](#var.vPublish=true&var.vSingle=true&arrayshift)
- [arraySlice](#var.vPublish=true&var.vSingle=true&arrayslice)
- [arraySort](#var.vPublish=true&var.vSingle=true&arraysort)

---

### arrayCopy

Create a copy of an array

#### Arguments

**array -**
The array to copy

#### Returns

The array copy

---

### arrayDelete

Delete an array element

#### Arguments

**array -**
The array

**index -**
The index of the element to delete

#### Returns

Nothing

---

### arrayExtend

Extend one array with another

#### Arguments

**array -**
The array to extend

**array2 -**
The array to extend with

#### Returns

The extended array

---

### arrayFlat

Flat an array hierarchy

#### Arguments

**array -**
The array to flat

**depth -**
The maximum depth of the array hierarchy

#### Returns

The flated array

---

### arrayGet

Get an array element

#### Arguments

**array -**
The array

**index -**
The array element's index

#### Returns

The array element

---

### arrayIndexOf

Find the index of a value in an array

#### Arguments

**array -**
The array

**value -**
The value to find in the array, or a match function, f(value) -> bool

**index -**
Optional (default is 0). The index at which to start the search.

#### Returns

The first index of the value in the array; -1 if not found.

---

### arrayJoin

Join an array with a separator string

#### Arguments

**array -**
The array

**separator -**
The separator string

#### Returns

The joined string

---

### arrayLastIndexOf

Find the last index of a value in an array

#### Arguments

**array -**
The array

**value -**
The value to find in the array, or a match function, f(value) -> bool

**index -**
Optional (default is the end of the array). The index at which to start the search.

#### Returns

The last index of the value in the array; -1 if not found.

---

### arrayLength

Get the length of an array

#### Arguments

**array -**
The array

#### Returns

The array's length; zero if not an array

---

### arrayNew

Create a new array

#### Arguments

**values... -**
The new array's values

#### Returns

The new array

---

### arrayNewSize

Create a new array of a specific size

#### Arguments

**size -**
Optional (default is 0). The new array's size.

**value -**
Optional (default is 0). The value with which to fill the new array.

#### Returns

The new array

---

### arrayPop

Remove the last element of the array and return it

#### Arguments

**array -**
The array

#### Returns

The last element of the array; null if the array is empty.

---

### arrayPush

Add one or more values to the end of the array

#### Arguments

**array -**
The array

**values... -**
The values to add to the end of the array

#### Returns

The array

---

### arraySet

Set an array element value

#### Arguments

**array -**
The array

**index -**
The index of the element to set

**value -**
The value to set

#### Returns

The value

---

### arrayShift

Remove the first element of the array and return it

#### Arguments

**array -**
The array

#### Returns

The first element of the array; null if the array is empty.

---

### arraySlice

Copy a portion of an array

#### Arguments

**array -**
The array

**start -**
Optional (default is 0). The start index of the slice.

**end -**
Optional (default is the end of the array). The end index of the slice.

#### Returns

The new array slice

---

### arraySort

Sort an array

#### Arguments

**array -**
The array

**compareFn -**
Optional (default is null). The comparison function.

#### Returns

The sorted array

---

## baredoc.bare

The "baredoc.bare" include library provides the main entry point for creating BareScript library
documentation applications. This library is used to generate documentation websites like the
[BareScript Library documentation](https://craigahobbs.github.io/bare-script/library/).

To create a documentation application, include the library and call the
[baredocMain](#var.vGroup='baredoc.bare'&baredoc) function with your library's JSON resource
URL:

~~~ bare-script
include <baredoc.bare>

baredocMain( \
    'my-library.json', \
    'My Library' \
)
~~~

The library JSON resource should contain function and type documentation in the format expected by
the documentation renderer. You can also provide optional menu links and group content URLs:

~~~ bare-script
menuLinks = [ \
    ['Home', 'index.html'], \
    ['GitHub', 'https://github.com/example/my-library'] \
]

groupURLs = { \
    '': 'intro.md', \
    'myGroup': 'group-content.md' \
}

baredocMain( \
    'my-library.json', \
    'My Library', \
    menuLinks, \
    groupURLs \
)
~~~


### Function Index

- [baredocMain](#var.vPublish=true&var.vSingle=true&baredocmain)

---

### baredocMain

The BareScript library documentation application main entry point

#### Arguments

**url -**
The library documentation JSON resource URL

**title -**
The library title

**menuLinks -**
Optional array of text/URL menu link tuples

**groupURLs -**
Optional map of group name to group Markdown content URL ('' is index) or JSON resource URL

#### Returns

Nothing

---

## coverage

Coverage functions provide runtime code coverage tracking for BareScript scripts. These functions
are primarily used in unit testing to ensure that tests exercise all code paths.

To collect coverage data, start coverage tracking at the beginning of your test suite and stop it
at the end:

~~~ bare-script
include <unittest.bare>

# Start coverage tracking
coverageStart()

# Run your tests
include 'test1.bare'
include 'test2.bare'

# Stop coverage tracking
coverageStop()

# Generate report with minimum coverage requirement
return unittestReport({'coverageMin': 80})
~~~

The coverage system tracks which statements in your scripts have been executed. The coverage data is
stored in a global variable that can be accessed using
[coverageGlobalGet](#var.vGroup='coverage'&coverageglobalget):

~~~ bare-script
coverageData = coverageGlobalGet()
~~~

Coverage data is automatically used by the [unittest.bare](#var.vGroup='unittest.bare') library to
generate coverage reports showing which lines of code were executed during testing.


### Function Index

- [coverageGlobalGet](#var.vPublish=true&var.vSingle=true&coverageglobalget)
- [coverageGlobalName](#var.vPublish=true&var.vSingle=true&coverageglobalname)
- [coverageStart](#var.vPublish=true&var.vSingle=true&coveragestart)
- [coverageStop](#var.vPublish=true&var.vSingle=true&coveragestop)

---

### coverageGlobalGet

Get the coverage global object

#### Arguments

None

#### Returns

The [coverage global object](https://craigahobbs.github.io/bare-script/model/#var.vName='CoverageGlobal')

---

### coverageGlobalName

Get the coverage global variable name

#### Arguments

None

#### Returns

The coverage global variable name

---

### coverageStart

Start coverage data collection

#### Arguments

None

#### Returns

Nothing

---

### coverageStop

Stop coverage data collection

#### Arguments

None

#### Returns

Nothing

---

## data

Data functions provide operations for manipulating and analyzing arrays of data objects (also known
as data tables or datasets). These functions enable filtering, sorting, aggregating, joining, and
transforming tabular data.

A data array is an array of objects where each object represents a row:

~~~ bare-script
data = [ \
    {'name': 'Alice', 'age': 30, 'city': 'New York'}, \
    {'name': 'Bob', 'age': 25, 'city': 'Boston'}, \
    {'name': 'Charlie', 'age': 35, 'city': 'New York'} \
]
~~~

You can filter data using expressions:

~~~ bare-script
# Filter for people over 25 in New York
filtered = dataFilter(data, 'age > 25 && city == "New York"')
~~~

Sort data by one or more fields:

~~~ bare-script
# Sort by city ascending, then age descending
sorted = dataSort(data, [['city', false], ['age', true]])
~~~

Add calculated fields to your data:

~~~ bare-script
# Add a field that combines name and city
dataCalculatedField(data, 'location', 'name + ", " + city')
~~~

Aggregate data to compute summaries:

~~~ bare-script
aggregation = { \
    'categories': ['city'], \
    'measures': [ \
        {'field': 'age', 'function': 'average', 'name': 'avgAge'}, \
        {'field': 'city', 'function': 'count', 'name': 'count'} \
    ] \
}
summary = dataAggregate(data, aggregation)
~~~

Join two data arrays:

~~~ bare-script
cities = [ \
    {'city': 'New York', 'state': 'NY'}, \
    {'city': 'Boston', 'state': 'MA'} \
]
joined = dataJoin(data, cities, 'city')
~~~

Parse CSV text into a data array:

~~~ bare-script
csv = 'name,age,city\nAlice,30,New York\nBob,25,Boston'
data = dataParseCSV(csv)
~~~


### Function Index

- [dataAggregate](#var.vPublish=true&var.vSingle=true&dataaggregate)
- [dataCalculatedField](#var.vPublish=true&var.vSingle=true&datacalculatedfield)
- [dataFilter](#var.vPublish=true&var.vSingle=true&datafilter)
- [dataJoin](#var.vPublish=true&var.vSingle=true&datajoin)
- [dataParseCSV](#var.vPublish=true&var.vSingle=true&dataparsecsv)
- [dataSort](#var.vPublish=true&var.vSingle=true&datasort)
- [dataTop](#var.vPublish=true&var.vSingle=true&datatop)
- [dataValidate](#var.vPublish=true&var.vSingle=true&datavalidate)

---

### dataAggregate

Aggregate a data array

#### Arguments

**data -**
The data array

**aggregation -**
The [aggregation model](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='Aggregation')

#### Returns

The aggregated data array

---

### dataCalculatedField

Add a calculated field to a data array

#### Arguments

**data -**
The data array

**fieldName -**
The calculated field name

**expr -**
The calculated field expression

**variables -**
Optional (default is null). A variables object the expression evaluation.

#### Returns

The updated data array

---

### dataFilter

Filter a data array

#### Arguments

**data -**
The data array

**expr -**
The filter expression

**variables -**
Optional (default is null). A variables object the expression evaluation.

#### Returns

The filtered data array

---

### dataJoin

Join two data arrays

#### Arguments

**leftData -**
The left data array

**rightData -**
The right data array

**joinExpr -**
The [join expression](https://craigahobbs.github.io/bare-script/language/#expressions)

**rightExpr -**
Optional (default is null).
The right [join expression](https://craigahobbs.github.io/bare-script/language/#expressions)

**isLeftJoin -**
Optional (default is false). If true, perform a left join (always include left row).

**variables -**
Optional (default is null). A variables object for join expression evaluation.

#### Returns

The joined data array

---

### dataParseCSV

Parse CSV text to a data array

#### Arguments

**text... -**
The CSV text

#### Returns

The data array

---

### dataSort

Sort a data array

#### Arguments

**data -**
The data array

**sorts -**
The sort field-name/descending-sort tuples

#### Returns

The sorted data array

---

### dataTop

Keep the top rows for each category

#### Arguments

**data -**
The data array

**count -**
The number of rows to keep (default is 1)

**categoryFields -**
Optional (default is null). The category fields.

#### Returns

The top data array

---

### dataValidate

Validate a data array

#### Arguments

**data -**
The data array

**csv -**
Optional (default is false). If true, parse value strings.

#### Returns

The validated data array

---

## dataTable.bare

The "dataTable.bare" include library provides functions for rendering data arrays as formatted
Markdown tables. This is useful for displaying tabular data in MarkdownUp applications.

To render a data table, use the [dataTableMarkdown](#var.vGroup='dataTable.bare'&datatablemarkdown)
function with a data array and an optional data table model:

~~~ bare-script
include <dataTable.bare>

data = [ \
    {'name': 'Alice', 'age': 30, 'city': 'New York'}, \
    {'name': 'Bob', 'age': 25, 'city': 'Boston'}, \
    {'name': 'Charlie', 'age': 35, 'city': 'New York'} \
]

model = { \
    'fields': ['name', 'age', 'city'], \
    'formats': {'age': {'align': 'right'}} \
}

markdownPrint(dataTableMarkdown(data, model))
~~~

The data table model allows you to control which fields are displayed, their order, and how values
are formatted. You can specify field alignment, headers, and other display options.

If no model is provided, all fields are displayed in their natural order with default formatting:

~~~ bare-script
markdownPrint(dataTableMarkdown(data))
~~~


### Function Index

- [dataTableMarkdown](#var.vPublish=true&var.vSingle=true&datatablemarkdown)

---

### dataTableMarkdown

Create the array of Markdown table line strings

#### Arguments

**data -**
The array of row objects

**model -**
The [data table model](model.html#var.vName='DataTable')

#### Returns

The array of Markdown table line strings

---

## datetime

Datetime functions provide operations for creating, manipulating, and formatting date and time
values. Datetime values represent specific moments in time.

Create a new datetime with specific components:

~~~ bare-script
# Create a datetime for January 15, 2024 at 2:30 PM
dt = datetimeNew(2024, 1, 15, 14, 30, 0, 0)
~~~

Get the current date and time:

~~~ bare-script
now = datetimeNow()
today = datetimeToday()  # Today at midnight
~~~

Extract components from a datetime:

~~~ bare-script
year = datetimeYear(dt)
month = datetimeMonth(dt)
day = datetimeDay(dt)
hour = datetimeHour(dt)
minute = datetimeMinute(dt)
second = datetimeSecond(dt)
millisecond = datetimeMillisecond(dt)
~~~

Parse and format datetime strings using ISO 8601 format:

~~~ bare-script
# Parse an ISO datetime string
dt = datetimeISOParse('2024-01-15T14:30:00.000Z')

# Format as ISO datetime string
isoString = datetimeISOFormat(dt, false)

# Format as ISO date string
isoDate = datetimeISOFormat(dt, true)
~~~

Perform datetime arithmetic using addition and subtraction:

~~~ bare-script
# Add 1 hour (3600000 milliseconds)
later = dt + 3600000

# Calculate the difference between two datetimes
difference = dt2 - dt1  # Returns milliseconds
~~~


### Function Index

- [datetimeDay](#var.vPublish=true&var.vSingle=true&datetimeday)
- [datetimeHour](#var.vPublish=true&var.vSingle=true&datetimehour)
- [datetimeISOFormat](#var.vPublish=true&var.vSingle=true&datetimeisoformat)
- [datetimeISOParse](#var.vPublish=true&var.vSingle=true&datetimeisoparse)
- [datetimeMillisecond](#var.vPublish=true&var.vSingle=true&datetimemillisecond)
- [datetimeMinute](#var.vPublish=true&var.vSingle=true&datetimeminute)
- [datetimeMonth](#var.vPublish=true&var.vSingle=true&datetimemonth)
- [datetimeNew](#var.vPublish=true&var.vSingle=true&datetimenew)
- [datetimeNow](#var.vPublish=true&var.vSingle=true&datetimenow)
- [datetimeSecond](#var.vPublish=true&var.vSingle=true&datetimesecond)
- [datetimeToday](#var.vPublish=true&var.vSingle=true&datetimetoday)
- [datetimeYear](#var.vPublish=true&var.vSingle=true&datetimeyear)

---

### datetimeDay

Get the day of the month of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The day of the month

---

### datetimeHour

Get the hour of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The hour

---

### datetimeISOFormat

Format the datetime as an ISO date/time string

#### Arguments

**datetime -**
The datetime

**isDate -**
If true, format the datetime as an ISO date

#### Returns

The formatted datetime string

---

### datetimeISOParse

Parse an ISO date/time string

#### Arguments

**string -**
The ISO date/time string

#### Returns

The datetime, or null if parsing fails

---

### datetimeMillisecond

Get the millisecond of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The millisecond

---

### datetimeMinute

Get the minute of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The minute

---

### datetimeMonth

Get the month (1-12) of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The month

---

### datetimeNew

Create a new datetime

#### Arguments

**year -**
The full year

**month -**
The month (1-12)

**day -**
The day of the month

**hour -**
Optional (default is 0). The hour (0-23).

**minute -**
Optional (default is 0). The minute.

**second -**
Optional (default is 0). The second.

**millisecond -**
Optional (default is 0). The millisecond.

#### Returns

The new datetime

---

### datetimeNow

Get the current datetime

#### Arguments

None

#### Returns

The current datetime

---

### datetimeSecond

Get the second of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The second

---

### datetimeToday

Get today's datetime

#### Arguments

None

#### Returns

Today's datetime

---

### datetimeYear

Get the full year of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The full year

---

## diff.bare

The "diff.bare" include library provides functions for computing line-by-line differences between
two strings or arrays of strings. This is useful for comparing text files, showing changes, or
implementing version control-like functionality.

To compute differences between two strings:

~~~ bare-script
include <diff.bare>

left = 'Line 1\nLine 2\nLine 3'
right = 'Line 1\nLine 2 modified\nLine 3\nLine 4'

differences = diffLines(left, right)
~~~

You can also pass arrays of strings:

~~~ bare-script
leftLines = ['Line 1', 'Line 2', 'Line 3']
rightLines = ['Line 1', 'Line 2 modified', 'Line 3', 'Line 4']

differences = diffLines(leftLines, rightLines)
~~~

The function returns an array of [difference models](model.html#var.vName='Differences') that
describe the changes between the two inputs. Each difference model indicates whether lines were
added, removed, or unchanged, along with the affected line text.

This is particularly useful for displaying side-by-side comparisons or unified diffs in applications
that need to show how content has changed over time.


### Function Index

- [diffLines](#var.vPublish=true&var.vSingle=true&difflines)

---

### diffLines

Compute the line-differences of two strings or arrays of strings

#### Arguments

**left -**
The "left" string or array of strings

**right -**
The "right" string or array of strings

#### Returns

The array of [difference models](model.html#var.vName='Differences')

---

## forms.bare

The "forms.bare" include library provides functions for creating form elements using
[element models](https://github.com/craigahobbs/element-model#readme). These functions simplify the
creation of common form controls for MarkdownUp applications.

Create a text input element:

~~~ bare-script
include <forms.bare>

function myAppMain():
    textInput = formsTextElements('myInput', 'Initial text', 20, myAppOnEnter)
    elementModelRender(textInput)
endfunction

function myAppOnEnter():
    value = documentInputValue('myInput')
    markdownPrint('You entered: ' + value)
endfunction

myAppMain()
~~~

Create a link element:

~~~ bare-script
link = formsLinkElements('Click me', 'other.html')
elementModelRender(link)
~~~

Create a link button element with a click handler:

~~~ bare-script
function myAppMain():
    button = formsLinkButtonElements('Click me', myAppOnClick)
    elementModelRender(button)
endfunction

function myAppOnClick():
    markdownPrint('Button clicked!')
endfunction

myAppMain()
~~~

These helper functions create properly structured element models that can be rendered with the
[elementModelRender](#var.vGroup='markdownUp.bare%3A%20elementModel'&elementmodelrender) function.


### Function Index

- [formsLinkButtonElements](#var.vPublish=true&var.vSingle=true&formslinkbuttonelements)
- [formsLinkElements](#var.vPublish=true&var.vSingle=true&formslinkelements)
- [formsTextElements](#var.vPublish=true&var.vSingle=true&formstextelements)

---

### formsLinkButtonElements

Create a link button [element model](https://github.com/craigahobbs/element-model#readme)

#### Arguments

**text -**
The link button's text

**onClick -**
The link button's click event handler

#### Returns

The link button [element model](https://github.com/craigahobbs/element-model#readme)

---

### formsLinkElements

Create a link [element model](https://github.com/craigahobbs/element-model#readme)

#### Arguments

**text -**
The link's text

**url -**
The link's URL. If null, the link is rendered as text.

#### Returns

The link [element model](https://github.com/craigahobbs/element-model#readme)

---

### formsTextElements

Create a text input [element model](https://github.com/craigahobbs/element-model#readme)

#### Arguments

**id -**
The text input element ID

**text -**
The initial text of the text input element

**size -**
Optional (default is null). The size, in characters, of the text input element

**onEnter -**
Optional (default is null). The text input element on-enter event handler

#### Returns

The text input [element model](https://github.com/craigahobbs/element-model#readme)

---

## json

JSON functions provide operations for parsing and serializing JSON (JavaScript Object Notation)
data. JSON is a lightweight data interchange format that is easy to read and write.

Parse a JSON string to create an object:

~~~ bare-script
jsonText = '{"name": "Alice", "age": 30, "hobbies": ["reading", "hiking"]}'
obj = jsonParse(jsonText)
name = objectGet(obj, 'name')
~~~

Convert an object to a JSON string:

~~~ bare-script
obj = {'name': 'Bob', 'age': 25, 'active': true}
jsonText = jsonStringify(obj)
~~~

Format JSON with indentation for readability:

~~~ bare-script
# Indent with 2 spaces
prettyJson = jsonStringify(obj, 2)
~~~


### Function Index

- [jsonParse](#var.vPublish=true&var.vSingle=true&jsonparse)
- [jsonStringify](#var.vPublish=true&var.vSingle=true&jsonstringify)

---

### jsonParse

Convert a JSON string to an object

#### Arguments

**string -**
The JSON string

#### Returns

The object

---

### jsonStringify

Convert an object to a JSON string

#### Arguments

**value -**
The object

**indent -**
Optional (default is null). The indentation number.

#### Returns

The JSON string

---

## markdownUp.bare

`markdownUp.bare` contains implementations of the
[MarkdownUp](https://github.com/craigahobbs/markdown-up#readme)
runtime functions, which enables many MarkdownUp applications to run on plain
[BareScript](https://github.com/craigahobbs/bare-script#readme).

Consider the following MarkdownUp application:

**app.md**

``` markdown
~~~ markdown-script
include 'app.bare'
~~~
```

**app.bare:**

~~~ bare-script
function appMain():
    markdownPrint('# Hello!', '')
    i = 0
    while i < 10:
        markdownPrint('- ' + (i + 1))
        i = i + 1
    endwhile
endfunction

appMain()
~~~

The application runs as expected within
[MarkdownUp](https://github.com/craigahobbs/markdown-up#readme).
However, when running in plain BareScript, the `markdownPrint` function is not defined, and the
application fails:

~~~ sh
$ bare app.bare
app.bare:
Undefined function "markdownPrint"
~~~

However, if we first include "markdownUp.bare" using the "-m" argument, the application works and
outputs the generated Markdown to the terminal:

~~~ sh
$ bare -m app.bare
# Hello!

- 1
- 2
- 3
- 4
- 5
- 6
- 7
- 8
- 9
- 10
~~~


---

## markdownUp.bare: data

The "markdownUp.bare: data" section contains functions for visualizing data in MarkdownUp
applications. These functions integrate with the data manipulation functions to create charts and
tables.

Draw a data table:

~~~ bare-script
data = [ \
    {'product': 'Widget', 'sales': 1000, 'profit': 250}, \
    {'product': 'Gadget', 'sales': 1500, 'profit': 400}, \
    {'product': 'Doohickey', 'sales': 800, 'profit': 150} \
]

tableModel = { \
    'fields': ['product', 'sales', 'profit'], \
    'formats': { \
        'sales': {'align': 'right'}, \
        'profit': {'align': 'right'} \
    } \
}

dataTable(data, tableModel)
~~~

Draw a line chart:

~~~ bare-script
chartData = [ \
    {'month': 1, 'revenue': 10000, 'costs': 7000}, \
    {'month': 2, 'revenue': 12000, 'costs': 7500}, \
    {'month': 3, 'revenue': 15000, 'costs': 8000} \
]

chartModel = { \
    'x': 'month', \
    'y': ['revenue', 'costs'], \
    'title': 'Monthly Revenue and Costs' \
}

dataLineChart(chartData, chartModel)
~~~

These functions render visualizations directly into the MarkdownUp document, making it easy to
create data-driven reports and dashboards.


### Function Index

- [dataLineChart](#var.vPublish=true&var.vSingle=true&datalinechart)
- [dataTable](#var.vPublish=true&var.vSingle=true&datatable)

---

### dataLineChart

Draw a line chart

#### Arguments

**data -**
The data array

**lineChart -**
The [line chart model](model.html#var.vName='LineChart')

#### Returns

Nothing

---

### dataTable

Draw a data table

#### Arguments

**data -**
The data array

**dataTable -**
Optional (default is null). The [data table model](model.html#var.vName='DataTable').

#### Returns

Nothing

---

## markdownUp.bare: document

The "markdownUp.bare: document" section contains functions for interacting with the document and
browser DOM. These functions allow you to manipulate the document title, get input values, set
focus, and handle keyboard events.

Set the document title:

~~~ bare-script
documentSetTitle('My Application')
~~~

Get the value of an input element:

~~~ bare-script
value = documentInputValue('myInput')
~~~

Set focus to an element:

~~~ bare-script
documentSetFocus('myInput')
~~~

Set a keyboard event handler:

~~~ bare-script
function myAppMain():
    markdownPrint('Press any key...')
    documentSetKeyDown(myAppOnKeyDown)
endfunction

function myAppOnKeyDown(event):
    key = objectGet(event, 'key')
    markdownPrint('You pressed: ' + key)
endfunction

myAppMain()
~~~

Get the document font size:

~~~ bare-script
fontSize = documentFontSize()
~~~

Get the document-relative URL:

~~~ bare-script
url = documentURL('path/to/resource')
~~~

Set the document reset element (the element to focus when the page resets):

~~~ bare-script
documentSetReset('myResetID')
~~~


### Function Index

- [documentFontSize](#var.vPublish=true&var.vSingle=true&documentfontsize)
- [documentInputValue](#var.vPublish=true&var.vSingle=true&documentinputvalue)
- [documentSetFocus](#var.vPublish=true&var.vSingle=true&documentsetfocus)
- [documentSetKeyDown](#var.vPublish=true&var.vSingle=true&documentsetkeydown)
- [documentSetReset](#var.vPublish=true&var.vSingle=true&documentsetreset)
- [documentSetTitle](#var.vPublish=true&var.vSingle=true&documentsettitle)
- [documentURL](#var.vPublish=true&var.vSingle=true&documenturl)

---

### documentFontSize

Get the document font size

#### Arguments

None

#### Returns

The document font size, in pixels

---

### documentInputValue

Get an input element's value

#### Arguments

**id -**
The input element ID

#### Returns

The input element value or null if the element does not exist

---

### documentSetFocus

Set focus to an element

#### Arguments

**id -**
The element ID

#### Returns

Nothing

---

### documentSetKeyDown

Set the document keydown event handler. For example:

```barescript
function myAppMain():
    myAppRender()
    documentSetKeyDown(myAppKeyDown)
endfunction

function myAppRender(key):
    markdownPrint( \
        '# KeyDown Test', \
        '', \
        if(key, '**Key pressed:** "' + key + '"', '*No key pressed yet.*') \
    )
endfunction

function myAppKeyDown(event):
    key = objectGet(event, 'key')
    myAppRender(key)
endfunction

myAppMain()
```

#### Arguments

**callback -**
The keydown event callback function, which takes a single `event` object that has
the following attributes:
- `key` - The key value (e.g., "a", "Enter", "ArrowUp")
- `code` - The physical key code (e.g., "KeyA", "Enter")
- `keyCode` - The legacy numeric code (e.g., 65 for 'a')
- `ctrlKey` - If true, the control key is pressed
- `altKey` - If true, the alt key is pressed
- `shiftKey` - If true, the shift key is pressed
- `metaKey` - If true, the cmd key is pressed
- `repeat` - If true, the key is held down
- `location` - 0=standard, 1=left, 2=right

#### Returns

Nothing

---

### documentSetReset

Set the document reset element

#### Arguments

**id -**
The element ID

#### Returns

Nothing

---

### documentSetTitle

Set the document title

#### Arguments

**title -**
The document title string

#### Returns

Nothing

---

### documentURL

Fix-up relative URLs

#### Arguments

**url -**
The URL

#### Returns

The fixed-up URL

---

## markdownUp.bare: draw

The "markdownUp.bare: draw" section contains functions for creating vector graphics drawings. These
functions provide a programmatic way to draw shapes, lines, text, and images using SVG.

Create a new drawing and draw basic shapes:

~~~ bare-script
drawNew(400, 300)

# Fill the background
drawStyle('none', 0, 'white')
drawRect(0, 0, drawWidth(), drawHeight())

# Draw a rectangle
drawStyle('black', 2, 'blue')
drawRect(0.1 * drawWidth(), 0.1 * drawHeight(), 0.2 * drawWidth(), 0.2 * drawHeight())

# Draw a circle
drawStyle('black', 2, 'red')
drawCircle(0.3 * drawWidth(), 0.6 * drawHeight(), 0.1 * drawWidth())

# Draw an ellipse
drawStyle('black', 2, 'green')
drawEllipse(0.7 * drawWidth(), 0.4 * drawHeight(), 0.2 * drawWidth(), 0.1 * drawHeight())
~~~

Draw paths with lines and curves:

~~~ bare-script
drawStyle('black', 4, '#cc222280')
drawMove(0.7 * drawWidth(), 0.7 * drawHeight())
drawLine(0.9 * drawWidth(), 0.7 * drawHeight())
drawLine(0.9 * drawWidth(), 0.9 * drawHeight())
drawClose()
~~~

Draw text:

~~~ bare-script
drawTextStyle(0.1 * drawHeight(), 'black', true)
drawText('Hello, World!', 0.5 * drawWidth(), 0.5 * drawHeight())
~~~

Draw images:

~~~ bare-script
drawImage(0.5 * drawWidth(), 0.5 * drawHeight(), 0.2 * drawHeight(), 0.2 * drawHeight(), 'image.png')
~~~

Add click handlers to drawing objects:

~~~ bare-script
function myClickHandler():
    systemLog('Click!')
endfunction

drawStyle('black', 2, 'gray')
drawRect(0.1 * drawWidth(), 0.1 * drawHeight(), 0.1 * drawWidth(), 0.1 * drawHeight())
drawOnClick(myClickHandler)
~~~


### Function Index

- [drawArc](#var.vPublish=true&var.vSingle=true&drawarc)
- [drawCircle](#var.vPublish=true&var.vSingle=true&drawcircle)
- [drawClose](#var.vPublish=true&var.vSingle=true&drawclose)
- [drawEllipse](#var.vPublish=true&var.vSingle=true&drawellipse)
- [drawHLine](#var.vPublish=true&var.vSingle=true&drawhline)
- [drawHeight](#var.vPublish=true&var.vSingle=true&drawheight)
- [drawImage](#var.vPublish=true&var.vSingle=true&drawimage)
- [drawLine](#var.vPublish=true&var.vSingle=true&drawline)
- [drawMove](#var.vPublish=true&var.vSingle=true&drawmove)
- [drawNew](#var.vPublish=true&var.vSingle=true&drawnew)
- [drawOnClick](#var.vPublish=true&var.vSingle=true&drawonclick)
- [drawPathRect](#var.vPublish=true&var.vSingle=true&drawpathrect)
- [drawRect](#var.vPublish=true&var.vSingle=true&drawrect)
- [drawStyle](#var.vPublish=true&var.vSingle=true&drawstyle)
- [drawText](#var.vPublish=true&var.vSingle=true&drawtext)
- [drawTextHeight](#var.vPublish=true&var.vSingle=true&drawtextheight)
- [drawTextStyle](#var.vPublish=true&var.vSingle=true&drawtextstyle)
- [drawTextWidth](#var.vPublish=true&var.vSingle=true&drawtextwidth)
- [drawVLine](#var.vPublish=true&var.vSingle=true&drawvline)
- [drawWidth](#var.vPublish=true&var.vSingle=true&drawwidth)

---

### drawArc

Draw an arc curve from the current point to the end point

#### Arguments

**rx -**
The arc ellipse's x-radius

**ry -**
The arc ellipse's y-radius

**angle -**
The rotation (in degrees) of the ellipse relative to the x-axis

**largeArcFlag -**
Either large arc (1) or small arc (0)

**sweepFlag -**
Either clockwise turning arc (1) or counterclockwise turning arc (0)

**x -**
The x-coordinate of the end point

**y -**
The y-coordinate of the end point

#### Returns

Nothing

---

### drawCircle

Draw a circle

#### Arguments

**cx -**
The x-coordinate of the center of the circle

**cy -**
The y-coordinate of the center of the circle

**r -**
The radius of the circle

#### Returns

Nothing

---

### drawClose

Close the current drawing path

#### Arguments

None

#### Returns

Nothing

---

### drawEllipse

Draw an ellipse

#### Arguments

**cx -**
The x-coordinate of the center of the ellipse

**cy -**
The y-coordinate of the center of the ellipse

**rx -**
The x-radius of the ellipse

**ry -**
The y-radius of the ellipse

#### Returns

Nothing

---

### drawHLine

Draw a horizontal line from the current point to the end point

#### Arguments

**x -**
The x-coordinate of the end point

#### Returns

Nothing

---

### drawHeight

Get the current drawing's height

#### Arguments

None

#### Returns

The current drawing's height

---

### drawImage

Draw an image

#### Arguments

**x -**
The x-coordinate of the center of the image

**y -**
The y-coordinate of the center of the image

**width -**
The width of the image

**height -**
The height of the image

**href -**
The image resource URL

#### Returns

Nothing

---

### drawLine

Draw a line from the current point to the end point

#### Arguments

**x -**
The x-coordinate of the end point

**y -**
The y-coordinate of the end point

#### Returns

Nothing

---

### drawMove

Move the path's drawing point

#### Arguments

**x -**
The x-coordinate of the new drawing point

**y -**
The y-coordinate of the new drawing point

#### Returns

Nothing

---

### drawNew

Create a new drawing

#### Arguments

**width -**
The width of the drawing

**height -**
The height of the drawing

#### Returns

Nothing

---

### drawOnClick

Set the most recent drawing object's on-click event handler

#### Arguments

**callback -**
The on-click event callback function (x, y)

#### Returns

Nothing

---

### drawPathRect

Draw a rectangle as a path

#### Arguments

**x -**
The x-coordinate of the top-left of the rectangle

**y -**
The y-coordinate of the top-left of the rectangle

**width -**
The width of the rectangle

**height -**
The height of the rectangle

#### Returns

Nothing

---

### drawRect

Draw a rectangle

#### Arguments

**x -**
The x-coordinate of the top-left of the rectangle

**y -**
The y-coordinate of the top-left of the rectangle

**width -**
The width of the rectangle

**height -**
The height of the rectangle

**rx -**
Optional (default is null). The horizontal corner radius of the rectangle.

**ry -**
Optional (default is null). The vertical corner radius of the rectangle.

#### Returns

Nothing

---

### drawStyle

Set the current drawing styles

#### Arguments

**stroke -**
Optional (default is 'black'). The stroke color.

**strokeWidth -**
Optional (default is 1). The stroke width.

**fill -**
Optional (default is 'none'). The fill color.

**strokeDashArray -**
Optional (default is 'none'). The stroke
[dash array](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray#usage_notes).

#### Returns

Nothing

---

### drawText

Draw text

#### Arguments

**text -**
The text to draw

**x -**
The x-coordinate of the text

**y -**
The y-coordinate of the text

**textAnchor -**
Optional (default is 'middle'). The
[text anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor#usage_notes) style.

**dominantBaseline -**
Optional (default is 'middle'). The
[dominant baseline](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dominant-baseline#usage_notes)
style.

#### Returns

Nothing

---

### drawTextHeight

Compute the text's height to fit the width

#### Arguments

**text -**
The text

**width -**
The width of the text. If 0, the default font size (in pixels) is returned.

#### Returns

The text's height, in pixels

---

### drawTextStyle

Set the current text drawing styles

#### Arguments

**fontSizePx -**
Optional (default is null, the default font size). The text font size, in pixels.

**textFill -**
Optional (default is 'black'). The text fill color.

**bold -**
Optional (default is false). If true, text is bold.

**italic -**
Optional (default is false). If true, text is italic.

**fontFamily -**
Optional (default is null, the default font family). The text font family.

#### Returns

Nothing

---

### drawTextWidth

Compute the text's width

#### Arguments

**text -**
The text

**fontSizePx -**
The text font size, in pixels

#### Returns

The text's width, in pixels

---

### drawVLine

Draw a vertical line from the current point to the end point

#### Arguments

**y -**
The y-coordinate of the end point

#### Returns

Nothing

---

### drawWidth

Get the current drawing's width

#### Arguments

None

#### Returns

The current drawing's width

---

## markdownUp.bare: elementModel

The "markdownUp.bare: elementModel" section contains functions for rendering
[element models](https://github.com/craigahobbs/element-model#readme). Element models provide a
declarative way to create HTML elements and handle user interactions.

Render an element model:

~~~ bare-script
element = { \
    'html': 'p', \
    'elem': [ \
        {'html': 'span', 'attr': {'style': 'font-weight: bold;'}, 'elem': {'text': 'Hello'}}, \
        {'text': ' '}, \
        {'html': 'span', 'elem': {'text': 'World!'}} \
    ] \
}

elementModelRender(element)
~~~

Create elements with event handlers:

~~~ bare-script
function myAppMain():
    button = { \
        'html': 'button', \
        'elem': {'text': 'Click me'}, \
        'callback': {'click': myAppOnClick} \
    }
    elementModelRender(button)
endfunction

function myAppOnClick():
    markdownPrint('Button clicked!')
endfunction

myAppMain()
~~~

Element models support various HTML elements, attributes, styles, and event callbacks. This provides
a powerful way to create interactive user interfaces in MarkdownUp applications without writing HTML
directly.


### Function Index

- [elementModelRender](#var.vPublish=true&var.vSingle=true&elementmodelrender)

---

### elementModelRender

Render an [element model](https://github.com/craigahobbs/element-model#readme)

**Note:** Element model "callback" members are a map of event name (e.g., "click") to
event callback function. The following events have callback arguments:
- **keydown** - keyCode
- **keypress** - keyCode
- **keyup** - keyCode

#### Arguments

**element -**
The [element model](https://github.com/craigahobbs/element-model#readme)

#### Returns

Nothing

---

## markdownUp.bare: localStorage

The "markdownUp.bare: localStorage" section contains functions for interacting with the browser's
local storage. Local storage provides persistent key-value storage that survives browser restarts.

Set a value in local storage:

~~~ bare-script
localStorageSet('username', 'Alice')
localStorageSet('theme', 'dark')
~~~

Get a value from local storage:

~~~ bare-script
username = localStorageGet('username')
theme = localStorageGet('theme')
~~~

Remove a key from local storage:

~~~ bare-script
localStorageRemove('username')
~~~

Clear all keys from local storage:

~~~ bare-script
localStorageClear()
~~~

Local storage is useful for saving user preferences, application state, or cached data that should
persist across sessions. Values are stored as strings, so you may need to use
[jsonStringify](#var.vGroup='json'&jsonstringify) and [jsonParse](#var.vGroup='json'&jsonparse) for
complex data:

~~~ bare-script
# Store an object
preferences = {'theme': 'dark', 'fontSize': 14}
localStorageSet('preferences', jsonStringify(preferences))

# Retrieve the object
preferencesJson = localStorageGet('preferences')
preferences = jsonParse(preferencesJson)
~~~


### Function Index

- [localStorageClear](#var.vPublish=true&var.vSingle=true&localstorageclear)
- [localStorageGet](#var.vPublish=true&var.vSingle=true&localstorageget)
- [localStorageRemove](#var.vPublish=true&var.vSingle=true&localstorageremove)
- [localStorageSet](#var.vPublish=true&var.vSingle=true&localstorageset)

---

### localStorageClear

Clear all keys from the browser's local storage

#### Arguments

None

#### Returns

Nothing

---

### localStorageGet

Get a browser local storage key's value

#### Arguments

**key -**
The key string

#### Returns

The local storage value string or null if the key does not exist

---

### localStorageRemove

Remove a browser local storage key

#### Arguments

**key -**
The key string

#### Returns

Nothing

---

### localStorageSet

Set a browser local storage key's value

#### Arguments

**key -**
The key string

**value -**
The value string

#### Returns

Nothing

---

## markdownUp.bare: markdown

The "markdownUp.bare: markdown" section contains functions for parsing, rendering, and manipulating
Markdown content. These are core functions for MarkdownUp applications.

Render Markdown text:

~~~ bare-script
markdownPrint('# Hello, World!', '', 'This is a **Markdown** document.')
~~~

Escape text for safe inclusion in Markdown:

~~~ bare-script
# Escape special characters
safeText = markdownEscape('Text with * and _ characters')
markdownPrint('**Bold:** ' + safeText)
~~~

Compute a header element ID from text:

~~~ bare-script
# Get the ID for a header
headerId = markdownHeaderId('My Section Title')
# Returns: 'my-section-title'
~~~

Extract the title from Markdown text:

~~~ bare-script
model = markdownParse('# Title', '', 'Some *text*.')
title = markdownTitle(model)
~~~

The Markdown functions support [GitHub Flavored Markdown](https://github.github.com/gfm/) including
headers, emphasis, links, lists, code blocks, and tables. They integrate seamlessly with other
MarkdownUp functions to create rich, interactive documents.


### Function Index

- [markdownEscape](#var.vPublish=true&var.vSingle=true&markdownescape)
- [markdownHeaderId](#var.vPublish=true&var.vSingle=true&markdownheaderid)
- [markdownParse](#var.vPublish=true&var.vSingle=true&markdownparse)
- [markdownPrint](#var.vPublish=true&var.vSingle=true&markdownprint)
- [markdownTitle](#var.vPublish=true&var.vSingle=true&markdowntitle)

---

### markdownEscape

Escape text for inclusion in Markdown text

#### Arguments

**text -**
The text

#### Returns

The escaped text

---

### markdownHeaderId

Compute the Markdown header element ID for some text

#### Arguments

**text -**
The text

#### Returns

The header element ID

---

### markdownParse

Parse Markdown text

#### Arguments

**lines... -**
The Markdown text lines (may contain nested arrays of un-split lines)

#### Returns

The [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')

---

### markdownPrint

Render Markdown text

#### Arguments

**lines... -**
The Markdown text lines (may contain nested arrays of un-split lines)

#### Returns

Nothing

---

### markdownTitle

Compute the title of a [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')

#### Arguments

**markdownModel -**
The [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')

#### Returns

The Markdown title or null if there is no title

---

## markdownUp.bare: sessionStorage

The "markdownUp.bare: sessionStorage" section contains functions for interacting with the browser's
session storage. Session storage provides key-value storage that persists for the duration of the
browser session (until the tab or window is closed).

Set a value in session storage:

~~~ bare-script
sessionStorageSet('currentPage', 'home')
~~~

Get a value from session storage:

~~~ bare-script
currentPage = sessionStorageGet('currentPage')
~~~

Remove a key from session storage:

~~~ bare-script
sessionStorageRemove('currentPage')
~~~

Clear all keys from session storage:

~~~ bare-script
sessionStorageClear()
~~~

Session storage is useful for temporary state that should persist across page refreshes but not
across browser sessions. Like local storage, values are stored as strings:

~~~ bare-script
# Store an object
state = {'page': 'home', 'filters': ['active', 'new']}
sessionStorageSet('appState', jsonStringify(state))

# Retrieve the object
stateJson = sessionStorageGet('appState')
state = jsonParse(stateJson)
~~~


### Function Index

- [sessionStorageClear](#var.vPublish=true&var.vSingle=true&sessionstorageclear)
- [sessionStorageGet](#var.vPublish=true&var.vSingle=true&sessionstorageget)
- [sessionStorageRemove](#var.vPublish=true&var.vSingle=true&sessionstorageremove)
- [sessionStorageSet](#var.vPublish=true&var.vSingle=true&sessionstorageset)

---

### sessionStorageClear

Clear all keys from the browser's session storage

#### Arguments

None

#### Returns

Nothing

---

### sessionStorageGet

Get a browser session storage key's value

#### Arguments

**key -**
The key string

#### Returns

The session storage value string or null if the key does not exist

---

### sessionStorageRemove

Remove a browser session storage key

#### Arguments

**key -**
The key string

#### Returns

Nothing

---

### sessionStorageSet

Set a browser session storage key's value

#### Arguments

**key -**
The key string

**value -**
The value string

#### Returns

Nothing

---

## markdownUp.bare: url

The "markdownUp.bare: url" section contains functions for working with URLs in the browser
environment.

Create an object URL for file downloads:

~~~ bare-script
# Create a downloadable text file blob
downloadFilename = 'test.txt'
downloadContent = 'Hello, World!\nThis is a text file.'
downloadURL = urlObjectCreate(downloadContent, 'text/plain')

# Create a link to download the file
elementModelRender({ \
    'html': 'p', \
    'elem': [ \
        { \
            'html': 'a', \
            'attr': {'href': downloadURL, 'download': downloadFilename}, \
            'elem': {'text': 'Download'} \
        } \
    ] \
})
~~~

Object URLs are temporary URLs that reference in-memory data. They're useful for creating
downloadable files on-the-fly without requiring server-side processing. The URLs remain valid until
the page is closed.


### Function Index

- [urlObjectCreate](#var.vPublish=true&var.vSingle=true&urlobjectcreate)

---

### urlObjectCreate

Create an object URL (i.e. a file download URL)

#### Arguments

**data -**
The object data string

**contentType -**
Optional (default is "text/plain"). The object content type.

#### Returns

The object URL string

---

## markdownUp.bare: window

The "markdownUp.bare: window" section contains functions for interacting with the browser window and
its environment.

Get window dimensions:

~~~ bare-script
width = windowWidth()
height = windowHeight()
markdownPrint('Window size: ' + width + ' x ' + height)
~~~

Navigate to a URL:

~~~ bare-script
windowSetLocation('other.html')
~~~

Set a window resize event handler:

~~~ bare-script
function myAppMain():
    myAppRender()
    windowSetResize(myAppOnResize)
endfunction

function myAppRender():
    markdownPrint('Window: ' + windowWidth() + ' x ' + windowHeight())
endfunction

function myAppOnResize():
    myAppRender()
endfunction

myAppMain()
~~~

Set a timeout event handler:

~~~ bare-script
function myAppMain():
    markdownPrint('Starting timer...')
    windowSetTimeout(myAppOnTimeout, 3000)
endfunction

function myAppOnTimeout():
    markdownPrint('Timer fired after 3 seconds!')
endfunction

myAppMain()
~~~

Read from the clipboard:

~~~ bare-script
async function myAppReadClipboard():
    text = windowClipboardRead()
    markdownPrint('Clipboard contains: ' + text)
endfunction
~~~

Write to the clipboard:

~~~ bare-script
async function myAppWriteClipboard():
    windowClipboardWrite('Hello, clipboard!')
endfunction
~~~


### Function Index

- [windowClipboardRead](#var.vPublish=true&var.vSingle=true&windowclipboardread)
- [windowClipboardWrite](#var.vPublish=true&var.vSingle=true&windowclipboardwrite)
- [windowHeight](#var.vPublish=true&var.vSingle=true&windowheight)
- [windowSetLocation](#var.vPublish=true&var.vSingle=true&windowsetlocation)
- [windowSetResize](#var.vPublish=true&var.vSingle=true&windowsetresize)
- [windowSetTimeout](#var.vPublish=true&var.vSingle=true&windowsettimeout)
- [windowWidth](#var.vPublish=true&var.vSingle=true&windowwidth)

---

### windowClipboardRead

Read text from the clipboard

#### Arguments

None

#### Returns

The clipboard text

---

### windowClipboardWrite

Write text to the clipboard

#### Arguments

**text -**
The text to write

#### Returns

Nothing

---

### windowHeight

Get the browser window's height

#### Arguments

None

#### Returns

The browser window's height

---

### windowSetLocation

Navigate the browser window to a location URL

#### Arguments

**url -**
The new location URL

#### Returns

Nothing

---

### windowSetResize

Set the browser window resize event handler

#### Arguments

**callback -**
The window resize callback function

#### Returns

Nothing

---

### windowSetTimeout

Set the browser window timeout event handler

#### Arguments

**callback -**
The window timeout callback function

**delay -**
The delay, in milliseconds, to ellapse before calling the timeout

#### Returns

Nothing

---

### windowWidth

Get the browser window's width

#### Arguments

None

#### Returns

The browser window's width

---

## math

Math functions provide standard mathematical operations including trigonometric functions,
logarithms, rounding, and common calculations. These functions work with numeric values and return
numeric results.

Basic arithmetic and rounding:

~~~ bare-script
# Absolute value
abs = mathAbs(-5)

# Rounding
ceil = mathCeil(3.2)    # 4
floor = mathFloor(3.8)  # 3
round = mathRound(3.5)  # 4

# Sign
sign = mathSign(-5)  # -1
~~~

Trigonometric functions (angles in radians):

~~~ bare-script
# Basic trig functions
sin = mathSin(mathPi() / 2)  # 1
cos = mathCos(0)             # 1
tan = mathTan(mathPi() / 4)  # 1

# Inverse trig functions
asin = mathAsin(1)     # π/2
acos = mathAcos(1)     # 0
atan = mathAtan(1)     # π/4
atan2 = mathAtan2(1, 1)  # π/4
~~~

Logarithms and exponents:

~~~ bare-script
# Natural logarithm (base e)
ln = mathLn(2.718281828)

# Logarithm with custom base
log = mathLog(100, 10)  # 2
log2 = mathLog(8, 2)    # 3

# Square root
sqrt = mathSqrt(16)  # 4
~~~

Min, max, and random:

~~~ bare-script
# Minimum and maximum
min = mathMin(5, 2, 8, 1)  # 1
max = mathMax(5, 2, 8, 1)  # 8

# Random number between 0 and 1
random = mathRandom()
~~~

Constants:

~~~ bare-script
pi = mathPi()  # 3.141592653589793
~~~


### Function Index

- [mathAbs](#var.vPublish=true&var.vSingle=true&mathabs)
- [mathAcos](#var.vPublish=true&var.vSingle=true&mathacos)
- [mathAsin](#var.vPublish=true&var.vSingle=true&mathasin)
- [mathAtan](#var.vPublish=true&var.vSingle=true&mathatan)
- [mathAtan2](#var.vPublish=true&var.vSingle=true&mathatan2)
- [mathCeil](#var.vPublish=true&var.vSingle=true&mathceil)
- [mathCos](#var.vPublish=true&var.vSingle=true&mathcos)
- [mathFloor](#var.vPublish=true&var.vSingle=true&mathfloor)
- [mathLn](#var.vPublish=true&var.vSingle=true&mathln)
- [mathLog](#var.vPublish=true&var.vSingle=true&mathlog)
- [mathMax](#var.vPublish=true&var.vSingle=true&mathmax)
- [mathMin](#var.vPublish=true&var.vSingle=true&mathmin)
- [mathPi](#var.vPublish=true&var.vSingle=true&mathpi)
- [mathRandom](#var.vPublish=true&var.vSingle=true&mathrandom)
- [mathRound](#var.vPublish=true&var.vSingle=true&mathround)
- [mathSign](#var.vPublish=true&var.vSingle=true&mathsign)
- [mathSin](#var.vPublish=true&var.vSingle=true&mathsin)
- [mathSqrt](#var.vPublish=true&var.vSingle=true&mathsqrt)
- [mathTan](#var.vPublish=true&var.vSingle=true&mathtan)

---

### mathAbs

Compute the absolute value of a number

#### Arguments

**x -**
The number

#### Returns

The absolute value of the number

---

### mathAcos

Compute the arccosine, in radians, of a number

#### Arguments

**x -**
The number

#### Returns

The arccosine, in radians, of the number

---

### mathAsin

Compute the arcsine, in radians, of a number

#### Arguments

**x -**
The number

#### Returns

The arcsine, in radians, of the number

---

### mathAtan

Compute the arctangent, in radians, of a number

#### Arguments

**x -**
The number

#### Returns

The arctangent, in radians, of the number

---

### mathAtan2

Compute the angle, in radians, between (0, 0) and a point

#### Arguments

**y -**
The Y-coordinate of the point

**x -**
The X-coordinate of the point

#### Returns

The angle, in radians

---

### mathCeil

Compute the ceiling of a number (round up to the next highest integer)

#### Arguments

**x -**
The number

#### Returns

The ceiling of the number

---

### mathCos

Compute the cosine of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The cosine of the angle

---

### mathFloor

Compute the floor of a number (round down to the next lowest integer)

#### Arguments

**x -**
The number

#### Returns

The floor of the number

---

### mathLn

Compute the natural logarithm (base e) of a number

#### Arguments

**x -**
The number

#### Returns

The natural logarithm of the number

---

### mathLog

Compute the logarithm (base 10) of a number

#### Arguments

**x -**
The number

**base -**
Optional (default is 10). The logarithm base.

#### Returns

The logarithm of the number

---

### mathMax

Compute the maximum value

#### Arguments

**values... -**
The values

#### Returns

The maximum value

---

### mathMin

Compute the minimum value

#### Arguments

**values... -**
The values

#### Returns

The minimum value

---

### mathPi

Return the number pi

#### Arguments

None

#### Returns

The number pi

---

### mathRandom

Compute a random number between 0 and 1, inclusive

#### Arguments

None

#### Returns

A random number

---

### mathRound

Round a number to a certain number of decimal places

#### Arguments

**x -**
The number

**digits -**
Optional (default is 0). The number of decimal digits to round to.

#### Returns

The rounded number

---

### mathSign

Compute the sign of a number

#### Arguments

**x -**
The number

#### Returns

-1 for a negative number, 1 for a positive number, and 0 for zero

---

### mathSin

Compute the sine of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The sine of the angle

---

### mathSqrt

Compute the square root of a number

#### Arguments

**x -**
The number

#### Returns

The square root of the number

---

### mathTan

Compute the tangent of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The tangent of the angle

---

## number

Number functions provide operations for parsing, formatting, and converting numeric values.

Parse strings as numbers:

~~~ bare-script
# Parse floating-point numbers
num = numberParseFloat('3.14159')
negative = numberParseFloat('-2.5')

# Parse integers
int = numberParseInt('42')
hex = numberParseInt('FF', 16)
binary = numberParseInt('1010', 2)
~~~

Format numbers with fixed decimal places:

~~~ bare-script
# Format with 2 decimal places (default)
formatted = numberToFixed(3.14159)  # '3.14'

# Format with specific decimal places
precise = numberToFixed(3.14159, 4)  # '3.1416'

# Format with no decimal places
integer = numberToFixed(3.14159, 0)  # '3'

# Trim trailing zeros
trimmed = numberToFixed(3.5, 2, true)  # '3.5' instead of '3.50'
~~~


### Function Index

- [numberParseFloat](#var.vPublish=true&var.vSingle=true&numberparsefloat)
- [numberParseInt](#var.vPublish=true&var.vSingle=true&numberparseint)
- [numberToFixed](#var.vPublish=true&var.vSingle=true&numbertofixed)

---

### numberParseFloat

Parse a string as a floating point number

#### Arguments

**string -**
The string

#### Returns

The number

---

### numberParseInt

Parse a string as an integer

#### Arguments

**string -**
The string

**radix -**
Optional (default is 10). The number base.

#### Returns

The integer

---

### numberToFixed

Format a number using fixed-point notation

#### Arguments

**x -**
The number

**digits -**
Optional (default is 2). The number of digits to appear after the decimal point.

**trim -**
Optional (default is false). If true, trim trailing zeroes and decimal point.

#### Returns

The fixed-point notation string

---

## object

Object functions provide operations for creating and manipulating objects. Objects are key-value
collections that can be created using object literal syntax (e.g., `{'a': 1, 'b': 2}`) or with the
[objectNew](#var.vGroup='object'&objectnew) function.

Create and manipulate objects:

~~~ bare-script
# Create a new object
person = {'name', 'Alice', 'age', 30}

# Set and get values
objectSet(person, 'city', 'New York')
name = objectGet(person, 'name')
city = objectGet(person, 'city', 'Unknown')  # With default value
~~~

Check for keys and get all keys:

~~~ bare-script
# Check if a key exists
hasAge = objectHas(person, 'age')

# Get all keys
keys = objectKeys(person)
~~~

Copy and assign objects:

~~~ bare-script
# Create a shallow copy
personCopy = objectCopy(person)

# Assign properties from one object to another
defaults = {'country': 'USA', 'status': 'active'}
objectAssign(person, defaults)
~~~

Delete keys:

~~~ bare-script
objectDelete(person, 'status')
~~~


### Function Index

- [objectAssign](#var.vPublish=true&var.vSingle=true&objectassign)
- [objectCopy](#var.vPublish=true&var.vSingle=true&objectcopy)
- [objectDelete](#var.vPublish=true&var.vSingle=true&objectdelete)
- [objectGet](#var.vPublish=true&var.vSingle=true&objectget)
- [objectHas](#var.vPublish=true&var.vSingle=true&objecthas)
- [objectKeys](#var.vPublish=true&var.vSingle=true&objectkeys)
- [objectNew](#var.vPublish=true&var.vSingle=true&objectnew)
- [objectSet](#var.vPublish=true&var.vSingle=true&objectset)

---

### objectAssign

Assign the keys/values of one object to another

#### Arguments

**object -**
The object to assign to

**object2 -**
The object to assign

#### Returns

The updated object

---

### objectCopy

Create a copy of an object

#### Arguments

**object -**
The object to copy

#### Returns

The object copy

---

### objectDelete

Delete an object key

#### Arguments

**object -**
The object

**key -**
The key to delete

#### Returns

Nothing

---

### objectGet

Get an object key's value

#### Arguments

**object -**
The object

**key -**
The key

**defaultValue -**
The default value (optional)

#### Returns

The value or null if the key does not exist

---

### objectHas

Test if an object contains a key

#### Arguments

**object -**
The object

**key -**
The key

#### Returns

true if the object contains the key, false otherwise

---

### objectKeys

Get an object's keys

#### Arguments

**object -**
The object

#### Returns

The array of keys

---

### objectNew

Create a new object

#### Arguments

**keyValues... -**
The object's initial key and value pairs

#### Returns

The new object

---

### objectSet

Set an object key's value

#### Arguments

**object -**
The object

**key -**
The key

**value -**
The value to set

#### Returns

The value to set

---

## pager.bare

The "pager.bare" include library is a simple, configurable, paged MarkdownUp application. The pager
renders a menu of links to your pages and navigation links (start, next, previous). The pager
supports three page types: function pages, Markdown pages, and external links.

You execute the pager by defining a [pager model] and calling the [pagerMain] function.

~~~ bare-script
include <pager.bare>

function funcPage(args):
    markdownPrint('This is page "' + objectGet(args, 'page') + '"')
endfunction

pagerModel = { \
    'pages': [ \
        {'name': 'Function Page', 'type': {'function': { \
            'function': funcPage, 'title': 'The Function Page'}}}, \
        {'name': 'Markdown Page', 'type': {'markdown': { \
            'url': 'README.md'}}}, \
        {'name': 'Link Page', 'type': {'link': { \
            'url': 'external.html'}}} \
    ] \
}
pagerMain(pagerModel)
~~~

By default, the pager application defines a single URL argument, "page", to track the currently
selected page. You can pass the "arguments" option with a custom [arguments model] if you need
additional URL arguments for your application. Note that you must define a string argument named
"page".

~~~ bare-script
arguments = [ \
    {'name': 'page', 'default': 'Function Page'}, \
    {'name': 'value', 'type': 'float', 'default': 0} \
]
pagerMain(pagerModel, {'arguments': arguments})
~~~

You can hide the navigation links using the "hideNav" option.

~~~ bare-script
pagerMain(pagerModel, {'hideNav': true})
~~~

You can hide the menu links using the "hideMenu" option.

~~~ bare-script
pagerMain(pagerModel, {'hideMenu': true})
~~~

The default page is the first non-hidden page. To show a different page by default, use the "start"
option. If you provide the "arguments" option, be sure to set the "page" argument's default to be
the same as the "start" option.

~~~ bare-script
pagerMain(pagerModel, {'start': 'Markdown Page'})
~~~


[arguments model]: includeModel.html#var.vName='ArgsArguments'
[pager model]: includeModel.html#var.vName='Pager'
[pagerMain]: include.html#var.vGroup='pager.bare'&pagermain


### Function Index

- [pagerMain](#var.vPublish=true&var.vSingle=true&pagermain)
- [pagerValidate](#var.vPublish=true&var.vSingle=true&pagervalidate)

---

### pagerMain

The pager application main entry point

#### Arguments

**pagerModel -**
The [pager model](model.html#var.vName='Pager')

**options -**
The pager application options. The following options are available:
- **arguments** - The [arguments model](model.html#var.vName='ArgsArguments').
  Must contain a string argument named "page".
- **hideMenu** - Hide the menu links
- **hideNav** - Hide the navigation links
- **start** - The start page name
- **keyboard** - Enable keyboard commands ('n' for next, 'p' for previous, 's' for start, 'e' for end)

#### Returns

Nothing

---

### pagerValidate

Validate a pager model

#### Arguments

**pagerModel -**
The [pager model](model.html#var.vName='Pager')

#### Returns

The validated [pager model](model.html#var.vName='Pager') or null if validation fails

---

## regex

Regular expression functions provide pattern matching and text manipulation capabilities. Regular
expressions are patterns used to match character combinations in strings.

Create a regular expression:

~~~ bare-script
# Basic pattern
regex = regexNew('[0-9]+')

# Pattern with flags
caseInsensitive = regexNew('[a-z]+', 'i')
multiline = regexNew('^Line', 'm')
dotAll = regexNew('.*', 's')
~~~

Find matches in strings:

~~~ bare-script
# Find first match
text = 'The year is 2024'
match = regexMatch(regexNew('[0-9]+'), text)
if match:
    groups = objectGet(match, 'groups')
    matchedText = objectGet(groups, '0')  # '2024'
    index = objectGet(match, 'index')      # 12
endif

# Find all matches
text = 'Prices: $10, $20, $30'
matches = regexMatchAll(regexNew('\\$([0-9]+)'), text)
~~~

Replace text using patterns:

~~~ bare-script
# Replace all digits with X
text = 'Phone: 555-1234'
result = regexReplace(regexNew('[0-9]'), text, 'X')
# Result: 'Phone: XXX-XXXX'
~~~

Split strings with patterns:

~~~ bare-script
# Split on whitespace
text = 'one  two   three'
parts = regexSplit(regexNew('\\s+'), text)
# Result: ['one', 'two', 'three']
~~~

Common regex patterns:
- `[a-zA-Z]+` - One or more letters
- `\\d+` - One or more digits
- `\\s+` - One or more whitespace characters
- `^` - Start of line/string
- `$` - End of line/string
- `.` - Any character (except newline without 's' flag)
- `*` - Zero or more
- `+` - One or more
- `?` - Zero or one
- `(...)` - Capture group


### Function Index

- [regexEscape](#var.vPublish=true&var.vSingle=true&regexescape)
- [regexMatch](#var.vPublish=true&var.vSingle=true&regexmatch)
- [regexMatchAll](#var.vPublish=true&var.vSingle=true&regexmatchall)
- [regexNew](#var.vPublish=true&var.vSingle=true&regexnew)
- [regexReplace](#var.vPublish=true&var.vSingle=true&regexreplace)
- [regexSplit](#var.vPublish=true&var.vSingle=true&regexsplit)

---

### regexEscape

Escape a string for use in a regular expression

#### Arguments

**string -**
The string to escape

#### Returns

The escaped string

---

### regexMatch

Find the first match of a regular expression in a string

#### Arguments

**regex -**
The regular expression

**string -**
The string

#### Returns

The [match object](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='RegexMatch'),
or null if no matches are found

---

### regexMatchAll

Find all matches of regular expression in a string

#### Arguments

**regex -**
The regular expression

**string -**
The string

#### Returns

The array of [match objects](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='RegexMatch')

---

### regexNew

Create a regular expression

#### Arguments

**pattern -**
The [regular expression pattern string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#writing_a_regular_expression_pattern)

**flags -**
The regular expression flags. The string may contain the following characters:
- **i** - case-insensitive search
- **m** - multi-line search - "^" and "$" matches next to newline characters
- **s** - "." matches newline characters

#### Returns

The regular expression or null if the pattern is invalid

---

### regexReplace

Replace regular expression matches with a string

#### Arguments

**regex -**
The replacement regular expression

**string -**
The string

**substr -**
The replacement string

#### Returns

The updated string

---

### regexSplit

Split a string with a regular expression

#### Arguments

**regex -**
The regular expression

**string -**
The string

#### Returns

The array of split parts

---

## schema

Schema functions provide operations for parsing, validating, and working with
[Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) type definitions.
Schema Markdown is a human-readable schema definition language.

Parse Schema Markdown text:

~~~ bare-script
types = schemaParse( \
    '# A person information struct', \
    'struct Person', \
    '', \
    "    # The person's name", \
    '    string name', \
    '', \
    "    # The person's age", \
    '    int age', \
    '', \
    "    # The person's email address", \
    '    optional string email' \
)
~~~

Validate data against a schema type:

~~~ bare-script
person = {'name': 'Alice', 'age': 30}
validated = schemaValidate(types, 'Person', person)
if validated != null:
    # Validation succeeded
    markdownPrint('Valid person: ' + objectGet(validated, 'name'))
endif
~~~

Validate a type model:

~~~ bare-script
# Validate that a types object conforms to the Schema Markdown type model
validatedTypes = schemaValidateTypeModel(types)
~~~

Schema validation provides:
- Type checking (strings, integers, floats, booleans, etc.)
- Required vs. optional field validation
- Array and object structure validation
- Enumeration value validation
- Custom validation constraints
- Detailed error messages

This makes it easy to define, validate, and document data structures in BareScript applications.


### Function Index

- [schemaParse](#var.vPublish=true&var.vSingle=true&schemaparse)
- [schemaParseEx](#var.vPublish=true&var.vSingle=true&schemaparseex)
- [schemaTypeModel](#var.vPublish=true&var.vSingle=true&schematypemodel)
- [schemaValidate](#var.vPublish=true&var.vSingle=true&schemavalidate)
- [schemaValidateTypeModel](#var.vPublish=true&var.vSingle=true&schemavalidatetypemodel)

---

### schemaParse

Parse the [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) text

#### Arguments

**lines... -**
The [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/)
text lines (may contain nested arrays of un-split lines)

#### Returns

The schema's [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

---

### schemaParseEx

Parse the [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) text with options

#### Arguments

**lines -**
The array of [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/)
text lines (may contain nested arrays of un-split lines)

**types -**
Optional. The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='').

**filename -**
Optional (default is ""). The file name.

#### Returns

The schema's [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

---

### schemaTypeModel

Get the [Schema Markdown Type Model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

#### Arguments

None

#### Returns

The [Schema Markdown Type Model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

---

### schemaValidate

Validate an object to a schema type

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

**typeName -**
The type name

**value -**
The object to validate

#### Returns

The validated object or null if validation fails

---

### schemaValidateTypeModel

Validate a [Schema Markdown Type Model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='') to validate

#### Returns

The validated [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

---

## schemaDoc.bare

The "schemaDoc.bare" include library provides functions for generating documentation for
[schemas](#var.vGroup='schema'). It's particularly useful for defining and documenting options
objects, file formats, and APIs.

Execute the schema documentation application for a Schema Markdown (`.smd`) file:

~~~ bare-script
include <schemaDoc.bare>

schemaDocMain('my-schema.smd', 'My Schema Documentation')
~~~

Generate Markdown documentation for a specific type:

~~~ bare-script
types = schemaParse('struct MyStruct', '    string name')
markdownLines = schemaDocMarkdown(types, 'MyStruct')
markdownPrint(markdownLines)
~~~


### Function Index

- [schemaDocMain](#var.vPublish=true&var.vSingle=true&schemadocmain)
- [schemaDocMarkdown](#var.vPublish=true&var.vSingle=true&schemadocmarkdown)

---

### schemaDocMain

The Schema Markdown documentation viewer main entry point

#### Arguments

**url -**
Optional (default is null). The Schema Markdown text or JSON resource URL. If null, the Schema Markdown type model is displayed.

**title -**
Optional. The schema title.

**hideNoGroup -**
Optional (default is false). If true, hide types with no group.

#### Returns

Nothing

---

### schemaDocMarkdown

Generate the Schema Markdown user type documentation as an array of Markdown text lines

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

**typeName -**
The type name

**options -**
Optional (default is null). The options object with optional members:
- **actionURLs** - The [action URLs](https://craigahobbs.github.io/bare-script/model/#var.vName='ActionURL'&var.vURL='') override
- **actionCustom** - If true, the action has a custom response (default is false)
- **headerPrefix** - The top-level header prefix string (default is "#")
- **hideReferenced** - If true, referenced types are not rendered (default is false)

#### Returns

The array of Markdown text lines

---

## string

String functions provide operations for creating, manipulating, and analyzing text strings. Strings
are sequences of characters enclosed in single or double quotes.

Get string information:

~~~ bare-script
text = 'Hello, World!'
length = stringLength(text)  # 13

# Get character codes
charCode = stringCharCodeAt(text, 0)  # 72 ('H')

# Create string from character codes
fromCode = stringFromCharCode(72, 101, 108, 108, 111)  # 'Hello'
~~~

Search within strings:

~~~ bare-script
# Find first occurrence
index = stringIndexOf(text, 'World')  # 7
notFound = stringIndexOf(text, 'xyz')  # -1

# Find last occurrence
lastIndex = stringLastIndexOf('aa bb aa', 'aa')  # 6

# Check start and end
starts = stringStartsWith(text, 'Hello')  # true
ends = stringEndsWith(text, 'World!')    # true
~~~

Transform strings:

~~~ bare-script
# Case conversion
upper = stringUpper('hello')  # 'HELLO'
lower = stringLower('HELLO')  # 'hello'

# Trim whitespace
trimmed = stringTrim('  hello  ')  # 'hello'

# Repeat strings
repeated = stringRepeat('abc', 3)  # 'abcabcabc'
~~~

Extract and split strings:

~~~ bare-script
# Extract substring
slice = stringSlice(text, 7, 12)  # 'World'

# Split into array
parts = stringSplit('a,b,c', ',')  # ['a', 'b', 'c']
~~~

Replace text:

~~~ bare-script
# Replace all occurrences
replaced = stringReplace('Hello World', 'o', '0')  # 'Hell0 W0rld'
~~~

Create new strings:

~~~ bare-script
# Convert any value to string
str = stringNew(42)  # '42'
str2 = stringNew(true)  # 'true'
~~~

Strings in BareScript support Unicode characters and can be concatenated using the `+` operator:

~~~ bare-script
greeting = 'Hello, ' + 'World!'
message = 'The answer is ' + 42  # Automatic conversion
~~~


### Function Index

- [stringCharCodeAt](#var.vPublish=true&var.vSingle=true&stringcharcodeat)
- [stringEndsWith](#var.vPublish=true&var.vSingle=true&stringendswith)
- [stringFromCharCode](#var.vPublish=true&var.vSingle=true&stringfromcharcode)
- [stringIndexOf](#var.vPublish=true&var.vSingle=true&stringindexof)
- [stringLastIndexOf](#var.vPublish=true&var.vSingle=true&stringlastindexof)
- [stringLength](#var.vPublish=true&var.vSingle=true&stringlength)
- [stringLower](#var.vPublish=true&var.vSingle=true&stringlower)
- [stringNew](#var.vPublish=true&var.vSingle=true&stringnew)
- [stringRepeat](#var.vPublish=true&var.vSingle=true&stringrepeat)
- [stringReplace](#var.vPublish=true&var.vSingle=true&stringreplace)
- [stringSlice](#var.vPublish=true&var.vSingle=true&stringslice)
- [stringSplit](#var.vPublish=true&var.vSingle=true&stringsplit)
- [stringStartsWith](#var.vPublish=true&var.vSingle=true&stringstartswith)
- [stringTrim](#var.vPublish=true&var.vSingle=true&stringtrim)
- [stringUpper](#var.vPublish=true&var.vSingle=true&stringupper)

---

### stringCharCodeAt

Get a string index's character code

#### Arguments

**string -**
The string

**index -**
The character index

#### Returns

The character code

---

### stringEndsWith

Determine if a string ends with a search string

#### Arguments

**string -**
The string

**search -**
The search string

#### Returns

true if the string ends with the search string, false otherwise

---

### stringFromCharCode

Create a string of characters from character codes

#### Arguments

**charCodes... -**
The character codes

#### Returns

The string of characters

---

### stringIndexOf

Find the first index of a search string in a string

#### Arguments

**string -**
The string

**search -**
The search string

**index -**
Optional (default is 0). The index at which to start the search.

#### Returns

The first index of the search string; -1 if not found.

---

### stringLastIndexOf

Find the last index of a search string in a string

#### Arguments

**string -**
The string

**search -**
The search string

**index -**
Optional (default is the end of the string). The index at which to start the search.

#### Returns

The last index of the search string; -1 if not found.

---

### stringLength

Get the length of a string

#### Arguments

**string -**
The string

#### Returns

The string's length; zero if not a string

---

### stringLower

Convert a string to lower-case

#### Arguments

**string -**
The string

#### Returns

The lower-case string

---

### stringNew

Create a new string from a value

#### Arguments

**value -**
The value

#### Returns

The new string

---

### stringRepeat

Repeat a string

#### Arguments

**string -**
The string to repeat

**count -**
The number of times to repeat the string

#### Returns

The repeated string

---

### stringReplace

Replace all instances of a string with another string

#### Arguments

**string -**
The string to update

**substr -**
The string to replace

**newSubstr -**
The replacement string

#### Returns

The updated string

---

### stringSlice

Copy a portion of a string

#### Arguments

**string -**
The string

**start -**
The start index of the slice

**end -**
Optional (default is the end of the string). The end index of the slice.

#### Returns

The new string slice

---

### stringSplit

Split a string

#### Arguments

**string -**
The string to split

**separator -**
The separator string

#### Returns

The array of split-out strings

---

### stringStartsWith

Determine if a string starts with a search string

#### Arguments

**string -**
The string

**search -**
The search string

#### Returns

true if the string starts with the search string, false otherwise

---

### stringTrim

Trim the whitespace from the beginning and end of a string

#### Arguments

**string -**
The string

#### Returns

The trimmed string

---

### stringUpper

Convert a string to upper-case

#### Arguments

**string -**
The string

#### Returns

The upper-case string

---

## system

System functions provide core utilities for type checking, comparison, global variable management,
logging, and HTTP requests.

Logging:

~~~ bare-script
# Always log
systemLog('Application started')

# Log only in debug mode
systemLogDebug('Debug information')
~~~

Global variable management:

~~~ bare-script
# Set a global variable
systemGlobalSet('appConfig', {'debug': true})

# Get a global variable
config = systemGlobalGet('appConfig', {})
~~~

Fetch data from URLs:

~~~ bare-script
# Simple fetch
async function getData():
    response = systemFetch('data.json')
    return jsonParse(response)
endfunction

# Fetch with request options
async function postData():
    request = { \
        'url': 'submitAPI', \
        'body': jsonStringify({'key': 'value'}), \
        'headers': {'Content-Type': 'application/json'} \
    }
    response = systemFetch(request)
    return response
endfunction

# Fetch multiple URLs
async function getMultiple():
    urls = ['data.json', 'data2.json']
    responses = systemFetch(urls)
    return responses
endfunction
~~~

Create partial functions:

~~~ bare-script
# Create a function with pre-filled arguments
add = function(a, b):
    return a + b
endfunction

add5 = systemPartial(add, 5)
result = add5(3)  # Returns 8
~~~

Type checking and comparison:

~~~ bare-script
# Get type of a value
type = systemType([1, 2, 3])  # 'array'

# Check if value is truthy
bool = systemBoolean(0)  # false

# Compare values
cmp = systemCompare(5, 10)  # -1 (less than)

# Test object identity
same = systemIs(obj1, obj2)
~~~


### Function Index

- [systemBoolean](#var.vPublish=true&var.vSingle=true&systemboolean)
- [systemCompare](#var.vPublish=true&var.vSingle=true&systemcompare)
- [systemFetch](#var.vPublish=true&var.vSingle=true&systemfetch)
- [systemGlobalGet](#var.vPublish=true&var.vSingle=true&systemglobalget)
- [systemGlobalIncludesGet](#var.vPublish=true&var.vSingle=true&systemglobalincludesget)
- [systemGlobalIncludesName](#var.vPublish=true&var.vSingle=true&systemglobalincludesname)
- [systemGlobalSet](#var.vPublish=true&var.vSingle=true&systemglobalset)
- [systemIs](#var.vPublish=true&var.vSingle=true&systemis)
- [systemLog](#var.vPublish=true&var.vSingle=true&systemlog)
- [systemLogDebug](#var.vPublish=true&var.vSingle=true&systemlogdebug)
- [systemPartial](#var.vPublish=true&var.vSingle=true&systempartial)
- [systemType](#var.vPublish=true&var.vSingle=true&systemtype)

---

### systemBoolean

Interpret a value as a boolean

#### Arguments

**value -**
The value

#### Returns

true or false

---

### systemCompare

Compare two values

#### Arguments

**left -**
The left value

**right -**
The right value

#### Returns

-1 if the left value is less than the right value, 0 if equal, and 1 if greater than

---

### systemFetch

Retrieve a URL resource

#### Arguments

**url -**
The resource URL,
[request model](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='SystemFetchRequest'),
or array of URL and
[request model](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='SystemFetchRequest')

#### Returns

The response string or array of strings; null if an error occurred

---

### systemGlobalGet

Get a global variable value

#### Arguments

**name -**
The global variable name

**defaultValue -**
The default value (optional)

#### Returns

The global variable's value or null if it does not exist

---

### systemGlobalIncludesGet

Get the global system includes object

#### Arguments

None

#### Returns

The global system includes object

---

### systemGlobalIncludesName

Get the system includes object global variable name

#### Arguments

None

#### Returns

The system includes object global variable name

---

### systemGlobalSet

Set a global variable value

#### Arguments

**name -**
The global variable name

**value -**
The global variable's value

#### Returns

The global variable's value

---

### systemIs

Test if one value is the same object as another

#### Arguments

**value1 -**
The first value

**value2 -**
The second value

#### Returns

true if values are the same object, false otherwise

---

### systemLog

Log a message to the console

#### Arguments

**message -**
The log message

#### Returns

Nothing

---

### systemLogDebug

Log a message to the console, if in debug mode

#### Arguments

**message -**
The log message

#### Returns

Nothing

---

### systemPartial

Return a new function which behaves like "func" called with "args".
If additional arguments are passed to the returned function, they are appended to "args".

#### Arguments

**func -**
The function

**args... -**
The function arguments

#### Returns

The new function called with "args"

---

### systemType

Get a value's type string

#### Arguments

**value -**
The value

#### Returns

The type string of the value.
Valid values are: 'array', 'boolean', 'datetime', 'function', 'null', 'number', 'object', 'regex', 'string'.

---

## unittest.bare

The "unittest.bare" include library contains functions for unit testing code. The typical project
layout is as follows:

~~~
|-- code1.bare
`-- test
    |-- runTests.md
    |-- runTests.bare
    `-- testCode1.bare
~~~

**runTests.md**

The "runTests.md" file is a Markdown document that includes (and executes) the "runTests.bare" unit
test application.

``` bare-script
~~~ markdown-script
include 'runTests.bare'
~~~
```

**runTests.bare**

The "runTests.bare" is the unit test application. It first includes the "unittest.bare" include
library and then includes (and executes) the unit test include files. There can be any number of
test include files. It then renders the unit test report using the [unittestReport](#unittestreport)
function and returns the number of unit test failures.

~~~ bare-script
include <unittest.bare>

# Start coverage
coverageStart()

# Test includes
include 'testCode1.bare'

# Stop coverage
coverageStop()

# Test report
return unittestReport({'coverageMin': 100})
~~~

**testCode1.bare**

The test include files contain unit tests for each code include. The test include files execute
tests using the [unittestRunTest](#unittestruntest) function. Individual tests assert success and
failure using the [unittestEqual](#unittestequal) and [unittestDeepEqual](#unittestdeepequal)
functions.

~~~ bare-script
include '../code1.bare'

function testCode1SumNumbers():
    unittestEqual(sumNumbers(1, 2, 3), 6)
endfunction
unittestRunTest('testCode1SumNumbers')

function testCode1SumNumberArrays():
    unittestDeepEqual( \
        sumNumberArrays([1, 2, 3], [4, 5, 6]), \
        [6, 15] \
    )
endfunction
unittestRunTest('testCode1SumNumberArrays')
~~~

## Running Unit Tests on the Command Line

Unit tests may be run on the command line using the
[BareScript CLI](https://github.com/craigahobbs/bare-script#the-barescript-command-line-interface-cli)
and its `-m` argument.

~~~
bare -m test/runTests.bare
~~~

The "runTests.bare" application returns an error status if there are any failures.


### Function Index

- [unittestDeepEqual](#var.vPublish=true&var.vSingle=true&unittestdeepequal)
- [unittestEqual](#var.vPublish=true&var.vSingle=true&unittestequal)
- [unittestReport](#var.vPublish=true&var.vSingle=true&unittestreport)
- [unittestRunTest](#var.vPublish=true&var.vSingle=true&unittestruntest)

---

### unittestDeepEqual

Assert an actual value is *deeply* equal to the expected value

#### Arguments

**actual -**
The actual value

**expected -**
The expected value

**description -**
The description of the assertion

#### Returns

Nothing

---

### unittestEqual

Assert an actual value is equal to the expected value

#### Arguments

**actual -**
The actual value

**expected -**
The expected value

**description -**
The description of the assertion

#### Returns

Nothing

---

### unittestReport

Render the unit test report

#### Arguments

**options -**
Optional unittest report options object. The following options are available:
- **coverageExclude** - array of script names to exclude from coverage
- **coverageMin** - verify minimum coverage percent (0 - 100)
- **links** - the array of page links
- **title** - the page title

#### Returns

The number of unit test failures

---

### unittestRunTest

Run a unit test

#### Arguments

**testName -**
The test function name

#### Returns

Nothing

---

## unittestMock.bare

The "unittestMock.bare" include library contains functions for mocking functions for unit testing.
Consider the following MarkdownUp application:

**app.bare**

~~~ bare-script
function appMain(count):
    title = 'My Application'
    documentSetTitle(title)
    markdownPrint('# ' + markdownEscape(title))
    i = 0
    while i < count:
        markdownPrint('', '- ' + i)
        i = i + 1
    endwhile
endfunction
~~~

The
[documentSetTitle](https://craigahobbs.github.io/bare-script/library/#var.vGroup='markdownUp.bare%3A%20document'&documentsettitle)
function and the
[markdownPrint](https://craigahobbs.github.io/bare-script/library/#var.vGroup='markdownUp.bare%3A%20markdown'&markdownprint)
function have external side-effects that will interfere with running our unit tests.

To test this code, first call the [unittestMockAll](#unittestmockall) function at the beginning of
your test function to mock all
[BareScript library](https://craigahobbs.github.io/bare-script/library/)
functions. At the end of the test function, we stop mocking by calling the
[unittestMockEnd](#unittestmockend) function and check the mocked function calls using the
[unittestDeepEqual](#var.vGroup='unittest.bare'&unittestdeepequal) function.

**runTests.bare**

~~~ bare-script
include <unittest.bare>
include <unittestMock.bare>

# Start coverage
coverageStart()

# Test includes
include 'testApp.bare'

# Stop coverage
coverageStop()

return unittestReport({'coverageMin': 100})
~~~

**testApp.bare**

~~~ bare-script
include 'app.bare'

function testApp():
    unittestMockAll()

    # Run the application
    appMain(3)

    unittestDeepEqual( \
        unittestMockEnd(), \
        [ \
            ['documentSetTitle', ['My Application']], \
            ['markdownPrint', ['# My Application']], \
            ['markdownPrint', ['','- 0']], \
            ['markdownPrint', ['','- 1']], \
            ['markdownPrint', ['','- 2']] \
        ] \
    )
endfunction
unittestRunTest('testApp')
~~~


### Function Index

- [unittestMockAll](#var.vPublish=true&var.vSingle=true&unittestmockall)
- [unittestMockEnd](#var.vPublish=true&var.vSingle=true&unittestmockend)
- [unittestMockOne](#var.vPublish=true&var.vSingle=true&unittestmockone)
- [unittestMockOneGeneric](#var.vPublish=true&var.vSingle=true&unittestmockonegeneric)

---

### unittestMockAll

Start mocking all BareScript and MarkdownUp library functions with externalities.
To stop mocking, call the [unittestMockEnd](#var.vGroup='unittestMock.bare'&unittestmockend) function.

#### Arguments

**data -**
Optional (default is null). The map of function name to mock function data.
The following functions make use of mock data:
- **documentInputValue** - map of id to return value
- **markdownElements** - array of return values
- **markdownParse** - array of return values
- **markdownTitle** - array of return values
- **systemFetch** - map of URL to response text

#### Returns

Nothing

---

### unittestMockEnd

Stop all function mocks

#### Arguments

None

#### Returns

The array of mock function call tuples of the form (function name, function argument array)

---

### unittestMockOne

Start a function mock.
To stop mocking, call the [unittestMockEnd](#var.vGroup='unittestMock.bare'&unittestmockend) function.

#### Arguments

**funcName -**
The name of the function to mock

**mockFunc -**
The mock function

#### Returns

Nothing

---

### unittestMockOneGeneric

Start a generic function mock.
To stop mocking, call the [unittestMockEnd](#var.vGroup='unittestMock.bare'&unittestmockend) function.

#### Arguments

**funcName -**
The name of the function to mock

#### Returns

Nothing

---

## url

URL functions provide operations for encoding URLs and URL components. These functions ensure that
special characters in URLs are properly escaped for use in web requests and links.

Encode a complete URL:

~~~ bare-script
url = 'path?param=value with spaces'
encoded = urlEncode(url)
~~~

Encode a URL component (query parameter, path segment, etc.):

~~~ bare-script
# Build a URL with encoded parameters
baseUrl = 'search'
query = urlEncodeComponent('term with spaces')
fullUrl = baseUrl + '?q=' + query
~~~


### Function Index

- [urlEncode](#var.vPublish=true&var.vSingle=true&urlencode)
- [urlEncodeComponent](#var.vPublish=true&var.vSingle=true&urlencodecomponent)

---

### urlEncode

Encode a URL

#### Arguments

**url -**
The URL string

#### Returns

The encoded URL string

---

### urlEncodeComponent

Encode a URL component

#### Arguments

**url -**
The URL component string

#### Returns

The encoded URL component string
