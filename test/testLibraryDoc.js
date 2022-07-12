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
    // $function: myFunc
    // $group: My Group
    // $doc: My function
    // $doc: that does something useful
    // $arg a: The "a" arg
    // $arg a: which is blue
    // $arg b: The "b" arg
    // $arg c: The "c" arg
    // $return: The answer
    'myFunc': null
}
`
            ]
        ]),
        {
            'functions': [
                {
                    'name': 'myFunc',
                    'group': 'My Group',
                    'doc': ['My function', 'that does something useful'],
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
                }
            ]
        }
    );
});
