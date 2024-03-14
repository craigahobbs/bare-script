// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {
    valueBoolean, valueCompare, valueIs, valueJSON, valueParseDatetime, valueParseInteger,
    valueParseNumber, valueRoundNumber, valueString, valueType
} from '../lib/value.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('valueType', () => {
    // null
    assert.equal(valueType(null), 'null');
    assert.equal(valueType(undefined), 'null');

    // string
    assert.equal(valueType('abc'), 'string');

    // boolean
    assert.equal(valueType(true), 'boolean');
    assert.equal(valueType(false), 'boolean');

    // number
    assert.equal(valueType(5), 'number');
    assert.equal(valueType(5.5), 'number');
    assert.equal(valueType(0), 'number');
    assert.equal(valueType(0.), 'number');

    // datetime
    assert.equal(valueType(new Date()), 'datetime');

    // object
    assert.equal(valueType({}), 'object');

    // array
    assert.equal(valueType([]), 'array');

    // function
    assert.equal(valueType(valueType), 'function');

    // regex
    assert.equal(valueType(/^test/), 'regex');

    // unknown
    assert.equal(valueType(new Set([1, 2, 3])), null);
    assert.equal(valueType(new Set()), null);
});


test('valueString', () => {
    // null
    assert.equal(valueString(null), 'null');
    assert.equal(valueString(undefined), 'null');

    // string
    assert.equal(valueString('abc'), 'abc');
    assert.equal(valueString(''), '');

    // boolean
    assert.equal(valueString(true), 'true');
    assert.equal(valueString(false), 'false');

    // number
    assert.equal(valueString(5), '5');
    assert.equal(valueString(5.0), '5');
    assert.equal(valueString(5.5), '5.5');
    assert.equal(valueString(0), '0');
    assert.equal(valueString(0.), '0');

    // datetime
    const d1 = new Date(2024, 0, 12, 6, 9);
    const d2 = new Date(2023, 11, 7, 16, 19, 23, 123);
    const d3 = new Date(2023, 11, 7, 16, 19, 23, 12);
    const d4 = new Date(2023, 11, 7, 16, 19, 23, 1);
    const d5 = new Date(Date.UTC(
        d1.getFullYear(),
        d1.getMonth(),
        d1.getDate(),
        d1.getHours(),
        d1.getMinutes() + d1.getTimezoneOffset(),
        d1.getSeconds(),
        d1.getMilliseconds()
    ));
    const d6 = new Date(900, 0, 1);
    const tzSuffix = (dt) => {
        const tzOffset = dt.getTimezoneOffset();
        /* c8 ignore next */
        const tzSign = tzOffset < 0 ? '+' : '-';
        const tzHour = Math.floor(Math.abs(tzOffset) / 60);
        /* c8 ignore next */
        const tzHourStr = String(tzHour).padStart(2, '0');
        const tzMinute = Math.abs(tzOffset) - tzHour * 60;
        /* c8 ignore next */
        const tzMinuteStr = String(tzMinute).padStart(2, '0');
        return `${tzSign}${tzHourStr}:${tzMinuteStr}`;
    };
    assert.equal(valueString(d1), `2024-01-12T06:09:00${tzSuffix(d1)}`);
    assert.equal(valueString(d2), `2023-12-07T16:19:23.123${tzSuffix(d2)}`);
    assert.equal(valueString(d3), `2023-12-07T16:19:23.012${tzSuffix(d3)}`);
    assert.equal(valueString(d4), `2023-12-07T16:19:23.001${tzSuffix(d4)}`);
    assert.equal(valueString(d5), `2024-01-12T06:09:00${tzSuffix(d1)}`);
    assert.equal(valueString(d6), `0900-01-01T00:00:00${tzSuffix(d6)}`);

    // object
    assert.equal(valueString({'value': 1}), '{"value":1}');
    assert.equal(valueString({}), '{}');

    // array
    assert.equal(valueString([1, 2, 3]), '[1,2,3]');
    assert.equal(valueString([]), '[]');

    // function
    assert.equal(valueString(valueString), '<function>');

    // regex
    assert.equal(valueString(/^test/), '<regex>');

    // unknown
    assert.equal(valueString(new Set([1, 2, 3])), '<unknown>');
    assert.equal(valueString(new Set()), '<unknown>');
});


