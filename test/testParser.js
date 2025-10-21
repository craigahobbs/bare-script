// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {parseExpression, parseScript} from '../lib/parser.js';
import {validateExpression, validateScript} from '../lib/model.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('parseScript, array input', () => {
    const script = validateScript(parseScript([
        'a = [ \\',
        '    1,\\',
        `\
    2 \\
]
`
    ]));
    assert.deepEqual(script, {
        'scriptLines': [
            'a = [ \\',
            '    1,\\',
            '    2 \\',
            ']',
            ''
        ],
        'statements': [
            {
                'expr': {
                    'name': 'a',
                    'expr': {'function': {'name': 'arrayNew', 'args': [{'number': 1}, {'number': 2}]}},
                    'lineNumber': 1,
                    'lineCount': 4
                }
            }
        ]
    });
});


test('parseScript, script name', () => {
    const scriptStr = 'return 1 + 2';
    const script = validateScript(parseScript(scriptStr, 1, 'test.bare'));
    assert.deepEqual(script, {
        'scriptName': 'test.bare',
        'scriptLines': scriptStr.split(/\r?\n/),
        'statements': [
            {
                'return': {
                    'expr': {'binary': {'op': '+', 'left': {'number': 1.0}, 'right': {'number': 2.0}}},
                    'lineNumber': 1
                }
            }
        ]
    });
});


test('parseScript, script name error', () => {
    const scriptStr = `\
a = 1
return a + 1 asdf
`;
    assert.throws(
        () => parseScript(scriptStr, 1, 'test.bare'),
        {
            'name': 'BareScriptParserError',
            'message': `\
test.bare:2: Syntax error
return a + 1 asdf
            ^
`
        }
    );
});


test('parseScript, arrayLiterals', () => {
    const scriptLines = [
        'a = [1, "2", [3, null]]'
    ];
    const script = validateScript(parseScript(scriptLines, 1, 'test.bare'));
    assert.deepEqual(script, {
        scriptName: 'test.bare',
        scriptLines,
        'statements': [
            {'expr': {
                'name': 'a',
                'expr': {'function': {
                    'name': 'arrayNew',
                    'args': [
                        {'number': 1.0},
                        {'string': '2'},
                        {'function': {
                            'name': 'arrayNew',
                            'args': [
                                {'number': 3.0},
                                {'variable': 'null'}
                            ]
                        }}
                    ],
                }},
                'lineNumber': 1
            }}
        ]
    });

    // Missing value
    assert.throws(
        () => parseScript('a = [, 2]'),
        {
            'name': 'BareScriptParserError',
            'message': `\
:1: Syntax error
a = [, 2]
     ^
`
        }
    );

    // Missing separator
    assert.throws(
        () => parseScript('a = [1 2]'),
        {
            'name': 'BareScriptParserError',
            'message': `\
:1: Syntax error
a = [1 2]
      ^
`
        }
    );
});


test('parseScript, arrayLiterals', () => {
    const scriptLines = [
        'a = {"a": 1, "b": "2", "c": {"d": 3, "e": null}}',
        'b = {}'
    ];
    const script = validateScript(parseScript(scriptLines, 1, 'test.bare'));
    assert.deepEqual(script, {
        scriptName: 'test.bare',
        scriptLines,
        'statements': [
            {'expr': {
                'name': 'a',
                'expr': {'function': {
                    'name': 'objectNew',
                    'args': [
                        {'string': 'a'},
                        {'number': 1.0},
                        {'string': 'b'},
                        {'string': '2'},
                        {'string': 'c'},
                        {'function': {
                            'name': 'objectNew',
                            'args': [
                                {'string': 'd'},
                                {'number': 3.0},
                                {'string': 'e'},
                                {'variable': 'null'}
                            ]
                        }}
                    ]
                }},
                'lineNumber': 1
            }},
            {'expr': {
                'name': 'b',
                'expr': {'function': {'name': 'objectNew', 'args': []}},
                'lineNumber': 2
            }}
        ]
    });

    // Key only
    assert.throws(
        () => parseScript('a = {"b"}'),
        {
            'name': 'BareScriptParserError',
            'message': `\
:1: Syntax error
a = {"b"}
        ^
`
        }
    );

    // No keys
    assert.throws(
        () => parseScript('a = {1, 2}'),
        {
            'name': 'BareScriptParserError',
            'message': `\
:1: Syntax error
a = {1, 2}
      ^
`
        }
    );

    // Key, no value
    assert.throws(
        () => parseScript('a = {"b":}'),
        {
            'name': 'BareScriptParserError',
            'message': `\
:1: Syntax error
a = {"b":}
         ^
`
        }
    );

    // Missing value
    assert.throws(
        () => parseScript('a = {, "b": 2}'),
        {
            'name': 'BareScriptParserError',
            'message': `\
:1: Syntax error
a = {, "b": 2}
     ^
`
        }
    );

    // Missing separator
    assert.throws(
        () => parseScript('a = {"a": 1 "b": 2}'),
        {
            'name': 'BareScriptParserError',
            'message': `\
:1: Syntax error
a = {"a": 1 "b": 2}
           ^
`
        }
    );
});


