// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

/* eslint-disable id-length */

import {parseExpression, parseScript} from '../lib/parser.js';
import {validateExpression, validateScript} from '../lib/model.js';
import test from 'ava';


test('parseScript, array input', (t) => {
    const script = validateScript(parseScript([
        'a = arrayNew( \\',
        '    1,\\',
        `\
    2 \
)
`
    ]));
    t.deepEqual(script, {
        'statements': [
            {
                'assign': {
                    'name': 'a',
                    'expr': {'function': {'name': 'arrayNew', 'args': [{'number': 1}, {'number': 2}]}}
                }
            }
        ]
    });
});


test('parseScript, line continuation', (t) => {
    const script = validateScript(parseScript(`\
a = arrayNew( \
    1, \
    2 \
)
`));
    t.deepEqual(script, {
        'statements': [
            {
                'assign': {
                    'name': 'a',
                    'expr': {'function': {'name': 'arrayNew', 'args': [{'number': 1}, {'number': 2}]}}
                }
            }
        ]
    });
});


test('parseScript, jumpif statement', (t) => {
    const script = validateScript(parseScript(`\
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
            {'assign': {'name': 'n', 'expr': {'number': 10}}},
            {'assign': {'name': 'i', 'expr': {'number': 0}}},
            {'assign': {'name': 'a', 'expr': {'number': 0}}},
            {'assign': {'name': 'b', 'expr': {'number': 1}}},
            {'label': 'fib'},
            {
                'jump': {
                    'label': 'fibend',
                    'expr': {'binary': {'op': '>=', 'left': {'variable': 'i'}, 'right': {'variable': 'n'}}}
                }
            },
            {'assign': {'name': 'tmp', 'expr': {'variable': 'b'}}},
            {
                'assign': {
                    'name': 'b',
                    'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
                }
            },
            {'assign': {'name': 'a', 'expr': {'variable': 'tmp'}}},
            {
                'assign': {
                    'name': 'i',
                    'expr': {'binary': {'op': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}
                }
            },
            {'jump': {'label': 'fib'}},
            {'label': 'fibend'},
            {'return': {'expr': {'variable': 'a'}}}
        ]
    });
});


test('parseScript, function statement', (t) => {
    const script = validateScript(parseScript(`\
function addNumbers(a, b)
    return a + b
endfunction
`));
    t.deepEqual(script, {
        'statements': [
            {
                'function': {
                    'name': 'addNumbers',
                    'args': ['a', 'b'],
                    'statements': [
                        {
                            'return': {
                                'expr': {'binary': {'op': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
                            }
                        }
                    ]
                }
            }
        ]
    });
});


test('parseScript, async function statement', (t) => {
    const script = validateScript(parseScript(`\
async function fetchURL(url)
    return fetch(url)
endfunction
`));
    t.deepEqual(script, {
        'statements': [
            {
                'function': {
                    'async': true,
                    'name': 'fetchURL',
                    'args': ['url'],
                    'statements': [
                        {'return': {'expr': {'function': {'name': 'fetch', 'args': [{'variable': 'url'}]}}}}
                    ]
                }
            }
        ]
    });
});


test('parseScript, include statement', (t) => {
    const script = validateScript(parseScript(`\
include 'fi\\'le.mds'
`));
    t.deepEqual(script, {
        'statements': [
            {'include': {'url': "fi'le.mds"}}
        ]
    });
});


test('parseScript, include statement, double-quotes', (t) => {
    const script = validateScript(parseScript(`\
include "fi\\"le.mds"
`));
    t.deepEqual(script, {
        'statements': [
            {'include': {'url': 'fi"le.mds'}}
        ]
    });
});


test('parseScript, expression statement syntax error', (t) => {
    const error = t.throws(() => {
        validateScript(parseScript(`\
a = 0
b = 1
foo \
bar
c = 2
`));
    });
    t.is(error.message, `\
Syntax error, line number 3:
foo bar
   ^
`);
    t.is(error.error, 'Syntax error');
    t.is(error.line, 'foo bar');
    t.is(error.columnNumber, 4);
    t.is(error.lineNumber, 3);
});


test('parseScript, assignment statement expression syntax error', (t) => {
    const error = t.throws(() => {
        validateScript(parseScript(`\
a = 0
b = 1 + foo bar
`));
    });
    t.is(error.message, `\
Syntax error, line number 2:
b = 1 + foo bar
           ^
`);
    t.is(error.error, 'Syntax error');
    t.is(error.line, 'b = 1 + foo bar');
    t.is(error.columnNumber, 12);
    t.is(error.lineNumber, 2);
});


test('parseScript, jump statement expression syntax error', (t) => {
    const error = t.throws(() => {
        validateScript(parseScript(`\
jumpif (@#$) label
`));
    });
    t.is(error.message, `\
Syntax error, line number 1:
jumpif (@#$) label
        ^
`);
    t.is(error.error, 'Syntax error');
    t.is(error.line, 'jumpif (@#$) label');
    t.is(error.columnNumber, 9);
    t.is(error.lineNumber, 1);
});


test('parseScript, return statement expression syntax error', (t) => {
    const error = t.throws(() => {
        validateScript(parseScript(`\
return @#$
`));
    });
    t.is(error.message, `\
Syntax error, line number 1:
return @#$
       ^
`);
    t.is(error.error, 'Syntax error');
    t.is(error.line, 'return @#$');
    t.is(error.columnNumber, 8);
    t.is(error.lineNumber, 1);
});


test('parseScript, nested function statement error', (t) => {
    const error = t.throws(() => {
        validateScript(parseScript(`\
function foo()
    function bar()
    endfunction
endfunction
`));
    });
    t.is(error.message, `\
Nested function definition, line number 2:
    function bar()
^
`);
    t.is(error.error, 'Nested function definition');
    t.is(error.line, '    function bar()');
    t.is(error.columnNumber, 1);
    t.is(error.lineNumber, 2);
});


test('parseScript, endfunction statement error', (t) => {
    const error = t.throws(() => {
        validateScript(parseScript(`\
a = 1
endfunction
`));
    });
    t.is(error.message, `\
No matching function definition, line number 2:
endfunction
^
`);
    t.is(error.error, 'No matching function definition');
    t.is(error.line, 'endfunction');
    t.is(error.columnNumber, 1);
    t.is(error.lineNumber, 2);
});


test('parseExpression', (t) => {
    const expr = parseExpression('7 + 3 * 5');
    t.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '+',
            'left': {'number': 7},
            'right': {
                'binary': {
                    'op': '*',
                    'left': {'number': 3},
                    'right': {'number': 5}
                }
            }
        }
    });
});


test('parseExpression, unary', (t) => {
    const expr = parseExpression('!a');
    t.deepEqual(validateExpression(expr), {
        'unary': {
            'op': '!',
            'expr': {'variable': 'a'}
        }
    });
});


test('parseExpression, syntax error', (t) => {
    const exprText = ' @#$';
    const error = t.throws(() => {
        parseExpression(exprText);
    });
    t.is(error.message, `\
Syntax error:
${exprText}
^
`);
    t.is(error.line, exprText);
    t.is(error.columnNumber, 1);
    t.is(error.lineNumber, null);
});


test('parseExpression, nextText syntax error', (t) => {
    const exprText = 'foo bar';
    const error = t.throws(() => {
        parseExpression(exprText);
    });
    t.is(error.message, `\
Syntax error:
${exprText}
   ^
`);
    t.is(error.line, exprText);
    t.is(error.columnNumber, 4);
    t.is(error.lineNumber, null);
});


test('parseExpression, syntax error, unmatched parenthesis', (t) => {
    const exprText = '10 * (1 + 2';
    const error = t.throws(() => {
        parseExpression(exprText);
    });
    t.is(error.message, `\
Unmatched parenthesis:
${exprText}
    ^
`);
    t.is(error.line, exprText);
    t.is(error.columnNumber, 5);
    t.is(error.lineNumber, null);
});


test('parseExpression, function argument syntax error', (t) => {
    const exprText = 'foo(1, 2 3)';
    const error = t.throws(() => {
        parseExpression(exprText);
    });
    t.is(error.message, `\
Syntax error:
foo(1, 2 3)
        ^
`);
    t.is(error.line, exprText);
    t.is(error.columnNumber, 9);
    t.is(error.lineNumber, null);
});


test('parseExpression, operator precedence', (t) => {
    const expr = parseExpression('7 * 3 + 5');
    t.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '+',
            'left': {
                'binary': {
                    'op': '*',
                    'left': {'number': 7},
                    'right': {'number': 3}
                }
            },
            'right': {'number': 5}
        }
    });
});


test('parseExpression, operator precedence 2', (t) => {
    const expr = parseExpression('2 * 3 + 4 - 1');
    t.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '-',
            'left': {
                'binary': {
                    'op': '+',
                    'left': {
                        'binary': {
                            'op': '*',
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
});


test('parseExpression, operator precedence 3', (t) => {
    const expr = parseExpression('2 + 3 + 4 - 1');
    t.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '-',
            'left': {
                'binary': {
                    'op': '+',
                    'left': {
                        'binary': {
                            'op': '+',
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
});


test('parseExpression, operator precedence 4', (t) => {
    const expr = parseExpression('1 - 2 + 3 + 4 + 5 * 6');
    t.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '+',
            'left': {
                'binary': {
                    'op': '+',
                    'left': {
                        'binary': {
                            'op': '+',
                            'left': {
                                'binary': {
                                    'op': '-',
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
                    'op': '*',
                    'left': {'number': 5},
                    'right': {'number': 6}
                }
            }
        }
    });
});


test('parseExpression, operator precedence 5', (t) => {
    const expr = parseExpression('1 + 2 * 5 / 2');
    t.deepEqual(expr, {
        'binary': {
            'op': '+',
            'left': {'number': 1},
            'right': {
                'binary': {
                    'op': '/',
                    'left': {
                        'binary': {
                            'op': '*',
                            'left': {'number': 2},
                            'right': {'number': 5}
                        }
                    },
                    'right': {'number': 2}
                }
            }
        }
    });
});


test('parseExpression, operator precedence 6', (t) => {
    const expr = parseExpression('1 + 2 / 5 * 2');
    t.deepEqual(expr, {
        'binary': {
            'op': '+',
            'left': {'number': 1},
            'right': {
                'binary': {
                    'op': '*',
                    'left': {
                        'binary': {
                            'op': '/',
                            'left': {'number': 2},
                            'right': {'number': 5}
                        }
                    },
                    'right': {'number': 2}
                }
            }
        }
    });
});


test('parseExpression, operator precedence 7', (t) => {
    const expr = parseExpression('1 + 2 / 3 / 4 * 5');
    t.deepEqual(expr, {
        'binary': {
            'op': '+',
            'left': {'number': 1},
            'right': {
                'binary': {
                    'op': '*',
                    'left': {
                        'binary': {
                            'op': '/',
                            'left': {
                                'binary': {
                                    'op': '/',
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
});


test('parseExpression, operator precedence 8', (t) => {
    const expr = parseExpression('1 >= 2 && 3 < 4 - 5');
    t.deepEqual(expr, {
        'binary': {
            'op': '&&',
            'left': {
                'binary': {
                    'op': '>=',
                    'left': {'number': 1},
                    'right': {'number': 2}
                }
            },
            'right': {
                'binary': {
                    'op': '<',
                    'left': {'number': 3},
                    'right': {
                        'binary': {
                            'op': '-',
                            'left': {'number': 4},
                            'right': {'number': 5}
                        }
                    }
                }
            }
        }
    });
});


test('parseExpression, group', (t) => {
    const expr = parseExpression('(7 + 3) * 5');
    t.deepEqual(validateExpression(expr), {
        'binary': {
            'op': '*',
            'left': {
                'group': {
                    'binary': {
                        'op': '+',
                        'left': {'number': 7},
                        'right': {'number': 3}
                    }
                }
            },
            'right': {'number': 5}
        }
    });
});


test('parseExpression, group nested', (t) => {
    const expr = parseExpression('(1 + (2))');
    t.deepEqual(validateExpression(expr), {
        'group': {
            'binary': {
                'op': '+',
                'left': {'number': 1},
                'right': {'group': {'number': 2}}
            }
        }
    });
});


test('parseExpression, string literal', (t) => {
    const expr = parseExpression("'abc'");
    t.deepEqual(validateExpression(expr), {'string': 'abc'});
});


test('parseExpression, string literal escapes', (t) => {
    const expr = parseExpression("'ab \\'c\\' d\\\\e \\f'");
    t.deepEqual(validateExpression(expr), {'string': "ab 'c' d\\e \\f"});
});


test('parseExpression, string literal double-quote', (t) => {
    const expr = parseExpression('"abc"');
    t.deepEqual(validateExpression(expr), {'string': 'abc'});
});


test('parseExpression, string literal double-quote escapes', (t) => {
    const expr = parseExpression('"ab \\"c\\" d\\\\e \\f"');
    t.deepEqual(validateExpression(expr), {'string': 'ab "c" d\\e \\f'});
});
