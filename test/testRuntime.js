// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {BareScriptRuntimeError, evaluateExpression, executeScript} from '../lib/runtime.js';
import {validateExpression, validateScript} from '../lib/model.js';
import {ValueArgsError} from '../lib/value.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('executeScript', () => {
    const script = validateScript({
        'statements': [
            {'expr': {'name': 'a', 'expr': {'number': 5}}},
            {'expr': {'name': 'b', 'expr': {'number': 7}}},
            {'return': {
                'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
            }}
        ]
    });
    assert.equal(executeScript(script), 12);
});


test('executeScript, global override', () => {
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
    assert.equal(executeScript(script, options), 'Hello, the-url!');
});


test('executeScript, function', () => {
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
    assert.equal(executeScript(script), 35);
});


test('executeScript, function missing arg', () => {
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
    assert.deepEqual(executeScript(script), [5, null]);
});


test('executeScript, function lastArgArray', () => {
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
    assert.deepEqual(executeScript(script), [1, [2, 3]]);
});


test('executeScript, function lastArgArray missing', () => {
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
    assert.deepEqual(executeScript(script), [1, []]);
});


test('executeScript, function async', () => {
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
    assert.equal(executeScript(script), 35);
});


test('executeScript, function async missing arg', () => {
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
    assert.deepEqual(executeScript(script), [5, null]);
});


test('executeScript, function async lastArgArray', () => {
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
    assert.deepEqual(executeScript(script), [1, [2, 3]]);
});


test('executeScript, function async lastArgArray missing', () => {
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
    assert.deepEqual(executeScript(script), [1, []]);
});


test('executeScript, function error', () => {
    const script = validateScript({
        'statements': [
            {'return': {
                'expr': {'function': {'name': 'errorFunction'}}
            }}
        ]
    });
    const errorFunction = () => {
        throw Error('unexpected error');
    };
    const options = {'globals': {errorFunction}};
    assert.equal(executeScript(script, options), null);
});


test('executeScript, function argument error', () => {
    const script = validateScript({
        'statements': [
            {'return': {
                'expr': {'function': {'name': 'errorFunction'}}
            }}
        ]
    });
    const errorFunction = () => {
        throw new ValueArgsError('myArg', null, -1);
    };
    const options = {'globals': {errorFunction}};
    assert.equal(executeScript(script, options), -1);
});


test('executeScript, function error log', () => {
    const script = validateScript({
        'statements': [
            {'return': {
                'expr': {'function': {'name': 'errorFunction'}}
            }}
        ]
    });
    const errorFunction = () => {
        throw Error('unexpected error');
    };
    const logs = [];
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {'globals': {errorFunction}, logFn, 'debug': true};
    assert.equal(executeScript(script, options), null);
    assert.deepEqual(logs, ['BareScript: Function "errorFunction" failed with error: unexpected error']);
});


test('executeScript, function error log no-debug', () => {
    const script = validateScript({
        'statements': [
            {'return': {
                'expr': {'function': {'name': 'errorFunction'}}
            }}
        ]
    });
    const errorFunction = () => {
        throw Error('unexpected error');
    };
    const logs = [];
    /* c8 ignore next 2 */
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {'globals': {errorFunction}, logFn, 'debug': false};
    assert.equal(executeScript(script, options), null);
    assert.deepEqual(logs, []);
});


test('executeScript, jump', () => {
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
    assert.equal(executeScript(script), 6);
});


test('executeScript, jumpif', () => {
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
    assert.equal(executeScript(script), 55);
});


test('executeScript, jump error unknown label', () => {
    const script = validateScript({
        'statements': [
            {'jump': {'label': 'unknownLabel'}}
        ]
    });
    assert.throws(
        () => executeScript(script),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Unknown jump label "unknownLabel"'
        }
    );
});


test('executeScript, return', () => {
    const script = validateScript({
        'statements': [
            {'return': {'expr': {'number': 5}}}
        ]
    });
    assert.equal(executeScript(script), 5);
});


test('executeScript, return blank', () => {
    const script = validateScript({
        'statements': [
            {'return': {}}
        ]
    });
    assert.equal(executeScript(script), null);
});


