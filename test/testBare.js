// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {helpText, main, parseArgs} from '../lib/bare.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('bare.main, help', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-h'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [helpText]);
});


test('bare.main, help no scripts', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [helpText]);
});


test('bare.main, argument error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '--unknown'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['error: unrecognized arguments: --unknown']);
});


test('bare.main, inline', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', "systemLog('Hello')"],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, ['Hello']);
});


test('bare.main, inline fetch', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', "systemLog(systemFetch('test.txt'))"],
        'fetchFn': (url) => {
            assert(url === 'test.txt');
            return {
                'ok': true,
                'text': () => 'Hello'
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, ['Hello']);
});


test('bare.main, file', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => 'systemLog("Hello")'
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, ['Hello']);
});


test('bare.main, file fetch', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'subdir/test.bare'],
        'fetchFn': (url) => {
            assert(url === 'subdir/test.bare' || url === 'subdir/test.txt');
            if (url === 'subdir/test.txt') {
                return {
                    'ok': true,
                    'text': () => 'Hello'
                };
            }
            return {
                'ok': true,
                'text': () => "systemLog(systemFetch('test.txt'))"
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, ['Hello']);
});


test('bare.main, mixed begin', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare', 'test2.bare', '-c', 'systemLog("3")', '-c', 'systemLog("4")'],
        'fetchFn': (url) => {
            assert(url === 'test.bare' || url === 'test2.bare');
            if (url === 'test2.bare') {
                return {
                    'ok': true,
                    'text': () => 'systemLog("2")'
                };
            }
            return {
                'ok': true,
                'text': () => 'systemLog("1")'
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, [
        '1',
        '2',
        '3',
        '4'
    ]);
});


test('bare.main, mixed middle', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'systemLog("1")', 'test.bare', 'test2.bare', '-c', 'systemLog("4")'],
        'fetchFn': (url) => {
            assert(url === 'test.bare' || url === 'test2.bare');
            if (url === 'test2.bare') {
                return {
                    'ok': true,
                    'text': () => 'systemLog("3")'
                };
            }
            return {
                'ok': true,
                'text': () => 'systemLog("2")'
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, [
        '1',
        '2',
        '3',
        '4'
    ]);
});


test('bare.main, mixed end', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'systemLog("1")', '-c', 'systemLog("2")', 'test.bare', 'test2.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare' || url === 'test2.bare');
            if (url === 'test2.bare') {
                return {
                    'ok': true,
                    'text': () => 'systemLog("4")'
                };
            }
            return {
                'ok': true,
                'text': () => 'systemLog("3")'
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, [
        '1',
        '2',
        '3',
        '4'
    ]);
});


test('bare.main, parse error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'asdf asdf'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        '-c 1:',
        `\
Syntax error, line number 1:
asdf asdf
    ^
`
    ]);
});


test('bare.main, script error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'unknown()'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['-c 1:', 'Undefined function "unknown"']);
});


test('bare.main, fetch error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert.equal(url, 'test.bare');
            throw new Error();
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['Failed to load "test.bare"']);
});


test('bare.main, fetch text error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert.equal(url, 'test.bare');
            return {'ok': false};
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['Failed to load "test.bare"']);
});


test('bare.main, fetch text error 2', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert.equal(url, 'test.bare');
            return {
                'ok': true,
                'text': () => {
                    throw new Error();
                }
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['Failed to load "test.bare"']);
});


test('bare.main, status return', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'return 2']
    });
    assert.equal(exitCode, 2);
    assert.deepEqual(output, []);
});


test('bare.main, status return zero', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'return 0']
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, []);
});


test('bare.main, status return max', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'return 255']
    });
    assert.equal(exitCode, 255);
    assert.deepEqual(output, []);
});


test('bare.main, status return beyond max', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'return 256']
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, []);
});


test('bare.main, status return negative', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'return -1']
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, []);
});


test('bare.main, status return non-integer true', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'return "abc"']
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, []);
});


test('bare.main, status return non-integer false', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'return ""']
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, []);
});


test('bare.main, variables', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'systemLog("Hi " + vName + "!")', '-v', 'vName', '"Bob"'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, ['Hi Bob!']);
});


test('bare.main, variables parse error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-v', 'A', 'asdf asdf', '-c', 'return A'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        `\
Syntax error:
asdf asdf
    ^
`
    ]);
});


test('bare.main, variables evaluate error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-v', 'A', 'unknown()', '-c', 'return A'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        'Undefined function "unknown"'
    ]);
});


