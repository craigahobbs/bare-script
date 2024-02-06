#!/usr/bin/env node
// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {argv, exit, stdout} from 'node:process';
import {main} from '../lib/baredoc.js';
import {readFile} from 'node:fs/promises';


const rURL = /^[a-z]+:/;
exit(await main({
    argv,
    'fetchFn': (fetchURL, fetchOptions) => {
        if (rURL.test(fetchURL)) {
            return fetch(fetchURL, fetchOptions);
        }
        return {
            'ok': true,
            'text': () => readFile(fetchURL, 'utf-8')
        };
    },
    'logFn': (message) => stdout.write(`${message}\n`)
}));
