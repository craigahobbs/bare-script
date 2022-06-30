// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

/* eslint-disable id-length */

import {expressionFunctions, scriptFunctions} from '../lib/library.js';
import test from 'ava';


//
// Expression functions
//


test('library, abs', (t) => {
    t.is(expressionFunctions.abs([-3]), 3);
});


test('library, acos', (t) => {
    t.is(expressionFunctions.acos([1]), 0);
});


test('library, asin', (t) => {
    t.is(expressionFunctions.asin([0]), 0);
});


test('library, atan', (t) => {
    t.is(expressionFunctions.atan([0]), 0);
});


test('library, atan2', (t) => {
    t.is(expressionFunctions.atan2([0, 1]), 0);
});


test('library, ceil', (t) => {
    t.is(expressionFunctions.ceil([0.25]), 1);
});


test('library, charCodeAt', (t) => {
    t.is(expressionFunctions.charCodeAt(['A', 0]), 65);
});


test('library, charCodeAt non-string', (t) => {
    t.is(expressionFunctions.charCodeAt([null, 0]), null);
});


test('library, cos', (t) => {
    t.is(expressionFunctions.cos([0]), 1);
});


test('library, date', (t) => {
    t.deepEqual(expressionFunctions.date([2022, 6, 21]), new Date(2022, 5, 21));
});


test('library, day', (t) => {
    t.is(expressionFunctions.day([new Date(2022, 5, 21)]), 21);
});


test('library, day non-datetime', (t) => {
    t.is(expressionFunctions.day([null]), null);
});


test('library, encodeURIComponent', (t) => {
    t.is(expressionFunctions.encodeURIComponent(['foo bar']), 'foo%20bar');
});


test('library, endsWith', (t) => {
    t.is(expressionFunctions.endsWith(['foo bar', 'bar']), true);
});


test('library, endsWith non-string', (t) => {
    t.is(expressionFunctions.endsWith([null, 'bar']), null);
});


test('library, indexOf', (t) => {
    t.is(expressionFunctions.indexOf(['foo bar', 'bar']), 4);
});


test('library, indexOf non-string', (t) => {
    t.is(expressionFunctions.indexOf([null, 'bar']), null);
});


test('library, indexOf position', (t) => {
    t.is(expressionFunctions.indexOf(['foo bar bar', 'bar', 5]), 8);
});


test('library, fixed', (t) => {
    t.is(expressionFunctions.fixed([1.125, 1]), '1.1');
});


test('library, fixed non-number', (t) => {
    t.is(expressionFunctions.fixed([null, 1]), null);
});


test('library, fixed default digits', (t) => {
    t.is(expressionFunctions.fixed([1.125]), '1.13');
});


test('library, floor', (t) => {
    t.is(expressionFunctions.floor([1.125]), 1);
});


test('library, fromCharCode', (t) => {
    t.is(expressionFunctions.fromCharCode([65, 66, 67]), 'ABC');
});


test('library, hour', (t) => {
    t.is(expressionFunctions.hour([new Date(2022, 5, 21, 7)]), 7);
});


test('library, hour non-datetime', (t) => {
    t.is(expressionFunctions.hour([null]), null);
});


test('library, lastIndexOf', (t) => {
    t.is(expressionFunctions.lastIndexOf(['foo bar bar', 'bar']), 8);
});


test('library, lastIndexOf non-string', (t) => {
    t.is(expressionFunctions.lastIndexOf([null, 'bar']), null);
});


test('library, len', (t) => {
    t.is(expressionFunctions.len(['foo']), 3);
});


test('library, len non-string', (t) => {
    t.is(expressionFunctions.len([null]), null);
});


test('library, lower', (t) => {
    t.is(expressionFunctions.lower(['Foo']), 'foo');
});


test('library, lower non-string', (t) => {
    t.is(expressionFunctions.lower([null]), null);
});


test('library, ln', (t) => {
    t.is(expressionFunctions.ln([Math.E]), 1);
});


test('library, log', (t) => {
    t.is(expressionFunctions.log([10]), 1);
});


test('library, log base', (t) => {
    t.is(expressionFunctions.log([8, 2]), 3);
});