test('parseScript, comments', () => {
    const scriptStr = `\
include <args.bare>  # Application arguments

include 'util.bare'  # Utilities

# Main entry point
function main():             # Start running
    markdownPrint('# TODO')  # TODO
    return true              # Success!
endfunction                  # End running

jump label  # Jump to next
label:      # Where to jump

if false:    # Never happen
    ix = 0
elif false:  # Never happen
    ix = 1
else:        # Always happened
    ix = 2
endif        # It happens

for num in [1, 2, 3]:  # Iterate numbers
    systemLog(num)
endfor  # Numbers done

ix = 0
while true:  # Forever?
    if ix == 5:
        break  # All done
    endif
    ix = ix + 1
    if ix == 3:
        continue  # Silly
    endif
endwhile  # Keep doing it

return  # Bye!
`;
    const script = validateScript(parseScript(scriptStr));
    assert.deepEqual(script, {
        'scriptLines': scriptStr.split(/\r?\n/),
        'statements': [
            {
                'include': {
                    'includes': [
                        {'url': 'args.bare', 'system': true},
                        {'url': 'util.bare'}
                    ],
                    'lineNumber': 1,
                    'lineCount': 3
                }
            },
            {
                'function': {
                    'name': 'main',
                    'statements': [
                        {'expr': {'expr': {'function': {'name': 'markdownPrint', 'args': [{'string': '# TODO'}]}}, 'lineNumber': 7}},
                        {'return': {'expr': {'variable': 'true'}, 'lineNumber': 8}}
                    ],
                    'lineNumber': 6
                }
            },
            {'jump': {'label': 'label', 'lineNumber': 11}},
            {'label': {'name': 'label', 'lineNumber': 12}},
            {
                'jump': {
                    'label': '__bareScriptIf0',
                    'expr': {'unary': {'op': '!', 'expr': {'variable': 'false'}}},
                    'lineNumber': 14
                }
            },
            {'expr': {'name': 'ix', 'expr': {'number': 0.0}, 'lineNumber': 15}},
            {'jump': {'label': '__bareScriptDone0', 'lineNumber': 16}},
            {'label':{'name':  '__bareScriptIf0', 'lineNumber': 16}},
            {
                'jump': {
                    'label': '__bareScriptIf1',
                    'expr': {'unary': {'op': '!', 'expr': {'variable': 'false'}}},
                    'lineNumber': 16
                }
            },
            {'expr': {'name': 'ix', 'expr': {'number': 1.0}, 'lineNumber': 17}},
            {'jump': {'label': '__bareScriptDone0', 'lineNumber': 18}},
            {'label':{'name':  '__bareScriptIf1', 'lineNumber': 18}},
            {'expr': {'name': 'ix', 'expr': {'number': 2.0}, 'lineNumber': 19}},
            {'label':{'name':  '__bareScriptDone0', 'lineNumber': 20}},
            {
                'expr': {
                    'name': '__bareScriptValues2',
                    'expr': {'function': {'name': 'arrayNew', 'args': [{'number': 1.0},{'number': 2.0},{'number': 3.0}]}},
                    'lineNumber': 22
                }
            },
            {
                'expr': {
                    'name': '__bareScriptLength2',
                    'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__bareScriptValues2'}]}},
                    'lineNumber': 22
                }
            },
            {
                'jump': {
                    'label': '__bareScriptDone2',
                    'expr': {'unary': {'op': '!', 'expr': {'variable': '__bareScriptLength2'}}},
                    'lineNumber': 22
                }
            },
            {'expr': {'name': '__bareScriptIndex2', 'expr': {'number': 0.0}, 'lineNumber': 22}},
            {'label':{'name':  '__bareScriptLoop2', 'lineNumber': 22}},
            {
                'expr': {
                    'name': 'num',
                    'expr': {
                        'function': {
                            'name': 'arrayGet',
                            'args': [{'variable': '__bareScriptValues2'}, {'variable': '__bareScriptIndex2'}]
                        }
                    },
                    'lineNumber': 22
                }
            },
            {'expr': {'expr': {'function': {'name': 'systemLog', 'args': [{'variable': 'num'}]}}, 'lineNumber': 23}},
            {
                'expr': {
                    'name': '__bareScriptIndex2',
                    'expr': {'binary': {'op': '+', 'left': {'variable': '__bareScriptIndex2'},'right': {'number': 1.0}}},
                    'lineNumber': 24
                }
            },
            {
                'jump': {
                    'label': '__bareScriptLoop2',
                    'expr': {
                        'binary': {'op': '<', 'left': {'variable': '__bareScriptIndex2'},'right': {'variable': '__bareScriptLength2'}}
                    },
                    'lineNumber': 24
                }
            },
            {'label':{'name':  '__bareScriptDone2', 'lineNumber': 24}},
            {'expr': {'name': 'ix', 'expr': {'number': 0.0}, 'lineNumber': 26}},
            {
                'jump': {
                    'label': '__bareScriptDone3',
                    'expr': {'unary': {'op': '!', 'expr': {'variable': 'true'}}},
                    'lineNumber': 27
                }
            },
            {'label':{'name':  '__bareScriptLoop3', 'lineNumber': 27}},
            {
                'jump': {
                    'label': '__bareScriptDone4',
                    'expr': {
                        'unary': {'op': '!', 'expr': {'binary': {'op': '==', 'left': {'variable': 'ix'},'right': {'number': 5.0}}}}
                    },
                    'lineNumber': 28
                }
            },
            {'jump': {'label': '__bareScriptDone3', 'lineNumber': 29}},
            {'label':{'name':  '__bareScriptDone4', 'lineNumber': 30}},
            {
                'expr': {
                    'name': 'ix',
                    'expr': {'binary': {'op': '+', 'left': {'variable': 'ix'},'right': {'number': 1.0}}},
                    'lineNumber': 31
                }
            },
            {
                'jump': {
                    'label': '__bareScriptDone5',
                    'expr': {
                        'unary': {'op': '!', 'expr': {'binary': {'op': '==', 'left': {'variable': 'ix'},'right': {'number': 3.0}}}}
                    },
                    'lineNumber': 32
                }
            },
            {'jump': {'label': '__bareScriptLoop3', 'lineNumber': 33}},
            {'label':{'name':  '__bareScriptDone5', 'lineNumber': 34}},
            {'jump': {'label': '__bareScriptLoop3', 'expr': {'variable': 'true'}, 'lineNumber': 35}},
            {'label':{'name':  '__bareScriptDone3', 'lineNumber': 35}},
            {'return': {'lineNumber': 37}}
        ]
    });
});


