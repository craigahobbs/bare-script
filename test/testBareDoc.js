// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {main, parseBareDoc} from '../lib/bareDoc.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('bareDoc.main', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert.equal(url, 'test.bare');
            return {
                'ok': true,
                'text': () => `\
    // $function: myFunc
    // $group: My Group
    // $doc: My function
`
            };
        },
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(output, [
        `\
{
    "functions": [
        {
            "name": "myFunc",
            "group": "My Group",
            "doc": [
                "My function"
            ]
        }
    ]
}`
    ]);
});


test('bareDoc.main, error', async () => {
    const output = [];
    const exitCode = await main({
        'argv': ['node', 'bare.js', 'test.bare'],
        'fetchFn': (url) => {
            assert.equal(url, 'test.bare');
            return {
                'ok': true,
                'text': () => `\
// $group: My Group
`
            };
        },
        'logFn': (message) => {
            output.push(message);
        }
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, ['test.bare:1: group keyword outside function\nerror: No library functions']);
});


test('bareDoc.main, fetch error', async () => {
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


test('bareDoc.main, fetch text error', async () => {
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


test('bareDoc.main, fetch text error 2', async () => {
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


test('parseBareDoc', () => {
    assert.deepEqual(
        parseBareDoc([
            [
                'library.js',
                `\
{
    // $function: myFuncA
    // $group: AC Group
    // $doc: The A function
    // $doc: that does something useful
    // $arg a: The "a" arg
    // $arg b: The "b" arg
    // $arg a: which is blue
    // $arg c: The "c" arg
    // $return: The answer
    'myFuncA': null,

    // $function: myFuncC
    // $group: AC Group
    // $doc: The C function
    'myFuncC': null,

    // $function: myFuncB
    // $group: B Group
    // $doc: The B function
    'myFuncB': null
}
`
            ]
        ]),
        {
            'functions': [
                {
                    'name': 'myFuncA',
                    'group': 'AC Group',
                    'doc': ['The A function', 'that does something useful'],
                    'args': [
                        {
                            'name': 'a',
                            'doc': ['The "a" arg', 'which is blue']
                        },
                        {
                            'name': 'b',
                            'doc': ['The "b" arg']
                        },
                        {
                            'name': 'c',
                            'doc': ['The "c" arg']
                        }
                    ],
                    'return': ['The answer']
                },
                {
                    'name': 'myFuncB',
                    'group': 'B Group',
                    'doc': ['The B function']
                },
                {
                    'name': 'myFuncC',
                    'group': 'AC Group',
                    'doc': ['The C function']
                }
            ]
        }
    );
});


test('parseBareDoc, blank lines', () => {
    assert.deepEqual(
        parseBareDoc([
            [
                'library.js',
                `\
{
    // $function: myFuncA
    // $group: A Group
    // $doc:
    // $doc: The A function
    // $doc:
    // $doc: and more
    // $arg a:
    // $arg a: The "a" arg
    // $arg a:
    // $arg a: or less
    // $return:
    // $return: The answer
    // $return:
    // $return: and then some
    'myFuncA': null
}
`
            ]
        ]),
        {
            'functions': [
                {
                    'name': 'myFuncA',
                    'group': 'A Group',
                    'doc': ['The A function', '', 'and more'],
                    'args': [
                        {
                            'name': 'a',
                            'doc': ['The "a" arg', '', 'or less']
                        }
                    ],
                    'return': ['The answer', '', 'and then some']
                }
            ]
        }
    );
});


test('parseBareDoc, error keyword outside function', () => {
    assert.throws(
        () => {
            parseBareDoc([
                [
                    'library.js',
                    `\
// $group: A Group
// $doc: A Group
// $return: A Group
`
                ]
            ]);
        },
        {
            'name': 'Error',
            'message': `\
library.js:1: group keyword outside function
library.js:2: doc keyword outside function
library.js:3: return keyword outside function
error: No library functions`
        }
    );
});


test('parseBareDoc, error arg outside function', () => {
    assert.throws(
        () => {
            parseBareDoc([
                [
                    'library.js',
                    `\
// $arg x: The X arg
`
                ]
            ]);
        },
        {
            'name': 'Error',
            'message': `\
library.js:1: Function argument "x" outside function
error: No library functions`
        }
    );
});


test('parseBareDoc, error empty function name', () => {
    assert.throws(
        () => {
            parseBareDoc([
                [
                    'library.js',
                    `\
// $function:${'  '}
`
                ]
            ]);
        },
        {
            'name': 'Error',
            'message': `\
library.js:1: Invalid function name ""
error: No library functions`
        }
    );
});


test('parseBareDoc, error function redefinition', () => {
    assert.throws(
        () => {
            parseBareDoc([
                [
                    'library.js',
                    `\
// $function: myFunc
// $group: Group A
// $doc: The function

// $function: myFunc
// $group: Group B
// $doc: The other function
`
                ]
            ]);
        },
        {
            'name': 'Error',
            'message': `\
library.js:5: Function "myFunc" redefinition
library.js:6: Function "myFunc" group redefinition`
        }
    );
});


test('parseBareDoc, error empty group name', () => {
    assert.throws(
        () => {
            parseBareDoc([
                [
                    'library.js',
                    `\
// $function: myFunc
// $group:
// $doc: The function
`
                ]
            ]);
        },
        {
            'name': 'Error',
            'message': `\
library.js:2: Invalid function group name ""
error: Function "myFunc" missing group`
        }
    );
});


test('parseBareDoc, error group redefinition', () => {
    assert.throws(
        () => {
            parseBareDoc([
                [
                    'library.js',
                    `\
// $function: myFunc
// $group: My Group
// $group: Other Group
// $doc: The function
`
                ]
            ]);
        },
        {
            'name': 'Error',
            'message': `\
library.js:3: Function "myFunc" group redefinition`
        }
    );
});


test('parseBareDoc, error no functions', () => {
    assert.throws(
        () => {
            parseBareDoc([
                [
                    'library.js',
                    ''
                ]
            ]);
        },
        {
            'name': 'Error',
            'message': 'error: No library functions'
        }
    );
});


test('parseBareDoc, error function missing group/doc', () => {
    assert.throws(
        () => {
            parseBareDoc([
                [
                    'library.js',
                    `\
// $function: myFunc

// $function: myFunc2
// $group: FuncGroup
// $doc: My second function
`
                ]
            ]);
        },
        {
            'name': 'Error',
            'message': `\
error: Function "myFunc" missing group
error: Function "myFunc" missing documentation`
        }
    );
});
