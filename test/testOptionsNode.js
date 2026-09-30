// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {fetchReadOnly, fetchReadWrite, logStdout} from '../lib/optionsNode.js';
import {Buffer} from 'node:buffer';
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


test('fetchReadWrite, file read binary', async () => {
    const calls = [];
    const mockReadFile = (...args) => {
        calls.push(['readFile', args]);
        // A Buffer slice of a larger pool - the bytes must be copied from its offset
        return Buffer.from('xxHelloxx').subarray(2, 7);
    };

    const response = await fetchReadWrite('test.bin', null, null, mockReadFile, null);
    assert.equal(response.ok, true);
    assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [72, 101, 108, 108, 111]);
    assert.deepEqual(calls, [
        ['readFile', ['test.bin']]
    ]);
});


test('fetchReadWrite, file write binary response', async () => {
    const calls = [];
    const mockWriteFile = (...args) => calls.push(['writeFile', args]);

    const response = await fetchReadWrite('test.txt', {'body': 'Hello'}, null, null, mockWriteFile);
    assert.equal(response.ok, true);
    assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [123, 125]);
    assert.deepEqual(calls, [
        ['writeFile', ['test.txt', 'Hello']]
    ]);
});


test('fetchReadWrite, file write binary', async () => {
    const calls = [];
    const mockWriteFile = (...args) => calls.push(['writeFile', args]);

    const bytes = new Uint8Array([0, 128, 255]);
    const response = await fetchReadWrite('test.bin', {'body': bytes}, null, null, mockWriteFile);
    assert.equal(response.ok, true);
    assert.equal(await response.text(), '{}');
    assert.deepEqual(calls, [
        ['writeFile', ['test.bin', bytes]]
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
