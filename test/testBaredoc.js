// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {helpText, main, parseArgs} from '../lib/baredoc.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';
import {valueJSON} from '../lib/value.js';


test('baredoc.main, help', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'baredoc.js', '-h'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [helpText]);
});


test('baredoc.main, argument error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'baredoc.js', '--unknown'],
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['error: unrecognized arguments: --unknown']);
});


test('baredoc.main', async () => {
    const output = [];
    const testJSON = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare', '-o', 'test.json'],
        'fetchFn': (url, options) => {
            assert(url === 'test.bare' || url === 'test.json');
            if (url === 'test.json') {
                testJSON.push(options.body);
                return {'ok': true, 'text': () => '{}'};
            }
            return {
                'ok': true,
                'text': () => `\
# $function: myFunction
# $group: My Group
# $doc: This is my function.
# $doc:
# $doc: More on the function.
# $arg arg1: The first argument
# $arg arg2: The second argument.
# $arg arg2:
# $arg arg2: More on the second argument.
# $return: The message
function myFunction(arg1, arg2)
    message = 'Hello'
    systemLog(message)
    return message
endfunction
`
            };
        }
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, []);
    assert.deepEqual(testJSON, [
        valueJSON({
            'functions': [
                {
                    'args':[
                        {'name':'arg1', 'doc':['The first argument']},
                        {'name':'arg2', 'doc':['The second argument.','','More on the second argument.']}
                    ],
                    'doc': ['This is my function.','','More on the function.'],
                    'group': 'My Group',
                    'name': 'myFunction',
                    'return':['The message']
                }
            ]
        })
    ]);
});


test('baredoc.main, stdout', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => `\
# $function: myFunction
# $group: My Group
# $doc: This is my function
function myFunction()
    systemLog('Hello')
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, [
        valueJSON({
            'functions': [
                {
                    'doc': ['This is my function'],
                    'group': 'My Group',
                    'name': 'myFunction'
                }
            ]
        })
    ]);
});


test('baredoc.main, fetch error', async () => {
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
    assert.deepEqual(output, [
        `\
Failed to load "test.bare"
error: No library functions`
    ]);
});


test('baredoc.main, fetch text error', async () => {
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
    assert.deepEqual(output, [
        `\
Failed to load "test.bare"
error: No library functions`
    ]);
});


test('baredoc.main, fetch text error 2', async () => {
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
    assert.deepEqual(output, [
        `\
Failed to load "test.bare"
error: No library functions`
    ]);
});


test('baredoc.main, write error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare', '-o', 'test.json'],
        'fetchFn': (url) => {
            assert(url === 'test.bare' || url === 'test.json');
            if (url === 'test.json') {
                throw new Error();
            }
            return {
                'ok': true,
                'text': () => `\
# $function: myFunction
# $group: My Group
# $doc: This is my function.
function myFunction()
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['error: Failed to write "test.json"']);
});


test('baredoc.main, write text error 1', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare', '-o', 'test.json'],
        'fetchFn': (url) => {
            assert(url === 'test.bare' || url === 'test.json');
            if (url === 'test.json') {
                return {'ok': false};
            }
            return {
                'ok': true,
                'text': () => `\
# $function: myFunction
# $group: My Group
# $doc: This is my function.
function myFunction()
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['error: Failed to write "test.json"']);
});


test('baredoc.main, write text error 2', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare', '-o', 'test.json'],
        'fetchFn': (url) => {
            assert(url === 'test.bare' || url === 'test.json');
            if (url === 'test.json') {
                return {
                    'ok': true,
                    'text': () => {
                        throw new Error();
                    }
                };
            }
            return {
                'ok': true,
                'text': () => `\
# $function: myFunction
# $group: My Group
# $doc: This is my function.
function myFunction()
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['error: Failed to write "test.json"']);
});


