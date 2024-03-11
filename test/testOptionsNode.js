// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {fetchReadOnly, fetchReadWrite, logStdout} from '../lib/optionsNode.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('fetchReadOnly', async () => {
    const calls = [];
    const mockFetch = (...args) => {
        calls.push(['fetch', args]);
        return {
            'ok': true,
            'text': () => 'Hello'
        };
    };

    const response = await fetchReadOnly('http://example.com', null, mockFetch, null, null);
    assert.equal(response.ok, true);
    assert.equal(await response.text(), 'Hello');
    assert.deepEqual(calls, [
        ['fetch', ['http://example.com', null]]
    ]);
});


test('fetchReadOnly, file read', async () => {
    const calls = [];
    const mockReadFile = (...args) => {
        calls.push(['readFile', args]);
        return 'Hello';
    };

    const response = await fetchReadOnly('test.txt', null, null, mockReadFile, null);
    assert.equal(response.ok, true);
    assert.equal(await response.text(), 'Hello');
    assert.deepEqual(calls, [
        ['readFile', ['test.txt','utf-8']]
    ]);
});


test('fetchReadOnly, file write', async () => {
    const response = await fetchReadOnly('test.txt', {'body': 'Hello'}, null, null, null);
    assert.equal(response.ok, false);
});


test('fetchReadWrite', async () => {
    const calls = [];
    const mockFetch = (...args) => {
        calls.push(['fetch', args]);
        return {
            'ok': true,
            'text': () => 'Hello'
        };
    };

    const response = await fetchReadWrite('http://example.com', null, mockFetch, null, null);
    assert.equal(response.ok, true);
    assert.equal(await response.text(), 'Hello');
    assert.deepEqual(calls, [
        ['fetch', ['http://example.com', null]]
    ]);
});


test('fetchReadWrite, file read', async () => {
    const calls = [];
    const mockReadFile = (...args) => {
        calls.push(['readFile', args]);
        return 'Hello';
    };

    const response = await fetchReadWrite('test.txt', null, null, mockReadFile, null);
    assert.equal(response.ok, true);
    assert.equal(await response.text(), 'Hello');
    assert.deepEqual(calls, [
        ['readFile', ['test.txt','utf-8']]
    ]);
});


test('fetchReadWrite, file write', async () => {
    const calls = [];
    const mockWriteFile = (...args) => calls.push(['writeFile', args]);

    const response = await fetchReadWrite('test.txt', {'body': 'Hello'}, null, null, mockWriteFile);
    assert.equal(response.ok, true);
    assert.equal(await response.text(), '{}');
    assert.deepEqual(calls, [
        ['writeFile', ['test.txt', 'Hello']]
    ]);
});


test('fetchReadWrite', () => {
    assert.equal(typeof fetchReadWrite, 'function');
});


test('logStdout', () => {
    const writes = [];
    const mockStdout = {
        'write': (text) => writes.push(text)
    };
    logStdout('Hello', mockStdout);
    assert.deepEqual(writes, ['Hello\n']);
});
