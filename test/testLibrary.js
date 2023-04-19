// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

import {expressionFunctions, scriptFunctions} from '../lib/library.js';
import test from 'ava';


/* eslint-disable id-length */


// Check the built-in expression functions
test('library, built-in expression functions', (t) => {
    t.deepEqual(
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
            ['encodeURI', true],
            ['encodeURIComponent', true],
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


test('library, arrayCopy', (t) => {
    const array = [1, 2, 3];
    t.deepEqual(scriptFunctions.arrayCopy([array]), [1, 2, 3]);
});


test('library, arrayCopy non-array', (t) => {
    t.is(scriptFunctions.arrayCopy([null]), null);
});


test('library, arrayExtend', (t) => {
    const array = [1, 2, 3];
    const array2 = [4, 5, 6];
    t.deepEqual(scriptFunctions.arrayExtend([array, array2]), [1, 2, 3, 4, 5, 6]);
    t.deepEqual(array, [1, 2, 3, 4, 5, 6]);
});


test('library, arrayExtend non-array', (t) => {
    t.is(scriptFunctions.arrayExtend([null]), null);
});


test('library, arrayGet', (t) => {
    const array = [1, 2, 3];
    t.is(scriptFunctions.arrayGet([array, 0]), 1);
});


test('library, arrayGet invalid index', (t) => {
    const array = [1, 2, 3];
    t.is(scriptFunctions.arrayGet([array, 3]), null);
});


test('library, arrayGet non-array', (t) => {
    t.is(scriptFunctions.arrayGet([null, 0]), null);
});


test('library, arrayIndexOf', (t) => {
    const array = [1, 2, 3];
    t.is(scriptFunctions.arrayIndexOf([array, 2]), 1);
});


test('library, arrayIndexOf non-array', (t) => {
    t.is(scriptFunctions.arrayIndexOf([null, 2]), null);
});


test('library, arrayIndexOf index', (t) => {
    const array = [1, 2, 3, 2];
    t.is(scriptFunctions.arrayIndexOf([array, 2, 2]), 3);
});


test('library, arrayJoin', (t) => {
    const array = [1, 2, 3];
    t.is(scriptFunctions.arrayJoin([array, ', ']), '1, 2, 3');
});


test('library, arrayJoin non-array', (t) => {
    t.is(scriptFunctions.arrayJoin([null, ', ']), null);
});


test('library, arrayLastIndexOf', (t) => {
    const array = [1, 2, 3];
    t.is(scriptFunctions.arrayLastIndexOf([array, 2]), 1);
});


test('library, arrayLastIndexOf non-array', (t) => {
    t.is(scriptFunctions.arrayLastIndexOf([null, 2]), null);
});


test('library, arrayLastIndexOf index', (t) => {
    const array = [1, 2, 3, 2];
    t.is(scriptFunctions.arrayLastIndexOf([array, 2, 2]), 1);
});


test('library, arrayLength', (t) => {
    const array = [1, 2, 3];
    t.is(scriptFunctions.arrayLength([array]), 3);
});


test('library, arrayLength non-array', (t) => {
    t.is(scriptFunctions.arrayLength([null]), null);
});


test('library, arrayNew', (t) => {
    t.deepEqual(scriptFunctions.arrayNew([1, 2, 3]), [1, 2, 3]);
});


test('library, arrayNewSize', (t) => {
    t.deepEqual(scriptFunctions.arrayNewSize([3]), [0, 0, 0]);
});


test('library, arrayNewSize value', (t) => {
    t.deepEqual(scriptFunctions.arrayNewSize([3, 1]), [1, 1, 1]);
});


test('library, arrayPop', (t) => {
    const array = [1, 2, 3];
    t.is(scriptFunctions.arrayPop([array]), 3);
    t.deepEqual(array, [1, 2]);
});


test('library, arrayPop empty', (t) => {
    const array = [];
    t.is(scriptFunctions.arrayPop([array]), null);
    t.deepEqual(array, []);
});


test('library, arrayPop non-array', (t) => {
    t.is(scriptFunctions.arrayPop([null]), null);
});


test('library, arrayPush', (t) => {
    const array = [1, 2, 3];
    t.is(scriptFunctions.arrayPush([array, 5]), 4);
    t.deepEqual(array, [1, 2, 3, 5]);
});


test('library, arrayPush non-array', (t) => {
    t.is(scriptFunctions.arrayPush([null]), null);
});


test('library, arraySet', (t) => {
    const array = [1, 2, 3];
    t.is(scriptFunctions.arraySet([array, 1, 5]), 5);
    t.deepEqual(array, [1, 5, 3]);
});


test('library, arraySet non-array', (t) => {
    t.is(scriptFunctions.arraySet([null, 1, 5]), null);
});


test('library, arraySlice', (t) => {
    const array = [1, 2, 3, 4];
    t.deepEqual(scriptFunctions.arraySlice([array, 1, 3]), [2, 3]);
});


test('library, arraySlice non-array', (t) => {
    t.is(scriptFunctions.arraySlice([null, 1, 3]), null);
});


test('library, arraySort', (t) => {
    const array = [3, 2, 1];
    t.deepEqual(scriptFunctions.arraySort([array]), [1, 2, 3]);
    t.deepEqual(array, [1, 2, 3]);
});


test('library, arraySort non-array', (t) => {
    t.is(scriptFunctions.arraySort([null]), null);
});


test('library, arraySort compare function', (t) => {
    const array = [1, 2, 3];
    const compareFn = ([a, b], options) => {
        t.deepEqual(options, {});

        /* c8 ignore next */
        return a < b ? 1 : (a === b ? 0 : -1);
    };
    t.deepEqual(scriptFunctions.arraySort([array, compareFn], {}), [3, 2, 1]);
    t.deepEqual(array, [3, 2, 1]);
});


//
// Datetime functions
//


test('library, datetimeDay', (t) => {
    t.is(scriptFunctions.datetimeDay([new Date(2022, 5, 21)]), 21);
});


test('library, datetimeDay non-datetime', (t) => {
    t.is(scriptFunctions.datetimeDay([null]), null);
});


test('library, datetimeHour', (t) => {
    t.is(scriptFunctions.datetimeHour([new Date(2022, 5, 21, 7)]), 7);
});


test('library, datetimeHour non-datetime', (t) => {
    t.is(scriptFunctions.datetimeHour([null]), null);
});


test('library, datetimeISOFormat', (t) => {
    t.is(scriptFunctions.datetimeISOFormat([new Date(Date.UTC(2022, 7, 29, 15, 8))]), '2022-08-29T15:08:00.000Z');
    t.is(scriptFunctions.datetimeISOFormat([new Date(Date.UTC(2022, 7, 29, 15, 8)), true]), '2022-08-29');
});


test('library, datetimeMinute', (t) => {
    t.is(scriptFunctions.datetimeMinute([new Date(2022, 5, 21, 7, 15)]), 15);
});


test('library, datetimeMinute non-datetime', (t) => {
    t.is(scriptFunctions.datetimeMinute([null]), null);
});


test('library, datetimeMonth', (t) => {
    t.is(scriptFunctions.datetimeMonth([new Date(2022, 5, 21, 7, 15)]), 6);
});


test('library, datetimeMonth non-datetime', (t) => {
    t.is(scriptFunctions.datetimeMonth([null]), null);
});


test('library, datetimeNew', (t) => {
    t.deepEqual(scriptFunctions.datetimeNew([2022, 6, 21]), new Date(2022, 5, 21));
});


test('library, datetimeNew complete', (t) => {
    t.deepEqual(scriptFunctions.datetimeNew([2022, 6, 21, 12, 30, 15, 100]), new Date(2022, 5, 21, 12, 30, 15, 100));
});


test('library, datetimeNow', (t) => {
    t.true(scriptFunctions.datetimeNow([]) instanceof Date);
});


test('library, datetimeSecond', (t) => {
    t.is(scriptFunctions.datetimeSecond([new Date(2022, 5, 21, 7, 15, 30)]), 30);
});


test('library, datetimeSecond non-datetime', (t) => {
    t.is(scriptFunctions.datetimeSecond([null]), null);
});


test('library, datetimeToday', (t) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    t.deepEqual(scriptFunctions.datetimeToday([]), today);
});


test('library, datetimeYear', (t) => {
    t.is(scriptFunctions.datetimeYear([new Date(2022, 5, 21)]), 2022);
});


test('library, datetimeYear non-datetime', (t) => {
    t.is(scriptFunctions.datetimeYear([null]), null);
});


//
// JSON functions
//


test('library, jsonParse', (t) => {
    t.deepEqual(scriptFunctions.jsonParse(['{"a": 1, "b": 2}'], null), {'a': 1, 'b': 2});
});


test('library, jsonParse error', (t) => {
    t.throws(() => {
        scriptFunctions.jsonParse(['asdf'], null);
    }, {'instanceOf': SyntaxError});
});


test('library, jsonStringify', (t) => {
    t.is(scriptFunctions.jsonStringify([{'b': 2, 'a': 1}]), '{"a":1,"b":2}');
    t.is(scriptFunctions.jsonStringify([{'b': 2, 'a': {'d': 4, 'c': 3}}]), '{"a":{"c":3,"d":4},"b":2}');
    t.is(scriptFunctions.jsonStringify([[{'b': 2, 'a': 1}]]), '[{"a":1,"b":2}]');
    t.is(scriptFunctions.jsonStringify([[3, 2, 1]]), '[3,2,1]');
    t.is(scriptFunctions.jsonStringify([123]), '123');
    t.is(scriptFunctions.jsonStringify(['abc']), '"abc"');
    t.is(scriptFunctions.jsonStringify([null]), 'null');
});


test('library, jsonStringify indent', (t) => {
    t.is(scriptFunctions.jsonStringify([{'a': 1, 'b': 2}, 4]), `\
{
    "a": 1,
    "b": 2
}`);
});


//
// Math functions
//


test('library, mathAbs', (t) => {
    t.is(scriptFunctions.mathAbs([-3]), 3);
});


test('library, mathAcos', (t) => {
    t.is(scriptFunctions.mathAcos([1]), 0);
});


test('library, mathAsin', (t) => {
    t.is(scriptFunctions.mathAsin([0]), 0);
});


test('library, mathAtan', (t) => {
    t.is(scriptFunctions.mathAtan([0]), 0);
});


test('library, mathAtan2', (t) => {
    t.is(scriptFunctions.mathAtan2([0, 1]), 0);
});


test('library, mathCeil', (t) => {
    t.is(scriptFunctions.mathCeil([0.25]), 1);
});


test('library, mathCos', (t) => {
    t.is(scriptFunctions.mathCos([0]), 1);
});


test('library, mathFloor', (t) => {
    t.is(scriptFunctions.mathFloor([1.125]), 1);
});


test('library, mathLn', (t) => {
    t.is(scriptFunctions.mathLn([Math.E]), 1);
});


test('library, mathLog', (t) => {
    t.is(scriptFunctions.mathLog([10]), 1);
});


test('library, mathLog base', (t) => {
    t.is(scriptFunctions.mathLog([8, 2]), 3);
});


test('library, mathMax', (t) => {
    t.is(scriptFunctions.mathMax([1, 2, 3]), 3);
});


test('library, mathMin', (t) => {
    t.is(scriptFunctions.mathMin([1, 2, 3]), 1);
});


test('library, mathPi', (t) => {
    t.is(scriptFunctions.mathPi([]), Math.PI);
});


test('library, mathRandom', (t) => {
    t.is(typeof scriptFunctions.mathRandom([]), 'number');
});


test('library, mathRound', (t) => {
    t.is(scriptFunctions.mathRound([5.125]), 5);
});


test('library, mathRound digits', (t) => {
    t.is(scriptFunctions.mathRound([5.125, 2]), 5.13);
});


test('library, mathSign', (t) => {
    t.is(scriptFunctions.mathSign([5.125]), 1);
});


test('library, mathSin', (t) => {
    t.is(scriptFunctions.mathSin([0]), 0);
});


test('library, mathSqrt', (t) => {
    t.is(scriptFunctions.mathSqrt([4]), 2);
});


test('library, mathTan', (t) => {
    t.is(scriptFunctions.mathTan([0]), 0);
});


//
// Miscellaneous functions
//


test('library, debugLog', (t) => {
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {'logFn': logFn};
    t.is(scriptFunctions.debugLog(['Hello'], options), undefined);
    t.deepEqual(logs, ['Hello']);
});


test('library, debugLog null options', (t) => {
    t.is(scriptFunctions.debugLog(['Hello'], null), undefined);
});


test('library, debugLog no log function', (t) => {
    t.is(scriptFunctions.debugLog(['Hello'], {}), undefined);
});


test('script library, encodeURI', (t) => {
    t.is(
        scriptFunctions.encodeURI(['https://foo.com/this & that'], {}),
        'https://foo.com/this%20&%20that'
    );
    t.is(
        scriptFunctions.encodeURI(['https://foo.com/this (& that)'], {}),
        'https://foo.com/this%20(&%20that%29'
    );
});


test('script library, encodeURI no extra', (t) => {
    t.is(
        scriptFunctions.encodeURI(['https://foo.com/this & that', false], {}),
        'https://foo.com/this%20&%20that'
    );
    t.is(
        scriptFunctions.encodeURI(['https://foo.com/this (& that)', false], {}),
        'https://foo.com/this%20(&%20that)'
    );
});


test('script library, encodeURIComponent', (t) => {
    t.is(
        scriptFunctions.encodeURIComponent(['https://foo.com/this & that'], {}),
        'https%3A%2F%2Ffoo.com%2Fthis%20%26%20that'
    );
    t.is(
        scriptFunctions.encodeURIComponent(['https://foo.com/this (& that)'], {}),
        'https%3A%2F%2Ffoo.com%2Fthis%20(%26%20that%29'
    );
});


test('script library, encodeURIComponent no extra', (t) => {
    t.is(
        scriptFunctions.encodeURIComponent(['https://foo.com/this & that', false], {}),
        'https%3A%2F%2Ffoo.com%2Fthis%20%26%20that'
    );
    t.is(
        scriptFunctions.encodeURIComponent(['https://foo.com/this (& that)', false], {}),
        'https%3A%2F%2Ffoo.com%2Fthis%20(%26%20that)'
    );
});


test('library, getGlobal', (t) => {
    const options = {'globals': {'a': 1}};
    t.is(scriptFunctions.getGlobal(['a'], options), 1);
});


test('library, getGlobal unknown', (t) => {
    const options = {'globals': {}};
    t.is(scriptFunctions.getGlobal(['a'], options), null);
});


test('library, getGlobal no globals', (t) => {
    const options = {};
    t.is(scriptFunctions.getGlobal(['a'], options), null);
});


test('library, getGlobal no options', (t) => {
    t.is(scriptFunctions.getGlobal(['a'], null), null);
});


test('library, fetch', async (t) => {
    const jsonObject = {'a': 1, 'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        t.is(url, 'test.json');
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (jsonObject)
        };
    };
    const options = {fetchFn};
    t.deepEqual(await scriptFunctions.fetch(['test.json'], options), jsonObject);
});


test('library, fetch options', async (t) => {
    const jsonObject = {'a': 1, 'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url, fetchFnOptions) => {
        t.is(url, 'test.json');
        t.is(fetchFnOptions, fetchOptions);
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (jsonObject)
        };
    };
    const options = {fetchFn};
    const fetchOptions = {'method': 'POST'};
    t.deepEqual(await scriptFunctions.fetch(['test.json', fetchOptions], options), jsonObject);
});


