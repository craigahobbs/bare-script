// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {parseExpression, parseScript} from '../lib/parser.js';
import {validateExpression, validateScript} from '../lib/model.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('parseScript, array input', () => {
    const script = validateScript(parseScript([
        'a = arrayNew( \\',
        '    1,\\',
        `\
    2 \\
)
`
    ]));
    assert.deepEqual(script, {
        'statements': [
            {
                'expr': {
                    'name': 'a',
                    'expr': {'function': {'name': 'arrayNew', 'args': [{'number': 1}, {'number': 2}]}}
                }
            }
        ]
    });
});


test('parseScript, line continuation', () => {
    const script = validateScript(parseScript(`\
a = arrayNew( \\
    1, \\
    2 \\
)
`));
    assert.deepEqual(script, {
        'statements': [
            {
                'expr': {
                    'name': 'a',
                    'expr': {'function': {'name': 'arrayNew', 'args': [{'number': 1}, {'number': 2}]}}
                }
            }
        ]
    });
});


test('parseScript, line continuation comments', () => {
    const script = validateScript(parseScript(`\
# Comments don't continue \\
a = arrayNew( \\
    # Comments are OK within a continuation...
    1, \\
    # ...with or without a continuation backslash \\
    2 \\
)
`));
    assert.deepEqual(script, {
        'statements': [
            {
                'expr': {
                    'name': 'a',
                    'expr': {'function': {'name': 'arrayNew', 'args': [{'number': 1}, {'number': 2}]}}
                }
            }
        ]
    });
});


test('parseScript, line continuation error', () => {
    assert.throws(
        () => {
            parseScript(`\
    fn1(arg1, \\
    fn2(),
    null))
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error, line number 1:
    fn1(arg1, fn2(),
                    ^
`
        }
    );
});


test('parseScript, long line error middle', () => {
    assert.throws(
        () => {
            parseScript(`\
    reallyLongFunctionName( \\
        value1 + value2 + value3 + value4 + value5, \\
        value6 + value7 + value8 + value9 + value10, \\
        value11 + value12 + value13 + value14 + value15, \\
        value16 + value17 + value18 + value19 + value20, \\
        value21 + value22 + value23 + value24 + value25, \\
        @#$, \\
        value26 + value27 + value28 + value29 + value30, \\
        value31 + value32 + value33 + value34 + value35, \\
        value36 + value37 + value38 + value39 + value40, \\
        value41 + value42 + value43 + value44 + value45, \\
        value46 + value47 + value48 + value49 + value50 \\
   )
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error, line number 1:
...  + value20, value21 + value22 + value23 + value24 + value25, @#$, value26 + value27 + value28 + value29 + value30, value ...
                                                                ^
`
        }
    );
});


test('parseScript, long line error left', () => {
    assert.throws(
        () => {
            parseScript(`\
    reallyLongFunctionName( \\
        @#$, \\
        value1 + value2 + value3 + value4 + value5, \\
        value6 + value7 + value8 + value9 + value10, \\
        value11 + value12 + value13 + value14 + value15, \\
        value16 + value17 + value18 + value19 + value20, \\
        value21 + value22 + value23 + value24 + value25, \\
        value26 + value27 + value28 + value29 + value30, \\
        value31 + value32 + value33 + value34 + value35, \\
        value36 + value37 + value38 + value39 + value40, \\
        value41 + value42 + value43 + value44 + value45, \\
        value46 + value47 + value48 + value49 + value50 \\
   )
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error, line number 1:
    reallyLongFunctionName( @#$, value1 + value2 + value3 + value4 + value5, value6 + value7 + value8 + value9 + value10 ...
                           ^
`
        }
    );
});


test('parseScript, long line error right', () => {
    assert.throws(
        () => {
            parseScript(`\
    reallyLongFunctionName( \\
        value1 + value2 + value3 + value4 + value5, \\
        value6 + value7 + value8 + value9 + value10, \\
        value11 + value12 + value13 + value14 + value15, \\
        value16 + value17 + value18 + value19 + value20, \\
        value21 + value22 + value23 + value24 + value25, \\
        value26 + value27 + value28 + value29 + value30, \\
        value31 + value32 + value33 + value34 + value35, \\
        value36 + value37 + value38 + value39 + value40, \\
        value41 + value42 + value43 + value44 + value45, \\
        value46 + value47 + value48 + value49 + value50 \\
        @#$ \\
   )
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error, line number 1:
... alue39 + value40, value41 + value42 + value43 + value44 + value45, value46 + value47 + value48 + value49 + value50 @#$ )
                                                                                                                      ^
`
        }
    );
});


test('parseScript, jumpif statement', () => {
    const script = validateScript(parseScript(`\
n = 10
i = 0
a = 0
b = 1

fib:
    jumpif (i >= [n]) fibend
    tmp = b
    b = a + b
    a = tmp
    i = i + 1
    jump fib
fibend:

return a
`));
    assert.deepEqual(script, {
        'statements': [
            {'expr': {'name': 'n', 'expr': {'number': 10}}},
            {'expr': {'name': 'i', 'expr': {'number': 0}}},
            {'expr': {'name': 'a', 'expr': {'number': 0}}},
            {'expr': {'name': 'b', 'expr': {'number': 1}}},
            {'label': 'fib'},
            {
                'jump': {
                    'label': 'fibend',
                    'expr': {'binary': {'op': '>=', 'left': {'variable': 'i'}, 'right': {'variable': 'n'}}}
                }
            },
            {'expr': {'name': 'tmp', 'expr': {'variable': 'b'}}},
            {
                'expr': {
                    'name': 'b',
                    'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
                }
            },
            {'expr': {'name': 'a', 'expr': {'variable': 'tmp'}}},
            {
                'expr': {
                    'name': 'i',
                    'expr': {'binary': {'op': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}
                }
            },
            {'jump': {'label': 'fib'}},
            {'label': 'fibend'},
            {'return': {'expr': {'variable': 'a'}}}
        ]
    });
});


test('parseScript, function statement', () => {
    const script = validateScript(parseScript(`\
function addNumbers(a, b):
    return a + b
endfunction
`));
    assert.deepEqual(script, {
        'statements': [
            {
                'function': {
                    'name': 'addNumbers',
                    'args': ['a', 'b'],
                    'statements': [
                        {
                            'return': {
                                'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
                            }
                        }
                    ]
                }
            }
        ]
    });
});


test('parseScript, async function statement', () => {
    const script = validateScript(parseScript(`\
async function fetchURL(url):
    return systemFetch(url)
endfunction
`));
    assert.deepEqual(script, {
        'statements': [
            {
                'function': {
                    'async': true,
                    'name': 'fetchURL',
                    'args': ['url'],
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'systemFetch', 'args': [{'variable': 'url'}]}}}}
                    ]
                }
            }
        ]
    });
});


