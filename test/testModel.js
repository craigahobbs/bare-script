// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {lintScript, validateExpression, validateScript} from '../lib/model.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('validateScript', () => {
    const script = {'statements': []};
    assert.deepEqual(validateScript(script), script);
});


test('validateScript, error', () => {
    const script = {};
    assert.throws(
        () => {
            validateScript(script);
        },
        {
            'name': 'ValidationError',
            'message': "Required member 'statements' missing"
        }
    );
});


test('validateExpression', () => {
    const expr = {'number': 1};
    assert.deepEqual(validateExpression(expr), expr);
});


test('validateExpression, error', () => {
    const expr = {};
    assert.throws(
        () => {
            validateExpression(expr);
        },
        {
            'name': 'ValidationError',
            'message': "Invalid value {} (type 'object'), expected type 'Expression'"
        }
    );
});


test('lintScript, empty script', () => {
    const script = {
        'statements': [],
        'scriptName': 'test.bare',
        'scriptLines': []
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        'test.bare:1: Empty script'
    ]);
});


test('lintScript, function redefined', () => {
    const script = {
        'statements': [
            {'function': {'name': 'testFn', 'statements': [], 'lineNumber': 1}},
            {'function': {'name': 'testFn', 'statements': [], 'lineNumber': 4}}
        ],
        'scriptName': 'test.bare',
        'scriptLines': [
            'function testFn():',
            'endfunction',
            '',
            'function testFn():',
            'endfunction'
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        'test.bare:4: Redefinition of function "testFn"'
    ]);
});


test('lintScript, function duplicate argument', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'args': ['a', 'b', 'a'],
                    'statements': [
                        {'return': {
                            'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}},
                            'lineNumber': 2
                        }}
                    ],
                    'lineNumber': 1
                }
            }
        ],
        'scriptName': 'test.bare',
        'scriptLines': [
            'function testFn(a, b, a):',
            '    return a + b',
            'endfunction'
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        'test.bare:1: Duplicate argument "a" of function "testFn"'
    ]);
});


test('lintScript, function unused argument', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'args': ['a', 'b'],
                    'statements': [
                        {'return': {'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'number': 1}}}}}
                    ]
                }
            }
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        ':1: Unused argument "b" of function "testFn"'
    ]);
});


test('lintScript, function argument function call ok', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'args': ['a'],
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'a'}}}}
                    ]
                }
            }
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), []);
});


test('lintScript, function unused variable', () => {
    const script = {
        'scriptName': 'test.bare',
        'scriptLines': [
            'function testFn():',
            '    a = 1',
            '    b = 2',
            '    c = a',
            '    d = 3',
            '    jump testLabel if d',
            '    testLabel:',
            '    e = -(b + c)',
            'endfunction'
        ],
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'expr': {'name': 'a', 'expr': {'number': 1}, 'lineNumber': 2}},
                        {'expr': {'name': 'b', 'expr': {'number': 2}, 'lineNumber': 3}},
                        {'expr': {'name': 'c', 'expr': {'variable': 'a'}, 'lineNumber': 4}},
                        {'expr': {'name': 'd', 'expr': {'number': 3}, 'lineNumber': 5}},
                        {'jump': {'label': 'testLabel', 'expr': {'variable': 'd'}, 'lineNumber': 6}},
                        {'label': {'name': 'testLabel', 'lineNumber': 7}},
                        {'expr': {'name': 'e', 'expr': {'unary': {
                            'op': '-',
                            'expr': {'group': {'binary': {'op': '+', 'left': {'variable': 'b'}, 'right': {'variable': 'c'}}}}
                        }}, 'lineNumber': 8}}
                    ],
                    'lineNumber': 1
                }
            }
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        'test.bare:8: Unused variable "e" defined in function "testFn"'
    ]);
});


test('lintScript, function arg used variable ok', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'expr': {'name': 'a', 'expr': {'number': 1}}},
                        {'expr': {'expr': {'function': {'name': 'foo', 'args': [{'variable': 'a'}]}}}}
                    ]
                }
            }
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), []);
});


test('lintScript, global unused variable ok', () => {
    const script = {
        'statements': [
            {'expr': {'name': 'a', 'expr': {'number': 1}}}
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), []);
});


test('lintScript, function variable used before assignment', () => {
    const script = {
        'scriptName': 'test.bare',
        'scriptLines': [
            'function testFn():',
            '    a = b',
            '    b = a',
            'endfunction'
        ],
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'expr': {'name': 'a', 'expr': {'variable': 'b'}, 'lineNumber': 2}},
                        {'expr': {'name': 'b', 'expr': {'variable': 'a'}, 'lineNumber': 3}}
                    ],
                    'lineNumber': 1
                }
            }
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        'test.bare:2: Variable "b" of function "testFn" used before assignment'
    ]);
});