test('executeScript, include', () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.mds'}]}}
        ]
    });

    /* c8 ignore next */
    const fetchFn = () => ({'ok': true, 'text': () => ''});
    const options = {fetchFn};
    assert.throws(
        () => executeScript(script, options),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Include of "test.mds" within non-async scope'
        }
    );
});


test('executeScript, include no fetchFn', () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.mds'}]}}
        ]
    });
    assert.throws(
        () => executeScript(script),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Include of "test.mds" within non-async scope'
        }
    );
});


test('executeScript, error maxStatements', () => {
    const script = validateScript({
        'statements': [
            {
                'function': {
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
    assert.throws(
        () => executeScript(script, {'maxStatements': 3}),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Exceeded maximum script statements (3)'
        }
    );
    assert.equal(executeScript(script, {'maxStatements': 4}), null);
    assert.equal(executeScript(script, {'maxStatements': 0}), null);
});


test('evaluateExpression', () => {
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
    assert.equal(evaluateExpression(expr, options), 13);
});


test('evaluateExpression, no globals', () => {
    const expr = validateExpression({'string': 'abc'});
    const options = {};
    assert.equal(evaluateExpression(expr, options), 'abc');
});


test('evaluateExpression, string', () => {
    const expr = validateExpression({'string': 'abc'});
    assert.equal(evaluateExpression(expr), 'abc');
});


test('evaluateExpression, variable', () => {
    const expr = validateExpression({'variable': 'varName'});
    const options = {'globals': {'varName': 4}};
    assert.equal(evaluateExpression(expr, options), 4);
});


test('evaluateExpression, variable local', () => {
    const expr = validateExpression({'variable': 'varName'});
    const locals = {'varName': 4};
    assert.equal(evaluateExpression(expr, null, locals), 4);
    assert.deepEqual(locals, {'varName': 4});
});


test('evaluateExpression, variable null local non-null global', () => {
    const expr = validateExpression({'variable': 'varName'});
    const options = {'globals': {'varName': 4}};
    const locals = {'varName': null};
    assert.equal(evaluateExpression(expr, options, locals), null);
});


test('evaluateExpression, variable unknown', () => {
    const expr = validateExpression({'variable': 'varName'});
    assert.equal(evaluateExpression(expr), null);
});


test('evaluateExpression, variable literal null', () => {
    const expr = validateExpression({'variable': 'null'});
    assert.equal(evaluateExpression(expr), null);
});


test('evaluateExpression, variable literal true', () => {
    const expr = validateExpression({'variable': 'true'});
    assert.equal(evaluateExpression(expr), true);
});


test('evaluateExpression, variable literal false', () => {
    const expr = validateExpression({'variable': 'false'});
    assert.equal(evaluateExpression(expr), false);
});


test('evaluateExpression, function', () => {
    const expr = validateExpression({
        'function': {
            'name': 'myFunc',
            'args': [{'number': 1}, {'number': 2}]
        }
    });
    const options = {
        'globals': {
            'myFunc': ([val1, val2]) => val1 + val2
        }
    };
    assert.equal(evaluateExpression(expr, options), 3);
});


test('evaluateExpression, function no return', () => {
    const expr = validateExpression({
        'function': {
            'name': 'myFunc'
        }
    });
    const options = {
        'globals': {
            'myFunc': () => {
                // no return
            }
        }
    };
    assert.equal(evaluateExpression(expr, options), null);
});


test('evaluateExpression, function if', () => {
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
    assert.equal(evaluateExpression(expr, options), 'a');
    assert.deepEqual(testValues, ['a']);
    options.globals.test = false;
    assert.equal(evaluateExpression(expr, options), 'abc');
    assert.deepEqual(testValues, ['a', 'abc']);
});


test('evaluateExpression, function if no value expression', () => {
    const expr = validateExpression({
        'function': {
            'name': 'if'
        }
    });
    assert.equal(evaluateExpression(expr), null);
});


test('evaluateExpression, function if no true expression', () => {
    const expr = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'function': {'name': 'testNumber'}}
            ]
        }
    });
    const options = {'globals': {testNumber}};
    assert.equal(evaluateExpression(expr, options), null);
});


test('evaluateExpression, function if no false expression', () => {
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
    assert.equal(evaluateExpression(expr, options), null);
});


