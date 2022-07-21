// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

import {evaluateExpressionAsync, executeScriptAsync} from '../lib/runtimeAsync.js';
import {validateExpression, validateScript} from '../lib/model.js';
import {CalcScriptParserError} from '../lib/parser.js';
import {CalcScriptRuntimeError} from '../lib/runtime.js';
import test from 'ava';


/* eslint-disable id-length, require-await */


test('executeScriptAsync', async (t) => {
    const script = validateScript({
        'statements': [
            {'assign': {'name': 'a', 'expr': {'number': 5}}},
            {'assign': {'name': 'b', 'expr': {'number': 7}}},
            {'return': {
                'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
            }}
        ]
    });
    t.is(await executeScriptAsync(script), 12);
});


test('executeScriptAsync, function', async (t) => {
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
    t.is(await executeScriptAsync(script), 35);
});


test('executeScriptAsync, function async', async (t) => {
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
    t.is(await executeScriptAsync(script), 35);
});


test('executeScriptAsync, function missing arg', async (t) => {
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
    t.deepEqual(await executeScriptAsync(script), [5, null]);
});


test('executeScriptAsync, function async missing arg', async (t) => {
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
    t.deepEqual(await executeScriptAsync(script), [5, null]);
});


test('executeScriptAsync, function error', async (t) => {
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
    t.is(await executeScriptAsync(script, {errorFunction}), null);
});


test('executeScriptAsync, function error log', async (t) => {
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
    const options = {logFn};
    t.is(await executeScriptAsync(script, {errorFunction}, options), null);
    t.is(logs.length, 2);
    t.is(logs[0], 'Error: Function "errorFunction" failed with error: unexpected error');
});


test('executeScriptAsync, jump', async (t) => {
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
    t.is(await executeScriptAsync(script), 6);
});


test('executeScriptAsync, jumpif', async (t) => {
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
    t.is(await executeScriptAsync(script), 55);
});


test('executeScriptAsync, jump error unknown label', async (t) => {
    const script = validateScript({
        'statements': [
            {'jump': {'label': 'unknownLabel'}}
        ]
    });
    const error = await t.throwsAsync(
        async () => executeScriptAsync(script),
        {'instanceOf': CalcScriptRuntimeError}
    );
    t.is(error.message, 'Unknown jump label "unknownLabel"');
});


test('executeScriptAsync, return', async (t) => {
    const script = validateScript({
        'statements': [
            {'return': {'expr': {'number': 5}}}
        ]
    });
    t.is(await executeScriptAsync(script), 5);
});


test('executeScriptAsync, return blank', async (t) => {
    const script = validateScript({
        'statements': [
            {'return': {}}
        ]
    });
    t.is(await executeScriptAsync(script), null);
});


test('executeScriptAsync, include', async (t) => {
    const script = validateScript({
        'statements': [
            {'include': 'test.mds'}
        ]
    });
    const globals = {};
    const fetchFn = (url) => {
        t.true(url === 'test.mds' || url === 'test2.mds');
        return {
            'ok': true,
            'text': () => (url.endsWith('test2.mds') ? 'b = 1' : `\
include 'test2.mds'
a = 1
`)
        };
    };
    const options = {fetchFn};
    t.is(await executeScriptAsync(script, globals, options), null);
    t.is(globals.a, 1);
    t.is(globals.b, 1);
});


test('executeScriptAsync, include no fetchFn', async (t) => {
    const script = validateScript({
        'statements': [
            {'include': 'test.mds'}
        ]
    });
    const error = await t.throwsAsync(
        async () => executeScriptAsync(script),
        {'instanceOf': CalcScriptRuntimeError}
    );
    t.is(error.message, 'Include of "test.mds" failed');
});


test('executeScriptAsync, include fetchFn subdir', async (t) => {
    const script = validateScript({
        'statements': [
            {'include': 'lib/test.mds'}
        ]
    });
    const globals = {};
    const fetchFn = (url) => {
        t.true(url === 'lib/test.mds' || url === 'lib/test2.mds');
        return {
            'ok': true,
            'text': () => (url.endsWith('test2.mds') ? 'b = 1' : `\
include 'test2.mds'
a = 1
`)
        };
    };
    const options = {fetchFn};
    t.is(await executeScriptAsync(script, globals, options), null);
    t.is(globals.a, 1);
    t.is(globals.b, 1);
});