test('library, fetch text', async (t) => {
    const text = 'asdf';
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        t.is(url, 'test.txt');
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'text': async () => text
        };
    };
    const options = {fetchFn};
    t.is(await scriptFunctions.fetch(['test.txt', null, true], options), text);
});


test('library, fetch array', async (t) => {
    const jsonObject = {'a': 1};
    const jsonObject2 = {'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        t.true(url === 'test.json' || url === 'test2.json');
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (url === 'test.json' ? jsonObject : jsonObject2)
        };
    };
    const options = {fetchFn};
    t.deepEqual(await scriptFunctions.fetch([['test.json', 'test2.json']], options), [jsonObject, jsonObject2]);
});


test('library, fetch array options', async (t) => {
    const jsonObject = {'a': 1};
    const jsonObject2 = {'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url, fetchFnOptions) => {
        t.true(url === 'test.json' || url === 'test2.json');
        t.is(fetchFnOptions, fetchOptions);
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (url === 'test.json' ? jsonObject : jsonObject2)
        };
    };
    const options = {fetchFn};
    const fetchOptions = {'method': 'POST'};
    t.deepEqual(await scriptFunctions.fetch([['test.json', 'test2.json'], fetchOptions], options), [jsonObject, jsonObject2]);
});


test('library, fetch urlFn', async (t) => {
    const jsonObject = {'a': 1, 'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        t.is(url, 'urlFn-test.json');
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (jsonObject)
        };
    };
    const urlFn = (url) => `urlFn-${url}`;
    const options = {fetchFn, urlFn};
    t.deepEqual(await scriptFunctions.fetch(['test.json'], options), jsonObject);
});


