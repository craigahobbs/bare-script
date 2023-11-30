// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/* eslint-disable id-length */

import {expressionFunctions, scriptFunctions} from '../lib/library.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


// Check the built-in expression functions
test('library, built-in expression functions', () => {
    assert.deepEqual(
        Object.entries(expressionFunctions).map(([fnName, fn]) => [fnName, typeof fn === 'function']),
        [
            ['abs', true],
            ['acos', true],
            ['asin', true],
            ['atan', true],
            ['atan2', true],
            ['ceil', true],
            ['charCodeAt', true],
            ['cos', true],
            ['date', true],
            ['day', true],
            ['endsWith', true],
            ['indexOf', true],
            ['fixed', true],
            ['floor', true],
            ['fromCharCode', true],
            ['hour', true],
            ['lastIndexOf', true],
            ['len', true],
            ['lower', true],
            ['ln', true],
            ['log', true],
            ['max', true],
            ['min', true],
            ['minute', true],
            ['month', true],
            ['now', true],
            ['parseInt', true],
            ['parseFloat', true],
            ['pi', true],
            ['rand', true],
            ['replace', true],
            ['rept', true],
            ['round', true],
            ['second', true],
            ['sign', true],
            ['sin', true],
            ['slice', true],
            ['sqrt', true],
            ['startsWith', true],
            ['text', true],
            ['tan', true],
            ['today', true],
            ['trim', true],
            ['upper', true],
            ['year', true]
        ]
    );
});


//
// Array functions
//


test('library, arrayCopy', () => {
    const array = [1, 2, 3];
    assert.deepEqual(scriptFunctions.arrayCopy([array]), [1, 2, 3]);
});


test('library, arrayCopy non-array', () => {
    assert.deepEqual(scriptFunctions.arrayCopy([null]), []);
});


test('library, arrayExtend', () => {
    const array = [1, 2, 3];
    const array2 = [4, 5, 6];
    assert.deepEqual(scriptFunctions.arrayExtend([array, array2]), [1, 2, 3, 4, 5, 6]);
    assert.deepEqual(array, [1, 2, 3, 4, 5, 6]);
});


test('library, arrayExtend non-array', () => {
    assert.equal(scriptFunctions.arrayExtend([null]), null);
});


test('library, arrayExtend non-array second', () => {
    const array = [1, 2, 3];
    assert.deepEqual(scriptFunctions.arrayExtend([array, null]), [1, 2, 3]);
    assert.deepEqual(array, [1, 2, 3]);
});


test('library, arrayGet', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arrayGet([array, 0]), 1);
});


test('library, arrayGet invalid index', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arrayGet([array, 3]), null);
});


test('library, arrayGet non-array', () => {
    assert.equal(scriptFunctions.arrayGet([null, 0]), null);
});


test('library, arrayIndexOf', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arrayIndexOf([array, 2]), 1);
});


test('library, arrayIndexOf non-array', () => {
    assert.equal(scriptFunctions.arrayIndexOf([null, 2]), -1);
});


test('library, arrayIndexOf index', () => {
    const array = [1, 2, 3, 2];
    assert.equal(scriptFunctions.arrayIndexOf([array, 2, 2]), 3);
});


test('library, arrayJoin', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arrayJoin([array, ', ']), '1, 2, 3');
});


test('library, arrayJoin non-array', () => {
    assert.equal(scriptFunctions.arrayJoin([null, ', ']), '');
});


test('library, arrayLastIndexOf', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arrayLastIndexOf([array, 2]), 1);
});


test('library, arrayLastIndexOf non-array', () => {
    assert.equal(scriptFunctions.arrayLastIndexOf([null, 2]), -1);
});


test('library, arrayLastIndexOf index', () => {
    const array = [1, 2, 3, 2];
    assert.equal(scriptFunctions.arrayLastIndexOf([array, 2, 2]), 1);
});


test('library, arrayLength', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arrayLength([array]), 3);
});


test('library, arrayLength non-array', () => {
    assert.equal(scriptFunctions.arrayLength([null]), null);
});


test('library, arrayNew', () => {
    assert.deepEqual(scriptFunctions.arrayNew([1, 2, 3]), [1, 2, 3]);
});


test('library, arrayNewSize', () => {
    assert.deepEqual(scriptFunctions.arrayNewSize([3]), [0, 0, 0]);
});


test('library, arrayNewSize value', () => {
    assert.deepEqual(scriptFunctions.arrayNewSize([3, 1]), [1, 1, 1]);
});


test('library, arrayPop', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arrayPop([array]), 3);
    assert.deepEqual(array, [1, 2]);
});


test('library, arrayPop empty', () => {
    const array = [];
    assert.equal(scriptFunctions.arrayPop([array]), null);
    assert.deepEqual(array, []);
});


test('library, arrayPop non-array', () => {
    assert.equal(scriptFunctions.arrayPop([null]), null);
});


test('library, arrayPush', () => {
    const array = [1, 2, 3];
    assert.deepEqual(scriptFunctions.arrayPush([array, 5]), [1, 2, 3, 5]);
    assert.deepEqual(array, [1, 2, 3, 5]);
});


test('library, arrayPush non-array', () => {
    assert.equal(scriptFunctions.arrayPush([null]), null);
});


test('library, arraySet', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arraySet([array, 1, 5]), 5);
    assert.deepEqual(array, [1, 5, 3]);
});


test('library, arraySet non-array', () => {
    assert.equal(scriptFunctions.arraySet([null, 1, 5]), 5);
});


test('library, arrayShift', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arrayShift([array]), 1);
    assert.deepEqual(array, [2, 3]);
});


test('library, arrayShift empty', () => {
    const array = [];
    assert.equal(scriptFunctions.arrayShift([array]), null);
    assert.deepEqual(array, []);
});


test('library, arrayShift non-array', () => {
    assert.equal(scriptFunctions.arrayShift([null]), null);
});


test('library, arraySlice', () => {
    const array = [1, 2, 3, 4];
    assert.deepEqual(scriptFunctions.arraySlice([array, 1, 3]), [2, 3]);
});


test('library, arraySlice non-array', () => {
    assert.equal(scriptFunctions.arraySlice([null, 1, 3]), null);
});


test('library, arraySort', () => {
    const array = [3, 2, 1];
    assert.deepEqual(scriptFunctions.arraySort([array]), [1, 2, 3]);
    assert.deepEqual(array, [1, 2, 3]);
});


test('library, arraySort non-array', () => {
    assert.equal(scriptFunctions.arraySort([null]), null);
});


