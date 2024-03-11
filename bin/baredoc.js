#!/usr/bin/env node
// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {argv, exit} from 'node:process';
import {fetchReadWrite, logStdout} from '../lib/optionsNode.js';
import {main} from '../lib/baredoc.js';


exit(await main({argv, 'fetchFn': fetchReadWrite, 'logFn': logStdout}));
