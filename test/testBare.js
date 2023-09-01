// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {helpText, main, parseArgs} from '../lib/bare.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('bare.main', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare' || url === 'test.txt');
            return {
                'ok': true,
                'text': () => (url === 'test.txt' ? 'Hello' : `\
systemLog(systemFetch("test.txt", null, true))
systemLogDebug("Goodbye")
`)
            };
        },
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, ['Hello']);
});


test('bare.main, fetch url', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare' || url === 'http://localhost:8080/test.txt');
            return {
                'ok': true,
                'text': () => (
                    url === 'test.bare'
                        ? "systemLog(systemFetch('http://localhost:8080/test.txt', null, true))"
                        : 'Hello'
                )
            };
        },
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.deepEqual(output, ['Hello']);
    assert.equal(exitCode, 0);
});


test('bare.main, fetch absolute', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare' || url === '/tmp/test.txt');
            return {
                'ok': true,
                'text': () => (
                    url === 'test.bare'
                        ? "systemLog(systemFetch('/tmp/test.txt', null, true))"
                        : 'Hello'
                )
            };
        },
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.deepEqual(output, ['Hello']);
    assert.equal(exitCode, 0);
});


test('bare.main, debug', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-d', 'test.bare'],
        'fetchFn': (url) => {
            assert.equal(url, 'test.bare');
            return {
                'ok': true,
                'text': () => `\
systemLog('Hello')
systemLogDebug("Goodbye")
`
            };
        },
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output.map((line) => line.replace(/[.\d]+( milliseconds)$/, 'X$1')), [
        'BareScript: Static analysis... OK',
        'Hello',
        'Goodbye',
        'BareScript: Script executed in X milliseconds'
    ]);
});


test('bare.main, debug static analysis', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-d', 'test.bare'],
        'fetchFn': (url) => {
            assert.equal(url, 'test.bare');
            return {
                'ok': true,
                'text': () => `\
function test(arg)
endfunction
`
            };
        },
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output.map((line) => line.replace(/[.\d]+( milliseconds)$/, 'X$1')), [
        'BareScript: Static analysis... 1 warning:',
        'BareScript:     Unused argument "arg" of function "test" (index 0)',
        'BareScript: Script executed in X milliseconds'
    ]);
});


test('bare.main, debug static analysis 2', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-d', 'test.bare'],
        'fetchFn': (url) => {
            assert.equal(url, 'test.bare');
            return {
                'ok': true,
                'text': () => `\
function test(arg, arg2)
endfunction
`
            };
        },
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output.map((line) => line.replace(/[.\d]+( milliseconds)$/, 'X$1')), [
        'BareScript: Static analysis... 2 warnings:',
        'BareScript:     Unused argument "arg" of function "test" (index 0)',
        'BareScript:     Unused argument "arg2" of function "test" (index 0)',
        'BareScript: Script executed in X milliseconds'
    ]);
});


test('bare.main, code', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', "systemLog('Hello')"],
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, ['Hello']);
});


test('bare.main, code and files', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', "systemLog('Hello')", 'test.bare', '-c', 'systemLog("Goodbye")'],
        'fetchFn': (url) => {
            assert.equal(url, 'test.bare');
            return {
                'ok': true,
                'text': () => `\
systemLog("Now")
`
            };
        },
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, ['Hello', 'Now', 'Goodbye']);
});


test('bare.main, help', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js'],
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [helpText]);
});


test('bare.main, argument error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '--unknown'],
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['Unknown option --unknown']);
});


test('bare.main, parsing error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'bad('],
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['-c 1:\nSyntax error, line number 1:\nbad(\n    ^\n']);
});


test('bare.main, script error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', '-c', 'unknown()'],
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['-c 1:\nUndefined function "unknown"']);
});


test('bare.main, fetch error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert.equal(url, 'test.bare');
            throw new Error();
        },
        'logFn': (message) => {
            output.push(message);
        }
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
        'logFn': (message) => {
            output.push(message);
        }
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
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['Failed to load "test.bare"']);
});


test('parseArgs', () => {
    assert.deepEqual(
        parseArgs(['node', 'bare.js', 'test.bare']),
        {
            'files': [['test.bare', null]],
            'variables': {}
        }
    );
});


test('parseArgs, code', () => {
    assert.deepEqual(
        parseArgs(['node', 'bare.js', '-c', 'systemLog(1 + 2)']),
        {
            'files': [['-c 1', 'systemLog(1 + 2)']],
            'variables': {}
        }
    );
});


test('parseArgs, code and files', () => {
    assert.deepEqual(
        parseArgs(['node', 'bare.js', '-c', 'systemLog(1 + 2)', 'test.bare', '-c', 'systemLog(3 + 4)', 'test2.bare']),
        {
            'files': [['-c 1', 'systemLog(1 + 2)'], ['test.bare', null], ['-c 2', 'systemLog(3 + 4)'], ['test2.bare', null]],
            'variables': {}
        }
    );
});


test('parseArgs, debug', () => {
    assert.deepEqual(
        parseArgs(['node', 'bare.js', 'test.bare', '-d']),
        {
            'debug': true,
            'files': [['test.bare', null]],
            'variables': {}
        }
    );
});


test('parseArgs, variables', () => {
    assert.deepEqual(
        parseArgs(['node', 'bare.js', 'test.bare', '-v', 'A', '1', '--var', 'B', '2']),
        {
            'files': [['test.bare', null]],
            'variables': {'A': 1, 'B': 2}
        }
    );
});


test('parseArgs, help', () => {
    assert.throws(
        () => {
            parseArgs(['node', 'bare.js', '-h']);
        },
        {
            'name': 'Error',
            'message': helpText
        }
    );
});


test('parseArgs, help no source', () => {
    assert.throws(
        () => {
            parseArgs(['node', 'bare.js']);
        },
        {
            'name': 'Error',
            'message': helpText
        }
    );
});


test('parseArgs, error unknown', () => {
    assert.throws(
        () => {
            parseArgs(['node', 'bare.js', '--unknown']);
        },
        {
            'name': 'Error',
            'message': 'Unknown option --unknown'
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
            'message': 'Missing value for -c'
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
            'message': 'Missing value for --code'
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
            'message': 'Missing values for -v'
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
            'message': 'Missing values for --var'
        }
    );
});