test('library, fetch array urlFn', async (t) => {
    const jsonObject = {'a': 1};
    const jsonObject2 = {'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        t.true(url === 'urlFn-test.json' || url === 'urlFn-test2.json');
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (url === 'urlFn-test.json' ? jsonObject : jsonObject2)
        };
    };
    const urlFn = (url) => `urlFn-${url}`;
    const options = {fetchFn, urlFn};
    t.deepEqual(await scriptFunctions.fetch([['test.json', 'test2.json']], options), [jsonObject, jsonObject2]);
});


test('library, fetch null ExecuteScriptOptions', async (t) => {
    t.is(await scriptFunctions.fetch(['test.json'], null), null);
});


test('library, fetch null options log', async (t) => {
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {'logFn': logFn};
    t.is(await scriptFunctions.fetch(['test.json'], options), null);
    t.deepEqual(logs, ['CalcScript: Function "fetch" failed for JSON resource "test.json"']);
});


test('library, fetch null array options log', async (t) => {
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {'logFn': logFn};
    t.deepEqual(await scriptFunctions.fetch([['test.json', 'test2.json']], options), [null, null]);
    t.deepEqual(logs, [
        'CalcScript: Function "fetch" failed for JSON resource "test.json"',
        'CalcScript: Function "fetch" failed for JSON resource "test2.json"'
    ]);
});


