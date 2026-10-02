# The BareScript Expression Library

Welcome to the [BareScript](https://craigahobbs.github.io/bare-script/language/) Expression Library
documentation. The expression library is the set of spreadsheet-like functions available when
evaluating standalone
[BareScript expressions](https://craigahobbs.github.io/bare-script/language/#expressions) — for
example, with the implementations' expression APIs (JavaScript `evaluateExpression`, Python
`evaluate_expression`) or the `barescriptEvaluateExpression` builtin.

Each expression function is a short alias of a builtin library function. See
[The BareScript Library](index.html) for the full builtin function documentation.


## Expression Functions

|  |  |
| --- | --- |
| [array](#var.vPublish=true&var.vSingle=true&array) | Create arrays |
| [datetime](#var.vPublish=true&var.vSingle=true&datetime) | Create and query date/time values |
| [math](#var.vPublish=true&var.vSingle=true&math) | Mathematical operations and constants |
| [number](#var.vPublish=true&var.vSingle=true&number) | Parse and format numbers |
| [object](#var.vPublish=true&var.vSingle=true&object) | Create objects |
| [string](#var.vPublish=true&var.vSingle=true&string) | Search, slice, and transform strings |

---

## array

Create arrays

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

## datetime

Create and query date/time values

---

### date

`date(year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0)`

Alias of the `datetimeNew` builtin function.

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

### day

`day(datetime)`

Alias of the `datetimeDay` builtin function.

Get the day of the month of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The day of the month

---

### hour

`hour(datetime)`

Alias of the `datetimeHour` builtin function.

Get the hour of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The hour

---

### millisecond

`millisecond(datetime)`

Alias of the `datetimeMillisecond` builtin function.

Get the millisecond of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The millisecond

---

### minute

`minute(datetime)`

Alias of the `datetimeMinute` builtin function.

Get the minute of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The minute

---

### month

`month(datetime)`

Alias of the `datetimeMonth` builtin function.

Get the month (1-12) of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The month

---

### now

`now()`

Alias of the `datetimeNow` builtin function.

Get the current datetime

#### Arguments

None

#### Returns

The current datetime

---

### second

`second(datetime)`

Alias of the `datetimeSecond` builtin function.

Get the second of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The second

---

### today

`today()`

Alias of the `datetimeToday` builtin function.

Get today's date - the current datetime at midnight, local time

#### Arguments

None

#### Returns

Today's datetime

---

### year

`year(datetime)`

Alias of the `datetimeYear` builtin function.

Get the full year of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The full year

---

## math

Mathematical operations and constants

---

### abs

`abs(x)`

Alias of the `mathAbs` builtin function.

Compute the absolute value of a number

#### Arguments

**x -**
The number

#### Returns

The absolute value of the number

---

### acos

`acos(x)`

Alias of the `mathAcos` builtin function.

Compute the arccosine, in radians, of a number

#### Arguments

**x -**
The number, -1 to 1

#### Returns

The arccosine, in radians, of the number

---

### asin

`asin(x)`

Alias of the `mathAsin` builtin function.

Compute the arcsine, in radians, of a number

#### Arguments

**x -**
The number, -1 to 1

#### Returns

The arcsine, in radians, of the number

---

### atan

`atan(x)`

Alias of the `mathAtan` builtin function.

Compute the arctangent, in radians, of a number

#### Arguments

**x -**
The number

#### Returns

The arctangent, in radians, of the number

---

### atan2

`atan2(y, x)`

Alias of the `mathAtan2` builtin function.

Compute the angle, in radians, between (0, 0) and a point

#### Arguments

**y -**
The Y-coordinate of the point

**x -**
The X-coordinate of the point

#### Returns

The angle, in radians

---

### ceil

`ceil(x)`

Alias of the `mathCeil` builtin function.

Compute the ceiling of a number (round up to the next highest integer)

#### Arguments

**x -**
The number

#### Returns

The ceiling of the number

---

### cos

`cos(x)`

Alias of the `mathCos` builtin function.

Compute the cosine of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The cosine of the angle

---

### floor

`floor(x)`

Alias of the `mathFloor` builtin function.

Compute the floor of a number (round down to the next lowest integer)

#### Arguments

**x -**
The number

#### Returns

The floor of the number

---

### ln

`ln(x)`

Alias of the `mathLn` builtin function.

Compute the natural logarithm (base e) of a number

#### Arguments

**x -**
The number, greater than 0

#### Returns

The natural logarithm of the number

---

### log

`log(x, base = 10)`

Alias of the `mathLog` builtin function.

Compute the logarithm of a number

#### Arguments

**x -**
The number, greater than 0

**base** (optional, default `10`) **-**
The logarithm base, greater than 0 and not 1

#### Returns

The logarithm of the number

---

### max

`max(values...)`

Alias of the `mathMax` builtin function.

Compute the maximum value

#### Arguments

**values... -**
The values

#### Returns

The maximum value

---

### min

`min(values...)`

Alias of the `mathMin` builtin function.

Compute the minimum value

#### Arguments

**values... -**
The values

#### Returns

The minimum value

---

### pi

`pi()`

Alias of the `mathPi` builtin function.

Return the number pi

#### Arguments

None

#### Returns

The number pi

---

### rand

`rand()`

Alias of the `mathRandom` builtin function.

Compute a random number between 0 and 1, inclusive

#### Arguments

None

#### Returns

A random number

---

### round

`round(x, digits = 0)`

Alias of the `mathRound` builtin function.

Round a number to a certain number of decimal places

#### Arguments

**x -**
The number

**digits** (optional, default `0`) **-**
The number of decimal digits to round to

#### Returns

The rounded number

---

### sign

`sign(x)`

Alias of the `mathSign` builtin function.

Compute the sign of a number

#### Arguments

**x -**
The number

#### Returns

-1 for a negative number, 1 for a positive number, and 0 for zero

---

### sin

`sin(x)`

Alias of the `mathSin` builtin function.

Compute the sine of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The sine of the angle

---

### sqrt

`sqrt(x)`

Alias of the `mathSqrt` builtin function.

Compute the square root of a number

#### Arguments

**x -**
The number, 0 or greater

#### Returns

The square root of the number

---

### tan

`tan(x)`

Alias of the `mathTan` builtin function.

Compute the tangent of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The tangent of the angle

---

## number

Parse and format numbers

---

### fixed

`fixed(x, digits = 2, trim = false)`

Alias of the `numberToFixed` builtin function.

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

### parseFloat

`parseFloat(string)`

Alias of the `numberParseFloat` builtin function.

Parse a string as a floating point number

#### Arguments

**string -**
The string

#### Returns

The number

---

### parseInt

`parseInt(string, radix = 10)`

Alias of the `numberParseInt` builtin function.

Parse a string as an integer

#### Arguments

**string -**
The string

**radix** (optional, default `10`) **-**
The number base

#### Returns

The integer

---

## object

Create objects

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

## string

Search, slice, and transform strings

---

### charCodeAt

`charCodeAt(string, index)`

Alias of the `stringCharCodeAt` builtin function.

Get a string index's character code

#### Arguments

**string -**
The string

**index -**
The character index

#### Returns

The character code

---

### endsWith

`endsWith(string, search)`

Alias of the `stringEndsWith` builtin function.

Determine if a string ends with a search string

#### Arguments

**string -**
The string

**search -**
The search string

#### Returns

true if the string ends with the search string, false otherwise

---

### fromCharCode

`fromCharCode(charCodes...)`

Alias of the `stringFromCharCode` builtin function.

Create a string of characters from character codes

#### Arguments

**charCodes... -**
The character codes

#### Returns

The string of characters

---

### indexOf

`indexOf(string, search, index = 0)`

Alias of the `stringIndexOf` builtin function.

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

### lastIndexOf

`lastIndexOf(string, search, index = null)`

Alias of the `stringLastIndexOf` builtin function.

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

### len

`len(string)`

Alias of the `stringLength` builtin function.

Get the length of a string

#### Arguments

**string -**
The string

#### Returns

The string's length; zero if not a string

---

### lower

`lower(string)`

Alias of the `stringLower` builtin function.

Convert a string to lower-case

#### Arguments

**string -**
The string

#### Returns

The lower-case string

---

### replace

`replace(string, substr, newSubstr)`

Alias of the `stringReplace` builtin function.

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

### rept

`rept(string, count)`

Alias of the `stringRepeat` builtin function.

Repeat a string

#### Arguments

**string -**
The string to repeat

**count -**
The number of times to repeat the string

#### Returns

The repeated string

---

### slice

`slice(string, start, end = null)`

Alias of the `stringSlice` builtin function.

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

### startsWith

`startsWith(string, search)`

Alias of the `stringStartsWith` builtin function.

Determine if a string starts with a search string

#### Arguments

**string -**
The string

**search -**
The search string

#### Returns

true if the string starts with the search string, false otherwise

---

### text

`text(value)`

Alias of the `stringNew` builtin function.

Create a new string from a value

#### Arguments

**value -**
The value

#### Returns

The new string

---

### trim

`trim(string)`

Alias of the `stringTrim` builtin function.

Trim the whitespace from the beginning and end of a string

#### Arguments

**string -**
The string

#### Returns

The trimmed string

---

### upper

`upper(string)`

Alias of the `stringUpper` builtin function.

Convert a string to upper-case

#### Arguments

**string -**
The string

#### Returns

The upper-case string
