// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/* eslint-disable id-length */

import {evaluateExpressionAsync, executeScriptAsync} from '../lib/runtimeAsync.js';
import {validateExpression, validateScript} from '../lib/model.js';
import test from 'ava';


test('executeScriptAsync', async (t) => {
    const script = validateScript({
        'statements': [
            {'assign': {'name': 'a', 'expr': {'number': 5}}},
            {'assign': {'name': 'b', 'expr': {'number': 7}}},
            {'return': {
                'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
            }}
        ]
    });
    t.is(await executeScriptAsync(script), 12);
});


test('evaluateExpressionAsync', async (t) => {
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
    t.is(await evaluateExpressionAsync(calc, variables), 19);
});
