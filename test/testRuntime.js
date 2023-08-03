// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

import {CalcScriptRuntimeError, evaluateExpression, executeScript} from '../lib/runtime.js';
import {validateExpression, validateScript} from '../lib/model.js';
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
    assert.deepEqual(logs, ['CalcScript: Function "errorFunction" failed with error: unexpected error']);
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
        () => {
            executeScript(script);
        },
        {
            'name': 'CalcScriptRuntimeError',
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
        () => {
            executeScript(script, options);
        },
        {
            'name': 'CalcScriptRuntimeError',
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
        () => {
            executeScript(script);
        },
        {
            'name': 'CalcScriptRuntimeError',
            'message': 'Include of "test.mds" within non-async scope'
        }
    );
});


test('executeScript, include no fetchFn, system', () => {
    const script = validateScript({
        'statements': [
            {'include': {'includes': [{'url': 'test.mds', 'system': true}]}}
        ]
    });
    assert.throws(
        () => {
            executeScript(script);
        },
        {
            'name': 'CalcScriptRuntimeError',
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
        () => {
            executeScript(script, {'maxStatements': 3});
        },
        {
            'name': 'CalcScriptRuntimeError',
            'message': 'Exceeded maximum script statements (3)'
        }
    );
    assert.equal(executeScript(script, {}, {'maxStatements': 4}), null);
    assert.equal(executeScript(script, {}, {'maxStatements': 0}), null);
});


test('evaluateExpression', () => {
    const calc = validateExpression({
        'binary': {
            'op': '+',
            'left': {'number': 7},
            'right': {
                'binary': {
                    'op': '*',
                    'left': {'number': 3},
                    'right': {
                        'function': {
                            'name': 'ceil',
                            'args': [
                                {'variable': 'varName'}
                            ]
                        }
                    }
                }
            }
        }
    });
    const options = {'globals': {'varName': 4}};
    assert.equal(evaluateExpression(calc, options), 19);
});


test('evaluateExpression, no globals', () => {
    const calc = validateExpression({'string': 'abc'});
    const options = {};
    assert.equal(evaluateExpression(calc, options), 'abc');
});


test('evaluateExpression, string', () => {
    const calc = validateExpression({'string': 'abc'});
    assert.equal(evaluateExpression(calc), 'abc');
});


test('evaluateExpression, variable', () => {
    const calc = validateExpression({'variable': 'varName'});
    const options = {'globals': {'varName': 4}};
    assert.equal(evaluateExpression(calc, options), 4);
});


test('evaluateExpression, variable local', () => {
    const calc = validateExpression({'variable': 'varName'});
    const locals = {'varName': 4};
    assert.equal(evaluateExpression(calc, null, locals), 4);
    assert.deepEqual(locals, {'varName': 4});
});


test('evaluateExpression, variable null local non-null global', () => {
    const calc = validateExpression({'variable': 'varName'});
    const options = {'globals': {'varName': 4}};
    const locals = {'varName': null};
    assert.equal(evaluateExpression(calc, options, locals), null);
});


test('evaluateExpression, variable unknown', () => {
    const calc = validateExpression({'variable': 'varName'});
    assert.equal(evaluateExpression(calc), null);
});


test('evaluateExpression, variable literal null', () => {
    const calc = validateExpression({'variable': 'null'});
    assert.equal(evaluateExpression(calc), null);
});


test('evaluateExpression, variable literal true', () => {
    const calc = validateExpression({'variable': 'true'});
    assert.equal(evaluateExpression(calc), true);
});


test('evaluateExpression, variable literal false', () => {
    const calc = validateExpression({'variable': 'false'});
    assert.equal(evaluateExpression(calc), false);
});


test('evaluateExpression, function', () => {
    const calc = validateExpression({
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
    assert.equal(evaluateExpression(calc, options), 3);
});


test('evaluateExpression, function no return', () => {
    const calc = validateExpression({
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
    assert.equal(evaluateExpression(calc, options), null);
});


test('evaluateExpression, function if', () => {
    const calc = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'variable': 'test'},
                {'function': {'name': 'testValue', 'args': [{'string': 'a'}]}},
                {'function': {'name': 'testValue', 'args': [{'string': 'b'}]}}
            ]
        }
    });
    const testValues = [];
    const options = {
        'globals': {
            'test': true,
            'testValue': ([value]) => {
                testValues.push(value);
                return value;
            }
        }
    };
    assert.equal(evaluateExpression(calc, options), 'a');
    assert.deepEqual(testValues, ['a']);
    options.globals.test = false;
    assert.equal(evaluateExpression(calc, options), 'b');
    assert.deepEqual(testValues, ['a', 'b']);
});


