// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/* eslint-disable id-length */

import {evaluateExpressionAsync, executeScriptAsync} from '../lib/runtimeAsync.js';
import {validateExpression, validateScript} from '../lib/model.js';
import test from 'ava';


test('executeScriptAsync', async (t) => {
    const script = validateScript({
        'statements': [
            {'assignment': {'name': 'a', 'expression': {'number': 5}}},
            {'assignment': {'name': 'b', 'expression': {'number': 7}}},
            {'expression': {
                'expression': {'binary': {'operator': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}},
                'return': true
            }}
        ]
    });
    t.is(await executeScriptAsync(script), 12);
});


test('evaluateExpressionAsync', async (t) => {
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
    t.is(await evaluateExpressionAsync(calc, variables), 19);
});