test('parseScript, function statement empty return', () => {
    const script = validateScript(parseScript(`\
function fetchURL(url):
    return
endfunction
`));
    assert.deepEqual(script, {
        'statements': [
            {
                'function': {
                    'name': 'fetchURL',
                    'args': ['url'],
                    'statements': [
                        {'return': {}}
                    ]
                }
            }
        ]
    });
});


test('parseScript, function statement lastArgArray', () => {
    const script = validateScript(parseScript(`\
function argsCount(args...):
    return arrayLength(args)
endfunction
`));
    assert.deepEqual(script, {
        'statements': [
            {
                'function': {
                    'name': 'argsCount',
                    'args': ['args'],
                    'lastArgArray': true,
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': 'args'}]}}}}
                    ]
                }
            }
        ]
    });
});


test('parseScript, function statement lastArgArray no-args', () => {
    const script = validateScript(parseScript(`\
function test(...):
    return 1
endfunction
`));
    assert.deepEqual(script, {
        'statements': [
            {
                'function': {
                    'name': 'test',
                    'lastArgArray': true,
                    'statements': [
                        {'return': {'expr': {'number': 1}}}
                    ]
                }
            }
        ]
    });
});


test('parseScript, function statement lastArgArray spaces', () => {
    const script = validateScript(parseScript(`\
function argsCount(args ... ):
    return arrayLength(args)
endfunction
`));
    assert.deepEqual(script, {
        'statements': [
            {
                'function': {
                    'name': 'argsCount',
                    'args': ['args'],
                    'lastArgArray': true,
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': 'args'}]}}}}
                    ]
                }
            }
        ]
    });
});