test('bare.main, debug', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-d', '-c', 'systemLog("Hello")', '-c', 'systemLogDebug("Goodbye")'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output.map((line) => line.replace(/[.\d]+( milliseconds)$/, 'X$1')), [
        'BareScript: Static analysis "-c 1" ... OK',
        'Hello',
        'BareScript: Script executed in X milliseconds',
        'BareScript: Static analysis "-c 2" ... OK',
        'Goodbye',
        'BareScript: Script executed in X milliseconds'
    ]);
});


test('bare.main, debug static analysis warnings', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-d', '-c', '0'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output.map((line) => line.replace(/[.\d]+( milliseconds)$/, 'X$1')), [
        'BareScript: Static analysis "-c 1" ... 1 warning:',
        'BareScript:     Pointless global statement (index 0)',
        'BareScript: Script executed in X milliseconds'
    ]);
});


test('bare.main, debug static analysis warnings multiple', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-d', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => '0\n1\n'
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output.map((line) => line.replace(/[.\d]+( milliseconds)$/, 'X$1')), [
        'BareScript: Static analysis "test.bare" ... 2 warnings:',
        'BareScript:     Pointless global statement (index 0)',
        'BareScript:     Pointless global statement (index 1)',
        'BareScript: Script executed in X milliseconds'
    ]);
});


test('bare.main, static analysis', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-s', '-c', 'return 1 + 1', '-c', 'return 1 + 2'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, [
        'BareScript: Static analysis "-c 1" ... OK',
        'BareScript: Static analysis "-c 2" ... OK'
    ]);
});


test('bare.main, static analysis error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-s', '-c', '0', '-c', '1'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        'BareScript: Static analysis "-c 1" ... 1 warning:',
        'BareScript:     Pointless global statement (index 0)'
    ]);
});


test('parseArgs', () => {
    assert.deepEqual(
        parseArgs(['node', 'bare.js', 'test.bare']),
        {
            'scripts': [['file', 'test.bare']],
            'var': {}
        }
    );
});


test('parseArgs, code', () => {
    assert.deepEqual(
        parseArgs(['node', 'bare.js', '-c', 'systemLog(1 + 2)']),
        {
            'scripts': [['code', 'systemLog(1 + 2)']],
            'var': {}
        }
    );
});


test('parseArgs, code and files', () => {
    assert.deepEqual(
        parseArgs(['node', 'bare.js', '-c', 'systemLog(1 + 2)', 'test.bare', '-c', 'systemLog(3 + 4)', 'test2.bare']),
        {
            'scripts': [['code', 'systemLog(1 + 2)'], ['file', 'test.bare'], ['code', 'systemLog(3 + 4)'], ['file', 'test2.bare']],
            'var': {}
        }
    );
});


test('parseArgs, debug', () => {
    assert.deepEqual(
        parseArgs(['node', 'bare.js', 'test.bare', '-d']),
        {
            'debug': true,
            'scripts': [['file', 'test.bare']],
            'var': {}
        }
    );
});


test('parseArgs, variables', () => {
    assert.deepEqual(
        parseArgs(['node', 'bare.js', 'test.bare', '-v', 'A', '1', '--var', 'B', '2']),
        {
            'scripts': [['file', 'test.bare']],
            'var': {'A': '1', 'B': '2'}
        }
    );
});


test('parseArgs, help', () => {
    assert.deepEqual(
        parseArgs(['node', 'bare.js', '-h']),
        {'help': true, 'scripts': [], 'var': {}}
    );
});


test('parseArgs, help no source', () => {
    assert.deepEqual(
        parseArgs(['node', 'bare.js']),
        {'scripts': [], 'var': {}}
    );
});


test('parseArgs, error unknown', () => {
    assert.throws(
        () => {
            parseArgs(['node', 'bare.js', '--unknown']);
        },
        {
            'name': 'Error',
            'message': 'unrecognized arguments: --unknown'
        }
    );
});


test('parseArgs, error missing code', () => {
    assert.throws(
        () => {
            parseArgs(['node', 'bare.js', '-c']);
        },
        {
            'name': 'Error',
            'message': 'argument -c/--code: expected one argument'
        }
    );
});


test('parseArgs, error missing code 2', () => {
    assert.throws(
        () => {
            parseArgs(['node', 'bare.js', '--code']);
        },
        {
            'name': 'Error',
            'message': 'argument -c/--code: expected one argument'
        }
    );
});


test('parseArgs, error missing variable', () => {
    assert.throws(
        () => {
            parseArgs(['node', 'bare.js', '-v']);
        },
        {
            'name': 'Error',
            'message': 'argument -v/--var: expected 2 arguments'
        }
    );
});


test('parseArgs, error missing variable 2', () => {
    assert.throws(
        () => {
            parseArgs(['node', 'bare.js', '--var', 'A']);
        },
        {
            'name': 'Error',
            'message': 'argument -v/--var: expected 2 arguments'
        }
    );
});