test('evaluateExpression, function if no value expression', () => {
    const calc = validateExpression({
        'function': {
            'name': 'if'
        }
    });
    assert.equal(evaluateExpression(calc), null);
});


test('evaluateExpression, function if no true expression', () => {
    const calc = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'variable': 'true'}
            ]
        }
    });
    assert.equal(evaluateExpression(calc), null);
});


test('evaluateExpression, function if no false expression', () => {
    const calc = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'variable': 'false'},
                {'number': 1}
            ]
        }
    });
    assert.equal(evaluateExpression(calc), null);
});


test('evaluateExpression, function builtin', () => {
    const calc = validateExpression({
        'function': {
            'name': 'abs',
            'args': [
                {'number': -1}
            ]
        }
    });
    assert.equal(evaluateExpression(calc), 1);
});


test('evaluateExpression, function no-builtins', () => {
    const calc = validateExpression({
        'function': {
            'name': 'abs',
            'args': [
                {'number': -1}
            ]
        }
    });
    assert.throws(
        () => {
            evaluateExpression(calc, null, null, false);
        },
        {
            'name': 'CalcScriptRuntimeError',
            'message': 'Undefined function "abs"'
        }
    );
});


test('evaluateExpression, function global', () => {
    const calc = validateExpression({
        'function': {
            'name': 'fnName',
            'args': [
                {'number': 3}
            ]
        }
    });
    const options = {'globals': {'fnName': ([number]) => 2 * number}};
    assert.equal(evaluateExpression(calc, options), 6);
});


test('evaluateExpression, function local', () => {
    const calc = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'number': 3}
            ]
        }
    });
    const locals = {'fnLocal': ([number]) => 2 * number};
    assert.equal(evaluateExpression(calc, null, locals), 6);
});


test('evaluateExpression, function local null', () => {
    const calc = validateExpression({
        'function': {
            'name': 'fnLocal'
        }
    });
    const options = {'globals': {'fnLocal': 'abc'}};
    const locals = {'fnLocal': null};
    assert.throws(
        () => {
            evaluateExpression(calc, options, locals);
        },
        {
            'name': 'CalcScriptRuntimeError',
            'message': 'Undefined function "fnLocal"'
        }
    );
});


test('evaluateExpression, function non-function', () => {
    const calc = validateExpression({
        'function': {
            'name': 'fnLocal'
        }
    });
    const options = {'globals': {'fnLocal': 'abc'}};
    assert.equal(evaluateExpression(calc, options), null);
});


test('evaluateExpression, function non-function logFn', () => {
    const calc = validateExpression({
        'function': {
            'name': 'fnLocal'
        }
    });
    const logs = [];
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {'globals': {'fnLocal': 'abc'}, logFn, 'debug': true};
    assert.equal(evaluateExpression(calc, options), null);
    assert.deepEqual(logs, ['CalcScript: Function "fnLocal" failed with error: funcValue is not a function']);
});


test('evaluateExpression, function unknown', () => {
    const calc = validateExpression({
        'function': {
            'name': 'fnUnknown'
        }
    });
    assert.throws(
        () => {
            evaluateExpression(calc);
        },
        {
            'name': 'CalcScriptRuntimeError',
            'message': 'Undefined function "fnUnknown"'
        }
    );
});


test('evaluateExpression, function async', () => {
    const calc = validateExpression({
        'function': {
            'name': 'fnAsync'
        }
    });

    /* c8 ignore next 2 */
    // eslint-disable-next-line require-await
    const options = {'globals': {'fnAsync': async () => null}};
    assert.throws(
        () => {
            evaluateExpression(calc, options);
        },
        {
            'name': 'CalcScriptRuntimeError',
            'message': 'Async function "fnAsync" called within non-async scope'
        }
    );
});


test('evaluateExpression, function runtime error', () => {
    const calc = validateExpression({
        'function': {
            'name': 'test'
        }
    });
    const options = {
        'globals': {
            'test': () => {
                throw new CalcScriptRuntimeError('Test error');
            }
        }
    };
    assert.throws(
        () => {
            evaluateExpression(calc, options);
        },
        {
            'name': 'CalcScriptRuntimeError',
            'message': 'Test error'
        }
    );
});


