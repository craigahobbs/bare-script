// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

import {parseExpression, parseScript} from '../lib/parser.js';
import {validateExpression, validateScript} from '../lib/model.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('parseScript, array input', () => {
    const script = validateScript(parseScript([
        'a = arrayNew( \\',
        '    1,\\',
        `\
    2 \
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
function addNumbers(a, b)
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
async function fetchURL(url)
    return httpFetch(url)
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
                        {'return': {'expr': {'function': {'name': 'httpFetch', 'args': [{'variable': 'url'}]}}}}
                    ]
                }
            }
        ]
    });
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
                'label': '__calcScriptIf0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}}},
            {'jump': {'label': '__calcScriptDone0'}},
            {'label': '__calcScriptIf0'},
            {'jump': {
                'label': '__calcScriptIf1',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '<', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}}
            },
            {'expr': {'name': 'a', 'expr': {'number': 2}}},
            {'jump': {'label': '__calcScriptDone0'}},
            {'label': '__calcScriptIf1'},
            {'expr': {'name': 'a', 'expr': {'number': 3}}},
            {'label': '__calcScriptDone0'}
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
                'label': '__calcScriptDone0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}}},
            {'label': '__calcScriptDone0'}
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
                'label': '__calcScriptIf0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}}},
            {'jump': {'label': '__calcScriptDone0'}},
            {'label': '__calcScriptIf0'},
            {'jump': {
                'label': '__calcScriptDone0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '<', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'expr': {'name': 'a', 'expr': {'number': 2}}},
            {'label': '__calcScriptDone0'}
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
                'label': '__calcScriptIf0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}}},
            {'jump': {'label': '__calcScriptDone0'}},
            {'label': '__calcScriptIf0'},
            {'expr': {'name': 'a', 'expr': {'number': 2}}},
            {'label': '__calcScriptDone0'}
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
            'message': `\
Missing endif statement, line number 1:
if i > 0:
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
                'label': '__calcScriptDone0',
                'expr': {'unary': {
                    'op': '!',
                    'expr': {'binary': {
                        'op': '<',
                        'left': {'variable': 'i'},
                        'right': {'function': {'name': 'arrayLength', 'args': [{'variable': 'values'}]}}
                    }}
                }}
            }},
            {'label': '__calcScriptLoop0'},
            {'expr': {'name': 'i', 'expr': {'binary': {'op': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}}},
            {'jump': {
                'label': '__calcScriptLoop0',
                'expr': {'binary': {
                    'op': '<',
                    'left': {'variable': 'i'},
                    'right': {'function': {'name': 'arrayLength', 'args': [{'variable': 'values'}]}}
                }}
            }},
            {'label': '__calcScriptDone0'}
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
            {'jump': {'label': '__calcScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': 'true'}}}}},
            {'label': '__calcScriptLoop0'},
            {'jump': {'label': '__calcScriptDone0'}},
            {'jump': {'label': '__calcScriptLoop0', 'expr': {'variable': 'true'}}},
            {'label': '__calcScriptDone0'}
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
            {'jump': {'label': '__calcScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': 'true'}}}}},
            {'label': '__calcScriptLoop0'},
            {'jump': {'label': '__calcScriptLoop0'}},
            {'jump': {'label': '__calcScriptLoop0', 'expr': {'variable': 'true'}}},
            {'label': '__calcScriptDone0'}
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
            'message': `\
Missing endwhile statement, line number 1:
while true:
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
            {'expr': {'name': '__calcScriptValues0', 'expr': {'variable': 'values'}}},
            {'expr': {
                'name': '__calcScriptLength0',
                'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__calcScriptValues0'}]}}
            }},
            {'jump': {'label': '__calcScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': '__calcScriptLength0'}}}}},
            {'expr': {'name': '__calcScriptIndex0', 'expr': {'number': 0}}},
            {'label': '__calcScriptLoop0'},
            {'expr': {
                'name': 'value',
                'expr': {'function': {
                    'name': 'arrayGet',
                    'args': [{'variable': '__calcScriptValues0'}, {'variable': '__calcScriptIndex0'}]
                }}
            }},
            {'expr': {
                'name': 'sum',
                'expr': {'binary': {'op': '+', 'left': {'variable': 'sum'}, 'right': {'variable': 'value'}}}
            }},
            {'expr': {
                'name': '__calcScriptIndex0',
                'expr': {'binary': {'op': '+', 'left': {'variable': '__calcScriptIndex0'}, 'right': {'number': 1}}}
            }},
            {'jump': {
                'label': '__calcScriptLoop0',
                'expr': {'binary': {'op': '<', 'left': {'variable': '__calcScriptIndex0'}, 'right': {'variable': '__calcScriptLength0'}}}
            }},
            {'label': '__calcScriptDone0'}
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
            {'expr': {'name': '__calcScriptValues0', 'expr': {'variable': 'values'}}},
            {'expr': {
                'name': '__calcScriptLength0',
                'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__calcScriptValues0'}]}}
            }},
            {'jump': {'label': '__calcScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': '__calcScriptLength0'}}}}},
            {'expr': {'name': 'ixValue', 'expr': {'number': 0}}},
            {'label': '__calcScriptLoop0'},
            {'expr': {
                'name': 'value',
                'expr': {'function': {
                    'name': 'arrayGet',
                    'args': [{'variable': '__calcScriptValues0'}, {'variable': 'ixValue'}]
                }}
            }},
            {'expr': {
                'name': 'ixValue',
                'expr': {'binary': {'op': '+', 'left': {'variable': 'ixValue'}, 'right': {'number': 1}}}
            }},
            {'jump': {
                'label': '__calcScriptLoop0',
                'expr': {'binary': {'op': '<', 'left': {'variable': 'ixValue'}, 'right': {'variable': '__calcScriptLength0'}}}
            }},
            {'label': '__calcScriptDone0'}
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
            {'expr': {'name': '__calcScriptValues0', 'expr': {'variable': 'values'}}},
            {'expr': {
                'name': '__calcScriptLength0',
                'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__calcScriptValues0'}]}}
            }},
            {'jump': {'label': '__calcScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': '__calcScriptLength0'}}}}},
            {'expr': {'name': '__calcScriptIndex0', 'expr': {'number': 0}}},
            {'label': '__calcScriptLoop0'},
            {'expr': {
                'name': 'value',
                'expr': {'function': {
                    'name': 'arrayGet',
                    'args': [{'variable': '__calcScriptValues0'}, {'variable': '__calcScriptIndex0'}]
                }}
            }},
            {'jump': {
                'label': '__calcScriptDone1',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'jump': {'label': '__calcScriptDone0'}},
            {'label': '__calcScriptDone1'},
            {'expr': {
                'name': '__calcScriptIndex0',
                'expr': {'binary': {'op': '+', 'left': {'variable': '__calcScriptIndex0'}, 'right': {'number': 1}}}
            }},
            {'jump': {
                'label': '__calcScriptLoop0',
                'expr': {'binary': {'op': '<', 'left': {'variable': '__calcScriptIndex0'}, 'right': {'variable': '__calcScriptLength0'}}}
            }},
            {'label': '__calcScriptDone0'}
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
            {'expr': {'name': '__calcScriptValues0', 'expr': {'variable': 'values'}}},
            {'expr': {
                'name': '__calcScriptLength0',
                'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__calcScriptValues0'}]}}
            }},
            {'jump': {'label': '__calcScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': '__calcScriptLength0'}}}}},
            {'expr': {'name': '__calcScriptIndex0', 'expr': {'number': 0}}},
            {'label': '__calcScriptLoop0'},
            {'expr': {
                'name': 'value',
                'expr': {'function': {
                    'name': 'arrayGet',
                    'args': [{'variable': '__calcScriptValues0'}, {'variable': '__calcScriptIndex0'}]
                }}
            }},
            {'jump': {
                'label': '__calcScriptDone1',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'jump': {'label': '__calcScriptContinue0'}},
            {'label': '__calcScriptDone1'},
            {'label': '__calcScriptContinue0'},
            {'expr': {
                'name': '__calcScriptIndex0',
                'expr': {'binary': {'op': '+', 'left': {'variable': '__calcScriptIndex0'}, 'right': {'number': 1}}}
            }},
            {'jump': {
                'label': '__calcScriptLoop0',
                'expr': {'binary': {'op': '<', 'left': {'variable': '__calcScriptIndex0'}, 'right': {'variable': '__calcScriptLength0'}}}
            }},
            {'label': '__calcScriptDone0'}
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
            'message': `\
