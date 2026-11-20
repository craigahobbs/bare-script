// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/runtimeCompile */

import {
    AsyncFunction, BareScriptRuntimeError, computeLabelIndexes, defaultMaxStatements, executeFunctionStatement,
    executeIncludeStatement, executeStatementsResume, scriptFunction, systemGlobalCoverageName
} from './runtime.js';
import {
    ValueArgsError, valueBoolean, valueCodegen, valueCompare, valueObjectSet, valueParseInteger, valueString, valueType
} from './value.js';
import {arrayJoinValid, regexMatchAllValid, regexMatchValid, regexReplaceValid, scriptFunctions} from './library.js';


//
// The BareScript compiler - compiles a script function's statements (or a script's top-level statements) to a
// JavaScript function. The interpreter (runtime.js) remains the reference implementation: a compiled function
// falls back to it when statement coverage is recording, when the globals object has an unexpected prototype,
// and when the function cannot be compiled (irreducible jumps, or an environment that forbids "new Function").
//


// The compiler settings - "threshold" is the number of calls after which a script function is compiled (0
// disables compilation), "topLevel" is true to always compile a script's top-level statements
export const compileSettings = {'threshold': 2, 'topLevel': false, 'ignoreCoverage': false};


// Is the compiler configured? (the "BARESCRIPT_COMPILE" environment variable is read on first use)
let compileConfigured = false;

function compileAvailable() {
    if (!compileConfigured) {
        compileConfigure(globalThis.process?.env?.BARESCRIPT_COMPILE ?? null);
    }
    return compileSettings.threshold > 0 && valueCodegen();
}


/**
 * Configure the compiler from the "BARESCRIPT_COMPILE" environment variable value - "off" to interpret only,
 * "all" to compile every function on its first call and every script, "force" to do so even when statement
 * coverage is recording (to test the compiler - the coverage is then wrong), or a call count threshold. Any
 * other value is ignored.
 *
 * @param {?string} mode - The mode
 * @ignore
 */
export function compileConfigure(mode) {
    compileConfigured = true;
    if (mode === 'off') {
        compileSettings.threshold = 0;
    } else if (mode === 'all' || mode === 'force') {
        compileSettings.threshold = 1;
        compileSettings.topLevel = true;
        compileSettings.ignoreCoverage = (mode === 'force');
    } else if (mode !== null && /^[0-9]+$/u.test(mode)) {
        compileSettings.threshold = Number.parseInt(mode, 10);
    }
}


// The empty arguments array
const emptyArgs = [];


/**
 * Create a script function's global function value
 *
 * @param {Object} script - The script model
 * @param {Object} function_ - The function statement model
 * @returns {function} The script function, callable as (args, options)
 * @ignore
 */
export function defineScriptFunction(script, function_) {
    const state = functionState(functionStates, script, function_);
    const fn = (args, options) => rtDirectResult(fn.$d(options, ...(args ?? emptyArgs)));
    fn.$d = null;
    fn.$d = state.direct ?? scriptFunctionTier0;
    fn.$s = state;
    return fn;
}


// Get a function statement model's state. The state is shared by every definition of the function model, so
// its compiled code is too.
function functionState(states, script, function_) {
    let state = states.get(function_);
    if (state === undefined) {
        state = {script, function_, 'labelIndexes': null, 'calls': 0, 'loop': null, 'failed': false, 'direct': null};
        states.set(function_, state);
    }
    return state;
}


// The maps of function statement model to function state. An async function has a state for each runtime -
// the sync runtime defines it as a sync function, the async runtime as an async function.
const functionStates = new WeakMap();
const functionStatesAsync = new WeakMap();


// The direct entry point error result. A direct entry point does not throw a function error (any error but
// a runtime error) - it returns this value, with the error in the runtime's "err". A compiled call site then
// handles the error as the interpreter's function call does, without a try/catch at every call.
const directError = Object.freeze({});


// Catch a direct entry point's error
function rtDirectCatch(error) {
    if (error instanceof BareScriptRuntimeError) {
        throw error;
    }
    rt.err = error;
    return directError;
}


// Get a direct entry point's result - throw its function error, if any
function rtDirectResult(result) {
    if (result === directError) {
        throw rt.err;
    }
    return result;
}


// The interpreted script function direct entry point ("this" is the script function) - compiles the function
// once it has been called enough
function scriptFunctionTier0(options, ...args) {
    /* eslint-disable no-invalid-this */
    try {
        const state = this.$s;
        if (state.direct !== null) {
            this.$d = state.direct;
            return state.direct(options, ...args);
        }
        const direct = scriptFunctionCompile(state, options, false);
        if (direct !== null) {
            this.$d = direct;
            return direct(options, ...args);
        }
        return interpretFunction(state, options, args);
    } catch (error) {
        return rtDirectCatch(error);
    }
    /* eslint-enable no-invalid-this */
}


// Compile a script function if it has been called enough - a function that loops is compiled on its first call
function scriptFunctionCompile(state, options, isAsync) {
    if (!state.failed && compileAvailable()) {
        state.loop ??= statementsLoop(state.function_.statements);
        if (++state.calls >= compileSettings.threshold || state.loop) {
            state.direct = compileStatements(state.script, state.function_.statements, state, options.globals, isAsync);
            if (state.direct === null) {
                state.failed = true;
            }
        }
    }
    return state.direct;
}


/**
 * Create an async script function's global function value
 *
 * @param {Object} script - The script model
 * @param {Object} function_ - The function statement model
 * @returns {function} The async script function, callable as (args, options)
 * @ignore
 */
export function defineScriptFunctionAsync(script, function_) {
    const state = functionState(functionStatesAsync, script, function_);

    // An async script function has no direct entry point "$d" - it is only called as (args, options)
    // eslint-disable-next-line require-await
    return async (args, options) => {
        const direct = state.direct ?? scriptFunctionCompile(state, options, true);
        if (direct !== null) {
            return direct(options, ...(args ?? emptyArgs));
        }
        return rt.ainterp(state, options, args);
    };
}


/**
 * Set the async runtime's functions for async compiled code (the sync runtime does not import the async runtime)
 *
 * @param {function} interpretAsync - Execute an async script function with the async interpreter
 * @param {function} evaluateAsync - Evaluate an expression with the async interpreter
 * @param {function} resumeAsync - Resume the async interpreter's execution of statements at a statement index
 * @ignore
 */
export function compileAsyncRuntime(interpretAsync, evaluateAsync, resumeAsync) {
    rt.ainterp = (state, options, args) => {
        state.labelIndexes ??= computeLabelIndexes(state.function_.statements);
        return interpretAsync(state.script, state.function_, state.labelIndexes, args, options);
    };
    rt.aw = (zz, ixStatement, options, locals) => {
        const statement = zz.statements[ixStatement];
        const {expr} = statement.expr ?? statement.jump ?? statement.return;
        return evaluateAsync(expr, options, locals, false, zz.script, statement);
    };
    rt.abail = (zz, options, ixStatement, slots) => {
        options.statementCount -= zz.runEnds[ixStatement] - ixStatement + 1;
        return resumeAsync(zz.script, zz.statements, options, rtLocals(zz, slots), zz.labelIndexes, ixStatement);
    };
}


// Execute a script function with the interpreter
function interpretFunction(state, options, args) {
    state.labelIndexes ??= computeLabelIndexes(state.function_.statements);
    return scriptFunction(state.script, state.function_, state.labelIndexes, args, options);
}


// The compiled top-level statements of each script model (null if not compilable)
const scriptCompiled = new WeakMap();


/**
 * Execute a script's top-level statements with compiled code, if possible
 *
 * @param {Object} script - The script model
 * @param {Object} options - The script execution options
 * @returns {function|null} The compiled top-level function, callable as (options), or null to interpret
 * @ignore
 */
export function compileScript(script, options) {
    if (!compileAvailable()) {
        return null;
    }

    // Compile the script if it loops (or always, if configured)
    let compiled = scriptCompiled.get(script);
    if (compiled === undefined) {
        compiled = null;
        if (compileSettings.topLevel || statementsLoop(script.statements)) {
            compiled = compileStatements(script, script.statements, null, options.globals);
        }
        scriptCompiled.set(script, compiled);
    }
    if (compiled === null) {
        return null;
    }

    // Coverage and unexpected globals are interpreted
    rt.opt = null;
    if (!rtValidateOptions(options) || rtCoverage(options.globals)) {
        return null;
    }
    return compiled;
}


// Reset the compiled code's cached options (the options may have changed since they were validated)
export function compileReset() {
    rt.opt = null;
    rt.gi = null;
}


// Do the statements have a backward jump?
function statementsLoop(statements) {
    const labelIndexes = computeLabelIndexes(statements);
    for (let ixStatement = 0; ixStatement < statements.length; ixStatement++) {
        const statement = statements[ixStatement];
        if ('jump' in statement) {
            const ixLabel = labelIndexes[statement.jump.label];
            if (ixLabel !== undefined && ixLabel < ixStatement) {
                return true;
            }
        }
    }
    return false;
}


//
// The compiled code's runtime support
//


