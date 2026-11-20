// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {barescriptParseScript, executeScript} from '../lib/runtime.js';
import {compileConfigure, compileSettings} from '../lib/runtimeCompile.js';
import {strict as assert} from 'node:assert';
import {executeScriptAsync} from '../lib/runtimeAsync.js';
import {scriptFunctions} from '../lib/library.js';
import test from 'node:test';
import {valueJSON} from '../lib/value.js';


// Helper to compute a script execution's observable outcome
function executeOutcome(options, logs, result, error, statementCount = true) {
    const globals = {};
    for (const [name, value] of Object.entries(options.globals)) {
        if (typeof value !== 'function' && !name.startsWith('__barescript')) {
            globals[name] = valueJSON(value);
        }
    }
    return {
        'result': (error === null ? valueJSON(result) : null),
        'error': (error !== null ? error.message : null),
        // The statement count is exact unless a runtime error (other than the statement limit) ends the script,
        // or a function error (which the calling function handles) ends a function mid-run
        'statementCount': (statementCount && (error === null || error.message.includes('Exceeded maximum'))
            ? options.statementCount : null),
        globals,
        logs
    };
}


// Helper to set the compiler mode
function setCompiled(compiled) {
    const settings = {...compileSettings};
    compileSettings.threshold = (compiled ? 1 : 0);
    compileSettings.topLevel = compiled;
    return settings;
}


// Helper to execute a script with the interpreter and with the compiler and assert that the outcomes are identical
function executeBoth(scriptText, optionsExtra = {}, globalsFn = null, statementCount = true) {
    const outcomes = [];
    for (const compiled of [false, true]) {
        const settings = setCompiled(compiled);
        try {
            const script = barescriptParseScript(scriptText, 1, 'test.bare');
            const logs = [];
            const options = {
                'globals': (globalsFn !== null ? globalsFn() : {}), 'debug': true, 'logFn': (message) => logs.push(message), ...optionsExtra
            };
            let result = null;
            let error = null;
            try {
                result = executeScript(script, options);
            } catch (errorCaught) {
                error = errorCaught;
            }
            outcomes.push(executeOutcome(options, logs, result, error, statementCount));
        } finally {
            Object.assign(compileSettings, settings);
        }
    }
    assert.deepEqual(outcomes[1], outcomes[0]);
    return outcomes[0];
}


// Helper to execute an async script with the interpreter and with the compiler
async function executeBothAsync(scriptText, optionsExtra, globalsFn) {
    const outcomes = [];
    for (const compiled of [false, true]) {
        const settings = setCompiled(compiled);
        try {
            const script = barescriptParseScript(scriptText, 1, 'test.bare');
            const logs = [];
            const options = {'globals': globalsFn(), 'debug': true, 'logFn': (message) => logs.push(message), ...optionsExtra};
            let result = null;
            let error = null;
            try {
                result = await executeScriptAsync(script, options);
            } catch (errorCaught) {
                error = errorCaught;
            }
            outcomes.push(executeOutcome(options, logs, result, error));
        } finally {
            Object.assign(compileSettings, settings);
        }
    }
    assert.deepEqual(outcomes[1], outcomes[0]);
    return outcomes[0];
}


test('compile, arithmetic', () => {
    const outcome = executeBoth(`\
function test(a, b, s, d):
    results = []
    arrayPush(results, a + b, a - b, a * b, a / b, a % b, a ** b)
    arrayPush(results, a + 1, 1 + a, a - 1, 1 - a, 2 * a, a / 2, a % 2, a ** 2, -a, -(a + b))
    arrayPush(results, a * a + b * b, (a - b) * (a + b) / (a * b), a / (b - b), a % (b - b), a ** (b * 1000))
    arrayPush(results, 1e308 * 10 + a, 1e308 * 10 - 1e308 * 10, a / (1e308 * 10), a ** (a / 0), 2 * a * b + 1)
    arrayPush(results, mathSqrt(a * a + b * b), mathSqrt(a - b * 10), mathFloor(a / b), mathCeil(a / b + 0.5), mathAbs(b - a * 3))
    arrayPush(results, mathSqrt(a * a + b * b) > 2, a * 2 < b + 10, a + 1 == b - 1, a * b != 12, a - 1 >= b, 1 + a <= b * 2)
    arrayPush(results, s + a, a + s, s + s, s + null, null + s, s + true, s + [1, 2], s + {'a': 1}, s + d)
    arrayPush(results, null + 1, 1 + null, null - 1, null * 2, s * 2, s - 1, s / 2, -s, -null, true + 1)
    arrayPush(results, d + 1000, 1000 + d, d - d, d - 1, 1 - d, d + d, d + s)
    arrayPush(results, s * 2 + 1, (s + 1) * 2, s + 1 + 2, 1 + 2 + s, a + b + s, mathFloor(s) + 1, mathSqrt(s * 2))
    big = 1e308
    arrayPush(results, big + big, big - -big, -big - big, mathSqrt(a) + 1, mathSqrt(s) + 1, mathSqrt(b) * 2, 1 / mathSqrt(a + 1))
    arrayPush(results, d + 1e300, 1e300 + d, 1 < 2, 2 <= 1, 3 == 3, if(a, null, null), a - d, d - a)
    return results
endfunction

return [test(3, 4, 'abc', datetimeNew(2026, 1, 2)), test(1.5, -2, '', datetimeNew(2026, 1, 2)), test(0, 0, 'x', datetimeNew(1970, 1, 1))]
`);
    assert.equal(outcome.error, null);
    assert.equal(JSON.parse(outcome.result)[0][0], 7);
});