test('valueJSON', () => {
    assert.equal(valueJSON({'value': 4, 'c': 3, 'a': 1, 'b': 2}), '{"a":1,"b":2,"c":3,"value":4}');
    assert.equal(valueJSON([1, 2, 3]), '[1,2,3]');

    // Indent
    assert.equal(valueJSON({'value': 1}, 2), '{\n  "value": 1\n}');

    // Datetime
    const d1 = new Date(2024, 0, 12, 6, 9);
    const d2 = new Date(2023, 11, 7, 16, 19, 23, 123);
    const d3 = new Date(Date.UTC(
        d1.getFullYear(),
        d1.getMonth(),
        d1.getDate(),
        d1.getHours(),
        d1.getMinutes() + d1.getTimezoneOffset(),
        d1.getSeconds(),
        d1.getMilliseconds()
    ));
    assert.equal(valueJSON(d1), `"${valueString(d1)}"`);
    assert.equal(valueJSON(d2), `"${valueString(d2)}"`);
    assert.equal(valueJSON(d3), `"${valueString(d3)}"`);

    // Number
    assert.equal(valueJSON(5), '5');
    assert.equal(valueJSON(5.), '5');
    assert.equal(valueJSON({'a': 5}), '{"a":5}');
    assert.equal(valueJSON({'a': 5.}), '{"a":5}');
    assert.equal(valueJSON({'a': 5., 'b': 6.}, 4), `\
{
    "a": 5,
    "b": 6
}`);

    // Invalid
    assert.equal(valueJSON({'A': 1, 'B': /^$/}), '{"A":1,"B":null}');
    assert.equal(valueJSON(/^$/), 'null');
});


test('valueBoolean', () => {
    // null
    assert.equal(valueBoolean(null), false);

    // string
    assert.equal(valueBoolean('abc'), true);
    assert.equal(valueBoolean(''), false);

    // boolean
    assert.equal(valueBoolean(true), true);
    assert.equal(valueBoolean(false), false);

    // number
    assert.equal(valueBoolean(5), true);
    assert.equal(valueBoolean(5.5), true);
    assert.equal(valueBoolean(0), false);
    assert.equal(valueBoolean(0.), false);

    // datetime
    assert.equal(valueBoolean(new Date()), true);

    // object
    assert.equal(valueBoolean({'value': 1}), true);
    assert.equal(valueBoolean({}), true);

    // array
    assert.equal(valueBoolean([1, 2, 3]), true);
    assert.equal(valueBoolean([]), false);

    // function
    assert.equal(valueBoolean(valueBoolean), true);

    // regex
    assert.equal(valueBoolean(/^test/), true);

    // unknown
    assert.equal(valueBoolean(new Set([1, 2, 3])), true);
    assert.equal(valueBoolean(new Set()), true);
});


test('valueIs', () => {
    // null
    assert.equal(valueIs(null, null), true);
    assert.equal(valueIs(null, 0), false);

    // string
    assert.equal(valueIs('a', 'a'), true);
    assert.equal(valueIs('a', 'b'), false);

    // boolean
    assert.equal(valueIs(true, true), true);
    assert.equal(valueIs(false, false), true);
    assert.equal(valueIs(false, true), false);

    // number
    assert.equal(valueIs(5, 5), true);
    assert.equal(valueIs(5., 5.), true);
    assert.equal(valueIs(5, 5.), true);
    assert.equal(valueIs(5., 5), true);
    assert.equal(valueIs(5, 6), false);
    assert.equal(valueIs(5., 6.), false);

    // datetime
    const d1 = valueParseDatetime('2024-01-12');
    const d2 = valueParseDatetime('2024-01-12');
    assert.equal(valueIs(d1, d1), true);
    assert.equal(valueIs(d1, d2), false);

    // object
    const o1 = {'value': 1};
    const o2 = {'value': 1};
    assert.equal(valueIs(o1, o1), true);
    assert.equal(valueIs(o1, o2), false);

    // array
    const a1 = [1, 2, 3];
    const a2 = [1, 2, 3];
    assert.equal(valueIs(a1, a1), true);
    assert.equal(valueIs(a1, a2), false);

    // function
    const f1 = () => null;
    const f2 = () => null;
    assert.equal(f1(), null);
    assert.equal(f2(), null);
    assert.equal(valueIs(f1, f1), true);
    assert.equal(valueIs(f1, f2), false);

    // regex
    const r1 = /^test/;
    const r2 = /^test/;
    const r3 = /^test2/;
    assert.equal(valueIs(r1, r1), true);
    assert.equal(valueIs(r1, r2), true);
    assert.equal(valueIs(r1, r3), false);
});