test('library, arraySort compare function', () => {
    const array = [1, 2, 3];
    const compareFn = ([a, b], options) => {
        assert.deepEqual(options, {});

        /* c8 ignore next */
        return a < b ? 1 : (a === b ? 0 : -1);
    };
    assert.deepEqual(scriptFunctions.arraySort([array, compareFn], {}), [3, 2, 1]);
    assert.deepEqual(array, [3, 2, 1]);
});


//
// Data functions
//


test('script library, dataAggregate', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    const aggregation = {
        'categories': ['a'],
        'measures': [
            {'field': 'b', 'function': 'sum', 'name': 'sum_b'}
        ]
    };
    assert.deepEqual(scriptFunctions.dataAggregate([data, aggregation]), [
        {'a': 1, 'sum_b': 7},
        {'a': 2, 'sum_b': 5}
    ]);
});


test('script library, dataCalculatedField', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    assert.deepEqual(scriptFunctions.dataCalculatedField([data, 'c', 'a * b'], {}), [
        {'a': 1, 'b': 3, 'c': 3},
        {'a': 1, 'b': 4, 'c': 4},
        {'a': 2, 'b': 5, 'c': 10}
    ]);
});


test('script library, dataCalculatedField variables', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    const variables = {'d': 2};
    assert.deepEqual(scriptFunctions.dataCalculatedField([data, 'c', 'b * d', variables], {}), [
        {'a': 1, 'b': 3, 'c': 6},
        {'a': 1, 'b': 4, 'c': 8},
        {'a': 2, 'b': 5, 'c': 10}
    ]);
});


test('script library, dataCalculatedField globals', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    const options = {'globals': {'e': 3}};
    assert.deepEqual(scriptFunctions.dataCalculatedField([data, 'c', 'b * e'], options), [
        {'a': 1, 'b': 3, 'c': 9},
        {'a': 1, 'b': 4, 'c': 12},
        {'a': 2, 'b': 5, 'c': 15}
    ]);
});


test('script library, dataCalculatedField globals variables', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    const variables = {'d': 2};
    const options = {'globals': {'e': 3}};
    assert.deepEqual(scriptFunctions.dataCalculatedField([data, 'c', 'b * d * e', variables], options), [
        {'a': 1, 'b': 3, 'c': 18},
        {'a': 1, 'b': 4, 'c': 24},
        {'a': 2, 'b': 5, 'c': 30}
    ]);
});


test('script library, dataCalculatedField runtime', () => {
    const data = [
        {'a': '/foo'},
        {'a': 'bar'}
    ];
    const options = {
        'globals': {
            'documentURL': ([url], funcOptions) => funcOptions.urlFn(url)
        },
        'urlFn': (url) => (url.startsWith('/') ? url : `/foo/${url}`)
    };
    assert.deepEqual(scriptFunctions.dataCalculatedField([data, 'b', 'documentURL(a)'], options), [
        {'a': '/foo', 'b': '/foo'},
        {'a': 'bar', 'b': '/foo/bar'}
    ]);
});


test('script library, dataFilter', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    assert.deepEqual(scriptFunctions.dataFilter([data, 'b > 3'], {}), [
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ]);
});


test('script library, dataFilter variables', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    const variables = {'d': 3};
    assert.deepEqual(scriptFunctions.dataFilter([data, 'b > d', variables], {}), [
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ]);
});


test('script library, dataFilter globals', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    const options = {'globals': {'c': 2}};
    assert.deepEqual(scriptFunctions.dataFilter([data, 'a == c'], options), [
        {'a': 2, 'b': 5}
    ]);
});


test('script library, dataFilter globals variables', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    const variables = {'d': 1};
    const options = {'globals': {'c': 1}};
    assert.deepEqual(scriptFunctions.dataFilter([data, 'a == (c + d)', variables], options), [
        {'a': 2, 'b': 5}
    ]);
});


test('script library, dataFilter runtime', () => {
    const data = [
        {'a': '/foo'},
        {'a': 'bar'}
    ];
    const options = {
        'globals': {
            'documentURL': ([url], funcOptions) => funcOptions.urlFn(url)
        },
        'urlFn': (url) => (url.startsWith('/') ? url : `/foo/${url}`)
    };
    assert.deepEqual(scriptFunctions.dataFilter([data, 'documentURL(a) == "/foo/bar"'], options), [
        {'a': 'bar'}
    ]);
});


test('script library, dataJoin', () => {
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7},
        {'a': 3, 'b': 8}
    ];
    const rightData = [
        {'a': 1, 'c': 10},
        {'a': 2, 'c': 11},
        {'a': 2, 'c': 12}
    ];
    assert.deepEqual(scriptFunctions.dataJoin([leftData, rightData, 'a'], {}), [
        {'a': 1, 'b': 5, 'a2': 1, 'c': 10},
        {'a': 1, 'b': 6, 'a2': 1, 'c': 10},
        {'a': 2, 'b': 7, 'a2': 2, 'c': 11},
        {'a': 2, 'b': 7, 'a2': 2, 'c': 12},
        {'a': 3, 'b': 8}
    ]);
});


test('script library, dataJoin options', () => {
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7},
        {'a': 3, 'b': 8}
    ];
    const rightData = [
        {'a': 2, 'c': 10},
        {'a': 4, 'c': 11},
        {'a': 4, 'c': 12}
    ];
    assert.deepEqual(
        scriptFunctions.dataJoin([leftData, rightData, 'a', 'a / denominator', true, {'denominator': 2}], {}),
        [
            {'a': 1, 'b': 5, 'a2': 2, 'c': 10},
            {'a': 1, 'b': 6, 'a2': 2, 'c': 10},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 11},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 12}
        ]
    );
});


test('script library, dataJoin globals', () => {
    const leftData = [
        {'a': 1, 'c': 5},
        {'a': 2, 'c': 6}
    ];
    const rightData = [
        {'b': 1, 'd': 10},
        {'b': 2, 'd': 11}
    ];
    const options = {'globals': {'e': 1}};
    assert.deepEqual(scriptFunctions.dataJoin([leftData, rightData, 'a + e', 'b'], options), [
        {'a': 1, 'b': 2, 'c': 5, 'd': 11},
        {'a': 2, 'c': 6}
    ]);
});


test('script library, dataJoin globals variables', () => {
    const leftData = [
        {'a': 1, 'c': 5},
        {'a': 2, 'c': 6}
    ];
    const rightData = [
        {'b': 2, 'd': 10},
        {'b': 3, 'd': 11}
    ];
    const variables = {'f': 1};
    const options = {'globals': {'e': 1}};
    assert.deepEqual(scriptFunctions.dataJoin([leftData, rightData, 'a + e + f', 'b', null, variables], options), [
        {'a': 1, 'b': 3, 'c': 5, 'd': 11},
        {'a': 2, 'c': 6}
    ]);
});


