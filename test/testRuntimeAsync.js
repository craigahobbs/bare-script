// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/* eslint-disable require-await */

import {evaluateExpressionAsync, executeScriptAsync} from '../lib/runtimeAsync.js';
import {validateExpression, validateScript} from '../lib/model.js';
import {BareScriptRuntimeError} from '../lib/runtime.js';
import {ValueArgsError} from '../lib/value.js';
import {strict as assert} from 'node:assert';
import {coverageGlobalName} from '../lib/library.js';
import test from 'node:test';


test('executeScriptAsync', async () => {
    const script = validateScript({
        'statements': [
            {'expr': {'name': 'a', 'expr': {'number': 5}}},
            {'expr': {'name': 'b', 'expr': {'number': 7}}},
            {'return': {
                'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
            }}
        ]
    });
    assert.equal(await executeScriptAsync(script), 12);
});


test('executeScriptAsync, global override', async () => {
    const script = validateScript({
        'statements': [
            {'return': {
                'expr': {'function': {'name': 'systemFetch', 'args': [{'string': 'the-url'}]}}
            }}
        ]
    });
    const options = {
        'globals': {
            'systemFetch': (args) => `Hello, ${args[0]}!`
        }
    };
    assert.equal(await executeScriptAsync(script, options), 'Hello, the-url!');
});


test('executeScriptAsync, coverage', async () => {
    const script = validateScript({
        'scriptName': 'test.bare',
        'scriptLines': [
            'async function main():',
            '    jump label',
            '    label:',
            '',
            '    if false:',
            '        ix = 0',
            '    elif false:',
            '        ix = 1',
            '    else:',
            '        ix = 2',
            '    endif',
            '',
            '    for num in arrayNew(1, 2, 3):',
            '        systemLog(num)',
            '    endfor  # Numbers ',
            '',
            '    ix = 0',
            '    while true:',
            '        if ix == 5:',
            '            break',
            '        endif',
            '        ix = ix + 1',
            '        if ix == 3:',
            '            continue',
            '        endif',
            '    endwhile',
            '',
            '    return true',
            'endfunction',
            '',
            'return main()'
        ],
        'statements': [
            {'function': {
                'async': true,
                'name': 'main',
                'lineNumber': 1,
                'statements': [
                    {'jump': {'label': 'label', 'lineNumber': 2}},
                    {'label': {'lineNumber': 3, 'name': 'label'}},
                    {'jump': {
                        'expr': {'unary': {'expr': {'variable': 'false'}, 'op': '!'}},
                        'label': '__bareScriptIf0',
                        'lineNumber': 5
                    }},
                    {'expr': {'expr': {'number': 0.0}, 'lineNumber': 6, 'name': 'ix'}},
                    {'jump': {'label': '__bareScriptDone0', 'lineNumber': 7}},
                    {'label': {'lineNumber': 7, 'name': '__bareScriptIf0'}},
                    {'jump': {
                        'expr': {'unary': {'expr': {'variable': 'false'},'op': '!'}},
                        'label': '__bareScriptIf1',
                        'lineNumber': 7
                    }},
                    {'expr': {'expr': {'number': 1.0}, 'lineNumber': 8, 'name': 'ix'}},
                    {'jump': {'label': '__bareScriptDone0', 'lineNumber': 9}},
                    {'label': {'lineNumber': 9, 'name': '__bareScriptIf1'}},
                    {'expr': {'expr': {'number': 2.0}, 'lineNumber': 10, 'name': 'ix'}},
                    {'label': {'lineNumber': 11, 'name': '__bareScriptDone0'}},
                    {'expr': {
                        'expr': {'function': {'args': [{'number': 1.0}, {'number': 2.0}, {'number': 3.0}], 'name': 'arrayNew'}},
                        'lineNumber': 13,
                        'name': '__bareScriptValues2'
                    }},
                    {'expr': {
                        'expr': {'function': {'args': [{'variable': '__bareScriptValues2'}], 'name': 'arrayLength'}},
                        'lineNumber': 13,
                        'name': '__bareScriptLength2'
                    }},
                    {'jump': {
                        'expr': {'unary': {'expr': {'variable': '__bareScriptLength2'}, 'op': '!'}},
                        'label': '__bareScriptDone2',
                        'lineNumber': 13
                    }},
                    {'expr': {'expr': {'number': 0.0}, 'lineNumber': 13, 'name': '__bareScriptIndex2'}},
                    {'label': {'lineNumber': 13, 'name': '__bareScriptLoop2'}},
                    {'expr': {
                        'expr': {
                            'function': {
                                'args': [{'variable': '__bareScriptValues2'}, {'variable': '__bareScriptIndex2'}],
                                'name': 'arrayGet'
                            }
                        },
                        'lineNumber': 13,
                        'name': 'num'
                    }},
                    {'expr': {'expr': {'function': {'args': [{'variable': 'num'}], 'name': 'systemLog'}}, 'lineNumber': 14}},
                    {'expr': {
                        'expr': {'binary': {'left': {'variable': '__bareScriptIndex2'}, 'op': '+', 'right': {'number': 1.0}}},
                        'lineNumber': 15,
                        'name': '__bareScriptIndex2'
                    }},
                    {'jump': {
                        'expr': {
                            'binary': {
                                'left': {'variable': '__bareScriptIndex2'},
                                'op': '<',
                                'right': {'variable': '__bareScriptLength2'}}
                        },
                        'label': '__bareScriptLoop2',
                        'lineNumber': 15
                    }},
                    {'label': {'lineNumber': 15, 'name': '__bareScriptDone2'}},
                    {'expr': {'expr': {'number': 0.0}, 'lineNumber': 17, 'name': 'ix'}},
                    {'jump': {
                        'expr': {'unary': {'expr': {'variable': 'true'}, 'op': '!'}},
                        'label': '__bareScriptDone3',
                        'lineNumber': 18
                    }},
                    {'label': {'lineNumber': 18, 'name': '__bareScriptLoop3'}},
                    {'jump': {
                        'expr': {
                            'unary': {
                                'expr': {'binary': {'left': {'variable': 'ix'}, 'op': '==', 'right': {'number': 5.0}}},
                                'op': '!'
                            }},
                        'label': '__bareScriptDone4',
                        'lineNumber': 19
                    }},
                    {'jump': {'label': '__bareScriptDone3', 'lineNumber': 20}},
                    {'label': {'lineNumber': 21, 'name': '__bareScriptDone4'}},
                    {'expr': {
                        'expr': {'binary': {'left': {'variable': 'ix'}, 'op': '+', 'right': {'number': 1.0}}},
                        'lineNumber': 22,
                        'name': 'ix'
                    }},
                    {'jump': {
                        'expr': {
                            'unary': {
                                'expr': {'binary': {'left': {'variable': 'ix'}, 'op': '==', 'right': {'number': 3.0}}},
                                'op': '!'
                            }
                        },
                        'label': '__bareScriptDone5',
                        'lineNumber': 23
                    }},
                    {'jump': {'label': '__bareScriptLoop3', 'lineNumber': 24}},
                    {'label': {'lineNumber': 25, 'name': '__bareScriptDone5'}},
                    {'jump': {'expr': {'variable': 'true'}, 'label': '__bareScriptLoop3', 'lineNumber': 26}},
                    {'label': {'lineNumber': 26, 'name': '__bareScriptDone3'}},
                    {'return': {'expr': {'variable': 'true'}, 'lineNumber': 28}}
                ]
            }},
            {'return': {'expr': {'function': {'args': [], 'name': 'main'}}, 'lineNumber': 31}}
        ]
    });
    const options = {'globals': {[coverageGlobalName]: {'enabled': true}}};
    assert.equal(await executeScriptAsync(script, options), true);
    const [mainStatement] = script.statements;
    assert.deepEqual(options.globals[coverageGlobalName], {
        'enabled': true,
        'scripts': {
            'test.bare': {
                'script': script,
                'covered': {
                    '1': {'count': 1, 'statement': mainStatement},
                    '2': {'count': 1, 'statement': {'jump': {'label': 'label', 'lineNumber': 2}}},
                    '3': {'count': 1, 'statement': {'label': {'lineNumber': 3, 'name': 'label'}}},
                    '5': {'count': 1, 'statement': {'jump': {
                        'expr': {'unary': {'expr': {'variable': 'false'}, 'op': '!'}},
                        'label': '__bareScriptIf0',
                        'lineNumber': 5
                    }}},
                    '7': {'count': 2, 'statement': {'label': {'lineNumber': 7, 'name': '__bareScriptIf0'}}},
                    '9': {'count': 1, 'statement': {'label': {'lineNumber': 9, 'name': '__bareScriptIf1'}}},
                    '10': {'count': 1, 'statement': {'expr': {'expr': {'number': 2.0}, 'lineNumber': 10, 'name': 'ix'}}},
                    '11': {'count': 1, 'statement': {'label': {'lineNumber': 11, 'name': '__bareScriptDone0'}}},
                    '13': {'count': 10, 'statement': {'expr': {
                        'expr': {'function': {'args': [{'number': 1.0}, {'number': 2.0}, {'number': 3.0}], 'name': 'arrayNew'}},
                        'lineNumber': 13,
                        'name': '__bareScriptValues2'
                    }}},
                    '14': {'count': 3, 'statement': {'expr': {
                        'expr': {'function': {'args': [{'variable': 'num'}], 'name': 'systemLog'}},
                        'lineNumber': 14
                    }}},
                    '15': {'count': 7, 'statement': {'expr': {
                        'expr': {'binary': {'left': {'variable': '__bareScriptIndex2'}, 'op': '+', 'right': {'number': 1.0}}},
                        'lineNumber': 15,
                        'name': '__bareScriptIndex2'
                    }}},
                    '17': {'count': 1, 'statement': {'expr': {'expr': {'number': 0.0}, 'lineNumber': 17, 'name': 'ix'}}},
                    '18': {'count': 7, 'statement': {'jump': {
                        'expr': {'unary': {'expr': {'variable': 'true'}, 'op': '!'}},
                        'label': '__bareScriptDone3',
                        'lineNumber': 18
                    }}},
                    '19': {'count': 6, 'statement': {'jump': {
                        'expr': {'unary': {
                            'expr': {'binary': {'left': {'variable': 'ix'}, 'op': '==', 'right': {'number': 5.0}}},
                            'op': '!'
                        }},
                        'label': '__bareScriptDone4',
                        'lineNumber': 19
                    }}},
                    '20': {'count': 1, 'statement': {'jump': {'label': '__bareScriptDone3', 'lineNumber': 20}}},
                    '21': {'count': 5, 'statement': {'label': {'lineNumber': 21, 'name': '__bareScriptDone4'}}},
                    '22': {'count': 5, 'statement': {'expr': {
                        'expr': {'binary': {'left': {'variable': 'ix'}, 'op': '+', 'right': {'number': 1.0}}},
                        'lineNumber': 22,
                        'name': 'ix'
                    }}},
                    '23': {'count': 5, 'statement': {'jump': {
                        'expr': {'unary': {
                            'expr': {'binary': {'left': {'variable': 'ix'}, 'op': '==', 'right': {'number': 3.0}}},
                            'op': '!'
                        }},
                        'label': '__bareScriptDone5',
                        'lineNumber': 23
                    }}},
                    '24': {'count': 1, 'statement': {'jump': {'label': '__bareScriptLoop3', 'lineNumber': 24}}},
                    '25': {'count': 4, 'statement': {'label': {'lineNumber': 25, 'name': '__bareScriptDone5'}}},
                    '26': {'count': 5, 'statement': {'jump': {
                        'expr': {'variable': 'true'},
                        'label': '__bareScriptLoop3',
                        'lineNumber': 26
                    }}},
                    '28': {'count': 1, 'statement': {'return': {'expr': {'variable': 'true'}, 'lineNumber': 28}}},
                    '31': {'count': 1, 'statement': {'return': {'expr': {'function': {'args': [], 'name': 'main'}}, 'lineNumber': 31}}}
                }
            }
        }
    });
});