test('valueCompare', () => {
    // null
    assert.equal(valueCompare(null, null), 0);
    assert.equal(valueCompare(null, 0), -1);
    assert.equal(valueCompare(0, null), 1);

    // string
    assert.equal(valueCompare('a', 'a'), 0);
    assert.equal(valueCompare('a', 'b'), -1);
    assert.equal(valueCompare('b', 'a'), 1);

    // boolean
    assert.equal(valueCompare(true, true), 0);
    assert.equal(valueCompare(false, false), 0);
    assert.equal(valueCompare(false, true), -1);
    assert.equal(valueCompare(true, false), 1);

    // number
    assert.equal(valueCompare(5, 5), 0);
    assert.equal(valueCompare(5, 5.), 0);
    assert.equal(valueCompare(5., 5), 0);
    assert.equal(valueCompare(5., 5.), 0);
    assert.equal(valueCompare(5, 6), -1);
    assert.equal(valueCompare(5, 5.5), -1);
    assert.equal(valueCompare(5.5, 6), -1);
    assert.equal(valueCompare(5., 5.5), -1);
    assert.equal(valueCompare(6, 5), 1);
    assert.equal(valueCompare(5.5, 5), 1);
    assert.equal(valueCompare(6, 5.5), 1);
    assert.equal(valueCompare(5.5, 5.), 1);

    // datetime
    const d1 = valueParseDatetime('2024-02-12');
    const d2 = valueParseDatetime('2024-02-11');
    assert.equal(valueCompare(d1, d1), 0);
    assert.equal(valueCompare(d2, d1), -1);
    assert.equal(valueCompare(d1, d2), 1);

    // object
    assert.equal(valueCompare({'value': 1}, {'value': 1}), 0);
    assert.equal(valueCompare({'value': 1}, {'value': 2}), 0);
    assert.equal(valueCompare({'value': 2}, {'value': 1}), 0);

    // array
    assert.equal(valueCompare([1, 2, 3], [1, 2, 3]), 0);
    assert.equal(valueCompare([], []), 0);
    assert.equal(valueCompare([1, 2, 3], [1, 2, 4]), -1);
    assert.equal(valueCompare([1, 2], [1, 2, 3]), -1);
    assert.equal(valueCompare([1, 2, 4], [1, 2, 3]), 1);
    assert.equal(valueCompare([1, 2, 3], [1, 2]), 1);

    // function
    assert.equal(valueCompare(valueCompare, valueType), 0);

    // regex
    assert.equal(valueCompare(/^test1/, /^test1/), 0);
    assert.equal(valueCompare(/^test1/, /^test2/), 0);
    assert.equal(valueCompare(/^test2/, /^test1/), 0);
});


test('valueCompareInvalid', () => {
    // array < boolean
    assert.equal(valueCompare([1, 2, 3], true), -1);
    assert.equal(valueCompare([1, 2, 3], false), -1);
    assert.equal(valueCompare(true, [1, 2, 3]), 1);
    assert.equal(valueCompare(false, [1, 2, 3]), 1);

    // boolean < datetime
    const dt = new Date();
    assert.equal(valueCompare(true, dt), -1);
    assert.equal(valueCompare(false, dt), -1);
    assert.equal(valueCompare(dt, true), 1);
    assert.equal(valueCompare(dt, false), 1);

    // boolean < number
    assert.equal(valueCompare(true, 1), -1);
    assert.equal(valueCompare(false, 1), -1);
    assert.equal(valueCompare(true, 0), -1);
    assert.equal(valueCompare(false, 0), -1);
    assert.equal(valueCompare(1, true), 1);
    assert.equal(valueCompare(1, false), 1);
    assert.equal(valueCompare(0, true), 1);
    assert.equal(valueCompare(0, false), 1);

    // datetime < function
    assert.equal(valueCompare(dt, valueCompare), -1);
    assert.equal(valueCompare(valueCompare, dt), 1);

    // function < number
    assert.equal(valueCompare(valueCompare, 1), -1);
    assert.equal(valueCompare(valueCompare, 0), -1);
    assert.equal(valueCompare(1, valueCompare), 1);
    assert.equal(valueCompare(0, valueCompare), 1);

    // number < object
    assert.equal(valueCompare(1, {}), -1);
    assert.equal(valueCompare({}, 1), 1);

    // object < regex
    assert.equal(valueCompare({}, /^test/), -1);
    assert.equal(valueCompare(/^test/, {}), 1);

    // regex < string
    assert.equal(valueCompare(/^test/, 'abc'), -1);
    assert.equal(valueCompare('abc', /^test/), 1);

    // string < unknown
    assert.equal(valueCompare('abc', new Set([1, 2, 3])), -1);
    assert.equal(valueCompare(new Set([1, 2, 3]), 'abc'), 1);
});