test('evaluateExpression, function builtin', () => {
    const expr = validateExpression({
        'function': {
            'name': 'abs',
            'args': [
                {'function': {'name': 'testNumber'}}
            ]
        }
    });
    const options = {'globals': {testNumber}};
    assert.equal(evaluateExpression(expr, options), 2);
});


test('evaluateExpression, function no-builtins', () => {
    const expr = validateExpression({
        'function': {
            'name': 'abs',
            'args': [
                {'function': {'name': 'testNumber'}}
            ]
        }
    });
    const options = {'globals': {testNumber}};
    assert.throws(
        () => evaluateExpression(expr, options, null, false),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Undefined function "abs"'
        }
    );
});


test('evaluateExpression, function global', () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnName',
            'args': [
                {'function': {'name': 'testNumber'}}
            ]
        }
    });
    const options = {'globals': {testNumber, 'fnName': ([number]) => 2 * number}};
    assert.equal(evaluateExpression(expr, options), 4);
});


test('evaluateExpression, function local', () => {
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
    assert.equal(evaluateExpression(expr, options, locals), 4);
});


test('evaluateExpression, function local null', () => {
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
    assert.throws(
        () => evaluateExpression(expr, options, locals),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Undefined function "fnLocal"'
        }
    );
});


test('evaluateExpression, function non-function', () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'function': {'name': 'testString'}}
            ]
        }
    });
    const options = {'globals': {testString, 'fnLocal': 'abc'}};
    assert.equal(evaluateExpression(expr, options), null);
});


test('evaluateExpression, function non-function logFn', () => {
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
    assert.equal(evaluateExpression(expr, options), null);
    assert.deepEqual(logs, ['BareScript: Function "fnLocal" failed with error: funcValue is not a function']);
});


test('evaluateExpression, function unknown', () => {
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
    assert.throws(
        () => evaluateExpression(expr, options, locals),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Undefined function "fnUnknown"'
        }
    );
});


test('evaluateExpression, function unknown no globals', () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnUnknown',
            'args': [
                {'function': {'name': 'testString'}}
            ]
        }
    });
    const locals = {testString};
    assert.throws(
        () => evaluateExpression(expr, null, locals),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Undefined function "fnUnknown"'
        }
    );
});


test('evaluateExpression, function async', () => {
    const expr = validateExpression({
        'function': {
            'name': 'fnAsync'
        }
    });

    /* c8 ignore next 2 */
    // eslint-disable-next-line require-await
    const options = {'globals': {'fnAsync': async () => null}};
    assert.throws(
        () => evaluateExpression(expr, options),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Async function "fnAsync" called within non-async scope'
        }
    );
});


test('evaluateExpression, function runtime error', () => {
    const expr = validateExpression({
        'function': {
            'name': 'test'
        }
    });
    const options = {
        'globals': {
            'test': () => {
                throw new BareScriptRuntimeError('Test error');
            }
        }
    };
    assert.throws(
        () => evaluateExpression(expr, options),
        {
            'name': 'BareScriptRuntimeError',
            'message': 'Test error'
        }
    );
});


test('evaluateExpression, binary logical and', () => {
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
    assert.equal(evaluateExpression(expr, options), null);
    assert.deepEqual(testValues, []);
    options.globals.leftValue = true;
    assert.equal(evaluateExpression(expr, options), 'abc');
    assert.deepEqual(testValues, ['abc']);
});


test('evaluateExpression, binary logical or', () => {
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
    assert.equal(evaluateExpression(expr, options), true);
    assert.deepEqual(testValues, []);
    options.globals.leftValue = false;
    assert.equal(evaluateExpression(expr, options), 'abc');
    assert.deepEqual(testValues, ['abc']);
});


