#!/usr/bin/env node
// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

import {argv} from 'node:process';
import {parseLibraryDoc} from '../lib/libraryDoc.js';
import {readFileSync} from 'node:fs';

console.log(JSON.stringify(parseLibraryDoc(argv.slice(2).map((file) => [file, readFileSync(file, 'utf-8')])), null, 4));