test('valueRoundNumber', () => {
    assert.equal(valueRoundNumber(1.5, 0), 2);
    assert.equal(valueRoundNumber(2.5, 0), 3);
    assert.equal(valueRoundNumber(1.25, 1), 1.3);
    assert.equal(valueRoundNumber(1.35, 1), 1.4);
});


test('valueParseNumber', () => {
    assert.equal(valueParseNumber('123.45'), 123.45);
    assert.equal(valueParseNumber('-123.45'), -123.45);
    assert.equal(valueParseNumber('123'), 123);
    assert.equal(valueParseNumber('123.'), 123);
    assert.equal(valueParseNumber('.45'), 0.45);
    assert.equal(valueParseNumber('1.23e3'), 1230);
    assert.equal(valueParseNumber('4.56E+3'), 4560);
    assert.equal(valueParseNumber('0.123e-2'), 0.00123);
    assert.equal(valueParseNumber('0'), 0);
    assert.equal(valueParseNumber('0.0'), 0);
    assert.equal(valueParseNumber('0e0'), 0);

    // Padding
    assert.equal(valueParseNumber('  123.45  '), 123.45);

    // Special values
    assert.equal(valueParseNumber('NaN'), null);
    assert.equal(valueParseNumber('Infinity'), null);

    // Parse failure
    assert.equal(valueParseNumber('invalid'), null);
    assert.equal(valueParseNumber('1234.45asdf'), null);
    assert.equal(valueParseNumber('1234.45 asdf'), null);
});


test('valueParseInteger', () => {
    assert.equal(valueParseInteger('123'), 123);
    assert.equal(valueParseInteger('-123'), -123);
    assert.equal(valueParseInteger('0'), 0);

    // Padding
    assert.equal(valueParseInteger('  123  '), 123);

    // No floating point
    assert.equal(valueParseInteger('123.'), null);
    assert.equal(valueParseInteger('.45'), null);
    assert.equal(valueParseInteger('1.23e3'), null);
    assert.equal(valueParseInteger('4.56E+3'), null);
    assert.equal(valueParseInteger('0.123e-2'), null);
    assert.equal(valueParseInteger('0.0'), null);
    assert.equal(valueParseInteger('0e0'), null);

    // Special values
    assert.equal(valueParseInteger('NaN'), null);
    assert.equal(valueParseInteger('Infinity'), null);

    // Parse failure
    assert.equal(valueParseInteger('invalid'), null);
    assert.equal(valueParseInteger('123asdf'), null);
    assert.equal(valueParseInteger('123 asdf'), null);
});


test('valueParseDatetime', () => {
    assert.deepEqual(
        valueParseDatetime('2022-08-29T15:08:00+00:00'),
        new Date(Date.UTC(2022, 7, 29, 15, 8))
    );
    assert.deepEqual(
        valueParseDatetime('2022-08-29T15:08:00Z'),
        new Date(Date.UTC(2022, 7, 29, 15, 8))
    );
    assert.deepEqual(
        valueParseDatetime('2022-08-29T15:08:00.123+00:00'),
        new Date(Date.UTC(2022, 7, 29, 15, 8, 0, 123))
    );
    assert.deepEqual(
        valueParseDatetime('2022-08-29T15:08:00.123567+00:00'),
        new Date(Date.UTC(2022, 7, 29, 15, 8, 0, 123))
    );

    // Date
    assert.deepEqual(
        valueParseDatetime('2022-08-29'),
        new Date(2022, 7, 29)
    );

    // Parse failure
    assert.equal(valueParseDatetime('2022-08-29T15:08:00'), null);
    assert.equal(valueParseDatetime('invalid'), null);
});