test('evaluateExpression, binary addition', () => {
    const options = {'globals': {testDate, testNumber, testString}};

    // number + number
    let expr = validateExpression({'binary': {'op': '+', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), 12);

    // string + string
    expr = validateExpression({'binary': {'op': '+', 'left': {'string': 'foo'}, 'right': {'function': {'name': 'testString'}}}});
    assert.equal(evaluateExpression(expr, options), 'fooabc');

    // string + <non-string>
    expr = validateExpression({'binary': {'op': '+', 'left': {'string': 'foo'}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), 'foo2');

    // <non-string> + string
    expr = validateExpression({'binary': {'op': '+', 'left': {'function': {'name': 'testNumber'}}, 'right': {'string': 'foo'}}});
    assert.equal(evaluateExpression(expr, options), '2foo');

    // datetime + number
    expr = validateExpression({'binary': {'op': '+', 'left': {'function': {'name': 'testDate'}}, 'right': {'number': 86400000}}});
    assert.deepEqual(evaluateExpression(expr, options), new Date(2024, 1, 7));

    // number + datetime
    expr = validateExpression({'binary': {'op': '+', 'left': {'number': -86400000}, 'right': {'function': {'name': 'testDate'}}}});
    assert.deepEqual(evaluateExpression(expr, options), new Date(2024, 1, 5));

    // Invalid
    expr = validateExpression({'binary': {'op': '+', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(evaluateExpression(expr, options), null);
});


test('evaluateExpression, binary subtraction', () => {
    const options = {'globals': {'dt2': new Date(2024, 1, 7), testDate, testNumber}};

    // number - number
    let expr = validateExpression({'binary': {'op': '-', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), 8);

    // datetime - datetime
    expr = validateExpression({'binary': {'op': '-', 'left': {'variable': 'dt2'}, 'right': {'function': {'name': 'testDate'}}}});
    assert.equal(evaluateExpression(expr, options), 86400000);

    // Invalid
    expr = validateExpression({'binary': {'op': '-', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(evaluateExpression(expr, options), null);
});


test('evaluateExpression, binary multiplication', () => {
    const options = {'globals': {testNumber}};

    // number * number
    let expr = validateExpression({'binary': {'op': '*', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), 20);

    // Invalid
    expr = validateExpression({'binary': {'op': '*', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(evaluateExpression(expr, options), null);
});


test('evaluateExpression, binary division', () => {
    const options = {'globals': {testNumber}};

    // number / number
    let expr = validateExpression({'binary': {'op': '/', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), 5);

    // Invalid
    expr = validateExpression({'binary': {'op': '/', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(evaluateExpression(expr, options), null);
});


test('evaluateExpression, binary equality', () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'binary': {'op': '==', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), false);
});


test('evaluateExpression, binary inequality', () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'binary': {'op': '!=', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), true);
});


test('evaluateExpression, binary less-than-or-equal-to', () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'binary': {'op': '<=', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), false);
});


test('evaluateExpression, binary less-than', () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'binary': {'op': '<', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), false);
});


test('evaluateExpression, binary greater-than-or-equal-to', () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'binary': {'op': '>=', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), true);
});


test('evaluateExpression, binary greater-than', () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'binary': {'op': '>', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), true);
});


test('evaluateExpression, binary modulus', () => {
    const options = {'globals': {testNumber}};

    // number % number
    let expr = validateExpression({'binary': {'op': '%', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), 0);

    // Invalid
    expr = validateExpression({'binary': {'op': '%', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(evaluateExpression(expr, options), null);
});


test('evaluateExpression, binary exponentiation', () => {
    const options = {'globals': {testNumber}};

    // number ** number
    let expr = validateExpression({'binary': {'op': '**', 'left': {'number': 10}, 'right': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), 100);

    // Invalid
    expr = validateExpression({'binary': {'op': '**', 'left': {'function': {'name': 'testNumber'}}, 'right': {'variable': 'null'}}});
    assert.equal(evaluateExpression(expr, options), null);
});


test('evaluateExpression, unary not', () => {
    const options = {'globals': {testNumber}};
    const expr = validateExpression({'unary': {'op': '!', 'expr': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), false);
});


test('evaluateExpression, unary negate', () => {
    const options = {'globals': {testNumber, testString}};

    // - number
    let expr = validateExpression({'unary': {'op': '-', 'expr': {'function': {'name': 'testNumber'}}}});
    assert.equal(evaluateExpression(expr, options), -2);

    // Invalid
    expr = validateExpression({'unary': {'op': '-', 'expr': {'function': {'name': 'testString'}}}});
    assert.equal(evaluateExpression(expr, options), null);
});


test('evaluateExpression, group', () => {
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
    assert.equal(evaluateExpression(expr, options), 16);
});


//
// Helper functions to get test values of specific types
//


function testDate() {
    return new Date(2024, 1, 6);
}


function testFalse() {
    return false;
}


function testNumber() {
    return 2;
}


function testString() {
    return 'abc';
}
