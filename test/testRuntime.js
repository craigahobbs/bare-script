// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/* eslint-disable id-length */

import {evaluateExpression, executeScript} from '../lib/runtime.js';
import {validateExpression, validateScript} from '../lib/model.js';
import test from 'ava';


test('executeScript', (t) => {
    const script = validateScript({
        'statements': [
            {'assignment': {'name': 'a', 'expression': {'number': 5}}},
            {'assignment': {'name': 'b', 'expression': {'number': 7}}},
            {'return': {'binary': {'operator': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}}
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
                    'arguments': ['a', 'b'],
                    'statements': [
                        {'assignment': {'name': 'c', 'expression': {'variable': 'b'}}},
                        {'return': {'binary': {'operator': '*', 'left': {'variable': 'a'}, 'right': {'variable': 'c'}}}}
                    ]
                }
            },
            {'return': {'function': {'name': 'multiplyNumbers', 'arguments': [{'number': 5}, {'number': 7}]}}}
        ]
    });
    t.is(executeScript(script), 35);
});


test('executeScript, jump', (t) => {
    const script = validateScript({
        'statements': [
            {'assignment': {'name': 'a', 'expression': {'number': 5}}},
            {'jump': {'label': 'lab2'}},
            {'label': 'lab'},
            {'assignment': {'name': 'a', 'expression': {'number': 6}}},
            {'jump': {'label': 'lab3'}},
            {'label': 'lab2'},
            {'assignment': {'name': 'a', 'expression': {'number': 7}}},
            {'jump': {'label': 'lab'}},
            {'label': 'lab3'},
            {'return': {'variable': 'a'}}
        ]
    });
    t.is(executeScript(script), 6);
});


test('executeScript, jumpif', (t) => {
    const script = validateScript({
        'statements': [
            {'assignment': {'name': 'n', 'expression': {'number': 10}}},
            {'assignment': {'name': 'i', 'expression': {'number': 0}}},
            {'assignment': {'name': 'a', 'expression': {'number': 0}}},
            {'assignment': {'name': 'b', 'expression': {'number': 1}}},
            {'label': 'fib'},
            {'jump': {
                'label': 'fibend',
                'expression': {'binary': {'operator': '>=', 'left': {'variable': 'i'}, 'right': {'variable': 'n'}}}
            }},
            {'assignment': {'name': 'tmp', 'expression': {'variable': 'b'}}},
            {'assignment': {
                'name': 'b',
                'expression': {'binary': {'operator': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
            }},
            {'assignment': {'name': 'a', 'expression': {'variable': 'tmp'}}},
            {'assignment': {'name': 'i', 'expression': {'binary': {'operator': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}}},
            {'jump': {'label': 'fib'}},
            {'label': 'fibend'},
            {'return': {'variable': 'a'}}
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
                        {'expression': {'variable': 'a'}},
                        {'expression': {'variable': 'b'}}
                    ]
                }
            },
            {'expression': {'function': {'name': 'fn'}}}
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
            'operator': '+',
            'left': {'number': 7},
            'right': {
                'binary': {
                    'operator': '*',
                    'left': {'number': 3},
                    'right': {
                        'function': {
                            'name': 'ceil',
                            'arguments': [
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
            'arguments': [
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
            'arguments': []
        }
    });
    const variables = {};
    const getVariable = (name) => (name in variables ? variables[name] : null);
    let errorMessage = null;
    try {
        evaluateExpression(calc, getVariable);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, 'Undefined function "fnUnknown"');
});