test('compile, comparison and logical', () => {
    const outcome = executeBoth(`\
function test(a, b):
    results = []
    arrayPush(results, a < b, a <= b, a > b, a >= b, a == b, a != b)
    arrayPush(results, a == null, null == a, a != null, a == 1, 1 == a, a == 'a', 'a' != a, a == true, a == false)
    arrayPush(results, a < 1, 1 < a, a >= 'a', a && b, a || b, !a, !!b, a && b && 1, a || b || 1, (a < b) && (b < a))
    arrayPush(results, (a < b) || b, a && (a < b), if(a, 'yes', 'no'), if(a < b, 1), if(a), if(), if(a, b), if(!a, null, b))
    arrayPush(results, a & b, a | b, a ^ b, a << b, a >> b, ~a, a & 3, 3 | b, 1 << 4, 6 >> 1, 5.5 & 1, a ^ 1.5)
    if a && !b:
        arrayPush(results, 'a-not-b')
    elif a || b:
        arrayPush(results, 'a-or-b')
    else:
        arrayPush(results, 'neither')
    endif
    if objectHas({'a': 1}, 'a') && !objectHas({'a': 1}, 'b'):
        arrayPush(results, 'has')
    endif
    return results
endfunction

values = [null, true, false, 0, 1, 2, -1, 1.5, '', 'a', 'b', [], [1], [1, 2], {}, {'a': 1}, datetimeNew(2026, 1, 2), test]
results = []
for a in values:
    for b in values:
        arrayPush(results, test(a, b))
    endfor
endfor
return results
`);
    assert.equal(outcome.error, null);
});


test('compile, control flow', () => {
    const outcome = executeBoth(`\
function loops(n):
    results = []
    ix = 0
    while ix < n:
        ix = ix + 1
        if ix % 2:
            continue
        endif
        if ix > 7:
            break
        endif
        for value, ixValue in [10, 20, 30]:
            if value == 20:
                continue
            endif
            for inner in arrayNewSize(ix, 1):
                if inner > 1:
                    break
                endif
                arrayPush(results, ix * 100 + value + ixValue)
            endfor
        endfor
    endwhile
    for unused in []:
        arrayPush(results, 'never')
    endfor
    return results
endfunction

function early(n):
    if n < 0:
        return 'negative'
    endif
    while true:
        if n > 3:
            return n
        endif
        n = n + 1
    endwhile
endfunction

function noReturn(n):
    n = n + 1
endfunction

function jumps(n):
    count = 0
    jump start
    again:
    count = count + 10
    start:
    count = count + 1
    jumpif (count < n) again
    jumpif (count > 1000) never
    never:
    return count
endfunction

# A top-level loop
total = 0
ixTop = 0
while ixTop < 5:
    total = total + ixTop
    ixTop = ixTop + 1
endwhile

return [loops(10), loops(0), early(-1), early(0), early(10), noReturn(1), jumps(25), jumps(0), total]
`);
    assert.equal(outcome.error, null);
});


test('compile, overlapping loops', () => {
    const outcome = executeBoth(`\
function test(n):
    count = 0
    first:
    count = count + 1
    second:
    count = count + 10
    jumpif (count < n) first
    count = count + 100
    jumpif (count < n * 10) second
    return count
endfunction

return [test(0), test(30), test(100)]
`);
    assert.deepEqual(JSON.parse(outcome.result), [111, 353, 1090]);
});


test('compile, configure', () => {
    const settings = {...compileSettings};
    try {
        compileConfigure('off');
        assert.deepEqual(compileSettings, {'threshold': 0, 'topLevel': settings.topLevel, 'ignoreCoverage': settings.ignoreCoverage});
        compileConfigure('all');
        assert.deepEqual(compileSettings, {'threshold': 1, 'topLevel': true, 'ignoreCoverage': false});
        compileConfigure('force');
        assert.deepEqual(compileSettings, {'threshold': 1, 'topLevel': true, 'ignoreCoverage': true});

        // Forced compilation ignores statement coverage
        const options = {'globals': {'__barescriptCoverage': {'enabled': true}}};
        const script = barescriptParseScript('function test():\n    return 1\nendfunction\nreturn test()', 1, 'test.bare');
        assert.equal(executeScript(script, options), 1);
        assert.equal('scripts' in options.globals.__barescriptCoverage, false);
        compileConfigure('5');
        assert.equal(compileSettings.threshold, 5);
        for (const mode of [null, '', 'ALL', '-1', '1.5', 'abc']) {
            compileConfigure(mode);
            assert.equal(compileSettings.threshold, 5);
        }
    } finally {
        Object.assign(compileSettings, settings);
    }
});


test('compile, irreducible jumps are interpreted', () => {
    const outcome = executeBoth(`\
function test(n):
    count = 0
    jumpif (n > 0) inside
    loop:
    count = count + 1
    inside:
    count = count + 100
    jumpif (count < 500) loop
    return count
endfunction

return [test(0), test(1)]
`);
    assert.deepEqual(JSON.parse(outcome.result), [505, 504]);
});