test('executeScript, coverage include', async () => {
    const fetchFn = (url) => {
        if (url === 'system/sysutil.bare') {
            return {'ok': true, 'text': () => 'a = 1'};
        }
        assert.equal(url, 'util.bare');
        return {'ok': true, 'text': () => 'b = 2'};
    };

    const script = validateScript({
        'scriptName': 'test.bare',
        'scriptLines': [
            'include <sysutil.bare>',
            '',
            "include 'util.bare'"
        ],
        'statements': [
            {'include': {'includes': [{'url': 'sysutil.bare', 'system': true}], 'lineNumber': 1}},
            {'include': {'includes': [{'url': 'util.bare'}], 'lineNumber': 3}}
        ]
    });
    const options = {
        'globals': {[coverageGlobalName]: {'enabled': true}},
        fetchFn,
        'systemPrefix': 'system/'
    };
    assert.equal(await executeScriptAsync(script, options), null);
    assert.equal(options.globals.a, 1);
    assert.equal(options.globals.b, 2);
    assert.deepEqual(options.globals[coverageGlobalName], {
        'enabled': true,
        'scripts': {
            'test.bare': {
                'script': script,
                'covered': {
                    '1': {
                        'statement': {'include': {'lineNumber': 1, 'includes': [ {'url': 'sysutil.bare', 'system': true}]}},
                        'count': 1
                    },
                    '3': {
                        'statement': {'include': {'lineNumber': 3, 'includes': [ {'url': 'util.bare'}]}},
                        'count': 1
                    }
                }
            },
            'util.bare': {
                'script': {
                    'statements': [
                        {'expr': {'name': 'b', 'expr': {'number': 2.0}, 'lineNumber': 1}}
                    ],
                    'scriptLines': [
                        'b = 2'
                    ],
                    'scriptName': 'util.bare'
                },
                'covered': {
                    '1': {
                        'statement': {'expr': {'name': 'b', 'expr': {'number': 2.0}, 'lineNumber': 1}},
                        'count': 1
                    }
                }
            }
        }
    });
});


