// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/* eslint-disable id-length */

import {evaluateExpression, executeScript} from '../lib/runtime.js';
import {parseExpression, parseScript} from '../lib/parser.js';
import {validateExpression, validateScript} from '../lib/model.js';
import test from 'ava';
test('parseScript, jumpif', (t) => {
    const script = validateScript(parseScript(`
n = 10
i = 0
a = 0
b = 1

fib:
    jumpif (i >= [n]) fibend
    tmp = b
    b = a + b
    a = tmp
    i = i + 1
    jump fib
fibend:

return a
`));
    t.deepEqual(script, {
        'statements': [
            {'assignment': {'name': 'n', 'expression': {'number': 10}}},
            {'assignment': {'name': 'i', 'expression': {'number': 0}}},
            {'assignment': {'name': 'a', 'expression': {'number': 0}}},
            {'assignment': {'name': 'b', 'expression': {'number': 1}}},
            {'label': 'fib'},
            {
                'jump': {
                    'label': 'fibend',
                    'expression': {'binary': {'operator': '>=', 'left': {'variable': 'i'}, 'right': {'variable': 'n'}}}
                }
            },
            {'assignment': {'name': 'tmp', 'expression': {'variable': 'b'}}},
            {
                'assignment': {
                    'name': 'b',
                    'expression': {'binary': {'operator': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
                }
            },
            {'assignment': {'name': 'a', 'expression': {'variable': 'tmp'}}},
            {
                'assignment': {
                    'name': 'i',
                    'expression': {'binary': {'operator': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}
                }
            },
            {'jump': {'label': 'fib'}},
            {'label': 'fibend'},
            {'return': {'variable': 'a'}}
        ]
    });
    t.is(executeScript(script), 55);
});


test('parseExpression', (t) => {
    const expr = parseExpression('7 + 3 * 5');
    t.deepEqual(validateExpression(expr), {
        'binary': {
            'operator': '+',
            'left': {'number': 7},
            'right': {
                'binary': {
                    'operator': '*',
                    'left': {'number': 3},
                    'right': {'number': 5}
                }
            }
        }
    });
    t.is(evaluateExpression(expr), 7 + 3 * 5);
});


test('parseExpression, operator precedence', (t) => {
    const expr = parseExpression('7 * 3 + 5');
    t.deepEqual(validateExpression(expr), {
        'binary': {
            'operator': '+',
            'left': {
                'binary': {
                    'operator': '*',
                    'left': {'number': 7},
                    'right': {'number': 3}
                }
            },
            'right': {'number': 5}
        }
    });
    t.is(evaluateExpression(expr), 7 * 3 + 5);
});


test('parseExpression, operator precedence 2', (t) => {
    const expr = parseExpression('2 * 3 + 4 - 1');
    t.deepEqual(validateExpression(expr), {
        'binary': {
            'operator': '-',
            'left': {
                'binary': {
                    'operator': '+',
                    'left': {
                        'binary': {
                            'operator': '*',
                            'left': {'number': 2},
                            'right': {'number': 3}
                        }
                    },
                    'right': {'number': 4}
                }
            },
            'right': {'number': 1}
        }
    });
    t.is(evaluateExpression(expr), 2 * 3 + 4 - 1);
});


test('parseExpression, operator precedence 3', (t) => {
    const expr = parseExpression('2 + 3 + 4 - 1');
    t.deepEqual(validateExpression(expr), {
        'binary': {
            'operator': '-',
            'left': {
                'binary': {
                    'operator': '+',
                    'left': {
                        'binary': {
                            'operator': '+',
                            'left': {'number': 2},
                            'right': {'number': 3}
                        }
                    },
                    'right': {'number': 4}
                }
            },
            'right': {'number': 1}
        }
    });
    t.is(evaluateExpression(expr), 2 + 3 + 4 - 1);
});


test('parseExpression, operator precedence 4', (t) => {
    const expr = parseExpression('1 - 2 + 3 + 4 + 5 * 6');
    t.deepEqual(validateExpression(expr), {
        'binary': {
            'operator': '+',
            'left': {
                'binary': {
                    'operator': '+',
                    'left': {
                        'binary': {
                            'operator': '+',
                            'left': {
                                'binary': {
                                    'operator': '-',
                                    'left': {'number': 1},
                                    'right': {'number': 2}
                                }
                            },
                            'right': {'number': 3}
                        }
                    },
                    'right': {'number': 4}
                }
            },
            'right': {
                'binary': {
                    'operator': '*',
                    'left': {'number': 5},
                    'right': {'number': 6}
                }
            }
        }
    });
    t.is(evaluateExpression(expr), 1 - 2 + 3 + 4 + 5 * 6);
});


test('parseExpression, operator precedence 5', (t) => {
    const expr = parseExpression('1 + 2 * 5 / 2');
    t.deepEqual(expr, {
        'binary': {
            'operator': '+',
            'left': {'number': 1},
            'right': {
                'binary': {
                    'operator': '/',
                    'left': {
                        'binary': {
                            'operator': '*',
                            'left': {'number': 2},
                            'right': {'number': 5}
                        }
                    },
                    'right': {'number': 2}
                }
            }
        }
    });
    t.is(evaluateExpression(expr), 1 + 2 * 5 / 2);
});


test('parseExpression, operator precedence 6', (t) => {
    const expr = parseExpression('1 + 2 / 5 * 2');
    t.deepEqual(expr, {
        'binary': {
            'operator': '+',
            'left': {'number': 1},
            'right': {
                'binary': {
                    'operator': '*',
                    'left': {
                        'binary': {
                            'operator': '/',
                            'left': {'number': 2},
                            'right': {'number': 5}
                        }
                    },
                    'right': {'number': 2}
                }
            }
        }
    });
    t.is(evaluateExpression(expr), 1 + 2 / 5 * 2);
});


test('parseExpression, operator precedence 7', (t) => {
    const expr = parseExpression('1 + 2 / 3 / 4 * 5');
    t.deepEqual(expr, {
        'binary': {
            'operator': '+',
            'left': {'number': 1},
            'right': {
                'binary': {
                    'operator': '*',
                    'left': {
                        'binary': {
                            'operator': '/',
                            'left': {
                                'binary': {
                                    'operator': '/',
                                    'left': {'number': 2},
                                    'right': {'number': 3}
                                }
                            },
                            'right': {'number': 4}
                        }
                    },
                    'right': {'number': 5}
                }
            }
        }
    });
    t.is(evaluateExpression(expr), 1 + 2 / 3 / 4 * 5);
});


test('parseExpression, operator precedence 8', (t) => {
    const expr = parseExpression('1 >= 2 && 3 < 4 - 5');
    t.deepEqual(expr, {
        'binary': {
            'operator': '&&',
            'left': {
                'binary': {
                    'operator': '>=',
                    'left': {'number': 1},
                    'right': {'number': 2}
                }
            },
            'right': {
                'binary': {
                    'operator': '<',
                    'left': {'number': 3},
                    'right': {
                        'binary': {
                            'operator': '-',
                            'left': {'number': 4},
                            'right': {'number': 5}
                        }
                    }
                }
            }
        }
    });
    t.is(evaluateExpression(expr), false);
});


test('parseExpression, group', (t) => {
    const expr = parseExpression('(7 + 3) * 5');
    t.deepEqual(validateExpression(expr), {
        'binary': {
            'operator': '*',
            'left': {
                'group': {
                    'binary': {
                        'operator': '+',
                        'left': {'number': 7},
                        'right': {'number': 3}
                    }
                }
            },
            'right': {'number': 5}
        }
    });
    t.is(evaluateExpression(expr), 50);
});


test('parseExpression, group nested', (t) => {
    const expr = parseExpression('(1 + (2))');
    t.deepEqual(validateExpression(expr), {
        'group': {
            'binary': {
                'operator': '+',
                'left': {'number': 1},
                'right': {'group': {'number': 2}}
            }
        }
    });
    t.is(evaluateExpression(expr), 3);
});


test('parseExpression, string literal', (t) => {
    const expr = parseExpression("'abc'");
    t.deepEqual(validateExpression(expr), {'string': 'abc'});
    t.is(evaluateExpression(expr), 'abc');
});


test('parseExpression, string literal escapes', (t) => {
    const expr = parseExpression("'ab \\'c\\' d\\\\e \\f'");
    t.deepEqual(validateExpression(expr), {'string': "ab 'c' d\\e \\f"});
    t.is(evaluateExpression(expr), "ab 'c' d\\e \\f");
});


test('parseExpression, string literal double-quote', (t) => {
    const expr = parseExpression('"abc"');
    t.deepEqual(validateExpression(expr), {'string': 'abc'});
    t.is(evaluateExpression(expr), 'abc');
});


test('parseExpression, string literal double-quote escapes', (t) => {
    const expr = parseExpression('"ab \\"c\\" d\\\\e \\f"');
    t.deepEqual(validateExpression(expr), {'string': 'ab "c" d\\e \\f'});
    t.is(evaluateExpression(expr), 'ab "c" d\\e \\f');
});