test('library, max', (t) => {
    t.is(expressionFunctions.max([1, 2, 3]), 3);
});


test('library, min', (t) => {
    t.is(expressionFunctions.min([1, 2, 3]), 1);
});


test('library, minute', (t) => {
    t.is(expressionFunctions.minute([new Date(2022, 5, 21, 7, 15)]), 15);
});


test('library, minute non-datetime', (t) => {
    t.is(expressionFunctions.minute([null]), null);
});


test('library, month', (t) => {
    t.is(expressionFunctions.month([new Date(2022, 5, 21, 7, 15)]), 6);
});


test('library, month non-datetime', (t) => {
    t.is(expressionFunctions.month([null]), null);
});


test('library, now', (t) => {
    t.is(expressionFunctions.now([]) instanceof Date, true);
});


test('library, parseInt', (t) => {
    t.is(expressionFunctions.parseInt(['123']), 123);
});


test('library, parseInt radix', (t) => {
    t.is(expressionFunctions.parseInt(['10', 2]), 2);
});


test('library, parseFloat', (t) => {
    t.is(expressionFunctions.parseFloat(['123.45']), 123.45);
});


test('library, pi', (t) => {
    t.is(expressionFunctions.pi([]), Math.PI);
});


test('library, rand', (t) => {
    t.is(typeof expressionFunctions.rand([]), 'number');
});


test('library, replace', (t) => {
    t.is(expressionFunctions.replace(['foo bar', 'bar', 'bonk']), 'foo bonk');
});


test('library, replace non-string', (t) => {
    t.is(expressionFunctions.replace([null, 'bar', 'bonk']), null);
});


test('library, replace regex', (t) => {
    t.is(expressionFunctions.replace(['foo bar', /\s+bar/g, ' bonk']), 'foo bonk');
});


test('library, replace regex replacer function', (t) => {
    const replacerFunction = (args, options) => {
        t.deepEqual(args, [' bar', 3, 'foo bar']);
        t.deepEqual(options, {});
        return ' bonk';
    };
    t.is(expressionFunctions.replace(['foo bar', /\s+bar/g, replacerFunction], {}), 'foo bonk');
});


test('library, replace replacer function', (t) => {
    const replacerFunction = (args, options) => {
        t.deepEqual(args, ['bar', 4, 'foo bar']);
        t.deepEqual(options, {});
        return 'bonk';
    };
    t.is(expressionFunctions.replace(['foo bar', 'bar', replacerFunction], {}), 'foo bonk');
});


test('library, rept', (t) => {
    t.is(expressionFunctions.rept(['*', 3]), '***');
});


test('library, rept non-string', (t) => {
    t.is(expressionFunctions.rept([null, 3]), null);
});


test('library, round', (t) => {
    t.is(expressionFunctions.round([5.125]), 5);
});


test('library, round digits', (t) => {
    t.is(expressionFunctions.round([5.125, 2]), 5.13);
});


test('library, second', (t) => {
    t.is(expressionFunctions.second([new Date(2022, 5, 21, 7, 15, 30)]), 30);
});


test('library, second non-datetime', (t) => {
    t.is(expressionFunctions.second([null]), null);
});


test('library, sign', (t) => {
    t.is(expressionFunctions.sign([5.125]), 1);
});


test('library, sin', (t) => {
    t.is(expressionFunctions.sin([0]), 0);
});


test('library, slice', (t) => {
    t.is(expressionFunctions.slice(['foo bar', 1, 5]), 'oo b');
});


test('library, slice non-string', (t) => {
    t.is(expressionFunctions.slice([null, 1, 5]), null);
});


test('library, sqrt', (t) => {
    t.is(expressionFunctions.sqrt([4]), 2);
});


test('library, startsWith', (t) => {
    t.is(expressionFunctions.startsWith(['foo bar', 'foo']), true);
});


test('library, startsWith non-string', (t) => {
    t.is(expressionFunctions.startsWith([null, 'foo']), null);
});


test('library, text', (t) => {
    t.is(expressionFunctions.text([123]), '123');
});


test('library, tan', (t) => {
    t.is(expressionFunctions.tan([0]), 0);
});


test('library, today', (t) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    t.deepEqual(expressionFunctions.today([]), today);
});


