// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

/* eslint-disable id-length */

import {CalcScriptRuntimeError, evaluateExpression, executeScript} from '../lib/runtime.js';
import {validateExpression, validateScript} from '../lib/model.js';
import test from 'ava';


test('executeScript', (t) => {
    const script = validateScript({
        'statements': [
            {'assign': {'name': 'a', 'expr': {'number': 5}}},
            {'assign': {'name': 'b', 'expr': {'number': 7}}},
            {'return': {
                'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
            }}
        ]
    });
    t.is(executeScript(script), 12);
});


test('executeScript, function', (t) => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'name': 'multiplyNumbers',
                    'args': ['a', 'b'],
                    'statements': [
                        {'assign': {'name': 'c', 'expr': {'variable': 'b'}}},
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
    t.is(executeScript(script), 35);
});


test('executeScript, function async', (t) => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'async': true,
                    'name': 'multiplyNumbers',
                    'args': ['a', 'b'],
                    'statements': [
                        {'assign': {'name': 'c', 'expr': {'variable': 'b'}}},
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
    t.is(executeScript(script), 35);
});


test('executeScript, function missing arg', (t) => {
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
    t.deepEqual(executeScript(script), [5, null]);
});


test('executeScript, function async missing arg', (t) => {
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
    t.deepEqual(executeScript(script), [5, null]);
});


test('executeScript, function error', (t) => {
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
    t.is(executeScript(script, {errorFunction}), null);
});


test('executeScript, function error log', (t) => {
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
    const options = {logFn};
    t.is(executeScript(script, {errorFunction}, options), null);
    t.is(logs.length, 2);
    t.is(logs[0], 'Error: Function "errorFunction" failed with error: unexpected error');
});


test('executeScript, jump', (t) => {
    const script = validateScript({
        'statements': [
            {'assign': {'name': 'a', 'expr': {'number': 5}}},
            {'jump': {'label': 'lab2'}},
            {'label': 'lab'},
            {'assign': {'name': 'a', 'expr': {'number': 6}}},
            {'jump': {'label': 'lab3'}},
            {'label': 'lab2'},
            {'assign': {'name': 'a', 'expr': {'number': 7}}},
            {'jump': {'label': 'lab'}},
            {'label': 'lab3'},
            {'return': {'expr': {'variable': 'a'}}}
        ]
    });
    t.is(executeScript(script), 6);
});


