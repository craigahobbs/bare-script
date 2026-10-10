#!/usr/bin/env node
// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {argv, exit, stdout} from 'node:process';
import {fetchReadWrite, logStdout} from '../lib/optionsNode.js';
import {main} from '../lib/bare.js';


// Exit once stdout is flushed - writes to a pipe are asynchronous, so exiting immediately can truncate the output.
// Stdout's chunks are written in order, so an empty write's callback runs after all prior output is written.
const exitCode = await main({argv, 'fetchFn': fetchReadWrite, 'logFn': logStdout});
stdout.write('', () => exit(exitCode));