test('executeScriptAsync, include fetchFn absolute', async (t) => {
    const script = validateScript({
        'statements': [
            {'include': 'test.mds'}
        ]
    });
    const globals = {};
    const fetchFn = (url) => {
        t.true(url === 'test.mds' || url === 'http://foo.local/test2.mds');
        return {
            'ok': true,
            'text': () => (url.endsWith('test2.mds') ? 'b = 1' : `\
include 'http://foo.local/test2.mds'
a = 1
`)
        };
    };
    const options = {fetchFn};
    t.is(await executeScriptAsync(script, globals, options), null);
    t.is(globals.a, 1);
    t.is(globals.b, 1);
});


test('executeScriptAsync, include fetchFn not-ok', async (t) => {
    const script = validateScript({
        'statements': [
            {'include': 'test.mds'}
        ]
    });
    const fetchFn = (url) => {
        t.true(url === 'test.mds');
        return {
            'ok': false,
            'statusText': 'Not Found'
        };
    };
    const options = {fetchFn};
    const error = await t.throwsAsync(
        async () => executeScriptAsync(script, {}, options),
        {'instanceOf': CalcScriptRuntimeError}
    );
    t.is(error.message, 'Include of "test.mds" failed with error: Not Found');
});


test('executeScriptAsync, include fetchFn text error', async (t) => {
    const script = validateScript({
        'statements': [
            {'include': 'test.mds'}
        ]
    });
    const fetchFn = (url) => {
        t.true(url === 'test.mds');
        return {
            'ok': true,
            'text': () => {
                throw new Error('text error');
            }
        };
    };
    const options = {fetchFn};
    const error = await t.throwsAsync(
        async () => executeScriptAsync(script, {}, options),
        {'instanceOf': CalcScriptRuntimeError}
    );
    t.is(error.message, 'Include of "test.mds" failed with error: text error');
});


test('executeScriptAsync, include fetchFn parser error', async (t) => {
    const script = validateScript({
        'statements': [
            {'include': 'test.mds'}
        ]
    });
    const fetchFn = (url) => {
        t.true(url === 'test.mds');
        return {
            'ok': true,
            'text': () => 'foo bar'
        };
    };
    const options = {fetchFn};
    const error = await t.throwsAsync(
        async () => executeScriptAsync(script, {}, options),
        {'instanceOf': CalcScriptParserError}
    );
    t.is(error.message, `\
Included from "test.mds"
Syntax error, line number 1:
foo bar
   ^
`);
});


test('executeScriptAsync, error maxStatements', async (t) => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'async': true,
                    'name': 'fn',
                    'statements': [
                        {'expr': {'variable': 'a'}},
                        {'expr': {'variable': 'b'}}
                    ]
                }
            },
            {'expr': {'function': {'name': 'fn'}}}
        ]
    });
    const error = await t.throwsAsync(
        async () => executeScriptAsync(script, {}, {'maxStatements': 3}),
        {'instanceOf': CalcScriptRuntimeError}
    );
    t.is(error.message, 'Exceeded maximum script statements (3)');
    t.is(await executeScriptAsync(script, {}, {'maxStatements': 4}), null);
    t.is(await executeScriptAsync(script, {}, {'maxStatements': 0}), null);
});


test('evaluateExpressionAsync', async (t) => {
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
    const asyncCeil = async ([x]) => Math.ceil(x);
    const globals = {asyncCeil, 'varName': 4};
    t.is(await evaluateExpressionAsync(calc, globals), 19);
});


test('evaluateExpressionAsync, string', async (t) => {
    const calc = validateExpression({'string': 'abc'});
    t.is(await evaluateExpressionAsync(calc), 'abc');
});


test('evaluateExpressionAsync, variable', async (t) => {
    const calc = validateExpression({'variable': 'varName'});
    const globals = {'varName': 4};
    t.is(await evaluateExpressionAsync(calc, globals), 4);
});