test('compile, functions and variables', () => {
    const outcome = executeBoth(`\
globalValue = 'global'
shadow = 'global-shadow'
constructor = 'ctor'

function args(a, b, c):
    return [a, b, c]
endfunction

function rest(a, b...):
    return [a, b]
endfunction

function restOnly(a...):
    return a
endfunction

function fib(n):
    return if(n < 2, n, fib(n - 1) + fib(n - 2))
endfunction

function variables(flag):
    before = [globalValue, shadow, unknown, toString, constructor, valueOf]
    if flag:
        shadow = 'local-shadow'
        flagOnly = 1
    endif
    return [before, shadow, flagOnly, globalValue, __proto__, hasOwnProperty]
endfunction

function callLocal(fn, flag):
    if flag:
        args = rest
    endif
    partial = systemPartial(fn, 7)
    return [fn(1, 2, 3), args(4, 5, 6), partial(8, 9)]
endfunction

function setGlobal():
    systemGlobalSet('globalValue', 'changed')
    return globalValue
endfunction

function globalFunctionChange():
    first = helper()
    systemGlobalSet('helper', helper2)
    return [first, helper()]
endfunction

function helper():
    return 'helper'
endfunction

function helper2():
    return 'helper2'
endfunction

results = [args(), args(1), args(1, 2, 3, 4), rest(), rest(1), rest(1, 2, 3), restOnly(), restOnly(1, 2), fib(15)]
arrayPush(results, variables(false), variables(true), callLocal(args, false), callLocal(rest, true), setGlobal())
arrayPush(results, globalFunctionChange(), arraySort([3, 1, 2], systemPartial(args, 1)), fib)
return results
`);
    assert.equal(outcome.error, null);
});


test('compile, intrinsics', () => {
    const outcome = executeBoth(`\
function test(value):
    results = []
    object = {'a': 1, 'constructor': 2, 'nil': null}
    array = [1, 2, 3]
    match = regexMatch(regexNew('(?<first>a)|(?<second>b)'), 'b')
    groups = objectGet(match, 'groups')
    arrayPush(results, objectGet(object, 'a'), objectGet(object, 'b'), objectGet(object, 'b', 5), objectGet(object, 'nil', 5))
    arrayPush(results, objectGet(object, 'constructor'), objectGet(object, 'toString'), objectGet(object, 'toString', 5))
    arrayPush(results, objectGet(groups, 'first'), objectGet(groups, 'first', 5), objectGet(groups, 'second'), objectHas(groups, 'first'))
    arrayPush(results, objectGet(object, value), objectGet(object, value, 5), objectGet(groups, value, 5), objectHas(groups, value))
    arrayPush(results, objectGet(value, 'a'), objectGet(value, value), objectGet(), objectGet(object), objectGet(object, 'a', 1, 2))
    arrayPush(results, objectHas(object, 'a'), objectHas(object, 'b'), objectHas(object, 'nil'), objectHas(object, 'toString'))
    arrayPush(results, objectHas(object, value), objectHas(value, 'a'), objectHas(value, value), objectHas(object))
    arrayPush(results, objectSet(object, 'b', 2), objectSet(object, value, 3), objectSet(value, 'a', 1), objectSet(object, 'c'))
    arrayPush(results, objectSet(object, '__proto__', 4), objectGet(object, '__proto__'), objectKeys(object), objectKeys(value))
    arrayPush(results, objectDelete(object, 'b'), objectDelete(object, value), objectDelete(value, 'a'), objectCopy(object))
    arrayPush(results, objectCopy(value), {'x': value, 'y': 1, 'x': 2}, {'__proto__': 1}, {value: 1}, objectNew('a'))
    arrayPush(results, arrayGet(array, 0), arrayGet(array, 2), arrayGet(array, 3), arrayGet(array, -1), arrayGet(array, 1.5))
    arrayPush(results, arrayGet(array, value), arrayGet(value, 0), arrayGet(array), arrayLength(array), arrayLength(value))
    arrayPush(results, arraySet(array, 0, 9), arraySet(array, 5, 9), arraySet(array, value, 9), arraySet(value, 0, 9))
    arrayPush(results, arrayPush(array, 4), arrayPush(array, 5, 6), arrayPush(value, 1), arrayPush(array), arrayPop(array))
    arrayPush(results, arrayPop([]), arrayPop(value), arrayCopy(array), arrayCopy(value), arrayExtend(array, [7, 8]))
    arrayPush(results, arrayExtend(array, value), arrayExtend(value, array), arrayJoin(array, ','), arrayJoin([1, null, 'a', [2]], '-'))
    arrayPush(results, arrayJoin(array, value), arrayJoin(value, ','), arraySlice(array), arraySlice(array, 1), arraySlice(array, 1, 3))
    arrayPush(results, arraySlice(array, 1, null), arraySlice(array, 99), arraySlice(array, 1, 99), arraySlice(value, 1), [], [value])
    arrayPush(results, stringLength('abc'), stringLength(value), stringSlice('abcdef', 2), stringSlice('abcdef', 2, 4))
    arrayPush(results, stringSlice('abcdef', 2, null), stringSlice('abcdef', 9), stringSlice('abcdef', 1, 9), stringSlice(value, 1))
    arrayPush(results, stringIndexOf('abcabc', 'c'), stringIndexOf('abcabc', 'c', 3), stringIndexOf('abcabc', 'c', 9))
    arrayPush(results, stringIndexOf('abcabc', value), stringIndexOf(value, 'c'))
    arrayPush(results, stringStartsWith('abc', 'ab'), stringStartsWith('abc', value))
    arrayPush(results, stringEndsWith('abc', 'bc'), stringEndsWith(value, 'bc'), stringTrim(' a '), stringTrim(value), stringLower('AbC'))
    arrayPush(results, stringLower(value), stringUpper('AbC'), stringUpper(value), stringSplit('a,b', ','), stringSplit('a,b', value))
    arrayPush(results, stringCharAt('abc', 1), stringCharAt('abc', 3), stringCharAt(value, 0), stringCharCodeAt('abc', 1))
    arrayPush(results, stringCharCodeAt('abc', -1), stringCharCodeAt('abc', value), stringNew(value), stringNew(1.5), stringNew(array))
    arrayPush(results, mathSqrt(16), mathSqrt(-1), mathSqrt(value), mathFloor(1.5), mathFloor(value), mathCeil(1.5), mathCeil(value))
    arrayPush(results, mathAbs(-1.5), mathAbs(value), mathMax(1, 2), mathMax(2, 1), mathMax(value, 1), mathMax(1, 2, 3), mathMin(1, 2))
    arrayPush(results, mathMin(2, 1), mathMin(1, value), mathMin(), numberParseInt('12'), numberParseInt(' 12 '), numberParseInt('1.5'))
    arrayPush(results, numberParseInt(value), numberParseInt('ff', 16), systemType(value), systemType(array), systemType())
    arrayPush(results, regexMatch(regexNew('b'), 'abc'), regexMatch(regexNew('z'), 'abc'))
    arrayPush(results, regexMatch(value, 'abc'), regexMatch(regexNew('b'), value))
    arrayPush(results, regexMatch(regexNew('b', 'g'), 'abcb'), regexMatchAll(regexNew('b'), 'abcb'), regexMatchAll(value, 'abcb'))
    arrayPush(results, regexMatchAll(regexNew('(?<__proto__>b)|(c)'), 'abcb'), regexMatchAll(regexNew(''), 'ab'))
    arrayPush(results, regexReplace(regexNew('b'), 'abcb', 'x'), regexReplace(value, 'abcb', 'x'))
    arrayPush(results, regexReplace(regexNew('b'), 'abcb', value))
    arrayPush(results, stringTrim(), stringTrim('a', 'b'), mathFloor(), mathFloor(1, 2), stringSlice('abc'), stringSlice('abc', 1, 2, 3))
    arrayPush(results, stringIndexOf('abc'), stringIndexOf('abc', 'b', 0, 1), arraySlice(), arraySlice(array, 1, 2, 3))
    arrayPush(results, arrayLength(), arraySet(array, 0), mathSqrt(), objectKeys(), stringLength(), arrayCopy(), arrayExtend(array))
    arrayPush(results, arrayJoin(array), arrayPop(), objectCopy(), objectDelete(object), regexMatch(regexNew('b')), stringSlice())
    arrayPush(results, regexMatchAll(regexNew('b')), regexReplace(regexNew('b'), 'b'), stringCharAt('abc'), stringCharCodeAt('abc'))
    arrayPush(results, stringNew(), stringNew(1, 2), systemType(1, 2), objectHas(object), objectSet(object, 'a'))
    return results
endfunction

results = []
for value in [null, 'a', 'toString', '__proto__', 1, 1.5, [1, 2], {'a': 2}, regexNew('b'), true]:
    arrayPush(results, test(value))
endfor
return results
`);
    assert.equal(outcome.error, null);
    assert.notEqual(outcome.logs.length, 0);
});