// Validate the options for compiled execution - returns false if the script must be interpreted
function rtValidateOptions(options) {
    const {globals} = options;
    const globalsProto = Object.getPrototypeOf(globals);
    if (globalsProto !== Object.prototype && globalsProto !== null) {
        return false;
    }
    options.statementCount ??= 0;
    rt.opt = options;

    // Are the globals' intrinsic functions the built-in library functions?
    let intrinsicGlobals = globals;
    for (let ixName = 0; ixName < intrinsicNames.length; ixName++) {
        const intrinsicName = intrinsicNames[ixName];
        if (globals[intrinsicName] !== scriptFunctions[intrinsicName]) {
            intrinsicGlobals = null;
            break;
        }
    }
    rt.gi = intrinsicGlobals;
    return true;
}


/**
 * Notify the compiled code's runtime of a global variable write - a write to an intrinsic function's name
 * invalidates the intrinsic fast paths until the globals are next validated
 *
 * @param {string} name - The global variable name
 * @ignore
 */
export function compileGlobalWrite(name) {
    if (intrinsicNameSet.has(name)) {
        rt.gi = null;
        rt.opt = null;
    }
}


// Is statement coverage recording?
function rtCoverage(globals) {
    if (compileSettings.ignoreCoverage) {
        return false;
    }
    const coverageGlobal = (Object.hasOwn(globals, systemGlobalCoverageName) ? globals[systemGlobalCoverageName] : null) ?? null;
    return coverageGlobal !== null && typeof coverageGlobal === 'object' && !!coverageGlobal.enabled;
}


// Bail out of compiled code to the interpreter at a statement - the statement counter passed the maximum
// statements within the run of statements that begins at the statement. The interpreter executes the run as
// the reference does and throws the error at the statement that passes the maximum.
function rtBail(zz, options, ixStatement, slots) {
    // Refund the statement counter for the run's statements
    options.statementCount -= zz.runEnds[ixStatement] - ixStatement + 1;
    return executeStatementsResume(zz.script, zz.statements, options, rtLocals(zz, slots), zz.labelIndexes, ixStatement);
}


// Create the interpreter's local variables object from compiled code's local variable slots
function rtLocals(zz, slots) {
    if (slots === null) {
        return null;
    }
    const locals = Object.create(null);
    const {names} = zz;
    for (let ixSlot = 0; ixSlot < slots.length; ixSlot++) {
        const name = names[ixSlot];
        if (name !== null && slots[ixSlot] !== undefined) {
            locals[name] = slots[ixSlot];
        }
    }
    return locals;
}


// Is a function value an async function?
function rtIsAsync(funcValue) {
    return typeof funcValue === 'function' && funcValue.constructor === AsyncFunction;
}


// Unknown jump label
function rtUnknownLabel(zz, ixStatement, label) {
    throw new BareScriptRuntimeError(zz.script, zz.statements[ixStatement], `Unknown jump label "${label}"`);
}


// Call a function value
function rtCall(funcName, funcArgs, funcValue, options, zz, ixStatement) {
    if (funcValue === undefined || funcValue === null) {
        throw new BareScriptRuntimeError(zz.script, zz.statements[ixStatement], `Undefined function "${funcName}"`);
    }

    // Async function called within non-async execution?
    if (typeof funcValue === 'function' && funcValue.constructor === AsyncFunction) {
        throw new BareScriptRuntimeError(
            zz.script, zz.statements[ixStatement], `Async function "${funcName}" called within non-async scope`
        );
    }

    // Call the function
    try {
        return funcValue(funcArgs, options) ?? null;
    } catch (error) {
        return rtCallError(error, funcName, options, zz, ixStatement);
    }
}


// Call a function value mid-run - the run's remaining statements are refunded while the function executes
function rtCallRefund(count, funcName, funcArgs, funcValue, options, zz, ixStatement) {
    options.statementCount -= count;
    try {
        return rtCall(funcName, funcArgs, funcValue, options, zz, ixStatement);
    } finally {
        options.statementCount += count;
    }
}


// Handle a direct entry point's function error
function rtDirectError(funcName, options, zz, ixStatement) {
    return rtCallError(rt.err, funcName, options, zz, ixStatement);
}


// Handle a function call error
function rtCallError(error, funcName, options, zz, ixStatement) {
    // Propogate runtime errors
    if (error instanceof BareScriptRuntimeError) {
        throw error;
    }

    // Log and return null
    if (options !== null && 'logFn' in options && options.debug) {
        const errorMessage = new BareScriptRuntimeError(
            zz.script, zz.statements[ixStatement], `BareScript: Function "${funcName}" failed with error: ${error.message}`
        );
        options.logFn(errorMessage.message);
    }
    if (error instanceof ValueArgsError) {
        return error.returnValue;
    }
    return null;
}


// Get a global variable value (own properties only)
function rtGlobalValue(globals, name) {
    return (Object.hasOwn(globals, name) ? (globals[name] ?? null) : null);
}


// Get a global function value (own properties only)
function rtGlobalFunction(globals, name) {
    return (Object.hasOwn(globals, name) ? globals[name] : undefined);
}


// The "+" operator's slow path - the operands are not both numbers or their sum is not finite
function rtAdd(leftValue, rightValue) {
    if (typeof leftValue === 'string') {
        return (typeof rightValue === 'string' ? leftValue + rightValue : leftValue + valueString(rightValue));
    } else if (typeof rightValue === 'string') {
        return valueString(leftValue) + rightValue;
    } else if (typeof leftValue === 'number' && rightValue instanceof Date) {
        const result = new Date(leftValue + rightValue.getTime());
        return (isNaN(result.getTime()) ? null : result);
    } else if (leftValue instanceof Date && typeof rightValue === 'number') {
        const result = new Date(leftValue.getTime() + rightValue);
        return (isNaN(result.getTime()) ? null : result);
    }
    return null;
}


// The "-" operator's slow path - the operands are not both numbers or their difference is not finite
function rtSub(leftValue, rightValue) {
    if (leftValue instanceof Date && rightValue instanceof Date) {
        return leftValue - rightValue;
    }
    return null;
}


// The compiled code's runtime
const rt = {
    // The validated options, and their globals if its intrinsic functions are the built-in library functions
    // (null otherwise)
    'opt': null,
    'gi': null,

    // The direct entry point error result and its error
    'E': directError,
    'err': null,
    'dc': rtDirectCatch,
    'de': rtDirectError,

    // Runtime functions
    'vo': rtValidateOptions,
    'cov': rtCoverage,
    'interp': interpretFunction,
    'bail': rtBail,
    'lcl': rtLocals,
    'asy': rtIsAsync,

    // The async runtime's functions (see compileAsyncRuntime)
    'ainterp': null,
    'aw': null,
    'abail': null,
    'unk': rtUnknownLabel,
    'call': rtCall,
    'callr': rtCallRefund,
    'gv': rtGlobalValue,
    'gf': rtGlobalFunction,
    'gs': (globals, name, value) => {
        valueObjectSet(globals, name, value);
        compileGlobalWrite(name);
    },
    'add': rtAdd,
    'sub': rtSub,
    'tb': valueBoolean,
    'vc': valueCompare,
    'vt': valueType,
    'def': (zz, ixStatement, globals) => executeFunctionStatement(zz.script, zz.statements[ixStatement].function, globals),
    'inc': (zz, ixStatement, options) => executeIncludeStatement(zz.script, zz.statements[ixStatement], options),
    'isInt': Number.isInteger,
    'isArray': Array.isArray,
    'hasOwn': Object.hasOwn,
    'OP': Object.prototype,
    'keys': Object.keys,
    'sqrt': Math.sqrt,
    'floor': Math.floor,
    'ceil': Math.ceil,
    'abs': Math.abs,
    'vs': valueString,
    'pint': valueParseInteger,
    'RX': RegExp,

    // Library functions for valid arguments (set on first compile - library.js is a cyclic import)
    'aj': null,
    'rm': null,
    'rma': null,
    'rr': null
};


// The compiled code's preamble
const preamble = `\
'use strict';
const {E, dc, de, vo, cov, interp, bail, lcl, asy, ainterp, aw, abail, unk, call, callr, gv, gf, gs, add, sub, tb, vc, vt, def, inc,
    isInt, isArray, hasOwn, OP, keys, sqrt, floor, ceil, abs, vs, pint, RX, aj, rm, rma, rr} = R;
`;


//
// The intrinsic function templates - each returns the fast path's condition and value JavaScript expressions
// for the call's argument expressions, or null if there is no fast path for the call. A call that fails the
// condition calls the library function, which handles the invalid arguments.
//


// Is a name safe to read from a plain object without an own-property check?
function isSafeName(name) {
    return !(name in Object.prototype);
}


// Is an argument a string literal that is safe to read from a plain object without an own-property check? (an
// argument of static type string that is not a literal, e.g. a concatenation, has a null literal value)
function isSafeKey(arg) {
    return typeof arg.lit === 'string' && isSafeName(arg.lit);
}