test('executeScript, jumpif', (t) => {
    const script = validateScript({
        'statements': [
            {'assign': {'name': 'n', 'expr': {'number': 10}}},
            {'assign': {'name': 'i', 'expr': {'number': 0}}},
            {'assign': {'name': 'a', 'expr': {'number': 0}}},
            {'assign': {'name': 'b', 'expr': {'number': 1}}},
            {'label': 'fib'},
            {'jump': {
                'label': 'fibend',
                'expr': {'binary': {'op': '>=', 'left': {'variable': 'i'}, 'right': {'variable': 'n'}}}
            }},
            {'assign': {'name': 'tmp', 'expr': {'variable': 'b'}}},
            {'assign': {
                'name': 'b',
                'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
            }},
            {'assign': {'name': 'a', 'expr': {'variable': 'tmp'}}},
            {'assign': {'name': 'i', 'expr': {'binary': {'op': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}}},
            {'jump': {'label': 'fib'}},
            {'label': 'fibend'},
            {'return': {'expr': {'variable': 'a'}}}
        ]
    });
    t.is(executeScript(script), 55);
});


test('executeScript, return', (t) => {
    const script = validateScript({
        'statements': [
            {'return': {'expr': {'number': 5}}}
        ]
    });
    t.is(executeScript(script), 5);
});


test('executeScript, return blank', (t) => {
    const script = validateScript({
        'statements': [
            {'return': {}}
        ]
    });
    t.is(executeScript(script), null);
});


test('executeScript, jump error unknown label', (t) => {
    const script = validateScript({
        'statements': [
            {'jump': {'label': 'unknownLabel'}}
        ]
    });
    const error = t.throws(() => {
        executeScript(script);
    }, {'instanceOf': CalcScriptRuntimeError});
    t.is(error.message, 'Unknown jump label "unknownLabel"');
});


test('executeScript, error maxStatements', (t) => {
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
    const error = t.throws(() => {
        executeScript(script, {}, {'maxStatements': 3});
    }, {'instanceOf': CalcScriptRuntimeError});
    t.is(error.message, 'Exceeded maximum script statements (3)');
    t.is(executeScript(script, {}, {'maxStatements': 4}), null);
    t.is(executeScript(script, {}, {'maxStatements': 0}), null);
});


test('evaluateExpression', (t) => {
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
    const globals = {'varName': 4};
    t.is(evaluateExpression(calc, globals), 19);
    t.deepEqual(globals, {'varName': 4});
});


test('evaluateExpression, string', (t) => {
    const calc = validateExpression({'string': 'abc'});
    t.is(evaluateExpression(calc), 'abc');
});


test('evaluateExpression, variable', (t) => {
    const calc = validateExpression({'variable': 'varName'});
    const globals = {'varName': 4};
    t.is(evaluateExpression(calc, globals), 4);
    t.deepEqual(globals, {'varName': 4});
});


test('evaluateExpression, variable local', (t) => {
    const calc = validateExpression({'variable': 'varName'});
    const globals = {};
    const locals = {'varName': 4};
    t.is(evaluateExpression(calc, {}, locals), 4);
    t.deepEqual(globals, {});
    t.deepEqual(locals, {'varName': 4});
});


test('evaluateExpression, variable null local non-null global', (t) => {
    const calc = validateExpression({'variable': 'varName'});
    const globals = {'varName': 4};
    const locals = {'varName': null};
    t.is(evaluateExpression(calc, globals, locals), null);
    t.deepEqual(globals, {'varName': 4});
    t.deepEqual(locals, {'varName': null});
});


test('evaluateExpression, variable unknown', (t) => {
    const calc = validateExpression({'variable': 'varName'});
    t.is(evaluateExpression(calc), null);
});


test('evaluateExpression, variable literal null', (t) => {
    const calc = validateExpression({'variable': 'null'});
    t.is(evaluateExpression(calc), null);
});


test('evaluateExpression, variable literal true', (t) => {
    const calc = validateExpression({'variable': 'true'});
    t.is(evaluateExpression(calc), true);
});


test('evaluateExpression, variable literal false', (t) => {
    const calc = validateExpression({'variable': 'false'});
    t.is(evaluateExpression(calc), false);
});


test('evaluateExpression, function if', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'variable': 'test'},
                {'function': {'name': 'setGlobal', 'args': [{'string': 'a'}, {'number': 1}]}},
                {'function': {'name': 'setGlobal', 'args': [{'string': 'b'}, {'number': 1}]}}
            ]
        }
    });
    let globals = {'test': true};
    t.is(evaluateExpression(calc, globals), 1);
    t.deepEqual(globals, {'test': true, 'a': 1});
    globals = {'test': false};
    t.is(evaluateExpression(calc, globals), 1);
    t.deepEqual(globals, {'test': false, 'b': 1});
});


test('evaluateExpression, function if no value expression', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'if'
        }
    });
    t.is(evaluateExpression(calc), null);
});


test('evaluateExpression, function if no true expression', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'variable': 'true'}
            ]
        }
    });
    t.is(evaluateExpression(calc), null);
});


test('evaluateExpression, function if no false expression', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'variable': 'false'},
                {'number': 1}
            ]
        }
    });
    t.is(evaluateExpression(calc), null);
});


test('evaluateExpression, function getGlobal setGlobal', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'setGlobal',
            'args': [
                {'string': 'b'},
                {
                    'function': {
                        'name': 'getGlobal',
                        'args': [
                            {'string': 'a'}
                        ]
                    }
                }
            ]
        }
    });
    const globals = {'a': 1};
    t.is(evaluateExpression(calc, globals), 1);
    t.deepEqual(globals, {'a': 1, 'b': 1});
});