test('script library, dataJoin runtime', () => {
    const options = {
        'globals': {
            'documentURL': ([url], funcOptions) => funcOptions.urlFn(url)
        },
        'urlFn': (url) => (url.startsWith('/') ? url : `/foo/${url}`)
    };
    const leftData = [
        {'a': '/foo', 'c': 5},
        {'a': 'bar', 'c': 6}
    ];
    const rightData = [
        {'b': '/foo', 'd': 10},
        {'b': '/foo/bar', 'd': 11}
    ];
    assert.deepEqual(scriptFunctions.dataJoin([leftData, rightData, 'documentURL(a)', 'b'], options), [
        {'a': '/foo', 'b': '/foo', 'c': 5, 'd': 10},
        {'a': 'bar', 'b': '/foo/bar', 'c': 6, 'd': 11}
    ]);
});


test('script library, dataParseCSV', () => {
    const text = `\
a,b
1,3
`;
    const text2 = `\
1,4
2,5
`;
    assert.deepEqual(scriptFunctions.dataParseCSV([text, text2]), [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ]);
});


test('script library, dataSort', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5},
        {'a': 3, 'b': 6},
        {'a': 4, 'b': 7}
    ];
    assert.deepEqual(scriptFunctions.dataSort([data, [['a', true], ['b']]]), [
        {'a': 4, 'b': 7},
        {'a': 3, 'b': 6},
        {'a': 2, 'b': 5},
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4}
    ]);
});


test('script library, dataTop', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5},
        {'a': 3, 'b': 6},
        {'a': 4, 'b': 7}
    ];
    assert.deepEqual(scriptFunctions.dataTop([data, 3]), [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ]);
    assert.deepEqual(scriptFunctions.dataTop([data, 1, ['a']]), [
        {'a': 1, 'b': 3},
        {'a': 2, 'b': 5},
        {'a': 3, 'b': 6},
        {'a': 4, 'b': 7}
    ]);
});


test('script library, dataValidate', () => {
    const data = [
        {'a': '1', 'b': 3},
        {'a': '1', 'b': 4},
        {'a': '2', 'b': 5}
    ];
    assert.deepEqual(scriptFunctions.dataValidate([data]), [
        {'a': '1', 'b': 3},
        {'a': '1', 'b': 4},
        {'a': '2', 'b': 5}
    ]);
});


//
// Datetime functions
//


test('library, datetimeDay', () => {
    assert.equal(scriptFunctions.datetimeDay([new Date(2022, 5, 21)]), 21);
});


test('library, datetimeDay UTC', () => {
    assert.equal(scriptFunctions.datetimeDay([new Date(Date.UTC(2022, 5, 21)), true]), 21);
});


test('library, datetimeDay non-datetime', () => {
    assert.equal(scriptFunctions.datetimeDay([null]), null);
});


test('library, datetimeHour', () => {
    assert.equal(scriptFunctions.datetimeHour([new Date(2022, 5, 21, 7)]), 7);
});


test('library, datetimeHour UTC', () => {
    assert.equal(scriptFunctions.datetimeHour([new Date(Date.UTC(2022, 5, 21, 7)), true]), 7);
});


test('library, datetimeHour non-datetime', () => {
    assert.equal(scriptFunctions.datetimeHour([null]), null);
});


test('library, datetimeISOFormat', () => {
    assert.equal(scriptFunctions.datetimeISOFormat([new Date(Date.UTC(2022, 7, 29, 15, 8))]), '2022-08-29T15:08:00.000Z');
    assert.equal(scriptFunctions.datetimeISOFormat([new Date(2022, 7, 29, 15, 8), true]), '2022-08-29');
    assert.equal(scriptFunctions.datetimeISOFormat([new Date(2022, 10, 9, 15, 8), true]), '2022-11-09');
});


test('library, datetimeISOParse', () => {
    assert.deepEqual(
        scriptFunctions.datetimeISOFormat([scriptFunctions.datetimeISOParse(['2022-08-29T15:08:00.000Z'])]),
        '2022-08-29T15:08:00.000Z'
    );
    assert.equal(scriptFunctions.datetimeISOParse(['invalid']), null);
});


test('library, datetimeMinute', () => {
    assert.equal(scriptFunctions.datetimeMinute([new Date(2022, 5, 21, 7, 15)]), 15);
});


test('library, datetimeMinute UTC', () => {
    assert.equal(scriptFunctions.datetimeMinute([new Date(Date.UTC(2022, 5, 21, 7, 15)), true]), 15);
});


test('library, datetimeMinute non-datetime', () => {
    assert.equal(scriptFunctions.datetimeMinute([null]), null);
});


test('library, datetimeMonth', () => {
    assert.equal(scriptFunctions.datetimeMonth([new Date(2022, 5, 21, 7, 15)]), 6);
});


test('library, datetimeMonth UTC', () => {
    assert.equal(scriptFunctions.datetimeMonth([new Date(Date.UTC(2022, 5, 21, 7, 15)), true]), 6);
});


test('library, datetimeMonth non-datetime', () => {
    assert.equal(scriptFunctions.datetimeMonth([null]), null);
});


test('library, datetimeNew', () => {
    assert.deepEqual(scriptFunctions.datetimeNew([2022, 6, 21]), new Date(2022, 5, 21));
});


test('library, datetimeNew complete', () => {
    assert.deepEqual(scriptFunctions.datetimeNew([2022, 6, 21, 12, 30, 15, 100]), new Date(2022, 5, 21, 12, 30, 15, 100));
});


test('library, datetimeNewUTC', () => {
    assert.deepEqual(scriptFunctions.datetimeNewUTC([2022, 6, 21]), new Date(Date.UTC(2022, 5, 21)));
});


test('library, datetimeNewUTC complete', () => {
    assert.deepEqual(scriptFunctions.datetimeNewUTC([2022, 6, 21, 12, 30, 15, 100]), new Date(Date.UTC(2022, 5, 21, 12, 30, 15, 100)));
});


test('library, datetimeNow', () => {
    assert(scriptFunctions.datetimeNow([]) instanceof Date);
});


test('library, datetimeSecond', () => {
    assert.equal(scriptFunctions.datetimeSecond([new Date(2022, 5, 21, 7, 15, 30)]), 30);
});


test('library, datetimeSecond UTC', () => {
    assert.equal(scriptFunctions.datetimeSecond([new Date(Date.UTC(2022, 5, 21, 7, 15, 30)), true]), 30);
});


test('library, datetimeSecond non-datetime', () => {
    assert.equal(scriptFunctions.datetimeSecond([null]), null);
});


test('library, datetimeToday', () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    assert.deepEqual(scriptFunctions.datetimeToday([]), today);
});


