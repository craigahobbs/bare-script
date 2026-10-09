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


test('fetchReadWrite, file method', async () => {
    const calls = [];
    const mockReadFile = (...args) => {
        calls.push(['readFile', args]);
        return 'Hello';
    };
    const mockWriteFile = (...args) => calls.push(['writeFile', args]);

    // A GET request reads
    let response = await fetchReadWrite('test.txt', {'method': 'GET'}, null, mockReadFile, mockWriteFile);
    assert.equal(response.ok, true);
    assert.equal(await response.text(), 'Hello');

    // A POST or PUT request with a body writes
    for (const method of ['POST', 'PUT']) {
        response = await fetchReadWrite('test.txt', {method, 'body': 'Hello'}, null, mockReadFile, mockWriteFile);
        assert.equal(response.ok, true);
        assert.equal(await response.text(), '{}');
    }

    // Any other request fails
    response = await fetchReadWrite('test.txt', {'method': 'HEAD'}, null, mockReadFile, mockWriteFile);
    assert.equal(response.ok, false);
    response = await fetchReadWrite('test.txt', {'method': 'PUT'}, null, mockReadFile, mockWriteFile);
    assert.equal(response.ok, false);
    response = await fetchReadWrite('test.txt', {'method': 'PATCH', 'body': 'Hello'}, null, mockReadFile, mockWriteFile);
    assert.equal(response.ok, false);

    assert.deepEqual(calls, [
        ['readFile', ['test.txt', 'utf-8']],
        ['writeFile', ['test.txt', 'Hello']],
        ['writeFile', ['test.txt', 'Hello']]
    ]);
});


test('fetchReadWrite, file delete', async () => {
    const calls = [];
    const mockUnlink = (...args) => calls.push(['unlink', args]);

    let response = await fetchReadWrite('test.txt', {'method': 'DELETE'}, null, null, null, mockUnlink);
    assert.equal(response.ok, true);
    assert.equal(await response.text(), '{}');
    response = await fetchReadWrite('test.bin', {'method': 'DELETE'}, null, null, null, mockUnlink);
    assert.equal(response.ok, true);
    assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [123, 125]);

    // A delete with a body fails
    response = await fetchReadWrite('test.txt', {'method': 'DELETE', 'body': 'Hello'}, null, null, null, mockUnlink);
    assert.equal(response.ok, false);

    assert.deepEqual(calls, [
        ['unlink', ['test.txt']],
        ['unlink', ['test.bin']]
    ]);
});


test('fetchReadOnly, file delete', async () => {
    const response = await fetchReadOnly('test.txt', {'method': 'DELETE'}, null, null);
    assert.equal(response.ok, false);
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