test('evaluateExpression, function getGlobal setGlobal unknown', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'setGlobal',
            'args': [
                {'string': 'b'},
                {
                    'function': {
                        'name': 'getGlobal',
                        'args': [
                            {'string': 'a'}
                        ]
                    }
                }
            ]
        }
    });
    const globals = {};
    t.is(evaluateExpression(calc, globals), null);
    t.deepEqual(globals, {'b': null});
});


test('evaluateExpression, function builtin', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'abs',
            'args': [
                {'number': -1}
            ]
        }
    });
    t.is(evaluateExpression(calc), 1);
});


test('evaluateExpression, function no-builtins', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'abs',
            'args': [
                {'number': -1}
            ]
        }
    });
    const error = t.throws(() => {
        evaluateExpression(calc, {}, null, null, false);
    }, {'instanceOf': CalcScriptRuntimeError});
    t.is(error.message, 'Undefined function "abs"');
});


test('evaluateExpression, function global', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnName',
            'args': [
                {'number': 3}
            ]
        }
    });
    const globals = {'fnName': ([number]) => 2 * number};
    t.is(evaluateExpression(calc, globals), 6);
});


test('evaluateExpression, function local', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'number': 3}
            ]
        }
    });
    const locals = {'fnLocal': ([number]) => 2 * number};
    t.is(evaluateExpression(calc, {}, locals), 6);
});


test('evaluateExpression, function local null', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnLocal'
        }
    });
    const globals = {'fnLocal': ([number]) => 2 * number};
    const locals = {'fnLocal': null};
    const error = t.throws(() => {
        evaluateExpression(calc, globals, locals);
    }, {'instanceOf': CalcScriptRuntimeError});
    t.is(error.message, 'Undefined function "fnLocal"');
});


test('evaluateExpression, function non-function', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnLocal'
        }
    });
    const globals = {'fnLocal': 'abc'};
    t.is(evaluateExpression(calc, globals), null);
});


test('evaluateExpression, function non-function logFn', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnLocal'
        }
    });
    const globals = {'fnLocal': 'abc'};
    const logs = [];
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {logFn};
    t.is(evaluateExpression(calc, globals, null, options), null);
    t.deepEqual(logs, ['Error: Function "fnLocal" failed with error: funcValue is not a function']);
});


test('evaluateExpression, function unknown', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnUnknown'
        }
    });
    const error = t.throws(() => {
        evaluateExpression(calc);
    }, {'instanceOf': CalcScriptRuntimeError});
    t.is(error.message, 'Undefined function "fnUnknown"');
});


test('evaluateExpression, function async', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnAsync'
        }
    });
    // eslint-disable-next-line require-await
    const globals = {'fnAsync': async () => null};
    const error = t.throws(() => {
        evaluateExpression(calc, globals);
    }, {'instanceOf': CalcScriptRuntimeError});
    t.is(error.message, 'Async function "fnAsync" called within non-async scope');
});


test('evaluateExpression, function runtime error', (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'test'
        }
    });
    // eslint-disable-next-line require-await
    const globals = {
        'test': () => {
            throw new CalcScriptRuntimeError('Test error');
        }
    };
    const error = t.throws(() => {
        evaluateExpression(calc, globals);
    }, {'instanceOf': CalcScriptRuntimeError});
    t.is(error.message, 'Test error');
});


test('evaluateExpression, binary logical and', (t) => {
    const calc = validateExpression({
        'binary': {
            'op': '&&',
            'left': {'variable': 'a'},
            'right': {'function': {'name': 'setGlobal', 'args': [{'string': 'b'}, {'number': 1}]}}
        }
    });
    const globals = {};
    t.is(evaluateExpression(calc, globals), null);
    t.deepEqual(globals, {});
    globals.a = true;
    t.is(evaluateExpression(calc, globals), 1);
    t.deepEqual(globals, {'a': true, 'b': 1});
});