test('parseScript, line continuation', () => {
    const scriptStr = `\
a = [ \\
    1, \\
    2 \\
]
`;
    const script = validateScript(parseScript(scriptStr));
    assert.deepEqual(script, {
        'scriptLines': scriptStr.split(/\r?\n/),
        'statements': [
            {
                'expr': {
                    'name': 'a',
                    'expr': {'function': {'name': 'arrayNew', 'args': [{'number': 1}, {'number': 2}]}},
                    'lineNumber': 1,
                    'lineCount': 4
                }
            }
        ]
    });
});


test('parseScript, line continuation comments', () => {
    const scriptStr = `\
# Comments don't continue \\
a = [ \\
    # Comments are OK within a continuation...
    1, \\
    # ...with or without a continuation backslash \\
    2 \\
]
`;
    const script = validateScript(parseScript(scriptStr));
    assert.deepEqual(script, {
        'scriptLines': scriptStr.split(/\r?\n/),
        'statements': [
            {
                'expr': {
                    'name': 'a',
                    'expr': {'function': {'name': 'arrayNew', 'args': [{'number': 1}, {'number': 2}]}},
                    'lineNumber': 2,
                    'lineCount': 6
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
:1: Syntax error
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
:1: Syntax error
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
:1: Syntax error
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
:1: Syntax error
... alue39 + value40, value41 + value42 + value43 + value44 + value45, value46 + value47 + value48 + value49 + value50 @#$ )
                                                                                                                      ^
`
        }
    );
});


test('parseScript, jumpif statement', () => {
    const scriptStr = `\
n = 10
i = 0
a = 0
b = 1

fib:
    jumpif (i >= n) fibend
    tmp = b
    b = a + b
    a = tmp
    i = i + 1
    jump fib
fibend:

return a
`;
    const script = validateScript(parseScript(scriptStr));
    assert.deepEqual(script, {
        'scriptLines': scriptStr.split(/\r?\n/),
        'statements': [
            {'expr': {'name': 'n', 'expr': {'number': 10}, 'lineNumber': 1}},
            {'expr': {'name': 'i', 'expr': {'number': 0}, 'lineNumber': 2}},
            {'expr': {'name': 'a', 'expr': {'number': 0}, 'lineNumber': 3}},
            {'expr': {'name': 'b', 'expr': {'number': 1}, 'lineNumber': 4}},
            {'label':{'name':  'fib', 'lineNumber': 6}},
            {
                'jump': {
                    'label': 'fibend',
                    'expr': {'binary': {'op': '>=', 'left': {'variable': 'i'}, 'right': {'variable': 'n'}}},
                    'lineNumber': 7
                }
            },
            {'expr': {'name': 'tmp', 'expr': {'variable': 'b'}, 'lineNumber': 8}},
            {
                'expr': {
                    'name': 'b',
                    'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}},
                    'lineNumber': 9
                }
            },
            {'expr': {'name': 'a', 'expr': {'variable': 'tmp'}, 'lineNumber': 10}},
            {
                'expr': {
                    'name': 'i',
                    'expr': {'binary': {'op': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}},
                    'lineNumber': 11
                }
            },
            {'jump': {'label': 'fib', 'lineNumber': 12}},
            {'label':{'name':  'fibend', 'lineNumber': 13}},
            {'return': {'expr': {'variable': 'a'}, 'lineNumber': 15}}
        ]
    });
});


test('parseScript, function statement', () => {
    const scriptStr = `\
function addNumbers(a, b):
    return a + b
endfunction
`;
    const script = validateScript(parseScript(scriptStr));
    assert.deepEqual(script, {
        'scriptLines': scriptStr.split(/\r?\n/),
        'statements': [
            {
                'function': {
                    'name': 'addNumbers',
                    'args': ['a', 'b'],
                    'statements': [
                        {
                            'return': {
                                'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}},
                                'lineNumber': 2
                            }
                        }
                    ],
                    'lineNumber': 1
                }
            }
        ]
    });
});


test('parseScript, async function statement', () => {
    const scriptStr = `\
async function fetchURL(url):
    return systemFetch(url)
endfunction
`;
    const script = validateScript(parseScript(scriptStr));
    assert.deepEqual(script, {
        'scriptLines': scriptStr.split(/\r?\n/),
        'statements': [
            {
                'function': {
                    'async': true,
                    'name': 'fetchURL',
                    'args': ['url'],
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'systemFetch', 'args': [{'variable': 'url'}]}}, 'lineNumber': 2}}
                    ],
                    'lineNumber': 1
                }
            }
        ]
    });
});


test('parseScript, function statement empty return', () => {
    const scriptStr = `\
function fetchURL(url):
    return
endfunction
`;
    const script = validateScript(parseScript(scriptStr));
    assert.deepEqual(script, {
        'scriptLines': scriptStr.split(/\r?\n/),
        'statements': [
            {
                'function': {
                    'name': 'fetchURL',
                    'args': ['url'],
                    'statements': [
                        {'return': {'lineNumber': 2}}
                    ],
                    'lineNumber': 1
                }
            }
        ]
    });
});


test('parseScript, function statement lastArgArray', () => {
    const scriptStr = `\
function argsCount(args...):
    return arrayLength(args)
endfunction
`;
    const script = validateScript(parseScript(scriptStr));
    assert.deepEqual(script, {
        'scriptLines': scriptStr.split(/\r?\n/),
        'statements': [
            {
                'function': {
                    'name': 'argsCount',
                    'args': ['args'],
                    'lastArgArray': true,
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': 'args'}]}}, 'lineNumber': 2}}
                    ],
                    'lineNumber': 1
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
        'scriptLines': ['function test(...):', '    return 1', 'endfunction', ''],
        'statements': [
            {
                'function': {
                    'name': 'test',
                    'lastArgArray': true,
                    'statements': [
                        {'return': {'expr': {'number': 1}, 'lineNumber': 2}}
                    ],
                    'lineNumber': 1
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
        'scriptLines': ['function argsCount(args ... ):', '    return arrayLength(args)', 'endfunction', ''],
        'statements': [
            {
                'function': {
                    'name': 'argsCount',
                    'args': ['args'],
                    'lastArgArray': true,
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': 'args'}]}}, 'lineNumber': 2}}
                    ],
                    'lineNumber': 1
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
:1: Syntax error
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
        'scriptLines': ['if i > 0:', '    a = 1', 'elif i < 0:', '    a = 2', 'else:', '    a = 3', 'endif', ''],
        'statements': [
            {'jump': {
                'label': '__bareScriptIf0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}},
                'lineNumber': 1
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}, 'lineNumber': 2}},
            {'jump': {'label': '__bareScriptDone0', 'lineNumber': 3}},
            {'label': {'name': '__bareScriptIf0', 'lineNumber': 3}},
            {'jump': {
                'label': '__bareScriptIf1',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '<', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}},
                'lineNumber': 3
            }},
            {'expr': {'name': 'a', 'expr': {'number': 2}, 'lineNumber': 4}},
            {'jump': {'label': '__bareScriptDone0', 'lineNumber': 5}},
            {'label': {'name': '__bareScriptIf1', 'lineNumber': 5}},
            {'expr': {'name': 'a', 'expr': {'number': 3}, 'lineNumber': 6}},
            {'label': {'name': '__bareScriptDone0', 'lineNumber': 7}}
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
        'scriptLines': ['if i > 0:', '    a = 1', 'endif', ''],
        'statements': [
            {'jump': {
                'label': '__bareScriptDone0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}},
                'lineNumber': 1
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}, 'lineNumber': 2}},
            {'label': {'name': '__bareScriptDone0', 'lineNumber': 3}}
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
        'scriptLines': ['if i > 0:', '    a = 1', 'elif i < 0:', '    a = 2', 'endif', ''],
        'statements': [
            {'jump': {
                'label': '__bareScriptIf0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}},
                'lineNumber': 1
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}, 'lineNumber': 2}},
            {'jump': {'label': '__bareScriptDone0', 'lineNumber': 3}},
            {'label': {'name': '__bareScriptIf0', 'lineNumber': 3}},
            {'jump': {
                'label': '__bareScriptDone0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '<', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}},
                'lineNumber': 3
            }},
            {'expr': {'name': 'a', 'expr': {'number': 2}, 'lineNumber': 4}},
            {'label': {'name': '__bareScriptDone0', 'lineNumber': 5}}
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
        'scriptLines': ['if i > 0:', '    a = 1', 'else:', '    a = 2', 'endif', ''],
        'statements': [
            {'jump': {
                'label': '__bareScriptIf0',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}},
                'lineNumber': 1
            }},
            {'expr': {'name': 'a', 'expr': {'number': 1}, 'lineNumber': 2}},
            {'jump': {'label': '__bareScriptDone0', 'lineNumber': 3}},
            {'label': {'name': '__bareScriptIf0', 'lineNumber': 3}},
            {'expr': {'name': 'a', 'expr': {'number': 2}, 'lineNumber': 4}},
            {'label': {'name': '__bareScriptDone0', 'lineNumber': 5}}
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
:1: No matching if statement
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
:2: No matching if statement
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
:1: No matching if statement
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
:2: No matching if statement
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
:1: No matching if statement
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
:2: No matching if statement
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
:5: Elif statement following else statement
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
:5: Multiple else statements
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
:1: Missing endif statement
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
:2: Missing endif statement
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
:3: No matching if statement
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
:3: No matching if statement
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
:3: No matching if statement
    else:
^
`
        }
    );
});


test('parseScript, if-then statement expression syntax error', () => {
    assert.throws(
        () => {
            parseScript(`\
if @#$:
endif
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
:1: Syntax error
if @#$:
   ^
`
        }
    );
});


test('parseScript, if-then statement elif expression syntax error', () => {
    assert.throws(
        () => {
            parseScript(`\
if true:
elif @#$:
endif
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
:2: Syntax error
elif @#$:
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
        'scriptLines': ['i = 0', 'while i < arrayLength(values):', '    i = i + 1', 'endwhile', ''],
        'statements': [
            {'expr': {'name': 'i', 'expr': {'number': 0}, 'lineNumber': 1}},
            {'jump': {
                'label': '__bareScriptDone0',
                'expr': {'unary': {
                    'op': '!',
                    'expr': {'binary': {
                        'op': '<',
                        'left': {'variable': 'i'},
                        'right': {'function': {'name': 'arrayLength', 'args': [{'variable': 'values'}]}}
                    }}
                }},
                'lineNumber': 2
            }},
            {'label': {'name': '__bareScriptLoop0', 'lineNumber': 2}},
            {'expr': {'name': 'i', 'expr': {'binary': {'op': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}, 'lineNumber': 3}},
            {'jump': {
                'label': '__bareScriptLoop0',
                'expr': {'binary': {
                    'op': '<',
                    'left': {'variable': 'i'},
                    'right': {'function': {'name': 'arrayLength', 'args': [{'variable': 'values'}]}}
                }},
                'lineNumber': 4
            }},
            {'label': {'name': '__bareScriptDone0', 'lineNumber': 4}}
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
        'scriptLines': ['while true:', '    break', 'endwhile', ''],
        'statements': [
            {'jump': {'label': '__bareScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': 'true'}}}, 'lineNumber': 1}},
            {'label': {'name': '__bareScriptLoop0', 'lineNumber': 1}},
            {'jump': {'label': '__bareScriptDone0', 'lineNumber': 2}},
            {'jump': {'label': '__bareScriptLoop0', 'expr': {'variable': 'true'}, 'lineNumber': 3}},
            {'label': {'name': '__bareScriptDone0', 'lineNumber': 3}}
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
        'scriptLines': ['while true:', '    continue', 'endwhile', ''],
        'statements': [
            {'jump': {'label': '__bareScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': 'true'}}}, 'lineNumber': 1}},
            {'label': {'name': '__bareScriptLoop0', 'lineNumber': 1}},
            {'jump': {'label': '__bareScriptLoop0', 'lineNumber': 2}},
            {'jump': {'label': '__bareScriptLoop0', 'expr': {'variable': 'true'}, 'lineNumber': 3}},
            {'label': {'name': '__bareScriptDone0', 'lineNumber': 3}}
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
:1: No matching while statement
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
:2: No matching while statement
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
:1: Missing endwhile statement
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
:2: Missing endwhile statement
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
:3: No matching while statement
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
:3: Break statement outside of loop
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
:3: Continue statement outside of loop
        continue
^
`
        }
    );
});


test('parseScript, while-do statement expression syntax error', () => {
    assert.throws(
        () => {
            parseScript(`\
while @#$:
endwhile
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
:1: Syntax error
while @#$:
      ^
`
        }
    );
});


test('parseScript, foreach statement', () => {
    const script = validateScript(parseScript(`\
values = [1, 2, 3]
sum = 0
for value in values:
    sum = sum + value
endfor
`));
    assert.deepEqual(script, {
        'scriptLines': ['values = [1, 2, 3]', 'sum = 0', 'for value in values:', '    sum = sum + value', 'endfor', ''],
        'statements': [
            {'expr': {
                'name': 'values',
                'expr': {'function': {'name': 'arrayNew', 'args': [{'number': 1}, {'number': 2}, {'number': 3}]}},
                'lineNumber': 1
            }},
            {'expr': {'name': 'sum', 'expr': {'number': 0}, 'lineNumber': 2}},
            {'expr': {'name': '__bareScriptValues0', 'expr': {'variable': 'values'}, 'lineNumber': 3}},
            {'expr': {
                'name': '__bareScriptLength0',
                'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__bareScriptValues0'}]}},
                'lineNumber': 3
            }},
            {'jump': {
                'label': '__bareScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': '__bareScriptLength0'}}},
                'lineNumber': 3
            }},
            {'expr': {'name': '__bareScriptIndex0', 'expr': {'number': 0}, 'lineNumber': 3}},
            {'label': {'name': '__bareScriptLoop0', 'lineNumber': 3}},
            {'expr': {
                'name': 'value',
                'expr': {'function': {
                    'name': 'arrayGet',
                    'args': [{'variable': '__bareScriptValues0'}, {'variable': '__bareScriptIndex0'}]
                }},
                'lineNumber': 3
            }},
            {'expr': {
                'name': 'sum',
                'expr': {'binary': {'op': '+', 'left': {'variable': 'sum'}, 'right': {'variable': 'value'}}},
                'lineNumber': 4
            }},
            {'expr': {
                'name': '__bareScriptIndex0',
                'expr': {'binary': {'op': '+', 'left': {'variable': '__bareScriptIndex0'}, 'right': {'number': 1}}},
                'lineNumber': 5
            }},
            {'jump': {
                'label': '__bareScriptLoop0',
                'expr': {'binary': {'op': '<', 'left': {'variable': '__bareScriptIndex0'}, 'right': {'variable': '__bareScriptLength0'}}},
                'lineNumber': 5
            }},
            {'label': {'name': '__bareScriptDone0', 'lineNumber': 5}}
        ]
    });
});