test('evaluateExpressionAsync, variable local', async (t) => {
    const calc = validateExpression({'variable': 'varName'});
    const locals = {'varName': 4};
    t.is(await evaluateExpressionAsync(calc, {}, locals), 4);
    t.deepEqual(locals, {'varName': 4});
});


test('evaluateExpressionAsync, variable null local non-null global', async (t) => {
    const calc = validateExpression({'variable': 'varName'});
    const globals = {'varName': 4};
    const locals = {'varName': null};
    t.is(await evaluateExpressionAsync(calc, globals, locals), null);
});


test('evaluateExpressionAsync, variable unknown', async (t) => {
    const calc = validateExpression({'variable': 'varName'});
    t.is(await evaluateExpressionAsync(calc), null);
});


test('evaluateExpressionAsync, variable literal null', async (t) => {
    const calc = validateExpression({'variable': 'null'});
    t.is(await evaluateExpressionAsync(calc), null);
});


test('evaluateExpressionAsync, variable literal true', async (t) => {
    const calc = validateExpression({'variable': 'true'});
    t.is(await evaluateExpressionAsync(calc), true);
});


test('evaluateExpressionAsync, variable literal false', async (t) => {
    const calc = validateExpression({'variable': 'false'});
    t.is(await evaluateExpressionAsync(calc), false);
});


test('evaluateExpressionAsync, function', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'myFunc',
            'args': [{'number': 1}, {'number': 2}]
        }
    });
    const globals = {
        'myFunc': async ([a, b]) => a + b
    };
    t.is(await evaluateExpressionAsync(calc, globals), 3);
});


test('evaluateExpressionAsync, function no return', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'myFunc'
        }
    });
    const globals = {
        'myFunc': async () => {
            // no return
        }
    };
    t.is(await evaluateExpressionAsync(calc, globals), null);
});


test('evaluateExpressionAsync, function if', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'variable': 'test'},
                {'function': {'name': 'setGlobal', 'args': [{'string': 'a'}, {'function': {'name': 'asyncOne'}}]}},
                {'function': {'name': 'setGlobal', 'args': [{'string': 'b'}, {'function': {'name': 'asyncOne'}}]}}
            ]
        }
    });
    const asyncOne = async () => 1;
    let globals = {asyncOne, 'test': true};
    t.is(await evaluateExpressionAsync(calc, globals), 1);
    t.deepEqual(globals, {asyncOne, 'test': true, 'a': 1});
    globals = {asyncOne, 'test': false};
    t.is(await evaluateExpressionAsync(calc, globals), 1);
    t.deepEqual(globals, {asyncOne, 'test': false, 'b': 1});
});


test('evaluateExpressionAsync, function if no value expression', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'if'
        }
    });
    t.is(await evaluateExpressionAsync(calc), null);
});


test('evaluateExpressionAsync, function if no true expression', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'function': {'name': 'asyncTrue'}}
            ]
        }
    });
    const asyncTrue = async () => true;
    t.is(await evaluateExpressionAsync(calc, {asyncTrue}), null);
});


test('evaluateExpressionAsync, function if no false expression', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'if',
            'args': [
                {'function': {'name': 'asyncFalse'}},
                {'number': 1}
            ]
        }
    });
    const asyncFalse = async () => false;
    t.is(await evaluateExpressionAsync(calc, {asyncFalse}), null);
});


test('evaluateExpressionAsync, function getGlobal setGlobal', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'setGlobal',
            'args': [
                {'string': 'b'},
                {
                    'function': {
                        'name': 'getGlobal',
                        'args': [
                            {'function': {'name': 'asyncA'}}
                        ]
                    }
                }
            ]
        }
    });
    const asyncA = async () => 'a';
    const globals = {asyncA, 'a': 1};
    t.is(await evaluateExpressionAsync(calc, globals), 1);
    t.deepEqual(globals, {asyncA, 'a': 1, 'b': 1});
});


