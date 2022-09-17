[Home](https://github.com/craigahobbs/calc-script#readme)


# The CalcScript Language

CalcScript is a simple, line-based scripting language. Each line of a CalcScript script is either a
comment or a [statement](#statements). A statement is either an [expression](#expressions), a
variable assignment, a jump, a return, or an include. Expressions can be a literal (number, string,
null), a variable lookup, a function call, a binary expression, a unary expression, or a group.

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


## Statements

A CalcScript script consists of one or more statements. The following sections describe the
different types of statements.


### Expression and Assignment Statements

Expression statements evaluate an expression and discard the result. In the following example, we
evaluate a function call expression:

~~~ calcscript
debugLog('Hello, World!')
~~~

Similarly, a variable assignment statement evaluates an expression and assigns the result to a
variable. If the statement is in the global scope, the variable is a global variable. Otherwise, the
variable is a function-local variable. For example:

~~~ calcscript
a = 5
b = 7
c = a + b
~~~


### Jump and Label Statements

A "jump" statement always changes the program flow to the specified label. A "jumpif" statement
evaluates a test expression and only jumps if it evaluates to true. The example below uses "jump"
and "jumpif" statements to sum the values of an array:

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

Return statements return from the current program scope. If there is a return expression, it is
evaluated, and the result is returned. For example:

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


## Expressions

TODO


### Literal Expressions

TODO


### Function Call Expressions

TODO


### Binary Operator Expressions

TODO


### Unary Operator Expressions

TODO


### Group Expressions

TODO