test('library, trim', (t) => {
    t.is(expressionFunctions.trim([' abc ']), 'abc');
});


test('library, trim non-string', (t) => {
    t.is(expressionFunctions.trim([null]), null);
});


test('library, typeof', (t) => {
    t.is(expressionFunctions.typeof(['abc']), 'string');
});


test('library, upper', (t) => {
    t.is(expressionFunctions.upper(['Foo']), 'FOO');
});


test('library, upper non-string', (t) => {
    t.is(expressionFunctions.upper([null]), null);
});


test('library, year', (t) => {
    t.is(expressionFunctions.year([new Date(2022, 5, 21)]), 2022);
});


test('library, year non-datetime', (t) => {
    t.is(expressionFunctions.year([null]), null);
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


test('library, arrayPop non-array', (t) => {
    t.is(scriptFunctions.arrayPop([null]), null);
});


test('library, arrayPush', (t) => {
    const array = [1, 2, 3];
    t.is(scriptFunctions.arrayPush([array, 4]), 4);
    t.deepEqual(array, [1, 2, 3, 4]);
});


test('library, arrayPush non-array', (t) => {
    t.is(scriptFunctions.arrayPush([null]), null);
});


test('library, arraySet', (t) => {
    const array = [1, 2, 3];
    t.is(typeof scriptFunctions.arraySet([array, 1, 5]), 'undefined');
    t.deepEqual(array, [1, 5, 3]);
});


test('library, arraySet non-array', (t) => {
    t.is(typeof scriptFunctions.arraySet([null, 1, 5]), 'undefined');
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
        return a < b ? 1 : (a === b ? 0 : -1);
    };
    t.deepEqual(scriptFunctions.arraySort([array, compareFn], {}), [3, 2, 1]);
    t.deepEqual(array, [3, 2, 1]);
});


//
// Debug functions
//


test('library, debugLog', (t) => {
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {'logFn': logFn};
    t.is(typeof scriptFunctions.debugLog(['Hello'], options), 'undefined');
    t.deepEqual(logs, ['Hello']);
});


test('library, debugLog null options', (t) => {
    t.is(typeof scriptFunctions.debugLog(['Hello'], null), 'undefined');
});


test('library, debugLog no log function', (t) => {
    t.is(typeof scriptFunctions.debugLog(['Hello'], {}), 'undefined');
});


//
// fetch
//


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
    t.deepEqual(await scriptFunctions.fetch(['test.txt', null, true], options), text);
});


