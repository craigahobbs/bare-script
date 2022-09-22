// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

import {lintScript, validateExpression, validateScript} from '../lib/model.js';
import {ValidationError} from 'schema-markdown/lib/schema.js';
import test from 'ava';


/* eslint-disable id-length */


test('validateScript', (t) => {
    const script = {'statements': []};
    t.deepEqual(validateScript(script), script);
});


test('validateScript, error', (t) => {
    const script = {};
    const error = t.throws(() => {
        validateScript(script);
    }, {'instanceOf': ValidationError});
    t.is(error.message, "Required member 'statements' missing");
});


test('validateExpression', (t) => {
    const expr = {'number': 1};
    t.deepEqual(validateExpression(expr), expr);
});


test('validateExpression, error', (t) => {
    const expr = {};
    const error = t.throws(() => {
        validateExpression(expr);
    }, {'instanceOf': ValidationError});
    t.is(error.message, "Invalid value {} (type 'object'), expected type 'Expression'");
});


test('lintScript, empty script', (t) => {
    const script = {
        'statements': []
    };
    t.deepEqual(lintScript(validateScript(script)), [
        'Empty script'
    ]);
});


test('lintScript, function redefined', (t) => {
    const script = {
        'statements': [
            {'function': {'name': 'testFn', 'statements': []}},
            {'function': {'name': 'testFn', 'statements': []}}
        ]
    };
    t.deepEqual(lintScript(validateScript(script)), [
        'Redefinition of function "testFn" (index 1)'
    ]);
});


test('lintScript, function duplicate argument', (t) => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'args': ['a', 'b', 'a'],
                    'statements': [
                        {'return': {'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}}}
                    ]
                }
            }
        ]
    };
    t.deepEqual(lintScript(validateScript(script)), [
        'Duplicate argument "a" of function "testFn" (index 0)'
    ]);
});


test('lintScript, function unused argument', (t) => {
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
    t.deepEqual(lintScript(validateScript(script)), [
        'Unused argument "b" of function "testFn" (index 0)'
    ]);
});


test('lintScript, function unused variable', (t) => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'expr': {'name': 'a', 'expr': {'number': 1}}},
                        {'expr': {'name': 'b', 'expr': {'number': 2}}},
                        {'expr': {'name': 'c', 'expr': {'variable': 'a'}}},
                        {'expr': {'name': 'd', 'expr': {'number': 3}}},
                        {'jump': {'label': 'testLabel', 'expr': {'variable': 'd'}}},
                        {'label': 'testLabel'},
                        {'expr': {'name': 'e', 'expr': {'unary': {
                            'op': '-',
                            'expr': {'group': {'binary': {'op': '+', 'left': {'variable': 'b'}, 'right': {'variable': 'c'}}}}
                        }}}}
                    ]
                }
            }
        ]
    };
    t.deepEqual(lintScript(validateScript(script)), [
        'Unused variable "e" defined in function "testFn" (index 6)'
    ]);
});


test('lintScript, global unused variable ok', (t) => {
    const script = {
        'statements': [
            {'expr': {'name': 'a', 'expr': {'number': 1}}}
        ]
    };
    t.deepEqual(lintScript(validateScript(script)), []);
});


test('lintScript, function variable used before assignment', (t) => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'expr': {'name': 'a', 'expr': {'variable': 'b'}}},
                        {'expr': {'name': 'b', 'expr': {'variable': 'a'}}}
                    ]
                }
            }
        ]
    };
    t.deepEqual(lintScript(validateScript(script)), [
        'Variable "b" of function "testFn" used (index 0) before assignment (index 1)'
    ]);
});


test('lintScript, global variable used before assignment', (t) => {
    const script = {
        'statements': [
            {'expr': {'name': 'a', 'expr': {'variable': 'b'}}},
            {'expr': {'name': 'b', 'expr': {'variable': 'a'}}}
        ]
    };
    t.deepEqual(lintScript(validateScript(script)), [
        'Global variable "b" used (index 0) before assignment (index 1)'
    ]);
});


test('lintScript, function unused label', (t) => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'label': 'unusedLabel'}
                    ]
                }
            }
        ]
    };
    t.deepEqual(lintScript(validateScript(script)), [
        'Unused label "unusedLabel" in function "testFn" (index 0)'
    ]);
});


test('lintScript, global unused label', (t) => {
    const script = {
        'statements': [
            {'label': 'unusedLabel'}
        ]
    };
    t.deepEqual(lintScript(validateScript(script)), [
        'Unused global label "unusedLabel" (index 0)'
    ]);
});


test('lintScript, function unknown label', (t) => {
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
    t.deepEqual(lintScript(validateScript(script)), [
        'Unknown label "unknownLabel" in function "testFn" (index 0)'
    ]);
});


test('lintScript, global unknown label', (t) => {
    const script = {
        'statements': [
            {'jump': {'label': 'unknownLabel'}}
        ]
    };
    t.deepEqual(lintScript(validateScript(script)), [
        'Unknown global label "unknownLabel" (index 0)'
    ]);
});


test('lintScript, function label redefined', (t) => {
    const script = {
        'statements': [
            {
                'function': {
                    'name': 'testFn',
                    'statements': [
                        {'label': 'testLabel'},
                        {'label': 'testLabel'},
                        {'jump': {'label': 'testLabel'}}
                    ]
                }
            }
        ]
    };
    t.deepEqual(lintScript(validateScript(script)), [
        'Redefinition of label "testLabel" in function "testFn" (index 1)'
    ]);
});


test('lintScript, global label redefined', (t) => {
    const script = {
        'statements': [
            {'label': 'testLabel'},
            {'label': 'testLabel'},
            {'jump': {'label': 'testLabel'}}
        ]
    };
    t.deepEqual(lintScript(validateScript(script)), [
        'Redefinition of global label "testLabel" (index 1)'
    ]);
});


test('lintScript, function pointless statement', (t) => {
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
    t.deepEqual(lintScript(validateScript(script)), [
        'Pointless statement in function "testFn" (index 1)'
    ]);
});


test('lintScript, global pointless statement', (t) => {
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
    t.deepEqual(lintScript(validateScript(script)), [
        'Pointless global statement (index 1)'
    ]);
});