Missing endfor statement, line number 1:
for value in values:
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
include 'fi\\'le.mds'
`));
    assert.deepEqual(script, {
        'statements': [
            {'include': {'includes': ["fi'le.mds"], 'systemIncludes': []}}
        ]
    });
});


test('parseScript, include statement, system', () => {
    const script = validateScript(parseScript(`\
include <file.mds>
`));
    assert.deepEqual(script, {
        'statements': [
            {'include': {'includes': [], 'systemIncludes': ['file.mds']}}
        ]
    });
});


test('parseScript, include statement, double-quotes', () => {
    assert.throws(
        () => {
            parseScript(`\
include "file.mds"
`);
        },
        {
            'name': 'CalcScriptParserError',
            'message': `\
Syntax error, line number 1:
include "file.mds"
       ^
`,
            'error': 'Syntax error',
            'line': 'include "file.mds"',
            'columnNumber': 8,
            'lineNumber': 1
        }
    );
});


test('parseScript, include statement multiple', () => {
    const script = validateScript(parseScript(`\
include 'test.mds'
include <test2.mds>
include 'test3.mds'
`));
    assert.deepEqual(script, {
        'statements': [
            {'include': {'includes': ['test.mds', 'test3.mds'], 'systemIncludes': ['test2.mds']}}
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
foo \
bar
c = 2
`);
        },
        {
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
function foo()
    function bar()
    endfunction
endfunction
`);
        },
        {
            'name': 'CalcScriptParserError',
            'message': `\
Nested function definition, line number 2:
    function bar()
^
`,
            'error': 'Nested function definition',
            'line': '    function bar()',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
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
            'name': 'CalcScriptParserError',
            'message': `\
Syntax error:
foo(1, 2 3)
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
