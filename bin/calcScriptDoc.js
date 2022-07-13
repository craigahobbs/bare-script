#!/usr/bin/env node
// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

import {argv, exit, stderr, stdout} from 'node:process';
import {parseLibraryDoc} from '../lib/libraryDoc.js';
import {readFileSync} from 'node:fs';

try {
    stdout.write(JSON.stringify(parseLibraryDoc(argv.slice(2).map((file) => [file, readFileSync(file, 'utf-8')])), null, 4));
} catch (error) {
    stderr.write(error.message);
    stderr.write('\n');
    exit(1);
}