test('library, datetimeYear', () => {
    assert.equal(scriptFunctions.datetimeYear([new Date(2022, 5, 21)]), 2022);
});


test('library, datetimeYear UTC', () => {
    assert.equal(scriptFunctions.datetimeYear([new Date(Date.UTC(2022, 5, 21)), true]), 2022);
});


test('library, datetimeYear non-datetime', () => {
    assert.equal(scriptFunctions.datetimeYear([null]), null);
});


//
// JSON functions
//


test('library, jsonParse', () => {
    assert.deepEqual(scriptFunctions.jsonParse(['{"a": 1, "b": 2}'], null), {'a': 1, 'b': 2});
});


test('library, jsonParse error', () => {
    assert.throws(
        () => {
            scriptFunctions.jsonParse(['asdf'], null);
        },
        {
            'name': 'SyntaxError'
        }
    );
});


test('library, jsonStringify', () => {
    assert.equal(scriptFunctions.jsonStringify([{'b': 2, 'a': 1}]), '{"a":1,"b":2}');
    assert.equal(scriptFunctions.jsonStringify([{'b': 2, 'a': {'d': 4, 'c': 3}}]), '{"a":{"c":3,"d":4},"b":2}');
    assert.equal(scriptFunctions.jsonStringify([[{'b': 2, 'a': 1}]]), '[{"a":1,"b":2}]');
    assert.equal(scriptFunctions.jsonStringify([[3, 2, 1]]), '[3,2,1]');
    assert.equal(scriptFunctions.jsonStringify([123]), '123');
    assert.equal(scriptFunctions.jsonStringify(['abc']), '"abc"');
    assert.equal(scriptFunctions.jsonStringify([null]), 'null');
});


test('library, jsonStringify indent', () => {
    assert.equal(scriptFunctions.jsonStringify([{'a': 1, 'b': 2}, 4]), `\
{
    "a": 1,
    "b": 2
}`);
});


//
// Math functions
//


test('library, mathAbs', () => {
    assert.equal(scriptFunctions.mathAbs([-3]), 3);
});


test('library, mathAcos', () => {
    assert.equal(scriptFunctions.mathAcos([1]), 0);
});


test('library, mathAsin', () => {
    assert.equal(scriptFunctions.mathAsin([0]), 0);
});


test('library, mathAtan', () => {
    assert.equal(scriptFunctions.mathAtan([0]), 0);
});


test('library, mathAtan2', () => {
    assert.equal(scriptFunctions.mathAtan2([0, 1]), 0);
});


test('library, mathCeil', () => {
    assert.equal(scriptFunctions.mathCeil([0.25]), 1);
});


test('library, mathCos', () => {
    assert.equal(scriptFunctions.mathCos([0]), 1);
});


test('library, mathFloor', () => {
    assert.equal(scriptFunctions.mathFloor([1.125]), 1);
});


test('library, mathLn', () => {
    assert.equal(scriptFunctions.mathLn([Math.E]), 1);
});


test('library, mathLog', () => {
    assert.equal(scriptFunctions.mathLog([10]), 1);
});


test('library, mathLog base', () => {
    assert.equal(scriptFunctions.mathLog([8, 2]), 3);
});


test('library, mathMax', () => {
    assert.equal(scriptFunctions.mathMax([1, 2, 3]), 3);
});


test('library, mathMin', () => {
    assert.equal(scriptFunctions.mathMin([1, 2, 3]), 1);
});


test('library, mathPi', () => {
    assert.equal(scriptFunctions.mathPi([]), Math.PI);
});


test('library, mathRandom', () => {
    assert.equal(typeof scriptFunctions.mathRandom([]), 'number');
});


test('library, mathRound', () => {
    assert.equal(scriptFunctions.mathRound([5.125]), 5);
});


test('library, mathRound digits', () => {
    assert.equal(scriptFunctions.mathRound([5.25, 1]), 5.3);
});


test('library, mathRound digits 2', () => {
    assert.equal(scriptFunctions.mathRound([5.15, 1]), 5.2);
});


test('library, mathSign', () => {
    assert.equal(scriptFunctions.mathSign([5.125]), 1);
});


test('library, mathSin', () => {
    assert.equal(scriptFunctions.mathSin([0]), 0);
});


test('library, mathSqrt', () => {
    assert.equal(scriptFunctions.mathSqrt([4]), 2);
});


test('library, mathTan', () => {
    assert.equal(scriptFunctions.mathTan([0]), 0);
});


//
// Number functions
//


test('library, numberToFixed', () => {
    assert.equal(scriptFunctions.numberToFixed([1.125, 1]), '1.1');
    assert.equal(scriptFunctions.numberToFixed([1, 1]), '1.0');
});


test('library, numberToFixed trim', () => {
    assert.equal(scriptFunctions.numberToFixed([1.125, 1, true]), '1.1');
    assert.equal(scriptFunctions.numberToFixed([1, 1, true]), '1');
});


test('library, numberToFixed non-number', () => {
    assert.equal(scriptFunctions.numberToFixed([null, 1]), null);
});


test('library, numberToFixed default digits', () => {
    assert.equal(scriptFunctions.numberToFixed([1.125]), '1.13');
});


test('library, numberParseInt', () => {
    assert.equal(scriptFunctions.numberParseInt(['123']), 123);
});


test('library, numberParseInt radix', () => {
    assert.equal(scriptFunctions.numberParseInt(['10', 2]), 2);
});


test('library, numberParseFloat', () => {
    assert.equal(scriptFunctions.numberParseFloat(['123.45']), 123.45);
});


//
// Object functions
//


test('library, objectAssign', () => {
    const obj = {'a': 1, 'b': 2};
    const obj2 = {'b': 3, 'c': 4};
    assert.deepEqual(scriptFunctions.objectAssign([obj, obj2]), {'a': 1, 'b': 3, 'c': 4});
    assert.deepEqual(obj, {'a': 1, 'b': 3, 'c': 4});
});


test('library, objectAssign null', () => {
    const obj = {'a': 1, 'b': 2};
    assert.deepEqual(scriptFunctions.objectAssign([obj, null]), obj);
    assert.deepEqual(obj, {'a': 1, 'b': 2});
    assert.equal(scriptFunctions.objectAssign([null, obj]), null);
    assert.deepEqual(obj, {'a': 1, 'b': 2});
});


test('library, objectAssign non-object', () => {
    const obj = {'a': 1, 'b': 2};
    assert.deepEqual(scriptFunctions.objectAssign([obj, 0]), obj);
    assert.deepEqual(obj, {'a': 1, 'b': 2});
    assert.deepEqual(scriptFunctions.objectAssign([0, obj]), 0);
    assert.deepEqual(obj, {'a': 1, 'b': 2});
});