test('evaluateExpressionAsync, function getGlobal setGlobal unknown', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'setGlobal',
            'args': [
                {'string': 'b'},
                {
                    'function': {
                        'name': 'getGlobal',
                        'args': [
                            {'function': {'name': 'asyncA'}}
                        ]
                    }
                }
            ]
        }
    });
    const asyncA = async () => 'a';
    const globals = {asyncA};
    t.is(await evaluateExpressionAsync(calc, globals), null);
    t.deepEqual(globals, {asyncA, 'b': null});
});


test('evaluateExpressionAsync, function builtin', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'abs',
            'args': [
                {'function': {'name': 'asyncOne'}}
            ]
        }
    });
    const asyncOne = async () => -1;
    t.is(await evaluateExpressionAsync(calc, {asyncOne}), 1);
});


test('evaluateExpressionAsync, function no-builtins', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'abs',
            'args': [
                {'function': {'name': 'asyncOne'}}
            ]
        }
    });
    const asyncOne = async () => -1;
    const error = await t.throwsAsync(
        async () => evaluateExpressionAsync(calc, {asyncOne}, null, null, false),
        {'instanceOf': CalcScriptRuntimeError}
    );
    t.is(error.message, 'Undefined function "abs"');
});


test('evaluateExpressionAsync, function global', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnName',
            'args': [
                {'function': {'name': 'asyncThree'}}
            ]
        }
    });
    const asyncThree = async () => 3;
    const globals = {asyncThree, 'fnName': ([number]) => 2 * number};
    t.is(await evaluateExpressionAsync(calc, globals), 6);
});


test('evaluateExpressionAsync, function local', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'function': {'name': 'asyncThree'}}
            ]
        }
    });
    const asyncThree = async () => 3;
    const locals = {'fnLocal': ([number]) => 2 * number};
    t.is(await evaluateExpressionAsync(calc, {asyncThree}, locals), 6);
});


test('evaluateExpressionAsync, function local null', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'function': {'name': 'asyncNull'}}
            ]
        }
    });
    const asyncNull = async () => null;
    const globals = {asyncNull, 'fnLocal': 'abc'};
    const locals = {'fnLocal': null};
    const error = await t.throwsAsync(
        async () => evaluateExpressionAsync(calc, globals, locals),
        {'instanceOf': CalcScriptRuntimeError}
    );
    t.is(error.message, 'Undefined function "fnLocal"');
});


test('evaluateExpressionAsync, function non-function', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'function': {'name': 'asyncNull'}}
            ]
        }
    });
    const asyncNull = async () => null;
    const globals = {asyncNull, 'fnLocal': 'abc'};
    t.is(await evaluateExpressionAsync(calc, globals), null);
});


test('evaluateExpressionAsync, function non-function logFn', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnLocal',
            'args': [
                {'function': {'name': 'asyncNull'}}
            ]
        }
    });
    const asyncNull = async () => null;
    const globals = {asyncNull, 'fnLocal': 'abc'};
    const logs = [];
    const logFn = (message) => {
        logs.push(message);
    };
    const options = {logFn};
    t.is(await evaluateExpressionAsync(calc, globals, null, options), null);
    t.deepEqual(logs, ['Error: Function "fnLocal" failed with error: funcValue is not a function']);
});


test('evaluateExpressionAsync, function unknown', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnUnknown',
            'args': [
                {'function': {'name': 'asyncNull'}}
            ]
        }
    });
    const asyncNull = async () => null;
    const error = await t.throwsAsync(
        async () => evaluateExpressionAsync(calc, {asyncNull}),
        {'instanceOf': CalcScriptRuntimeError}
    );
    t.is(error.message, 'Undefined function "fnUnknown"');
});


test('evaluateExpressionAsync, function async', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'fnAsync'
        }
    });
    const globals = {'fnAsync': async () => null};
    t.is(await evaluateExpressionAsync(calc, globals), null);
});


test('evaluateExpressionAsync, function runtime error', async (t) => {
    const calc = validateExpression({
        'function': {
            'name': 'test'
        }
    });
    const globals = {
        'test': async () => {
            throw new CalcScriptRuntimeError('Test error');
        }
    };
    const error = await t.throwsAsync(
        async () => evaluateExpressionAsync(calc, globals),
        {'instanceOf': CalcScriptRuntimeError}
    );
    t.is(error.message, 'Test error');
});