// Plain object test expression. This tests that the object's "constructor" is Object rather than that its
// prototype is the object prototype, as the library does - the property load is several times faster than the
// Object.getPrototypeOf call. The difference is an object with the object prototype further up its prototype
// chain (e.g. Object.create({})), which only a host application can create. A plain object with a "constructor"
// key fails the test and takes the library function call, which is correct.
function exprIsObject(code) {
    return `${code} != null && ${code}.constructor === Object`;
}


// Array index test expression
function exprIsIndex(arrayCode, index, op = '<') {
    if (index.t === 'number' && Number.isInteger(index.lit) && index.lit >= 0) {
        return `${index.c} ${op} ${arrayCode}.length`;
    }
    return `(${index.c} >>> 0) === ${index.c} && ${index.c} ${op} ${arrayCode}.length`;
}


const intrinsicTemplates = {
    'arrayGet': (args) => (args.length !== 2 ? null : {
        'cond': `isArray(${args[0].c}) && ${exprIsIndex(args[0].c, args[1])}`,
        'value': `(${args[0].c}[${args[1].c}] ?? null)`
    }),

    'arrayLength': (args) => (args.length !== 1 ? null : {
        'cond': `isArray(${args[0].c})`,
        'value': `${args[0].c}.length`
    }),

    'arrayNew': (args) => ({
        'cond': null,
        'value': `[${args.map((arg) => arg.c).join(', ')}]`
    }),

    'arrayPush': (args) => (args.length < 2 ? null : {
        'cond': `isArray(${args[0].c})`,
        'value': `(${args[0].c}.push(${args.slice(1).map((arg) => arg.c).join(', ')}), ${args[0].c})`
    }),

    'arraySet': (args) => (args.length !== 3 ? null : {
        'cond': `isArray(${args[0].c}) && ${exprIsIndex(args[0].c, args[1])}`,
        'value': `(${args[0].c}[${args[1].c}] = ${args[2].c})`
    }),

    'mathSqrt': (args) => (args.length !== 1 ? null : {
        'cond': (args[0].t === 'number' ? `${args[0].c} >= 0` : `typeof ${args[0].c} === 'number' && ${args[0].c} >= 0`),
        'value': `sqrt(${args[0].c})`
    }),

    'objectGet': (args) => {
        if (args.length !== 2 && args.length !== 3) {
            return null;
        }
        const [object, key] = args;
        const oc = object.c;
        const kc = key.c;
        const defaultCode = (args.length === 3 && args[2].t !== 'null' ? args[2].c : null);
        if (isSafeKey(key)) {
            return {
                'cond': exprIsObject(oc),
                'value': (defaultCode === null ? `(${oc}[${kc}] ?? null)`
                    : `((x = ${oc}[${kc}]) !== undefined ? x : ${kc} in ${oc} ? null : ${defaultCode})`)
            };
        }

        // An inherited property value is a function or the object prototype
        const ownCode = `typeof x !== 'function' && x !== OP || hasOwn(${oc}, ${kc})`;
        return {
            'cond': `${exprIsObject(oc)} && typeof ${kc} === 'string'`,
            'value': (defaultCode === null
                ? `((x = ${oc}[${kc}]) === undefined ? null : ${ownCode} ? x : null)`
                : `((x = ${oc}[${kc}]) === undefined ? (hasOwn(${oc}, ${kc}) ? null : ${defaultCode}) : ${ownCode} ? x : ${defaultCode})`)
        };
    },

    'objectHas': (args) => {
        if (args.length !== 2) {
            return null;
        }
        const [object, key] = args;
        if (isSafeKey(key)) {
            return {
                'cond': exprIsObject(object.c),
                'value': `(${object.c}[${key.c}] !== undefined || ${key.c} in ${object.c})`,
                'type': 'boolean'
            };
        }
        return {
            'cond': `${exprIsObject(object.c)} && typeof ${key.c} === 'string'`,
            'value': `hasOwn(${object.c}, ${key.c})`,
            'type': 'boolean'
        };
    },

    'objectKeys': (args) => (args.length !== 1 ? null : {
        'cond': exprIsObject(args[0].c),
        'value': `keys(${args[0].c})`
    }),

    'objectNew': (args) => {
        const members = [];
        for (let ixArg = 0; ixArg < args.length; ixArg += 2) {
            const key = args[ixArg];
            if (typeof key.lit !== 'string' || key.lit === '__proto__') {
                return null;
            }
            members.push(`${key.c}: ${ixArg + 1 < args.length ? args[ixArg + 1].c : 'null'}`);
        }
        return {
            'cond': null,
            'value': `({${members.join(', ')}})`
        };
    },

    'objectSet': (args) => {
        if (args.length !== 3) {
            return null;
        }
        const [object, key, value] = args;
        if (isSafeKey(key)) {
            return {
                'cond': exprIsObject(object.c),
                'value': `(${object.c}[${key.c}] = ${value.c})`
            };
        }
        return {
            'cond': `${exprIsObject(object.c)} && typeof ${key.c} === 'string' && ${key.c} !== '__proto__'`,
            'value': `(${object.c}[${key.c}] = ${value.c})`
        };
    },

    'stringLength': (args) => (args.length !== 1 ? null : {
        'cond': `typeof ${args[0].c} === 'string'`,
        'value': `${args[0].c}.length`
    }),

    'systemType': (args) => (args.length !== 1 ? null : {
        'cond': null,
        'value': `vt(${args[0].c})`
    }),

    'arrayCopy': (args) => (args.length !== 1 ? null : {
        'cond': `isArray(${args[0].c})`,
        'value': `[...${args[0].c}]`
    }),

    'arrayExtend': (args) => (args.length !== 2 ? null : {
        'cond': `isArray(${args[0].c}) && isArray(${args[1].c}) && ${args[1].c}.length <= 8192`,
        'value': `(${args[0].c}.push(...${args[1].c}), ${args[0].c})`
    }),

    'arrayJoin': (args) => (args.length !== 2 ? null : {
        'cond': `isArray(${args[0].c}) && typeof ${args[1].c} === 'string'`,
        'value': `aj(${args[0].c}, ${args[1].c})`
    }),

    'arrayPop': (args) => (args.length !== 1 ? null : {
        'cond': `isArray(${args[0].c}) && ${args[0].c}.length !== 0`,
        'value': `(${args[0].c}.pop() ?? null)`
    }),

    'arraySlice': (args) => templateSlice(args, `isArray(${args.length ? args[0].c : ''})`, true),

    'mathAbs': (args) => templateMath(args, 'abs'),

    'mathCeil': (args) => templateMath(args, 'ceil'),

    'mathFloor': (args) => templateMath(args, 'floor'),

    'mathMax': (args) => (args.length !== 2 ? null : {
        'cond': exprIsNumbers(args),
        'value': `(${args[1].c} > ${args[0].c} ? ${args[1].c} : ${args[0].c})`
    }),

    'mathMin': (args) => (args.length !== 2 ? null : {
        'cond': exprIsNumbers(args),
        'value': `(${args[1].c} < ${args[0].c} ? ${args[1].c} : ${args[0].c})`
    }),

    'numberParseInt': (args) => (args.length !== 1 ? null : {
        'cond': `typeof ${args[0].c} === 'string'`,
        'value': `pint(${args[0].c}, 10)`
    }),

    'objectCopy': (args) => (args.length !== 1 ? null : {
        'cond': exprIsObject(args[0].c),
        'value': `({...${args[0].c}})`
    }),

    'objectDelete': (args) => (args.length !== 2 ? null : {
        'cond': `${exprIsObject(args[0].c)} && typeof ${args[1].c} === 'string'`,
        'value': `(delete ${args[0].c}[${args[1].c}], null)`
    }),

    'regexMatch': (args) => (args.length !== 2 ? null : {
        'cond': `${args[0].c} instanceof RX && typeof ${args[1].c} === 'string'`,
        'value': `rm(${args[0].c}, ${args[1].c})`
    }),

    'regexMatchAll': (args) => (args.length !== 2 ? null : {
        'cond': `${args[0].c} instanceof RX && typeof ${args[1].c} === 'string'`,
        'value': `rma(${args[0].c}, ${args[1].c})`
    }),

    'regexReplace': (args) => (args.length !== 3 ? null : {
        'cond': `${args[0].c} instanceof RX && typeof ${args[1].c} === 'string' && typeof ${args[2].c} === 'string'`,
        'value': `rr(${args[0].c}, ${args[1].c}, ${args[2].c})`
    }),

    'stringCharAt': (args) => (args.length !== 2 ? null : {
        'cond': `typeof ${args[0].c} === 'string' && ${exprIsIndex(args[0].c, args[1])}`,
        'value': `${args[0].c}[${args[1].c}]`
    }),

    'stringCharCodeAt': (args) => (args.length !== 2 ? null : {
        'cond': `typeof ${args[0].c} === 'string' && ${exprIsIndex(args[0].c, args[1])}`,
        'value': `${args[0].c}.charCodeAt(${args[1].c})`
    }),

    'stringEndsWith': (args) => templateStrings(args, 2, 'endsWith', 'boolean'),

    'stringIndexOf': (args) => {
        if (args.length === 2) {
            return templateStrings(args, 2, 'indexOf', null);
        } else if (args.length !== 3) {
            return null;
        }
        const [string, search, index] = args;
        return {
            'cond': `typeof ${string.c} === 'string' && typeof ${search.c} === 'string' && ${exprIsIndex(string.c, index, '<=')}`,
            'value': `${string.c}.indexOf(${search.c}, ${index.c})`
        };
    },

    'stringLower': (args) => templateStrings(args, 1, 'toLowerCase', null),

    'stringNew': (args) => (args.length !== 1 ? null : {
        'cond': null,
        'value': `vs(${args[0].c})`
    }),

    'stringSlice': (args) => templateSlice(args, `typeof ${args.length ? args[0].c : ''} === 'string'`, false),

    'stringSplit': (args) => templateStrings(args, 2, 'split', null),

    'stringStartsWith': (args) => templateStrings(args, 2, 'startsWith', 'boolean'),

    'stringTrim': (args) => templateStrings(args, 1, 'trim', null),

    'stringUpper': (args) => templateStrings(args, 1, 'toUpperCase', null)
};