test('library, objectAssign array', () => {
    const obj = {'a': 1, 'b': 2};
    const array = ['c', 'd'];
    assert.deepEqual(scriptFunctions.objectAssign([obj, array]), obj);
    assert.deepEqual(obj, {'a': 1, 'b': 2});
    assert.deepEqual(scriptFunctions.objectAssign([array, obj]), array);
    assert.deepEqual(obj, {'a': 1, 'b': 2});
});


test('library, objectCopy', () => {
    const obj = {'a': 1, 'b': 2};
    assert.deepEqual(scriptFunctions.objectCopy([obj]), obj);
});


test('library, objectCopy null', () => {
    assert.deepEqual(scriptFunctions.objectCopy([null]), {});
});


test('library, objectCopy non-object', () => {
    assert.deepEqual(scriptFunctions.objectCopy([0]), {});
});


test('library, objectCopy array', () => {
    assert.deepEqual(scriptFunctions.objectCopy([['a', 'b']]), {});
});


test('library, objectDelete', () => {
    const obj = {'a': 1, 'b': 2};
    assert.equal(scriptFunctions.objectDelete([obj, 'a']), undefined);
    assert.deepEqual(obj, {'b': 2});
});


test('library, objectDelete missing', () => {
    const obj = {'b': 2};
    assert.equal(scriptFunctions.objectDelete([obj, 'a']), undefined);
    assert.deepEqual(obj, {'b': 2});
});


test('library, objectDelete null', () => {
    assert.equal(scriptFunctions.objectDelete([null, 'a']), undefined);
});


test('library, objectDelete non-object', () => {
    assert.equal(scriptFunctions.objectDelete([0, 'a']), undefined);
});


test('library, objectDelete array', () => {
    assert.equal(scriptFunctions.objectDelete([['a', 'b'], 'a']), undefined);
});


test('library, objectGet', () => {
    const obj = {'a': 1, 'b': 2};
    assert.equal(scriptFunctions.objectGet([obj, 'a']), 1);
});


test('library, objectGet default', () => {
    const obj = {};
    assert.equal(scriptFunctions.objectGet([obj, 'a']), null);
    assert.equal(scriptFunctions.objectGet([obj, 'a', 1]), 1);
});


test('library, objectGet missing', () => {
    const obj = {'a': 1, 'b': 2};
    assert.equal(scriptFunctions.objectGet([obj, 'c']), null);
});


test('library, objectGet null', () => {
    assert.equal(scriptFunctions.objectGet([null, 'a']), null);
});


test('library, objectGet null default', () => {
    assert.equal(scriptFunctions.objectGet([null, 'a', 1]), 1);
});


test('library, objectGet non-object', () => {
    assert.equal(scriptFunctions.objectGet([0, 'a']), null);
});


test('library, objectGet array', () => {
    assert.equal(scriptFunctions.objectGet([['a', 'b'], 'a']), null);
});


test('library, objectHas', () => {
    const obj = {'a': 1, 'b': null, 'c': undefined};
    assert.equal(scriptFunctions.objectHas([obj, 'a']), true);
    assert.equal(scriptFunctions.objectHas([obj, 'b']), true);
    assert.equal(scriptFunctions.objectHas([obj, 'c']), true);
    assert.equal(scriptFunctions.objectHas([obj, 'd']), false);
});


test('library, objectHas null', () => {
    assert.equal(scriptFunctions.objectHas([null, 'a']), false);
});


test('library, objectHas non-object', () => {
    assert.equal(scriptFunctions.objectHas([0, 'a']), false);
});


test('library, objectHas array', () => {
    assert.equal(scriptFunctions.objectHas([['a', 'b'], 'a']), false);
});


test('library, objectKeys', () => {
    const obj = {'a': 1, 'b': 2};
    assert.deepEqual(scriptFunctions.objectKeys([obj]), ['a', 'b']);
});


test('library, objectKeys null', () => {
    assert.equal(scriptFunctions.objectKeys([null]), null);
});


test('library, objectKeys non-object', () => {
    assert.equal(scriptFunctions.objectKeys([0]), null);
});


test('library, objectKeys array', () => {
    assert.equal(scriptFunctions.objectKeys([['a', 'b']]), null);
});


test('library, objectNew', () => {
    assert.deepEqual(scriptFunctions.objectNew([]), {});
});


test('library, objectNew key/values', () => {
    assert.deepEqual(scriptFunctions.objectNew(['a', 1, 'b', 2]), {'a': 1, 'b': 2});
});


test('library, objectNew odd', () => {
    assert.deepEqual(scriptFunctions.objectNew(['a', 1, 'b']), {'a': 1, 'b': null});
});


test('library, objectSet missing', () => {
    const obj = {'a': 1, 'b': 2};
    assert.equal(scriptFunctions.objectSet([obj, 'c', 3]), 3);
    assert.deepEqual(obj, {'a': 1, 'b': 2, 'c': 3});
});


test('library, objectSet null', () => {
    assert.equal(scriptFunctions.objectSet([null, 'c', 3]), 3);
});


test('library, objectSet non-object', () => {
    assert.equal(scriptFunctions.objectSet([0, 'c', 3]), 3);
});


test('library, objectSet array', () => {
    const array = ['a', 'b'];
    assert.equal(scriptFunctions.objectSet([array, 'c', 3]), 3);
    assert.deepEqual(array, ['a', 'b']);
});


//
// Regex functions
//


test('library, regexEscape', () => {
    assert.equal(scriptFunctions.regexEscape(['a*b']), 'a\\*b');
});


test('library, regexEscape non-string', () => {
    assert.equal(scriptFunctions.regexEscape([null]), null);
});


test('library, regexMatch', () => {
    assert.equal(scriptFunctions.regexMatch([/foo/, 'foo bar'])[0], 'foo');
});


test('library, regexMatch non-string', () => {
    assert.equal(scriptFunctions.regexMatch([/foo/, null]), null);
});


test('library, regexMatchAll', () => {
    assert.deepEqual(scriptFunctions.regexMatchAll([/foo/g, 'foo foo bar']).map((m) => m[0]), ['foo', 'foo']);
});


test('library, regexMatchAll no matches', () => {
    assert.deepEqual(scriptFunctions.regexMatchAll([/foo/g, 'boo boo bar']).map((m) => m[0]), []);
});


test('library, regexMatchAll non-string', () => {
    assert.equal(scriptFunctions.regexMatchAll([/foo/g, null]), null);
});


test('library, regexNew', () => {
    assert(scriptFunctions.regexNew(['a*b']) instanceof RegExp);
});


