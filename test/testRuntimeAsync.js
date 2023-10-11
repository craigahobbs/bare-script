// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/* eslint-disable require-await */

import {evaluateExpressionAsync, executeScriptAsync} from '../lib/runtimeAsync.js';
import {validateExpression, validateScript} from '../lib/model.js';
import {BareScriptRuntimeError} from '../lib/runtime.js';
import {strict as assert} from 'node:assert';
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


test('executeScriptAsync, function', async () => {
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
    assert.equal(await executeScriptAsync(script), 35);
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
    assert.equal(await executeScriptAsync(script), 35);
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


test('executeScriptAsync, jump', async () => {
    const script = validateScript({
        'statements': [
            {'expr': {'name': 'a', 'expr': {'number': 5}}},
            {'jump': {'label': 'lab2'}},
            {'label': 'lab'},
            {'expr': {'name': 'a', 'expr': {'number': 6}}},
            {'jump': {'label': 'lab3'}},
            {'label': 'lab2'},
            {'expr': {'name': 'a', 'expr': {'number': 7}}},
            {'jump': {'label': 'lab'}},
            {'label': 'lab3'},
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
            {'label': 'fib'},
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
            {'label': 'fibend'},
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
            {'include': {'includes': [{'url': 'test.mds'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert(url === 'test.mds' || url === 'test2.mds');
        return {
            'ok': true,
            'text': () => (url.endsWith('test2.mds') ? 'b = 1' : `\
include 'test2.mds'
a = 1
`)
        };
    };
    const options = {'globals': {}, fetchFn};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.equal(options.globals.a, 1);
    assert.equal(options.globals.b, 1);
});


test('executeScriptAsync, include system', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.mds', 'system': true}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'system/test.mds');
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
            {'include': {'includes': [{'url': 'test.mds', 'system': true}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.mds');
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
            {'include': {'includes': [{'url': 'test.mds', 'system': true}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, '/base/test.mds');
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
            {'include': {'includes': [{'url': 'test.mds', 'system': true}, {'url': 'test2.mds'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert(url === 'test.mds' || url === 'test2.mds');
        return {
            'ok': true,
            'text': () => (url.endsWith('test2.mds') ? 'b = a + 1' : 'a = 1')
        };
    };
    const options = {'globals': {}, fetchFn};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.equal(options.globals.a, 1);
    assert.equal(options.globals.b, 2);
});


test('executeScriptAsync, include no fetchFn', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.mds'}]}}
        ]
    });
    assert.rejects(
        async () => executeScriptAsync(script),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Include of "test.mds" failed'
        }
    );
});


test('executeScriptAsync, include fetchFn subdir', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'lib/test.mds'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert(url === 'lib/test.mds' || url === 'lib/test2.mds');
        return {
            'ok': true,
            'text': () => (url.endsWith('test2.mds') ? 'b = 1' : `\
include 'test2.mds'
a = 1
`)
        };
    };
    const options = {'globals': {}, fetchFn};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.equal(options.globals.a, 1);
    assert.equal(options.globals.b, 1);
});


test('executeScriptAsync, include fetchFn absolute', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.mds'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert(url === 'test.mds' || url === 'http://foo.local/test2.mds');
        return {
            'ok': true,
            'text': () => (url.endsWith('test2.mds') ? 'b = 1' : `\
include 'http://foo.local/test2.mds'
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
            {'include': {'includes': [{'url': 'test.mds'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.mds');
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
        'BareScript: Include "test.mds" static analysis... 1 warning:',
        'BareScript:     Unused argument "a" of function "test" (index 0)'
    ]);
});


test('executeScriptAsync, include lint no-debug', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.mds'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.mds');
        return {
            'ok': true,
            'text': () => `\
function test(a):
endfunction
`
        };
    };
    const logs = [];
    /* c8 ignore next 2 */
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {'globals': {}, fetchFn, logFn, 'debug': false};
    assert.equal(await executeScriptAsync(script, options), null);
    assert.deepEqual(logs, []);
});


test('executeScriptAsync, include lint multiple', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.mds'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.mds');
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
        'BareScript: Include "test.mds" static analysis... 2 warnings:',
        'BareScript:     Unused argument "a" of function "test" (index 0)',
        'BareScript:     Unused argument "b" of function "test" (index 0)'
    ]);
});


test('executeScriptAsync, include lint OK', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.mds'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.mds');
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
            {'include': {'includes': [{'url': 'test.mds'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.mds');
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
            'message': 'Include of "test.mds" failed'
        }
    );
});


test('executeScriptAsync, include fetchFn response error', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.mds'}]}}
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
            'message': 'Include of "test.mds" failed'
        }
    );
});


test('executeScriptAsync, include fetchFn text error', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.mds'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.mds');
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
            'message': 'Include of "test.mds" failed'
        }
    );
});


test('executeScriptAsync, include fetchFn parser error', async () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.mds'}]}}
        ]
    });
    const fetchFn = (url) => {
        assert.equal(url, 'test.mds');
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
Included from "test.mds"
Syntax error, line number 1:
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
                            'name': 'asyncCeil',
                            'args': [
                                {'variable': 'varName'}
                            ]
                        }
                    }
                }
            }
        }
    });
    const asyncCeil = async ([val]) => Math.ceil(val);
    const options = {'globals': {asyncCeil, 'varName': 4}};
    assert.equal(await evaluateExpressionAsync(expr, options), 19);
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
                {'function': {'name': 'testValue', 'args': [{'function': {'name': 'asyncB'}}]}}
            ]
        }
    });
    const asyncB = async () => 'b';
    const testValues = [];
    const options = {
        'globals': {
            asyncB,
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
    assert.equal(await evaluateExpressionAsync(expr, options), 'b');
    assert.deepEqual(testValues, ['a', 'b']);
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
                {'function': {'name': 'asyncTrue'}}
            ]
        }
    });
    const asyncTrue = async () => true;
    const options = {'globals': {asyncTrue}};
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, function if no false expression', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'function': {'name': 'asyncFalse'}},
                {'number': 1}
            ]
        }
    });
    const asyncFalse = async () => false;
    const options = {'globals': {asyncFalse}};
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, function builtin', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'abs',
            'args': [
                {'function': {'name': 'asyncOne'}}
            ]
        }
    });
    const asyncOne = async () => -1;
    const options = {'globals': {asyncOne}};
    assert.equal(await evaluateExpressionAsync(expr, options), 1);
});


test('evaluateExpressionAsync, function no-builtins', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'abs',
            'args': [
                {'function': {'name': 'asyncOne'}}
            ]
        }
    });
    const asyncOne = async () => -1;
    const options = {'globals': {asyncOne}};
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
                {'function': {'name': 'asyncThree'}}
            ]
        }
    });
    const asyncThree = async () => 3;
    const options = {'globals': {asyncThree, 'fnName': ([number]) => 2 * number}};
    assert.equal(await evaluateExpressionAsync(expr, options), 6);
});


test('evaluateExpressionAsync, function local', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'function': {'name': 'asyncThree'}}
            ]
        }
    });
    const asyncThree = async () => 3;
    const locals = {'fnLocal': ([number]) => 2 * number};
    const options = {'globals': {asyncThree}};
    assert.equal(await evaluateExpressionAsync(expr, options, locals), 6);
});


test('evaluateExpressionAsync, function local null', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'function': {'name': 'asyncNull'}}
            ]
        }
    });
    const asyncNull = async () => null;
    const locals = {'fnLocal': null};
    const options = {'globals': {asyncNull, 'fnLocal': 'abc'}};
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
                {'function': {'name': 'asyncNull'}}
            ]
        }
    });
    const asyncNull = async () => null;
    const options = {'globals': {asyncNull, 'fnLocal': 'abc'}};
    assert.equal(await evaluateExpressionAsync(expr, options), null);
});


test('evaluateExpressionAsync, function non-function logFn', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'function': {'name': 'asyncNull'}}
            ]
        }
    });
    const asyncNull = async () => null;
    const logs = [];
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {'globals': {asyncNull, 'fnLocal': 'abc'}, logFn, 'debug': true};
    assert.equal(await evaluateExpressionAsync(expr, options, null, options), null);
    assert.deepEqual(logs, ['BareScript: Function "fnLocal" failed with error: funcValue is not a function']);
});


test('evaluateExpressionAsync, function unknown', async () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnUnknown',
            'args': [
                {'function': {'name': 'asyncNull'}}
            ]
        }
    });
    const asyncNull = async () => null;
    const options = {'globals': {asyncNull}};
    assert.rejects(
        async () => evaluateExpressionAsync(expr, options),
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
                throw new BareScriptRuntimeError('Test error');
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
            'right': {'function': {'name': 'testValue', 'args': [{'function': {'name': 'asyncB'}}]}}
        }
    });
    const asyncB = async () => 'abc';
    const testValues = [];
    const options = {
        'globals': {
            asyncB,
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
            'right': {'function': {'name': 'testValue', 'args': [{'function': {'name': 'asyncB'}}]}}
        }
    });
    const asyncB = async () => 'abc';
    const testValues = [];
    const options = {
        'globals': {
            asyncB,
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


test('evaluateExpressionAsync, binary exponentiation', async () => {
    const expr = validateExpression({'binary': {'op': '**', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), 100);
});


test('evaluateExpressionAsync, binary multiplication', async () => {
    const expr = validateExpression({'binary': {'op': '*', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), 20);
});


test('evaluateExpressionAsync, binary division', async () => {
    const expr = validateExpression({'binary': {'op': '/', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), 5);
});


test('evaluateExpressionAsync, binary modulus', async () => {
    const expr = validateExpression({'binary': {'op': '%', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), 0);
});


test('evaluateExpressionAsync, binary addition', async () => {
    const expr = validateExpression({'binary': {'op': '+', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), 12);
});


test('evaluateExpressionAsync, binary subtraction', async () => {
    const expr = validateExpression({'binary': {'op': '-', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), 8);
});


test('evaluateExpressionAsync, binary less-than or equal-to', async () => {
    const expr = validateExpression({'binary': {'op': '<=', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), false);
});


test('evaluateExpressionAsync, binary less-than', async () => {
    const expr = validateExpression({'binary': {'op': '<', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), false);
});


test('evaluateExpressionAsync, binary greater-than or equal-to', async () => {
    const expr = validateExpression({'binary': {'op': '>=', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), true);
});


test('evaluateExpressionAsync, binary greater-than', async () => {
    const expr = validateExpression({'binary': {'op': '>', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), true);
});


test('evaluateExpressionAsync, binary equality', async () => {
    const expr = validateExpression({'binary': {'op': '==', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), false);
});


test('evaluateExpressionAsync, binary inequality', async () => {
    const expr = validateExpression({'binary': {'op': '!=', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), true);
});


test('evaluateExpressionAsync, unary not', async () => {
    const expr = validateExpression({'unary': {'op': '!', 'expr': {'function': {'name': 'asyncFalse'}}}});
    const asyncFalse = async () => false;
    const options = {'globals': {asyncFalse}};
    assert.equal(await evaluateExpressionAsync(expr, options), true);
});


test('evaluateExpressionAsync, unary negate', async () => {
    const expr = validateExpression({'unary': {'op': '-', 'expr': {'function': {'name': 'asyncOne'}}}});
    const asyncOne = async () => 1;
    const options = {'globals': {asyncOne}};
    assert.equal(await evaluateExpressionAsync(expr, options), -1);
});


test('evaluateExpressionAsync, group', async () => {
    const expr = validateExpression(
        {
            'group': {
                'binary': {
                    'op': '*',
                    'left': {'function': {'name': 'asyncTwo'}},
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
        }
    );
    const asyncTwo = async () => 2;
    const options = {'globals': {asyncTwo}};
    assert.equal(await evaluateExpressionAsync(expr, options), 16);
});