test('library, fetch options no fetchFn', async (t) => {
    t.is(await scriptFunctions.fetch(['test.json'], {}), null);
});


test('library, fetch array null ExecuteScriptOptions', async (t) => {
    t.deepEqual(await scriptFunctions.fetch([['test.json', 'test2.json']], null), [null, null]);
});


test('library, fetch response not-ok', async (t) => {
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        t.is(url, 'test.json');
        return {'ok': false, 'statusText': 'Not Found'};
    };
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {fetchFn, logFn};
    t.is(await scriptFunctions.fetch(['test.json'], options), null);
    t.deepEqual(logs, ['CalcScript: Function "fetch" failed for JSON resource "test.json"']);
});


test('library, fetch response json error', async (t) => {
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        t.is(url, 'test.json');
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
    const options = {fetchFn, logFn};
    t.is(await scriptFunctions.fetch(['test.json'], options), null);
    t.deepEqual(logs, ['CalcScript: Function "fetch" failed for JSON resource "test.json"']);
});


test('library, fetch text response not-ok', async (t) => {
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        t.is(url, 'test.txt');
        return {'ok': false, 'statusText': 'Not Found'};
    };
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {fetchFn, logFn};
    t.is(await scriptFunctions.fetch(['test.txt', null, true], options), null);
    t.deepEqual(logs, ['CalcScript: Function "fetch" failed for text resource "test.txt"']);
});