test('compile, intrinsic overrides', () => {
    const outcome = executeBoth(`\
function arrayLengthMock(array):
    return 'mock'
endfunction

function mockDuring(array):
    before = arrayLength(array)
    systemGlobalSet('arrayLength', arrayLengthMock)
    during = arrayLength(array)
    systemGlobalSet('arrayLength', arrayLengthOriginal)
    return [before, during, arrayLength(array)]
endfunction

function useLength(array):
    return arrayLength(array)
endfunction

arrayLengthOriginal = arrayLength
results = [mockDuring([1, 2]), useLength([1])]

# Override by assignment
arrayLength = arrayLengthMock
arrayPush(results, useLength([1]), mathSqrt(4))
arrayLength = arrayLengthOriginal
arrayPush(results, useLength([1]))

# Override by definition
function objectGet(object, key):
    return 'objectGet mock'
endfunction
arrayPush(results, objectGet({'a': 1}, 'a'), useLength([1, 2, 3]))
return results
`);
    assert.deepEqual(JSON.parse(outcome.result), [[2, 'mock', 2], 1, 'mock', 2, 1, 'objectGet mock', 3]);

    // Host-provided overrides of the intrinsic functions
    const outcome2 = executeBoth(`\
function test(array):
    return [arrayLength(array), arrayGet(array, 0)]
endfunction

return test([1, 2])
`, {}, () => ({'arrayLength': () => 'host'}));
    assert.deepEqual(JSON.parse(outcome2.result), ['host', 1]);
});


test('compile, errors', () => {
    for (const [scriptText, error] of [
        [
            'function test():\n    return unknownFunction(1)\nendfunction\nreturn test()',
            'test.bare:2: Undefined function "unknownFunction"'
        ],
        ['function test():\n    value = null\n    return value(1)\nendfunction\nreturn test()', 'test.bare:3: Undefined function "value"'],
        ['function test():\n    jump unknownLabel\nendfunction\nreturn test()', 'test.bare:2: Unknown jump label "unknownLabel"'],
        [
            'function test(n):\n    jumpif (n) unknownLabel\n    return 1\nendfunction\nreturn test(1)',
            'test.bare:2: Unknown jump label "unknownLabel"'
        ],
        [
            'function test():\n    return systemFetch("url")\nendfunction\nreturn test()',
            'test.bare:2: Async function "systemFetch" called within non-async scope'
        ],
        ['function test():\n    return constructor()\nendfunction\nreturn test()', 'test.bare:2: Undefined function "constructor"']
    ]) {
        assert.equal(executeBoth(scriptText).error, error);
    }

    // Non-error function failures
    const outcome = executeBoth(`\
function test(value):
    number = 5
    return [number(1), value(2), value, arrayGet(value, 0)]
endfunction

function recurse(n):
    return recurse(n + 1)
endfunction

return [test('abc'), test(5), jsonParse('bad')]
`);
    assert.equal(outcome.error, null);
    assert.equal(outcome.logs.length, 7);
    assert.equal(executeBoth('function test(n):\n    jumpif (n) unknownLabel\n    return 1\nendfunction\nreturn test(0)').result, '1');

    // A runtime error within a library function's script function argument
    const outcome2 = executeBoth(`\
function compare(a, b):
    return unknownFunction(a, b)
endfunction

function test(array):
    return arraySort(array, compare)
endfunction

return test([2, 1])
`);
    assert.equal(outcome2.error, 'test.bare:2: Undefined function "unknownFunction"');
});