test('lintScript, function variable used before assignment arg ok', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'args': ['b'],
                    'statements': [
                        {'expr': {'name': 'a', 'expr': {'variable': 'b'}}},
                        {'expr': {'name': 'b', 'expr': {'variable': 'a'}}}
                    ]
                }
            }
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), []);
});


test('lintScript, function variable used before assignment reassign ok', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'expr': {'name': 'a', 'expr': {'number': 1}}},
                        {'expr': {'expr': {'function': {'name': 'mathSqrt', 'args': [{'variable': 'a'}]}}}},
                        {'expr': {'name': 'a', 'expr': {'number': 2}}},
                        {'expr': {'expr': {'function': {'name': 'mathSqrt', 'args': [{'variable': 'a'}]}}}}
                    ]
                }
            }
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), []);
});


test('lintScript, function unknown global', () => {
    const script = {
        'scriptName': 'test.bare',
        'scriptLines': [
            'function testFn(b):',
            '    a = false',
            '    a = a',
            '    a = b',
            '    a = UNKNOWN',
            'endfunction'
        ],
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'args': ['b'],
                    'statements': [
                        {'expr': {'name': 'a', 'expr': {'variable': 'false'}, 'lineNumber': 2}},
                        {'expr': {'name': 'a', 'expr': {'variable': 'a'}, 'lineNumber': 3}},
                        {'expr': {'name': 'a', 'expr': {'variable': 'b'}, 'lineNumber': 4}},
                        {'expr': {'name': 'a', 'expr': {'variable': 'UNKNOWN'}, 'lineNumber': 5}}
                    ],
                    'lineNumber': 1
                }
            }
        ]
    };
    assert.deepEqual(lintScript(validateScript(script), {}), [
        'test.bare:5: Unknown global variable "UNKNOWN"'
    ]);
});


test('lintScript, global unknown global', () => {
    const script = {
        'scriptName': 'test.bare',
        'scriptLines': [
            'a = 1',
            'a = a',
            'a = UNKNOWN'
        ],
        'statements': [
            {'expr': {'name': 'a', 'expr': {'number': 1}, 'lineNumber': 1}},
            {'expr': {'name': 'a', 'expr': {'variable': 'a'}, 'lineNumber': 2}},
            {'expr': {'name': 'a', 'expr': {'variable': 'UNKNOWN'}, 'lineNumber': 3}}
        ]
    };
    assert.deepEqual(lintScript(validateScript(script), {}), [
        'test.bare:3: Unknown global variable "UNKNOWN"'
    ]);
});


test('lintScript, global variable used before assignment', () => {
    const script = {
        'statements': [
            {'expr': {'name': 'a', 'expr': {'variable': 'b'}}},
            {'expr': {'name': 'b', 'expr': {'variable': 'a'}}}
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        ':1: Global variable "b" used before assignment'
    ]);
});


test('lintScript, function unecessary async', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'async': true,
                    'statements': [
                        {'return': {'expr': {'unary': {'op': '!', 'expr': {
                            'group': {'binary': {'op': '+', 'left': {'number': 0}, 'right': {'function': {'name': 'nonAsyncFn'}}}}
                        }}}}}
                    ]
                }
            },
            {
                'function': {
                    'name': 'testFn2',
                    'statements': [
                        {'return': {}}
                    ]
                }
            }
        ]
    };
    /* c8 ignore next */
    const nonAsyncFn = () => true;
    assert.deepEqual(lintScript(validateScript(script), {nonAsyncFn}), [
        ':1: Unecessary async function "testFn"'
    ]);
});


test('lintScript, function unecessary async arg ok', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'async': true,
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'nonAsyncFn', 'args': [{'function': {'name': 'asyncFn'}}]}}}}
                    ]
                }
            }
        ]
    };
    /* c8 ignore next 3 */
    // eslint-disable-next-line require-await
    const asyncFn = async () => true;
    const nonAsyncFn = () => true;
    assert.deepEqual(lintScript(validateScript(script), {asyncFn, nonAsyncFn}), []);
});


test('lintScript, function unecessary async builtin', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'async': true,
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'if'}}}}
                    ]
                }
            }
        ]
    };
    /* c8 ignore next */
    assert.deepEqual(lintScript(validateScript(script), {'nonExistFn': null}), [
        ':1: Unecessary async function "testFn"'
    ]);
});


test('lintScript, function unecessary async unknown ok', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'async': true,
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'nonExistFn'}}}}
                    ]
                }
            }
        ]
    };
    /* c8 ignore next */
    assert.deepEqual(lintScript(validateScript(script), {'nonExistFn': null}), []);
});


test('lintScript, function unecessary async include ok', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'async': true,
                    'statements': [
                        {'include': {'includes': [{'url': 'util.bare'}]}}
                    ]
                }
            }
        ]
    };
    /* c8 ignore next */
    assert.deepEqual(lintScript(validateScript(script), {'nonExistFn': null}), []);
});