// Template for a string method of string arguments
function templateStrings(args, count, method, type) {
    if (args.length !== count) {
        return null;
    }
    return {
        'cond': args.filter((arg) => arg.t !== 'string').map((arg) => `typeof ${arg.c} === 'string'`).join(' && ') || null,
        'value': `${args[0].c}.${method}(${args.slice(1).map((arg) => arg.c).join(', ')})`,
        type
    };
}


// Template for a math function of a number argument
function templateMath(args, func) {
    if (args.length !== 1) {
        return null;
    }
    return {
        'cond': (args[0].t === 'number' ? null : `typeof ${args[0].c} === 'number'`),
        'value': `${func}(${args[0].c})`
    };
}


// Template for the arraySlice and stringSlice functions
function templateSlice(args, typeCode, startOptional) {
    if (args.length === 1 && startOptional) {
        return {'cond': typeCode, 'value': `${args[0].c}.slice()`};
    } else if (args.length === 2 || (args.length === 3 && args[2].t === 'null')) {
        return {
            'cond': `${typeCode} && ${exprIsIndex(args[0].c, args[1], '<=')}`,
            'value': `${args[0].c}.slice(${args[1].c})`
        };
    } else if (args.length === 3) {
        return {
            'cond': `${typeCode} && ${exprIsIndex(args[0].c, args[1], '<=')} && ${exprIsIndex(args[0].c, args[2], '<=')}`,
            'value': `${args[0].c}.slice(${args[1].c}, ${args[2].c})`
        };
    }
    return null;
}


// Number arguments test expression
function exprIsNumbers(args) {
    return args.filter((arg) => arg.t !== 'number').map((arg) => `typeof ${arg.c} === 'number'`).join(' && ') || null;
}


// The intrinsic function names
const intrinsicNames = Object.keys(intrinsicTemplates);
const intrinsicNameSet = new Set(intrinsicNames);


//
// The compiler
//


// Get an expression's or statement's kind - its single key
function modelKey(model) {
    let key;
    // eslint-disable-next-line guard-for-in, no-unreachable-loop
    for (key in model) {
        break;
    }
    return key;
}


// A JavaScript number literal
function numberLiteral(value) {
    if (Object.is(value, -0)) {
        return '(-0)';
    }
    // An integer literal is parenthesized so that a member access may follow it ("5.length" is a syntax error)
    return (value < 0 || Number.isInteger(value) ? `(${value})` : String(value));
}


// Compile statements - returns the compiled function, callable as (options, ...args), or null if the statements
// cannot be compiled. Any error (e.g. a stack overflow compiling a very deep expression, or an invalid model the
// interpreter tolerates) means the statements are interpreted.
function compileStatements(script, statements, state, globals, isAsync = false) {
    try {
        return compileStatementsHelper(script, statements, state, globals, isAsync);
    } catch {
        return null;
    }
}