test('executeScriptAsync, coverage disabled', async () => {
    const fetchFn = (url) => {
        assert.equal(url, 'system/sysutil.bare');
        return {'ok': true, 'text': () => 'b = 7'};
    };

    const script = validateScript({
        'scriptName': 'test.bare',
        'scriptLines': [
            'include <sysutil.bare>',
            'a = 5',
            'return a + b'
        ],
        'statements': [
            {'include': {'includes': [{'url': 'sysutil.bare', 'system': true}], 'lineNumber': 1}},
            {'expr': {'name': 'a', 'expr': {'number': 5}, 'lineNumber': 2}},
            {'expr': {'name': 'b', 'expr': {'number': 7}, 'lineNumber': 3}},
            {'return': {'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}, 'lineNumber': 4}}
        ]
    });
    const options = {
        'globals': {[coverageGlobalName]: {'enabled': false}},
        fetchFn,
        'systemPrefix': 'system/'
    };
    assert.equal(await executeScriptAsync(script, options), 12);
    assert.deepEqual(options.globals[coverageGlobalName], {'enabled': false});
});


test('executeScriptAsync, coverage non-object', async () => {
    const script = validateScript({
        'scriptName': 'test.bare',
        'scriptLines': [
            'a = 5',
            'b = 7',
            'return a + b'
        ],
        'statements': [
            {'expr': {'name': 'a', 'expr': {'number': 5}, 'lineNumber': 1}},
            {'expr': {'name': 'b', 'expr': {'number': 7}, 'lineNumber': 2}},
            {'return': {'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}, 'lineNumber': 3}}
        ]
    });
    const options = {'globals': {[coverageGlobalName]: 42}};
    assert.equal(await executeScriptAsync(script, options), 12);
    assert.equal(options.globals[coverageGlobalName], 42);
});


test('executeScriptAsync, coverage no name', async () => {
    const script = validateScript({
        'scriptLines': [
            'a = 5',
            'b = 7',
            'return a + b'
        ],
        'statements': [
            {'expr': {'name': 'a', 'expr': {'number': 5}, 'lineNumber': 1}},
            {'expr': {'name': 'b', 'expr': {'number': 7}, 'lineNumber': 2}},
            {'return': {'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}, 'lineNumber': 3}}
        ]
    });
    const options = {'globals': {[coverageGlobalName]: {'enabled': true}}};
    assert.equal(await executeScriptAsync(script, options), 12);
    assert.deepEqual(options.globals[coverageGlobalName], {'enabled': true});
});


test('executeScriptAsync, coverage no linenos', async () => {
    const script = validateScript({
        'scriptName': 'test.bare',
        'scriptLines': [
            'a = 5',
            'b = 7',
            'return a + b'
        ],
        'statements': [
            {'expr': {'name': 'a', 'expr': {'number': 5}}},
            {'expr': {'name': 'b', 'expr': {'number': 7}}},
            {'return': {'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}}}
        ]
    });
    const options = {'globals': {[coverageGlobalName]: {'enabled': true}}};
    assert.equal(await executeScriptAsync(script, options), 12);
    assert.deepEqual(options.globals[coverageGlobalName], {'enabled': true});
});


test('executeScriptAsync, function', async () => {
    const options = {'globals': {}};
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'name': 'multiplyNumbers',
                    'args': ['a', 'b'],
                    'statements': [
                        {'expr': {'name': 'c', 'expr': {'variable': 'b'}}},
                        {'return': {
                            'expr': {'binary': {'op': '*', 'left': {'variable': 'a'}, 'right': {'variable': 'c'}}}
                        }}
                    ]
                }
            },
            {'return': {
                'expr': {'function': {'name': 'multiplyNumbers', 'args': [{'number': 5}, {'number': 7}]}}
            }}
        ]
    });
    assert.equal(await executeScriptAsync(script, options), 35);
    assert.equal(typeof options.globals.multiplyNumbers, 'function');
    assert.equal(options.globals.multiplyNumbers.constructor.name, 'Function');
});


test('executeScriptAsync, function missing arg', async () => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'name': 'createPair',
                    'args': ['a', 'b'],
                    'statements': [
                        {'return': {
                            'expr': {'function': {'name': 'arrayNew', 'args': [{'variable': 'a'}, {'variable': 'b'}]}}
                        }}
                    ]
                }
            },
            {'return': {
                'expr': {'function': {'name': 'createPair', 'args': [{'number': 5}]}}
            }}
        ]
    });
    assert.deepEqual(await executeScriptAsync(script), [5, null]);
});


test('executeScriptAsync, function lastArgArray', async () => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'name': 'test',
                    'args': ['a', 'b'],
                    'lastArgArray': true,
                    'statements': [
                        {'return': {
                            'expr': {'function': {'name': 'arrayNew', 'args': [{'variable': 'a'}, {'variable': 'b'}]}}
                        }}
                    ]
                }
            },
            {'return': {
                'expr': {'function': {'name': 'test', 'args': [{'number': 1}, {'number': 2}, {'number': 3}]}}
            }}
        ]
    });
    assert.deepEqual(await executeScriptAsync(script), [1, [2, 3]]);
});


test('executeScriptAsync, function lastArgArray missing', async () => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'name': 'test',
                    'args': ['a', 'b'],
                    'lastArgArray': true,
                    'statements': [
                        {'return': {
                            'expr': {'function': {'name': 'arrayNew', 'args': [{'variable': 'a'}, {'variable': 'b'}]}}
                        }}
                    ]
                }
            },
            {'return': {
                'expr': {'function': {'name': 'test', 'args': [{'number': 1}]}}
            }}
        ]
    });
    assert.deepEqual(await executeScriptAsync(script), [1, []]);
});


test('executeScriptAsync, function async', async () => {
    const options = {'globals': {}};
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'async': true,
                    'name': 'multiplyNumbers',
                    'args': ['a', 'b'],
                    'statements': [
                        {'expr': {'name': 'c', 'expr': {'variable': 'b'}}},
                        {'return': {
                            'expr': {'binary': {'op': '*', 'left': {'variable': 'a'}, 'right': {'variable': 'c'}}}
                        }}
                    ]
                }
            },
            {'return': {
                'expr': {'function': {'name': 'multiplyNumbers', 'args': [{'number': 5}, {'number': 7}]}}
            }}
        ]
    });
    assert.equal(await executeScriptAsync(script, options), 35);
    assert.equal(typeof options.globals.multiplyNumbers, 'function');
    assert.equal(options.globals.multiplyNumbers.constructor.name, 'AsyncFunction');
});


