# The BareScript Library

Welcome to the [BareScript](https://craigahobbs.github.io/bare-script/language/) library
documentation. The **Builtin Functions** are global functions available to every script. The
**Include Functions** are the include libraries, loaded with the
[include statement](https://craigahobbs.github.io/bare-script/language/#include-statements).

Library functions validate their arguments and return `null` (or a documented default value)
rather than raising an error. In
[debug mode](https://craigahobbs.github.io/markdown-up/#debug-mode), a detailed error message is
logged for each invalid-argument failure.


## Builtin Functions

|  |  |
| --- | --- |
| [array](#var.vPublish=true&var.vSingle=true&array) | Create, manipulate, and query arrays |
| [barescript](#var.vPublish=true&var.vSingle=true&barescript) | Evaluate BareScript expression models |
| [datetime](#var.vPublish=true&var.vSingle=true&datetime) | Create and manipulate date/time values |
| [json](#var.vPublish=true&var.vSingle=true&json) | Parse and serialize JSON |
| [math](#var.vPublish=true&var.vSingle=true&math) | Mathematical operations and constants |
| [number](#var.vPublish=true&var.vSingle=true&number) | Parse and format numbers |
| [object](#var.vPublish=true&var.vSingle=true&object) | Create, manipulate, and query objects |
| [regex](#var.vPublish=true&var.vSingle=true&regex) | Compile and apply regular expressions |
| [string](#var.vPublish=true&var.vSingle=true&string) | Search, slice, and transform strings |
| [system](#var.vPublish=true&var.vSingle=true&system) | Runtime, fetch, logging, and global functions |

## Include Functions

|  |  |
| --- | --- |
| [args.bare](#var.vPublish=true&var.vSingle=true&args-bare) | Parse global arguments and build application links |
| [baredoc.bare](#var.vPublish=true&var.vSingle=true&baredoc-bare) | The BareScript library documentation application |
| [baredocCLI.bare](#var.vPublish=true&var.vSingle=true&baredoccli-bare) | Generate library documentation models from source files |
| [barescriptLint.bare](#var.vPublish=true&var.vSingle=true&barescriptlint-bare) | Lint BareScript models |
| [barescriptModel.bare](#var.vPublish=true&var.vSingle=true&barescriptmodel-bare) | The BareScript type model and model validation |
| [barescriptParser.bare](#var.vPublish=true&var.vSingle=true&barescriptparser-bare) | Parse BareScript text into BareScript models |
| [base64.bare](#var.vPublish=true&var.vSingle=true&base64-bare) | Encode and decode base64 text |
| [data.bare](#var.vPublish=true&var.vSingle=true&data-bare) | Filter, sort, aggregate, and join tabular data |
| [dataLineChart.bare](#var.vPublish=true&var.vSingle=true&datalinechart-bare) | Render tabular data as line charts |
| [dataTable.bare](#var.vPublish=true&var.vSingle=true&datatable-bare) | Render tabular data as tables |
| [diff.bare](#var.vPublish=true&var.vSingle=true&diff-bare) | Compute line diffs between strings or arrays |
| [draw.bare](#var.vPublish=true&var.vSingle=true&draw-bare) | Draw SVG images |
| [elementModel.bare](#var.vPublish=true&var.vSingle=true&elementmodel-bare) | Validate element models and render them as HTML or SVG text |
| [forms.bare](#var.vPublish=true&var.vSingle=true&forms-bare) | Web forms and controls element model helpers |
| [gzip.bare](#var.vPublish=true&var.vSingle=true&gzip-bare) | Compress and uncompress gzip data |
| [markdown.bare](#var.vPublish=true&var.vSingle=true&markdown-bare) | Markdown escaping, header IDs, and utilities |
| [markdownElements.bare](#var.vPublish=true&var.vSingle=true&markdownelements-bare) | Convert a Markdown model to an element model |
| [markdownParser.bare](#var.vPublish=true&var.vSingle=true&markdownparser-bare) | Parse Markdown text into a Markdown model |
| [markdownString.bare](#var.vPublish=true&var.vSingle=true&markdownstring-bare) | Render a Markdown model as Markdown text |
| [markdownUp.bare](#var.vPublish=true&var.vSingle=true&markdownup-bare) | The MarkdownUp runtime functions, with stub implementations for the bare CLI |
| [pager.bare](#var.vPublish=true&var.vSingle=true&pager-bare) | Multi-page MarkdownUp application shell |
| [qrcode.bare](#var.vPublish=true&var.vSingle=true&qrcode-bare) | Render QR codes |
| [schema.bare](#var.vPublish=true&var.vSingle=true&schema-bare) | Validate values with Schema Markdown type models |
| [schemaDoc.bare](#var.vPublish=true&var.vSingle=true&schemadoc-bare) | Schema Markdown documentation application |
| [schemaParser.bare](#var.vPublish=true&var.vSingle=true&schemaparser-bare) | Parse Schema Markdown text into type models |
| [schemaTypeModel.bare](#var.vPublish=true&var.vSingle=true&schematypemodel-bare) | The Schema Markdown type model and type model validation |
| [tar.bare](#var.vPublish=true&var.vSingle=true&tar-bare) | Create and extract tar archives |
| [unittest.bare](#var.vPublish=true&var.vSingle=true&unittest-bare) | Unit test framework |
| [unittestMock.bare](#var.vPublish=true&var.vSingle=true&unittestmock-bare) | Mock library functions during unit tests |
| [url.bare](#var.vPublish=true&var.vSingle=true&url-bare) | Encode and decode URLs, URL components, and query strings |

---

## array

Arrays are ordered, zero-indexed lists of values, created with array literals (`[1, 2, 3]`). Arrays
are shared by reference, and the functions that modify an array - such as
[arrayPush](#var.vGroup='array'&arraypush), [arraySet](#var.vGroup='array'&arrayset), and
[arraySort](#var.vGroup='array'&arraysort) - change it in place. Use
[arrayCopy](#var.vGroup='array'&arraycopy) for an independent copy.


---

### arrayCopy

`arrayCopy(array)`

Create a copy of an array

#### Arguments

**array -**
The array to copy

#### Returns

The array copy

---

### arrayDelete

`arrayDelete(array, index)`

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

`arrayExtend(array, array2)`

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

`arrayFlat(array, depth = 10)`

Flatten an array hierarchy

#### Arguments

**array -**
The array to flatten

**depth** (optional, default `10`) **-**
The maximum depth of the array hierarchy

#### Returns

The flattened array

---

### arrayGet

`arrayGet(array, index)`

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

`arrayIndexOf(array, value, index = 0)`

Find the index of a value in an array. For example:

```bare-script
ixValue = arrayIndexOf([5, -3, 7], -3)
# ixValue is 1

function isNegative(value):
    return value < 0
endfunction
ixNegative = arrayIndexOf([5, -3, 7], isNegative)
# ixNegative is 1
```

#### Arguments

**array -**
The array

**value -**
The value to find in the array, or a match function, f(value) -> bool

**index** (optional, default `0`) **-**
The index at which to start the search

#### Returns

The first index of the value in the array; -1 if not found

---

### arrayJoin

`arrayJoin(array, separator)`

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

`arrayLastIndexOf(array, value, index = null)`

Find the last index of a value in an array

#### Arguments

**array -**
The array

**value -**
The value to find in the array, or a match function, f(value) -> bool

**index** (optional) **-**
The index at which to start the search. The default is the end of the array.

#### Returns

The last index of the value in the array; -1 if not found

---

### arrayLength

`arrayLength(array)`

Get the length of an array

#### Arguments

**array -**
The array

#### Returns

The array's length; zero if not an array

---

### arrayNew

`arrayNew(values...)`

Create a new array

#### Arguments

**values... -**
The new array's values

#### Returns

The new array

---

### arrayNewSize

`arrayNewSize(size = 0, value = 0)`

Create a new array of a specific size

#### Arguments

**size** (optional, default `0`) **-**
The new array's size

**value** (optional, default `0`) **-**
The value with which to fill the new array

#### Returns

The new array

---

### arrayPop

`arrayPop(array)`

Remove the last element of the array and return it

#### Arguments

**array -**
The array

#### Returns

The last element of the array; null if the array is empty

---

### arrayPush

`arrayPush(array, values...)`

Add one or more values to the end of the array

#### Arguments

**array -**
The array

**values... -**
The values to add to the end of the array

#### Returns

The array

---

### arrayReverse

`arrayReverse(array)`

Reverse an array in place

#### Arguments

**array -**
The array

#### Returns

The reversed array

---

### arraySet

`arraySet(array, index, value)`

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

`arrayShift(array)`

Remove the first element of the array and return it

#### Arguments

**array -**
The array

#### Returns

The first element of the array; null if the array is empty

---

### arraySlice

`arraySlice(array, start = 0, end = null)`

Copy a portion of an array. For example:

```bare-script
numbers = [1, 2, 3, 4, 5]
middle = arraySlice(numbers, 1, 3)
# middle is [2, 3]

rest = arraySlice(numbers, 2)
# rest is [3, 4, 5]
```

#### Arguments

**array -**
The array

**start** (optional, default `0`) **-**
The start index of the slice. Negative indexes are invalid.

**end** (optional) **-**
The end index of the slice. The default is the end of the array.

#### Returns

The new array slice

---

### arraySort

`arraySort(array, compareFn = null)`

Sort an array in place. For example:

```bare-script
numbers = [3, 1, 4]
arraySort(numbers)
# numbers is [1, 3, 4]

function compareDesc(a, b):
    return b - a
endfunction
arraySort(numbers, compareDesc)
# numbers is [4, 3, 1]
```

#### Arguments

**array -**
The array

**compareFn** (optional, default `null`) **-**
The comparison function, f(a, b) -> number -
negative if "a" sorts first, positive if "b" sorts first, zero if equal

#### Returns

The sorted array

---

## barescript

The "barescript" library evaluates BareScript expression models. To parse expression text into an
expression model, use the
[barescriptParseExpression](#var.vGroup='barescriptParser.bare'&barescriptparseexpression) function
of the "barescriptParser.bare" include library:

```bare-script
include <barescriptParser.bare>

expr = barescriptParseExpression('5 * N')
result = barescriptEvaluateExpression(expr, {'N': 10})
# result is 50
```


---

### barescriptEvaluateExpression

`barescriptEvaluateExpression(expr, locals = null, builtins = true)`

Evaluate a [BareScript expression model](../model/#var.vName='Expression')

#### Arguments

**expr -**
The [BareScript expression model](../model/#var.vName='Expression')

**locals** (optional, default `null`) **-**
The local variables object

**builtins** (optional, default `true`) **-**
If true, include the [built-in expression functions](expression.html)

#### Returns

The expression result

---

## datetime

Datetime values represent moments in time. There is no datetime literal - create datetimes with
[datetimeNew](#var.vGroup='datetime'&datetimenew), [datetimeNow](#var.vGroup='datetime'&datetimenow),
[datetimeToday](#var.vGroup='datetime'&datetimetoday), or
[datetimeISOParse](#var.vGroup='datetime'&datetimeisoparse).

Datetimes are **local time**: `datetimeNew` takes local-time components, the accessor functions
(`datetimeYear`, `datetimeHour`, etc.) return local-time components, and `datetimeISOFormat` formats
with the local UTC offset. `datetimeISOParse` accepts any UTC offset.

Datetime arithmetic is in milliseconds. Adding a number to a datetime returns a new datetime, and
subtracting two datetimes returns the difference in milliseconds:

```bare-script
start = datetimeNew(2024, 1, 15, 14, 30)
end = start + 90 * 60 * 1000
minutes = (end - start) / (60 * 1000)
# minutes is 90
```


---

### datetimeDay

`datetimeDay(datetime)`

Get the day of the month of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The day of the month

---

### datetimeHour

`datetimeHour(datetime)`

Get the hour of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The hour

---

### datetimeISOFormat

`datetimeISOFormat(datetime, isDate = false)`

Format the datetime as an ISO date/time string. For example:

```bare-script
d = datetimeNew(2026, 8, 6, 7, 30)
date = datetimeISOFormat(d, true)
# date is '2026-08-06'
```

#### Arguments

**datetime -**
The datetime

**isDate** (optional, default `false`) **-**
If true, format the datetime as an ISO date

#### Returns

The formatted datetime string

---

### datetimeISOParse

`datetimeISOParse(string)`

Parse an ISO date/time string. For example:

```bare-script
d = datetimeISOParse('2026-08-06T07:30:00Z')
year = datetimeYear(d)
```

#### Arguments

**string -**
The ISO date/time string

#### Returns

The datetime, or null if parsing fails

---

### datetimeMillisecond

`datetimeMillisecond(datetime)`

Get the millisecond of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The millisecond

---

### datetimeMinute

`datetimeMinute(datetime)`

Get the minute of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The minute

---

### datetimeMonth

`datetimeMonth(datetime)`

Get the month (1-12) of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The month

---

### datetimeNew

`datetimeNew(year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0)`

Create a new datetime

#### Arguments

**year -**
The full year

**month -**
The month (1-12)

**day -**
The day of the month

**hour** (optional, default `0`) **-**
The hour (0-23)

**minute** (optional, default `0`) **-**
The minute

**second** (optional, default `0`) **-**
The second

**millisecond** (optional, default `0`) **-**
The millisecond

#### Returns

The new datetime

---

### datetimeNow

`datetimeNow()`

Get the current datetime

#### Arguments

None

#### Returns

The current datetime

---

### datetimeSecond

`datetimeSecond(datetime)`

Get the second of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The second

---

### datetimeToday

`datetimeToday()`

Get today's date - the current datetime at midnight, local time

#### Arguments

None

#### Returns

Today's datetime

---

### datetimeYear

`datetimeYear(datetime)`

Get the full year of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The full year

---

## json

JSON functions convert between JSON text and BareScript values.


---

### jsonParse

`jsonParse(string)`

Convert a JSON string to an object

#### Arguments

**string -**
The JSON string

#### Returns

The object

---

### jsonStringify

`jsonStringify(value, indent = null)`

Convert an object to a JSON string. Object keys are serialized in sorted order. For example:

```bare-script
json = jsonStringify({'b': 2, 'a': 1})
# json is '{"a":1,"b":2}'

pretty = jsonStringify({'a': 1}, 4)
# pretty is '{\n    "a": 1\n}'
```

#### Arguments

**value -**
The object

**indent** (optional, default `null`) **-**
The indentation number

#### Returns

The JSON string

---

## math

Math functions provide standard mathematical operations and constants. Trigonometric angles are in
radians - convert from degrees with `degrees * mathPi() / 180`.


---

### mathAbs

`mathAbs(x)`

Compute the absolute value of a number

#### Arguments

**x -**
The number

#### Returns

The absolute value of the number

---

### mathAcos

`mathAcos(x)`

Compute the arccosine, in radians, of a number

#### Arguments

**x -**
The number, -1 to 1

#### Returns

The arccosine, in radians, of the number

---

### mathAsin

`mathAsin(x)`

Compute the arcsine, in radians, of a number

#### Arguments

**x -**
The number, -1 to 1

#### Returns

The arcsine, in radians, of the number

---

### mathAtan

`mathAtan(x)`

Compute the arctangent, in radians, of a number

#### Arguments

**x -**
The number

#### Returns

The arctangent, in radians, of the number

---

### mathAtan2

`mathAtan2(y, x)`

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

`mathCeil(x)`

Compute the ceiling of a number (round up to the next highest integer)

#### Arguments

**x -**
The number

#### Returns

The ceiling of the number

---

### mathCos

`mathCos(x)`

Compute the cosine of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The cosine of the angle

---

### mathE

`mathE()`

Return Euler's number

#### Arguments

None

#### Returns

Euler's number

---

### mathFloor

`mathFloor(x)`

Compute the floor of a number (round down to the next lowest integer)

#### Arguments

**x -**
The number

#### Returns

The floor of the number

---

### mathLn

`mathLn(x)`

Compute the natural logarithm (base e) of a number

#### Arguments

**x -**
The number, greater than 0

#### Returns

The natural logarithm of the number

---

### mathLog

`mathLog(x, base = 10)`

Compute the logarithm of a number

#### Arguments

**x -**
The number, greater than 0

**base** (optional, default `10`) **-**
The logarithm base, greater than 0 and not 1

#### Returns

The logarithm of the number

---

### mathMax

`mathMax(values...)`

Compute the maximum value

#### Arguments

**values... -**
The values

#### Returns

The maximum value

---

### mathMin

`mathMin(values...)`

Compute the minimum value

#### Arguments

**values... -**
The values

#### Returns

The minimum value

---

### mathPi

`mathPi()`

Return the number pi

#### Arguments

None

#### Returns

The number pi

---

### mathRandom

`mathRandom()`

Compute a random number between 0 and 1, inclusive

#### Arguments

None

#### Returns

A random number

---

### mathRound

`mathRound(x, digits = 0)`

Round a number to a certain number of decimal places

#### Arguments

**x -**
The number

**digits** (optional, default `0`) **-**
The number of decimal digits to round to

#### Returns

The rounded number

---

### mathSign

`mathSign(x)`

Compute the sign of a number

#### Arguments

**x -**
The number

#### Returns

-1 for a negative number, 1 for a positive number, and 0 for zero

---

### mathSin

`mathSin(x)`

Compute the sine of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The sine of the angle

---

### mathSqrt

`mathSqrt(x)`

Compute the square root of a number

#### Arguments

**x -**
The number, 0 or greater

#### Returns

The square root of the number

---

### mathTan

`mathTan(x)`

Compute the tangent of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The tangent of the angle

---

## number

Number functions parse strings as numbers and format numbers as strings. The parse functions return
null if the string is not a number.


---

### numberParseFloat

`numberParseFloat(string)`

Parse a string as a floating point number

#### Arguments

**string -**
The string

#### Returns

The number

---

### numberParseInt

`numberParseInt(string, radix = 10)`

Parse a string as an integer

#### Arguments

**string -**
The string

**radix** (optional, default `10`) **-**
The number base

#### Returns

The integer

---

### numberToFixed

`numberToFixed(x, digits = 2, trim = false)`

Format a number using fixed-point notation

#### Arguments

**x -**
The number

**digits** (optional, default `2`) **-**
The number of digits to appear after the decimal point

**trim** (optional, default `false`) **-**
If true, trim trailing zeroes and decimal point

#### Returns

The fixed-point notation string

---

### numberToString

`numberToString(x, radix = 10)`

Convert an integer to a string

#### Arguments

**x -**
The integer

**radix** (optional, default `10`) **-**
The number base

#### Returns

The integer as a string of the given base

---

## object

Objects are collections of string keys and their values, created with object literals
(`{'a': 1, 'b': 2}`). Objects are shared by reference, and
[objectSet](#var.vGroup='object'&objectset), [objectAssign](#var.vGroup='object'&objectassign), and
[objectDelete](#var.vGroup='object'&objectdelete) change them in place. Use
[objectCopy](#var.vGroup='object'&objectcopy) for an independent copy.


---

### objectAssign

`objectAssign(object, object2)`

Assign the keys/values of one object to another. For example:

```bare-script
person = {'name': 'Alice'}
objectAssign(person, {'age': 30})
# person is {'age': 30, 'name': 'Alice'}
```

#### Arguments

**object -**
The object to assign to

**object2 -**
The object to assign

#### Returns

The updated object

---

### objectCopy

`objectCopy(object)`

Create a copy of an object

#### Arguments

**object -**
The object to copy

#### Returns

The object copy

---

### objectDelete

`objectDelete(object, key)`

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

`objectGet(object, key, defaultValue = null)`

Get an object key's value

#### Arguments

**object -**
The object

**key -**
The key

**defaultValue** (optional, default `null`) **-**
The default value

#### Returns

The value, or the default value if the key does not exist

---

### objectHas

`objectHas(object, key)`

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

`objectKeys(object)`

Get an object's keys

#### Arguments

**object -**
The object

#### Returns

The array of keys

---

### objectNew

`objectNew(keyValues...)`

Create a new object

#### Arguments

**keyValues... -**
The object's initial key and value pairs

#### Returns

The new object

---

### objectSet

`objectSet(object, key, value)`

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

## regex

Create a regular expression with [regexNew](#var.vGroup='regex'&regexnew), then use it with the
match, replace, and split functions. Patterns use the
[JavaScript regular expression syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#writing_a_regular_expression_pattern).
A backslash in a string literal must be escaped, so the pattern `\d+` is written `'\\d+'`. To
match literal text, escape it with [regexEscape](#var.vGroup='regex'&regexescape).

```bare-script
match = regexMatch(regexNew('\\$([0-9]+)'), 'Price: $10')
amount = objectGet(objectGet(match, 'groups'), '1')
# amount is '10'
```


---

### regexEscape

`regexEscape(string)`

Escape a string for use in a regular expression

#### Arguments

**string -**
The string to escape

#### Returns

The escaped string

---

### regexMatch

`regexMatch(regex, string)`

Find the first match of a regular expression in a string. For example:

```bare-script
match = regexMatch(regexNew('(?<year>[0-9]{4})-[0-9]{2}'), '2026-08-06')
year = objectGet(objectGet(match, 'groups'), 'year')
# year is '2026'
```

#### Arguments

**regex -**
The regular expression

**string -**
The string

#### Returns

The match object, or null if no matches are found.
The match object contains the following members:
- **index** - the zero-based index of the match in the input string
- **input** - the input string
- **groups** - the matched groups. The "0" key is the full match text. Ordered (non-named) groups use keys "1", "2", and so on.

---

### regexMatchAll

`regexMatchAll(regex, string)`

Find all matches of regular expression in a string. For example:

```bare-script
keys = []
for match in regexMatchAll(regexNew('([a-z]+)=([0-9]+)'), 'a=1, b=22'):
    arrayPush(keys, objectGet(objectGet(match, 'groups'), '1'))
endfor
# keys is ['a', 'b']
```

#### Arguments

**regex -**
The regular expression

**string -**
The string

#### Returns

The array of match objects (see the [regexMatch](#var.vGroup='regex'&regexmatch) function)

---

### regexNew

`regexNew(pattern, flags = null)`

Create a regular expression

#### Arguments

**pattern -**
The [regular expression pattern string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#writing_a_regular_expression_pattern)

**flags** (optional, default `null`) **-**
The regular expression flags. The string may contain the following characters:
- **i** - case-insensitive search
- **m** - multi-line search - "^" and "$" matches next to newline characters
- **s** - "." matches newline characters

#### Returns

The regular expression or null if the pattern is invalid

---

### regexReplace

`regexReplace(regex, string, substr)`

Replace regular expression matches with a string. For example:

```bare-script
result = regexReplace(regexNew('(\\w+) (\\w+)'), 'John Smith', '$2, $1')
# result is 'Smith, John'
```

#### Arguments

**regex -**
The replacement regular expression

**string -**
The string

**substr -**
The replacement string. Use "$1", "$2", ... to insert numbered match groups.

#### Returns

The updated string

---

### regexSplit

`regexSplit(regex, string)`

Split a string with a regular expression. For example:

```bare-script
parts = regexSplit(regexNew('\\s*,\\s*'), 'a, b ,c')
# parts is ['a', 'b', 'c']
```

#### Arguments

**regex -**
The regular expression

**string -**
The string

#### Returns

The array of split parts

---

## string

Strings are immutable - string functions return new strings. String indexes are zero-based. The `+`
operator concatenates strings, converting a non-string operand to a string:

```bare-script
message = 'The answer is ' + 42
# message is 'The answer is 42'
```


---

### stringCharAt

`stringCharAt(string, index)`

Get the character of a string at an index

#### Arguments

**string -**
The string

**index -**
The index of the character

#### Returns

The character string

---

### stringCharCodeAt

`stringCharCodeAt(string, index)`

Get a string index's character code

#### Arguments

**string -**
The string

**index -**
The character index

#### Returns

The character code

---

### stringDecode

`stringDecode(bytes)`

Decode a UTF-8 byte value array to a string

#### Arguments

**bytes -**
The UTF-8 byte array

#### Returns

The string, or null if the byte array is not valid UTF-8

---

### stringEncode

`stringEncode(string)`

Encode a string as a UTF-8 byte value array

#### Arguments

**string -**
The string

#### Returns

The UTF-8 byte array

---

### stringEndsWith

`stringEndsWith(string, search)`

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

`stringFromCharCode(charCodes...)`

Create a string of characters from character codes

#### Arguments

**charCodes... -**
The character codes

#### Returns

The string of characters

---

### stringIndexOf

`stringIndexOf(string, search, index = 0)`

Find the first index of a search string in a string

#### Arguments

**string -**
The string

**search -**
The search string

**index** (optional, default `0`) **-**
The index at which to start the search

#### Returns

The first index of the search string; -1 if not found

---

### stringLastIndexOf

`stringLastIndexOf(string, search, index = null)`

Find the last index of a search string in a string

#### Arguments

**string -**
The string

**search -**
The search string

**index** (optional) **-**
The index at which to start the search. The default is the end of the string.

#### Returns

The last index of the search string; -1 if not found

---

### stringLength

`stringLength(string)`

Get the length of a string

#### Arguments

**string -**
The string

#### Returns

The string's length; zero if not a string

---

### stringLower

`stringLower(string)`

Convert a string to lower-case

#### Arguments

**string -**
The string

#### Returns

The lower-case string

---

### stringNew

`stringNew(value)`

Create a new string from a value

#### Arguments

**value -**
The value

#### Returns

The new string

---

### stringRepeat

`stringRepeat(string, count)`

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

`stringReplace(string, substr, newSubstr)`

Replace all instances of a string with another string. For example:

```bare-script
result = stringReplace('a-a-a', '-', '+')
# result is 'a+a+a'
```

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

`stringSlice(string, start, end = null)`

Copy a portion of a string

#### Arguments

**string -**
The string

**start -**
The start index of the slice

**end** (optional) **-**
The end index of the slice. The default is the end of the string.

#### Returns

The new string slice

---

### stringSplit

`stringSplit(string, separator)`

Split a string. For example:

```bare-script
parts = stringSplit('a,b,c', ',')
# parts is ['a', 'b', 'c']
```

#### Arguments

**string -**
The string to split

**separator -**
The separator string

#### Returns

The array of split-out strings

---

### stringSplitLines

`stringSplitLines(string)`

Split a string at line boundaries

#### Arguments

**string -**
The string to split

#### Returns

The array of line strings

---

### stringStartsWith

`stringStartsWith(string, search)`

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

`stringTrim(string)`

Trim the whitespace from the beginning and end of a string

#### Arguments

**string -**
The string

#### Returns

The trimmed string

---

### stringUpper

`stringUpper(string)`

Convert a string to upper-case

#### Arguments

**string -**
The string

#### Returns

The upper-case string

---

## system

System functions provide logging, global variable access, value type and comparison functions,
partial function application, and resource fetching.

An assignment within a function creates a local variable, even if a global of that name exists. To
update a global variable from within a function, use
[systemGlobalSet](#var.vGroup='system'&systemglobalset). See
[Variable Scope and Globals](https://craigahobbs.github.io/bare-script/language/#variable-scope-and-globals).


---

### systemBoolean

`systemBoolean(value)`

Interpret a value as a boolean

#### Arguments

**value -**
The value

#### Returns

true or false

---

### systemCompare

`systemCompare(left, right)`

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

`systemFetch(url)`

**async** - The calling function must be declared with "async function"

Retrieve a URL resource. Pass an array of URLs (or request models) to fetch in parallel
and receive an array of responses. In the BareScript CLI, non-URL paths are read
from (or, with a request body, written to) the local file system. For example:

```bare-script
async function getLibraryCount(url):
    return arrayLength(objectGet(jsonParse(systemFetch(url)), 'functions'))
endfunction
```

To send a request body or headers, pass a request model:

```bare-script
async function saveJSON(url, value):
    return systemFetch({'url': url, 'body': jsonStringify(value), 'headers': {'Content-Type': 'application/json'}})
endfunction
```

#### Arguments

**url -**
The resource URL, request model, or array of URL and request model.
The request model is an object with the following members:
- **url** - the resource URL
- **body** - the optional request body string or byte value array
- **headers** - the optional request headers (an object of string values)
- **binary** - if true, the response is a byte value array (default is false)

#### Returns

The response string (or byte value array) or array of responses; null if an error occurred

---

### systemGlobalGet

`systemGlobalGet(name, defaultValue = null)`

Get a global variable value

#### Arguments

**name -**
The global variable name

**defaultValue** (optional, default `null`) **-**
The default value

#### Returns

The global variable's value, or the default value if it does not exist

---

### systemGlobalSet

`systemGlobalSet(name, value)`

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

`systemIs(value1, value2)`

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

`systemLog(message)`

Log a message to the console

#### Arguments

**message -**
The log message

#### Returns

Nothing

---

### systemLogDebug

`systemLogDebug(message)`

Log a message to the console, if in debug mode

#### Arguments

**message -**
The log message

#### Returns

Nothing

---

### systemPartial

`systemPartial(func, args...)`

Return a new function which behaves like "func" called with "args".
If additional arguments are passed to the returned function, they are appended to "args". For example:

```bare-script
function addNumbers(a, b):
    return a + b
endfunction

addTen = systemPartial(addNumbers, 10)
result = addTen(5)
# result is 15
```

#### Arguments

**func -**
The function

**args... -**
The function arguments

#### Returns

The new function called with "args"

---

### systemType

`systemType(value)`

Get a value's type string

#### Arguments

**value -**
The value

#### Returns

The type string of the value.
Valid values are: 'array', 'boolean', 'datetime', 'function', 'null', 'number', 'object', 'regex', 'string'.

---

## args.bare

The "args.bare" include library parses and validates a MarkdownUp application's URL arguments, and
creates URLs and links back to the application.

MarkdownUp sets each URL hash argument as a global variable - `#var.vValue1=5` sets the global
`vValue1` to 5. An [arguments model] names the application's arguments, their types, and their
defaults. The [argsParse] function reads each argument from its global variable ("v" followed by
the capitalized argument name, by default) and returns the validated arguments object. The
[argsLink] function creates a link to the application with updated arguments:

```bare-script
include <args.bare>

arguments = [ \
    {'name': 'value1', 'type': 'float', 'default': 0}, \
    {'name': 'value2', 'type': 'float', 'default': 0} \
]
args = argsParse(arguments)
value1 = objectGet(args, 'value1')
value2 = objectGet(args, 'value2')

markdownPrint('The sum is: ' + (value1 + value2))
markdownPrint('', argsLink(arguments, 'Value1 More', {'value1': value1 + 1}))
markdownPrint('', argsLink(arguments, 'Reset', null, true))
```

A link keeps the application's current arguments unless overridden (or cleared with null). The
"explicit" argument of [argsLink] clears them all.


[argsLink]: #var.vGroup='args.bare'&argslink
[argsParse]: #var.vGroup='args.bare'&argsparse
[arguments model]: model.html#var.vName='ArgsArguments'


---

### argsHelp

`argsHelp(arguments)`

Generate the [arguments model's](model.html#var.vName='ArgsArguments') help content

#### Arguments

**arguments -**
The [arguments model](model.html#var.vName='ArgsArguments')

#### Returns

The array of help Markdown line strings

---

### argsLink

`argsLink(arguments, text, args = null, explicit = false, headerText = null, url = null)`

Create a Markdown link text to a MarkdownUp application URL

#### Arguments

**arguments -**
The [arguments model](model.html#var.vName='ArgsArguments')

**text -**
The link text

**args** (optional, default `null`) **-**
The arguments object

**explicit** (optional, default `false`) **-**
If true, arguments are only included in the URL if they are in the arguments object

**headerText** (optional, default `null`) **-**
If non-null, the URL's header text.
The special "_top" header ID scrolls to the top of the page.

**url** (optional, default `null`) **-**
If non-null, the MarkdownUp URL hash parameter

#### Returns

The Markdown link text

---

### argsParse

`argsParse(arguments)`

Parse an [arguments model](model.html#var.vName='ArgsArguments').
Argument globals are validated and added to the arguments object using the argument name.

#### Arguments

**arguments -**
The [arguments model](model.html#var.vName='ArgsArguments')

#### Returns

The arguments object

---

### argsURL

`argsURL(arguments, args = null, explicit = false, headerText = null, url = null)`

Create a MarkdownUp application URL

#### Arguments

**arguments -**
The [arguments model](model.html#var.vName='ArgsArguments')

**args** (optional, default `null`) **-**
The arguments object. Null argument values are excluded from the URL.

**explicit** (optional, default `false`) **-**
If true, arguments are only included in the URL if they are in the arguments object

**headerText** (optional, default `null`) **-**
If non-null, the URL's header text.
The special "_top" header ID scrolls to the top of the page.

**url** (optional, default `null`) **-**
If non-null, the MarkdownUp URL hash parameter

#### Returns

The MarkdownUp application URL

---

### argsValidate

`argsValidate(arguments)`

Validate an arguments model

#### Arguments

**arguments -**
The [arguments model](model.html#var.vName='ArgsArguments')

#### Returns

The validated [arguments model](model.html#var.vName='ArgsArguments') or null if validation fails

---

## baredoc.bare

The "baredoc.bare" include library contains the BareScript library documentation application,
baredoc - see it in action in the
[BareScript Library documentation](https://craigahobbs.github.io/bare-script/library/).

Run baredoc by calling [baredocMain](#var.vGroup='baredoc.bare'&baredocmain) with a
[documentation configuration](model.html#var.vName='BaredocConfig') object, or the URL of its JSON
resource. Each section's `url` is a [library model JSON](model.html#var.vName='BaredocLibrary')
resource, such as one generated by [baredocCLI](#var.vGroup='baredocCLI.bare'&_top). The
configuration can also add top-level content and per-group content.

```bare-script
include <baredoc.bare>

baredocMain({ \
    'title': 'My Library', \
    'sections': [ \
        {'title': 'My Functions', 'url': 'my-library.json'} \
    ] \
})
```


---

### baredocMain

`baredocMain(config)`

**async** - The calling function must be declared with "async function"

The BareScript library documentation application main entry point

#### Arguments

**config -**
The [documentation configuration](model.html#var.vName='BaredocConfig') object or its JSON resource URL

#### Returns

Nothing

---

## baredocCLI.bare

The "baredocCLI.bare" include library contains the baredoc command-line interface (CLI), baredocCLI.
baredocCLI generates a [library model JSON file](model.html#var.vName='BaredocLibrary') for the
[baredoc application](#var.vGroup='baredoc.bare'&_top) from the documentation comments of its input
files.

Run baredocCLI with the `bare` CLI. The "vFiles" argument is the string literal of the JSON array of
input file names, and the optional "vOutput" argument is the output file (the default is standard
output). To glob the input files, build the JSON array with a script:

```sh
bare -m -v vFiles "'[\"lib/myLib.bare\"]'" -v vOutput '"my-library.json"' \
    -c 'include <baredocCLI.bare>' -c 'return baredocCLIMain()'

bare -m \
    -v vFiles "'$(python3 -c 'import json, sys; print(json.dumps(sys.argv[1:]))' lib/*.bare)'" \
    -c 'include <baredocCLI.bare>' -c 'return baredocCLIMain()'
```


**baredoc Comment Syntax** - baredoc documentation comments begin with the "$" character, followed
immediately by a keyword ("function", "group", "doc", "arg", "return", "async", or "ignore"),
followed by the ":" character, followed by the keyword value. The "function" keyword begins every
library function definition. The "arg" keyword is followed by the argument name - `[name]` for an
optional argument, or `[name = value]` for an optional argument with a default value, a BareScript
literal (a number, string, null, true, false, or an array or object literal of these) - and
repeating an argument's keyword continues its documentation. "$async: true" marks a function as
asynchronous (the calling function must be declared with "async function"), and "$ignore: true"
excludes a function from the documentation. For example:

```bare-script
# $function: myFunction
# $group: My Group
# $doc: This is my function.
# $doc:
# $doc: More on the function.
# $arg arg1: The first argument
# $arg [arg2 = 'Hello']: The second argument.
# $arg arg2:
# $arg arg2: More on the second argument.
# $return: The message
function myFunction(arg1, arg2):
    message = if(arg2 != null, arg2, 'Hello')
    systemLog(message)
    return message
endfunction
```


---

### baredocCLIMain

`baredocCLIMain()`

**async** - The calling function must be declared with "async function"

The BareScript documentation tool main entry point

#### Arguments

None

#### Returns

The exit status code

---

### baredocCLIParse

`baredocCLIParse(functions, source, filename)`

Parse source code for baredoc documentation comments

#### Arguments

**functions -**
The map of function name to [function documentation model](model.html#var.vName='BaredocFunction')

**source -**
The source code string

**filename -**
The source filename string

#### Returns

The array of errors

---

## barescriptLint.bare

The "barescriptLint.bare" include library statically analyzes
[BareScript models](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript') for
common mistakes: unused variables, arguments, and labels; variables used before assignment; unknown
global variables and labels; redefined functions and labels; and pointless statements.

```bare-script
include <barescriptLint.bare>

for warning in barescriptLintScript(script):
    markdownPrint('', 'Warning: ' + markdownEscape(warning))
endfor
```


---

### barescriptLintScript

`barescriptLintScript(script, globals = null, asyncFunctions = null)`

Lint a BareScript model

#### Arguments

**script -**
The [BareScript model](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript')

**globals** (optional, default `null`) **-**
The script's global variables. If provided, the unknown-global
lint checks are performed.

**asyncFunctions** (optional, default `null`) **-**
The object of async global function names (name to true).
If provided along with globals, the async lint checks are performed.

#### Returns

The array of lint warning strings

---

## barescriptModel.bare

The "barescriptModel.bare" include library provides the
[BareScript type model](https://craigahobbs.github.io/bare-script/model/) and model validation
functions. A [BareScript model](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript')
is the object representation of a script - the BareScript parser produces it and the BareScript
runtime executes it. Validate a model you did not parse yourself, such as one loaded from JSON:

```bare-script
include <barescriptModel.bare>

script = barescriptValidateScript(jsonParse(systemFetch('script.json')))
```


---

### barescriptTypeModel

`barescriptTypeModel()`

Get the [BareScript type model](https://craigahobbs.github.io/bare-script/model/)

#### Arguments

None

#### Returns

The [BareScript type model](https://craigahobbs.github.io/bare-script/model/)

---

### barescriptValidateExpression

`barescriptValidateExpression(expr)`

Validate an expression model

#### Arguments

**expr -**
The [expression model](https://craigahobbs.github.io/bare-script/model/#var.vName='Expression')

#### Returns

The validated [expression model](https://craigahobbs.github.io/bare-script/model/#var.vName='Expression'),
or null if validation fails

---

### barescriptValidateExpressionEx

`barescriptValidateExpressionEx(expr)`

Validate an expression model with programmatic error reporting

#### Arguments

**expr -**
The [expression model](https://craigahobbs.github.io/bare-script/model/#var.vName='Expression')

#### Returns

On success, an object with the "result" key set to the validated
[expression model](https://craigahobbs.github.io/bare-script/model/#var.vName='Expression').
On failure, an object with the "error" key set to the validation error message and the
"memberFqn" key set to the fully-qualified member name (or null).

---

### barescriptValidateScript

`barescriptValidateScript(script)`

Validate a BareScript model

#### Arguments

**script -**
The [BareScript model](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript')

#### Returns

The validated [BareScript model](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript'),
or null if validation fails

---

### barescriptValidateScriptEx

`barescriptValidateScriptEx(script)`

Validate a BareScript model with programmatic error reporting

#### Arguments

**script -**
The [BareScript model](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript')

#### Returns

On success, an object with the "result" key set to the validated
[BareScript model](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript').
On failure, an object with the "error" key set to the validation error message and the
"memberFqn" key set to the fully-qualified member name (or null).

---

## barescriptParser.bare

The "barescriptParser.bare" include library parses
[BareScript](https://craigahobbs.github.io/bare-script/language/) script and expression text into
[BareScript models](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript').

```bare-script
include <barescriptParser.bare>

script = barescriptParseScript(scriptText)
expr = barescriptParseExpression('5 * N')
```


---

### barescriptParseExpression

`barescriptParseExpression(exprText, lineNumber = null, scriptName = null, arrayLiterals = false)`

Parse a BareScript expression

#### Arguments

**exprText -**
The [expression text](https://craigahobbs.github.io/bare-script/language/#expressions)

**lineNumber** (optional, default `null`) **-**
The script line number

**scriptName** (optional, default `null`) **-**
The script name

**arrayLiterals** (optional, default `false`) **-**
If true, allow parsing of array literals

#### Returns

The [expression model](https://craigahobbs.github.io/bare-script/model/#var.vName='Expression'),
or null if a parsing error occurs

---

### barescriptParseExpressionEx

`barescriptParseExpressionEx(exprText, lineNumber = null, scriptName = null, arrayLiterals = false)`

Parse a BareScript expression with programmatic error reporting

#### Arguments

**exprText -**
The [expression text](https://craigahobbs.github.io/bare-script/language/#expressions)

**lineNumber** (optional, default `null`) **-**
The script line number

**scriptName** (optional, default `null`) **-**
The script name

**arrayLiterals** (optional, default `false`) **-**
If true, allow parsing of array literals

#### Returns

On success, an object with the "result" key set to the
[expression model](https://craigahobbs.github.io/bare-script/model/#var.vName='Expression').
On failure, an object with the "error" key set to the parser error object. The parser error
object has the "error", "line", "columnNumber", "lineNumber", "scriptName", and "message" keys.

---

### barescriptParseScript

`barescriptParseScript(scriptText, startLineNumber = 1, scriptName = null)`

Parse a BareScript script

#### Arguments

**scriptText -**
The [script text](https://craigahobbs.github.io/bare-script/language/) (string or array of strings)

**startLineNumber** (optional, default `1`) **-**
The script's starting line number

**scriptName** (optional, default `null`) **-**
The script name

#### Returns

The [BareScript model](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript'),
or null if a parsing error occurs

---

### barescriptParseScriptEx

`barescriptParseScriptEx(scriptText, startLineNumber = 1, scriptName = null)`

Parse a BareScript script with programmatic error reporting

#### Arguments

**scriptText -**
The [script text](https://craigahobbs.github.io/bare-script/language/) (string or array of strings)

**startLineNumber** (optional, default `1`) **-**
The script's starting line number

**scriptName** (optional, default `null`) **-**
The script name

#### Returns

On success, an object with the "result" key set to the
[BareScript model](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript').
On failure, an object with the "error" key set to the
[parser error object](#var.vGroup='barescriptParser.bare'&barescriptparsescriptex).
The parser error object has the "error", "line", "columnNumber", "lineNumber", "scriptName",
and "message" keys.

---

## base64.bare

The "base64.bare" include library encodes byte value arrays (arrays of integers 0 to 255) as base64
text and decodes base64 text back to bytes. Base64 text carries binary data through string-only
channels, such as JSON, [localStorageSet](#var.vGroup='markdownUp.bare'&localstorageset), and data
URLs:

```bare-script
include <base64.bare>

dataURL = 'data:application/octet-stream;base64,' + base64Encode(bytes)
```


---

### base64Decode

`base64Decode(text)`

Decode a base64 string to a byte value array

#### Arguments

**text -**
The base64-encoded string

#### Returns

The byte value array, or null if decoding fails

---

### base64Encode

`base64Encode(bytes)`

Encode a byte value array (or a string, as UTF-8) as a base64 string

#### Arguments

**bytes -**
The byte value array (integers 0 to 255) or string

#### Returns

The base64-encoded string, or null if encoding fails

---

## data.bare

The "data.bare" include library manipulates and analyzes data arrays. A **data array** is an array
of objects, one per row, with a value for each field:

```bare-script
include <data.bare>

data = [ \
    {'name': 'Alice', 'age': 30, 'city': 'New York'}, \
    {'name': 'Bob', 'age': 25, 'city': 'Boston'}, \
    {'name': 'Charlie', 'age': 35, 'city': 'New York'} \
]
newYork = dataFilter(data, 'age > 25 && city == "New York"')
```

The filter and calculated-field functions take
[BareScript expressions](https://craigahobbs.github.io/bare-script/language/#expressions), evaluated
for each row with the row's fields as variables and the
[expression library](expression.html) functions available. Data arrays are rendered by the
[dataTable.bare](#var.vGroup='dataTable.bare'&_top) and
[dataLineChart.bare](#var.vGroup='dataLineChart.bare'&_top) include libraries.


---

### dataAggregate

`dataAggregate(data, aggregation)`

Aggregate a data array. For example:

```bare-script
include <data.bare>

data = [{'city': 'NY', 'temp': 65}, {'city': 'NY', 'temp': 70}, {'city': 'SF', 'temp': 60}]
averages = dataAggregate(data, { \
    'categories': ['city'], \
    'measures': [{'field': 'temp', 'function': 'average', 'name': 'avgTemp'}] \
})
# averages is [{'avgTemp': 67.5, 'city': 'NY'}, {'avgTemp': 60, 'city': 'SF'}]
```

#### Arguments

**data -**
The data array

**aggregation -**
The [aggregation model](model.html#var.vName='DataAggregation')

#### Returns

The aggregated data array

---

### dataCalculatedField

`dataCalculatedField(data, fieldName, expr, variables = null)`

Add a calculated field to each row of a data array, in place. For example:

```bare-script
include <data.bare>

data = [{'a': 1, 'b': 2}, {'a': 3, 'b': 4}]
dataCalculatedField(data, 'sum', 'a + b')
# data is [{'a': 1, 'b': 2, 'sum': 3}, {'a': 3, 'b': 4, 'sum': 7}]
```

#### Arguments

**data -**
The data array

**fieldName -**
The calculated field name

**expr -**
The calculated field expression

**variables** (optional, default `null`) **-**
A variables object for the expression evaluation

#### Returns

The updated data array

---

### dataFilter

`dataFilter(data, expr, variables = null)`

Filter a data array. The filter expression is evaluated for each row, with the row's fields
and the variables object's members as variables. For example:

```bare-script
include <data.bare>

data = [{'city': 'NY', 'temp': 65}, {'city': 'SF', 'temp': 60}, {'city': 'NY', 'temp': 70}]
warm = dataFilter(data, 'city == "NY" && temp > minTemp', {'minTemp': 66})
# warm is [{'city': 'NY', 'temp': 70}]
```

#### Arguments

**data -**
The data array

**expr -**
The filter expression

**variables** (optional, default `null`) **-**
A variables object for the expression evaluation

#### Returns

The filtered data array

---

### dataJoin

`dataJoin(leftData, rightData, joinExpr, rightExpr = null, isLeftJoin = false, variables = null)`

Join two data arrays. A right-row field that collides with a left-row field is renamed
with a "2" suffix. For example:

```bare-script
include <data.bare>

people = [{'name': 'Alice', 'city': 'NY'}, {'name': 'Bob', 'city': 'SF'}]
cities = [{'city': 'NY', 'state': 'NY'}, {'city': 'SF', 'state': 'CA'}]
joined = dataJoin(people, cities, 'city')
# joined is [{'city': 'NY', 'city2': 'NY', 'name': 'Alice', 'state': 'NY'}, ...]
```

#### Arguments

**leftData -**
The left data array

**rightData -**
The right data array

**joinExpr -**
The join expression

**rightExpr** (optional, default `null`) **-**
The right join expression

**isLeftJoin** (optional, default `false`) **-**
By default, all left rows are included in the result.
If true, left rows with no matching right row are excluded.

**variables** (optional, default `null`) **-**
A variables object for join expression evaluation

#### Returns

The joined data array

---

### dataParseCSV

`dataParseCSV(text)`

Parse CSV text to a data array

#### Arguments

**text -**
The CSV text or array of CSV text

#### Returns

The data array. String values are parsed into typed values; if a value fails to parse as its
column's type, a debug message is logged and the remaining column values are left as strings.

---

### dataSort

`dataSort(data, sorts)`

Sort a data array in place. For example:

```bare-script
include <data.bare>

data = [{'city': 'NY', 'temp': 65}, {'city': 'SF', 'temp': 60}, {'city': 'NY', 'temp': 70}]
dataSort(data, [['city'], ['temp', true]])
# data is [{'city': 'NY', 'temp': 70}, {'city': 'NY', 'temp': 65}, {'city': 'SF', 'temp': 60}]
```

#### Arguments

**data -**
The data array

**sorts -**
The array of sort tuples. Each tuple is a one- or two-element array, \[field\] or
\[field, descending\]. "field" is the field name to sort by. "descending" is an
optional boolean - if true, the field is sorted in descending order (default is
ascending).

#### Returns

The sorted data array

---

### dataTop

`dataTop(data, count = 1, categoryFields = null)`

Keep the top rows for each category

#### Arguments

**data -**
The data array

**count** (optional, default `1`) **-**
The number of rows to keep

**categoryFields** (optional, default `null`) **-**
The category fields

#### Returns

The top data array

---

### dataValidate

`dataValidate(data, csv = false)`

Validate a data array

#### Arguments

**data -**
The data array

**csv** (optional, default `false`) **-**
If true, parse value strings

#### Returns

The map of field name to field type, or null if the data is invalid

---

### dataValidateEx

`dataValidateEx(data, csv = false)`

Validate a data array with programmatic error reporting

#### Arguments

**data -**
The data array

**csv** (optional, default `false`) **-**
If true, parse value strings

#### Returns

On success, an object with the "result" key set to the map of field name to field type.
On failure, an object with the "error" key set to the validation error message.

---

## dataLineChart.bare

The "dataLineChart.bare" include library renders line charts from
[data arrays](#var.vGroup='data.bare'&_top). Describe a chart with a
[line chart model](model.html#var.vName='DataLineChart') - its member documentation covers the axis
ranges, scales, tick label formats, annotations, and color encoding.

```bare-script
include <dataLineChart.bare>

data = [ \
    {'month': 1, 'sales': 120, 'costs': 80}, \
    {'month': 2, 'sales': 150, 'costs': 90}, \
    {'month': 3, 'sales': 130, 'costs': 85}, \
    {'month': 4, 'sales': 170, 'costs': 95} \
]
dataLineChart(data, {'title': 'Monthly Sales vs Costs', 'x': 'month', 'y': ['sales', 'costs']})
```

To obtain the chart's SVG element model instead of rendering it, use
[dataLineChartElements](#var.vGroup='dataLineChart.bare'&datalinechartelements). To draw a chart
within the current [drawing](#var.vGroup='draw.bare'&_top), use
[drawLineChart](#var.vGroup='dataLineChart.bare'&drawlinechart).


---

### dataLineChart

`dataLineChart(data, lineChart, options = null)`

Render a line chart. The chart names itself for assistive technology - `role="img"` with the
chart's title as its accessible name, or a description of what it plots when it has no title.

#### Arguments

**data -**
The data array

**lineChart -**
The [line chart model](model.html#var.vName='DataLineChart')

**options** (optional, default `null`) **-**
The line chart options object with the following optional members:
- **fontSize** - The font size, in pixels

#### Returns

Nothing

---

### dataLineChartElements

`dataLineChartElements(data, lineChart, options = null)`

Render a line chart as an element model

#### Arguments

**data -**
The data array

**lineChart -**
The [line chart model](model.html#var.vName='DataLineChart')

**options** (optional, default `null`) **-**
The line chart options object with the following optional members:
- **fontSize** - The font size, in pixels

#### Returns

The line chart [element model](https://github.com/craigahobbs/element-model#readme)

---

### dataLineChartValidate

`dataLineChartValidate(lineChart)`

Validate a line chart model

#### Arguments

**lineChart -**
The [line chart model](model.html#var.vName='DataLineChart')

#### Returns

The validated [line chart model](model.html#var.vName='DataLineChart')

---

### dataLineChartValidateEx

`dataLineChartValidateEx(lineChart)`

Validate a line chart model with programmatic error reporting

#### Arguments

**lineChart -**
The [line chart model](model.html#var.vName='DataLineChart')

#### Returns

On success, an object with the "result" key set to the validated [line chart model](model.html#var.vName='DataLineChart').
On failure, an object with the "error" key set to the validation error message and the
"memberFqn" key set to the fully-qualified member name (or null).

---

### drawLineChart

`drawLineChart(data, lineChart, x, y, width, height, options = null)`

Draw a line chart within the current drawing. Use it to compose a chart with other drawing
content, such as several charts on one drawing:

```bare-script
include <dataLineChart.bare>

drawNew(640, 720)
drawLineChart(data, {'title': 'Sales', 'x': 'month', 'y': ['sales']}, 0, 0, 640, 360)
drawLineChart(data, {'title': 'Costs', 'x': 'month', 'y': ['costs']}, 0, 360, 640, 360)
drawRender()
```

The chart does not name the drawing for assistive technology - name it with
[drawAriaLabel](#var.vGroup='draw.bare'&drawarialabel).

#### Arguments

**data -**
The data array

**lineChart -**
The [line chart model](model.html#var.vName='DataLineChart')

**x -**
The X-coordinate, in pixels, of the left side of the chart

**y -**
The Y-coordinate, in pixels, of the top of the chart

**width -**
The width of the chart, in pixels

**height -**
The height of the chart, in pixels

**options** (optional, default `null`) **-**
The line chart options object with the following optional members:
- **fontSize** - The font size, in pixels

#### Returns

true if the chart is drawn, null if the data contains no chartable points

---

## dataTable.bare

The "dataTable.bare" include library renders [data arrays](#var.vGroup='data.bare'&_top) as Markdown
tables. The optional [data table model](model.html#var.vName='DataTable') selects and orders the
fields and sets their formatting - without one, all fields are displayed with default formatting.

```bare-script
include <dataTable.bare>

markdownPrint(dataTableMarkdown(data, {'fields': ['name', 'age'], 'formats': {'age': {'align': 'right'}}}))
```


---

### dataTable

`dataTable(data, dataTable = null)`

Render a data table in the document

#### Arguments

**data -**
The data array

**dataTable** (optional, default `null`) **-**
The [data table model](model.html#var.vName='DataTable')

#### Returns

Nothing

---

### dataTableElements

`dataTableElements(data, dataTable = null)`

Generate a data table element model

#### Arguments

**data -**
The data array

**dataTable** (optional, default `null`) **-**
The [data table model](model.html#var.vName='DataTable')

#### Returns

The data table [element model](https://github.com/craigahobbs/element-model#readme)

---

### dataTableMarkdown

`dataTableMarkdown(data, model)`

Create the array of Markdown table line strings

#### Arguments

**data -**
The array of row objects

**model -**
The [data table model](model.html#var.vName='DataTable')

#### Returns

The array of Markdown table line strings

---

### dataTableValidate

`dataTableValidate(dataTable)`

Validate a data table model

#### Arguments

**dataTable -**
The [data table model](model.html#var.vName='DataTable')

#### Returns

The validated [data table model](model.html#var.vName='DataTable')

---

### dataTableValidateEx

`dataTableValidateEx(dataTable)`

Validate a data table model with programmatic error reporting

#### Arguments

**dataTable -**
The [data table model](model.html#var.vName='DataTable')

#### Returns

On success, an object with the "result" key set to the validated [data table model](model.html#var.vName='DataTable').
On failure, an object with the "error" key set to the validation error message and the
"memberFqn" key set to the fully-qualified member name (or null).

---

## diff.bare

The "diff.bare" include library computes the line-by-line differences between two strings or arrays
of strings, as an array of [difference models](model.html#var.vName='Differences').

```bare-script
include <diff.bare>

differences = diffLines('Line 1\nLine 2', 'Line 1\nLine 2 modified\nLine 3')
```


---

### diffLines

`diffLines(left, right)`

Compute the line-differences of two strings or arrays of strings

#### Arguments

**left -**
The "left" string or array of strings

**right -**
The "right" string or array of strings

#### Returns

The array of [difference models](model.html#var.vName='Differences')

---

## draw.bare

The "draw.bare" include library creates SVG vector drawings of shapes, paths, text, and images. The
library maintains a single **current drawing** - [drawNew](#var.vGroup='draw.bare'&drawnew) starts a
new current drawing, the other "draw" functions operate on it, and
[drawRender](#var.vGroup='draw.bare'&drawrender) renders it. Coordinates are in pixels from the
drawing's top-left corner, and shapes and text use the most recently set
[drawStyle](#var.vGroup='draw.bare'&drawstyle) and
[drawTextStyle](#var.vGroup='draw.bare'&drawtextstyle).

```bare-script
include <draw.bare>

drawNew(400, 300)
drawStyle('black', 2, 'lightblue')
drawRect(50, 50, 120, 80)
drawCircle(280, 150, 60)
drawTextStyle(20, 'black', true)
drawText('Hello, World!', 200, 260)
drawRender()
```


---

### drawArc

`drawArc(rx, ry, angle, largeArcFlag, sweepFlag, x, y)`

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

### drawAriaLabel

`drawAriaLabel(label)`

Set the current drawing's accessible name. Assistive technology announces the drawing as a
single image with this name, instead of reading the text within it one piece at a time.
This also sets `role="img"`, without which `aria-label` on an `<svg>` is inconsistently honored.

#### Arguments

**label -**
The accessible name, or null for none

#### Returns

Nothing

---

### drawCircle

`drawCircle(cx, cy, r)`

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

`drawClose()`

Close the current drawing path

#### Arguments

None

#### Returns

Nothing

---

### drawElements

`drawElements()`

Get the current drawing's SVG element model

#### Arguments

None

#### Returns

The current drawing's SVG element model

---

### drawEllipse

`drawEllipse(cx, cy, rx, ry)`

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

`drawHLine(x)`

Draw a horizontal line from the current point to the end point

#### Arguments

**x -**
The x-coordinate of the end point

#### Returns

Nothing

---

### drawHeight

`drawHeight()`

Get the current drawing's height

#### Arguments

None

#### Returns

The current drawing's height

---

### drawImage

`drawImage(x, y, width, height, href)`

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

`drawLine(x, y)`

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

`drawMove(x, y)`

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

`drawNew(width, height)`

Create a new drawing. The new drawing becomes the current drawing - all other "draw" functions
operate on the current drawing. Call drawRender to render the current drawing.

#### Arguments

**width -**
The width of the drawing

**height -**
The height of the drawing

#### Returns

Nothing

---

### drawOnClick

`drawOnClick(callback)`

Set the most recent drawing object's on-click event handler

#### Arguments

**callback -**
The on-click event callback function (x, y, width, height)

#### Returns

Nothing

---

### drawPathRect

`drawPathRect(x, y, width, height)`

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

`drawRect(x, y, width, height, rx = null, ry = null)`

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

**rx** (optional, default `null`) **-**
The horizontal corner radius of the rectangle

**ry** (optional, default `null`) **-**
The vertical corner radius of the rectangle

#### Returns

Nothing

---

### drawRender

`drawRender()`

Render the current drawing

#### Arguments

None

#### Returns

Nothing

---

### drawStyle

`drawStyle(stroke = 'black', strokeWidth = 1, fill = 'none', strokeDashArray = 'none')`

Set the current drawing styles

#### Arguments

**stroke** (optional, default `'black'`) **-**
The stroke color

**strokeWidth** (optional, default `1`) **-**
The stroke width

**fill** (optional, default `'none'`) **-**
The fill color

**strokeDashArray** (optional, default `'none'`) **-**
The stroke
[dash array](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray#usage_notes)

#### Returns

Nothing

---

### drawText

`drawText(text, x, y, textAnchor = 'middle', dominantBaseline = 'middle', rotate = null)`

Draw text

#### Arguments

**text -**
The text to draw

**x -**
The x-coordinate of the text

**y -**
The y-coordinate of the text

**textAnchor** (optional, default `'middle'`) **-**
The
[text anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor#usage_notes) style

**dominantBaseline** (optional, default `'middle'`) **-**
The
[dominant baseline](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dominant-baseline#usage_notes)
style

**rotate** (optional, default `null`) **-**
The text's clockwise rotation, in degrees, about the text position

#### Returns

Nothing

---

### drawTextHeight

`drawTextHeight(text, width)`

Compute the text's height to fit the width

#### Arguments

**text -**
The text

**width -**
The width of the text. If 0, the current font size (in pixels) is returned.

#### Returns

The text's height, in pixels

---

### drawTextStyle

`drawTextStyle(fontSizePx = null, textFill = 'black', bold = false, italic = false, fontFamily = null)`

Set the current text drawing styles

#### Arguments

**fontSizePx** (optional, default `null`) **-**
The text font size, in pixels. If null, the default font size is used.

**textFill** (optional, default `'black'`) **-**
The text fill color

**bold** (optional, default `false`) **-**
If true, text is bold

**italic** (optional, default `false`) **-**
If true, text is italic

**fontFamily** (optional, default `null`) **-**
The text font family. If null, the default font family is used.

#### Returns

Nothing

---

### drawTextWidth

`drawTextWidth(text, fontSizePx)`

Compute the text's width. The width is the sum of the default font family's character
advance widths - printable ASCII, the Latin-1 supplement, and the punctuation, operators,
arrows, and Greek letters that chart text uses - taking the wider of the regular and the
bold weight for each character, and the width of a glyph from an unknown font for a
character in none of those. So text is measured no narrower than it draws, which is what
fitting a label to a space needs: kerning only ever draws a pair of characters closer
together and is not counted, and each character carries a thousandth of an em of slack for
the fraction of a pixel a renderer adds when it quantizes a glyph's advance.

#### Arguments

**text -**
The text

**fontSizePx -**
The text font size, in pixels

#### Returns

The text's width, in pixels

---

### drawVLine

`drawVLine(y)`

Draw a vertical line from the current point to the end point

#### Arguments

**y -**
The y-coordinate of the end point

#### Returns

Nothing

---

### drawWidth

`drawWidth()`

Get the current drawing's width

#### Arguments

None

#### Returns

The current drawing's width

---

## elementModel.bare

The "elementModel.bare" include library validates
[element models](https://github.com/craigahobbs/element-model#readme) and renders them to HTML or
SVG strings. An element model is a data structure of HTML or SVG elements - an element object, null,
or an array of these - which MarkdownUp applications render with
[elementModelRender](#var.vGroup='markdownUp.bare'&elementmodelrender).

```bare-script
include <elementModel.bare>

elements = { \
    'html': 'div', \
    'attr': {'class': 'container'}, \
    'elem': [ \
        {'html': 'h1', 'elem': {'text': 'Hello, World!'}}, \
        {'html': 'p', 'elem': {'text': 'This is a paragraph.'}} \
    ] \
}
htmlString = elementModelToString(elements)
```


---

### elementModelToString

`elementModelToString(elements, indent = null)`

Render an element model to an HTML or SVG string. Each "svg" element is given the SVG "xmlns"
attribute.

#### Arguments

**elements -**
The element model.
An element model is either null, an element object, or an array of any of these.

**indent** (optional, default `null`) **-**
The indentation string or number of spaces

#### Returns

The HTML or SVG string

---

### elementModelValidate

`elementModelValidate(elements)`

Validate an element model

#### Arguments

**elements -**
The element model.
An element model is either null, an element object, or an array of any of these.

#### Returns

The element model if valid, null otherwise

---

### elementModelValidateEx

`elementModelValidateEx(elements)`

Validate an element model with programmatic error reporting

#### Arguments

**elements -**
The element model.
An element model is either null, an element object, or an array of any of these.

#### Returns

On success, an object with the "result" key set to the element model.
On failure, an object with the "error" key set to the validation error message.

---

## forms.bare

The "forms.bare" include library creates
[element models](https://github.com/craigahobbs/element-model#readme) for common form controls -
text inputs, links, and link buttons - for MarkdownUp applications to render with
[elementModelRender](#var.vGroup='markdownUp.bare'&elementmodelrender). A control's event handler is
called when the user acts on it:

```bare-script
include <forms.bare>

function myAppMain():
    elementModelRender(formsTextElements('myInput', 'Initial text', 20, myAppOnEnter))
endfunction

function myAppOnEnter():
    markdownPrint('You entered: ' + documentInputValue('myInput'))
endfunction

myAppMain()
```


---

### formsLinkButtonElements

`formsLinkButtonElements(text, onClick)`

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

`formsLinkElements(text, url)`

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

`formsTextElements(id, text, size = null, onEnter = null)`

Create a text input [element model](https://github.com/craigahobbs/element-model#readme)

#### Arguments

**id -**
The text input element ID

**text -**
The initial text of the text input element

**size** (optional, default `null`) **-**
The size, in characters, of the text input element

**onEnter** (optional, default `null`) **-**
The text input element on-enter event handler

#### Returns

The text input [element model](https://github.com/craigahobbs/element-model#readme)

---

## gzip.bare

The "gzip.bare" include library compresses and uncompresses byte value arrays (arrays of integers 0
to 255) in the standard gzip format, which any gzip tool can read. The compressor and uncompressor
are written in BareScript.

```bare-script
include <gzip.bare>

compressed = gzipCompress('hello hello hello')
text = stringDecode(gzipUncompress(compressed))
# text is 'hello hello hello'
```


---

### gzipCompress

`gzipCompress(bytes, level = 6)`

Compress a byte value array (or a string, as UTF-8) with gzip

#### Arguments

**bytes -**
The byte value array (integers 0 to 255) or string

**level** (optional, default `6`) **-**
The compression level, 0 (store) through 9 (best)

#### Returns

The gzip-compressed byte value array, or null if compression fails

---

### gzipUncompress

`gzipUncompress(bytes)`

Uncompress a gzip-compressed byte value array. Any single-member gzip stream can be
uncompressed. The gzip header, the DEFLATE stream, and the trailer's CRC-32 and size are checked.

#### Arguments

**bytes -**
The gzip-compressed byte value array (integers 0 to 255)

#### Returns

The uncompressed byte value array, or null if uncompression fails

---

## markdown.bare

The "markdown.bare" include library contains utility functions for Markdown text and
[Markdown models](model.html#var.vName='Markdown') - escaping text, generating header IDs, finding a
document's title, extracting paragraph text, and validating Markdown models. Escape text before including it in Markdown
output:

```bare-script
include <markdown.bare>

markdownPrint('# ' + markdownEscape(title))
```


---

### markdownEscape

`markdownEscape(text)`

Escape a string for inclusion in Markdown text

#### Arguments

**text -**
The text to escape

#### Returns

The escaped text

---

### markdownHeaderId

`markdownHeaderId(text)`

Generate a Markdown header ID from text. This is the ID that
[markdownElements](#var.vGroup='markdownElements.bare'&markdownelements) generates for headers.

#### Arguments

**text -**
The text

#### Returns

The header element ID

---

### markdownParagraphText

`markdownParagraphText(paragraph)`

Get a Markdown paragraph model's text

#### Arguments

**paragraph -**
The Markdown paragraph model

#### Returns

The paragraph text string

---

### markdownTitle

`markdownTitle(markdown)`

Get a Markdown model's title

#### Arguments

**markdown -**
The Markdown model

#### Returns

The title string or null

---

### markdownValidate

`markdownValidate(markdown)`

Validate a Markdown model

#### Arguments

**markdown -**
The [Markdown model](model.html#var.vName='Markdown')

#### Returns

The validated [Markdown model](model.html#var.vName='Markdown')

---

### markdownValidateEx

`markdownValidateEx(markdown)`

Validate a Markdown model with programmatic error reporting

#### Arguments

**markdown -**
The [Markdown model](model.html#var.vName='Markdown')

#### Returns

On success, an object with the "result" key set to the validated [Markdown model](model.html#var.vName='Markdown').
On failure, an object with the "error" key set to the validation error message and the
"memberFqn" key set to the fully-qualified member name (or null).

---

## markdownElements.bare

The "markdownElements.bare" include library converts a
[Markdown model](model.html#var.vName='Markdown') into an
[element model](https://github.com/craigahobbs/element-model#readme) for rendering:

```bare-script
include <markdownElements.bare>
include <markdownParser.bare>

elementModelRender(markdownElements(markdownParse('# Hello, World!', '', 'This is **bold** text.')))
```


---

### markdownElements

`markdownElements(markdown, options = null)`

Generate an element model from a Markdown model

#### Arguments

**markdown -**
The [Markdown model](model.html#var.vName='Markdown')

**options** (optional, default `null`) **-**
The [options object](model.html#var.vName='MarkdownElementsOptions')

#### Returns

The Markdown's [element model](https://github.com/craigahobbs/element-model#readme)

---

### markdownElementsAsync

`markdownElementsAsync(markdown, options = null)`

**async** - The calling function must be declared with "async function"

Generate an element model from a Markdown model.
Use this form of the function if you have one or more asynchronous code block functions.

#### Arguments

**markdown -**
The [Markdown model](model.html#var.vName='Markdown')

**options** (optional, default `null`) **-**
The [options object](model.html#var.vName='MarkdownElementsOptions')

#### Returns

The Markdown's [element model](https://github.com/craigahobbs/element-model#readme)

---

## markdownParser.bare

The "markdownParser.bare" include library parses Markdown text into a
[Markdown model](model.html#var.vName='Markdown'). Render the model with the
[markdownElements.bare](#var.vGroup='markdownElements.bare'&_top) include library, or render it
back to Markdown text with the [markdownString.bare](#var.vGroup='markdownString.bare'&_top) include
library.

```bare-script
include <markdownParser.bare>

markdown = markdownParse('# Hello, World!', '', 'This is a paragraph.')
```


---

### markdownParse

`markdownParse(lines...)`

Parse Markdown text into a Markdown model

#### Arguments

**lines... -**
The Markdown text lines (may contain nested arrays of un-split lines)

#### Returns

The [Markdown model](model.html#var.vName='Markdown')

---

## markdownString.bare

The "markdownString.bare" include library renders a
[Markdown model](model.html#var.vName='Markdown') back to Markdown text. Together with
[markdownParse](#var.vGroup='markdownParser.bare'&markdownparse), it works as a Markdown formatter.
The rendered text is normalized, not source-preserving:

- Paragraph text is re-wrapped to the wrap width
- Setext headers are rendered as hash headers and indented code blocks are rendered fenced
- The "\_" and "\~" character styles are normalized to "\*" and "\~\~"
- Auto-links stay angle-bracket form when the parser would recognize them
- Table cells are padded to the column width and alignment
- Only the characters that require escaping are escaped

```bare-script
include <markdownParser.bare>
include <markdownString.bare>

text = markdownToString(markdownParse('#   Hello, World!', '', 'This is a', 'paragraph.'))
```


---

### markdownToString

`markdownToString(markdown, wrapWidth = 100, refCount = 0)`

Render a [Markdown model](model.html#var.vName='Markdown') as Markdown text. The rendered text
is normalized - text is re-wrapped, character styles are rendered with the "\*" and "\~"
syntax, code blocks are rendered fenced, and only the characters that require escaping are
escaped.

#### Arguments

**markdown -**
The [Markdown model](model.html#var.vName='Markdown')

**wrapWidth** (optional, default `100`) **-**
The text wrap width. If zero or less, text is not wrapped.
This is a target for paragraph text, not a hard maximum - a word longer than the wrap
width (a link, image, or code span) is kept intact, and fenced code is not wrapped.

**refCount** (optional, default `0`) **-**
The minimum number of occurrences of a link/image URL for which a
link/image reference is rendered. If zero or less, all links/images are rendered inline.

#### Returns

The Markdown text

---

## markdownUp.bare

`markdownUp.bare` implements the [MarkdownUp](https://github.com/craigahobbs/markdown-up#readme)
runtime functions - `markdownPrint`, `elementModelRender`, and the `document*`, `window*`, and
`*Storage*` functions - so that many MarkdownUp applications run on plain
[BareScript](https://github.com/craigahobbs/bare-script#readme).

**Do not `include <markdownUp.bare>` from application code.** Two reasons:

1. In the real [MarkdownUp](https://github.com/craigahobbs/markdown-up#readme) browser runtime,
   these functions are built-in. Including this file would **overwrite those built-ins with the
   logging stubs**, and the application would silently stop rendering.
2. Under the `bare` CLI, the `-m` (Markdown text output) and `-l` (HTML output) flags prepend
   `include <markdownUp.bare>` for you, so an explicit include is redundant.

To run a MarkdownUp application with the `bare` CLI, use the `-m` flag. Without it, the MarkdownUp
runtime functions are undefined. For an "app.bare" that calls `markdownPrint('# Hello!')`:

```sh
$ bare -m app.bare
# Hello!

$ bare app.bare
app.bare:1: Undefined function "markdownPrint"
```


---

### documentFontSize

`documentFontSize()`

Get the document font size

#### Arguments

None

#### Returns

The document font size, in pixels

---

### documentInputValue

`documentInputValue(id)`

Get an input element's value

#### Arguments

**id -**
The input element ID

#### Returns

The input element value or null if the element does not exist

---

### documentSetFocus

`documentSetFocus(id)`

Set focus to an element

#### Arguments

**id -**
The element ID

#### Returns

Nothing

---

### documentSetKeyDown

`documentSetKeyDown(callback)`

Set the document keydown event handler. For example:

```bare-script
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

`documentSetReset(id)`

Set the document reset element

#### Arguments

**id -**
The element ID

#### Returns

Nothing

---

### documentSetTitle

`documentSetTitle(title)`

Set the document title

#### Arguments

**title -**
The document title string

#### Returns

Nothing

---

### documentURL

`documentURL(url)`

Fix-up relative URLs

#### Arguments

**url -**
The URL

#### Returns

The fixed-up URL

---

### elementModelRender

`elementModelRender(element)`

Render an [element model](https://github.com/craigahobbs/element-model#readme)

**Note:** Element model "callback" members are a map of event name (e.g., "click") to
event callback function. The following events have callback arguments:
- **click** - For an SVG element, the click's x and y coordinates and the SVG's width and height
- **keydown** - keyCode
- **keypress** - keyCode
- **keyup** - keyCode

#### Arguments

**element -**
The [element model](https://github.com/craigahobbs/element-model#readme)

#### Returns

Nothing

---

### localStorageClear

`localStorageClear()`

Clear all keys from the browser's local storage

#### Arguments

None

#### Returns

Nothing

---

### localStorageGet

`localStorageGet(key)`

Get a browser local storage key's value

#### Arguments

**key -**
The key string

#### Returns

The local storage value string or null if the key does not exist

---

### localStorageRemove

`localStorageRemove(key)`

Remove a browser local storage key

#### Arguments

**key -**
The key string

#### Returns

Nothing

---

### localStorageSet

`localStorageSet(key, value)`

Set a browser local storage key's value

#### Arguments

**key -**
The key string

**value -**
The value string

#### Returns

Nothing

---

### markdownPrint

`markdownPrint(lines...)`

Render Markdown text

#### Arguments

**lines... -**
The Markdown text lines (may contain nested arrays of un-split lines)

#### Returns

Nothing

---

### sessionStorageClear

`sessionStorageClear()`

Clear all keys from the browser's session storage

#### Arguments

None

#### Returns

Nothing

---

### sessionStorageGet

`sessionStorageGet(key)`

Get a browser session storage key's value

#### Arguments

**key -**
The key string

#### Returns

The session storage value string or null if the key does not exist

---

### sessionStorageRemove

`sessionStorageRemove(key)`

Remove a browser session storage key

#### Arguments

**key -**
The key string

#### Returns

Nothing

---

### sessionStorageSet

`sessionStorageSet(key, value)`

Set a browser session storage key's value

#### Arguments

**key -**
The key string

**value -**
The value string

#### Returns

Nothing

---

### windowClipboardRead

`windowClipboardRead()`

Read text from the clipboard

#### Arguments

None

#### Returns

The clipboard text

---

### windowClipboardWrite

`windowClipboardWrite(text, type = "text/plain")`

Write text (or binary data) to the clipboard

#### Arguments

**text -**
The text string or byte value array (integers 0 to 255) to write

**type** (optional, default `"text/plain"`) **-**
The clipboard content type. Binary data needs its content type, e.g. "image/png".

#### Returns

Nothing

---

### windowHeight

`windowHeight()`

Get the browser window's height

#### Arguments

None

#### Returns

The browser window's height

---

### windowKeyState

`windowKeyState(key, ctrl = false, shift = false, alt = false, meta = false)`

Test whether a key combination is currently held down. Unlike `documentSetKeyDown`, which
fires a callback once per key press, this polls the live keyboard state and is intended for
game loops and animations. The modifier-key states must match exactly, so by default the key
must be pressed with no modifier keys held. For example:

```bare-script
if windowKeyState('ArrowLeft'):
    playerX = playerX - playerSpeed
endif
if windowKeyState('ArrowRight'):
    playerX = playerX + playerSpeed
endif
```

The key is matched against the physical key code (e.g., "ArrowUp", "KeyW", "Space", "Enter").

#### Arguments

**key -**
The physical key code (e.g., "ArrowUp", "ArrowDown", "KeyA", "KeyW", "Space")

**ctrl** (optional, default `false`) **-**
If true, the control key must be down; if false, it must be up

**shift** (optional, default `false`) **-**
If true, the shift key must be down; if false, it must be up

**alt** (optional, default `false`) **-**
If true, the alt key must be down; if false, it must be up

**meta** (optional, default `false`) **-**
If true, the meta (command) key must be down; if false, it must be up

#### Returns

true if the key is down and all modifier-key states match, false otherwise

---

### windowPlaySound

`windowPlaySound(sound)`

Play a generated sound effect. Unknown sounds are ignored. The sound name is one of:

- **UI** - "beep", "click", "error", "success", "warning"
- **Arcade** - "coin", "jump", "laser", "explosion", "powerup", "powerdown", "hit", "blip", "gameover"
- **Notes** - "noteC4", "noteCs4", "noteD4", "noteDs4", "noteE4", "noteF4", "noteFs4", "noteG4",
  "noteGs4", "noteA4", "noteAs4", "noteB4", "noteC5"
- **Drums** - "drumKick", "drumSnare", "drumHihat", "drumOpenhat", "drumTomLow", "drumTomMid",
  "drumTomHigh", "drumClap", "drumCrash", "drumRide"

#### Arguments

**sound -**
The sound name

#### Returns

Nothing

---

### windowSetLocation

`windowSetLocation(url)`

Navigate the browser window to a location URL

#### Arguments

**url -**
The new location URL

#### Returns

Nothing

---

### windowSetResize

`windowSetResize(callback)`

Set the browser window resize event handler

#### Arguments

**callback -**
The window resize callback function

#### Returns

Nothing

---

### windowSetTimeout

`windowSetTimeout(callback, delay)`

Set the browser window timeout event handler

#### Arguments

**callback -**
The window timeout callback function

**delay -**
The delay, in milliseconds, to ellapse before calling the timeout

#### Returns

Nothing

---

### windowURLObject

`windowURLObject(data, contentType = "text/plain")`

Create an object URL (i.e. a file download URL)

#### Arguments

**data -**
The object data string or byte value array

**contentType** (optional, default `"text/plain"`) **-**
The object content type

#### Returns

The object URL string

---

### windowWidth

`windowWidth()`

Get the browser window's width

#### Arguments

None

#### Returns

The browser window's width

---

## pager.bare

The "pager.bare" include library is a simple, configurable, paged MarkdownUp application. The pager
renders a menu of links to your pages and navigation links (start, next, previous). It supports
three page types: function pages, Markdown pages, and external links.

Run the pager by defining a [pager model] and calling the [pagerMain] function. Its options hide the
menu or navigation links, set the start page, and add your own URL arguments.

```bare-script
include <pager.bare>

function funcPage(args):
    markdownPrint('This is page "' + objectGet(args, 'page') + '"')
endfunction

pagerModel = { \
    'pages': [ \
        {'name': 'Function Page', 'type': {'function': {'function': funcPage, 'title': 'The Function Page'}}}, \
        {'name': 'Markdown Page', 'type': {'markdown': {'url': 'README.md'}}}, \
        {'name': 'Link Page', 'type': {'link': {'url': 'external.html'}}} \
    ] \
}
pagerMain(pagerModel)
```


[pager model]: model.html#var.vName='Pager'
[pagerMain]: #var.vGroup='pager.bare'&pagermain


---

### pagerMain

`pagerMain(pagerModel, options)`

**async** - The calling function must be declared with "async function"

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
- **keyboard** - Enable keyboard commands (right-arrow or 'n' for next, left-arrow or 'p' for previous,
  's' for start, 'e' for end)

#### Returns

Nothing

---

### pagerValidate

`pagerValidate(pagerModel)`

Validate a pager model

#### Arguments

**pagerModel -**
The [pager model](model.html#var.vName='Pager')

#### Returns

The validated [pager model](model.html#var.vName='Pager') or null if validation fails

---

## qrcode.bare

The "qrcode.bare" include library draws QR codes with the
[draw.bare](#var.vGroup='draw.bare'&_top) include library. See the
[live QR code generator demo](https://craigahobbs.github.io/qrcode/) for an interactive example.

```bare-script
include <draw.bare>
include <qrcode.bare>

drawNew(300, 300)
qrcodeDraw('https://craigahobbs.github.io/qrcode/', 0, 0, 300)
drawRender()
```


---

### qrcodeDraw

`qrcodeDraw(message, x, y, size, level = 'low')`

Draw a QR code at the specified position and size

#### Arguments

**message -**
The QR code message or the QR code matrix

**x -**
The X-coordinate, in pixels, of the left-side of the QR code

**y -**
The Y-coordinate, in pixels, of the top of the QR code

**size -**
The size of the QR code, in pixels

**level** (optional, default `'low'`) **-**
The error correction level: 'low', 'medium', 'quartile', or 'high'

#### Returns

Nothing

---

### qrcodeElements

`qrcodeElements(message, size, level = 'low')`

Generate the element model for a QR code

#### Arguments

**message -**
The QR code message or the QR code matrix

**size -**
The size of the QR code, in pixels

**level** (optional, default `'low'`) **-**
The error correction level: 'low', 'medium', 'quartile', or 'high'

#### Returns

The QR code SVG [element model](https://github.com/craigahobbs/element-model#readme)

---

### qrcodeMatrix

`qrcodeMatrix(message, level = 'low')`

Generate a QR code pixel matrix

#### Arguments

**message -**
The QR code message

**level** (optional, default `'low'`) **-**
The error correction level: 'low', 'medium', 'quartile', or 'high'

#### Returns

The QR code pixel matrix

---

## schema.bare

The "schema.bare" include library validates values using
[Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) type models. Schema
Markdown is a human-readable schema definition language - parse it into a type model with the
[schemaParser.bare](#var.vGroup='schemaParser.bare'&_top) include library. Validation checks types,
required members, and value and length constraints, and converts strings to their member types.

```bare-script
include <schema.bare>
include <schemaParser.bare>

types = schemaParse( \
    'struct Person', \
    '    string name', \
    '    int age', \
    '    optional string email' \
)
person = schemaValidate(types, 'Person', {'name': 'Alice', 'age': 30})
```


---

### schemaGetEnumValues

`schemaGetEnumValues(types, enum)`

Get an enum's values (inherited values first)

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

**enum -**
The [enum model](https://craigahobbs.github.io/bare-script/model/#var.vName='Enum'&var.vURL='')

#### Returns

The array of [enum value models](https://craigahobbs.github.io/bare-script/model/#var.vName='EnumValue'&var.vURL='')

---

### schemaGetReferencedTypes

`schemaGetReferencedTypes(types, typeName, referencedTypes = null)`

Get a user type's referenced [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

**typeName -**
The type name

**referencedTypes** (optional) **-**
A map of referenced user type name to user type model to update

#### Returns

The referenced [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

---

### schemaGetStructMembers

`schemaGetStructMembers(types, struct)`

Get a struct's members (inherited members first)

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

**struct -**
The [struct model](https://craigahobbs.github.io/bare-script/model/#var.vName='Struct'&var.vURL='')

#### Returns

The array of [struct member models](https://craigahobbs.github.io/bare-script/model/#var.vName='StructMember'&var.vURL='')

---

### schemaValidate

`schemaValidate(types, typeName, value, memberFqn = null)`

Validate a value using a schema [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='').
Container values are duplicated since some member types are transformed during validation.

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

**typeName -**
The type name

**value -**
The value to validate

**memberFqn** (optional, default `null`) **-**
The fully-qualified member name (for error messages)

#### Returns

The validated, transformed value, or null if validation fails

---

### schemaValidateEx

`schemaValidateEx(types, typeName, value, memberFqn = null)`

Validate a value using a schema [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')
with programmatic error reporting. Container values are duplicated since some member types are
transformed during validation.

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

**typeName -**
The type name

**value -**
The value to validate

**memberFqn** (optional, default `null`) **-**
The fully-qualified member name (for error messages)

#### Returns

On success, an object with the "result" key set to the validated, transformed value.
On failure, an object with the "error" key set to the validation error message and the
"memberFqn" key set to the fully-qualified member name (or null).

---

## schemaDoc.bare

The "schemaDoc.bare" include library generates documentation for
[Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) schemas - useful for
documenting options objects, file formats, and APIs. Run the documentation application for a Schema
Markdown file, or generate the Markdown documentation for a single type:

```bare-script
include <schemaDoc.bare>

schemaDocMain('my-schema.smd', 'My Schema Documentation')

markdownPrint(schemaDocMarkdown(types, 'MyStruct'))
```


---

### schemaDocMain

`schemaDocMain(url = null, title = null, hideNoGroup = false)`

**async** - The calling function must be declared with "async function"

The Schema Markdown documentation viewer main entry point

#### Arguments

**url** (optional, default `null`) **-**
The Schema Markdown text or JSON resource URL. If null, the Schema Markdown type model is displayed.

**title** (optional, default `null`) **-**
The schema title. If null, the URL is used as the title.

**hideNoGroup** (optional, default `false`) **-**
If true, hide types with no group

#### Returns

Nothing

---

### schemaDocMarkdown

`schemaDocMarkdown(types, typeName, options = null)`

Generate the Schema Markdown user type documentation as an array of Markdown text lines

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

**typeName -**
The type name

**options** (optional, default `null`) **-**
The options object with optional members:
- **actionURLs** - The [action URLs](https://craigahobbs.github.io/bare-script/model/#var.vName='ActionURL'&var.vURL='') override
- **actionCustom** - If true, the action has a custom response (default is false)
- **headerPrefix** - The top-level header prefix string (default is "#")
- **hideReferenced** - If true, referenced types are not rendered (default is false)

#### Returns

The array of Markdown text lines

---

## schemaParser.bare

The "schemaParser.bare" include library parses
[Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) text into a
[type model](model.html#var.vName='Types'&var.vURL='') for validating values with the
[schema.bare](#var.vGroup='schema.bare'&_top) include library.

```bare-script
include <schemaParser.bare>

types = schemaParse( \
    '# A person', \
    'struct Person', \
    '', \
    "    # The person's name", \
    '    string name' \
)
```


---

### schemaParse

`schemaParse(lines...)`

Parse the [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) text

#### Arguments

**lines... -**
The [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/)
text lines (may contain nested arrays of un-split lines)

#### Returns

The schema's [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL=''),
or null if parsing fails

---

### schemaParseEx

`schemaParseEx(lines, types = null, filename = "", validate = true)`

Parse the [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) text
with options and programmatic error reporting

#### Arguments

**lines -**
The [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) text
string, or an array of strings (may contain nested arrays of un-split lines)

**types** (optional) **-**
The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='') to update

**filename** (optional, default `""`) **-**
The file name (for error messages)

**validate** (optional, default `true`) **-**
If true, validate the type model after parsing

#### Returns

On success, an object with the "result" key set to the schema's
[type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='').
On failure, an object with the "errors" key set to the array of error message strings.

---

## schemaTypeModel.bare

The "schemaTypeModel.bare" include library provides the
[Schema Markdown type model](model.html#var.vName='Types'&var.vURL='') - the model of type models -
and type model validation functions. Validate a type model you did not parse yourself, such as one
loaded from JSON:

```bare-script
include <schemaTypeModel.bare>

types = schemaTypeModelValidate(jsonParse(systemFetch('model.json')))
```


---

### schemaTypeModel

`schemaTypeModel()`

Get the [Schema Markdown Type Model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

#### Arguments

None

#### Returns

The [Schema Markdown Type Model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

---

### schemaTypeModelValidate

`schemaTypeModelValidate(types)`

Validate a [Schema Markdown Type Model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='') to validate

#### Returns

The validated [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL=''),
or null if validation fails

---

### schemaTypeModelValidateEx

`schemaTypeModelValidateEx(types)`

Validate a [Schema Markdown Type Model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='')
with programmatic error reporting

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='') to validate

#### Returns

On success, an object with the "result" key set to the validated
[type model](https://craigahobbs.github.io/bare-script/model/#var.vName='Types'&var.vURL='').
On failure, an object with the "errors" key set to the array of error message strings.

---

## tar.bare

The "tar.bare" include library creates and extracts tar archives, as byte value arrays (arrays of
integers 0 to 255). Combine it with the [gzip.bare](#var.vGroup='gzip.bare'&_top) include library
for ".tar.gz" files. In MarkdownUp, [windowURLObject](#var.vGroup='markdownUp.bare'&windowurlobject)
creates a download URL for the archive:

```bare-script
include <gzip.bare>
include <tar.bare>

tarGzBytes = gzipCompress(tarCreate([ \
    {'name': 'README.md', 'bytes': '# My Project\n'}, \
    {'name': 'data/values.bin', 'bytes': [0, 128, 255]} \
]))
downloadURL = windowURLObject(tarGzBytes, 'application/gzip')
```


---

### tarCreate

`tarCreate(files)`

Create a tar archive (USTAR format) from an array of regular files. Each file has mode 644,
and no directory entries are written.

#### Arguments

**files -**
The array of file objects. Each file object has the following members:
- **name** - the file path
- **bytes** - the file content byte value array (integers 0 to 255) or string (as UTF-8)
- **mtime** - the optional file modification datetime (default is the Unix epoch)

#### Returns

The tar archive byte value array, or null if creation fails

---

### tarExtract

`tarExtract(bytes)`

Extract the regular files of a tar archive (USTAR, GNU, or PAX format). Directory, link,
and other entries are skipped.

#### Arguments

**bytes -**
The tar archive byte value array (integers 0 to 255)

#### Returns

The array of file objects, each with **name**, **bytes**, and **mtime** (the modification datetime)
members, or null if extraction fails

---

## unittest.bare

The "unittest.bare" include library contains functions for unit testing code. The typical project
layout is as follows:

```
|-- code1.bare
`-- test
    |-- runTests.md
    |-- runTests.bare
    `-- testCode1.bare
```

**runTests.md** is a Markdown document that runs the unit test application in
[MarkdownUp](https://github.com/craigahobbs/markdown-up#readme):

```markdown
~~~markdown-script
include 'runTests.bare'
~~~
```

**runTests.bare** is the unit test application. It includes the test files, any number of them,
within coverage start and stop calls, then renders the test report with
[unittestReport](#var.vGroup='unittest.bare'&unittestreport), returning the number of failures:

```bare-script
include <unittest.bare>

unittestCoverageStart()
include 'testCode1.bare'
unittestCoverageStop()

return unittestReport({'coverageMin': 100})
```

**testCode1.bare** contains the unit tests for "code1.bare". Each test is a function, run with
[unittestRunTest](#var.vGroup='unittest.bare'&unittestruntest), that asserts with
[unittestEqual](#var.vGroup='unittest.bare'&unittestequal) and
[unittestDeepEqual](#var.vGroup='unittest.bare'&unittestdeepequal):

```bare-script
include <unittest.bare>
include '../code1.bare'

function testCode1SumNumbers():
    unittestEqual(sumNumbers(1, 2, 3), 6)
endfunction
unittestRunTest('testCode1SumNumbers')

function testCode1SumNumberArrays():
    unittestDeepEqual(sumNumberArrays([1, 2, 3], [4, 5, 6]), [6, 15])
endfunction
unittestRunTest('testCode1SumNumberArrays')
```

To run the unit tests on the command line, use the
[BareScript CLI](https://github.com/craigahobbs/bare-script#the-barescript-command-line-interface-cli)
with the `-m` argument. The command exits with an error status if any test fails:

```
bare -m test/runTests.bare
```


---

### unittestCoverageStart

`unittestCoverageStart()`

Start coverage data collection

#### Arguments

None

#### Returns

Nothing

---

### unittestCoverageStop

`unittestCoverageStop()`

Stop coverage data collection

#### Arguments

None

#### Returns

Nothing

---

### unittestDeepEqual

`unittestDeepEqual(actual, expected, description)`

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

`unittestEqual(actual, expected, description)`

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

`unittestReport(options = null)`

Render the unit test report

#### Arguments

**options** (optional, default `null`) **-**
The unittest report options object. The following options are available:
- **coverageExclude** - array of script names to exclude from coverage
- **coverageMin** - verify minimum coverage percent (0 - 100)
- **links** - the array of page links
- **title** - the page title

#### Returns

The number of unit test failures

---

### unittestRunTest

`unittestRunTest(testName)`

**async** - The calling function must be declared with "async function"

Run a unit test. Running the same test name twice records a warning.

#### Arguments

**testName -**
The test function name

#### Returns

Nothing

---

## unittestMock.bare

The "unittestMock.bare" include library mocks functions for unit testing. Consider the following
MarkdownUp application, whose
[documentSetTitle](#var.vGroup='markdownUp.bare'&documentsettitle) and
[markdownPrint](#var.vGroup='markdownUp.bare'&markdownprint) calls have external side effects:

**app.bare**

```bare-script
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
```

To test it, call [unittestMockAll](#var.vGroup='unittestMock.bare'&unittestmockall) at the start
of the test function to mock all library functions with externalities. At the end of the test, stop
mocking with [unittestMockEnd](#var.vGroup='unittestMock.bare'&unittestmockend), which returns the
mocked function calls, and check them with
[unittestDeepEqual](#var.vGroup='unittest.bare'&unittestdeepequal). The test file is run by the
[unit test application](#var.vGroup='unittest.bare'&_top), as usual.

**testApp.bare**

```bare-script
include <unittest.bare>
include <unittestMock.bare>
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
            ['markdownPrint', ['', '- 0']], \
            ['markdownPrint', ['', '- 1']], \
            ['markdownPrint', ['', '- 2']] \
        ] \
    )
endfunction
unittestRunTest('testApp')
```


---

### unittestMockAll

`unittestMockAll(data = null)`

Start mocking all BareScript and MarkdownUp library functions with externalities.
To stop mocking, call the [unittestMockEnd](#var.vGroup='unittestMock.bare'&unittestmockend) function.
Mock data sets the return values of the mocked functions. For example:

```bare-script
include <unittest.bare>
include <unittestMock.bare>

function greeting():
    return 'Hello, ' + documentInputValue('name')
endfunction

function testGreeting():
    unittestMockAll({'documentInputValue': {'name': 'Alice'}})
    unittestEqual(greeting(), 'Hello, Alice')
    unittestDeepEqual(unittestMockEnd(), [['documentInputValue', ['name']]])
endfunction
unittestRunTest('testGreeting')
```

#### Arguments

**data** (optional, default `null`) **-**
The map of function name to mock function data.
The following functions make use of mock data:
- **documentInputValue** - map of id to return value
- **systemFetch** - map of URL to response text (or byte value array, for a binary request)

#### Returns

Nothing

---

### unittestMockEnd

`unittestMockEnd()`

Stop all function mocks

#### Arguments

None

#### Returns

The array of mock function call tuples of the form (function name, function argument array)

---

### unittestMockOne

`unittestMockOne(funcName, mockFunc)`

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

`unittestMockOneGeneric(funcName)`

Start a generic function mock.
To stop mocking, call the [unittestMockEnd](#var.vGroup='unittestMock.bare'&unittestmockend) function.

#### Arguments

**funcName -**
The name of the function to mock

#### Returns

Nothing

---

## url.bare

The "url.bare" include library percent-encodes and decodes URLs and URL components, and encodes and
decodes query strings. Query string encoding recurses objects and arrays, expressing each member
key in fully-qualified form:

```bare-script
include <url.bare>

queryString = urlEncodeQueryString({'name': 'Alice', 'scores': [90, 85]})
# name=Alice&scores.0=90&scores.1=85
```


---

### urlDecodeComponent

`urlDecodeComponent(string)`

Decode a percent-encoded string component. The plus character is not decoded to a space character.

#### Arguments

**string -**
The percent-encoded string

#### Returns

The decoded string, or null if decoding fails

---

### urlDecodeQueryString

`urlDecodeQueryString(queryString)`

Decode an object from a query string. Each member key of the query string is expressed in
fully-qualified form. Array keys are the index into the array, and must be in order.

#### Arguments

**queryString -**
The query string

#### Returns

The decoded object, or null if decoding fails. All decoded leaf values are strings.

---

### urlEncode

`urlEncode(url)`

Encode a URL. Letters, digits, and the characters ";,/?:@&=+$-_.!~*'#" are not
percent-encoded. Parentheses are percent-encoded (for Markdown links).

#### Arguments

**url -**
The URL string

#### Returns

The encoded URL string

---

### urlEncodeComponent

`urlEncodeComponent(url)`

Encode a URL component. Letters, digits, and the characters "-_.!~*'" are not
percent-encoded. Parentheses are percent-encoded (for Markdown links).

#### Arguments

**url -**
The URL component string

#### Returns

The encoded URL component string

---

### urlEncodeQueryString

`urlEncodeQueryString(obj)`

Encode an object as a query string. Objects and arrays are recursed. Each member key is
expressed in fully-qualified form. Array keys are the index into the array, and are in order.

#### Arguments

**obj -**
The object to encode

#### Returns

The encoded query string