test('library, regexNew flags', () => {
    const regex = scriptFunctions.regexNew(['a*b', 'g']);
    assert(regex instanceof RegExp);
    assert.equal(regex.flags, 'g');
});


test('library, regexTest', () => {
    assert(scriptFunctions.regexTest([/a*b/, 'caaabc']));
});


test('library, regexTest non-regexp', () => {
    assert.equal(scriptFunctions.regexTest([null, 'caaabc']), null);
});


//
// Schema functions
//


test('script library, schemaParse', () => {
    assert.deepEqual(
        scriptFunctions.schemaParse(
            [
                '# My struct',
                'struct MyStruct',
                '',
                '  # An integer\n  int a'
            ],
            {}
        ),
        {
            'MyStruct': {
                'struct': {
                    'name': 'MyStruct',
                    'doc': ['My struct'],
                    'members': [
                        {
                            'name': 'a',
                            'doc': ['An integer'],
                            'type': {'builtin': 'int'}
                        }
                    ]
                }
            }
        }
    );
});


test('script library, schemaParseEx', () => {
    const types = scriptFunctions.schemaParse(
        [
            'typedef int MyType'
        ],
        {}
    );
    const types2 = scriptFunctions.schemaParseEx(
        [
            [
                'struct MyStruct',
                '    MyType a'
            ],
            types
        ],
        {}
    );
    assert.equal(types, types2);
    assert.deepEqual(types2, {
        'MyStruct': {
            'struct': {
                'name': 'MyStruct',
                'members': [
                    {
                        'name': 'a',
                        'type': {'user': 'MyType'}
                    }
                ]
            }
        },
        'MyType': {
            'typedef': {
                'name': 'MyType',
                'type': {
                    'builtin': 'int'
                }
            }
        }
    });
});


test('script library, schemaTypeModel', () => {
    assert('Types' in scriptFunctions.schemaTypeModel([], {}));
});

test('script library, schemaValidate', () => {
    const types = scriptFunctions.schemaParse(['# My struct', 'struct MyStruct', '', '  # An integer\n  int a'], {});
    assert.deepEqual(scriptFunctions.schemaValidate([types, 'MyStruct', {'a': 5}], {}), {'a': 5});
});


test('script library, schemaValidateTypeModel', () => {
    const typeModel = scriptFunctions.schemaTypeModel([], {});
    assert.deepEqual(scriptFunctions.schemaValidateTypeModel([typeModel], {}), typeModel);
});


//
// String functions
//


test('library, stringCharCodeAt', () => {
    assert.equal(scriptFunctions.stringCharCodeAt(['A', 0]), 65);
});


test('library, stringCharCodeAt non-string', () => {
    assert.equal(scriptFunctions.stringCharCodeAt([null, 0]), null);
});


test('library, stringEndsWith', () => {
    assert(scriptFunctions.stringEndsWith(['foo bar', 'bar']));
});


test('library, stringEndsWith non-string', () => {
    assert.equal(scriptFunctions.stringEndsWith([null, 'bar']), null);
});


test('library, stringIndexOf', () => {
    assert.equal(scriptFunctions.stringIndexOf(['foo bar', 'bar']), 4);
});


test('library, stringIndexOf non-string', () => {
    assert.equal(scriptFunctions.stringIndexOf([null, 'bar']), -1);
});


test('library, stringIndexOf position', () => {
    assert.equal(scriptFunctions.stringIndexOf(['foo bar bar', 'bar', 5]), 8);
});


test('library, stringFromCharCode', () => {
    assert.equal(scriptFunctions.stringFromCharCode([65, 66, 67]), 'ABC');
});


test('library, stringLastIndexOf', () => {
    assert.equal(scriptFunctions.stringLastIndexOf(['foo bar bar', 'bar']), 8);
});


test('library, stringLastIndexOf non-string', () => {
    assert.equal(scriptFunctions.stringLastIndexOf([null, 'bar']), -1);
});


test('library, stringLength', () => {
    assert.equal(scriptFunctions.stringLength(['foo']), 3);
});


test('library, stringLength non-string', () => {
    assert.equal(scriptFunctions.stringLength([null]), null);
});


test('library, stringLower', () => {
    assert.equal(scriptFunctions.stringLower(['Foo']), 'foo');
});


test('library, stringLower non-string', () => {
    assert.equal(scriptFunctions.stringLower([null]), null);
});


test('library, stringNew', () => {
    assert.equal(scriptFunctions.stringNew([123]), '123');
});


test('library, stringRepeat', () => {
    assert.equal(scriptFunctions.stringRepeat(['*', 3]), '***');
});


test('library, stringRepeat non-string', () => {
    assert.equal(scriptFunctions.stringRepeat([null, 3]), null);
});


test('library, stringReplace', () => {
    assert.equal(scriptFunctions.stringReplace(['foo bar', 'bar', 'bonk']), 'foo bonk');
});


test('library, stringReplace non-string', () => {
    assert.equal(scriptFunctions.stringReplace([null, 'bar', 'bonk']), null);
});


test('library, stringReplace regex', () => {
    assert.equal(scriptFunctions.stringReplace(['foo bar', /\s+bar/g, ' bonk']), 'foo bonk');
});


test('library, stringReplace regex replacer function', () => {
    const replacerFunction = (args, options) => {
        assert.deepEqual(args, [' bar', 3, 'foo bar']);
        assert.deepEqual(options, {});
        return ' bonk';
    };
    assert.equal(scriptFunctions.stringReplace(['foo bar', /\s+bar/g, replacerFunction], {}), 'foo bonk');
});


test('library, stringReplace replacer function', () => {
    const replacerFunction = (args, options) => {
        assert.deepEqual(args, ['bar', 4, 'foo bar']);
        assert.deepEqual(options, {});
        return 'bonk';
    };
    assert.equal(scriptFunctions.stringReplace(['foo bar', 'bar', replacerFunction], {}), 'foo bonk');
});


test('library, stringSlice', () => {
    assert.equal(scriptFunctions.stringSlice(['foo bar', 1, 5]), 'oo b');
});


test('library, stringSlice non-string', () => {
    assert.equal(scriptFunctions.stringSlice([null, 1, 5]), null);
});


test('library, stringSplit', () => {
    assert.deepEqual(scriptFunctions.stringSplit(['foo, bar', ', ']), ['foo', 'bar']);
});


test('library, stringSplit non-string', () => {
    assert.equal(scriptFunctions.stringSplit([null, ', ']), null);
});


test('library, stringSplit regex', () => {
    assert.deepEqual(scriptFunctions.stringSplit(['foo, bar', /,\s*/]), ['foo', 'bar']);
});