test('executeScriptAsync, function async missing arg', async () => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'async': true,
                    'name': 'createPair',
                    'args': ['a', 'b'],
                    'statements': [
                        {'return': {
                            'expr': {'function': {'name': 'arrayNew', 'args': [{'variable': 'a'}, {'variable': 'b'}]}}
                        }}
                    ]
                }
            },
            {'return': {
                'expr': {'function': {'name': 'createPair', 'args': [{'number': 5}]}}
            }}
        ]
    });
    assert.deepEqual(await executeScriptAsync(script), [5, null]);
});


test('executeScriptAsync, function async lastArgArray', async () => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'async': true,
                    'name': 'test',
                    'args': ['a', 'b'],
                    'lastArgArray': true,
                    'statements': [
                        {'return': {
                            'expr': {'function': {'name': 'arrayNew', 'args': [{'variable': 'a'}, {'variable': 'b'}]}}
                        }}
                    ]
                }
            },
            {'return': {
                'expr': {'function': {'name': 'test', 'args': [{'number': 1}, {'number': 2}, {'number': 3}]}}
            }}
        ]
    });
    assert.deepEqual(await executeScriptAsync(script), [1, [2, 3]]);
});


test('executeScriptAsync, function async lastArgArray missing', async () => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'async': true,
                    'name': 'test',
                    'args': ['a', 'b'],
                    'lastArgArray': true,
                    'statements': [
                        {'return': {
                            'expr': {'function': {'name': 'arrayNew', 'args': [{'variable': 'a'}, {'variable': 'b'}]}}
                        }}
                    ]
                }
            },
            {'return': {
                'expr': {'function': {'name': 'test', 'args': [{'number': 1}]}}
            }}
        ]
    });
    assert.deepEqual(await executeScriptAsync(script), [1, []]);
});


test('executeScriptAsync, function error', async () => {
    const script = validateScript({
        'statements': [
            {'return': {
                'expr': {'function': {'name': 'errorFunction'}}
            }}
        ]
    });
    const errorFunction = async () => {
        throw Error('unexpected error');
    };
    const options = {'globals': {errorFunction}};
    assert.equal(await executeScriptAsync(script, options), null);
});


test('executeScriptAsync, function argument error', async () => {
    const script = validateScript({
        'statements': [
            {'return': {
                'expr': {'function': {'name': 'errorFunction'}}
            }}
        ]
    });
    const errorFunction = async () => {
        throw new ValueArgsError('myArg', null, -1);
    };
    const options = {'globals': {errorFunction}};
    assert.equal(await executeScriptAsync(script, options), -1);
});


test('executeScriptAsync, function error log', async () => {
    const script = validateScript({
        'statements': [
            {'return': {
                'expr': {'function': {'name': 'errorFunction'}}
            }}
        ]
    });
    const errorFunction = async () => {
        throw Error('unexpected error');
    };
    const logs = [];
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {'globals': {errorFunction}, logFn, 'debug': true};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.deepEqual(logs, ['BareScript: Function "errorFunction" failed with error: unexpected error']);
});


test('executeScriptAsync, function error log no-debug', async () => {
    const script = validateScript({
        'statements': [
            {'return': {
                'expr': {'function': {'name': 'errorFunction'}}
            }}
        ]
    });
    const errorFunction = async () => {
        throw Error('unexpected error');
    };
    const logs = [];
    /* c8 ignore next 2 */
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {'globals': {errorFunction}, logFn, 'debug': false};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.deepEqual(logs, []);
});


test('executeScriptAsync, function native call', () => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'name': 'multiplyNumbers',
                    'args': ['a', 'b'],
                    'statements': [
                        {'expr': {'name': 'c', 'expr': {'variable': 'b'}}},
                        {'return': {
                            'expr': {'binary': {'op': '*', 'left': {'variable': 'a'}, 'right': {'variable': 'c'}}}
                        }}
                    ]
                }
            }
        ]
    });
    const globals = {};
    executeScriptAsync(script, {globals});
    const options = {globals};
    assert.equal(globals.multiplyNumbers([2, 3], options), 6);
    assert.equal(options.statementCount, 2);
});


test('executeScriptAsync, function async native call', async () => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'async': true,
                    'name': 'multiplyNumbers',
                    'args': ['a', 'b'],
                    'statements': [
                        {'expr': {'name': 'c', 'expr': {'variable': 'b'}}},
                        {'return': {
                            'expr': {'binary': {'op': '*', 'left': {'variable': 'a'}, 'right': {'variable': 'c'}}}
                        }}
                    ]
                }
            }
        ]
    });
    const globals = {};
    await executeScriptAsync(script, {globals});
    const options = {globals};
    assert.equal(await globals.multiplyNumbers([2, 3], options), 6);
    assert.equal(options.statementCount, 2);
});


test('executeScriptAsync, jump', async () => {
    const script = validateScript({
        'statements': [
            {'expr': {'name': 'a', 'expr': {'number': 5}}},
            {'jump': {'label': 'lab2'}},
            {'label':{'name':  'lab'}},
            {'expr': {'name': 'a', 'expr': {'number': 6}}},
            {'jump': {'label': 'lab3'}},
            {'label':{'name':  'lab2'}},
            {'expr': {'name': 'a', 'expr': {'number': 7}}},
            {'jump': {'label': 'lab'}},
            {'label':{'name':  'lab3'}},
            {'return': {'expr': {'variable': 'a'}}}
        ]
    });
    assert.equal(await executeScriptAsync(script), 6);
});


test('executeScriptAsync, jumpif', async () => {
    const script = validateScript({
        'statements': [
            {'expr': {'name': 'n', 'expr': {'number': 10}}},
            {'expr': {'name': 'i', 'expr': {'number': 0}}},
            {'expr': {'name': 'a', 'expr': {'number': 0}}},
            {'expr': {'name': 'b', 'expr': {'number': 1}}},
            {'label':{'name':  'fib'}},
            {'jump': {
                'label': 'fibend',
                'expr': {'binary': {'op': '>=', 'left': {'variable': 'i'}, 'right': {'variable': 'n'}}}
            }},
            {'expr': {'name': 'tmp', 'expr': {'variable': 'b'}}},
            {'expr': {
                'name': 'b',
                'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
            }},
            {'expr': {'name': 'a', 'expr': {'variable': 'tmp'}}},
            {'expr': {'name': 'i', 'expr': {'binary': {'op': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}}},
            {'jump': {'label': 'fib'}},
            {'label':{'name':  'fibend'}},
            {'return': {'expr': {'variable': 'a'}}}
        ]
    });
    assert.equal(await executeScriptAsync(script), 55);
});


test('executeScriptAsync, jump error unknown label', async () => {
    const script = validateScript({
        'statements': [
            {'jump': {'label': 'unknownLabel'}}
        ]
    });
    assert.rejects(
        async () => executeScriptAsync(script),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Unknown jump label "unknownLabel"'
        }
    );
});