test('evaluateExpression, binary logical or', (t) => {
    const calc = validateExpression({
        'binary': {
            'op': '||',
            'left': {'variable': 'a'},
            'right': {'function': {'name': 'setGlobal', 'args': [{'string': 'b'}, {'number': 1}]}}
        }
    });
    const globals = {'a': true};
    t.is(evaluateExpression(calc, globals), true);
    t.deepEqual(globals, {'a': true});
    globals.a = false;
    t.is(evaluateExpression(calc, globals), 1);
    t.deepEqual(globals, {'a': false, 'b': 1});
});


test('evaluateExpression, binary exponentiation', (t) => {
    const calc = validateExpression({'binary': {'op': '**', 'left': {'number': '10'}, 'right': {'number': 2}}});
    t.is(evaluateExpression(calc), 100);
});


test('evaluateExpression, binary multiplication', (t) => {
    const calc = validateExpression({'binary': {'op': '*', 'left': {'number': '10'}, 'right': {'number': 2}}});
    t.is(evaluateExpression(calc), 20);
});


test('evaluateExpression, binary division', (t) => {
    const calc = validateExpression({'binary': {'op': '/', 'left': {'number': '10'}, 'right': {'number': 2}}});
    t.is(evaluateExpression(calc), 5);
});


test('evaluateExpression, binary modulus', (t) => {
    const calc = validateExpression({'binary': {'op': '%', 'left': {'number': '10'}, 'right': {'number': 2}}});
    t.is(evaluateExpression(calc), 0);
});


test('evaluateExpression, binary addition', (t) => {
    const calc = validateExpression({'binary': {'op': '+', 'left': {'number': '10'}, 'right': {'number': 2}}});
    t.is(evaluateExpression(calc), 12);
});


test('evaluateExpression, binary subtraction', (t) => {
    const calc = validateExpression({'binary': {'op': '-', 'left': {'number': '10'}, 'right': {'number': 2}}});
    t.is(evaluateExpression(calc), 8);
});


test('evaluateExpression, binary less-than or equal-to', (t) => {
    const calc = validateExpression({'binary': {'op': '<=', 'left': {'number': '10'}, 'right': {'number': 2}}});
    t.is(evaluateExpression(calc), false);
});


test('evaluateExpression, binary less-than', (t) => {
    const calc = validateExpression({'binary': {'op': '<', 'left': {'number': '10'}, 'right': {'number': 2}}});
    t.is(evaluateExpression(calc), false);
});


test('evaluateExpression, binary greater-than or equal-to', (t) => {
    const calc = validateExpression({'binary': {'op': '>=', 'left': {'number': '10'}, 'right': {'number': 2}}});
    t.is(evaluateExpression(calc), true);
});


test('evaluateExpression, binary greater-than', (t) => {
    const calc = validateExpression({'binary': {'op': '>', 'left': {'number': '10'}, 'right': {'number': 2}}});
    t.is(evaluateExpression(calc), true);
});


test('evaluateExpression, binary equality', (t) => {
    const calc = validateExpression({'binary': {'op': '==', 'left': {'number': '10'}, 'right': {'number': 2}}});
    t.is(evaluateExpression(calc), false);
});


test('evaluateExpression, binary inequality', (t) => {
    const calc = validateExpression({'binary': {'op': '!=', 'left': {'number': '10'}, 'right': {'number': 2}}});
    t.is(evaluateExpression(calc), true);
});


test('evaluateExpression, unary not', (t) => {
    const calc = validateExpression({'unary': {'op': '!', 'expr': {'variable': 'false'}}});
    t.is(evaluateExpression(calc), true);
});


test('evaluateExpression, unary negate', (t) => {
    const calc = validateExpression({'unary': {'op': '-', 'expr': {'number': 1}}});
    t.is(evaluateExpression(calc), -1);
});


test('evaluateExpression, group', (t) => {
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
    t.is(evaluateExpression(calc), 16);
});