test('parseScript, function statement missing colon', () => {
    assert.throws(
        () => {
            parseScript(`\
function test()
endfunction
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error, line number 1:
function test()
        ^
`
        }
    );
});


test('parseScript, if-then statement', () => {
    const script = validateScript(parseScript(`\
if i > 0:
    a = 1
elif i < 0:
    a = 2
else:
    a = 3
endif
`));
    assert.deepEqual(script, {
        'statements': [
            {'jump': {
                'label': '__bareScriptIf0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}}},
            {'jump': {'label': '__bareScriptDone0'}},
            {'label': '__bareScriptIf0'},
            {'jump': {
                'label': '__bareScriptIf1',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '<', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}}
            },
            {'expr': {'name': 'a', 'expr': {'number': 2}}},
            {'jump': {'label': '__bareScriptDone0'}},
            {'label': '__bareScriptIf1'},
            {'expr': {'name': 'a', 'expr': {'number': 3}}},
            {'label': '__bareScriptDone0'}
        ]
    });
});


test('parseScript, if-then statement only', () => {
    const script = validateScript(parseScript(`\
if i > 0:
    a = 1
endif
`));
    assert.deepEqual(script, {
        'statements': [
            {'jump': {
                'label': '__bareScriptDone0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}}},
            {'label': '__bareScriptDone0'}
        ]
    });
});


test('parseScript, if-then statement if-else-if', () => {
    const script = validateScript(parseScript(`\
if i > 0:
    a = 1
elif i < 0:
    a = 2
endif
`));
    assert.deepEqual(script, {
        'statements': [
            {'jump': {
                'label': '__bareScriptIf0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}}},
            {'jump': {'label': '__bareScriptDone0'}},
            {'label': '__bareScriptIf0'},
            {'jump': {
                'label': '__bareScriptDone0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '<', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'expr': {'name': 'a', 'expr': {'number': 2}}},
            {'label': '__bareScriptDone0'}
        ]
    });
});


test('parseScript, if-then statement if-else', () => {
    const script = validateScript(parseScript(`\
if i > 0:
    a = 1
else:
    a = 2
endif
`));
    assert.deepEqual(script, {
        'statements': [
            {'jump': {
                'label': '__bareScriptIf0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}}},
            {'jump': {'label': '__bareScriptDone0'}},
            {'label': '__bareScriptIf0'},
            {'expr': {'name': 'a', 'expr': {'number': 2}}},
            {'label': '__bareScriptDone0'}
        ]
    });
});


test('parseScript, if-then statement error else-if outside if-then', () => {
    assert.throws(
        () => {
            parseScript(`\
elif i < 0:
    a = 3
endif
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching if statement, line number 1:
elif i < 0:
^
`
        }
    );
});


test('parseScript, if-then statement error else-if outside if-then 2', () => {
    assert.throws(
        () => {
            parseScript(`\
while true:
    elif i < 0:
        a = 3
    endif
endwhile
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching if statement, line number 2:
    elif i < 0:
^
`
        }
    );
});


test('parseScript, if-then statement error else-then outside if-then', () => {
    assert.throws(
        () => {
            parseScript(`\
else:
    a = 3
endif
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching if statement, line number 1:
else:
^
`
        }
    );
});


test('parseScript, if-then statement error else-then outside if-then 2', () => {
    assert.throws(
        () => {
            parseScript(`\
while true:
    else:
        a = 3
    endif
endwhile
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching if statement, line number 2:
    else:
^
`
        }
    );
});


test('parseScript, if-then statement error endif outside if-then', () => {
    assert.throws(
        () => {
            parseScript(`\
endif
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching if statement, line number 1:
endif
^
`
        }
    );
});


test('parseScript, if-then statement error endif outside if-then 2', () => {
    assert.throws(
        () => {
            parseScript(`\
while true:
    endif
endwhile
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching if statement, line number 2:
    endif
^
`
        }
    );
});


test('parseScript, if-then statement error else-if after else', () => {
    assert.throws(
        () => {
            parseScript(`\
if i > 0:
    a = 1
else:
    a = 2
elif i < 0:
    a = 3
endif
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Elif statement following else statement, line number 5:
elif i < 0:
^
`
        }
    );
});


test('parseScript, if-then statement error multiple else', () => {
    assert.throws(
        () => {
            parseScript(`\
if i > 0:
    a = 1
else:
    a = 2
else:
    a = 3
endif
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Multiple else statements, line number 5:
else:
^
`
        }
    );
});


test('parseScript, if-then statement error no endif', () => {
    assert.throws(
        () => {
            parseScript(`\
if i > 0:
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Missing endif statement, line number 1:
if i > 0:
^
`
        }
    );
});


test('parseScript, if-then statement error endif outside function', () => {
    assert.throws(
        () => {
            parseScript(`\
function test():
    if i > 0:
endfunction
endif
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Missing endif statement, line number 2:
    if i > 0:
^
`
        }
    );
});


test('parseScript, if-then statement error endif inside function', () => {
    assert.throws(
        () => {
            parseScript(`\
if i > 0:
function test():
    endif
endfunction
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching if statement, line number 3:
    endif
^
`
        }
    );
});


test('parseScript, if-then statement error elif inside function', () => {
    assert.throws(
        () => {
            parseScript(`\
if i > 0:
function test():
    elif i == 1:
    endif
endfunction
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching if statement, line number 3:
    elif i == 1:
^
`
        }
    );
});


test('parseScript, if-then statement error else inside function', () => {
    assert.throws(
        () => {
            parseScript(`\
if i > 0:
function test():
    else:
    endif
endfunction
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching if statement, line number 3:
    else:
^
`
        }
    );
});


test('parseScript, while-do statement', () => {
    const script = validateScript(parseScript(`\
i = 0
while i < arrayLength(values):
    i = i + 1
endwhile
`));
    assert.deepEqual(script, {
        'statements': [
            {'expr': {'name': 'i', 'expr': {'number': 0}}},
            {'jump': {
                'label': '__bareScriptDone0',
                'expr': {'unary': {
                    'op': '!',
                    'expr': {'binary': {
                        'op': '<',
                        'left': {'variable': 'i'},
                        'right': {'function': {'name': 'arrayLength', 'args': [{'variable': 'values'}]}}
                    }}
                }}
            }},
            {'label': '__bareScriptLoop0'},
            {'expr': {'name': 'i', 'expr': {'binary': {'op': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}}},
            {'jump': {
                'label': '__bareScriptLoop0',
                'expr': {'binary': {
                    'op': '<',
                    'left': {'variable': 'i'},
                    'right': {'function': {'name': 'arrayLength', 'args': [{'variable': 'values'}]}}
                }}
            }},
            {'label': '__bareScriptDone0'}
        ]
    });
});


test('parseScript, while-do statement break', () => {
    const script = validateScript(parseScript(`\
while true:
    break
endwhile
`));
    assert.deepEqual(script, {
        'statements': [
            {'jump': {'label': '__bareScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': 'true'}}}}},
            {'label': '__bareScriptLoop0'},
            {'jump': {'label': '__bareScriptDone0'}},
            {'jump': {'label': '__bareScriptLoop0', 'expr': {'variable': 'true'}}},
            {'label': '__bareScriptDone0'}
        ]
    });
});


test('parseScript, while-do statement continue', () => {
    const script = validateScript(parseScript(`\
while true:
    continue
endwhile
`));
    assert.deepEqual(script, {
        'statements': [
            {'jump': {'label': '__bareScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': 'true'}}}}},
            {'label': '__bareScriptLoop0'},
            {'jump': {'label': '__bareScriptLoop0'}},
            {'jump': {'label': '__bareScriptLoop0', 'expr': {'variable': 'true'}}},
            {'label': '__bareScriptDone0'}
        ]
    });
});


test('parseScript, while-do statement error endwhile outside while-do', () => {
    assert.throws(
        () => {
            parseScript(`\
endwhile
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching while statement, line number 1:
endwhile
^
`
        }
    );
});


test('parseScript, while-do statement error endwhile outside while-do 2', () => {
    assert.throws(
        () => {
            parseScript(`\
for value in values:
endwhile
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching while statement, line number 2:
endwhile
^
`
        }
    );
});


test('parseScript, while-do statement error no endwhile', () => {
    assert.throws(
        () => {
            parseScript(`\
while true:
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Missing endwhile statement, line number 1:
while true:
^
`
        }
    );
});


test('parseScript, while-do statement error endwhile outside function', () => {
    assert.throws(
        () => {
            parseScript(`\
function test():
    while i > 0:
endfunction
endwhile
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Missing endwhile statement, line number 2:
    while i > 0:
^
`
        }
    );
});


test('parseScript, while-do statement error endwhile inside function', () => {
    assert.throws(
        () => {
            parseScript(`\
while i > 0:
function test():
    endwhile
endfunction
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching while statement, line number 3:
    endwhile
^
`
        }
    );
});


test('parseScript, while-do statement error break inside function', () => {
    assert.throws(
        () => {
            parseScript(`\
while i > 0:
function test():
        break
    endwhile
endfunction
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Break statement outside of loop, line number 3:
        break
^
`
        }
    );
});


test('parseScript, while-do statement error continue inside function', () => {
    assert.throws(
        () => {
            parseScript(`\
while i > 0:
function test():
        continue
    endwhile
endfunction
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Continue statement outside of loop, line number 3:
        continue
^
`
        }
    );
});


test('parseScript, foreach statement', () => {
    const script = validateScript(parseScript(`\
values = arrayNew(1, 2, 3)
sum = 0
for value in values:
    sum = sum + value
endfor
`));
    assert.deepEqual(script, {
        'statements': [
            {'expr': {
                'name': 'values',
                'expr': {'function': {'name': 'arrayNew', 'args': [{'number': 1}, {'number': 2}, {'number': 3}]}}
            }},
            {'expr': {'name': 'sum', 'expr': {'number': 0}}},
            {'expr': {'name': '__bareScriptValues0', 'expr': {'variable': 'values'}}},
            {'expr': {
                'name': '__bareScriptLength0',
                'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__bareScriptValues0'}]}}
            }},
            {'jump': {'label': '__bareScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': '__bareScriptLength0'}}}}},
            {'expr': {'name': '__bareScriptIndex0', 'expr': {'number': 0}}},
            {'label': '__bareScriptLoop0'},
            {'expr': {
                'name': 'value',
                'expr': {'function': {
                    'name': 'arrayGet',
                    'args': [{'variable': '__bareScriptValues0'}, {'variable': '__bareScriptIndex0'}]
                }}
            }},
            {'expr': {
                'name': 'sum',
                'expr': {'binary': {'op': '+', 'left': {'variable': 'sum'}, 'right': {'variable': 'value'}}}
            }},
            {'expr': {
                'name': '__bareScriptIndex0',
                'expr': {'binary': {'op': '+', 'left': {'variable': '__bareScriptIndex0'}, 'right': {'number': 1}}}
            }},
            {'jump': {
                'label': '__bareScriptLoop0',
                'expr': {'binary': {'op': '<', 'left': {'variable': '__bareScriptIndex0'}, 'right': {'variable': '__bareScriptLength0'}}}
            }},
            {'label': '__bareScriptDone0'}
        ]
    });
});


test('parseScript, foreach statement with index', () => {
    const script = validateScript(parseScript(`\
for value, ixValue in values:
endfor
`));
    assert.deepEqual(script, {
        'statements': [
            {'expr': {'name': '__bareScriptValues0', 'expr': {'variable': 'values'}}},
            {'expr': {
                'name': '__bareScriptLength0',
                'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__bareScriptValues0'}]}}
            }},
            {'jump': {'label': '__bareScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': '__bareScriptLength0'}}}}},
            {'expr': {'name': 'ixValue', 'expr': {'number': 0}}},
            {'label': '__bareScriptLoop0'},
            {'expr': {
                'name': 'value',
                'expr': {'function': {
                    'name': 'arrayGet',
                    'args': [{'variable': '__bareScriptValues0'}, {'variable': 'ixValue'}]
                }}
            }},
            {'expr': {
                'name': 'ixValue',
                'expr': {'binary': {'op': '+', 'left': {'variable': 'ixValue'}, 'right': {'number': 1}}}
            }},
            {'jump': {
                'label': '__bareScriptLoop0',
                'expr': {'binary': {'op': '<', 'left': {'variable': 'ixValue'}, 'right': {'variable': '__bareScriptLength0'}}}
            }},
            {'label': '__bareScriptDone0'}
        ]
    });
});


test('parseScript, foreach statement break', () => {
    const script = validateScript(parseScript(`\
for value in values:
    if i > 0:
        break
    endif
endfor
`));
    assert.deepEqual(script, {
        'statements': [
            {'expr': {'name': '__bareScriptValues0', 'expr': {'variable': 'values'}}},
            {'expr': {
                'name': '__bareScriptLength0',
                'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__bareScriptValues0'}]}}
            }},
            {'jump': {'label': '__bareScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': '__bareScriptLength0'}}}}},
            {'expr': {'name': '__bareScriptIndex0', 'expr': {'number': 0}}},
            {'label': '__bareScriptLoop0'},
            {'expr': {
                'name': 'value',
                'expr': {'function': {
                    'name': 'arrayGet',
                    'args': [{'variable': '__bareScriptValues0'}, {'variable': '__bareScriptIndex0'}]
                }}
            }},
            {'jump': {
                'label': '__bareScriptDone1',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'jump': {'label': '__bareScriptDone0'}},
            {'label': '__bareScriptDone1'},
            {'expr': {
                'name': '__bareScriptIndex0',
                'expr': {'binary': {'op': '+', 'left': {'variable': '__bareScriptIndex0'}, 'right': {'number': 1}}}
            }},
            {'jump': {
                'label': '__bareScriptLoop0',
                'expr': {'binary': {'op': '<', 'left': {'variable': '__bareScriptIndex0'}, 'right': {'variable': '__bareScriptLength0'}}}
            }},
            {'label': '__bareScriptDone0'}
        ]
    });
});


test('parseScript, foreach statement continue', () => {
    const script = validateScript(parseScript(`\
for value in values:
    if i > 0:
        continue
    endif
endfor
`));
    assert.deepEqual(script, {
        'statements': [
            {'expr': {'name': '__bareScriptValues0', 'expr': {'variable': 'values'}}},
            {'expr': {
                'name': '__bareScriptLength0',
                'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__bareScriptValues0'}]}}
            }},
            {'jump': {'label': '__bareScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': '__bareScriptLength0'}}}}},
            {'expr': {'name': '__bareScriptIndex0', 'expr': {'number': 0}}},
            {'label': '__bareScriptLoop0'},
            {'expr': {
                'name': 'value',
                'expr': {'function': {
                    'name': 'arrayGet',
                    'args': [{'variable': '__bareScriptValues0'}, {'variable': '__bareScriptIndex0'}]
                }}
            }},
            {'jump': {
                'label': '__bareScriptDone1',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'jump': {'label': '__bareScriptContinue0'}},
            {'label': '__bareScriptDone1'},
            {'label': '__bareScriptContinue0'},
            {'expr': {
                'name': '__bareScriptIndex0',
                'expr': {'binary': {'op': '+', 'left': {'variable': '__bareScriptIndex0'}, 'right': {'number': 1}}}
            }},
            {'jump': {
                'label': '__bareScriptLoop0',
                'expr': {'binary': {'op': '<', 'left': {'variable': '__bareScriptIndex0'}, 'right': {'variable': '__bareScriptLength0'}}}
            }},
            {'label': '__bareScriptDone0'}
        ]
    });
});


