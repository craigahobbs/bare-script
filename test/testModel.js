// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {validateExpression, validateScript} from '../lib/model.js';
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
            'name': 'SchemaValidationError',
            'message': 'Required member "statements" missing'
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
            'name': 'SchemaValidationError',
            'message': 'Invalid value {} (type "object"), expected type "Expression"'
        }
    );
});
