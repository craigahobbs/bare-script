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