function compileStatementsHelper(script, statements, state, globals, isAsync) {
    const function_ = (state !== null ? state.function_ : null);
    const labelIndexes = computeLabelIndexes(statements);
    const statementsLength = statements.length;

    // Compute the statement kinds and the jump targets
    const kinds = new Array(statementsLength);
    const jumpTargets = new Int32Array(statementsLength).fill(-1);
    for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
        const statement = statements[ixStatement];
        const kind = modelKey(statement);
        kinds[ixStatement] = kind;
        if (kind === 'jump') {
            const ixLabel = labelIndexes[statement.jump.label];
            if (ixLabel !== undefined) {
                jumpTargets[ixStatement] = ixLabel;
            }
        } else if (isAsync && (kind === 'function' || kind === 'include')) {
            // Async function and include statements are interpreted
            return null;
        }
    }

    // Compute the structured control flow scopes
    const scopes = compileScopes(kinds, jumpTargets);
    if (scopes === null) {
        return null;
    }

    // Compute the local variable slots - the function arguments followed by the assigned variables
    const cx = {
        script,
        statements,
        globals,
        'slots': null,
        'slotNames': [],
        'defined': null,
        'ixStatement': 0,
        'tempCount': 0,
        'tempMax': 0,
        'consts': [],
        'runRest': 0,
        'fuseCalls': false,
        'subst': null,
        'noFuse': 0
    };
    const params = [];
    let definedStates = null;
    let slotVarNames = null;
    if (function_ !== null) {
        const slots = new Map();
        cx.slots = slots;
        const funcArgs = function_.args ?? null;
        const funcArgsLength = (funcArgs !== null ? funcArgs.length : 0);
        for (let ixArg = 0; ixArg < funcArgsLength; ixArg++) {
            slots.set(funcArgs[ixArg], ixArg);
            cx.slotNames.push(`a${ixArg}`);
            params.push(function_.lastArgArray && ixArg === funcArgsLength - 1 ? `...a${ixArg}` : `a${ixArg} = null`);
        }
        for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
            if (kinds[ixStatement] === 'expr') {
                const {name = null} = statements[ixStatement].expr;
                if (name !== null && !slots.has(name)) {
                    slots.set(name, cx.slotNames.length);
                    cx.slotNames.push(`l${cx.slotNames.length}`);
                }
            }
        }
        if (cx.slotNames.length > 0) {
            definedStates = compileDefined(statements, kinds, jumpTargets, slots, funcArgs, cx.slotNames.length);
        }
        slotVarNames = new Array(cx.slotNames.length).fill(null);
        for (const [slotVarName, slot] of slots.entries()) {
            slotVarNames[slot] = slotVarName;
        }
    }

    // Compute each statement's run end - the index of the next label, jump, or return statement, or statement
    // that calls a function. A run's statements are charged to the statement counter together, when the run
    // begins, so a run ends at a function call - the function's statements are counted before the statements
    // that follow the call.
    const runBreaks = new Uint8Array(statementsLength);
    const runEnds = new Int32Array(statementsLength);
    for (let ixStatement = statementsLength - 1; ixStatement >= 0; ixStatement--) {
        const statement = statements[ixStatement];
        const kind = kinds[ixStatement];
        let runBreak = (ixStatement === statementsLength - 1 || kind === 'label' || kind === 'jump' || kind === 'return');
        if (!runBreak && kind === 'expr') {
            runBreak = exprCalls(cx, statement.expr.expr);
        }
        runBreaks[ixStatement] = (runBreak || kind === 'function' || kind === 'include' ? 1 : 0);
        runEnds[ixStatement] = (runBreaks[ixStatement] === 1 ? ixStatement : runEnds[ixStatement + 1]);
    }

    // Compute the scope opens and closes at each coordinate (2 * index is before the statement, 2 * index + 1
    // is within it)
    const opens = new Map();
    const closes = new Map();
    for (const scope of scopes.values()) {
        if (!opens.has(scope.start)) {
            opens.set(scope.start, []);
        }
        opens.get(scope.start).push(scope);
        if (!closes.has(scope.end)) {
            closes.set(scope.end, []);
        }
        closes.get(scope.end).push(scope);
    }
    const emitScopes = (coord, lines) => {
        const scopeCloses = closes.get(coord);
        if (scopeCloses !== undefined) {
            scopeCloses.sort((scope1, scope2) => scope2.start - scope1.start);
            for (const scope of scopeCloses) {
                lines.push(scope.loop ? 'break; }' : '}');
            }
        }
        const scopeOpens = opens.get(coord);
        if (scopeOpens !== undefined) {
            scopeOpens.sort((scope1, scope2) => scope2.end - scope1.end);
            for (const scope of scopeOpens) {
                lines.push(scope.loop ? `L${scope.label}: for (;;) {` : `B${scope.label}: {`);
            }
        }
    };

    // Compute the labels that are jumped to
    const labelTargets = new Uint8Array(statementsLength);
    for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
        if (jumpTargets[ixStatement] !== -1) {
            labelTargets[jumpTargets[ixStatement]] = 1;
        }
    }

    // Generate the statements
    const lines = [];
    let runStart = true;
    let reachable = true;
    for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
        const statement = statements[ixStatement];
        const kind = kinds[ixStatement];
        cx.ixStatement = ixStatement;
        cx.defined = (definedStates !== null ? definedStates[ixStatement] : null);
        emitScopes(2 * ixStatement, lines);

        // Unreachable statement? Only a jump to a label makes the statements that follow reachable again.
        if (!reachable) {
            emitScopes(2 * ixStatement + 1, lines);
            if (kind === 'label' && labelTargets[ixStatement] === 1) {
                reachable = true;
                runStart = true;
            }
            continue;
        }

        // Charge the statement counter for the run of statements through the next label, jump, or return
        if (runStart) {
            const count = runEnds[ixStatement] - ixStatement + 1;
            lines.push(`if ((o.statementCount += ${count}) > mx) { bi = ${ixStatement}; break BAIL; }`);
        }
        runStart = (runBreaks[ixStatement] === 1);
        cx.runRest = runEnds[ixStatement] - ixStatement;

        // Generate the statement
        if (kind === 'expr') {
            const {name = null, expr} = statement.expr;
            const exprCode = compileAsyncExpr(cx, expr, compileExpr(cx, expr).c, isAsync, false);
            if (name === null) {
                lines.push(`${exprCode};`);
            } else if (cx.slots !== null) {
                lines.push(`${cx.slotNames[cx.slots.get(name)]} = ${exprCode};`);
            } else if (isSafeName(name) && !intrinsicNameSet.has(name)) {
                lines.push(`g[${JSON.stringify(name)}] = ${exprCode};`);
            } else {
                lines.push(`gs(g, ${JSON.stringify(name)}, ${exprCode});`);
            }
        } else if (kind === 'jump') {
            const stmtJump = statement.jump;
            const ixLabel = jumpTargets[ixStatement];
            let jumpCode;
            if (ixLabel === -1) {
                jumpCode = `unk(Z, ${ixStatement}, ${JSON.stringify(String(stmtJump.label))});`;
            } else if (ixLabel > ixStatement) {
                jumpCode = `break B${ixLabel};`;
            } else {
                jumpCode = `continue L${ixLabel};`;
            }
            if ('expr' in stmtJump) {
                lines.push(`if (${compileAsyncExpr(cx, stmtJump.expr, compileCond(cx, stmtJump.expr), isAsync, true)}) ${jumpCode}`);
            } else {
                lines.push(jumpCode);
                reachable = false;
            }
        } else if (kind === 'return') {
            const stmtReturn = statement.return;
            lines.push('expr' in stmtReturn
                ? `return ${compileAsyncExpr(cx, stmtReturn.expr, compileExpr(cx, stmtReturn.expr).c, isAsync, false)};` : 'return null;');
            reachable = false;
        } else if (kind === 'function') {
            lines.push(`def(Z, ${ixStatement}, g);`);
        } else if (kind === 'include') {
            lines.push(`inc(Z, ${ixStatement}, o);`);
        }
        emitScopes(2 * ixStatement + 1, lines);
    }
    emitScopes(2 * statementsLength, lines);
    if (reachable) {
        lines.push('return null;');
    }

    // Generate the function
    const declares = ['x', 'f', 'bi = 0'];
    for (let ixSlot = params.length; ixSlot < cx.slotNames.length; ixSlot++) {
        declares.push(cx.slotNames[ixSlot]);
    }
    for (let ixTemp = 0; ixTemp < cx.tempMax; ixTemp++) {
        declares.push(`t${ixTemp}`);
    }
    const header = [preamble];
    const mxCode = `const g = o.globals, mx = ((x = o.maxStatements ?? ${defaultMaxStatements}) > 0 ? x : Infinity);`;
    let name;
    if (function_ !== null) {
        name = `bs_${String(function_.name).replace(/[^A-Za-z0-9_$]/g, '_')}`;
        const interpArgs = params.map((param, ixParam) => (param.startsWith('...') ? param : `a${ixParam}`)).join(', ');
        const interpCode = `return ${isAsync ? 'ainterp' : 'interp'}(FN, o, [${interpArgs}]);`;
        header.push(`return ${isAsync ? 'async ' : ''}function ${name}(${['o', ...params].join(', ')}) {`);
        header.push(`let ${declares.join(', ')};`);
        if (!isAsync) {
            header.push('try {');
        }
        header.push(`if (o !== R.opt && !vo(o)) ${interpCode}`);
        header.push(mxCode);
        if (!script.system) {
            header.push(`if (g.${systemGlobalCoverageName} !== undefined && cov(g)) ${interpCode}`);
        }
    } else {
        name = 'bs__main';
        header.push(`return function ${name}(o) {`);
        header.push(`let ${declares.join(', ')};`);
        header.push(mxCode);
    }
    header.push('BAIL: {');
    lines.push('}');
    lines.push(`return ${isAsync ? 'abail' : 'bail'}(Z, o, bi, ${cx.slots !== null ? `[${cx.slotNames.join(', ')}]` : 'null'});`);

    // A sync function's direct entry point returns a function error rather than throwing it
    if (function_ !== null && !isAsync) {
        lines.push('} catch (e) { return dc(e); }');
    }
    const scriptName = String(script.scriptName ?? '').replace(/[^A-Za-z0-9_$.-]/g, '_');
    const source = `${header.join('\n')}\n${lines.join('\n')}\n};\n//# sourceURL=barescript:///${scriptName}/${name}.js\n`;

    // Create the function
    if (rt.aj === null) {
        rt.aj = arrayJoinValid;
        rt.rm = regexMatchValid;
        rt.rma = regexMatchAllValid;
        rt.rr = regexReplaceValid;
    }
    const zz = {script, statements, labelIndexes, runEnds, 'names': slotVarNames};
    // eslint-disable-next-line no-new-func
    return (new Function('R', 'Z', 'FN', 'C', source))(rt, zz, state, cx.consts);
}


// Compile an async function statement's expression. If any function the expression calls is an async function
// when the statement executes, the async interpreter evaluates the expression (the compiled code's options are
// re-validated afterward, as other code may have executed in the meantime). Otherwise the expression's compiled
// code evaluates it.
function compileAsyncExpr(cx, expr, exprCode, isAsync, isCond) {
    if (!isAsync) {
        return exprCode;
    }
    const funcNames = [];
    compileFunctionNames(expr, funcNames);
    if (funcNames.length === 0) {
        return exprCode;
    }
    const tests = [];
    const intrinsicTests = [];
    for (const funcName of funcNames) {
        const nameCode = JSON.stringify(funcName);
        const slot = cx.slots.get(funcName);
        let valueCode = (isSafeName(funcName) ? `g[${nameCode}]` : `gf(g, ${nameCode})`);
        if (slot !== undefined) {
            valueCode = `(${cx.slotNames[slot]} !== undefined ? ${cx.slotNames[slot]} : ${valueCode})`;
        }

        // The intrinsic functions are not async when the globals' intrinsic functions are the library's
        (slot === undefined && intrinsicNameSet.has(funcName) ? intrinsicTests : tests).push(`asy(${valueCode})`);
    }
    if (intrinsicTests.length !== 0) {
        tests.push(`(R.gi !== g && (${intrinsicTests.join(' || ')}))`);
    }
    const awaitCode = `(x = await aw(Z, ${cx.ixStatement}, o, lcl(Z, [${cx.slotNames.join(', ')}])), o !== R.opt && vo(o), x)`;
    return `(${tests.join(' || ')} ? ${isCond ? `tb(${awaitCode})` : awaitCode} : ${exprCode})`;
}


// Does an expression call a function that may execute statements? (any function but an intrinsic function)
function exprCalls(cx, expr) {
    const exprKey = modelKey(expr);
    if (exprKey === 'function') {
        const {'function': func} = expr;
        if (func.name !== 'if' && (!intrinsicNameSet.has(func.name) || (cx.slots !== null && cx.slots.has(func.name)) ||
            (func.args ?? null) === null)) {
            return true;
        }
        return (func.args ?? []).some((exprArg) => exprCalls(cx, exprArg));
    } else if (exprKey === 'binary') {
        return exprCalls(cx, expr.binary.left) || exprCalls(cx, expr.binary.right);
    } else if (exprKey === 'unary') {
        return exprCalls(cx, expr.unary.expr);
    } else if (exprKey === 'group') {
        return exprCalls(cx, expr.group);
    }
    return false;
}


// Compute the names of the functions an expression calls
function compileFunctionNames(expr, funcNames) {
    const exprKey = modelKey(expr);
    if (exprKey === 'function') {
        if (!funcNames.includes(expr.function.name)) {
            funcNames.push(expr.function.name);
        }
        for (const exprArg of expr.function.args ?? []) {
            compileFunctionNames(exprArg, funcNames);
        }
    } else if (exprKey === 'binary') {
        compileFunctionNames(expr.binary.left, funcNames);
        compileFunctionNames(expr.binary.right, funcNames);
    } else if (exprKey === 'unary') {
        compileFunctionNames(expr.unary.expr, funcNames);
    } else if (exprKey === 'group') {
        compileFunctionNames(expr.group, funcNames);
    }
}


