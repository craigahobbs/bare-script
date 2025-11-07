# The BareScript Language

BareScript is a simple, lightweight, and portable programming language. Its Pythonic syntax is
influenced by JavaScript, C, and the Unix Shell.

For example, the following script computes the first ten Fibonacci numbers and returns them as an
array.

~~~ barescript
# Compute the first "count" Fibonacci numbers
function fibonacci(count):
    numbers = [0, 1]
    while arrayLength(numbers) < count:
        arrayPush(numbers, arrayGet(numbers, arrayLength(numbers) - 1) + \
            arrayGet(numbers, arrayLength(numbers) - 2))
    endwhile
    return numbers
endfunction

# Return the first ten Fibonacci numbers
return fibonacci(10)
~~~


## Links

- [BareScript for JavaScript](https://github.com/craigahobbs/bare-script#readme)
- [BareScript for Python](https://github.com/craigahobbs/bare-script-py#readme)
- [The BareScript Library](../library/)
- [The BareScript Expression Library](../library/expression.html)


## Table of Contents

- [Value Types](#value-types)
- [Statements](#statements)
  - [Expression and Assignment Statements](#expression-and-assignment-statements)
  - [Comments](#comments)
  - [Function Definition Statements](#function-definition-statements)
  - [Return Statements](#return-statements)
  - [If-Then Statements](#if-then-statements)
  - [While-Do Statements](#while-do-statements)
  - [Foreach Statements](#foreach-statements)
  - [Break and Continue Statements](#break-and-continue-statements)
  - [Jump and Label Statements](#jump-and-label-statements)
  - [Include Statements](#include-statements)
  - [Multiline Statements](#multiline-statements)
  - [The BareScript Library](#the-barescript-library)
- [Expressions](#expressions)
  - [Number Expressions](#number-expressions)
  - [String Expressions](#string-expressions)
  - [Variable Lookup Expressions](#variable-lookup-expressions)
  - [Function Call Expressions](#function-call-expressions)
  - [Binary Operator Expressions](#binary-operator-expressions)
  - [Unary Operator Expressions](#unary-operator-expressions)
  - [Group Expressions](#group-expressions)
  - [The BareScript Expression Library](#the-barescript-expression-library)
- [Emacs Mode](#emacs-mode)


## Value Types

BareScript supports the following value types:

- **null** - The null value, represented by the `null` keyword
- **boolean** - Boolean values `true` and `false`
- **number** - Numeric values (integers and floating-point numbers)
- **string** - Text strings enclosed in single or double quotes
- **datetime** - Date and time values
- **array** - Ordered collections of values, created with array literal syntax (e.g., `[1, 2, 3]`)
- **object** - Key-value collections, created with object literal syntax (e.g., `{'a': 1, 'b': 2}`)
- **function** - Function values
- **regex** - Regular expression values


### Object and Array Literals

Objects and arrays can be created using literal syntax:

~~~ barescript
# Create an array
numbers = [1, 2, 3, 4, 5]

# Create an object
person = {'name': 'John', 'age': 30}

# Nested structures
data = {'values': [1, 2, 3], 'metadata': {'count': 3}}
~~~

**Note:** Bracket access syntax (e.g., `obj['key']` or `array[0]`) is **not** supported for
accessing object properties or array elements. Use the library functions instead:

- `objectGet(obj, 'key')` - Get an object property value
- `objectSet(obj, 'key', value)` - Set an object property value
- `arrayGet(array, index)` - Get an array element
- `arraySet(array, index, value)` - Set an array element

~~~ barescript
# Access object properties
obj = {'a': 1, 'b': [1, 2]}
valueA = objectGet(obj, 'a')
valueB = objectGet(obj, 'b')

# Access array elements
firstElement = arrayGet(valueB, 0)
~~~


## Statements

A BareScript script consists of one or more statements. The following sections describe the
different types of statements.


### Expression and Assignment Statements

Expression statements evaluate an [expression](#expressions) and discard the result. In the
following example, we evaluate a function call expression:

~~~ barescript
systemLog('Hello, World!')
~~~

Similarly, a variable assignment statement evaluates an expression and assigns the result to a
variable. If the statement is in the global scope, the variable is global. Otherwise, the variable
is a function-local variable. For example:

~~~ barescript
a = 5
b = 7
c = a + b
~~~


### Comments

Comments in BareScript are any line that begins with the "#" character. For example:

~~~ barescript
# Initialize the "a" variable
a = 0

# Return the value of "a" plus 1
return a + 1
~~~


### Function Definition Statements

Functions are defined using `function` statements. A function statement consists of the function
name and its argument names within parentheses. Until the `endfunction` statement, all statements
that follow belong to the function. When the function executes, its arguments are available as local
variables. For example:

~~~ barescript
function getMinMax(a, b, c, d):
    return [mathMin(a, b, c, d), mathMax(a, b, c, d)]
endfunction

return getMinMax(1, 2, 3, 5)
~~~

A function that makes any **asynchronous** function call (e.g.,
[systemFetch](../library/#var.vGroup='System'&systemfetch)) must be defined as asynchronous. For example:

~~~ barescript
async function getLibraryCount(url):
    return arrayLength(objectGet(systemFetch(url), 'functions'))
endfunction

return getLibraryCount('https://craigahobbs.github.io/bare-script/library/library.json')
~~~


### Return Statements

Return statements return from the current program scope. If there is a return
[expression](#expressions), it is evaluated, and the result is returned. For example:

~~~ barescript
function addNumbers(a, b):
    return a + b
endfunction

return addNumbers(0, 1)
~~~


### If-Then Statements

If-then statements allow you to execute a sequence of statements conditionally. For example:

~~~ barescript
if a < 0:
    b = 1
elif a > 0:
    b = 2
else:
    b = 3
endif
~~~


### While-Do Statements

While-do statements allow you to loop over a sequence of statements as long as the loop expression
is true. For example:

~~~ barescript
i = 0
sum = 0
while i < 10:
    sum = sum + i
    i = i + 1
endwhile
~~~


### Foreach Statements

Foreach statements allow you to loop over a sequence of statements for each value in an array.
For example:

~~~ barescript
values = [1, 2, 3]
sum = 0
for value in values:
    sum = sum + value
endfor
~~~

You can also access the array value index:

~~~ barescript
values = [1, 2, 3]
sum = 0
for value, ixValue in values:
    sum = sum + ixValue * value
endfor
~~~


### Break and Continue Statements

To stop a while-do loop or a foreach loop using a break statement. For example:

~~~ barescript
i = 0
while i < 10:
    if i > 5:
        break
    endif
    i = i + 1
endwhile
~~~

To skip the remaining statements in an iteration using a continue statement. For example:

~~~ barescript
values = [1, -2, 3]
sum = 0
for value, ixValue in values:
    if value < 0:
        continue
    endif
    sum = sum + value
endfor
~~~


### Jump and Label Statements

A `jump` statement sets the current program statement to a label. A `jumpif` statement jumps only if
its test [expression](#expressions) evaluates to true. Labels are defined by specifying the label
name followed by a colon.

The example below uses `jump`, `jumpif`, and label statements to sum the values of an array:

~~~ barescript
values = [1, 2, 3, 5, 7]
sum = 0
ixValue = 0
valueLoop:
    jumpif (ixValue >= arrayLength(values)) valueLoopDone
    value = arrayGet(values, ixValue)
    sum = sum + value
    ixValue = ixValue + 1
jump valueLoop
valueLoopDone:
~~~


### Include Statements

Include statements load and evaluate a script file in the global scope. For example:

~~~ barescript
include 'util.bare'

return concatStrings('abc', 'def')
~~~

The contents of "util.bare" are:

~~~ barescript
function concatStrings(a, b):
    return a + b
endfunction
~~~


#### System Include Statements

System include statements are similar to include statements, but relative paths are resolved to be
relative to the system include prefix. For example:

~~~
include <util.bare>
~~~


### Multiline Statements

Long statements can be broken into multiple lines using the line continuation syntax, a trailing "\\"
character. For example:

~~~ barescript
colors = [ \
    'red', \
    'green', \
    'blue' \
]
return arrayJoin(colors, ', ')
~~~


### The BareScript Library

The [BareScript Library](../library/) is a set of built-in, general-purpose global functions
available to all BareScript scripts. The library contains functions for creating and manipulating
objects, arrays, datetimes, regular expressions, and strings. There are also functions for
parsing/serializing JSON, standard math operations, parsing/formatting numbers, and
[systemFetch](../library/#var.vGroup='System'&systemfetch).

Library functions validate their arguments and will return `null` (or a specified default value) if
given invalid arguments. When debug logging is enabled, library functions log detailed error
messages for invalid arguments.


## Expressions

BareScript expressions are similar to spreadsheet formulas. The different expression types are
described below.


### Number Expressions

Number expressions are decimal numbers with support for integers, floating-point numbers, scientific
notation, and hexadecimal integers. For example:

~~~ barescript
# Integer
5
-1

# Floating-point
3.14159
-2.5

# Scientific notation
1.5e10
3e-5
-2.1e-3

# Hexadecimal (prefix with 0x)
0xFF
0x1A
0xDEADBEEF
~~~


### String Expressions

String expressions are specified with single or double quotes. Quotes and other special characters
are escaped using a preceding backslash character.

~~~ barescript
'abc'
"def"
'that\'s a "quote"'
"that's a \"quote\""
~~~

The following escape sequences are supported:

- `\\` - Backslash
- `\'` - Single quote
- `\"` - Double quote
- `\n` - Newline
- `\r` - Carriage return
- `\t` - Tab
- `\b` - Backspace
- `\f` - Form feed
- `\uXXXX` - Unicode character (where XXXX is a 4-digit hexadecimal code)

~~~ barescript
'Line 1\nLine 2'
'Tab\tseparated'
'Unicode: \u0041\u0042\u0043'  # 'ABC'
~~~

Strings are concatenated using the addition operator:

~~~ barescript
'abc' + 'def'
~~~


### Variable Lookup Expressions

Variable lookup expressions retrieve the value of a variable. A variable lookup expression is simply
the variable name, or if the variable name has non-alphanumeric characters, the variable name is
wrapped in open and close brackets. For example:

~~~ barescript
x
fooBar
[Height (ft)]
~~~


#### Special Variables

BareScript has the following special variables: `null`, `false`, and `true`. Special variables
cannot be overridden.


### Function Call Expressions

Function calls are specified as the function name followed by an open parenthesis, the function
argument expressions separated by commas, and a close parenthesis. For example:

~~~ barescript
max(0, sin(x))
~~~


#### The Built-In `if` Function

The built-in `if` function has the special behavior that only the true expression is evaluated if
the test expression is true. Likewise, only the false expression is evaluated if the test expression
is false.

~~~ barescript
v = if(a == b, fn1(), fn2())
~~~


### Binary Operator Expressions

Binary operator expressions perform an operation on the result of two other expressions. The
following operators are supported (in order of evaluation precedence):

- **Arithmetic operators** - `+`, `-`, `*`, `/`, `%`, `**`
  - Addition (`+`) works with:
    - number + number
    - string + string (concatenation)
    - string + any type (converts right operand to string)
    - any type + string (converts left operand to string)
    - datetime + number (adds milliseconds)
    - number + datetime (adds milliseconds)
  - Subtraction (`-`) works with:
    - number - number
    - datetime - datetime (returns difference in milliseconds)
  - Multiplication (`*`), division (`/`), modulo (`%`), and exponentiation (`**`) work with:
    - number operator number

- **Bitwise operators** - `&`, `|`, `^`, `<<`, `>>`
  - All bitwise operators require integer operands and return integers

- **Comparison operators** - `==`, `!=`, `<`, `<=`, `>`, `>=`
  - Comparison operators work with all value types
  - Values of different types are compared by type name
  - null is less than all other values

- **Logical operators** - `&&`, `||`
  - Logical operators use short-circuit evaluation
  - `&&` returns the left operand if it's falsy, otherwise returns the right operand
  - `||` returns the left operand if it's truthy, otherwise returns the right operand

If an operator is used with incompatible types, the expression returns `null`.

For example:

~~~ barescript
a + 1
sin(x) / x
'Hello, ' + name
date1 - date2
x >= 0 && x < 10
~~~

Click here for the [list of binary operators](../model/#var.vName='BinaryExpressionOperator') in
order of evaluation precedence.


### Unary Operator Expressions

Unary operator expressions perform an operation on the result of another expression. The following
operators are supported:

- **Logical NOT** (`!`) - Returns the boolean negation of the operand
- **Numeric negation** (`-`) - Returns the negation of a number operand
- **Bitwise NOT** (`~`) - Returns the bitwise complement of an integer operand

If an operator is used with an incompatible type, the expression returns `null`.

For example:

~~~ barescript
!a
-x
~flags
~~~

Click here for the [list of unary operators](../model/#var.vName='UnaryExpressionOperator') in order
of evaluation precedence.


### Group Expressions

Group expressions provide control over expression evaluation order. For example:

~~~ barescript
0.5 * (x + y)
~~~


### The BareScript Expression Library

The [BareScript Expression Library](../library/expression.html) is a set of built-in,
spreadsheet-like global functions available to all expressions. The library contains functions for
manipulating datetimes, strings, standard math operations, and parsing/formatting numbers.


## Emacs Mode

To install the [Emacs](https://www.gnu.org/software/emacs/) BareScript mode add the following to
your .emacs file:

~~~
(package-initialize)

(unless (package-installed-p 'barescript-mode)
  (let ((mode-file (make-temp-file "barescript-mode")))
    (url-copy-file "https://craigahobbs.github.io/bare-script/language/barescript-mode.el" mode-file t)
    (package-install-file mode-file)
    (delete-file mode-file)))
(add-to-list 'auto-mode-alist '("\\.bare\\'" . barescript-mode))
~~~
