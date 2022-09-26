[Home](https://github.com/craigahobbs/calc-script#readme)


# The CalcScript Language

CalcScript is a simple, line-based scripting language. Each line of a CalcScript script is either a
comment or a [statement](#statements). A statement is either an [expression](#expressions), a
variable assignment, a jump, a return, or an include. Expressions include numbers, strings, variable
lookups, function calls, binary expressions, unary expressions, or groups.

For example, the following script computes the first ten Fibonacci numbers and returns them as an
array.

~~~ calcscript
# Compute the first "count" Fibonacci numbers
function fibonacci(count)
    numbers = arrayNew(0, 1)
    numberLoop:
        arrayPush(numbers, arrayGet(numbers, arrayLength(numbers) - 1) + \
            arrayGet(numbers, arrayLength(numbers) - 2))
    jumpif (arrayLength(numbers) < count) numberLoop
    return numbers
endfunction

# Return the first ten Fibonacci numbers
return fibonacci(10)
~~~


## Links

- [CalcScript Home](https://github.com/craigahobbs/calc-script)
- [The CalcScript Library](../library/)
- [The CalcScript Expression Library](../library/expression.html)


## Table of Contents

- [Statements](#statements)
  - [Expression and Assignment Statements](#expression-and-assignment-statements)
  - [Jump and Label Statements](#jump-and-label-statements)
  - [Return Statements](#return-statements)
  - [Function Definition Statements](#function-definition-statements)
  - [Include Statements](#include-statements)
  - [Comments](#comments)
  - [Multiline Statements](#multiline-statements)
  - [The CalcScript Library](#the-calcscript-library)
- [Expressions](#expressions)
  - [Number Expressions](#number-expressions)
  - [String Expressions](#string-expressions)
  - [Variable Lookup Expressions](#variable-lookup-expressions)
  - [Function Call Expressions](#function-call-expressions)
  - [Binary Operator Expressions](#binary-operator-expressions)
  - [Unary Operator Expressions](#unary-operator-expressions)
  - [Group Expressions](#group-expressions)
  - [The CalcScript Expression Library](#the-calcscript-expression-library)
- [Emacs Mode](#emacs-mode)


## Statements

A CalcScript script consists of one or more statements. The following sections describe the
different types of statements.


### Expression and Assignment Statements

Expression statements evaluate an [expression](#expressions) and discard the result. In the
following example, we evaluate a function call expression:

~~~ calcscript
debugLog('Hello, World!')
~~~

Similarly, a variable assignment statement evaluates an expression and assigns the result to a
variable. If the statement is in the global scope, the variable is global. Otherwise, the variable
is a function-local variable. For example:

~~~ calcscript
a = 5
b = 7
c = a + b
~~~


### Jump and Label Statements

A "jump" statement sets the current program statement to a label. A "jumpif" statement jumps only if
its test [expression](#expressions) evaluates to true. Labels are defined by specifying the label
name followed by a colon.

The example below uses "jump", "jumpif", and label statements to sum the values of an array:

~~~ calcscript
values = arrayNew(1, 2, 3, 5, 7)
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


### Return Statements

Return statements return from the current program scope. If there is a return
[expression](#expressions), it is evaluated, and the result is returned. For example:

~~~ calcscript
function addNumbers(a, b)
    return a + b
endfunction

return addNumbers(0, 1)
~~~


### Function Definition Statements

Functions are defined using "function" statements. A function statement consists of the function
name and its argument names within parentheses. Until the "endfunction" statement, all statements
that follow belong to the function. When the function executes, its arguments are available as local
variables. For example:

~~~ calcscript
function getMinMax(a, b, c, d)
    return arrayNew(mathMin(a, b, c, d), mathMax(a, b, c, d))
endfunction

return getMinMax(1, 2, 3, 5)
~~~

A function that makes any **asynchronous** function call (e.g.,
[fetch](../library/#var.vName='fetch')) must be defined as asynchronous. For example:

~~~ calcscript
async function getLibraryCount(url)
    return arrayLength(objectGet(fetch(url), 'functions'))
endfunction

return getLibraryCount('https://craigahobbs.github.io/calc-script/library/library.json')
~~~


### Include Statements

Include statements fetch and evaluate a script resource URL in the global scope. For example:

~~~ calcscript
include 'util.mds'

return concatStrings('abc', 'def')
~~~

The contents of "util.mds" are:

~~~ calcscript
function concatStrings(a, b)
    return a + b
endfunction
~~~


### Comments

Comments in CalcScript are any line that begins with the "#" character. For example:

~~~ calcscript
# Initialize the "a" variable
a = 0

# Return the value of "a" plus 1
return a + 1
~~~


### Multiline Statements

Long statements can be broken into multiple lines using the line continuation syntax, a trailing "\"
character. For example:

~~~ calcscript
colors = arrayNew( \
    'red', \
    'green', \
    'blue' \
)
return arrayJoin(colors, ', ')
~~~


### The CalcScript Library

The [CalcScript Library](../library/) is a set of built-in, general-purpose global functions
available to all CalcScript scripts. The library contains functions for creating and manipulating
objects, arrays, datetimes, regular expressions, and strings. There are also functions for
parsing/serializing JSON, standard math operations, parsing/formatting numbers, and
[fetch](../library/#var.vName='fetch').

## Expressions

CalcScript expressions are similar to spreadsheet formulas. The different expression types are
described below.


### Number Expressions

Number expressions are decimal numbers. For example:

~~~ calcscript
5
-1
3.14159
~~~


### String Expressions

String expressions are specified with single or double quotes. Quotes are escaped using a preceding
backslash character.

~~~ calcscript
'abc'
"def"
'that\'s a "quote"'
"that's a \"quote\""
~~~

Strings are concatenated using the addition operator.

~~~ calcscript
'abc' + 'def'
~~~


### Variable Lookup Expressions

Variable lookup expressions retrieve the value of a variable. A variable lookup expression is simply
the variable name, or if the variable name has non-alphanumeric characters, the variable name is
wrapped in open and close brackets. For example:

~~~ calcscript
x
fooBar
[Height (ft)]
~~~


#### Special Variables

CalcScript has the following special variables: "null", "false", and "true". Special variables
cannot be overridden.


### Function Call Expressions

Function calls are specified as the function name followed by an open parenthesis, the function
argument expressions separated by commas, and a close parenthesis. For example:

~~~ calcscript
max(0, sin(x))
~~~

The ["if"](../library/#var.vName='if') function has the special behavior that only the true
expression is evaluated if the test expression is true. Likewise, only the false expression is
evaluated if the test expression is false.


### Binary Operator Expressions

Binary operator expressions perform an operation on the result of two other expressions. For
example:

~~~ calcscript
a + 1
sin(x) / x
~~~

Click here for the [list of binary operators](../model/#var.vName='BinaryExpressionOperator') in
order of evaluation precedence.


### Unary Operator Expressions

Unary operator expressions perform an operation on the result of another expression. For example:

~~~ calcscript
!a
-x
~~~

Click here for the [list of unary operators](../model/#var.vName='UnaryExpressionOperator') in order
of evaluation precedence.


### Group Expressions

Group expressions provide control over expression evaluation order. For example:

~~~ calcscript
0.5 * (x + y)
~~~


### The CalcScript Expression Library

The [CalcScript Expression Library](../library/expression.html) is a set of built-in,
spreadsheet-like global functions available to all expressions. The library contains functions for
manipulating datetimes, strings, standard math operations, and parsing/formatting numbers.


## Emacs Mode

To install the [Emacs](https://www.gnu.org/software/emacs/) CalcScript mode add the following to
your .emacs file:

~~~
(package-initialize)

(unless (package-installed-p 'calcscript-mode)
  (let ((mode-file (make-temp-file "calcscript-mode")))
    (url-copy-file "https://craigahobbs.github.io/calc-script/language/calcscript-mode.el" mode-file t)
    (package-install-file mode-file)
    (delete-file mode-file)))
~~~