// Compute the structured control flow scopes for the statements' jumps - a labeled block that ends at each
// forward jump's label and a labeled loop that begins at each backward jump's label. Returns the map of label
// statement index to scope, or null if the jumps are irreducible (a jump into a loop).
function compileScopes(kinds, jumpTargets) {
    // Create the scopes
    const blocks = new Map();
    const loops = new Map();
    for (let ixStatement = 0; ixStatement < kinds.length; ixStatement++) {
        const ixLabel = jumpTargets[ixStatement];
        if (ixLabel === -1) {
            continue;
        }
        if (ixLabel > ixStatement) {
            const block = blocks.get(ixLabel);
            if (block === undefined) {
                blocks.set(ixLabel, {'loop': false, 'label': ixLabel, 'start': 2 * ixStatement, 'end': 2 * ixLabel + 1});
            }
        } else {
            const loop = loops.get(ixLabel);
            if (loop === undefined) {
                loops.set(ixLabel, {'loop': true, 'label': ixLabel, 'start': 2 * ixLabel + 1, 'end': 2 * ixStatement + 2});
            } else {
                loop.end = 2 * ixStatement + 2;
            }
        }
    }
    const scopes = [...blocks.values(), ...loops.values()];

    // Nest the scopes - a block's start moves earlier and a loop's end moves later
    const scopesLength = scopes.length;
    let changed = true;
    while (changed) {
        changed = false;
        for (let ixScope1 = 0; ixScope1 < scopesLength; ixScope1++) {
            const scope1 = scopes[ixScope1];
            for (let ixScope2 = 0; ixScope2 < scopesLength; ixScope2++) {
                const scope2 = scopes[ixScope2];
                if (scope1.start < scope2.start && scope2.start < scope1.end && scope1.end < scope2.end) {
                    if (!scope2.loop) {
                        scope2.start = scope1.start;
                    } else if (scope1.loop) {
                        scope1.end = scope2.end;
                    } else {
                        // A block that starts before a loop and ends within it is a jump into the loop
                        return null;
                    }
                    changed = true;
                }
            }
        }
    }
    return scopes;
}


// Compute the definitely-assigned local variable slots at each statement - a forward must-analysis. Returns
// the array of statement index to slot bit set (null if the statement is unreachable).
function compileDefined(statements, kinds, jumpTargets, slots, funcArgs, slotCount) {
    const statementsLength = statements.length;
    const wordCount = (slotCount + 31) >>> 5;
    const states = new Array(statementsLength + 1).fill(null);

    // The function arguments are assigned on entry
    const stateInit = new Int32Array(wordCount);
    if (funcArgs !== null) {
        for (const funcArg of funcArgs) {
            const slot = slots.get(funcArg);
            stateInit[slot >>> 5] |= 1 << (slot & 31);
        }
    }
    states[0] = stateInit;

    // Merge a statement's output state into a successor statement's input state
    const merge = (ixStatement, stateOut) => {
        const state = states[ixStatement];
        if (state === null) {
            states[ixStatement] = stateOut.slice();
            return true;
        }
        let merged = false;
        for (let ixWord = 0; ixWord < wordCount; ixWord++) {
            const word = state[ixWord] & stateOut[ixWord];
            if (word !== state[ixWord]) {
                state[ixWord] = word;
                merged = true;
            }
        }
        return merged;
    };

    // Iterate to a fixed point
    const stateOut = new Int32Array(wordCount);
    let changed = true;
    while (changed) {
        changed = false;
        for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
            const state = states[ixStatement];
            if (state === null) {
                continue;
            }
            stateOut.set(state);
            const kind = kinds[ixStatement];
            let fallthrough = true;
            if (kind === 'expr') {
                const {name = null} = statements[ixStatement].expr;
                if (name !== null) {
                    const slot = slots.get(name);
                    stateOut[slot >>> 5] |= 1 << (slot & 31);
                }
            } else if (kind === 'jump') {
                const ixLabel = jumpTargets[ixStatement];
                if (ixLabel !== -1 && merge(ixLabel + 1, stateOut)) {
                    changed = true;
                }
                fallthrough = 'expr' in statements[ixStatement].jump;
            } else if (kind === 'return') {
                fallthrough = false;
            }
            if (fallthrough && merge(ixStatement + 1, stateOut)) {
                changed = true;
            }
        }
    }
    return states;
}


// Allocate a temporary variable
function tempAlloc(cx) {
    const temp = `t${cx.tempCount++}`;
    if (cx.tempCount > cx.tempMax) {
        cx.tempMax = cx.tempCount;
    }
    return temp;
}


// Compile an expression that is used more than once - a simple expression is used as-is, any other is assigned
// to a temporary variable by the returned prefix code
function compileOperand(cx, expr, prefix) {
    const result = compileExpr(cx, expr);
    if (result.s) {
        return result;
    }
    const temp = tempAlloc(cx);
    prefix.push(`${temp} = ${result.c}`);
    return {'c': temp, 't': result.t, 's': true, 'lit': result.lit};
}


// Wrap an expression's code with its prefix code
function prefixCode(prefix, code) {
    return (prefix.length ? `(${prefix.join(', ')}, ${code})` : code);
}


// Compile an expression - returns the JavaScript expression code "c", the static type "t" (null if unknown),
// whether the code is simple "s" (free of side effects and unaffected by any other expression's evaluation),
// and the literal value "lit"
function compileExpr(cx, expr) {
    // A fused expression's operand?
    if (cx.subst !== null) {
        const operand = cx.subst.get(expr);
        if (operand !== undefined) {
            return operand;
        }
    }
    const exprKey = modelKey(expr);

    // Number
    if (exprKey === 'number') {
        const {number} = expr;
        if (typeof number === 'number' && Number.isFinite(number)) {
            return {'c': numberLiteral(number), 't': 'number', 's': true, 'lit': number};
        }
        return compileConst(cx, number);
    }

    // String
    if (exprKey === 'string') {
        const {string} = expr;
        if (typeof string === 'string') {
            return {'c': JSON.stringify(string), 't': 'string', 's': true, 'lit': string};
        }
        return compileConst(cx, string);
    }

    // Variable
    if (exprKey === 'variable') {
        const {variable} = expr;

        // Keywords
        if (variable === 'null') {
            return {'c': 'null', 't': 'null', 's': true, 'lit': null};
        } else if (variable === 'false') {
            return {'c': 'false', 't': 'boolean', 's': true, 'lit': false};
        } else if (variable === 'true') {
            return {'c': 'true', 't': 'boolean', 's': true, 'lit': true};
        }

        // Local variable?
        const slot = (cx.slots !== null ? cx.slots.get(variable) : undefined);
        if (slot !== undefined) {
            const slotName = cx.slotNames[slot];
            if (cx.defined !== null && (cx.defined[slot >>> 5] & (1 << (slot & 31))) !== 0) {
                return {'c': slotName, 't': null, 's': true, 'lit': null};
            }
            return {'c': `(${slotName} !== undefined ? ${slotName} : ${compileGlobalValue(variable)})`, 't': null, 's': false, 'lit': null};
        }
        return {'c': compileGlobalValue(variable), 't': null, 's': false, 'lit': null};
    }

    // Function
    if (exprKey === 'function') {
        return compileFusedRoot(cx, expr) ?? compileCall(cx, expr.function);
    }

    // Binary expression
    if (exprKey === 'binary') {
        return compileFusedRoot(cx, expr) ?? compileBinary(cx, expr.binary);
    }

    // Unary expression
    if (exprKey === 'unary') {
        const {unary} = expr;
        const unaryOp = unary.op;
        if (unaryOp === '!') {
            return {'c': `!${compileCond(cx, unary.expr)}`, 't': 'boolean', 's': false, 'lit': null};
        }
        const {tempCount} = cx;
        const prefix = [];
        const value = compileOperand(cx, unary.expr, prefix);
        let code;
        if (unaryOp === '-') {
            code = (value.t === 'number' ? `(-${value.c})` : `(typeof ${value.c} === 'number' ? -${value.c} : null)`);
        } else {
            code = `(isInt(${value.c}) ? ~${value.c} : null)`;
        }
        cx.tempCount = tempCount;
        return {'c': prefixCode(prefix, code), 't': (unaryOp === '-' && value.t === 'number' ? 'number' : null), 's': false, 'lit': null};
    }

    // Expression group
    return compileExpr(cx, expr.group);
}


// The number-fusable binary operators, comparison operators, and intrinsic functions
const fusedOps = new Set(['+', '-', '*', '/', '%', '**']);
const compareOps = new Map([['<', '<'], ['<=', '<='], ['>', '>'], ['>=', '>='], ['==', '==='], ['!=', '!==']]);
const fusedIntrinsics = new Map([['mathSqrt', 'sqrt'], ['mathFloor', 'floor'], ['mathCeil', 'ceil'], ['mathAbs', 'abs']]);


