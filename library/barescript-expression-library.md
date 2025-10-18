# The BareScript Expression Library

Welcome to the
[BareScript](https://craigahobbs.github.io/bare-script/language/)
Expression Library documentation.


## Table of Contents

- [Array](#var.vPublish=true&var.vSingle=true&array)
- [Datetime](#var.vPublish=true&var.vSingle=true&datetime)
- [Math](#var.vPublish=true&var.vSingle=true&math)
- [Number](#var.vPublish=true&var.vSingle=true&number)
- [Object](#var.vPublish=true&var.vSingle=true&object)
- [String](#var.vPublish=true&var.vSingle=true&string)

---

## Array

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [arrayNew](#var.vPublish=true&var.vSingle=true&arraynew)

---

### arrayNew

Create a new array

#### Arguments

**values... -**
The new array's values

#### Returns

The new array

---

## Datetime

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [date](#var.vPublish=true&var.vSingle=true&date)
- [day](#var.vPublish=true&var.vSingle=true&day)
- [hour](#var.vPublish=true&var.vSingle=true&hour)
- [minute](#var.vPublish=true&var.vSingle=true&minute)
- [month](#var.vPublish=true&var.vSingle=true&month)
- [now](#var.vPublish=true&var.vSingle=true&now)
- [second](#var.vPublish=true&var.vSingle=true&second)
- [today](#var.vPublish=true&var.vSingle=true&today)
- [year](#var.vPublish=true&var.vSingle=true&year)

---

### date

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

### day

Get the day of the month of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The day of the month

---

### hour

Get the hour of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The hour

---

### minute

Get the minute of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The minute

---

### month

Get the month (1-12) of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The month

---

### now

Get the current datetime

#### Arguments

None

#### Returns

The current datetime

---

### second

Get the second of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The second

---

### today

Get today's datetime

#### Arguments

None

#### Returns

Today's datetime

---

### year

Get the full year of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The full year

---

## Math

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [abs](#var.vPublish=true&var.vSingle=true&abs)
- [acos](#var.vPublish=true&var.vSingle=true&acos)
- [asin](#var.vPublish=true&var.vSingle=true&asin)
- [atan](#var.vPublish=true&var.vSingle=true&atan)
- [atan2](#var.vPublish=true&var.vSingle=true&atan2)
- [ceil](#var.vPublish=true&var.vSingle=true&ceil)
- [cos](#var.vPublish=true&var.vSingle=true&cos)
- [floor](#var.vPublish=true&var.vSingle=true&floor)
- [ln](#var.vPublish=true&var.vSingle=true&ln)
- [log](#var.vPublish=true&var.vSingle=true&log)
- [max](#var.vPublish=true&var.vSingle=true&max)
- [min](#var.vPublish=true&var.vSingle=true&min)
- [pi](#var.vPublish=true&var.vSingle=true&pi)
- [rand](#var.vPublish=true&var.vSingle=true&rand)
- [round](#var.vPublish=true&var.vSingle=true&round)
- [sign](#var.vPublish=true&var.vSingle=true&sign)
- [sin](#var.vPublish=true&var.vSingle=true&sin)
- [sqrt](#var.vPublish=true&var.vSingle=true&sqrt)
- [tan](#var.vPublish=true&var.vSingle=true&tan)

---

### abs

Compute the absolute value of a number

#### Arguments

**x -**
The number

#### Returns

The absolute value of the number

---

### acos

Compute the arccosine, in radians, of a number

#### Arguments

**x -**
The number

#### Returns

The arccosine, in radians, of the number

---

### asin

Compute the arcsine, in radians, of a number

#### Arguments

**x -**
The number

#### Returns

The arcsine, in radians, of the number

---

### atan

Compute the arctangent, in radians, of a number

#### Arguments

**x -**
The number

#### Returns

The arctangent, in radians, of the number

---

### atan2

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

Compute the ceiling of a number (round up to the next highest integer)

#### Arguments

**x -**
The number

#### Returns

The ceiling of the number

---

### cos

Compute the cosine of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The cosine of the angle

---

### floor

Compute the floor of a number (round down to the next lowest integer)

#### Arguments

**x -**
The number

#### Returns

The floor of the number

---

### ln

Compute the natural logarithm (base e) of a number

#### Arguments

**x -**
The number

#### Returns

The natural logarithm of the number

---

### log

Compute the logarithm (base 10) of a number

#### Arguments

**x -**
The number

**base -**
Optional (default is 10). The logarithm base.

#### Returns

The logarithm of the number

---

### max

Compute the maximum value

#### Arguments

**values... -**
The values

#### Returns

The maximum value

---

### min

Compute the minimum value

#### Arguments

**values... -**
The values

#### Returns

The minimum value

---

### pi

Return the number pi

#### Arguments

None

#### Returns

The number pi

---

### rand

Compute a random number between 0 and 1, inclusive

#### Arguments

None

#### Returns

A random number

---

### round

Round a number to a certain number of decimal places

#### Arguments

**x -**
The number

**digits -**
Optional (default is 0). The number of decimal digits to round to.

#### Returns

The rounded number

---

### sign

Compute the sign of a number

#### Arguments

**x -**
The number

#### Returns

-1 for a negative number, 1 for a positive number, and 0 for zero

---

### sin

Compute the sine of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The sine of the angle

---

### sqrt

Compute the square root of a number

#### Arguments

**x -**
The number

#### Returns

The square root of the number

---

### tan

Compute the tangent of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The tangent of the angle

---

## Number

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [fixed](#var.vPublish=true&var.vSingle=true&fixed)
- [parseFloat](#var.vPublish=true&var.vSingle=true&parsefloat)
- [parseInt](#var.vPublish=true&var.vSingle=true&parseint)

---

### fixed

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

### parseFloat

Parse a string as a floating point number

#### Arguments

**string -**
The string

#### Returns

The number

---

### parseInt

Parse a string as an integer

#### Arguments

**string -**
The string

**radix -**
Optional (default is 10). The number base.

#### Returns

The integer

---

## Object

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [objectNew](#var.vPublish=true&var.vSingle=true&objectnew)

---

### objectNew

Create a new object

#### Arguments

**keyValues... -**
The object's initial key and value pairs

#### Returns

The new object

---

## String

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [charCodeAt](#var.vPublish=true&var.vSingle=true&charcodeat)
- [endsWith](#var.vPublish=true&var.vSingle=true&endswith)
- [fromCharCode](#var.vPublish=true&var.vSingle=true&fromcharcode)
- [indexOf](#var.vPublish=true&var.vSingle=true&indexof)
- [lastIndexOf](#var.vPublish=true&var.vSingle=true&lastindexof)
- [len](#var.vPublish=true&var.vSingle=true&len)
- [lower](#var.vPublish=true&var.vSingle=true&lower)
- [replace](#var.vPublish=true&var.vSingle=true&replace)
- [rept](#var.vPublish=true&var.vSingle=true&rept)
- [slice](#var.vPublish=true&var.vSingle=true&slice)
- [startsWith](#var.vPublish=true&var.vSingle=true&startswith)
- [text](#var.vPublish=true&var.vSingle=true&text)
- [trim](#var.vPublish=true&var.vSingle=true&trim)
- [upper](#var.vPublish=true&var.vSingle=true&upper)

---

### charCodeAt

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

Create a string of characters from character codes

#### Arguments

**charCodes... -**
The character codes

#### Returns

The string of characters

---

### indexOf

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

### lastIndexOf

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

### len

Get the length of a string

#### Arguments

**string -**
The string

#### Returns

The string's length; zero if not a string

---

### lower

Convert a string to lower-case

#### Arguments

**string -**
The string

#### Returns

The lower-case string

---

### replace

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

### rept

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

### startsWith

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

Create a new string from a value

#### Arguments

**value -**
The value

#### Returns

The new string

---

### trim

Trim the whitespace from the beginning and end of a string

#### Arguments

**string -**
The string

#### Returns

The trimmed string

---

### upper

Convert a string to upper-case

#### Arguments

**string -**
The string

#### Returns

The upper-case string