test('parseScript, foreach statement error foreach outside foreach', () => {
    assert.throws(
        () => {
            parseScript(`\
endfor
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching for statement, line number 1:
endfor
^
`
        }
    );
});


test('parseScript, foreach statement error endfor outside foreach 2', () => {
    assert.throws(
        () => {
            parseScript(`\
while true:
endfor
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching for statement, line number 2:
endfor
^
`
        }
    );
});


test('parseScript, foreach statement error no endfor', () => {
    assert.throws(
        () => {
            parseScript(`\
for value in values:
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Missing endfor statement, line number 1:
for value in values:
^
`
        }
    );
});


test('parseScript, foreach statement error endfor outside function', () => {
    assert.throws(
        () => {
            parseScript(`\
function test():
    for value in values:
endfunction
endfor
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Missing endfor statement, line number 2:
    for value in values:
^
`
        }
    );
});


test('parseScript, foreach statement error endfor inside function', () => {
    assert.throws(
        () => {
            parseScript(`\
for value in values:
function test():
    endfor
endfunction
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching for statement, line number 3:
    endfor
^
`
        }
    );
});


test('parseScript, foreach statement error break inside function', () => {
    assert.throws(
        () => {
            parseScript(`\
for value in values:
function test():
        break
    endfor
endfunction
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Break statement outside of loop, line number 3:
        break
^
`
        }
    );
});


test('parseScript, foreach statement error continue inside function', () => {
    assert.throws(
        () => {
            parseScript(`\
for value in values:
function test():
        continue
    endfor
endfunction
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Continue statement outside of loop, line number 3:
        continue
^
`
        }
    );
});


test('parseScript, break statement error break outside loop', () => {
    assert.throws(
        () => {
            parseScript(`\
break
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Break statement outside of loop, line number 1:
break
^
`
        }
    );
});


test('parseScript, break statement error break outside loop 2', () => {
    assert.throws(
        () => {
            parseScript(`\
if i > 0:
    break
endif
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Break statement outside of loop, line number 2:
    break
^
`
        }
    );
});


test('parseScript, continue statement error continue outside loop', () => {
    assert.throws(
        () => {
            parseScript(`\
continue
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Continue statement outside of loop, line number 1:
continue
^
`
        }
    );
});


test('parseScript, continue statement error continue outside loop 2', () => {
    assert.throws(
        () => {
            parseScript(`\
if i > 0:
    continue
endif
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Continue statement outside of loop, line number 2:
    continue
^
`
        }
    );
});


test('parseScript, include statement', () => {
    const script = validateScript(parseScript(`\
include 'fi\\'le.bare'
`));
    assert.deepEqual(script, {
        'statements': [
            {'include': {'includes': [{'url': "fi'le.bare"}]}}
        ]
    });
});


test('parseScript, include statement, system', () => {
    const script = validateScript(parseScript(`\
include <file.bare>
`));
    assert.deepEqual(script, {
        'statements': [
            {'include': {'includes': [{'url': 'file.bare', 'system': true}]}}
        ]
    });
});


test('parseScript, include statement, double-quotes', () => {
    assert.throws(
        () => {
            parseScript(`\
include "file.bare"
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error, line number 1:
include "file.bare"
       ^
`,
            'error': 'Syntax error',
            'line': 'include "file.bare"',
            'columnNumber': 8,
            'lineNumber': 1
        }
    );
});


test('parseScript, include statement multiple', () => {
    const script = validateScript(parseScript(`\
include 'test.bare'
include <test2.bare>
include 'test3.bare'
`));
    assert.deepEqual(script, {
        'statements': [
            {'include': {'includes': [{'url': 'test.bare'}, {'url': 'test2.bare', 'system': true}, {'url': 'test3.bare'}]}}
        ]
    });
});


test('parseScript, expression statement', () => {
    const script = validateScript(parseScript(`\
foo()
`));
    assert.deepEqual(script, {
        'statements': [
            {'expr': {'expr': {'function': {'name': 'foo', 'args': []}}}}
        ]
    });
});


test('parseScript, expression statement syntax error', () => {
    assert.throws(
        () => {
            parseScript(`\
a = 0
b = 1
foo \\
bar
c = 2
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error, line number 3:
foo bar
   ^
`,
            'error': 'Syntax error',
            'line': 'foo bar',
            'columnNumber': 4,
            'lineNumber': 3
        }
    );
});


test('parseScript, assignment statement expression syntax error', () => {
    assert.throws(
        () => {
            parseScript(`\
a = 0
b = 1 + foo bar
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error, line number 2:
b = 1 + foo bar
           ^
`,
            'error': 'Syntax error',
            'line': 'b = 1 + foo bar',
            'columnNumber': 12,
            'lineNumber': 2
        }
    );
});


test('parseScript, jump statement expression syntax error', () => {
    assert.throws(
        () => {
            parseScript(`\
jumpif (@#$) label
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error, line number 1:
jumpif (@#$) label
        ^
`,
            'error': 'Syntax error',
            'line': 'jumpif (@#$) label',
            'columnNumber': 9,
            'lineNumber': 1
        }
    );
});


test('parseScript, return statement expression syntax error', () => {
    assert.throws(
        () => {
            parseScript(`\
return @#$
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error, line number 1:
return @#$
       ^
`,
            'error': 'Syntax error',
            'line': 'return @#$',
            'columnNumber': 8,
            'lineNumber': 1
        }
    );
});


test('parseScript, nested function statement error', () => {
    assert.throws(
        () => {
            parseScript(`\
function foo():
    function bar():
    endfunction
endfunction
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Nested function definition, line number 2:
    function bar():
^
`,
            'error': 'Nested function definition',
            'line': '    function bar():',
            'columnNumber': 1,
            'lineNumber': 2
        }
    );
});


test('parseScript, endfunction statement error', () => {
    assert.throws(
        () => {
            parseScript(`\
a = 1
endfunction
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
No matching function definition, line number 2:
endfunction
^
`,
            'error': 'No matching function definition',
            'line': 'endfunction',
            'columnNumber': 1,
            'lineNumber': 2
        }
    );
});


test('parseExpression', () => {
    const expr = parseExpression('7 + 3 * 5');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '+',
            'left': {'number': 7},
            'right': {
                'binary': {
                    'op': '*',
                    'left': {'number': 3},
                    'right': {'number': 5}
                }
            }
        }
    });
});


test('parseExpression, unary', () => {
    const expr = parseExpression('!a');
    assert.deepEqual(validateExpression(expr), {
        'unary': {
            'op': '!',
            'expr': {'variable': 'a'}
        }
    });
});


test('parseExpression, syntax error', () => {
    const exprText = ' @#$';
    assert.throws(
        () => {
            parseExpression(exprText);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error:
${exprText}
^
`,
            'line': exprText,
            'columnNumber': 1,
            'lineNumber': null
        }
    );
});


test('parseExpression, nextText syntax error', () => {
    const exprText = 'foo bar';
    assert.throws(
        () => {
            parseExpression(exprText);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error:
${exprText}
   ^
`,
            'line': exprText,
            'columnNumber': 4,
            'lineNumber': null
        }
    );
});


test('parseExpression, syntax error, unmatched parenthesis', () => {
    const exprText = '10 * (1 + 2';
    assert.throws(
        () => {
            parseExpression(exprText);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Unmatched parenthesis:
${exprText}
    ^
`,
            'line': exprText,
            'columnNumber': 5,
            'lineNumber': null
        }
    );
});


test('parseExpression, function argument syntax error', () => {
    const exprText = 'foo(1, 2 3)';
    assert.throws(
        () => {
            parseExpression(exprText);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
Syntax error:
${exprText}
        ^
`,
            'line': exprText,
            'columnNumber': 9,
            'lineNumber': null
        }
    );
});


test('parseExpression, operator precedence', () => {
    const expr = parseExpression('7 * 3 + 5');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '+',
            'left': {
                'binary': {
                    'op': '*',
                    'left': {'number': 7},
                    'right': {'number': 3}
                }
            },
            'right': {'number': 5}
        }
    });
});


test('parseExpression, operator precedence 2', () => {
    const expr = parseExpression('2 * 3 + 4 - 1');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '-',
            'left': {
                'binary': {
                    'op': '+',
                    'left': {
                        'binary': {
                            'op': '*',
                            'left': {'number': 2},
                            'right': {'number': 3}
                        }
                    },
                    'right': {'number': 4}
                }
            },
            'right': {'number': 1}
        }
    });
});


test('parseExpression, operator precedence 3', () => {
    const expr = parseExpression('2 + 3 + 4 - 1');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '-',
            'left': {
                'binary': {
                    'op': '+',
                    'left': {
                        'binary': {
                            'op': '+',
                            'left': {'number': 2},
                            'right': {'number': 3}
                        }
                    },
                    'right': {'number': 4}
                }
            },
            'right': {'number': 1}
        }
    });
});


test('parseExpression, operator precedence 4', () => {
    const expr = parseExpression('1 - 2 + 3 + 4 + 5 * 6');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '+',
            'left': {
                'binary': {
                    'op': '+',
                    'left': {
                        'binary': {
                            'op': '+',
                            'left': {
                                'binary': {
                                    'op': '-',
                                    'left': {'number': 1},
                                    'right': {'number': 2}
                                }
                            },
                            'right': {'number': 3}
                        }
                    },
                    'right': {'number': 4}
                }
            },
            'right': {
                'binary': {
                    'op': '*',
                    'left': {'number': 5},
                    'right': {'number': 6}
                }
            }
        }
    });
});


test('parseExpression, operator precedence 5', () => {
    const expr = parseExpression('1 + 2 * 5 / 2');
    assert.deepEqual(expr, {
        'binary': {
            'op': '+',
            'left': {'number': 1},
            'right': {
                'binary': {
                    'op': '/',
                    'left': {
                        'binary': {
                            'op': '*',
                            'left': {'number': 2},
                            'right': {'number': 5}
                        }
                    },
                    'right': {'number': 2}
                }
            }
        }
    });
});


test('parseExpression, operator precedence 6', () => {
    const expr = parseExpression('1 + 2 / 5 * 2');
    assert.deepEqual(expr, {
        'binary': {
            'op': '+',
            'left': {'number': 1},
            'right': {
                'binary': {
                    'op': '*',
                    'left': {
                        'binary': {
                            'op': '/',
                            'left': {'number': 2},
                            'right': {'number': 5}
                        }
                    },
                    'right': {'number': 2}
                }
            }
        }
    });
});


test('parseExpression, operator precedence 7', () => {
    const expr = parseExpression('1 + 2 / 3 / 4 * 5');
    assert.deepEqual(expr, {
        'binary': {
            'op': '+',
            'left': {'number': 1},
            'right': {
                'binary': {
                    'op': '*',
                    'left': {
                        'binary': {
                            'op': '/',
                            'left': {
                                'binary': {
                                    'op': '/',
                                    'left': {'number': 2},
                                    'right': {'number': 3}
                                }
                            },
                            'right': {'number': 4}
                        }
                    },
                    'right': {'number': 5}
                }
            }
        }
    });
});


test('parseExpression, operator precedence 8', () => {
    const expr = parseExpression('1 >= 2 && 3 < 4 - 5');
    assert.deepEqual(expr, {
        'binary': {
            'op': '&&',
            'left': {
                'binary': {
                    'op': '>=',
                    'left': {'number': 1},
                    'right': {'number': 2}
                }
            },
            'right': {
                'binary': {
                    'op': '<',
                    'left': {'number': 3},
                    'right': {
                        'binary': {
                            'op': '-',
                            'left': {'number': 4},
                            'right': {'number': 5}
                        }
                    }
                }
            }
        }
    });
});


test('parseExpression, group', () => {
    const expr = parseExpression('(7 + 3) * 5');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '*',
            'left': {
                'group': {
                    'binary': {
                        'op': '+',
                        'left': {'number': 7},
                        'right': {'number': 3}
                    }
                }
            },
            'right': {'number': 5}
        }
    });
});


