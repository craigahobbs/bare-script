// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

import {CalcScriptParserError, parseExpression, parseScript} from '../lib/parser.js';
import {validateExpression, validateScript} from '../lib/model.js';
import test from 'ava';


/* eslint-disable id-length */


test('parseScript, array input', (t) => {
    const script = validateScript(parseScript([
        'a = arrayNew( \\',
        '    1,\\',
        `\
    2 \
)
`
    ]));
    t.deepEqual(script, {
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


test('parseScript, line continuation', (t) => {
    const script = validateScript(parseScript(`\
a = arrayNew( \\
    1, \\
    2 \\
)
`));
    t.deepEqual(script, {
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


test('parseScript, line continuation error', (t) => {
    const error = t.throws(() => {
        parseScript(`\
    fn1(arg1, \\
    fn2(),
    null))
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Syntax error, line number 1:
    fn1(arg1, fn2(),
                    ^
`);
});


test('parseScript, long line error middle', (t) => {
    const error = t.throws(() => {
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
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Syntax error, line number 1:
...  + value20, value21 + value22 + value23 + value24 + value25, @#$, value26 + value27 + value28 + value29 + value30, value ...
                                                                ^
`);
});


test('parseScript, long line error left', (t) => {
    const error = t.throws(() => {
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
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Syntax error, line number 1:
    reallyLongFunctionName( @#$, value1 + value2 + value3 + value4 + value5, value6 + value7 + value8 + value9 + value10 ...
                           ^
`);
});


test('parseScript, long line error right', (t) => {
    const error = t.throws(() => {
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
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Syntax error, line number 1:
... alue39 + value40, value41 + value42 + value43 + value44 + value45, value46 + value47 + value48 + value49 + value50 @#$ )
                                                                                                                      ^
`);
});


test('parseScript, jumpif statement', (t) => {
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
    t.deepEqual(script, {
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


test('parseScript, function statement', (t) => {
    const script = validateScript(parseScript(`\
function addNumbers(a, b)
    return a + b
endfunction
`));
    t.deepEqual(script, {
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


test('parseScript, async function statement', (t) => {
    const script = validateScript(parseScript(`\
async function fetchURL(url)
    return fetch(url)
endfunction
`));
    t.deepEqual(script, {
        'statements': [
            {
                'function': {
                    'async': true,
                    'name': 'fetchURL',
                    'args': ['url'],
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'fetch', 'args': [{'variable': 'url'}]}}}}
                    ]
                }
            }
        ]
    });
});


test('parseScript, if-then statement', (t) => {
    const script = validateScript(parseScript(`\
if i > 0 then
    a = 1
else if i < 0 then
    a = 2
else then
    a = 3
endif
`));
    t.deepEqual(script, {
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


test('parseScript, if-then statement only', (t) => {
    const script = validateScript(parseScript(`\
if i > 0 then
    a = 1
endif
`));
    t.deepEqual(script, {
        'statements': [
            {'jump': {
                'label': '__calcScriptIf0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}}},
            {'label': '__calcScriptIf0'},
            {'label': '__calcScriptDone0'}
        ]
    });
});


test('parseScript, if-then statement if-else-if', (t) => {
    const script = validateScript(parseScript(`\
if i > 0 then
    a = 1
else if i < 0 then
    a = 2
endif
`));
    t.deepEqual(script, {
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
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '<', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'expr': {'name': 'a', 'expr': {'number': 2}}},
            {'label': '__calcScriptIf1'},
            {'label': '__calcScriptDone0'}
        ]
    });
});


test('parseScript, if-then statement if-else', (t) => {
    const script = validateScript(parseScript(`\
if i > 0 then
    a = 1
else then
    a = 2
endif
`));
    t.deepEqual(script, {
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


test('parseScript, if-then statement error else-if outside if-then', (t) => {
    const error = t.throws(() => {
        parseScript(`\
else if i < 0 then
    a = 3
endif
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
No matching if-then statement, line number 1:
else if i < 0 then
^
`);
});


test('parseScript, if-then statement error else-if outside if-then 2', (t) => {
    const error = t.throws(() => {
        parseScript(`\
while true do
    else if i < 0 then
        a = 3
    endif
endwhile
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
No matching if-then statement, line number 2:
    else if i < 0 then
^
`);
});


test('parseScript, if-then statement error else-then outside if-then', (t) => {
    const error = t.throws(() => {
        parseScript(`\
else then
    a = 3
endif
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
No matching if-then statement, line number 1:
else then
^
`);
});


test('parseScript, if-then statement error else-then outside if-then 2', (t) => {
    const error = t.throws(() => {
        parseScript(`\
while true do
    else then
        a = 3
    endif
endwhile
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
No matching if-then statement, line number 2:
    else then
^
`);
});


test('parseScript, if-then statement error endif outside if-then', (t) => {
    const error = t.throws(() => {
        parseScript(`\
endif
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
No matching if-then statement, line number 1:
endif
^
`);
});


test('parseScript, if-then statement error endif outside if-then 2', (t) => {
    const error = t.throws(() => {
        parseScript(`\
while true do
    endif
endwhile
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
No matching if-then statement, line number 2:
    endif
^
`);
});


test('parseScript, if-then statement error else-if after else', (t) => {
    const error = t.throws(() => {
        parseScript(`\
if i > 0 then
    a = 1
else then
    a = 2
else if i < 0 then
    a = 3
endif
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Else-if-then statement following else-then statement, line number 5:
else if i < 0 then
^
`);
});


test('parseScript, if-then statement error multiple else', (t) => {
    const error = t.throws(() => {
        parseScript(`\
if i > 0 then
    a = 1
else then
    a = 2
else then
    a = 3
endif
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Multiple else-then statements, line number 5:
else then
^
`);
});


test('parseScript, if-then statement error no endif', (t) => {
    const error = t.throws(() => {
        parseScript(`\
if i > 0 then
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Missing endif statement, line number 1:
if i > 0 then
^
`);
});


test('parseScript, while-do statement', (t) => {
    const script = validateScript(parseScript(`\
i = 0
while i < arrayLength(values) do
    i = i + 1
endwhile
`));
    t.deepEqual(script, {
        'statements': [
            {'expr': {'name': 'i', 'expr': {'number': 0}}},
            {'label': '__calcScriptLoop0'},
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
            {'expr': {'name': 'i', 'expr': {'binary': {'op': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}}},
            {'jump': {'label': '__calcScriptLoop0'}},
            {'label': '__calcScriptDone0'}
        ]
    });
});


test('parseScript, while-do statement break', (t) => {
    const script = validateScript(parseScript(`\
while true do
    break
endwhile
`));
    t.deepEqual(script, {
        'statements': [
            {'label': '__calcScriptLoop0'},
            {'jump': {'label': '__calcScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': 'true'}}}}},
            {'jump': {'label': '__calcScriptDone0'}},
            {'jump': {'label': '__calcScriptLoop0'}},
            {'label': '__calcScriptDone0'}
        ]
    });
});


test('parseScript, while-do statement continue', (t) => {
    const script = validateScript(parseScript(`\
while true do
    continue
endwhile
`));
    t.deepEqual(script, {
        'statements': [
            {'label': '__calcScriptLoop0'},
            {'jump': {'label': '__calcScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': 'true'}}}}},
            {'jump': {'label': '__calcScriptLoop0'}},
            {'jump': {'label': '__calcScriptLoop0'}},
            {'label': '__calcScriptDone0'}
        ]
    });
});


test('parseScript, while-do statement error endwhile outside while-do', (t) => {
    const error = t.throws(() => {
        parseScript(`\
endwhile
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
No matching while-do statement, line number 1:
endwhile
^
`);
});


test('parseScript, while-do statement error endwhile outside while-do 2', (t) => {
    const error = t.throws(() => {
        parseScript(`\
foreach value in values do
endwhile
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
No matching while-do statement, line number 2:
endwhile
^
`);
});


test('parseScript, while-do statement error no endwhile', (t) => {
    const error = t.throws(() => {
        parseScript(`\
while true do
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Missing endwhile statement, line number 1:
while true do
^
`);
});


test('parseScript, foreach statement', (t) => {
    const script = validateScript(parseScript(`\
values = arrayNew(1, 2, 3)
sum = 0
foreach value in values do
    sum = sum + value
endforeach
`));
    t.deepEqual(script, {
        'statements': [
            {'expr': {
                'name': 'values',
                'expr': {'function': {'name': 'arrayNew', 'args': [{'number': 1}, {'number': 2}, {'number': 3}]}}
            }},
            {'expr': {'name': 'sum', 'expr': {'number': 0}}},
            {'expr': {'name': '__calcScriptValues0', 'expr': {'variable': 'values'}}},
            {'jump': {
                'label': '__calcScriptDone0',
                'expr': {
                    'unary': {
                        'op': '!',
                        'expr': {
                            'binary': {
                                'op': '>',
                                'left': {'function': {'name': 'arrayLength', 'args': [{'variable': '__calcScriptValues0'}]}},
                                'right': {'number': 0}
                            }
                        }
                    }
                }
            }},
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
                'expr': {
                    'binary': {
                        'op': '<',
                        'left': {'variable': '__calcScriptIndex0'},
                        'right': {'function': {'name': 'arrayLength', 'args': [{'variable': '__calcScriptValues0'}]}}
                    }
                }
            }},
            {'label': '__calcScriptDone0'}
        ]
    });
});


test('parseScript, foreach statement with index', (t) => {
    const script = validateScript(parseScript(`\
foreach value, ixValue in values do
endforeach
`));
    t.deepEqual(script, {
        'statements': [
            {'expr': {'name': '__calcScriptValues0', 'expr': {'variable': 'values'}}},
            {'jump': {
                'label': '__calcScriptDone0',
                'expr': {
                    'unary': {
                        'op': '!',
                        'expr': {
                            'binary': {
                                'op': '>',
                                'left': {'function': {'name': 'arrayLength', 'args': [{'variable': '__calcScriptValues0'}]}},
                                'right': {'number': 0}
                            }
                        }
                    }
                }
            }},
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
                'expr': {
                    'binary': {
                        'op': '<',
                        'left': {'variable': 'ixValue'},
                        'right': {'function': {'name': 'arrayLength', 'args': [{'variable': '__calcScriptValues0'}]}}
                    }
                }
            }},
            {'label': '__calcScriptDone0'}
        ]
    });
});


test('parseScript, foreach statement break', (t) => {
    const script = validateScript(parseScript(`\
foreach value in values do
    if i > 0 then
        break
    endif
endforeach
`));
    t.deepEqual(script, {
        'statements': [
            {'expr': {'name': '__calcScriptValues0', 'expr': {'variable': 'values'}}},
            {'jump': {
                'label': '__calcScriptDone0',
                'expr': {
                    'unary': {
                        'op': '!',
                        'expr': {
                            'binary': {
                                'op': '>',
                                'left': {'function': {'name': 'arrayLength', 'args': [{'variable': '__calcScriptValues0'}]}},
                                'right': {'number': 0}
                            }
                        }
                    }
                }
            }},
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
                'label': '__calcScriptIf1',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'jump': {'label': '__calcScriptDone0'}},
            {'label': '__calcScriptIf1'},
            {'label': '__calcScriptDone1'},
            {'expr': {
                'name': '__calcScriptIndex0',
                'expr': {'binary': {'op': '+', 'left': {'variable': '__calcScriptIndex0'}, 'right': {'number': 1}}}
            }},
            {'jump': {
                'label': '__calcScriptLoop0',
                'expr': {
                    'binary': {
                        'op': '<',
                        'left': {'variable': '__calcScriptIndex0'},
                        'right': {'function': {'name': 'arrayLength', 'args': [{'variable': '__calcScriptValues0'}]}}
                    }
                }
            }},
            {'label': '__calcScriptDone0'}
        ]
    });
});


test('parseScript, foreach statement continue', (t) => {
    const script = validateScript(parseScript(`\
foreach value in values do
    if i > 0 then
        continue
    endif
endforeach
`));
    t.deepEqual(script, {
        'statements': [
            {'expr': {'name': '__calcScriptValues0', 'expr': {'variable': 'values'}}},
            {'jump': {
                'label': '__calcScriptDone0',
                'expr': {
                    'unary': {
                        'op': '!',
                        'expr': {
                            'binary': {
                                'op': '>',
                                'left': {'function': {'name': 'arrayLength', 'args': [{'variable': '__calcScriptValues0'}]}},
                                'right': {'number': 0}
                            }
                        }
                    }
                }
            }},
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
                'label': '__calcScriptIf1',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}}
            }},
            {'jump': {'label': '__calcScriptContinue0'}},
            {'label': '__calcScriptIf1'},
            {'label': '__calcScriptDone1'},
            {'label': '__calcScriptContinue0'},
            {'expr': {
                'name': '__calcScriptIndex0',
                'expr': {'binary': {'op': '+', 'left': {'variable': '__calcScriptIndex0'}, 'right': {'number': 1}}}
            }},
            {'jump': {
                'label': '__calcScriptLoop0',
                'expr': {
                    'binary': {
                        'op': '<',
                        'left': {'variable': '__calcScriptIndex0'},
                        'right': {'function': {'name': 'arrayLength', 'args': [{'variable': '__calcScriptValues0'}]}}
                    }
                }
            }},
            {'label': '__calcScriptDone0'}
        ]
    });
});


test('parseScript, foreach statement error foreach outside foreach', (t) => {
    const error = t.throws(() => {
        parseScript(`\
endforeach
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
No matching foreach statement, line number 1:
endforeach
^
`);
});


test('parseScript, foreach statement error endforeach outside foreach 2', (t) => {
    const error = t.throws(() => {
        parseScript(`\
while true do
endforeach
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
No matching foreach statement, line number 2:
endforeach
^
`);
});


test('parseScript, foreach statement error no endforeach', (t) => {
    const error = t.throws(() => {
        parseScript(`\
foreach value in values do
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Missing endforeach statement, line number 1:
foreach value in values do
^
`);
});


test('parseScript, break statement error break outside loop', (t) => {
    const error = t.throws(() => {
        parseScript(`\
break
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Break statement outside of loop, line number 1:
break
^
`);
});


test('parseScript, break statement error break outside loop 2', (t) => {
    const error = t.throws(() => {
        parseScript(`\
if i > 0 then
    break
endif
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Break statement outside of loop, line number 2:
    break
^
`);
});


test('parseScript, continue statement error continue outside loop', (t) => {
    const error = t.throws(() => {
        parseScript(`\
continue
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Continue statement outside of loop, line number 1:
continue
^
`);
});


test('parseScript, continue statement error continue outside loop 2', (t) => {
    const error = t.throws(() => {
        parseScript(`\
if i > 0 then
    continue
endif
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Continue statement outside of loop, line number 2:
    continue
^
`);
});


test('parseScript, include statement', (t) => {
    const script = validateScript(parseScript(`\
include 'fi\\'le.mds'
`));
    t.deepEqual(script, {
        'statements': [
            {'include': "fi'le.mds"}
        ]
    });
});


test('parseScript, include statement, double-quotes', (t) => {
    const script = validateScript(parseScript(`\
include "fi\\"le.mds"
`));
    t.deepEqual(script, {
        'statements': [
            {'include': 'fi"le.mds'}
        ]
    });
});


test('parseScript, expression statement', (t) => {
    const script = validateScript(parseScript(`\
foo()
`));
    t.deepEqual(script, {
        'statements': [
            {'expr': {'expr': {'function': {'name': 'foo', 'args': []}}}}
        ]
    });
});


test('parseScript, expression statement syntax error', (t) => {
    const error = t.throws(() => {
        parseScript(`\
a = 0
b = 1
foo \
bar
c = 2
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Syntax error, line number 3:
foo bar
   ^
`);
    t.is(error.error, 'Syntax error');
    t.is(error.line, 'foo bar');
    t.is(error.columnNumber, 4);
    t.is(error.lineNumber, 3);
});


test('parseScript, assignment statement expression syntax error', (t) => {
    const error = t.throws(() => {
        parseScript(`\
a = 0
b = 1 + foo bar
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Syntax error, line number 2:
b = 1 + foo bar
           ^
`);
    t.is(error.error, 'Syntax error');
    t.is(error.line, 'b = 1 + foo bar');
    t.is(error.columnNumber, 12);
    t.is(error.lineNumber, 2);
});


test('parseScript, jump statement expression syntax error', (t) => {
    const error = t.throws(() => {
        parseScript(`\
jumpif (@#$) label
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Syntax error, line number 1:
jumpif (@#$) label
        ^
`);
    t.is(error.error, 'Syntax error');
    t.is(error.line, 'jumpif (@#$) label');
    t.is(error.columnNumber, 9);
    t.is(error.lineNumber, 1);
});


test('parseScript, return statement expression syntax error', (t) => {
    const error = t.throws(() => {
        parseScript(`\
return @#$
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Syntax error, line number 1:
return @#$
       ^
`);
    t.is(error.error, 'Syntax error');
    t.is(error.line, 'return @#$');
    t.is(error.columnNumber, 8);
    t.is(error.lineNumber, 1);
});


test('parseScript, nested function statement error', (t) => {
    const error = t.throws(() => {
        parseScript(`\
function foo()
    function bar()
    endfunction
endfunction
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Nested function definition, line number 2:
    function bar()
^
`);
    t.is(error.error, 'Nested function definition');
    t.is(error.line, '    function bar()');
    t.is(error.columnNumber, 1);
    t.is(error.lineNumber, 2);
});


test('parseScript, endfunction statement error', (t) => {
    const error = t.throws(() => {
        parseScript(`\
a = 1
endfunction
`);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
No matching function definition, line number 2:
endfunction
^
`);
    t.is(error.error, 'No matching function definition');
    t.is(error.line, 'endfunction');
    t.is(error.columnNumber, 1);
    t.is(error.lineNumber, 2);
});


test('parseExpression', (t) => {
    const expr = parseExpression('7 + 3 * 5');
    t.deepEqual(validateExpression(expr), {
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


test('parseExpression, unary', (t) => {
    const expr = parseExpression('!a');
    t.deepEqual(validateExpression(expr), {
        'unary': {
            'op': '!',
            'expr': {'variable': 'a'}
        }
    });
});


test('parseExpression, syntax error', (t) => {
    const exprText = ' @#$';
    const error = t.throws(() => {
        parseExpression(exprText);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Syntax error:
${exprText}
^
`);
    t.is(error.line, exprText);
    t.is(error.columnNumber, 1);
    t.is(error.lineNumber, null);
});


test('parseExpression, nextText syntax error', (t) => {
    const exprText = 'foo bar';
    const error = t.throws(() => {
        parseExpression(exprText);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Syntax error:
${exprText}
   ^
`);
    t.is(error.line, exprText);
    t.is(error.columnNumber, 4);
    t.is(error.lineNumber, null);
});


test('parseExpression, syntax error, unmatched parenthesis', (t) => {
    const exprText = '10 * (1 + 2';
    const error = t.throws(() => {
        parseExpression(exprText);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Unmatched parenthesis:
${exprText}
    ^
`);
    t.is(error.line, exprText);
    t.is(error.columnNumber, 5);
    t.is(error.lineNumber, null);
});


test('parseExpression, function argument syntax error', (t) => {
    const exprText = 'foo(1, 2 3)';
    const error = t.throws(() => {
        parseExpression(exprText);
    }, {'instanceOf': CalcScriptParserError});
    t.is(error.message, `\
Syntax error:
foo(1, 2 3)
        ^
`);
    t.is(error.line, exprText);
    t.is(error.columnNumber, 9);
    t.is(error.lineNumber, null);
});


test('parseExpression, operator precedence', (t) => {
    const expr = parseExpression('7 * 3 + 5');
    t.deepEqual(validateExpression(expr), {
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


test('parseExpression, operator precedence 2', (t) => {
    const expr = parseExpression('2 * 3 + 4 - 1');
    t.deepEqual(validateExpression(expr), {
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


test('parseExpression, operator precedence 3', (t) => {
    const expr = parseExpression('2 + 3 + 4 - 1');
    t.deepEqual(validateExpression(expr), {
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


test('parseExpression, operator precedence 4', (t) => {
    const expr = parseExpression('1 - 2 + 3 + 4 + 5 * 6');
    t.deepEqual(validateExpression(expr), {
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


test('parseExpression, operator precedence 5', (t) => {
    const expr = parseExpression('1 + 2 * 5 / 2');
    t.deepEqual(expr, {
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


test('parseExpression, operator precedence 6', (t) => {
    const expr = parseExpression('1 + 2 / 5 * 2');
    t.deepEqual(expr, {
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


test('parseExpression, operator precedence 7', (t) => {
    const expr = parseExpression('1 + 2 / 3 / 4 * 5');
    t.deepEqual(expr, {
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


test('parseExpression, operator precedence 8', (t) => {
    const expr = parseExpression('1 >= 2 && 3 < 4 - 5');
    t.deepEqual(expr, {
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


test('parseExpression, group', (t) => {
    const expr = parseExpression('(7 + 3) * 5');
    t.deepEqual(validateExpression(expr), {
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


test('parseExpression, group nested', (t) => {
    const expr = parseExpression('(1 + (2))');
    t.deepEqual(validateExpression(expr), {
        'group': {
            'binary': {
                'op': '+',
                'left': {'number': 1},
                'right': {'group': {'number': 2}}
            }
        }
    });
});


test('parseExpression, string literal', (t) => {
    const expr = parseExpression("'abc'");
    t.deepEqual(validateExpression(expr), {'string': 'abc'});
});


test('parseExpression, string literal escapes', (t) => {
    const expr = parseExpression("'ab \\'c\\' d\\\\e \\f'");
    t.deepEqual(validateExpression(expr), {'string': "ab 'c' d\\e \\f"});
});


test('parseExpression, string literal backslash end', (t) => {
    const expr = parseExpression("test('abc \\\\', 'def')");
    t.deepEqual(validateExpression(expr), {'function': {
        'name': 'test',
        'args': [{'string': 'abc \\'}, {'string': 'def'}]
    }});
});


test('parseExpression, string literal double-quote', (t) => {
    const expr = parseExpression('"abc"');
    t.deepEqual(validateExpression(expr), {'string': 'abc'});
});


test('parseExpression, string literal double-quote escapes', (t) => {
    const expr = parseExpression('"ab \\"c\\" d\\\\e \\f"');
    t.deepEqual(validateExpression(expr), {'string': 'ab "c" d\\e \\f'});
});


test('parseExpression, string literal double-quote backslash end', (t) => {
    const expr = parseExpression('test("abc \\\\", "def")');
    t.deepEqual(validateExpression(expr), {'function': {
        'name': 'test',
        'args': [{'string': 'abc \\'}, {'string': 'def'}]
    }});
});