test('library, fetch response text error', async (t) => {
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        t.is(url, 'test.txt');
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
    const options = {fetchFn, logFn};
    t.is(await scriptFunctions.fetch(['test.txt', null, true], options), null);
    t.deepEqual(logs, ['CalcScript: Function "fetch" failed for text resource "test.txt"']);
});


test('library, fetch response error', async (t) => {
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        t.is(url, 'test.txt');
        throw new Error('fetch failed');
    };
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {fetchFn, logFn};
    t.is(await scriptFunctions.fetch(['test.txt', null, true], options), null);
    t.deepEqual(logs, ['CalcScript: Function "fetch" failed for text resource "test.txt"']);
});


test('library, fetch array response error', async (t) => {
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        if (url === 'test.txt') {
            throw new Error('fetch failed');
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
    const options = {fetchFn, logFn};
    t.deepEqual(
        await scriptFunctions.fetch([['test.txt', 'test2.txt']], options),
        [null, {'foo': 'bar'}]
    );
    t.deepEqual(logs, ['CalcScript: Function "fetch" failed for JSON resource "test.txt"']);
});


test('library, setGlobal', (t) => {
    const options = {'globals': {}};
    t.is(scriptFunctions.setGlobal(['a', 1], options), 1);
    t.deepEqual(options.globals, {'a': 1});
});


test('library, setGlobal no globals', (t) => {
    const options = {};
    t.is(scriptFunctions.setGlobal(['a', 1], options), 1);
});


test('library, setGlobal no options', (t) => {
    t.is(scriptFunctions.setGlobal(['a', 1], null), 1);
});


//
// Number functions
//


test('library, numberToFixed', (t) => {
    t.is(scriptFunctions.numberToFixed([1.125, 1]), '1.1');
    t.is(scriptFunctions.numberToFixed([1, 1]), '1.0');
});


test('library, numberToFixed trim', (t) => {
    t.is(scriptFunctions.numberToFixed([1.125, 1, true]), '1.1');
    t.is(scriptFunctions.numberToFixed([1, 1, true]), '1');
});


test('library, numberToFixed non-number', (t) => {
    t.is(scriptFunctions.numberToFixed([null, 1]), null);
});


test('library, numberToFixed default digits', (t) => {
    t.is(scriptFunctions.numberToFixed([1.125]), '1.13');
});


test('library, numberParseInt', (t) => {
    t.is(scriptFunctions.numberParseInt(['123']), 123);
});


test('library, numberParseInt radix', (t) => {
    t.is(scriptFunctions.numberParseInt(['10', 2]), 2);
});


test('library, numberParseFloat', (t) => {
    t.is(scriptFunctions.numberParseFloat(['123.45']), 123.45);
});


//
// Object functions
//


test('library, objectAssign', (t) => {
    const obj = {'a': 1, 'b': 2};
    const obj2 = {'b': 3, 'c': 4};
    t.deepEqual(scriptFunctions.objectAssign([obj, obj2]), {'a': 1, 'b': 3, 'c': 4});
    t.deepEqual(obj, {'a': 1, 'b': 3, 'c': 4});
});


test('library, objectAssign null', (t) => {
    const obj = {'a': 1, 'b': 2};
    t.is(scriptFunctions.objectAssign([obj, null]), null);
    t.deepEqual(obj, {'a': 1, 'b': 2});
    t.is(scriptFunctions.objectAssign([null, obj]), null);
    t.deepEqual(obj, {'a': 1, 'b': 2});
});


test('library, objectAssign non-object', (t) => {
    const obj = {'a': 1, 'b': 2};
    t.is(scriptFunctions.objectAssign([obj, 0]), null);
    t.deepEqual(obj, {'a': 1, 'b': 2});
    t.is(scriptFunctions.objectAssign([0, obj]), null);
    t.deepEqual(obj, {'a': 1, 'b': 2});
});


test('library, objectAssign array', (t) => {
    const obj = {'a': 1, 'b': 2};
    const array = ['c', 'd'];
    t.is(scriptFunctions.objectAssign([obj, array]), null);
    t.deepEqual(obj, {'a': 1, 'b': 2});
    t.is(scriptFunctions.objectAssign([array, obj]), null);
    t.deepEqual(obj, {'a': 1, 'b': 2});
});


test('library, objectCopy', (t) => {
    const obj = {'a': 1, 'b': 2};
    t.deepEqual(scriptFunctions.objectCopy([obj]), obj);
});


test('library, objectCopy null', (t) => {
    t.is(scriptFunctions.objectCopy([null]), null);
});


test('library, objectCopy non-object', (t) => {
    t.is(scriptFunctions.objectCopy([0]), null);
});


test('library, objectCopy array', (t) => {
    t.is(scriptFunctions.objectCopy([['a', 'b']]), null);
});


test('library, objectDelete', (t) => {
    const obj = {'a': 1, 'b': 2};
    t.is(scriptFunctions.objectDelete([obj, 'a']), undefined);
    t.deepEqual(obj, {'b': 2});
});


test('library, objectDelete missing', (t) => {
    const obj = {'b': 2};
    t.is(scriptFunctions.objectDelete([obj, 'a']), undefined);
    t.deepEqual(obj, {'b': 2});
});


test('library, objectDelete null', (t) => {
    t.is(scriptFunctions.objectDelete([null, 'a']), undefined);
});


test('library, objectDelete non-object', (t) => {
    t.is(scriptFunctions.objectDelete([0, 'a']), undefined);
});


test('library, objectDelete array', (t) => {
    t.is(scriptFunctions.objectDelete([['a', 'b'], 'a']), undefined);
});


test('library, objectGet', (t) => {
    const obj = {'a': 1, 'b': 2};
    t.is(scriptFunctions.objectGet([obj, 'a']), 1);
});


test('library, objectGet default', (t) => {
    const obj = {};
    t.is(scriptFunctions.objectGet([obj, 'a']), null);
    t.is(scriptFunctions.objectGet([obj, 'a', 1]), 1);
});


test('library, objectGet missing', (t) => {
    const obj = {'a': 1, 'b': 2};
    t.is(scriptFunctions.objectGet([obj, 'c']), null);
});


test('library, objectGet null', (t) => {
    t.is(scriptFunctions.objectGet([null, 'a']), null);
});


test('library, objectGet non-object', (t) => {
    t.is(scriptFunctions.objectGet([0, 'a']), null);
});


test('library, objectGet array', (t) => {
    t.is(scriptFunctions.objectGet([['a', 'b'], 'a']), null);
});


test('library, objectHas', (t) => {
    const obj = {'a': 1, 'b': null, 'c': undefined};
    t.is(scriptFunctions.objectHas([obj, 'a']), true);
    t.is(scriptFunctions.objectHas([obj, 'b']), true);
    t.is(scriptFunctions.objectHas([obj, 'c']), true);
    t.is(scriptFunctions.objectHas([obj, 'd']), false);
});


test('library, objectHas null', (t) => {
    t.is(scriptFunctions.objectHas([null, 'a']), false);
});


test('library, objectHas non-object', (t) => {
    t.is(scriptFunctions.objectHas([0, 'a']), false);
});


test('library, objectHas array', (t) => {
    t.is(scriptFunctions.objectHas([['a', 'b'], 'a']), false);
});


test('library, objectKeys', (t) => {
    const obj = {'a': 1, 'b': 2};
    t.deepEqual(scriptFunctions.objectKeys([obj]), ['a', 'b']);
});


test('library, objectKeys null', (t) => {
    t.is(scriptFunctions.objectKeys([null]), null);
});


test('library, objectKeys non-object', (t) => {
    t.is(scriptFunctions.objectKeys([0]), null);
});


test('library, objectKeys array', (t) => {
    t.is(scriptFunctions.objectKeys([['a', 'b']]), null);
});


test('library, objectNew', (t) => {
    t.deepEqual(scriptFunctions.objectNew([]), {});
});


test('library, objectNew key/values', (t) => {
    t.deepEqual(scriptFunctions.objectNew(['a', 1, 'b', 2]), {'a': 1, 'b': 2});
});


test('library, objectNew odd', (t) => {
    t.deepEqual(scriptFunctions.objectNew(['a', 1, 'b']), {'a': 1, 'b': null});
});


test('library, objectSet missing', (t) => {
    const obj = {'a': 1, 'b': 2};
    t.is(scriptFunctions.objectSet([obj, 'c', 3]), 3);
    t.deepEqual(obj, {'a': 1, 'b': 2, 'c': 3});
});


test('library, objectSet null', (t) => {
    t.is(scriptFunctions.objectSet([null, 'c', 3]), null);
});


test('library, objectSet non-object', (t) => {
    t.is(scriptFunctions.objectSet([0, 'c', 3]), null);
});


test('library, objectSet array', (t) => {
    const array = ['a', 'b'];
    t.is(scriptFunctions.objectSet([array, 'c', 3]), null);
    t.deepEqual(array, ['a', 'b']);
});


//
// Regex functions
//


test('library, regexEscape', (t) => {
    t.is(scriptFunctions.regexEscape(['a*b']), 'a\\*b');
});


test('library, regexEscape non-string', (t) => {
    t.is(scriptFunctions.regexEscape([null]), null);
});


test('library, regexMatch', (t) => {
    t.is(scriptFunctions.regexMatch([/foo/, 'foo bar'])[0], 'foo');
});


test('library, regexMatch non-string', (t) => {
    t.is(scriptFunctions.regexMatch([/foo/, null]), null);
});


test('library, regexMatchAll', (t) => {
    t.deepEqual(scriptFunctions.regexMatchAll([/foo/g, 'foo foo bar']).map((m) => m[0]), ['foo', 'foo']);
});


test('library, regexMatchAll no matches', (t) => {
    t.deepEqual(scriptFunctions.regexMatchAll([/foo/g, 'boo boo bar']).map((m) => m[0]), []);
});


test('library, regexMatchAll non-string', (t) => {
    t.is(scriptFunctions.regexMatchAll([/foo/g, null]), null);
});


test('library, regexNew', (t) => {
    t.true(scriptFunctions.regexNew(['a*b']) instanceof RegExp);
});


test('library, regexNew flags', (t) => {
    const regex = scriptFunctions.regexNew(['a*b', 'g']);
    t.true(regex instanceof RegExp);
    t.is(regex.flags, 'g');
});


test('library, regexTest', (t) => {
    t.true(scriptFunctions.regexTest([/a*b/, 'caaabc']));
});


test('library, regexTest non-regexp', (t) => {
    t.is(scriptFunctions.regexTest([null, 'caaabc']), null);
});


//
// Schema functions
//


test('script library, schemaParse', (t) => {
    t.deepEqual(
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


test('script library, schemaParseEx', (t) => {
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
    t.is(types, types2);
    t.deepEqual(types2, {
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


test('script library, schemaTypeModel', (t) => {
    t.true('Types' in scriptFunctions.schemaTypeModel([], {}));
});

test('script library, schemaValidate', (t) => {
    const types = scriptFunctions.schemaParse(['# My struct', 'struct MyStruct', '', '  # An integer\n  int a'], {});
    t.deepEqual(scriptFunctions.schemaValidate([types, 'MyStruct', {'a': 5}], {}), {'a': 5});
});


test('script library, schemaValidateTypeModel', (t) => {
    const typeModel = scriptFunctions.schemaTypeModel([], {});
    t.deepEqual(scriptFunctions.schemaValidateTypeModel([typeModel], {}), typeModel);
});


//
// String functions
//


test('library, stringCharCodeAt', (t) => {
    t.is(scriptFunctions.stringCharCodeAt(['A', 0]), 65);
});


test('library, stringCharCodeAt non-string', (t) => {
    t.is(scriptFunctions.stringCharCodeAt([null, 0]), null);
});


test('library, stringEndsWith', (t) => {
    t.true(scriptFunctions.stringEndsWith(['foo bar', 'bar']));
});


test('library, stringEndsWith non-string', (t) => {
    t.is(scriptFunctions.stringEndsWith([null, 'bar']), null);
});


test('library, stringIndexOf', (t) => {
    t.is(scriptFunctions.stringIndexOf(['foo bar', 'bar']), 4);
});


test('library, stringIndexOf non-string', (t) => {
    t.is(scriptFunctions.stringIndexOf([null, 'bar']), null);
});


test('library, stringIndexOf position', (t) => {
    t.is(scriptFunctions.stringIndexOf(['foo bar bar', 'bar', 5]), 8);
});


test('library, stringFromCharCode', (t) => {
    t.is(scriptFunctions.stringFromCharCode([65, 66, 67]), 'ABC');
});


test('library, stringLastIndexOf', (t) => {
    t.is(scriptFunctions.stringLastIndexOf(['foo bar bar', 'bar']), 8);
});


test('library, stringLastIndexOf non-string', (t) => {
    t.is(scriptFunctions.stringLastIndexOf([null, 'bar']), null);
});


test('library, stringLength', (t) => {
    t.is(scriptFunctions.stringLength(['foo']), 3);
});


test('library, stringLength non-string', (t) => {
    t.is(scriptFunctions.stringLength([null]), null);
});


test('library, stringLower', (t) => {
    t.is(scriptFunctions.stringLower(['Foo']), 'foo');
});


test('library, stringLower non-string', (t) => {
    t.is(scriptFunctions.stringLower([null]), null);
});


test('library, stringNew', (t) => {
    t.is(scriptFunctions.stringNew([123]), '123');
});


test('library, stringRepeat', (t) => {
    t.is(scriptFunctions.stringRepeat(['*', 3]), '***');
});


test('library, stringRepeat non-string', (t) => {
    t.is(scriptFunctions.stringRepeat([null, 3]), null);
});


test('library, stringReplace', (t) => {
    t.is(scriptFunctions.stringReplace(['foo bar', 'bar', 'bonk']), 'foo bonk');
});


test('library, stringReplace non-string', (t) => {
    t.is(scriptFunctions.stringReplace([null, 'bar', 'bonk']), null);
});


test('library, stringReplace regex', (t) => {
    t.is(scriptFunctions.stringReplace(['foo bar', /\s+bar/g, ' bonk']), 'foo bonk');
});


test('library, stringReplace regex replacer function', (t) => {
    const replacerFunction = (args, options) => {
        t.deepEqual(args, [' bar', 3, 'foo bar']);
        t.deepEqual(options, {});
        return ' bonk';
    };
    t.is(scriptFunctions.stringReplace(['foo bar', /\s+bar/g, replacerFunction], {}), 'foo bonk');
});


test('library, stringReplace replacer function', (t) => {
    const replacerFunction = (args, options) => {
        t.deepEqual(args, ['bar', 4, 'foo bar']);
        t.deepEqual(options, {});
        return 'bonk';
    };
    t.is(scriptFunctions.stringReplace(['foo bar', 'bar', replacerFunction], {}), 'foo bonk');
});


test('library, stringSlice', (t) => {
    t.is(scriptFunctions.stringSlice(['foo bar', 1, 5]), 'oo b');
});


test('library, stringSlice non-string', (t) => {
    t.is(scriptFunctions.stringSlice([null, 1, 5]), null);
});


test('library, stringSplit', (t) => {
    t.deepEqual(scriptFunctions.stringSplit(['foo, bar', ', ']), ['foo', 'bar']);
});


test('library, stringSplit non-string', (t) => {
    t.is(scriptFunctions.stringSplit([null, ', ']), null);
});


test('library, stringSplit regex', (t) => {
    t.deepEqual(scriptFunctions.stringSplit(['foo, bar', /,\s*/]), ['foo', 'bar']);
});


test('library, stringSplit limit', (t) => {
    t.deepEqual(scriptFunctions.stringSplit(['foo, bar, bonk', /,\s*/, 2]), ['foo', 'bar']);
});


test('library, stringStartsWith', (t) => {
    t.true(scriptFunctions.stringStartsWith(['foo bar', 'foo']));
});


test('library, stringStartsWith non-string', (t) => {
    t.is(scriptFunctions.stringStartsWith([null, 'foo']), null);
});


test('library, stringTrim', (t) => {
    t.is(scriptFunctions.stringTrim([' abc ']), 'abc');
});


test('library, stringTrim non-string', (t) => {
    t.is(scriptFunctions.stringTrim([null]), null);
});


test('library, stringUpper', (t) => {
    t.is(scriptFunctions.stringUpper(['Foo']), 'FOO');
});


test('library, stringUpper non-string', (t) => {
    t.is(scriptFunctions.stringUpper([null]), null);
});