test('executeScriptAsync, jump error unknown label script name', async () => {
    const script = validateScript({
        'scriptName': 'test.bare',
        'statements': [
            {'jump': {'label': 'unknownLabel', 'lineNumber': 1}}
        ]
    });
    assert.rejects(
        async () => executeScriptAsync(script),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'test.bare:1: Unknown jump label "unknownLabel"'
        }
    );
});


test('executeScriptAsync, return', async () => {
    const script = validateScript({
        'statements': [
            {'return': {'expr': {'number': 5}}}
        ]
    });
    assert.equal(await executeScriptAsync(script), 5);
});


test('executeScriptAsync, return blank', async () => {
    const script = validateScript({
        'statements': [
            {'return': {}}
        ]
    });
    assert.equal(await executeScriptAsync(script), null);
});


test('executeScriptAsync, include', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert(url === 'test.bare' || url === 'test2.bare');
        return {
            'ok': true,
            'text': () => (url.endsWith('test2.bare') ? 'b = 1' : `\
include 'test2.bare'
a = 1
`)
        };
    };
    const options = {'globals': {}, fetchFn};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.equal(options.globals.a, 1);
    assert.equal(options.globals.b, 1);
});


test('executeScriptAsync, include no fetchFn', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare'}]}}
        ]
    });
    assert.rejects(
        async () => executeScriptAsync(script),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Include of "test.bare" failed'
        }
    );
});


test('executeScriptAsync, include system', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare', 'system': true}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'system/test.bare');
        return {
            'ok': true,
            'text': () => 'a = 1'
        };
    };
    const options = {'globals': {}, fetchFn, 'systemPrefix': 'system/'};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.equal(options.globals.a, 1);
});


test('executeScriptAsync, include system no system prefix', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare', 'system': true}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.bare');
        return {
            'ok': true,
            'text': () => 'a = 1'
        };
    };
    const options = {'globals': {}, fetchFn};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.equal(options.globals.a, 1);
});


test('executeScriptAsync, include system no system prefix with urlFn', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare', 'system': true}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, '/base/test.bare');
        return {
            'ok': true,
            'text': () => 'a = 1'
        };
    };
    const options = {'globals': {}, fetchFn, 'urlFn': (url) => `/base/${url}`};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.equal(options.globals.a, 1);
});


test('executeScriptAsync, include multiple', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare', 'system': true}, {'url': 'test2.bare'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert(url === 'test.bare' || url === 'test2.bare');
        return {
            'ok': true,
            'text': () => (url.endsWith('test2.bare') ? 'b = a + 1' : 'a = 1')
        };
    };
    const options = {'globals': {}, fetchFn};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.equal(options.globals.a, 1);
    assert.equal(options.globals.b, 2);
});


test('executeScriptAsync, include subdir', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'lib/test.bare'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert(url === 'lib/test.bare' || url === 'lib/test2.bare');
        return {
            'ok': true,
            'text': () => (url.endsWith('test2.bare') ? 'b = 1' : `\
include 'test2.bare'
a = 1
`)
        };
    };
    const options = {'globals': {}, fetchFn};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.equal(options.globals.a, 1);
    assert.equal(options.globals.b, 1);
});


test('executeScriptAsync, include absolute', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert(url === 'test.bare' || url === 'http://foo.local/test2.bare');
        return {
            'ok': true,
            'text': () => (url.endsWith('test2.bare') ? 'b = 1' : `\
include 'http://foo.local/test2.bare'
a = 1
`)
        };
    };
    const options = {'globals': {}, fetchFn};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.equal(options.globals.a, 1);
    assert.equal(options.globals.b, 1);
});


test('executeScriptAsync, include lint', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.bare');
        return {
            'ok': true,
            'text': () => `\
function test(a):
endfunction
`
        };
    };
    const logs = [];
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {'globals': {}, fetchFn, logFn, 'debug': true};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.deepEqual(logs, [
        'BareScript: Include "test.bare" static analysis... 1 warning:',
        'BareScript:     Unused argument "a" of function "test" (index 0)'
    ]);
});


test('executeScriptAsync, include lint multiple', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.bare');
        return {
            'ok': true,
            'text': () => `\
function test(a, b):
endfunction
`
        };
    };
    const logs = [];
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {'globals': {}, fetchFn, logFn, 'debug': true};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.deepEqual(logs, [
        'BareScript: Include "test.bare" static analysis... 2 warnings:',
        'BareScript:     Unused argument "a" of function "test" (index 0)',
        'BareScript:     Unused argument "b" of function "test" (index 0)'
    ]);
});


test('executeScriptAsync, include lint OK', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.bare');
        return {
            'ok': true,
            'text': () => `\
function test():
endfunction
`
        };
    };
    const logs = [];
    /* c8 ignore next 2 */
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {'globals': {}, fetchFn, logFn, 'debug': true};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.deepEqual(logs, []);
});


test('executeScriptAsync, include fetchFn not-ok', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.bare');
        return {
            'ok': false,
            'statusText': 'Not Found'
        };
    };
    const options = {fetchFn};
    assert.rejects(
        async () => executeScriptAsync(script, options),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Include of "test.bare" failed'
        }
    );
});


test('executeScriptAsync, include fetchFn response error', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare'}]}}
        ]
    });
    const fetchFn = () => {
        throw new Error('response error');
    };
    const options = {fetchFn};
    assert.rejects(
        async () => executeScriptAsync(script, options),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Include of "test.bare" failed'
        }
    );
});


test('executeScriptAsync, include fetchFn text error', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.bare');
        return {
            'ok': true,
            'text': () => {
                throw new Error('text error');
            }
        };
    };
    const options = {fetchFn};
    assert.rejects(
        async () => executeScriptAsync(script, options),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Include of "test.bare" failed'
        }
    );
});


test('executeScriptAsync, include fetchFn parser error', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.bare'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.bare');
        return {
            'ok': true,
            'text': () => 'foo bar'
        };
    };
    const options = {fetchFn};
    assert.rejects(
        async () => executeScriptAsync(script, options),
        {
            'name': 'BareScriptParserError',
            'message': `\
test.bare:1: Syntax error
foo bar
   ^
`
        }
    );
});


test('executeScriptAsync, error maxStatements', async () => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'async': true,
                    'name': 'fn',
                    'statements': [
                        {'expr': {'expr': {'variable': 'a'}}},
                        {'expr': {'expr': {'variable': 'b'}}}
                    ]
                }
            },
            {'expr': {'expr': {'function': {'name': 'fn'}}}}
        ]
    });
    assert.rejects(
        async () => executeScriptAsync(script, {'maxStatements': 3}),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Exceeded maximum script statements (3)'
        }
    );
    assert.equal(await executeScriptAsync(script, {'maxStatements': 4}), null);
    assert.equal(await executeScriptAsync(script, {'maxStatements': 0}), null);
});