test('compile, maxStatements', () => {
    const scriptText = `\
function test(n):
    total = 0
    ix = 0
    while ix < n:
        if ix % 2:
            systemLog('odd ' + ix)
        endif
        total = total + ix
        ix = ix + 1
    endwhile
    return total
endfunction

count = 0
while count < 2:
    systemLog('total ' + test(3))
    count = count + 1
endwhile
return count
`;
    const complete = executeBoth(scriptText);
    assert.equal(complete.error, null);
    assert.equal(complete.statementCount, 52);

    // The statement limit is exact at every statement
    for (let maxStatements = 1; maxStatements <= complete.statementCount + 1; maxStatements++) {
        const outcome = executeBoth(scriptText, {maxStatements});
        if (maxStatements < complete.statementCount) {
            assert.match(outcome.error, /^test\.bare:\d+: Exceeded maximum script statements \(\d+\)$/u);
            assert.equal(outcome.statementCount, maxStatements + 1);
        } else {
            assert.equal(outcome.error, null);
        }
    }

    // No statement limit
    assert.equal(executeBoth(scriptText, {'maxStatements': 0}).error, null);
    assert.equal(executeBoth(scriptText, {'maxStatements': -1}).error, null);
    assert.match(executeBoth(scriptText, {'maxStatements': 20.5}).error, /Exceeded maximum script statements \(20\.5\)$/u);
});


test('compile, coverage is interpreted', () => {
    const outcome = executeBoth(`\
function test(n):
    total = 0
    while n > 0:
        total = total + n
        n = n - 1
    endwhile
    return total
endfunction

function coverage():
    systemGlobalSet('__barescriptCoverage', {'enabled': true})
    result = test(3)
    covered = objectGet(objectGet(objectGet(systemGlobalGet('__barescriptCoverage'), 'scripts'), 'test.bare'), 'covered')
    systemGlobalSet('__barescriptCoverage', {'enabled': false})
    counts = []
    for lineno in objectKeys(covered):
        arrayPush(counts, lineno + '=' + objectGet(objectGet(covered, lineno), 'count'))
    endfor
    return [result, counts, test(4)]
endfunction

return [test(2), coverage(), test(5)]
`);
    const [result1, [result2, counts], result3] = JSON.parse(outcome.result);
    assert.deepEqual([result1, result2, result3], [3, 6, 15]);
    assert.deepEqual(counts, ['2=1', '3=4', '4=3', '5=3', '6=4', '7=1']);
});


test('compile, globals with a prototype are interpreted', () => {
    const outcome = executeBoth(`\
function test():
    return [inherited, own]
endfunction

loops = 0
while loops < 2:
    loops = loops + 1
endwhile
return test()
`, {}, () => Object.create({'inherited': 1}, {'own': {'value': 2, 'enumerable': true, 'writable': true}}));
    assert.deepEqual(JSON.parse(outcome.result), [null, 2]);
});


test('compile, globals with object prototype member names', () => {
    const outcome = executeBoth(`\
function test():
    return [toString, valueOf(), hasOwnProperty, isPrototypeOf]
endfunction

return test()
`, {}, () => ({'toString': undefined, 'valueOf': () => 5, 'hasOwnProperty': 6}));
    assert.deepEqual(JSON.parse(outcome.result), [null, 5, 6, null]);
});


test('compile, includes and shared function state', () => {
    const scriptText = `\
include <url.bare>

function test(value):
    return urlEncodeComponent(value) + '|' + urlDecodeComponent('a%20b')
endfunction

function define():
    systemGlobalSet('defined', test('x y'))
endfunction

define()
results = []
ix = 0
while ix < 3:
    arrayPush(results, test('a b&' + ix))
    ix = ix + 1
endwhile
return results
`;
    const outcome = executeBoth(scriptText);
    assert.deepEqual(JSON.parse(outcome.result), ['a%20b%260|a b', 'a%20b%261|a b', 'a%20b%262|a b']);

    // A script model that is executed again uses its compiled code
    const settings = setCompiled(true);
    try {
        const script = barescriptParseScript(scriptText, 1, 'test.bare');
        const result1 = executeScript(script, {'globals': {}});
        const result2 = executeScript(script, {'globals': {}});
        assert.deepEqual(result2, result1);

        // A script function is callable by the host application
        const options = {'globals': {}};
        executeScript(script, options);
        assert.equal(options.globals.test(['a b'], options), 'a%20b|a b');
        assert.equal(options.globals.test(null, options), '|a b');
        assert.equal(options.globals.test(['c d'], {'globals': options.globals}), 'c%20d|a b');
    } finally {
        Object.assign(compileSettings, settings);
    }
});