test('evaluateExpression, binary logical and', () => {
    const calc = validateExpression({
        'binary': {
            'op': '&&',
            'left': {'variable': 'leftValue'},
            'right': {'function': {'name': 'testValue', 'args': [{'string': 'abc'}]}}
        }
    });
    const testValues = [];
    const options = {
        'globals': {
            'testValue': ([value]) => {
                testValues.push(value);
                return value;
            }
        }
    };
    assert.equal(evaluateExpression(calc, options), null);
    assert.deepEqual(testValues, []);
    options.globals.leftValue = true;
    assert.equal(evaluateExpression(calc, options), 'abc');
    assert.deepEqual(testValues, ['abc']);
});


test('evaluateExpression, binary logical or', () => {
    const calc = validateExpression({
        'binary': {
            'op': '||',
            'left': {'variable': 'leftValue'},
            'right': {'function': {'name': 'testValue', 'args': [{'string': 'abc'}]}}
        }
    });
    const testValues = [];
    const options = {
        'globals': {
            'leftValue': true,
            'testValue': ([value]) => {
                testValues.push(value);
                return value;
            }
        }
    };
    assert.equal(evaluateExpression(calc, options), true);
    assert.deepEqual(testValues, []);
    options.globals.leftValue = false;
    assert.equal(evaluateExpression(calc, options), 'abc');
    assert.deepEqual(testValues, ['abc']);
});


test('evaluateExpression, binary exponentiation', () => {
    const calc = validateExpression({'binary': {'op': '**', 'left': {'number': '10'}, 'right': {'number': 2}}});
    assert.equal(evaluateExpression(calc), 100);
});


test('evaluateExpression, binary multiplication', () => {
    const calc = validateExpression({'binary': {'op': '*', 'left': {'number': '10'}, 'right': {'number': 2}}});
    assert.equal(evaluateExpression(calc), 20);
});


test('evaluateExpression, binary division', () => {
    const calc = validateExpression({'binary': {'op': '/', 'left': {'number': '10'}, 'right': {'number': 2}}});
    assert.equal(evaluateExpression(calc), 5);
});


test('evaluateExpression, binary modulus', () => {
    const calc = validateExpression({'binary': {'op': '%', 'left': {'number': '10'}, 'right': {'number': 2}}});
    assert.equal(evaluateExpression(calc), 0);
});


test('evaluateExpression, binary addition', () => {
    const calc = validateExpression({'binary': {'op': '+', 'left': {'number': '10'}, 'right': {'number': 2}}});
    assert.equal(evaluateExpression(calc), 12);
});


test('evaluateExpression, binary subtraction', () => {
    const calc = validateExpression({'binary': {'op': '-', 'left': {'number': '10'}, 'right': {'number': 2}}});
    assert.equal(evaluateExpression(calc), 8);
});


test('evaluateExpression, binary less-than or equal-to', () => {
    const calc = validateExpression({'binary': {'op': '<=', 'left': {'number': '10'}, 'right': {'number': 2}}});
    assert.equal(evaluateExpression(calc), false);
});


test('evaluateExpression, binary less-than', () => {
    const calc = validateExpression({'binary': {'op': '<', 'left': {'number': '10'}, 'right': {'number': 2}}});
    assert.equal(evaluateExpression(calc), false);
});


test('evaluateExpression, binary greater-than or equal-to', () => {
    const calc = validateExpression({'binary': {'op': '>=', 'left': {'number': '10'}, 'right': {'number': 2}}});
    assert.equal(evaluateExpression(calc), true);
});


test('evaluateExpression, binary greater-than', () => {
    const calc = validateExpression({'binary': {'op': '>', 'left': {'number': '10'}, 'right': {'number': 2}}});
    assert.equal(evaluateExpression(calc), true);
});


test('evaluateExpression, binary equality', () => {
    const calc = validateExpression({'binary': {'op': '==', 'left': {'number': '10'}, 'right': {'number': 2}}});
    assert.equal(evaluateExpression(calc), false);
});


test('evaluateExpression, binary inequality', () => {
    const calc = validateExpression({'binary': {'op': '!=', 'left': {'number': '10'}, 'right': {'number': 2}}});
    assert.equal(evaluateExpression(calc), true);
});


test('evaluateExpression, unary not', () => {
    const calc = validateExpression({'unary': {'op': '!', 'expr': {'variable': 'false'}}});
    assert.equal(evaluateExpression(calc), true);
});


test('evaluateExpression, unary negate', () => {
    const calc = validateExpression({'unary': {'op': '-', 'expr': {'number': 1}}});
    assert.equal(evaluateExpression(calc), -1);
});


test('evaluateExpression, group', () => {
    const calc = validateExpression(
        {
            'group': {
                'binary': {
                    'op': '*',
                    'left': {'number': 2},
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
    assert.equal(evaluateExpression(calc), 16);
});
