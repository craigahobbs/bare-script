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