test('compile, hand-built models', () => {
    for (const compiled of [false, true]) {
        const settings = setCompiled(compiled);
        try {
            const script = {
                'statements': [
                    {'function': {
                        'name': 'test',
                        'args': ['a', 'a'],
                        'statements': [
                            {'expr': {'name': 'b', 'expr': {'number': -0}}},
                            {'expr': {'expr': {'function': {'name': 'noArgs'}}}},
                            {'expr': {'expr': {'function': {'name': 'if'}}}},
                            {'expr': {'expr': {'function': {'name': 'arrayLength'}}}},
                            {'expr': {'expr': {'function': {'name': 'mathSqrt'}}}},
                            {'unknownStatement': {}},
                            {'function': {'name': 'nested', 'statements': [{'return': {'expr': {'string': 'nested'}}}]}},
                            {'include': {'includes': []}},
                            {'return': {'expr': {'function': {'name': 'arrayNew', 'args': [
                                {'variable': 'a'},
                                {'binary': {'op': '/', 'left': {'number': 1}, 'right': {'variable': 'b'}}},
                                {'unary': {'op': '~', 'expr': {'number': 5}}},
                                {'unary': {'op': '-', 'expr': {'number': 5}}},
                                {'unary': {'op': '-', 'expr': {'string': 'abc'}}},
                                {'unary': {'op': '~', 'expr': {'number': 1.5}}},
                                {'binary': {'op': '>>', 'left': {'number': -16}, 'right': {'number': 2}}},
                                {'function': {'name': 'nested', 'args': []}},
                                {'number': 'not-a-number'},
                                {'string': 7}
                            ]}}}}
                        ]
                    }},
                    {'function': {'name': 'noArgs', 'statements': [{'return': {'expr': {'number': 1}}}]}},
                    {'return': {'expr': {'function': {'name': 'test', 'args': [{'number': 1}, {'number': 2}]}}}}
                ]
            };
            assert.equal(valueJSON(executeScript(script, {'globals': {}})), '[2,null,-6,-5,null,null,-4,"nested","not-a-number",7]');
        } finally {
            Object.assign(compileSettings, settings);
        }
    }
});


test('compile, library function redefinition call forms', () => {
    // A call compiled for a library function, then called with a script function (and the reverse)
    const outcome = executeBoth(`\
function test(value):
    return stringRepeat(value, 2) + helper(value)
endfunction

function helper(value):
    return '-' + value
endfunction

function stringRepeatMock(value, count):
    return 'mock'
endfunction

results = [test('a')]
systemGlobalSet('stringRepeat', stringRepeatMock)
systemGlobalSet('helper', stringUpper)
arrayPush(results, test('b'))
return results
`);
    assert.deepEqual(JSON.parse(outcome.result), ['aa-a', 'mockB']);
});


test('compile, async functions', async () => {
    const globalsFn = () => ({
        // eslint-disable-next-line require-await
        'asyncDouble': async ([value]) => value * 2,
        'syncDouble': ([value]) => value * 2,
        'valueOf': () => 7
    });
    const outcome = await executeBothAsync(`\
async function test(n, fn):
    total = 0
    ix = 0
    while ix < n:
        total = total + (asyncDouble(ix)) + syncDouble(ix) + arrayLength(helper(ix))
        if asyncDouble(ix) > 2 && syncDouble(ix) > 2:
            total = total + 1000
        endif
        if ix == 1:
            double = asyncDouble
            total = total + double(100) + fn(100)
        endif
        ix = ix + 1
    endwhile
    systemLog('total ' + total)
    return asyncDouble(total)
endfunction

async function noAwait(n):
    return n + 1
endfunction

function helper(ix):
    return arrayNewSize(ix, null)
endfunction

async function returnsNothing():
    value = asyncDouble(1)
    return valueOf()
endfunction

return [test(4, asyncDouble), test(2, syncDouble), noAwait(1), returnsNothing(), test(0, null)]
`, {}, globalsFn);
    assert.equal(outcome.error, null);
    assert.equal(outcome.result, '[4860,810,2,7,0]');

    // Statement limit within an async function
    const scriptText = `\
async function test(n):
    total = 0
    while n > 0:
        total = total + asyncDouble(n)
        n = n - 1
    endwhile
    return total
endfunction

return test(3)
`;
    const complete = await executeBothAsync(scriptText, {}, globalsFn);
    assert.equal(complete.result, '12');
    for (let maxStatements = 1; maxStatements < complete.statementCount; maxStatements++) {
        const limited = await executeBothAsync(scriptText, {maxStatements}, globalsFn);
        assert.match(limited.error, /Exceeded maximum script statements/u);
    }

    // Async function coverage and errors
    const outcome2 = await executeBothAsync(`\
async function test(n):
    return asyncDouble(n) + unknownFunction()
endfunction

return test(1)
`, {}, globalsFn);
    assert.equal(outcome2.error, 'test.bare:2: Undefined function "unknownFunction"');
    const outcome3 = await executeBothAsync(`\
async function test(n):
    total = 0
    while n > 0:
        total = total + asyncDouble(n)
        n = n - 1
    endwhile
    return total
endfunction

systemGlobalSet('__barescriptCoverage', {'enabled': true})
return test(2)
`, {}, globalsFn);
    assert.equal(outcome3.result, '6');

    // An async function with a function statement is interpreted
    for (const compiled of [false, true]) {
        const settings = setCompiled(compiled);
        try {
            const script = {
                'statements': [
                    {'function': {
                        'name': 'test',
                        'async': true,
                        'statements': [
                            {'function': {'name': 'nested', 'statements': [{'return': {'expr': {'number': 5}}}]}},
                            {'return': {'expr': {'function': {'name': 'nested', 'args': []}}}}
                        ]
                    }},
                    {'function': {
                        'name': 'test2',
                        'async': true,
                        'statements': [
                            {'return': {'expr': {'function': {'name': 'noArgs'}}}}
                        ]
                    }},
                    {'function': {'name': 'noArgs', 'statements': [{'return': {'expr': {'number': 1}}}]}},
                    {'expr': {'expr': {'function': {'name': 'test2', 'args': []}}}},
                    {'return': {'expr': {'function': {'name': 'test', 'args': []}}}}
                ]
            };
                assert.equal(await executeScriptAsync(script, {'globals': {}}), 5);
        } finally {
            Object.assign(compileSettings, settings);
        }
    }
});