test('library, stringSplit limit', () => {
    assert.deepEqual(scriptFunctions.stringSplit(['foo, bar, bonk', /,\s*/, 2]), ['foo', 'bar']);
});


test('library, stringStartsWith', () => {
    assert(scriptFunctions.stringStartsWith(['foo bar', 'foo']));
});


test('library, stringStartsWith non-string', () => {
    assert.equal(scriptFunctions.stringStartsWith([null, 'foo']), null);
});


test('library, stringTrim', () => {
    assert.equal(scriptFunctions.stringTrim([' abc ']), 'abc');
});


test('library, stringTrim non-string', () => {
    assert.equal(scriptFunctions.stringTrim([null]), null);
});


test('library, stringUpper', () => {
    assert.equal(scriptFunctions.stringUpper(['Foo']), 'FOO');
});


test('library, stringUpper non-string', () => {
    assert.equal(scriptFunctions.stringUpper([null]), null);
});


//
// System functions
//


test('library, systemFetch', async () => {
    const jsonObject = {'a': 1, 'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        assert.equal(url, 'test.json');
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (jsonObject)
        };
    };
    const options = {fetchFn};
    assert.deepEqual(await scriptFunctions.systemFetch(['test.json'], options), jsonObject);
});


test('library, systemFetch options', async () => {
    const jsonObject = {'a': 1, 'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url, fetchFnOptions) => {
        assert.equal(url, 'test.json');
        assert.equal(fetchFnOptions, fetchOptions);
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (jsonObject)
        };
    };
    const options = {fetchFn};
    const fetchOptions = {'method': 'POST'};
    assert.deepEqual(await scriptFunctions.systemFetch(['test.json', fetchOptions], options), jsonObject);
});


test('library, systemFetch text', async () => {
    const text = 'asdf';
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        assert.equal(url, 'test.txt');
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'text': async () => text
        };
    };
    const options = {fetchFn};
    assert.equal(await scriptFunctions.systemFetch(['test.txt', null, true], options), text);
});


test('library, systemFetch array', async () => {
    const jsonObject = {'a': 1};
    const jsonObject2 = {'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        assert(url === 'test.json' || url === 'test2.json');
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (url === 'test.json' ? jsonObject : jsonObject2)
        };
    };
    const options = {fetchFn};
    assert.deepEqual(await scriptFunctions.systemFetch([['test.json', 'test2.json']], options), [jsonObject, jsonObject2]);
});


test('library, systemFetch array options', async () => {
    const jsonObject = {'a': 1};
    const jsonObject2 = {'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url, fetchFnOptions) => {
        assert(url === 'test.json' || url === 'test2.json');
        assert.equal(fetchFnOptions, fetchOptions);
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (url === 'test.json' ? jsonObject : jsonObject2)
        };
    };
    const options = {fetchFn};
    const fetchOptions = {'method': 'POST'};
    assert.deepEqual(await scriptFunctions.systemFetch([['test.json', 'test2.json'], fetchOptions], options), [jsonObject, jsonObject2]);
});


test('library, systemFetch urlFn', async () => {
    const jsonObject = {'a': 1, 'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        assert.equal(url, 'urlFn-test.json');
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (jsonObject)
        };
    };
    const urlFn = (url) => `urlFn-${url}`;
    const options = {fetchFn, urlFn};
    assert.deepEqual(await scriptFunctions.systemFetch(['test.json'], options), jsonObject);
});


test('library, systemFetch array urlFn', async () => {
    const jsonObject = {'a': 1};
    const jsonObject2 = {'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        assert(url === 'urlFn-test.json' || url === 'urlFn-test2.json');
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (url === 'urlFn-test.json' ? jsonObject : jsonObject2)
        };
    };
    const urlFn = (url) => `urlFn-${url}`;
    const options = {fetchFn, urlFn};
    assert.deepEqual(await scriptFunctions.systemFetch([['test.json', 'test2.json']], options), [jsonObject, jsonObject2]);
});


test('library, systemFetch null ExecuteScriptOptions', async () => {
    assert.equal(await scriptFunctions.systemFetch(['test.json'], null), null);
});


test('library, systemFetch null options log', async () => {
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {logFn, 'debug': true};
    assert.equal(await scriptFunctions.systemFetch(['test.json'], options), null);
    assert.deepEqual(logs, ['BareScript: Function "systemFetch" failed for JSON resource "test.json"']);
});


test('library, systemFetch null options log no-debug', async () => {
    const logs = [];
    /* c8 ignore next 2 */
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {logFn, 'debug': false};
    assert.equal(await scriptFunctions.systemFetch(['test.json'], options), null);
    assert.deepEqual(logs, []);
});


test('library, systemFetch null array options log', async () => {
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {logFn, 'debug': true};
    assert.deepEqual(await scriptFunctions.systemFetch([['test.json', 'test2.json']], options), [null, null]);
    assert.deepEqual(logs, [
        'BareScript: Function "systemFetch" failed for JSON resource "test.json"',
        'BareScript: Function "systemFetch" failed for JSON resource "test2.json"'
    ]);
});


test('library, systemFetch options no fetchFn', async () => {
    assert.equal(await scriptFunctions.systemFetch(['test.json'], {}), null);
});


test('library, systemFetch array null ExecuteScriptOptions', async () => {
    assert.deepEqual(await scriptFunctions.systemFetch([['test.json', 'test2.json']], null), [null, null]);
});


test('library, systemFetch response not-ok', async () => {
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        assert.equal(url, 'test.json');
        return {'ok': false, 'statusText': 'Not Found'};
    };
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {fetchFn, logFn, 'debug': true};
    assert.equal(await scriptFunctions.systemFetch(['test.json'], options), null);
    assert.deepEqual(logs, ['BareScript: Function "systemFetch" failed for JSON resource "test.json"']);
});


test('library, systemFetch response json error', async () => {
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        assert.equal(url, 'test.json');
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => {
                throw new Error('invalid json');
            }
        };
    };
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {fetchFn, logFn, 'debug': true};
    assert.equal(await scriptFunctions.systemFetch(['test.json'], options), null);
    assert.deepEqual(logs, ['BareScript: Function "systemFetch" failed for JSON resource "test.json"']);
});


test('library, systemFetch text response not-ok', async () => {
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        assert.equal(url, 'test.txt');
        return {'ok': false, 'statusText': 'Not Found'};
    };
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {fetchFn, logFn, 'debug': true};
    assert.equal(await scriptFunctions.systemFetch(['test.txt', null, true], options), null);
    assert.deepEqual(logs, ['BareScript: Function "systemFetch" failed for text resource "test.txt"']);
});


