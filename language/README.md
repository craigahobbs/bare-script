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

- [CalcScript Home](https://github.com/craigahobbs/calc-script)
- [The CalcScript Library](../library/)
- [The CalcScript Expression Library](../library/expression.html)


## Table of Contents

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
consoleLog('Hello, World!')
~~~

Similarly, a variable assignment statement evaluates an expression and assigns the result to a
variable. If the statement is in the global scope, the variable is global. Otherwise, the variable
is a function-local variable. For example:

~~~ calcscript
a = 5
b = 7
c = a + b
~~~


### Comments

Comments in CalcScript are any line that begins with the "#" character. For example:

~~~ calcscript
# Initialize the "a" variable
a = 0

# Return the value of "a" plus 1
return a + 1
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
[httpFetch](../library/#var.vName='httpFetch')) must be defined as asynchronous. For example:

~~~ calcscript
async function getLibraryCount(url)
    return arrayLength(objectGet(httpFetch(url), 'functions'))
endfunction

return getLibraryCount('https://craigahobbs.github.io/calc-script/library/library.json')
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


### If-Then Statements

If-then statements allow you to execute a sequence of statements conditionally. For example:

~~~ calcscript
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

~~~ calcscript
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

~~~ calcscript
values = arrayNew(1, 2, 3)
sum = 0
for value in values:
    sum = sum + value
endfor
~~~

You can also access the array value index:

~~~ calcscript
values = arrayNew(1, 2, 3)
sum = 0
for value, ixValue in values:
    sum = sum + ixValue * value
endfor
~~~


### Break and Continue Statements

To stop a while-do loop or a foreach loop using a break statement. For example:

~~~ calcscript
i = 0
while i < 10:
    if i > 5:
        break
    endif
    i = i + 1
endwhile
~~~

To skip the remaining statements in an iteration using a continue statement. For example:

~~~ calcscript
values = arrayNew(1, -2, 3)
sum = 0
for value, ixValue in values:
    if value < 0:
        continue
    endif
    sum = sum + value
endfor
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


### Include Statements

Include statements load and evaluate a script file in the global scope. For example:

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
[httpFetch](../library/#var.vName='httpFetch').

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


#### The Built-In "if" Function

The built-in ["if"](../library/#var.vName='if') function has the special behavior that only the true
expression is evaluated if the test expression is true. Likewise, only the false expression is
evaluated if the test expression is false.

~~~ calcscript
v = if(a == b, fn1(), fn2())
~~~


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
(add-to-list 'auto-mode-alist '("\\.\\(?:[Cc]alc-?[Ss]cript\\|mds\\)\\'" . calcscript-mode))
~~~
