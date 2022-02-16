// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/* eslint-disable id-length */

import {evaluateExpression, executeScript} from '../lib/runtime.js';
import {validateExpression, validateScript} from '../lib/model.js';
import test from 'ava';


test('executeScript', (t) => {
    const script = validateScript({
        'statements': [
            {'assign': {'name': 'a', 'expr': {'number': 5}}},
            {'assign': {'name': 'b', 'expr': {'number': 7}}},
            {'expr': {
                'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}},
                'return': true
            }}
        ]
    });
    t.is(executeScript(script), 12);
});


test('executeScript, function', (t) => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'name': 'multiplyNumbers',
                    'args': ['a', 'b'],
                    'statements': [
                        {'assign': {'name': 'c', 'expr': {'variable': 'b'}}},
                        {'expr': {
                            'expr': {'binary': {'op': '*', 'left': {'variable': 'a'}, 'right': {'variable': 'c'}}},
                            'return': true
                        }}
                    ]
                }
            },
            {'expr': {
                'expr': {'function': {'name': 'multiplyNumbers', 'args': [{'number': 5}, {'number': 7}]}},
                'return': true
            }}
        ]
    });
    t.is(executeScript(script), 35);
});


test('executeScript, jump', (t) => {
    const script = validateScript({
        'statements': [
            {'assign': {'name': 'a', 'expr': {'number': 5}}},
            {'jump': {'label': 'lab2'}},
            {'label': 'lab'},
            {'assign': {'name': 'a', 'expr': {'number': 6}}},
            {'jump': {'label': 'lab3'}},
            {'label': 'lab2'},
            {'assign': {'name': 'a', 'expr': {'number': 7}}},
            {'jump': {'label': 'lab'}},
            {'label': 'lab3'},
            {'expr': {'expr': {'variable': 'a'}, 'return': true}}
        ]
    });
    t.is(executeScript(script), 6);
});


test('executeScript, jumpif', (t) => {
    const script = validateScript({
        'statements': [
            {'assign': {'name': 'n', 'expr': {'number': 10}}},
            {'assign': {'name': 'i', 'expr': {'number': 0}}},
            {'assign': {'name': 'a', 'expr': {'number': 0}}},
            {'assign': {'name': 'b', 'expr': {'number': 1}}},
            {'label': 'fib'},
            {'jump': {
                'label': 'fibend',
                'expr': {'binary': {'op': '>=', 'left': {'variable': 'i'}, 'right': {'variable': 'n'}}}
            }},
            {'assign': {'name': 'tmp', 'expr': {'variable': 'b'}}},
            {'assign': {
                'name': 'b',
                'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
            }},
            {'assign': {'name': 'a', 'expr': {'variable': 'tmp'}}},
            {'assign': {'name': 'i', 'expr': {'binary': {'op': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}}},
            {'jump': {'label': 'fib'}},
            {'label': 'fibend'},
            {'expr': {'expr': {'variable': 'a'}, 'return': true}}
        ]
    });
    t.is(executeScript(script), 55);
});


test('executeScript, maxStatements', (t) => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'name': 'fn',
                    'statements': [
                        {'expr': {'expr': {'variable': 'a'}}},
                        {'expr': {'expr': {'variable': 'b'}}}
                    ]
                }
            },
            {'expr': {'expr': {'function': {'name': 'fn'}}}}
        ]
    });
    let errorMessage = null;
    try {
        executeScript(script, {}, {'maxStatements': 3});
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, 'Exceeded maximum script statements (3)');
    t.is(executeScript(script, {}, {'maxStatements': 4}), null);
    t.is(executeScript(script, {}, {'maxStatements': 0}), null);
});


test('evaluateExpression', (t) => {
    const calc = validateExpression({
        'binary': {
            'op': '+',
            'left': {'number': 7},
            'right': {
                'binary': {
                    'op': '*',
                    'left': {'number': 3},
                    'right': {
                        'function': {
                            'name': 'ceil',
                            'args': [
                                {'variable': 'varName'}
                            ]
                        }
                    }
                }
            }
        }
    });
    const variables = {'varName': 4};
    t.is(evaluateExpression(calc, variables), 19);
});


test('evaluateExpression, function variable', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnName',
            'args': [
                {'number': 3}
            ]
        }
    });
    const variables = {'fnName': ([number]) => 2 * number};
    t.is(evaluateExpression(calc, variables), 6);
});


test('evaluateExpression, function unknown', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnUnknown',
            'args': []
        }
    });
    let errorMessage = null;
    try {
        evaluateExpression(calc);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, 'Undefined function "fnUnknown"');
});