test('evaluateExpressionAsync', async () => {
    const expr = validateExpression({
        'binary': {
            'op': '+',
            'left': {'number': 7},
            'right': {
                'binary': {
                    'op': '*',
                    'left': {'number': 3},
                    'right': {
                        'function': {
                            'name': 'testNumber'
                        }
                    }
                }
            }
        }
    });
    const options = {'globals': {testNumber}};
    assert.equal(await evaluateExpressionAsync(expr, options), 13);
});


test('evaluateExpressionAsync, no globals', async () => {
    const expr = validateExpression({'string': 'abc'});
    const options = {};
    assert.equal(await evaluateExpressionAsync(expr, options), 'abc');
});


test('evaluateExpressionAsync, string', async () => {
    const expr = validateExpression({'string': 'abc'});
    assert.equal(await evaluateExpressionAsync(expr), 'abc');
});


test('evaluateExpressionAsync, variable', async () => {
    const expr = validateExpression({'variable': 'varName'});
    const options = {'globals': {'varName': 4}};
    assert.equal(await evaluateExpressionAsync(expr, options), 4);
});


test('evaluateExpressionAsync, variable local', async () => {
    const expr = validateExpression({'variable': 'varName'});
    const locals = {'varName': 4};
    assert.equal(await evaluateExpressionAsync(expr, null, locals), 4);
    assert.deepEqual(locals, {'varName': 4});
});


test('evaluateExpressionAsync, variable null local non-null global', async () => {
    const expr = validateExpression({'variable': 'varName'});
    const options = {'globals': {'varName': 4}};
    const locals = {'varName': null};
    assert.equal(await evaluateExpressionAsync(expr, options, locals), null);
});


test('evaluateExpressionAsync, variable unknown', async () => {
    const expr = validateExpression({'variable': 'varName'});
    assert.equal(await evaluateExpressionAsync(expr), null);
});


test('evaluateExpressionAsync, variable literal null', async () => {
    const expr = validateExpression({'variable': 'null'});
    assert.equal(await evaluateExpressionAsync(expr), null);
});


test('evaluateExpressionAsync, variable literal true', async () => {
    const expr = validateExpression({'variable': 'true'});
    assert.equal(await evaluateExpressionAsync(expr), true);
});


test('evaluateExpressionAsync, variable literal false', async () => {
    const expr = validateExpression({'variable': 'false'});
    assert.equal(await evaluateExpressionAsync(expr), false);
});


test('evaluateExpressionAsync, function', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'myFunc',
            'args': [{'number': 1}, {'number': 2}]
        }
    });
    const options = {
        'globals': {
            'myFunc': async ([val1, val2]) => val1 + val2
        }
    };
    assert.equal(await evaluateExpressionAsync(expr, options), 3);
});


test('evaluateExpressionAsync, function no return', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'myFunc'
        }
    });
    const options = {
        'globals': {
            'myFunc': async () => {
                // no return
            }
        }
    };
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, function if', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'variable': 'test'},
                {'function': {'name': 'testValue', 'args': [{'string': 'a'}]}},
                {'function': {'name': 'testValue', 'args': [{'function': {'name': 'testString'}}]}}
            ]
        }
    });
    const testValues = [];
    const options = {
        'globals': {
            testString,
            'test': true,
            'testValue': ([value]) => {
                testValues.push(value);
                return value;
            }
        }
    };
    assert.equal(await evaluateExpressionAsync(expr, options), 'a');
    assert.deepEqual(testValues, ['a']);
    options.globals.test = false;
    assert.equal(await evaluateExpressionAsync(expr, options), 'abc');
    assert.deepEqual(testValues, ['a', 'abc']);
});


test('evaluateExpressionAsync, function if no value expression', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'if'
        }
    });
    assert.equal(await evaluateExpressionAsync(expr), null);
});


test('evaluateExpressionAsync, function if no true expression', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'function': {'name': 'testNumber'}}
            ]
        }
    });
    const options = {'globals': {testNumber}};
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, function if no false expression', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'function': {'name': 'testFalse'}},
                {'number': 1}
            ]
        }
    });
    const options = {'globals': {testFalse}};
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, function builtin', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'abs',
            'args': [
                {'function': {'name': 'testNumber'}}
            ]
        }
    });
    const options = {'globals': {testNumber}};
    assert.equal(await evaluateExpressionAsync(expr, options), 2);
});


test('evaluateExpressionAsync, function no-builtins', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'abs',
            'args': [
                {'function': {'name': 'testNumber'}}
            ]
        }
    });
    const options = {'globals': {testNumber}};
    assert.rejects(
        async () => evaluateExpressionAsync(expr, options, null, false),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Undefined function "abs"'
        }
    );
});


test('evaluateExpressionAsync, function global', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnName',
            'args': [
                {'function': {'name': 'testNumber'}}
            ]
        }
    });
    const options = {'globals': {testNumber, 'fnName': ([number]) => 2 * number}};
    assert.equal(await evaluateExpressionAsync(expr, options), 4);
});


test('evaluateExpressionAsync, function local', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'function': {'name': 'testNumber'}}
            ]
        }
    });
    const options = {'globals': {testNumber}};
    const locals = {'fnLocal': ([number]) => 2 * number};
    assert.equal(await evaluateExpressionAsync(expr, options, locals), 4);
});


test('evaluateExpressionAsync, function local null', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'function': {'name': 'testString'}}
            ]
        }
    });
    const options = {'globals': {testString, 'fnLocal': 'abc'}};
    const locals = {'fnLocal': null};
    assert.rejects(
        async () => evaluateExpressionAsync(expr, options, locals),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Undefined function "fnLocal"'
        }
    );
});


test('evaluateExpressionAsync, function non-function', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'function': {'name': 'testString'}}
            ]
        }
    });
    const options = {'globals': {testString, 'fnLocal': 'abc'}};
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, function non-function logFn', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'function': {'name': 'testString'}}
            ]
        }
    });
    const logs = [];
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {'globals': {testString, 'fnLocal': 'abc'}, logFn, 'debug': true};
    assert.equal(await evaluateExpressionAsync(expr, options, null, options), null);
    assert.deepEqual(logs, ['BareScript: Function "fnLocal" failed with error: funcValue is not a function']);
});


test('evaluateExpressionAsync, function unknown', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnUnknown',
            'args': [
                {'function': {'name': 'testString'}}
            ]
        }
    });
    const options = {'globals': {}};
    const locals = {testString};
    assert.rejects(
        async () => evaluateExpressionAsync(expr, options, locals),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Undefined function "fnUnknown"'
        }
    );
});