test('library, systemFetch response text error', async () => {
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        assert.equal(url, 'test.txt');
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'text': async () => {
                throw new Error('invalid text');
            }
        };
    };
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {fetchFn, logFn, 'debug': true};
    assert.equal(await scriptFunctions.systemFetch(['test.txt', null, true], options), null);
    assert.deepEqual(logs, ['BareScript: Function "systemFetch" failed for text resource "test.txt"']);
});


test('library, systemFetch response error', async () => {
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        assert.equal(url, 'test.txt');
        throw new Error('systemFetch failed');
    };
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {fetchFn, logFn, 'debug': true};
    assert.equal(await scriptFunctions.systemFetch(['test.txt', null, true], options), null);
    assert.deepEqual(logs, ['BareScript: Function "systemFetch" failed for text resource "test.txt"']);
});


test('library, systemFetch array response error', async () => {
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        if (url === 'test.txt') {
            throw new Error('systemFetch failed');
        }
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => ({'foo': 'bar'})
        };
    };
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {fetchFn, logFn, 'debug': true};
    assert.deepEqual(
        await scriptFunctions.systemFetch([['test.txt', 'test2.txt']], options),
        [null, {'foo': 'bar'}]
    );
    assert.deepEqual(logs, ['BareScript: Function "systemFetch" failed for JSON resource "test.txt"']);
});


test('library, systemGlobalGet', () => {
    const options = {'globals': {'a': 1}};
    assert.equal(scriptFunctions.systemGlobalGet(['a'], options), 1);
});


test('library, systemGlobalGet unknown', () => {
    const options = {'globals': {}};
    assert.equal(scriptFunctions.systemGlobalGet(['a'], options), null);
});


test('library, systemGlobalGet no globals', () => {
    const options = {};
    assert.equal(scriptFunctions.systemGlobalGet(['a'], options), null);
});


test('library, systemGlobalGet no options', () => {
    assert.equal(scriptFunctions.systemGlobalGet(['a'], null), null);
});


test('library, systemGlobalSet', () => {
    const options = {'globals': {}};
    assert.equal(scriptFunctions.systemGlobalSet(['a', 1], options), 1);
    assert.deepEqual(options.globals, {'a': 1});
});


test('library, systemGlobalSet no globals', () => {
    const options = {};
    assert.equal(scriptFunctions.systemGlobalSet(['a', 1], options), 1);
});


test('library, systemGlobalSet no options', () => {
    assert.equal(scriptFunctions.systemGlobalSet(['a', 1], null), 1);
});


test('library, systemLog', () => {
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {logFn, 'debug': true};
    assert.equal(scriptFunctions.systemLog(['Hello'], options), undefined);
    assert.deepEqual(logs, ['Hello']);
});


test('library, systemLog no-debug', () => {
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {logFn, 'debug': false};
    assert.equal(scriptFunctions.systemLog(['Hello'], options), undefined);
    assert.deepEqual(logs, ['Hello']);
});


test('library, systemLog null options', () => {
    assert.equal(scriptFunctions.systemLog(['Hello'], null), undefined);
});


test('library, systemLog no log function', () => {
    assert.equal(scriptFunctions.systemLog(['Hello'], {}), undefined);
});


test('library, systemLogDebug', () => {
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {logFn, 'debug': true};
    assert.equal(scriptFunctions.systemLogDebug(['Hello'], options), undefined);
    assert.deepEqual(logs, ['Hello']);
});


test('library, systemLogDebug no-debug', () => {
    const logs = [];
    /* c8 ignore next 2 */
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {logFn, 'debug': false};
    assert.equal(scriptFunctions.systemLogDebug(['Hello'], options), undefined);
    assert.deepEqual(logs, []);
});


test('library, systemLogDebug null options', () => {
    assert.equal(scriptFunctions.systemLogDebug(['Hello'], null), undefined);
});


test('library, systemLogDebug no log function', () => {
    assert.equal(scriptFunctions.systemLogDebug(['Hello'], {}), undefined);
});


test('library, systemPartial', () => {
    const testFunc = ([name, number], options) => {
        assert.equal(name, 'test');
        assert.equal(number, 1);
        assert.deepEqual(options, {'debug': false});
        return `${name}-${number}`;
    };
    const partialFunc = scriptFunctions.systemPartial([testFunc, 'test'], {'debug': false});
    assert.deepEqual(partialFunc([1], {'debug': false}), 'test-1');
});


test('library, systemType', () => {
    assert.equal(scriptFunctions.systemType([[1, 2, 3]], {}), 'array');
    assert.equal(scriptFunctions.systemType([true], {}), 'boolean');
    assert.equal(scriptFunctions.systemType([new Date()], {}), 'datetime');
    assert.equal(scriptFunctions.systemType([() => null], {}), 'function');
    assert.equal(scriptFunctions.systemType([null], {}), 'null');
    assert.equal(scriptFunctions.systemType([3.14], {}), 'number');
    assert.equal(scriptFunctions.systemType([{}], {}), 'object');
    assert.equal(scriptFunctions.systemType([/^abc$/], {}), 'regex');
    assert.equal(scriptFunctions.systemType(['abc'], {}), 'string');
});


//
// URL functions
//


test('script library, urlEncode', () => {
    assert.equal(
        scriptFunctions.urlEncode(['https://foo.com/this & that'], {}),
        'https://foo.com/this%20&%20that'
    );
    assert.equal(
        scriptFunctions.urlEncode(['https://foo.com/this (& that)'], {}),
        'https://foo.com/this%20(&%20that%29'
    );
});


test('script library, urlEncode no extra', () => {
    assert.equal(
        scriptFunctions.urlEncode(['https://foo.com/this & that', false], {}),
        'https://foo.com/this%20&%20that'
    );
    assert.equal(
        scriptFunctions.urlEncode(['https://foo.com/this (& that)', false], {}),
        'https://foo.com/this%20(&%20that)'
    );
});


test('script library, urlEncodeComponent', () => {
    assert.equal(
        scriptFunctions.urlEncodeComponent(['https://foo.com/this & that'], {}),
        'https%3A%2F%2Ffoo.com%2Fthis%20%26%20that'
    );
    assert.equal(
        scriptFunctions.urlEncodeComponent(['https://foo.com/this (& that)'], {}),
        'https%3A%2F%2Ffoo.com%2Fthis%20(%26%20that%29'
    );
});


test('script library, urlEncodeComponent no extra', () => {
    assert.equal(
        scriptFunctions.urlEncodeComponent(['https://foo.com/this & that', false], {}),
        'https%3A%2F%2Ffoo.com%2Fthis%20%26%20that'
    );
    assert.equal(
        scriptFunctions.urlEncodeComponent(['https://foo.com/this (& that)', false], {}),
        'https%3A%2F%2Ffoo.com%2Fthis%20(%26%20that)'
    );
});