test('parseExpression, group nested', () => {
    const expr = parseExpression('(1 + (2))');
    assert.deepEqual(validateExpression(expr), {
        'group': {
            'binary': {
                'op': '+',
                'left': {'number': 1},
                'right': {'group': {'number': 2}}
            }
        }
    });
});


test('parseExpression, string literal', () => {
    const expr = parseExpression("'abc'");
    assert.deepEqual(validateExpression(expr), {'string': 'abc'});
});


test('parseExpression, string literal escapes', () => {
    const expr = parseExpression("'ab \\'c\\' d\\\\e \\f'");
    assert.deepEqual(validateExpression(expr), {'string': "ab 'c' d\\e \\f"});
});


test('parseExpression, string literal backslash end', () => {
    const expr = parseExpression("test('abc \\\\', 'def')");
    assert.deepEqual(validateExpression(expr), {'function': {
        'name': 'test',
        'args': [{'string': 'abc \\'}, {'string': 'def'}]
    }});
});


test('parseExpression, string literal double-quote', () => {
    const expr = parseExpression('"abc"');
    assert.deepEqual(validateExpression(expr), {'string': 'abc'});
});


test('parseExpression, string literal double-quote escapes', () => {
    const expr = parseExpression('"ab \\"c\\" d\\\\e \\f"');
    assert.deepEqual(validateExpression(expr), {'string': 'ab "c" d\\e \\f'});
});


test('parseExpression, string literal double-quote backslash end', () => {
    const expr = parseExpression('test("abc \\\\", "def")');
    assert.deepEqual(validateExpression(expr), {'function': {
        'name': 'test',
        'args': [{'string': 'abc \\'}, {'string': 'def'}]
    }});
});