test('parseScript, foreach statement with index', () => {
    const script = validateScript(parseScript(`\
for value, ixValue in values:
endfor
`));
    assert.deepEqual(script, {
        'scriptLines': ['for value, ixValue in values:', 'endfor', ''],
        'statements': [
            {'expr': {'name': '__bareScriptValues0', 'expr': {'variable': 'values'}, 'lineNumber': 1}},
            {'expr': {
                'name': '__bareScriptLength0',
                'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__bareScriptValues0'}]}},
                'lineNumber': 1
            }},
            {'jump': {
                'label': '__bareScriptDone0',
                'expr': {'unary': {'op': '!', 'expr': {'variable': '__bareScriptLength0'}}},
                'lineNumber': 1
            }},
            {'expr': {'name': 'ixValue', 'expr': {'number': 0}, 'lineNumber': 1}},
            {'label': {'name': '__bareScriptLoop0', 'lineNumber': 1}},
            {'expr': {
                'name': 'value',
                'expr': {'function': {
                    'name': 'arrayGet',
                    'args': [{'variable': '__bareScriptValues0'}, {'variable': 'ixValue'}]
                }},
                'lineNumber': 1
            }},
            {'expr': {
                'name': 'ixValue',
                'expr': {'binary': {'op': '+', 'left': {'variable': 'ixValue'}, 'right': {'number': 1}}},
                'lineNumber': 2
            }},
            {'jump': {
                'label': '__bareScriptLoop0',
                'expr': {'binary': {'op': '<', 'left': {'variable': 'ixValue'}, 'right': {'variable': '__bareScriptLength0'}}},
                'lineNumber': 2
            }},
            {'label': {'name': '__bareScriptDone0', 'lineNumber': 2}}
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
        'scriptLines': ['for value in values:', '    if i > 0:', '        break', '    endif', 'endfor', ''],
        'statements': [
            {'expr': {'name': '__bareScriptValues0', 'expr': {'variable': 'values'}, 'lineNumber': 1}},
            {'expr': {
                'name': '__bareScriptLength0',
                'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__bareScriptValues0'}]}},
                'lineNumber': 1
            }},
            {'jump': {
                'label': '__bareScriptDone0', 'expr': {'unary': {'op': '!', 'expr': {'variable': '__bareScriptLength0'}}},
                'lineNumber': 1
            }},
            {'expr': {'name': '__bareScriptIndex0', 'expr': {'number': 0}, 'lineNumber': 1}},
            {'label': {'name': '__bareScriptLoop0', 'lineNumber': 1}},
            {'expr': {
                'name': 'value',
                'expr': {'function': {
                    'name': 'arrayGet',
                    'args': [{'variable': '__bareScriptValues0'}, {'variable': '__bareScriptIndex0'}]
                }},
                'lineNumber': 1
            }},
            {'jump': {
                'label': '__bareScriptDone1',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}},
                'lineNumber': 2
            }},
            {'jump': {'label': '__bareScriptDone0', 'lineNumber': 3}},
            {'label': {'name': '__bareScriptDone1', 'lineNumber': 4}},
            {'expr': {
                'name': '__bareScriptIndex0',
                'expr': {'binary': {'op': '+', 'left': {'variable': '__bareScriptIndex0'}, 'right': {'number': 1}}},
                'lineNumber': 5
            }},
            {'jump': {
                'label': '__bareScriptLoop0',
                'expr': {'binary': {'op': '<', 'left': {'variable': '__bareScriptIndex0'}, 'right': {'variable': '__bareScriptLength0'}}},
                'lineNumber': 5
            }},
            {'label': {'name': '__bareScriptDone0', 'lineNumber': 5}}
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
        'scriptLines': ['for value in values:', '    if i > 0:', '        continue', '    endif', 'endfor', ''],
        'statements': [
            {'expr': {'name': '__bareScriptValues0', 'expr': {'variable': 'values'}, 'lineNumber': 1}},
            {'expr': {
                'name': '__bareScriptLength0',
                'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': '__bareScriptValues0'}]}},
                'lineNumber': 1
            }},
            {'jump': {
                'label': '__bareScriptDone0',
                'expr': {'unary': {'op': '!', 'expr': {'variable': '__bareScriptLength0'}}},
                'lineNumber': 1
            }},
            {'expr': {'name': '__bareScriptIndex0', 'expr': {'number': 0}, 'lineNumber': 1}},
            {'label': {'name': '__bareScriptLoop0', 'lineNumber': 1}},
            {'expr': {
                'name': 'value',
                'expr': {'function': {
                    'name': 'arrayGet',
                    'args': [{'variable': '__bareScriptValues0'}, {'variable': '__bareScriptIndex0'}]
                }},
                'lineNumber': 1
            }},
            {'jump': {
                'label': '__bareScriptDone1',
                'expr': {'unary': {'op': '!', 'expr': {'binary': {'op': '>', 'left': {'variable': 'i'}, 'right': {'number': 0}}}}},
                'lineNumber': 2
            }},
            {'jump': {'label': '__bareScriptContinue0', 'lineNumber': 3}},
            {'label': {'name': '__bareScriptDone1', 'lineNumber': 4}},
            {'label': {'name': '__bareScriptContinue0', 'lineNumber': 5}},
            {'expr': {
                'name': '__bareScriptIndex0',
                'expr': {'binary': {'op': '+', 'left': {'variable': '__bareScriptIndex0'}, 'right': {'number': 1}}},
                'lineNumber': 5
            }},
            {'jump': {
                'label': '__bareScriptLoop0',
                'expr': {'binary': {'op': '<', 'left': {'variable': '__bareScriptIndex0'}, 'right': {'variable': '__bareScriptLength0'}}},
                'lineNumber': 5
            }},
            {'label': {'name': '__bareScriptDone0', 'lineNumber': 5}}
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
:1: No matching for statement
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
:2: No matching for statement
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
:1: Missing endfor statement
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
:2: Missing endfor statement
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
:3: No matching for statement
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
:3: Break statement outside of loop
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
:3: Continue statement outside of loop
        continue
