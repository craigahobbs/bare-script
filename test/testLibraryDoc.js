// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

import {parseLibraryDoc} from '../lib/libraryDoc.js';
import test from 'ava';


/* eslint-disable id-length */


test('parseLibraryDoc', (t) => {
    t.deepEqual(
        parseLibraryDoc([
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


test('parseLibraryDoc, blank lines', (t) => {
    t.deepEqual(
        parseLibraryDoc([
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


test('parseLibraryDoc, error keyword outside function', (t) => {
    const error = t.throws(() => {
        parseLibraryDoc([
            [
                'library.js',
                `\
// $group: A Group
// $doc: A Group
// $return: A Group
`
            ]
        ]);
    }, {'instanceOf': Error});
    t.is(error.message, `\
library.js:1: group keyword outside function
library.js:2: doc keyword outside function
library.js:3: return keyword outside function
error: No library functions`);
});


test('parseLibraryDoc, error arg outside function', (t) => {
    const error = t.throws(() => {
        parseLibraryDoc([
            [
                'library.js',
                `\
// $arg x: The X arg
`
            ]
        ]);
    }, {'instanceOf': Error});
    t.is(error.message, `\
library.js:1: Function argument "x" outside function
error: No library functions`);
});


test('parseLibraryDoc, error empty function name', (t) => {
    const error = t.throws(() => {
        parseLibraryDoc([
            [
                'library.js',
                `\
// $function:  
`
            ]
        ]);
    }, {'instanceOf': Error});
    t.is(error.message, `\
library.js:1: Invalid function name ""
error: No library functions`);
});


test('parseLibraryDoc, error function redefinition', (t) => {
    const error = t.throws(() => {
        parseLibraryDoc([
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
    }, {'instanceOf': Error});
    t.is(error.message, `\
library.js:5: Function "myFunc" redefinition
library.js:6: Function "myFunc" group redefinition`);
});


test('parseLibraryDoc, error empty group name', (t) => {
    const error = t.throws(() => {
        parseLibraryDoc([
            [
                'library.js',
                `\
// $function: myFunc
// $group:
// $doc: The function
`
            ]
        ]);
    }, {'instanceOf': Error});
    t.is(error.message, `\
library.js:2: Invalid function group name ""
error: Function "myFunc" missing group`);
});


test('parseLibraryDoc, error group redefinition', (t) => {
    const error = t.throws(() => {
        parseLibraryDoc([
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
    }, {'instanceOf': Error});
    t.is(error.message, `\
library.js:3: Function "myFunc" group redefinition`);
});


test('parseLibraryDoc, error no functions', (t) => {
    const error = t.throws(() => {
        parseLibraryDoc([
            [
                'library.js',
                ''
            ]
        ]);
    }, {'instanceOf': Error});
    t.is(error.message, 'error: No library functions');
});


test('parseLibraryDoc, error function missing group/doc', (t) => {
    const error = t.throws(() => {
        parseLibraryDoc([
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
    }, {'instanceOf': Error});
    t.is(error.message, `\
error: Function "myFunc" missing group
error: Function "myFunc" missing documentation`);
});
