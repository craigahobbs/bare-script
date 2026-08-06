# The BareScript Language

BareScript is a simple, lightweight, and portable programming language. Its Pythonic syntax is
influenced by JavaScript, C, and the Unix Shell.

For example, the following script computes the first ten Fibonacci numbers and returns them as an
array.

```bare-script
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
```


## Links

- [BareScript for JavaScript](https://github.com/craigahobbs/bare-script#readme)
- [BareScript for Python](https://github.com/craigahobbs/bare-script-py#readme)
- [The BareScript Library](../library/)


## Table of Contents

- [Running a Script](#running-a-script)
- [Value Types](#value-types)
  - [Object and Array Literals](#object-and-array-literals)
  - [Truthiness](#truthiness)
  - [Equality and Comparison](#equality-and-comparison)
- [Statements](#statements)
  - [Expression and Assignment Statements](#expression-and-assignment-statements)
  - [Variable Scope and Globals](#variable-scope-and-globals)
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
- [Errors and Limits](#errors-and-limits)
- [Emacs Mode](#emacs-mode)


## Running a Script

Install either BareScript implementation to get the `bare` command-line interface:

```sh
# JavaScript
npm install -g bare-script

# Python
pip install bare-script
```

Run a script file (BareScript files use the ".bare" extension) or evaluate code directly:

```sh
bare script.bare
bare -c 'systemLog("Hello, World!")'
bare -v vName "'World'" script.bare    # set the global variable "vName" to an expression value
```

BareScript can also be embedded within applications — see the
[JavaScript](https://github.com/craigahobbs/bare-script#readme) and
[Python](https://github.com/craigahobbs/bare-script-py#readme) implementation documentation.


## Value Types

BareScript supports the following value types:

- **null** - The null value, represented by the `null` keyword
- **boolean** - Boolean values `true` and `false`
- **number** - Numeric values (integers and floating-point numbers)
- **string** - Text strings enclosed in single or double quotes
- **datetime** - Date and time values, created with library functions such as `datetimeNew`,
  `datetimeNow`, `datetimeToday`, and `datetimeISOParse` (there is no datetime literal)
- **array** - Ordered collections of values, created with array literal syntax (e.g., `[1, 2, 3]`)
- **object** - Key-value collections, created with object literal syntax (e.g., `{'a': 1, 'b': 2}`)
- **function** - Function values, created by function definition statements or with the
  `systemPartial` library function. Functions are first-class values — a function name evaluates
  to its function value, which may be assigned and passed as an argument.
- **regex** - Regular expression values, created with the `regexNew` library function (there is no
  regex literal)

The `systemType` library function returns a value's type as one of the strings 'array', 'boolean',
'datetime', 'function', 'null', 'number', 'object', 'regex', or 'string'.


### Object and Array Literals

Objects and arrays can be created using literal syntax:

```bare-script
# Create an array
numbers = [1, 2, 3, 4, 5]

# Create an object
person = {'name': 'John', 'age': 30}

# Nested structures
data = {'values': [1, 2, 3], 'metadata': {'count': 3}}
```

Object literal keys are expressions, so computed keys are allowed (e.g., `{key: 1}`, where `key`
is a variable). Keys must evaluate to strings — if any key is not a string, the entire object
literal evaluates to `null`.

**Note:** A trailing comma after the last element (e.g., `[1, 2, ]`) is a syntax error, both in
literals and in function calls.

**Note:** Bracket access syntax (e.g., `obj['key']` or `array[0]`) is **not** supported for
accessing object properties or array elements. Use the library functions instead:

- `objectGet(obj, 'key')` - Get an object property value
- `objectSet(obj, 'key', value)` - Set an object property value
- `arrayGet(array, index)` - Get an array element
- `arraySet(array, index, value)` - Set an array element

```bare-script
# Access object properties
obj = {'a': 1, 'b': [1, 2]}
valueA = objectGet(obj, 'a')
valueB = objectGet(obj, 'b')

# Access array elements
firstElement = arrayGet(valueB, 0)
```


### Truthiness

Conditional statements and expressions (`if`/`elif`, `while`, `jumpif`, the logical operators, the
unary `!` operator, and the built-in `if` function) coerce their test value to a boolean. The
falsy values are:

- `null`
- `false`
- `0`
- `''` (the empty string)
- `[]` (the empty array)

All other values are truthy, including the empty object `{}`. Note that empty arrays are falsy —
this differs from JavaScript — so `if !array:` is true both when `array` is `null` and when it is
empty.


### Equality and Comparison

The equality operators (`==`, `!=`) and ordering operators (`<`, `<=`, `>`, `>=`) compare
**values**, not references:

- Numbers, strings, booleans, and datetimes compare naturally within their type
- Arrays compare element-wise, deeply — `[1, [2, 3]] == [1, [2, 3]]` is true. If one array is a
  prefix of the other, the shorter array is less.
- Objects compare by their sorted key/value pairs — keys first, then values, deeply — so key
  order does not matter: `{'b': 2, 'a': 1} == {'a': 1, 'b': 2}` is true
- `null` is less than all other values
- Values of different types are ordered by comparing their type names (e.g., any number is less
  than any string, since 'number' < 'string')


## Statements

A BareScript script consists of one or more statements. The following sections describe the
different types of statements.


### Expression and Assignment Statements

Expression statements evaluate an [expression](#expressions) and discard the result. In the
following example, we evaluate a function call expression:

```bare-script
systemLog('Hello, World!')
```

Similarly, a variable assignment statement evaluates an expression and assigns the result to a
variable. If the statement is in the global scope, the variable is global. Otherwise, the variable
is a function-local variable. For example:

```bare-script
a = 5
b = 7
c = a + b
```


### Variable Scope and Globals

Assignment statements in the global scope create or update global variables. Assignment
statements inside a function always create or update **function-local** variables — an assignment
cannot update a global from within a function, even when a global of that name exists. Variable
lookups inside a function return the local variable if set, otherwise the global.

To update a global variable from within a function, use the `systemGlobalSet` library function
(and `systemGlobalGet` to read a global that a local variable shadows):

```bare-script
counter = 0

function increment():
    systemGlobalSet('counter', systemGlobalGet('counter') + 1)
endfunction

increment()
# counter is now 1
```

Function definition statements always create globals. Function names are ordinary global
variables, so a built-in function may be shadowed by defining a function with the same name.


### Comments

Comments begin with the "#" character and run to the end of the line. A comment may occupy a
whole line or follow a statement on the same line. There are no block comments. For example:

```bare-script
# Initialize the "a" variable
a = 0

return a + 1  # Return the value of "a" plus 1
```


### Function Definition Statements

Functions are defined using `function` statements. A function statement consists of the function
name and its argument names within parentheses. Until the `endfunction` statement, all statements
that follow belong to the function. When the function executes, its arguments are available as local
variables. For example:

```bare-script
function getMinMax(a, b, c, d):
    return [mathMin(a, b, c, d), mathMax(a, b, c, d)]
endfunction

return getMinMax(1, 2, 3, 5)
```

A function that makes any **asynchronous** function call (e.g.,
[systemFetch](../library/#var.vGroup='system'&systemfetch)) must be defined as asynchronous. For example:

```bare-script
async function getLibraryCount(url):
    return arrayLength(objectGet(jsonParse(systemFetch(url)), 'functions'))
endfunction

return getLibraryCount('https://craigahobbs.github.io/bare-script/library/library-builtin.json')
```

Function definition statements may not be nested within another function definition.


#### Variable Arguments

A function's last argument may be declared with a "..." suffix, which collects any extra call
arguments into an array (an empty array when there are none):

```bare-script
function labelValues(label, values...):
    return label + ': ' + arrayJoin(values, ', ')
endfunction

return labelValues('sizes', 1, 2, 3)
# 'sizes: 1, 2, 3'
```


### Return Statements

Return statements return from the current program scope. If there is a return
[expression](#expressions), it is evaluated, and the result is returned. For example:

```bare-script
function addNumbers(a, b):
    return a + b
endfunction

return addNumbers(0, 1)
```


### If-Then Statements

If-then statements allow you to execute a sequence of statements conditionally. For example:

```bare-script
if a < 0:
    b = 1
elif a > 0:
    b = 2
else:
    b = 3
endif
```


### While-Do Statements

While-do statements allow you to loop over a sequence of statements as long as the loop expression
is true. For example:

```bare-script
i = 0
sum = 0
while i < 10:
    sum = sum + i
    i = i + 1
endwhile
```


### Foreach Statements

Foreach statements allow you to loop over a sequence of statements for each value in an array.
For example:

```bare-script
values = [1, 2, 3]
sum = 0
for value in values:
    sum = sum + value
endfor
```

You can also access the array value index:

```bare-script
values = [1, 2, 3]
sum = 0
for value, ixValue in values:
    sum = sum + ixValue * value
endfor
```

The array expression and its length are evaluated once, before the loop starts — values added to
the array during iteration are not visited. Iterating a non-array value is a no-op (zero
iterations). The loop variables remain set after the loop completes.


### Break and Continue Statements

To stop a while-do loop or a foreach loop using a break statement. For example:

```bare-script
i = 0
while i < 10:
    if i > 5:
        break
    endif
    i = i + 1
endwhile
```

To skip the remaining statements in an iteration using a continue statement. For example:

```bare-script
values = [1, -2, 3]
sum = 0
for value, ixValue in values:
    if value < 0:
        continue
    endif
    sum = sum + value
endfor
```


### Jump and Label Statements

A `jump` statement sets the current program statement to a label. A `jumpif` statement jumps only if
its test [expression](#expressions) evaluates to true. Labels are defined by specifying the label
name followed by a colon.

The example below uses `jump`, `jumpif`, and label statements to sum the values of an array:

```bare-script
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
```


### Include Statements

Include statements load and evaluate a script file in the global scope, making its functions and
global variables available. For example:

```bare-script
include 'util.bare'

return concatStrings('abc', 'def')
```

The contents of "util.bare" are:

```bare-script
function concatStrings(a, b):
    return a + b
endfunction
```

Includes are idempotent — a file's top-level statements are evaluated only the first time it is
included; including the same file again is a no-op.


#### System Include Statements

System include statements load one of the include libraries bundled with the BareScript runtime.
For example:

```bare-script
include <unittest.bare>
```

The bundled include libraries provide higher-level functionality such as data manipulation,
Markdown parsing, Schema Markdown, drawing, and unit testing. See the "Include Functions" section
of [The BareScript Library](../library/) for the complete list.


### Multiline Statements

Long statements can be broken into multiple lines using the line continuation syntax, a trailing "\\"
character. For example:

```bare-script
colors = [ \
    'red', \
    'green', \
    'blue' \
]
return arrayJoin(colors, ', ')
```


### The BareScript Library

The [BareScript Library](../library/) is a set of built-in, general-purpose global functions
available to all BareScript scripts. The library contains functions for creating and manipulating
objects, arrays, datetimes, regular expressions, and strings. There are also functions for
parsing/serializing JSON, standard math operations, parsing/formatting numbers, and
[systemFetch](../library/#var.vGroup='system'&systemfetch).

Library functions validate their arguments and will return `null` (or a specified default value) if
given invalid arguments. When debug logging is enabled, library functions log detailed error
messages for invalid arguments.


## Expressions

BareScript expressions are similar to spreadsheet formulas. The different expression types are
described below.


### Number Expressions

Number expressions are decimal numbers with support for integers, floating-point numbers, scientific
notation, and hexadecimal integers. For example:

```bare-script
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
```

Scientific notation uses a lowercase `e`, and hexadecimal uses a lowercase `0x` prefix (`1E3` and
`0X1F` are syntax errors). Floating-point numbers require a leading digit (`.5` is a syntax
error; use `0.5`). A numeric literal may have a leading `+` or `-` sign, but there is no unary
`+` operator (`+x` is a syntax error).


### String Expressions

String expressions are specified with single or double quotes. Quotes and other special characters
are escaped using a preceding backslash character.

```bare-script
'abc'
"def"
'that\'s a "quote"'
"that's a \"quote\""
```

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

```bare-script
'Line 1\nLine 2'
'Tab\tseparated'
'Unicode: \u0041\u0042\u0043'  # 'ABC'
```

Strings are concatenated using the addition operator:

```bare-script
'abc' + 'def'
```


### Variable Lookup Expressions

Variable lookup expressions retrieve the value of a variable. A variable lookup expression is simply
the variable name. For example:

```bare-script
x
fooBar
```

When an expression is parsed standalone — for example, by the implementations' expression APIs
(JavaScript `evaluateExpression`, Python `evaluate_expression`) — a variable name that contains
non-alphanumeric characters may be wrapped in open and close brackets:

```
[Height (ft)]
```

The bracket form is not available within scripts, where brackets are parsed as
[array literals](#object-and-array-literals).


#### Special Variables

BareScript has the following special variables: `null`, `false`, and `true`. Special variables
cannot be overridden — an assignment to one (e.g., `null = 1`) is accepted but ignored. Statement
keywords (e.g., `if`, `for`) are not reserved words and may be used as variable names.


### Function Call Expressions

Function calls are specified as the function name followed by an open parenthesis, the function
argument expressions separated by commas, and a close parenthesis. For example:

```bare-script
mathMax(0, mathSin(x))
```


#### The Built-In `if` Function

The built-in `if` function has the special behavior that only the true expression is evaluated if
the test expression is true. Likewise, only the false expression is evaluated if the test expression
is false.

```bare-script
v = if(a == b, fn1(), fn2())
```


### Binary Operator Expressions

Binary operator expressions perform an operation on the result of two other expressions. The
following operators are supported, listed from highest to lowest evaluation precedence:

1. `**` - Exponentiation
2. `*`, `/`, `%` - Multiplication, division, modulo
3. `+`, `-` - Addition, subtraction
4. `<<`, `>>` - Bitwise shift
5. `<`, `<=`, `>`, `>=` - Ordering comparison
6. `==`, `!=` - Equality comparison
7. `&` - Bitwise AND
8. `^` - Bitwise XOR
9. `|` - Bitwise OR
10. `&&` - Logical AND
11. `||` - Logical OR

Operators of equal precedence evaluate left to right. Note that this includes exponentiation —
`2 ** 3 ** 2` is `(2 ** 3) ** 2`, or 64. Also, a leading minus sign on a numeric literal is part
of the literal, so it binds tighter than any operator — `-2 ** 2` is `(-2) ** 2`, or 4.

The operator type rules are as follows:

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

- Bitwise operators (`&`, `|`, `^`, `<<`, `>>`) require integer operands and return integers

- Comparison operators (`==`, `!=`, `<`, `<=`, `>`, `>=`) work with all value types
  - Values of different types are compared by type name
  - null is less than all other values

- Logical operators (`&&`, `||`) use short-circuit evaluation
  - `&&` returns the left operand if it's falsy, otherwise returns the right operand
  - `||` returns the left operand if it's truthy, otherwise returns the right operand

If an operator is used with incompatible types, the expression returns `null`. Arithmetic that
produces a non-finite result (e.g., division by zero) also returns `null`.

For example:

```bare-script
a + 1
'Hello, ' + name
date1 - date2
x >= 0 && x < 10
```


### Unary Operator Expressions

Unary operator expressions perform an operation on the result of another expression. The following
operators are supported:

- **Logical NOT** (`!`) - Returns the boolean negation of the operand
- **Numeric negation** (`-`) - Returns the negation of a number operand
- **Bitwise NOT** (`~`) - Returns the bitwise complement of an integer operand

If an operator is used with an incompatible type, the expression returns `null`.

For example:

```bare-script
!a
-x
~flags
```

Unary operators bind tighter than all binary operators. For example, `!a && b` is `(!a) && b`.


### Group Expressions

Group expressions provide control over expression evaluation order. For example:

```bare-script
0.5 * (x + y)
```


## Errors and Limits

BareScript has no exceptions and no try/catch. Errors are handled as follows:

- **Undefined variables** evaluate to `null`.
- **Calling an undefined function** stops the script with a runtime error.
- **Library functions** validate their arguments and return `null` (or a documented default
  value) when given invalid arguments. When debug logging is enabled, they log detailed error
  messages.


## Emacs Mode

To install the [Emacs](https://www.gnu.org/software/emacs/) BareScript mode add the following to
your .emacs file:

```
(package-initialize)

(unless (package-installed-p 'barescript-mode)
  (let ((mode-file (make-temp-file "barescript-mode")))
    (url-copy-file "https://craigahobbs.github.io/bare-script/language/barescript-mode.el" mode-file t)
    (package-install-file mode-file)
    (delete-file mode-file)))
(add-to-list 'auto-mode-alist '("\\.bare\\'" . barescript-mode))
```