test('baredoc.main, function doc leading trim', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => `\
# $function: myFunction
# $group: My Group
# $doc:
# $doc: This is my function
# $doc:
function myFunction()
    systemLog('Hello')
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, [
        valueJSON({
            'functions': [
                {
                    'doc': ['This is my function', ''],
                    'group': 'My Group',
                    'name': 'myFunction'
                }
            ]
        })
    ]);
});


test('baredoc.main, arg doc leading trim', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => `\
# $function: myFunction
# $group: My Group
# $doc: This is my function
# $arg arg:
# $arg arg: The first argument
# $arg arg:
function myFunction()
    systemLog('Hello')
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, [
        valueJSON({
            'functions': [
                {
                    'args':[{'doc':['The first argument',''], 'name':'arg'}],
                    'doc': ['This is my function'],
                    'group': 'My Group',
                    'name': 'myFunction'
                }
            ]
        })
    ]);
});


test('baredoc.main, error no functions', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => ''
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        'error: No library functions'
    ]);
});


test('baredoc.main, error missing function members', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => `\
# $function: myFunction
function myFunction()
    systemLog('Hello')
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        `\
error: Function "myFunction" missing group
error: Function "myFunction" missing documentation`
    ]);
});


test('baredoc.main, error keyword outside function', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => `\
# $group: My Group
function myFunction()
    systemLog('Hello')
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        `\
test.bare:1: group keyword outside function
error: No library functions`
    ]);
});


test('baredoc.main, error empty group', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => `\
# $function: myFunction
# $group:
# $doc: This is my function
function myFunction()
    systemLog('Hello')
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        `\
test.bare:2: Invalid function group name ""
error: Function "myFunction" missing group`
    ]);
});


test('baredoc.main, error group redefinition', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => `\
# $function: myFunction
# $group: My Group
# $group: My Other Group
# $doc: This is my function
function myFunction()
    systemLog('Hello')
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        'test.bare:3: Function "myFunction" group redefinition'
    ]);
});


test('baredoc.main, error empty function', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => `\
# $function:
# $group: My Group
# $doc: This is my function
function myFunction()
    systemLog('Hello')
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        `\
test.bare:1: Invalid function name ""
test.bare:2: group keyword outside function
test.bare:3: doc keyword outside function
error: No library functions`
    ]);
});


test('baredoc.main, error function redefinition', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => `\
# $function: myFunction
# $group: My Group
# $doc: This is my function
function myFunction()
    systemLog('Hello')
endfunction

# $function: myFunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        'test.bare:8: Function "myFunction" redefinition'
    ]);
});


test('baredoc.main, error arg outside function', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => `\
# $arg arg: My arg
function myFunction()
    systemLog('Hello')
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        `\
test.bare:1: Function argument "arg" outside function
error: No library functions`
    ]);
});


test('baredoc.main, error invalid keyword', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert(url === 'test.bare');
            return {
                'ok': true,
                'text': () => `\
# $function: myFunction
# $group: My Group
# $doc: This is my function
# $returns: Bad return keyword
function myFunction()
    systemLog('Hello')
endfunction
`
            };
        },
        'logFn': (message) => output.push(message)
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, [
        'test.bare:4: Invalid documentation comment "returns"'
    ]);
});


test('parseArgs', () => {
    assert.deepEqual(
        parseArgs(['node', 'baredoc.js', 'test.js']),
        {'files': ['test.js'], 'output': '-'}
    );
});


test('parseArgs, output', () => {
    assert.deepEqual(
        parseArgs(['node', 'baredoc.js', 'test.js', 'test2.js', '-o', 'test.json']),
        {'files': ['test.js', 'test2.js'], 'output': 'test.json'}
    );
});


test('parseArgs, help', () => {
    assert.deepEqual(
        parseArgs(['node', 'baredoc.js', '-h']),
        {'help': true, 'files': [], 'output': '-'}
    );
});


test('parseArgs, error files', () => {
    assert.throws(
        () => {
            parseArgs(['node', 'baredoc.js']);
        },
        {
            'name': 'Error',
            'message': 'the following arguments are required: file'
        }
    );
});


test('parseArgs, error output', () => {
    assert.throws(
        () => {
            parseArgs(['node', 'baredoc.js', '-o']);
        },
        {
            'name': 'Error',
            'message': 'argument -o: expected one argument'
        }
    );
});


test('parseArgs, error unknown', () => {
    assert.throws(
        () => {
            parseArgs(['node', 'baredoc.js', '--unknown']);
        },
        {
            'name': 'Error',
            'message': 'unrecognized arguments: --unknown'
        }
    );
});