test('evaluateExpressionAsync, function unknown no globals', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnUnknown',
            'args': [
                {'function': {'name': 'testString'}}
            ]
        }
    });
    const locals = {testString};
    assert.rejects(
        async () => evaluateExpressionAsync(expr, null, locals),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Undefined function "fnUnknown"'
        }
    );
});


test('evaluateExpressionAsync, function async', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnAsync'
        }
    });
    const options = {'globals': {'fnAsync': async () => null}};
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, function runtime error', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'test'
        }
    });
    const options = {
        'globals': {
            'test': async () => {
                throw new BareScriptRuntimeError(null, null, 'Test error');
            }
        }
    };
    assert.rejects(
        async () => evaluateExpressionAsync(expr, options),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Test error'
        }
    );
});


test('evaluateExpressionAsync, binary logical and', async () => {
    const expr = validateExpression({
        'binary': {
            'op': '&&',
            'left': {'variable': 'leftValue'},
            'right': {'function': {'name': 'testValue', 'args': [{'function': {'name': 'testString'}}]}}
        }
    });
    const testValues = [];
    const options = {
        'globals': {
            testString,
            'testValue': ([value]) => {
                testValues.push(value);
                return value;
            }
        }
    };
    assert.equal(await evaluateExpressionAsync(expr, options), null);
    assert.deepEqual(testValues, []);
    options.globals.leftValue = true;
    assert.equal(await evaluateExpressionAsync(expr, options), 'abc');
    assert.deepEqual(testValues, ['abc']);
});


test('evaluateExpressionAsync, binary logical or', async () => {
    const expr = validateExpression({
        'binary': {
            'op': '||',
            'left': {'variable': 'leftValue'},
            'right': {'function': {'name': 'testValue', 'args': [{'function': {'name': 'testString'}}]}}
        }
    });
    const testValues = [];
    const options = {
        'globals': {
            testString,
            'leftValue': true,
            'testValue': ([value]) => {
                testValues.push(value);
                return value;
            }
        }
    };
    assert.equal(await evaluateExpressionAsync(expr, options), true);
    assert.deepEqual(testValues, []);
    options.globals.leftValue = false;
    assert.equal(await evaluateExpressionAsync(expr, options), 'abc');
    assert.deepEqual(testValues, ['abc']);
});