// Compile a function or binary expression as a fused expression - returns null if it is not one
function compileFusedRoot(cx, expr) {
    if (cx.noFuse !== 0) {
        return null;
    }

    // An intrinsic function call within a fused expression is evaluated after the expression's operands, so
    // it is fused only if the order is unobservable - the expression has no other call and no global read
    const {fuseCalls} = cx;
    cx.fuseCalls = exprPure(cx, expr);
    let result = null;
    if (fusedWorthwhile(cx, expr)) {
        result = compileFusedValue(cx, expr);
    } else if ('binary' in expr && compareOps.has(expr.binary.op) &&
        (isFusable(cx, expr.binary.left) || isFusable(cx, expr.binary.right))) {
        result = compileFusedCompare(cx, expr);
    }
    cx.fuseCalls = fuseCalls;
    return result;
}


// Is an expression free of side effects and unaffected by any? Its operands are literals and
// definitely-assigned local variables, and its only function calls are the fused intrinsic functions.
function exprPure(cx, expr) {
    const exprKey = modelKey(expr);
    if (exprKey === 'number' || exprKey === 'string') {
        return true;
    } else if (exprKey === 'variable') {
        const {variable} = expr;
        if (variable === 'null' || variable === 'false' || variable === 'true') {
            return true;
        }
        const slot = (cx.slots !== null ? cx.slots.get(variable) : undefined);
        return slot !== undefined && cx.defined !== null && (cx.defined[slot >>> 5] & (1 << (slot & 31))) !== 0;
    } else if (exprKey === 'binary') {
        return exprPure(cx, expr.binary.left) && exprPure(cx, expr.binary.right);
    } else if (exprKey === 'unary') {
        return exprPure(cx, expr.unary.expr);
    } else if (exprKey === 'function') {
        return isFusedCall(cx, expr.function) && exprPure(cx, expr.function.args[0]);
    }
    return exprPure(cx, expr.group);
}


// Is a function call a fused intrinsic function call?
function isFusedCall(cx, func) {
    return fusedIntrinsics.has(func.name) && (func.args ?? null) !== null && func.args.length === 1 &&
        !(cx.slots !== null && cx.slots.has(func.name));
}


// Unwrap an expression's groups
function exprUngroup(expr) {
    let exprInner = expr;
    while (modelKey(exprInner) === 'group') {
        exprInner = exprInner.group;
    }
    return exprInner;
}


// Is an expression number-fusable? A fused expression computes numbers with JavaScript operators and tests
// once that the result is finite - if it is not, or if an operand is not a number, the expression is evaluated
// an operator at a time. "+" is fused only if an operand is a number expression (it is otherwise likely a
// string concatenation).
function isFusable(cx, expr) {
    const exprInner = exprUngroup(expr);
    const exprKey = modelKey(exprInner);
    if (exprKey === 'binary') {
        const {binary} = exprInner;
        if (binary.op === '+') {
            return isNumberHint(cx, binary.left) || isNumberHint(cx, binary.right);
        }
        return fusedOps.has(binary.op);
    } else if (exprKey === 'unary') {
        return exprInner.unary.op === '-';
    } else if (exprKey === 'function') {
        return cx.fuseCalls && isFusedCall(cx, exprInner.function);
    }
    return false;
}


// Is an expression statically a number?
function isNumberHint(cx, expr) {
    const exprInner = exprUngroup(expr);
    const exprKey = modelKey(exprInner);
    if (exprKey === 'number') {
        return typeof exprInner.number === 'number' && Number.isFinite(exprInner.number);
    }
    return isFusable(cx, exprInner);
}


// Count an expression's fusable nodes
function fusedCount(cx, expr) {
    const exprInner = exprUngroup(expr);
    if (!isFusable(cx, exprInner)) {
        return 0;
    }
    const exprKey = modelKey(exprInner);
    if (exprKey === 'binary') {
        return 1 + fusedCount(cx, exprInner.binary.left) + fusedCount(cx, exprInner.binary.right);
    } else if (exprKey === 'unary') {
        return 1 + fusedCount(cx, exprInner.unary.expr);
    }
    return 1 + fusedCount(cx, exprInner.function.args[0]);
}


// Is fusing an expression worthwhile? (more than one number operation)
function fusedWorthwhile(cx, expr) {
    return isFusable(cx, expr) && fusedCount(cx, expr) > 1;
}


// Compile a fusable expression - returns the JavaScript number expression code, which is valid if the guards
// are true. If the code's value is finite then so was every intermediate value.
function compileFused(cx, expr, prefix, guards) {
    const exprInner = exprUngroup(expr);
    if (!isFusable(cx, exprInner)) {
        // Operand
        const operand = compileOperand(cx, exprInner, prefix);
        if (cx.subst !== null) {
            cx.subst.set(exprInner, operand);
        }
        if (operand.t !== 'number') {
            const guard = `typeof ${operand.c} === 'number'`;
            if (!guards.includes(guard)) {
                guards.push(guard);
            }
        }
        return operand.c;
    }
    const exprKey = modelKey(exprInner);
    if (exprKey === 'binary') {
        const {binary} = exprInner;
        const binOp = binary.op;

        // A non-finite right operand of "/" or "%", or either operand of "**", can compute a finite result
        const leftCode = (binOp === '**' ? compileFusedFinite(cx, binary.left, prefix, guards, '')
            : compileFused(cx, binary.left, prefix, guards));
        const rightCode = (binOp === '/' || binOp === '%' || binOp === '**' ? compileFusedFinite(cx, binary.right, prefix, guards, '')
            : compileFused(cx, binary.right, prefix, guards));
        return `(${leftCode} ${binOp} ${rightCode})`;
    } else if (exprKey === 'unary') {
        return `(-${compileFused(cx, exprInner.unary.expr, prefix, guards)})`;
    }

    // Intrinsic function
    const {'function': func} = exprInner;
    if (!guards.includes('R.gi === g')) {
        guards.push('R.gi === g');
    }
    if (func.name === 'mathSqrt') {
        return `sqrt(${compileFusedFinite(cx, func.args[0], prefix, guards, ' >= 0')})`;
    }
    return `${fusedIntrinsics.get(func.name)}(${compileFused(cx, func.args[0], prefix, guards)})`;
}


// Compile a fusable expression whose value must be finite (and pass the test code, if any)
function compileFusedFinite(cx, expr, prefix, guards, testCode) {
    const code = compileFused(cx, expr, prefix, guards);
    if (!isFusable(cx, expr)) {
        if (testCode !== '') {
            guards.push(`${code}${testCode}`);
        }
        return code;
    }
    const temp = tempAlloc(cx);
    guards.push(testCode !== '' ? `(${temp} = ${code})${testCode}` : `(${temp} = ${code}) - ${temp} === 0`);
    return temp;
}


// Compile a fused expression's operator-at-a-time code
function compileFusedGeneric(cx, expr) {
    cx.noFuse++;
    const generic = compileExpr(cx, expr);
    cx.noFuse--;
    return generic;
}


// Compile a fused expression value
function compileFusedValue(cx, expr) {
    const {tempCount, subst} = cx;
    cx.subst = new Map();
    const prefix = [];
    const guards = [];
    const numberCode = compileFused(cx, expr, prefix, guards);
    guards.push(`(x = ${numberCode}) - x === 0`);
    const genericCode = compileFusedGeneric(cx, expr).c;
    cx.subst = subst;
    cx.tempCount = tempCount;
    return {'c': prefixCode(prefix, `(${guards.join(' && ')} ? x : ${genericCode})`), 't': null, 's': false, 'lit': null};
}


// Compile a comparison of fused expressions
function compileFusedCompare(cx, expr) {
    const {tempCount, subst} = cx;
    const {binary} = expr;
    cx.subst = new Map();
    const prefix = [];
    const guards = [];
    const leftCode = compileFusedFinite(cx, binary.left, prefix, guards, '');
    const rightCode = compileFusedFinite(cx, binary.right, prefix, guards, '');
    const genericCode = compileFusedGeneric(cx, expr).c;
    cx.subst = subst;
    cx.tempCount = tempCount;
    const compareCode = `${leftCode} ${compareOps.get(binary.op)} ${rightCode}`;
    return {'c': prefixCode(prefix, `(${guards.join(' && ')} ? ${compareCode} : ${genericCode})`), 't': 'boolean', 's': false, 'lit': null};
}


// Compile a non-literal constant value
function compileConst(cx, value) {
    cx.consts.push(value);
    return {'c': `C[${cx.consts.length - 1}]`, 't': null, 's': true, 'lit': null};
}


// Compile a global variable value read
function compileGlobalValue(name) {
    const nameCode = JSON.stringify(name);
    return (isSafeName(name) ? `(g[${nameCode}] ?? null)` : `gv(g, ${nameCode})`);
}


// Compile an expression as a JavaScript boolean expression
function compileCond(cx, expr) {
    const exprKey = modelKey(expr);
    if (exprKey === 'group') {
        return compileCond(cx, expr.group);
    } else if (exprKey === 'unary' && expr.unary.op === '!') {
        return `!${compileCond(cx, expr.unary.expr)}`;
    } else if (exprKey === 'binary' && (expr.binary.op === '&&' || expr.binary.op === '||')) {
        return `(${compileCond(cx, expr.binary.left)} ${expr.binary.op} ${compileCond(cx, expr.binary.right)})`;
    }
    const result = compileExpr(cx, expr);
    return result.cc ?? (result.t === 'boolean' ? result.c : `tb(${result.c})`);
}