test('evaluateExpressionAsync, binary logical and', async (t) => {
    const calc = validateExpression({
        'binary': {
            'op': '&&',
            'left': {'variable': 'a'},
            'right': {'function': {'name': 'setGlobal', 'args': [{'string': 'b'}, {'function': {'name': 'asyncOne'}}]}}
        }
    });
    const asyncOne = async () => 1;
    const globals = {asyncOne};
    t.is(await evaluateExpressionAsync(calc, globals), null);
    t.deepEqual(globals, {asyncOne});
    globals.a = true;
    t.is(await evaluateExpressionAsync(calc, globals), 1);
    t.deepEqual(globals, {asyncOne, 'a': true, 'b': 1});
});


test('evaluateExpressionAsync, binary logical or', async (t) => {
    const calc = validateExpression({
        'binary': {
            'op': '||',
            'left': {'variable': 'a'},
            'right': {'function': {'name': 'setGlobal', 'args': [{'string': 'b'}, {'function': {'name': 'asyncOne'}}]}}
        }
    });
    const asyncOne = async () => 1;
    const globals = {asyncOne, 'a': true};
    t.is(await evaluateExpressionAsync(calc, globals), true);
    t.deepEqual(globals, {asyncOne, 'a': true});
    globals.a = false;
    t.is(await evaluateExpressionAsync(calc, globals), 1);
    t.deepEqual(globals, {asyncOne, 'a': false, 'b': 1});
});


test('evaluateExpressionAsync, binary exponentiation', async (t) => {
    const calc = validateExpression({'binary': {'op': '**', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), 100);
});


test('evaluateExpressionAsync, binary multiplication', async (t) => {
    const calc = validateExpression({'binary': {'op': '*', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), 20);
});


test('evaluateExpressionAsync, binary division', async (t) => {
    const calc = validateExpression({'binary': {'op': '/', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), 5);
});


test('evaluateExpressionAsync, binary modulus', async (t) => {
    const calc = validateExpression({'binary': {'op': '%', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), 0);
});


test('evaluateExpressionAsync, binary addition', async (t) => {
    const calc = validateExpression({'binary': {'op': '+', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), 12);
});


test('evaluateExpressionAsync, binary subtraction', async (t) => {
    const calc = validateExpression({'binary': {'op': '-', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), 8);
});


test('evaluateExpressionAsync, binary less-than or equal-to', async (t) => {
    const calc = validateExpression({'binary': {'op': '<=', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), false);
});


test('evaluateExpressionAsync, binary less-than', async (t) => {
    const calc = validateExpression({'binary': {'op': '<', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), false);
});


test('evaluateExpressionAsync, binary greater-than or equal-to', async (t) => {
    const calc = validateExpression({'binary': {'op': '>=', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), true);
});


test('evaluateExpressionAsync, binary greater-than', async (t) => {
    const calc = validateExpression({'binary': {'op': '>', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), true);
});


test('evaluateExpressionAsync, binary equality', async (t) => {
    const calc = validateExpression({'binary': {'op': '==', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), false);
});


test('evaluateExpressionAsync, binary inequality', async (t) => {
    const calc = validateExpression({'binary': {'op': '!=', 'left': {'number': '10'}, 'right': {'function': {'name': 'asyncTwo'}}}});
    const asyncTwo = async () => 2;
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), true);
});


test('evaluateExpressionAsync, unary not', async (t) => {
    const calc = validateExpression({'unary': {'op': '!', 'expr': {'function': {'name': 'asyncFalse'}}}});
    const asyncFalse = async () => false;
    t.is(await evaluateExpressionAsync(calc, {asyncFalse}), true);
});


test('evaluateExpressionAsync, unary negate', async (t) => {
    const calc = validateExpression({'unary': {'op': '-', 'expr': {'function': {'name': 'asyncOne'}}}});
    const asyncOne = async () => 1;
    t.is(await evaluateExpressionAsync(calc, {asyncOne}), -1);
});


test('evaluateExpressionAsync, group', async (t) => {
    const calc = validateExpression(
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
    t.is(await evaluateExpressionAsync(calc, {asyncTwo}), 16);
});
