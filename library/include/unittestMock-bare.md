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