test('evaluateExpressionAsync, binary addition', async () => {
    const options = {'globals': {testDate, testNumber, testString}};

    // number + number
    let expr = validateExpression({'binary': {'op': '+', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 12);

    // string + string
    expr = validateExpression({'binary': {'op': '+', 'left': {'string': 'foo'}, 'right': {'function': {'name': 'testString'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 'fooabc');

    // string + <non-string>
    expr = validateExpression({'binary': {'op': '+', 'left': {'string': 'foo'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 'foo2');

    // <non-string> + string
    expr = validateExpression({'binary': {'op': '+', 'left': {'function': {'name': 'testNumber'}}, 'right': {'string': 'foo'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), '2foo');

    // datetime + number
    expr = validateExpression({'binary': {'op': '+', 'left': {'function': {'name': 'testDate'}}, 'right': {'number': 86400000}}});
    assert.deepEqual(await evaluateExpressionAsync(expr, options), new Date(2024, 1, 7));

    // number + datetime
    expr = validateExpression({'binary': {'op': '+', 'left': {'number': -86400000}, 'right': {'function': {'name': 'testDate'}}}});
    assert.deepEqual(await evaluateExpressionAsync(expr, options), new Date(2024, 1, 5));

    // Invalid - bool + number
    expr = validateExpression({'binary': {'op': '+', 'left': {'variable': 'true'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - number + bool
    expr = validateExpression({'binary': {'op': '+', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - datetime + bool
    expr = validateExpression({'binary': {'op': '+', 'left': {'function': {'name': 'testDate'}}, 'right': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - bool + datetime
    expr = validateExpression({'binary': {'op': '+', 'left': {'variable': 'true'}, 'right': {'function': {'name': 'testDate'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid
    expr = validateExpression({'binary': {'op': '+', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, binary subtraction', async () => {
    const options = {'globals': {'dt2': new Date(2024, 1, 7), testDate, testNumber}};

    // number - number
    let expr = validateExpression({'binary': {'op': '-', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 8);

    // datetime - datetime
    expr = validateExpression({'binary': {'op': '-', 'left': {'variable': 'dt2'}, 'right': {'function': {'name': 'testDate'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 86400000);

    // Invalid - bool - number
    expr = validateExpression({'binary': {'op': '-', 'left': {'variable': 'true'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - number - bool
    expr = validateExpression({'binary': {'op': '-', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid
    expr = validateExpression({'binary': {'op': '-', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, binary multiplication', async () => {
    const options = {'globals': {testNumber}};

    // number * number
    let expr = validateExpression({'binary': {'op': '*', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 20);

    // Invalid - bool * number
    expr = validateExpression({'binary': {'op': '*', 'left': {'variable': 'true'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - number * bool
    expr = validateExpression({'binary': {'op': '*', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid
    expr = validateExpression({'binary': {'op': '*', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, binary division', async () => {
    const options = {'globals': {testNumber}};

    // number / number
    let expr = validateExpression({'binary': {'op': '/', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 5);

    // Invalid - bool / number
    expr = validateExpression({'binary': {'op': '/', 'left': {'variable': 'true'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - number / bool
    expr = validateExpression({'binary': {'op': '/', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid
    expr = validateExpression({'binary': {'op': '/', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, binary equality', async () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'binary': {'op': '==', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), false);
});


test('evaluateExpressionAsync, binary inequality', async () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'binary': {'op': '!=', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), true);
});


test('evaluateExpressionAsync, binary less-than-or-equal-to', async () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'binary': {'op': '<=', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), false);
});


test('evaluateExpressionAsync, binary less-than', async () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'binary': {'op': '<', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), false);
});


test('evaluateExpressionAsync, binary greater-than-or-equal-to', async () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'binary': {'op': '>=', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), true);
});


test('evaluateExpressionAsync, binary greater-than', async () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'binary': {'op': '>', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), true);
});


test('evaluateExpressionAsync, binary modulus', async () => {
    const options = {'globals': {testNumber}};

    // number % number
    let expr = validateExpression({'binary': {'op': '%', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 0);

    // Invalid - bool % number
    expr = validateExpression({'binary': {'op': '%', 'left': {'variable': 'true'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - number % bool
    expr = validateExpression({'binary': {'op': '%', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid
    expr = validateExpression({'binary': {'op': '%', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, binary exponentiation', async () => {
    const options = {'globals': {testNumber}};

    // number ** number
    let expr = validateExpression({'binary': {'op': '**', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 100);

    // Invalid - bool ** number
    expr = validateExpression({'binary': {'op': '**', 'left': {'variable': 'true'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - number ** bool
    expr = validateExpression({'binary': {'op': '**', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid
    expr = validateExpression({'binary': {'op': '**', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, binary bitwise and', async () => {
    const options = {'globals': {'testNumber': testNumber}};

    // number & number
    let expr = validateExpression({'binary': {'op': '&', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 2);

    // Left float
    expr = validateExpression({'binary': {'op': '&', 'left': {'number': 10.}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 2);

    // Right float
    expr = validateExpression({'binary': {'op': '&', 'left': {'function': {'name': 'testNumber'}}, 'right': {'number': 6.}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 2);

    // Invalid - left non-integer
    expr = validateExpression({'binary': {'op': '&', 'left': {'number': 10.5}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - right non-integer
    expr = validateExpression({'binary': {'op': '&', 'left': {'function': {'name': 'testNumber'}}, 'right': {'number': 2.5}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - left bool
    expr = validateExpression({'binary': {'op': '&', 'left': {'variable': 'true'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - right bool
    expr = validateExpression({'binary': {'op': '&', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid
    expr = validateExpression({'binary': {'op': '&', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, binary bitwise or', async () => {
    const options = {'globals': {'testNumber': testNumber}};

    // number | number
    let expr = validateExpression({'binary': {'op': '|', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 10);

    // Left float
    expr = validateExpression({'binary': {'op': '|', 'left': {'number': 10.}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 10);

    // Right float
    expr = validateExpression({'binary': {'op': '|', 'left': {'function': {'name': 'testNumber'}}, 'right': {'number': 6.}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 6);

    // Invalid - left non-integer
    expr = validateExpression({'binary': {'op': '|', 'left': {'number': 10.5}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - right non-integer
    expr = validateExpression({'binary': {'op': '|', 'left': {'function': {'name': 'testNumber'}}, 'right': {'number': 2.5}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - left bool
    expr = validateExpression({'binary': {'op': '|', 'left': {'variable': 'true'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - right bool
    expr = validateExpression({'binary': {'op': '|', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid
    expr = validateExpression({'binary': {'op': '|', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, binary bitwise xor', async () => {
    const options = {'globals': {'testNumber': testNumber}};

    // number ^ number
    let expr = validateExpression({'binary': {'op': '^', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 8);

    // Left float
    expr = validateExpression({'binary': {'op': '^', 'left': {'number': 10.}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 8);

    // Right float
    expr = validateExpression({'binary': {'op': '^', 'left': {'function': {'name': 'testNumber'}}, 'right': {'number': 6.}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 4);

    // Invalid - left non-integer
    expr = validateExpression({'binary': {'op': '^', 'left': {'number': 10.5}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - right non-integer
    expr = validateExpression({'binary': {'op': '^', 'left': {'function': {'name': 'testNumber'}}, 'right': {'number': 2.5}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - left bool
    expr = validateExpression({'binary': {'op': '^', 'left': {'variable': 'true'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - right bool
    expr = validateExpression({'binary': {'op': '^', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid
    expr = validateExpression({'binary': {'op': '^', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, binary left shift', async () => {
    const options = {'globals': {'testNumber': testNumber}};

    // number << number
    let expr = validateExpression({'binary': {'op': '<<', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 40);

    // Left float
    expr = validateExpression({'binary': {'op': '<<', 'left': {'number': 10.}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 40);

    // Right float
    expr = validateExpression({'binary': {'op': '<<', 'left': {'function': {'name': 'testNumber'}}, 'right': {'number': 2.}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 8);

    // Invalid - left non-integer
    expr = validateExpression({'binary': {'op': '<<', 'left': {'number': 10.5}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - right non-integer
    expr = validateExpression({'binary': {'op': '<<', 'left': {'function': {'name': 'testNumber'}}, 'right': {'number': 2.5}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - left bool
    expr = validateExpression({'binary': {'op': '<<', 'left': {'variable': 'true'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - right bool
    expr = validateExpression({'binary': {'op': '<<', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid
    expr = validateExpression({'binary': {'op': '<<', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, binary right shift', async () => {
    const options = {'globals': {'testNumber': testNumber}};

    // number >> number
    let expr = validateExpression({'binary': {'op': '>>', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 2);

    // Left float
    expr = validateExpression({'binary': {'op': '>>', 'left': {'number': 10.}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 2);

    // Right float
    expr = validateExpression({'binary': {'op': '>>', 'left': {'function': {'name': 'testNumber'}}, 'right': {'number': 1.}}});
    assert.equal(await evaluateExpressionAsync(expr, options), 1);

    // Invalid - left non-integer
    expr = validateExpression({'binary': {'op': '>>', 'left': {'number': 10.5}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - right non-integer
    expr = validateExpression({'binary': {'op': '>>', 'left': {'function': {'name': 'testNumber'}}, 'right': {'number': 2.5}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - left bool
    expr = validateExpression({'binary': {'op': '>>', 'left': {'variable': 'true'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - right bool
    expr = validateExpression({'binary': {'op': '>>', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid
    expr = validateExpression({'binary': {'op': '>>', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, unary not', async () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'unary': {'op': '!', 'expr': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), false);
});


test('evaluateExpressionAsync, unary negate', async () => {
    const options = {'globals': {testNumber, testString}};

    // - number
    let expr = validateExpression({'unary': {'op': '-', 'expr': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), -2);

    // Invalid
    expr = validateExpression({'unary': {'op': '-', 'expr': {'function': {'name': 'testString'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, unary bitwise not', async () => {
    const options = {'globals': {'testNumber': testNumber, 'testString': testString}};

    // ~ number
    let expr = validateExpression({'unary': {'op': '~', 'expr': {'function': {'name': 'testNumber'}}}});
    assert.equal(await evaluateExpressionAsync(expr, options), -3);

    // Float
    expr = validateExpression({'unary': {'op': '~', 'expr': {'number': 2.}}});
    assert.equal(await evaluateExpressionAsync(expr, options), -3);

    // Invalid - non-integer
    expr = validateExpression({'unary': {'op': '~', 'expr': {'number': 2.5}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid - bool
    expr = validateExpression({'unary': {'op': '~', 'expr': {'variable': 'true'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);

    // Invalid
    expr = validateExpression({'unary': {'op': '~', 'expr': {'variable': 'null'}}});
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, group', async () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({
        'group': {
            'binary': {
                'op': '*',
                'left': {'function': {'name': 'testNumber'}},
                'right': {
                    'group': {
                        'binary': {
                            'op': '+',
                            'left': {'number': 3},
                            'right': {'number': 5}
                        }
                    }
                }
            }
        }
    });
    assert.equal(await evaluateExpressionAsync(expr, options), 16);
});


//
// Helper functions to get test values of specific types
//


async function testDate() {
  return new Promise(resolve => {
    resolve(new Date(2024, 1, 6));
  });
}


async function testFalse() {
  return new Promise(resolve => {
    resolve(false);
  });
}


async function testNumber() {
  return new Promise(resolve => {
    resolve(2);
  });
}


async function testString() {
  return new Promise(resolve => {
    resolve('abc');
  });
}