test('compile, script functions are library function arguments', () => {
    assert.equal(typeof scriptFunctions.arraySort, 'function');
    const outcome = executeBoth(`\
function compare(a, b):
    return b - a
endfunction

function test(array):
    return arraySort(arrayCopy(array), compare)
endfunction

return [test([1, 3, 2]), test([]), test([5, 4])]
`);
    assert.deepEqual(JSON.parse(outcome.result), [[3, 2, 1], [], [5, 4]]);
});


test('compile, function errors', () => {
    // A function error (any error but a runtime error) is handled where the function is called
    const outcome = executeBoth(`\
function inner(text):
    ix = 0
    while ix < 40:
        text = text + text
        ix = ix + 1
    endwhile
    return text
endfunction

function outer(n):
    value = if(n == 3, inner('abcdefgh'), 'skip')
    return 'outer: ' + value
endfunction

function main():
    return [outer(1), outer(2), outer(3), outer(3), arraySort([2, 1], compare)]
endfunction

function compare(a, b):
    return stringLength(inner('abcdefgh')) + a - b
endfunction

return main()
`, {}, null, false);
    assert.deepEqual(JSON.parse(outcome.result), ['outer: skip', 'outer: skip', 'outer: null', 'outer: null', [1, 2]]);
    assert.deepEqual(outcome.logs, [
        'test.bare:11: BareScript: Function "inner" failed with error: Invalid string length',
        'test.bare:11: BareScript: Function "inner" failed with error: Invalid string length',
        'test.bare:20: BareScript: Function "inner" failed with error: Invalid string length',
        'test.bare:20: BareScript: Function "stringLength" failed with error: Invalid "string" argument value, null'
    ]);

    // A function error within a script function called by the host application is thrown
    const settings = setCompiled(true);
    try {
        const script = barescriptParseScript(`\
function double(text):
    ix = 0
    while ix < 40:
        text = text + text
        ix = ix + 1
    endwhile
    return text
endfunction
`);
        const options = {'globals': {}};
        executeScript(script, options);
        assert.throws(() => options.globals.double(['abcdefgh'], options), RangeError);
        assert.throws(() => options.globals.double(['abcdefgh'], options), RangeError);
    } finally {
        Object.assign(compileSettings, settings);
    }
});


test('compile, undefined values are null', () => {
    // A regex match's unmatched group and a regex split's unmatched group are undefined
    const outcome = executeBoth(`\
suffix = 'GLOBAL'
part = 'GLOBAL'

function parse(text):
    groups = objectGet(regexMatch(regexNew('^(a)(b)?$'), text), 'groups')
    suffix = objectGet(groups, '2')
    part = arrayGet(regexSplit(regexNew('(x)?,'), text + ',b'), 1)
    return 'suffix=' + suffix + ' part=' + part + ' ' + objectGet(groups, '2', 'default') + ' ' + objectHas(groups, '2')
endfunction

return [parse('a'), parse('a'), parse('a')]
`);
    assert.deepEqual(JSON.parse(outcome.result), [
        'suffix=null part=null null true', 'suffix=null part=null null true', 'suffix=null part=null null true'
    ]);
});


test('compile, async function in both runtimes', async () => {
    const scriptText = `\
async function double(value):
    return slow(value)
endfunction

return [double(1), double(2), double(3)]
`;
    const globalsSync = () => ({'slow': ([value]) => value * 2});
    // eslint-disable-next-line require-await
    const globalsAsync = () => ({'slow': async ([value]) => value * 2});
    const settings = setCompiled(true);
    try {
        // The sync runtime, then the async runtime
        const script = barescriptParseScript(scriptText);
        assert.deepEqual(executeScript(script, {'globals': globalsSync()}), [2, 4, 6]);
        assert.deepEqual(await executeScriptAsync(script, {'globals': globalsAsync()}), [2, 4, 6]);
        assert.deepEqual(executeScript(script, {'globals': globalsSync()}), [2, 4, 6]);

        // The async runtime, then the sync runtime
        const script2 = barescriptParseScript(scriptText);
        assert.deepEqual(await executeScriptAsync(script2, {'globals': globalsAsync()}), [2, 4, 6]);
        assert.deepEqual(executeScript(script2, {'globals': globalsSync()}), [2, 4, 6]);
        assert.deepEqual(await executeScriptAsync(script2, {'globals': globalsSync()}), [2, 4, 6]);
    } finally {
        Object.assign(compileSettings, settings);
    }
});


test('compile, host application function calls', () => {
    for (const compiled of [false, true]) {
        const settings = setCompiled(compiled);
        try {
            const script = barescriptParseScript(`\
function spin(n):
    ix = 0
    while ix < n:
        ix = ix + 1
    endwhile
    return ix
endfunction

function count(array):
    return arrayLength(array)
endfunction

return [spin(10), count([1, 2])]
`, 1, 'test.bare');
            const options = {'globals': {}, 'maxStatements': 1000000};
            assert.deepEqual(executeScript(script, options), [10, 2]);

            // The maximum statements are read on every call
            options.maxStatements = 50;
            options.statementCount = 0;
            assert.throws(() => options.globals.spin([1000], options), {'message': 'test.bare:5: Exceeded maximum script statements (50)'});
            options.maxStatements = null;
            options.statementCount = 0;
            assert.equal(options.globals.spin([1000], options), 1000);

            // The intrinsic functions are validated for every options object
            options.globals.arrayLength = () => 'HOST';
            assert.equal(options.globals.count([[1, 2, 3]], {'globals': options.globals}), 'HOST');
        } finally {
            Object.assign(compileSettings, settings);
        }
    }
});