test('library, fetch array', async (t) => {
    const jsonObject = {'a': 1};
    const jsonObject2 = {'b': 2};
    // eslint-disable-next-line require-await
    const fetchFn = async (url) => {
        t.is(url === 'test.json' || url === 'test2.json', true);
        return {
            'ok': true,
            // eslint-disable-next-line require-await
            'json': async () => (url === 'test.json' ? jsonObject : jsonObject2)
        };
    };
    const options = {fetchFn};
    t.deepEqual(await scriptFunctions.fetch([['test.json', 'test2.json']], options), [jsonObject, jsonObject2]);
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
        t.is(url === 'urlFn-test.json' || url === 'urlFn-test2.json', true);
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


test('library, fetch null options', async (t) => {
    t.is(await scriptFunctions.fetch(['test.json'], null), null);
});


test('library, fetch null options log', async (t) => {
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {'logFn': logFn};
    t.is(await scriptFunctions.fetch(['test.json'], options), null);
    t.deepEqual(logs, ['Error: fetch failed for JSON resource "test.json"']);
});


test('library, fetch options no fetchFn', async (t) => {
    t.is(await scriptFunctions.fetch(['test.json'], {}), null);
});


test('library, fetch array null options', async (t) => {
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
    t.deepEqual(await scriptFunctions.fetch(['test.json'], options), null);
    t.deepEqual(logs, ['Error: fetch failed for JSON resource "test.json" with error: Not Found']);
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
    t.deepEqual(await scriptFunctions.fetch(['test.json'], options), null);
    t.deepEqual(logs, ['Error: fetch failed for JSON resource "test.json" with error: invalid json']);
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
    t.deepEqual(await scriptFunctions.fetch(['test.txt', null, true], options), null);
    t.deepEqual(logs, ['Error: fetch failed for text resource "test.txt" with error: Not Found']);
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
    t.deepEqual(await scriptFunctions.fetch(['test.txt', null, true], options), null);
    t.deepEqual(logs, ['Error: fetch failed for text resource "test.txt" with error: invalid text']);
});


//
// JSON functions
//


test('library, jsonParse', (t) => {
    t.deepEqual(scriptFunctions.jsonParse(['{"a": 1, "b": 2}'], null), {'a': 1, 'b': 2});
});


test('library, jsonParse error', (t) => {
    t.is(scriptFunctions.jsonParse(['asdf'], null), null);
});


test('library, jsonParse error log', (t) => {
    const logs = [];
    const logFn = (string) => {
        logs.push(string);
    };
    const options = {'logFn': logFn};
    t.is(scriptFunctions.jsonParse(['asdf'], options), null);
    t.deepEqual(logs, ['Error: jsonParse failed with error: Unexpected token a in JSON at position 0']);
});


test('library, jsonStringify', (t) => {
    t.is(scriptFunctions.jsonStringify([{'a': 1, 'b': 2}]), '{"a":1,"b":2}');
});


test('library, jsonStringify indent', (t) => {
    t.is(scriptFunctions.jsonStringify([{'a': 1, 'b': 2}, 4]), `\
{
    "a": 1,
    "b": 2
}`);
});


//
// Object functions
//


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


test('library, objectDelete', (t) => {
    const obj = {'a': 1, 'b': 2};
    t.is(scriptFunctions.objectDelete([obj, 'a']), true);
    t.deepEqual(obj, {'b': 2});
});


test('library, objectDelete missing', (t) => {
    const obj = {'b': 2};
    t.is(scriptFunctions.objectDelete([obj, 'a']), true);
    t.deepEqual(obj, {'b': 2});
});


test('library, objectDelete null', (t) => {
    t.is(scriptFunctions.objectDelete([null, 'a']), null);
});


test('library, objectDelete non-object', (t) => {
    t.is(scriptFunctions.objectDelete([0, 'a']), null);
});


test('library, objectGet', (t) => {
    const obj = {'a': 1, 'b': 2};
    t.is(scriptFunctions.objectGet([obj, 'a']), 1);
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
    t.is(typeof scriptFunctions.objectSet([obj, 'c', 3]), 'undefined');
    t.deepEqual(obj, {'a': 1, 'b': 2, 'c': 3});
});


test('library, objectSet null', (t) => {
    t.is(typeof scriptFunctions.objectSet([null, 'c', 3]), 'undefined');
});


test('library, objectSet non-object', (t) => {
    t.is(typeof scriptFunctions.objectSet([0, 'c', 3]), 'undefined');
});


//
// Regex functions


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


test('library, regexMatchAll non-string', (t) => {
    t.is(scriptFunctions.regexMatchAll([/foo/g, null]), null);
});


test('library, regexNew', (t) => {
    t.is(scriptFunctions.regexNew(['a*b']) instanceof RegExp, true);
});


test('library, regexNew flags', (t) => {
    const regex = scriptFunctions.regexNew(['a*b', 'g']);
    t.is(regex instanceof RegExp, true);
    t.is(regex.flags, 'g');
});


test('library, regexTest', (t) => {
    t.is(scriptFunctions.regexTest([/a*b/, 'caaabc']), true);
});


test('library, regexTest non-regexp', (t) => {
    t.is(scriptFunctions.regexTest([null, 'caaabc']), null);
});


//
// String functions
//


test('library, split', (t) => {
    t.deepEqual(scriptFunctions.split(['foo, bar', ', ']), ['foo', 'bar']);
});


test('library, split non-string', (t) => {
    t.is(scriptFunctions.split([null, ', ']), null);
});


test('library, split regex', (t) => {
    t.deepEqual(scriptFunctions.split(['foo, bar', /,\s*/]), ['foo', 'bar']);
});


test('library, split limit', (t) => {
    t.deepEqual(scriptFunctions.split(['foo, bar, bonk', /,\s*/, 2]), ['foo', 'bar']);
});