^
`
        }
    );
});


test('parseScript, foreach statement expression syntax error', () => {
    assert.throws(
        () => {
            parseScript(`\
for value in @#$:
endfor
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
:1: Syntax error
for value in @#$:
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
:1: Break statement outside of loop
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
:2: Break statement outside of loop
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
:1: Continue statement outside of loop
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
:2: Continue statement outside of loop
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
        'scriptLines': ["include 'fi\\'le.bare'", ''],
        'statements': [
            {'include': {'includes': [{'url': "fi'le.bare"}], 'lineNumber': 1}}
        ]
    });
});


test('parseScript, include statement, system', () => {
    const script = validateScript(parseScript(`\
include <file.bare>
`));
    assert.deepEqual(script, {
        'scriptLines': ['include <file.bare>', ''],
        'statements': [
            {'include': {'includes': [{'url': 'file.bare', 'system': true}], 'lineNumber': 1}}
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
:1: Syntax error
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
        'scriptLines': ["include 'test.bare'", 'include <test2.bare>', "include 'test3.bare'", ''],
        'statements': [
            {'include': {
                'includes': [{'url': 'test.bare'}, {'url': 'test2.bare', 'system': true}, {'url': 'test3.bare'}],
                'lineNumber': 1,
                'lineCount': 3
            }}
        ]
    });
});


test('parseScript, expression statement', () => {
    const script = validateScript(parseScript(`\
foo()
`));
    assert.deepEqual(script, {
        'scriptLines': ['foo()', ''],
        'statements': [
            {'expr': {'expr': {'function': {'name': 'foo', 'args': []}}, 'lineNumber': 1}}
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
:3: Syntax error
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
:2: Syntax error
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


test('parseScript, jumpif statement expression syntax error', () => {
    assert.throws(
        () => {
            parseScript(`\
jumpif (@#$) label
`);
        },
        {
            'name': 'BareScriptParserError',
            'message': `\
:1: Syntax error
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
:1: Syntax error
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
:2: Nested function definition
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
:2: No matching function definition
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


test('parseExpression, array literals', () => {
    let expr = parseExpression('[1, 2]');
    assert.deepEqual(validateExpression(expr), {'variable': '1, 2'});

    expr = parseExpression('[1, 2]', 1, null, true);
    assert.deepEqual(validateExpression(expr), {'function': {'args': [{'number': 1.0}, {'number': 2.0}], 'name': 'arrayNew'}});
});


test('parseExpression, unary', () => {
    let expr = parseExpression('!a');
    assert.deepEqual(validateExpression(expr), {
        'unary': {
            'op': '!',
            'expr': {'variable': 'a'}
        }
    });

    // Bitwise NOT
    expr = parseExpression('~a');
    assert.deepEqual(validateExpression(expr), {
        'unary': {
            'op': '~',
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
Syntax error
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
Syntax error
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
Unmatched parenthesis
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
Syntax error
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


test('parseExpression, bitwise operators', () => {
    let expr = parseExpression('1 & 3');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '&',
            'left': {'number': 1},
            'right': {'number': 3}
        }
    });

    expr = parseExpression('1 | 3');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '|',
            'left': {'number': 1},
            'right': {'number': 3}
        }
    });

    expr = parseExpression('1 ^ 3');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '^',
            'left': {'number': 1},
            'right': {'number': 3}
        }
    });

    expr = parseExpression('1 << 3');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '<<',
            'left': {'number': 1},
            'right': {'number': 3}
        }
    });

    expr = parseExpression('1 >> 3');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '>>',
            'left': {'number': 1},
            'right': {'number': 3}
        }
    });
});


test('parseExpression, bitwise precedence', () => {
    // Shift operators after additive, before relational
    let expr = parseExpression('1 + 2 << 3');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '<<',
            'left': {
                'binary': {
                    'op': '+',
                    'left': {'number': 1.0},
                    'right': {'number': 2.0}
                }
            },
            'right': {'number': 3.0}
        }
    });

    // Bitwise after equality
    expr = parseExpression('1 == 2 & 3');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '&',
            'left': {
                'binary': {
                    'op': '==',
                    'left': {'number': 1},
                    'right': {'number': 2}
                }
            },
            'right': {'number': 3}
        }
    });

    // Bitwise AND before XOR and OR
    expr = parseExpression('1 & 2 ^ 3 | 4');
    assert.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '|',
            'left': {
                'binary': {
                    'op': '^',
                    'left': {
                        'binary': {
                            'op': '&',
                            'left': {'number': 1},
                            'right': {'number': 2}
                        }
                    },
                    'right': {'number': 3}
                }
            },
            'right': {'number': 4}
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


test('parseExpression, number literal', () => {
    let expr = parseExpression('1');
    assert.deepEqual(validateExpression(expr), {'number': 1.0});
    expr = parseExpression('-1');
    assert.deepEqual(validateExpression(expr), {'number': -1.0});

    expr = parseExpression('1.1');
    assert.deepEqual(validateExpression(expr), {'number': 1.1});

    expr = parseExpression('-1.1');
    assert.deepEqual(validateExpression(expr), {'number': -1.1});

    expr = parseExpression('1e3');
    assert.deepEqual(validateExpression(expr), {'number': 1000});

    expr = parseExpression('1e+3');
    assert.deepEqual(validateExpression(expr), {'number': 1000});

    expr = parseExpression('1e-3');
    assert.deepEqual(validateExpression(expr), {'number': .001});

    expr = parseExpression('0x1fF');
    assert.deepEqual(validateExpression(expr), {'number': 511});
});


test('parseExpression, string literal', () => {
    const expr = parseExpression("'abc'");
    assert.deepEqual(validateExpression(expr), {'string': 'abc'});
});


test('parseExpression, string literal escapes', () => {
    let expr = parseExpression("'ab \\'c\\' d\\\\e \\\\f'");
    assert.deepEqual(validateExpression(expr), {'string': "ab 'c' d\\e \\f"});

    // More
    expr = parseExpression('"\\n\\r\\t\\b\\f\\\\\'\\"\\\\"');
    assert.deepEqual(validateExpression(expr), {'string': '\n\r\t\b\f\\\'"\\'});

    // Hex
    expr = parseExpression('"\\uD83D\\uDE00"');
    assert.deepEqual(validateExpression(expr), {'string': '\ud83d\ude00'});

    // Escaped
    expr = parseExpression(
        "'Escape me: \\\\ \\[ \\] \\( \\) \\< \\> \\\\\" \\\\\\' \\* \\_ \\~ \\` \\# \\| \\-'"
    );
    assert.deepEqual(
        validateExpression(expr),
        {'string': "Escape me: \\ \\[ \\] \\( \\) \\< \\> \\\" \\' \\* \\_ \\~ \\` \\# \\| \\-"}
    );
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
    let expr = parseExpression('"ab \\"c\\" d\\\\e \\\\f"');
    assert.deepEqual(validateExpression(expr), {'string': 'ab "c" d\\e \\f'});

    // More
    expr = parseExpression('"\\n\\r\\t\\b\\f\\\\\'\\"\\\\"');
    assert.deepEqual(validateExpression(expr), {'string': '\n\r\t\b\f\\\'"\\'});

    // Hex
    expr = parseExpression('"\\uD83D\\uDE00"');
    assert.deepEqual(validateExpression(expr), {'string': '\ud83d\ude00'});

    // Escaped
    expr = parseExpression(
        '"Escape me: \\\\ \\[ \\] \\( \\) \\< \\> \\\\\\" \\\\\' \\* \\_ \\~ \\` \\# \\| \\-"'
    );
    assert.deepEqual(
        validateExpression(expr),
        {'string': "Escape me: \\ \\[ \\] \\( \\) \\< \\> \\\" \\' \\* \\_ \\~ \\` \\# \\| \\-"}
    );
});


test('parseExpression, string literal double-quote backslash end', () => {
    const expr = parseExpression('test("abc \\\\", "def")');
    assert.deepEqual(validateExpression(expr), {'function': {
        'name': 'test',
        'args': [{'string': 'abc \\'}, {'string': 'def'}]
    }});
});