test('compile, computed object keys', () => {
    const outcome = executeBoth(`\
function makeRow(name, value):
    return {'col-' + name: value, if(value > 1, 'big', 'small'): name, 'fixed': 1}
endfunction

function counts(words):
    result = {}
    for word in words:
        objectSet(result, '' + word, objectGet(result, '' + word, 0) + 1)
    endfor
    return [result, objectHas(result, '' + 'a'), objectHas({}, '' + 'constructor'), objectGet({}, '' + 'toString')]
endfunction

function proto(key):
    object = {}
    objectSet(object, '' + key, {'inherited': 1})
    return [systemType(object), objectGet(object, 'inherited'), objectKeys(object)]
endfunction

results = [makeRow('a', 1), makeRow('b', 2), makeRow('c', 3)]
ix = 0
while ix < 3:
    arrayPush(results, {'k' + ix: ix})
    ix = ix + 1
endwhile
arrayPush(results, counts(['a', 'toString', 'a', 'toString']), counts(['constructor', '__proto__']), proto('__proto__'), proto('x'))
return results
`);
    const results = JSON.parse(outcome.result);
    assert.deepEqual(results.slice(0, 6), [
        {'col-a': 1, 'fixed': 1, 'small': 'a'}, {'big': 'b', 'col-b': 2, 'fixed': 1}, {'big': 'c', 'col-c': 3, 'fixed': 1},
        {'k0': 0}, {'k1': 1}, {'k2': 2}
    ]);
    assert.deepEqual(results[6], [{'a': 2, 'toString': 2}, true, false, null]);
    assert.deepEqual(results[8], ['object', null, ['__proto__']]);
});


test('compile, number literal intrinsic arguments', () => {
    const scriptText = `\
function test():
    return [arrayLength(5), objectGet(1, 'a'), stringSlice(5, 1), stringLength(1.5), arrayGet([1, 2], 1), objectKeys(0)]
endfunction

return [test(), test()]
`;
    const outcome = executeBoth(scriptText);
    assert.equal(outcome.result, '[[0,null,null,0,2,null],[0,null,null,0,2,null]]');

    // The function is compiled
    const settings = setCompiled(true);
    try {
        const options = {'globals': {}};
        executeScript(barescriptParseScript(scriptText), options);
        assert.equal(options.globals.test.$d.name, 'bs_test');
    } finally {
        Object.assign(compileSettings, settings);
    }
});


test('compile, fused expression evaluation order', () => {
    const outcome = executeBoth(`\
trace = []

function mathFloorTrace(value):
    arrayPush(trace, 'floor ' + value)
    return value
endfunction

function other(value):
    arrayPush(trace, 'other ' + value)
    globalValue = value
    systemGlobalSet('globalValue', globalValue + 1)
    return value
endfunction

function test(a, b):
    return [mathFloor(a) * 2 + other(b), mathFloor(a) * 2 + globalValue, mathSqrt(a * a) + other(b) > 2, mathFloor(a / 2) * 2 + b]
endfunction

globalValue = 100
results = [test(1.5, 2), test('x', arrayLength(2)), test(3, 4)]
mathFloorOriginal = mathFloor
systemGlobalSet('mathFloor', mathFloorTrace)
arrayPush(results, test(1.5, 2), test(5, 6))
systemGlobalSet('mathFloor', mathFloorOriginal)
arrayPush(results, test(7.5, 8), trace)
return results
`);
    assert.equal(outcome.error, null);
    assert.deepEqual(JSON.parse(outcome.result)[6], [
        'other 2', 'other 2', 'other 0', 'other 0', 'other 4', 'other 4',
        'floor 1.5', 'other 2', 'floor 1.5', 'other 2', 'floor 0.75', 'floor 5', 'other 6', 'floor 5', 'other 6', 'floor 2.5',
        'other 8', 'other 8'
    ]);
});


test('compile, intrinsic function alias', () => {
    const outcome = executeBoth(`\
function test(array):
    return [arrayGet(array, 0), arrayLength(array)]
endfunction

results = [test([5, 6])]
arrayGetOriginal = arrayGet
systemGlobalSet('arrayGet', arrayLength)
arrayPush(results, test([5, 6]), arrayGet([5, 6, 7]))
systemGlobalSet('arrayGet', arrayGetOriginal)
arrayPush(results, test([5, 6]))
return results
`);
    assert.deepEqual(JSON.parse(outcome.result), [[5, 2], [0, 2], 3, [5, 2]]);
    assert.deepEqual(outcome.logs, ['test.bare:2: BareScript: Function "arrayGet" failed with error: Too many arguments (2)']);
});


test('compile, compile errors are interpreted', () => {
    // The compiler throws for an invalid model that the interpreter tolerates
    for (const compiled of [false, true]) {
        const settings = setCompiled(compiled);
        try {
            const script = {
                'statements': [
                    {'function': {
                        'name': 'test',
                        'statements': [
                            {'expr': {'name': 'value', 'expr': {'function': {'name': 'host', 'args': 5}}}},
                            {'return': {'expr': {'variable': 'value'}}}
                        ]
                    }},
                    {'expr': {'name': 'first', 'expr': {'function': {'name': 'test', 'args': []}}}},
                    {'expr': {'name': 'second', 'expr': {'function': {'name': 'host', 'args': 5}}}},
                    {'return': {'expr': {'function': {'name': 'arrayNew', 'args': [
                        {'variable': 'first'}, {'variable': 'second'}, {'function': {'name': 'test', 'args': []}}
                    ]}}}}
                ]
            };
            assert.deepEqual(executeScript(script, {'globals': {'host': () => 'host'}}), ['host', 'host', 'host']);
        } finally {
            Object.assign(compileSettings, settings);
        }
    }
});