test('lintScript, function requires async', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'jump': {'label': 'label1'}},
                        {'label': {'name': 'label1'}},
                        {'jump': {'label': 'label1', 'expr': {'number': 0}}},
                        {'return': {'expr': {'unary': {'op': '!', 'expr': {
                            'group': {'binary': {'op': '+', 'left': {'number': 0}, 'right': {'function': {'name': 'asyncFn'}}}}
                        }}}}}
                    ]
                }
            }
        ]
    };
    /* c8 ignore next 2 */
    // eslint-disable-next-line require-await
    const asyncFn = async () => true;
    assert.deepEqual(lintScript(validateScript(script), {asyncFn}), [
        ':1: Function "testFn" requires async'
    ]);
});


test('lintScript, function requires async arg', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'nonAsyncFn', 'args': [{'function': {'name': 'asyncFn'}}]}}}}
                    ]
                }
            }
        ]
    };
    /* c8 ignore next 3 */
    // eslint-disable-next-line require-await
    const asyncFn = async () => true;
    const nonAsyncFn = () => true;
    assert.deepEqual(lintScript(validateScript(script), {asyncFn, nonAsyncFn}), [
        ':1: Function "testFn" requires async'
    ]);
});


test('lintScript, function requires async include', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'include': {'includes': [{'url': 'util.bare'}]}}
                    ]
                }
            }
        ]
    };
    /* c8 ignore next 3 */
    // eslint-disable-next-line require-await
    const asyncFn = async () => true;
    const nonAsyncFn = () => true;
    assert.deepEqual(lintScript(validateScript(script), {asyncFn, nonAsyncFn}), [
        ':1: Function "testFn" requires async'
    ]);
});


test('lintScript, function requires async builtin ok', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'if'}}}}
                    ]
                }
            }
        ]
    };
    /* c8 ignore next */
    assert.deepEqual(lintScript(validateScript(script), {'nonExistFn': null}), []);
});


test('lintScript, function requires async unknown ok', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'nonExistFn'}}}}
                    ]
                }
            }
        ]
    };
    /* c8 ignore next */
    assert.deepEqual(lintScript(validateScript(script), {'nonExistFn': null}), []);
});


test('lintScript, function unused label', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'label': {'name': 'unusedLabel'}}
                    ]
                }
            }
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        ':1: Unused label "unusedLabel" in function "testFn"'
    ]);
});


test('lintScript, global unused label', () => {
    const script = {
        'statements': [
            {'label': {'name': 'usedLabel', 'lineNumber': 1}},
            {'label': {'name': 'unusedLabel', 'lineNumber': 2}},
            {'jump': {'label': 'usedLabel', 'lineNumber': 3}}
        ],
        'scriptName': 'test.bare',
        'scriptLines': [
            'usedlabel:',
            'unusedLabel:',
            'jump usedLabel'
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        'test.bare:2: Unused global label "unusedLabel"'
    ]);
});


test('lintScript, function unknown label', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'jump': {'label': 'unknownLabel'}}
                    ]
                }
            }
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        ':1: Unknown label "unknownLabel" in function "testFn"'
    ]);
});


test('lintScript, global unknown label', () => {
    const script = {
        'statements': [
            {'jump': {'label': 'unknownLabel'}}
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        ':1: Unknown global label "unknownLabel"'
    ]);
});


test('lintScript, function label redefined', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'label': {'name': 'testLabel'}},
                        {'label': {'name': 'testLabel'}},
                        {'jump': {'label': 'testLabel'}}
                    ]
                }
            }
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        ':1: Redefinition of label "testLabel" in function "testFn"'
    ]);
});


test('lintScript, global label redefined', () => {
    const script = {
        'statements': [
            {'label': {'name': 'testLabel'}},
            {'label': {'name': 'testLabel'}},
            {'jump': {'label': 'testLabel'}}
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        ':1: Redefinition of global label "testLabel"'
    ]);
});


test('lintScript, function pointless statement', () => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'expr': {'expr': {'unary': {'op': '!', 'expr': {
                            'group': {'binary': {'op': '+', 'left': {'number': 0}, 'right': {'function': {'name': 'foo'}}}}
                        }}}}},
                        {'expr': {'expr': {'unary': {'op': '!', 'expr': {
                            'group': {'binary': {'op': '+', 'left': {'number': 0}, 'right': {'number': 1}}}
                        }}}}}
                    ]
                }
            }
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        ':1: Pointless statement in function "testFn"'
    ]);
});


test('lintScript, global pointless statement', () => {
    const script = {
        'statements': [
            {'expr': {'expr': {'unary': {'op': '!', 'expr': {
                'group': {'binary': {'op': '+', 'left': {'number': 0}, 'right': {'function': {'name': 'foo'}}}}
            }}}}},
            {'expr': {'expr': {'unary': {'op': '!', 'expr': {
                'group': {'binary': {'op': '+', 'left': {'number': 0}, 'right': {'number': 1}}}
            }}}}}
        ]
    };
    assert.deepEqual(lintScript(validateScript(script)), [
        ':1: Pointless global statement'
    ]);
});