// Compile a binary expression
function compileBinary(cx, binary) {
    const binOp = binary.op;
    const {tempCount} = cx;

    // Short-circuiting binary operators
    if (binOp === '&&' || binOp === '||') {
        const left = compileExpr(cx, binary.left);
        const right = compileExpr(cx, binary.right);
        if (left.t === 'boolean') {
            return {'c': `(${left.c} ${binOp} ${right.c})`, 't': (right.t === 'boolean' ? 'boolean' : null), 's': false, 'lit': null};
        }
        let leftCode = left.c;
        let testCode = left.c;
        if (!left.s) {
            leftCode = tempAlloc(cx);
            testCode = `${leftCode} = ${left.c}`;
            cx.tempCount = tempCount;
        }
        const code = (binOp === '&&' ? `(tb(${testCode}) ? ${right.c} : ${leftCode})` : `(tb(${testCode}) ? ${leftCode} : ${right.c})`);
        return {'c': code, 't': null, 's': false, 'lit': null};
    }

    // Non-short-circuiting binary operators
    const prefix = [];
    const left = compileOperand(cx, binary.left, prefix);
    const right = compileOperand(cx, binary.right, prefix);
    cx.tempCount = tempCount;
    const lc = left.c;
    const rc = right.c;
    const numberTests = [];
    if (left.t !== 'number') {
        numberTests.push(`typeof ${lc} === 'number'`);
    }
    if (right.t !== 'number' && rc !== lc) {
        numberTests.push(`typeof ${rc} === 'number'`);
    }
    const numberTest = numberTests.join(' && ');
    let code;
    let type = null;
    if (binOp === '+') {
        if (left.t === 'string' && right.t === 'string') {
            code = `(${lc} + ${rc})`;
            type = 'string';
        } else if (left.t === 'string') {
            code = `(typeof ${rc} === 'string' ? ${lc} + ${rc} : add(${lc}, ${rc}))`;
            type = 'string';
        } else if (right.t === 'string') {
            code = `(typeof ${lc} === 'string' ? ${lc} + ${rc} : add(${lc}, ${rc}))`;
            type = 'string';
        } else {
            code = `(${numberTest}${numberTest && ' && '}(x = ${lc} + ${rc}) - x === 0 ? x : add(${lc}, ${rc}))`;
        }
    } else if (binOp === '-') {
        code = `(${numberTest}${numberTest && ' && '}(x = ${lc} - ${rc}) - x === 0 ? x : sub(${lc}, ${rc}))`;
    } else if (binOp === '*' || binOp === '/' || binOp === '%' || binOp === '**') {
        code = `(${numberTest}${numberTest && ' && '}(x = ${lc} ${binOp} ${rc}) - x === 0 ? x : null)`;
    } else if (binOp === '<' || binOp === '<=' || binOp === '>' || binOp === '>=') {
        code = (numberTest === '' ? `(${lc} ${binOp} ${rc})` : `(${numberTest} ? ${lc} ${binOp} ${rc} : vc(${lc}, ${rc}) ${binOp} 0)`);
        type = 'boolean';
    } else if (binOp === '==' || binOp === '!=') {
        const jsOp = (binOp === '==' ? '===' : '!==');
        if (left.t === 'null' || right.t === 'null') {
            code = `(${lc} ${binOp} ${rc})`;
        } else if (left.t !== null || right.t !== null) {
            code = `(${lc} ${jsOp} ${rc})`;
        } else {
            code = `((typeof ${lc} === 'number' && typeof ${rc} === 'number') || (typeof ${lc} === 'string' && typeof ${rc} === 'string')` +
                ` ? ${lc} ${jsOp} ${rc} : vc(${lc}, ${rc}) ${jsOp} 0)`;
        }
        type = 'boolean';
    } else {
        // Bitwise operators - "&", "|", "^", "<<", and ">>"
        const jsOp = (binOp === '&' || binOp === '|' || binOp === '^' || binOp === '<<' ? binOp : '>>');
        const intTests = [];
        if (!(left.t === 'number' && Number.isInteger(left.lit))) {
            intTests.push(`isInt(${lc})`);
        }
        if (!(right.t === 'number' && Number.isInteger(right.lit))) {
            intTests.push(`isInt(${rc})`);
        }
        code = (intTests.length ? `(${intTests.join(' && ')} ? ${lc} ${jsOp} ${rc} : null)` : `(${lc} ${jsOp} ${rc})`);
    }
    return {'c': prefixCode(prefix, code), 't': type, 's': false, 'lit': null};
}


// Compile a function call expression
function compileCall(cx, func) {
    const funcName = func.name;
    const argExprs = func.args ?? null;
    const nameCode = JSON.stringify(funcName);
    const {tempCount} = cx;

    // "if" built-in function?
    if (funcName === 'if') {
        const argsExprLength = (argExprs !== null ? argExprs.length : 0);
        const valueCode = (argsExprLength >= 1 ? compileCond(cx, argExprs[0]) : 'false');
        const trueResult = (argsExprLength >= 2 ? compileExpr(cx, argExprs[1]) : null);
        const falseResult = (argsExprLength >= 3 ? compileExpr(cx, argExprs[2]) : null);
        const type = (trueResult !== null && falseResult !== null && trueResult.t === falseResult.t ? trueResult.t : null);
        const code = `(${valueCode} ? ${trueResult !== null ? trueResult.c : 'null'} : ${falseResult !== null ? falseResult.c : 'null'})`;
        return {'c': code, 't': (type === 'null' ? null : type), 's': false, 'lit': null};
    }

    // Local function variable?
    const zzCode = `o, Z, ${cx.ixStatement}`;
    const slot = (cx.slots !== null ? cx.slots.get(funcName) : undefined);
    const funcCode = (isSafeName(funcName) ? `g[${nameCode}]` : `gf(g, ${nameCode})`);
    if (slot !== undefined || argExprs === null) {
        const argsCode = (argExprs !== null ? `[${argExprs.map((argExpr) => compileExpr(cx, argExpr).c).join(', ')}]` : 'null');
        let valueCode = funcCode;
        if (slot !== undefined) {
            const slotName = cx.slotNames[slot];
            valueCode = `(${slotName} !== undefined ? ${slotName} : ${funcCode})`;
        }
        return {'c': `call(${nameCode}, ${argsCode}, ${valueCode}, ${zzCode})`, 't': null, 's': false, 'lit': null};
    }

    // Intrinsic function?
    const template = (Object.hasOwn(intrinsicTemplates, funcName) ? intrinsicTemplates[funcName] : null);
    if (template !== null) {
        const prefix = [];
        const args = argExprs.map((argExpr) => compileOperand(cx, argExpr, prefix));
        cx.tempCount = tempCount;
        // The library function call - an intrinsic function call does not end its statement's run, so the
        // call refunds the run's remaining statements while the function executes (it may not be the library's)
        const argsCode = `[${args.map((arg) => arg.c).join(', ')}]`;
        const callCode = (cx.runRest !== 0 ? `callr(${cx.runRest}, ${nameCode}, ${argsCode}, ${funcCode}, ${zzCode})`
            : `call(${nameCode}, ${argsCode}, ${funcCode}, ${zzCode})`);
        const fast = template(args);
        if (fast === null) {
            return {'c': prefixCode(prefix, callCode), 't': null, 's': false, 'lit': null};
        }
        const testCode = `R.gi === g${fast.cond !== null ? ` && ${fast.cond}` : ''}`;
        const result = {'c': prefixCode(prefix, `(${testCode} ? ${fast.value} : ${callCode})`), 't': null, 's': false, 'lit': null};
        if (fast.type === 'boolean') {
            result.cc = prefixCode(prefix, `(${testCode} ? ${fast.value} : tb(${callCode}))`);
        }
        return result;
    }

    // Script function? The function's current global value determines the call's form - undefined is assumed
    // to be a script function that is not yet defined
    const {globals} = cx;
    const funcValue = (Object.hasOwn(globals, funcName) ? globals[funcName] : undefined);
    if (funcValue === undefined || (typeof funcValue === 'function' && funcValue.$d !== undefined)) {
        const prefix = [];
        const args = argExprs.map((argExpr) => compileOperand(cx, argExpr, prefix));
        cx.tempCount = tempCount;
        const argsCode = args.map((arg) => arg.c).join(', ');
        const code = `(typeof (f = ${funcCode}) === 'function' && f.$d !== undefined` +
            ` ? ((x = f.$d(o${args.length ? ', ' : ''}${argsCode})) === E ? de(${nameCode}, ${zzCode}) : x)` +
            ` : call(${nameCode}, [${argsCode}], f, ${zzCode}))`;
        return {'c': prefixCode(prefix, code), 't': null, 's': false, 'lit': null};
    }

    // Library function
    const argsCode = `[${argExprs.map((argExpr) => compileExpr(cx, argExpr).c).join(', ')}]`;
    return {'c': `call(${nameCode}, ${argsCode}, ${funcCode}, ${zzCode})`, 't': null, 's': false, 'lit': null};
}
