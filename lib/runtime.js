// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/runtime */

import {ValueArgsError, valueBoolean, valueCompare, valueObjectSet, valueString, valueType} from './value.js';
import {expressionFunctions, intrinsics, scriptFunctions} from './library.js';
import {systemIncludes} from './includeSource.js';


// The default maximum statements for executeScript
export const defaultMaxStatements = 1e9;


// Coverage configuration object global variable name
export const systemGlobalCoverageName = '__barescriptCoverage';


// System includes object global variable name
export const systemGlobalIncludesName = '__barescriptIncludes';


// The AsyncFunction constructor, cached for fast async-function detection
export const AsyncFunction = (async () => { /* c8 ignore next */ }).constructor;


/**
 * Execute a BareScript model
 *
 * @param {Object} script - The [BareScript model](model/#var.vName='BareScript')
 * @param {Object} [options = {}] - The [script execution options]{@link module:lib/options~ExecuteScriptOptions}
 * @returns The script result
 * @throws [BareScriptRuntimeError]{@link module:lib/runtime.BareScriptRuntimeError}
 */
export function executeScript(script, options = {}) {
    executeScriptInit(options);
    return executeScriptHelper(script, script.statements, options, null, computeLabelIndexes(script.statements));
}


// Initialize the script execution options - create the globals object, if necessary, set the built-in
// script function globals, and reset the statement counter
export function executeScriptInit(options) {
    let {globals = null} = options;
    if (globals === null) {
        globals = {};
        options.globals = globals;
    }
    for (const scriptFuncName of Object.keys(scriptFunctions)) {
        if (!(scriptFuncName in globals)) {
            globals[scriptFuncName] = scriptFunctions[scriptFuncName];
        }
    }
    options.statementCount = 0;
}


// Compute a statements array's map of label name to statement index
export function computeLabelIndexes(statements) {
    const labelIndexes = Object.create(null);
    const statementsLength = statements.length;
    for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
        const statement = statements[ixStatement];
        if ('label' in statement) {
            labelIndexes[statement.label.name] = ixStatement;
        }
    }
    return labelIndexes;
}


function executeScriptHelper(script, statements, options, locals, labelIndexes) {
    const {globals} = options;
    const maxStatements = options.maxStatements ?? defaultMaxStatements;
    options.statementCount ??= 0;

    // Coverage configuration is invariant across this helper invocation
    const coverageGlobal = globals[systemGlobalCoverageName] ?? null;
    const hasCoverage = coverageGlobal !== null && typeof coverageGlobal === 'object' && coverageGlobal.enabled && !script.system;

    // Iterate each script statement
    const statementsLength = statements.length;
    for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
        const statement = statements[ixStatement];
        // The statement kind is its single key - read it with for-in, which does not allocate a keys array
        let statementKey;
        // eslint-disable-next-line guard-for-in, no-unreachable-loop
        for (statementKey in statement) {
            break;
        }

        // Increment the statement counter
        const statementCount = options.statementCount + 1;
        options.statementCount = statementCount;
        if (statementCount > maxStatements && maxStatements > 0) {
            throw new BareScriptRuntimeError(script, statement, `Exceeded maximum script statements (${maxStatements})`);
        }

        // Record the statement coverage
        if (hasCoverage) {
            recordStatementCoverage(script, statement, statementKey, coverageGlobal);
        }

        // Expression?
        if (statementKey === 'expr') {
            const stmtExpr = statement.expr;
            const exprValue = evaluateExpressionHelper(stmtExpr.expr, options, globals, locals, false, script, statement);
            if ('name' in stmtExpr) {
                if (locals !== null) {
                    locals[stmtExpr.name] = exprValue;
                } else {
                    valueObjectSet(globals, stmtExpr.name, exprValue);
                }
            }

        // Jump?
        } else if (statementKey === 'jump') {
            const stmtJump = statement.jump;
            // Evaluate the expression (if any)
            if (!('expr' in stmtJump) ||
                valueBoolean(evaluateExpressionHelper(stmtJump.expr, options, globals, locals, false, script, statement))) {
                // Jump to the label
                const jumpLabel = stmtJump.label;
                const ixLabel = labelIndexes[jumpLabel];
                if (ixLabel === undefined) {
                    throw new BareScriptRuntimeError(script, statement, `Unknown jump label "${jumpLabel}"`);
                }
                ixStatement = ixLabel;

                // Record the label statement coverage
                if (hasCoverage) {
                    const labelStatement = statements[ixStatement];
                    const [labelStatementKey] = Object.keys(labelStatement);
                    recordStatementCoverage(script, labelStatement, labelStatementKey, coverageGlobal);
                }
            }

        // Return?
        } else if (statementKey === 'return') {
            const stmtReturn = statement.return;
            if ('expr' in stmtReturn) {
                return evaluateExpressionHelper(stmtReturn.expr, options, globals, locals, false, script, statement);
            }
            return null;

        // Function?
        } else if (statementKey === 'function') {
            const stmtFunction = statement.function;
            const fnLabelIndexes = computeLabelIndexes(stmtFunction.statements);
            valueObjectSet(globals, stmtFunction.name,
                (args, fnOptions) => scriptFunction(script, stmtFunction, fnLabelIndexes, args, fnOptions));

        // Include?
        } else if (statementKey === 'include') {
            for (const {url, system = false} of statement.include.includes) {
                // Non-system includes cannot execute within a non-async scope
                if (!system) {
                    throw new BareScriptRuntimeError(script, statement, `Include of "${url}" within non-async scope`);
                }

                // Already included? System include keys are bracketed so they can't collide with local include URLs.
                const includeKey = `<${url}>`;
                const globalIncludes = systemGlobalIncludes(globals);
                if (globalIncludes[includeKey]) {
                    continue;
                }
                globalIncludes[includeKey] = true;

                // Get the system include script text
                const includeText = (Object.hasOwn(systemIncludes, url) ? systemIncludes[url] : null);
                if (includeText === null) {
                    throw new BareScriptRuntimeError(script, statement, `Include of "${url}" failed`);
                }

                // Parse the include script. A system include starting with "{" is the
                // parser-compiled JSON script model (all system includes are embedded pre-compiled).
                const includeScript = (includeText.charCodeAt(0) === 0x7B
                    ? JSON.parse(includeText) : barescriptParseScript(includeText, 1, url));
                includeScript.system = true;

                // Execute the include script
                executeScriptHelper(includeScript, includeScript.statements, options, null, computeLabelIndexes(includeScript.statements));

                // Run the bare-script linter?
                lintInclude(options, includeScript, url);
            }
        }
    }

    return null;
}


// Get the globals' system includes object (the map of include key to true), creating it if necessary
export function systemGlobalIncludes(globals) {
    let globalIncludes = globals[systemGlobalIncludesName] ?? null;
    if (globalIncludes === null || typeof globalIncludes !== 'object') {
        globalIncludes = {};
        globals[systemGlobalIncludesName] = globalIncludes;
    }
    return globalIncludes;
}


// Lint an include script in debug mode and log its warnings
export function lintInclude(options, includeScript, url) {
    if ('logFn' in options && options.debug) {
        const warnings = barescriptLintScript(includeScript, options.globals);
        if (warnings.length) {
            options.logFn(`BareScript: Include "${url}" static analysis... ${warnings.length} warning${warnings.length > 1 ? 's' : ''}:`);
            for (const warning of warnings) {
                options.logFn(`BareScript: ${warning}`);
            }
        }
    }
}


// Helper to execute a system include library script into a new globals object
function systemIncludeGlobals(url) {
    const globals = {};
    executeScript({'statements': [{'include': {'includes': [{'url': url, 'system': true}]}}]}, {globals});
    return globals;
}


// The barescriptParser.bare include library script globals (lazily initialized)
let parserGlobals = null;


// Helper function to execute the barescriptParser.bare include library script, if necessary. The globals are
// published only once complete so a concurrent first-use caller never observes a partially-initialized parser.
function parserGlobalsInit() {
    if (parserGlobals === null) {
        parserGlobals = systemIncludeGlobals('barescriptParser.bare');
    }
}


// Helper to unwrap a barescriptParser.bare parse result - throw on error
function parserResult(result) {
    if ('error' in result) {
        const {error} = result;
        throw new BareScriptParserError(error.error, error.line, error.columnNumber, error.lineNumber, error.scriptName);
    }
    return result.result;
}


/**
 * Parse a BareScript script
 *
 * @param {string|string[]} scriptText - The [script text](https://craigahobbs.github.io/bare-script/language/)
 * @param {number} [startLineNumber = 1] - The script's starting line number
 * @param {?string} [scriptName = null] - The script name
 * @returns {Object} The [BareScript model](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript')
 * @throws [BareScriptParserError]{@link module:lib/runtime.BareScriptParserError}
 */
export function barescriptParseScript(scriptText, startLineNumber = 1, scriptName = null) {
    parserGlobalsInit();
    return parserResult(parserGlobals.barescriptParseScriptEx([scriptText, startLineNumber, scriptName], {'globals': parserGlobals}));
}


/**
 * Parse a BareScript expression
 *
 * @param {string} exprText - The [expression text](https://craigahobbs.github.io/bare-script/language/#expressions)
 * @param {?number} [lineNumber = null] - The script line number
 * @param {?string} [scriptName = null] - The script name
 * @param {boolean} [arrayLiterals = false] - If True, allow parsing of array literals
 * @returns {Object} The [expression model](https://craigahobbs.github.io/bare-script/model/#var.vName='Expression')
 * @throws [BareScriptParserError]{@link module:lib/runtime.BareScriptParserError}
 */
export function barescriptParseExpression(exprText, lineNumber = null, scriptName = null, arrayLiterals = false) {
    parserGlobalsInit();
    return parserResult(
        parserGlobals.barescriptParseExpressionEx([exprText, lineNumber, scriptName, arrayLiterals], {'globals': parserGlobals})
    );
}


// The barescriptLint.bare include library script globals (lazily initialized)
let lintGlobals = null;


// Helper function to execute the barescriptLint.bare include library script, if necessary (see parserGlobalsInit)
function lintGlobalsInit() {
    if (lintGlobals === null) {
        lintGlobals = systemIncludeGlobals('barescriptLint.bare');
    }
}


/**
 * Lint a BareScript model
 *
 * @param {Object} script - The [BareScript model](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript')
 * @param {?Object} [globals = null] - The script global variables
 * @returns {string[]} The array of lint warning strings
 */
export function barescriptLintScript(script, globals = null) {
    // Compute the async global function names
    let asyncFunctions = null;
    if (globals !== null) {
        asyncFunctions = {};
        for (const [funcName, funcValue] of Object.entries(globals)) {
            if (typeof funcValue === 'function' && funcValue.constructor === AsyncFunction) {
                asyncFunctions[funcName] = true;
            }
        }
    }

    // Call the barescriptLint.bare lint function
    lintGlobalsInit();
    return lintGlobals.barescriptLintScript([script, globals, asyncFunctions], {'globals': lintGlobals});
}


// Helper function to record statement coverage
export function recordStatementCoverage(script, statement, statementKey, coverageGlobal) {
    // Get the script name and statement line number
    const scriptName = script.scriptName ?? null;
    const lineno = statement[statementKey].lineNumber ?? null;
    if (scriptName === null || lineno === null) {
        return;
    }

    // Record the statement/lineno coverage
    let scripts = coverageGlobal.scripts ?? null;
    if (scripts === null) {
        scripts = {};
        coverageGlobal.scripts = scripts;
    }
    let scriptCoverage = scripts[scriptName] ?? null;
    if (scriptCoverage === null) {
        scriptCoverage = {'script': script, 'covered': {}};
        scripts[scriptName] = scriptCoverage;
    }

    // Increment the statement coverage count
    const linenoStr = String(lineno);
    const coveredStatements = scriptCoverage.covered;
    let coveredStatement = coveredStatements[linenoStr] ?? null;
    if (coveredStatement === null) {
        coveredStatement = {'statement': statement, 'count': 0};
        coveredStatements[linenoStr] = coveredStatement;
    }
    coveredStatement.count += 1;
}


// Runtime script function implementation
export function scriptFunction(script, function_, labelIndexes, args, options) {
    return executeScriptHelper(script, function_.statements, options, scriptFunctionLocals(function_, args), labelIndexes);
}


// Helper to create a script function's local variables object from its call arguments
export function scriptFunctionLocals(function_, args) {
    // Null-prototype object so variable names like "__proto__" are own keys, matching the Python runtime
    const funcLocals = Object.create(null);
    const funcArgs = function_.args ?? null;
    if (funcArgs !== null) {
        const argsLength = args.length;
        const funcArgsLength = funcArgs.length;
        if (function_.lastArgArray) {
            const ixArgLast = funcArgsLength - 1;
            for (let ixArg = 0; ixArg < funcArgsLength; ixArg++) {
                const argName = funcArgs[ixArg];
                if (ixArg < argsLength) {
                    funcLocals[argName] = (ixArg === ixArgLast ? args.slice(ixArg) : args[ixArg]);
                } else {
                    funcLocals[argName] = (ixArg === ixArgLast ? [] : null);
                }
            }
        } else {
            for (let ixArg = 0; ixArg < funcArgsLength; ixArg++) {
                funcLocals[funcArgs[ixArg]] = (ixArg < argsLength ? args[ixArg] : null);
            }
        }
    }
    return funcLocals;
}


/**
 * Evaluate an expression model
 *
 * @param {Object} expr - The [expression model](./model/#var.vName='Expression')
 * @param {?Object} [options = null] - The [script execution options]{@link module:lib/options~ExecuteScriptOptions}
 * @param {?Object} [locals = null] - The local variables
 * @param {boolean} [builtins = true] - If true, include the [built-in expression functions](./library/expression.html)
 * @returns The expression result
 * @throws [BareScriptRuntimeError]{@link module:lib/runtime.BareScriptRuntimeError}
 */
export function evaluateExpression(expr, options = null, locals = null, builtins = true, script = null, statement = null) {
    const globals = (options !== null ? (options.globals ?? null) : null);
    return evaluateExpressionHelper(expr, options, globals, locals, builtins, script, statement);
}


// Expression evaluation helper - threads the globals object to avoid a per-call options lookup
function evaluateExpressionHelper(expr, options, globals, locals, builtins, script, statement) {
    // The expression kind is its single key - read it with for-in, which does not allocate a keys array
    let exprKey;
    // eslint-disable-next-line guard-for-in, no-unreachable-loop
    for (exprKey in expr) {
        break;
    }

    // Number
    if (exprKey === 'number') {
        return expr.number;
    }

    // String
    if (exprKey === 'string') {
        return expr.string;
    }

    // Variable
    if (exprKey === 'variable') {
        const {variable} = expr;

        // Keywords
        if (variable === 'null') {
            return null;
        } else if (variable === 'false') {
            return false;
        } else if (variable === 'true') {
            return true;
        }

        // Get the local or global variable value or null if undefined. Locals are a null-prototype
        // object; globals are checked for an own property so inherited names (e.g. "__proto__",
        // "constructor") do not resolve, matching the Python runtime.
        let varValue = (locals !== null ? locals[variable] : undefined);
        if (typeof varValue === 'undefined') {
            varValue = (globals !== null && Object.hasOwn(globals, variable) ? (globals[variable] ?? null) : null);
        }
        return varValue;
    }

    // Function
    if (exprKey === 'function') {
        const {function: func} = expr;

        // "if" built-in function?
        const funcName = func.name;
        if (funcName === 'if') {
            const argsExpr = func.args ?? null;
            const argsExprLength = (argsExpr !== null ? argsExpr.length : 0);
            const valueExpr = (argsExprLength >= 1 ? argsExpr[0] : null);
            const trueExpr = (argsExprLength >= 2 ? argsExpr[1] : null);
            const falseExpr = (argsExprLength >= 3 ? argsExpr[2] : null);
            const value =
                (valueExpr !== null ? evaluateExpressionHelper(valueExpr, options, globals, locals, builtins, script, statement) : false);
            const resultExpr = (valueBoolean(value) ? trueExpr : falseExpr);
            return resultExpr !== null ? evaluateExpressionHelper(resultExpr, options, globals, locals, builtins, script, statement) : null;
        }

        // Compute the function arguments
        const argExprs = func.args ?? null;
        let funcArgs = null;
        if (argExprs !== null) {
            const numArgs = argExprs.length;
            funcArgs = new Array(numArgs);
            for (let ixArg = 0; ixArg < numArgs; ixArg++) {
                funcArgs[ixArg] = evaluateExpressionHelper(argExprs[ixArg], options, globals, locals, builtins, script, statement);
            }
        }

        // Global/local function? Globals are checked for an own property so inherited names
        // (e.g. "constructor") do not resolve, matching the Python runtime.
        let funcValue = (locals !== null ? locals[funcName] : undefined);
        if (typeof funcValue === 'undefined') {
            funcValue = (globals !== null && Object.hasOwn(globals, funcName) ? globals[funcName] : undefined);
            if (typeof funcValue === 'undefined') {
                funcValue = (builtins && Object.hasOwn(expressionFunctions, funcName) ? expressionFunctions[funcName] : null);
            }
        }
        if (funcValue !== null) {
            // Async function called within non-async execution?
            if (typeof funcValue === 'function' && funcValue.constructor === AsyncFunction) {
                throw new BareScriptRuntimeError(script, statement, `Async function "${funcName}" called within non-async scope`);
            }

            // Call the function
            try {
                // Intrinsic fast path: run the body inline, skipping valueArgsValidate and the call.
                // Bad arguments throw ValueArgsError, handled by the catch below exactly as the normal
                // call would; a call reaching one of these under a different name (an alias) matches no
                // branch and falls through to the normal call.
                if (intrinsics.has(funcValue)) {
                    // arrayNew has no argument validation - handled before the length access below
                    // because funcArgs is null when the function expression has no arguments
                    if (funcName === 'arrayNew') {
                        return funcArgs;
                    }
                    const funcArgsLength = funcArgs.length;
                    if (funcName === 'objectGet') {
                        const defaultValue = (funcArgsLength >= 3 ? funcArgs[2] : null);
                        if (funcArgsLength < 1) {
                            throw new ValueArgsError('object', null, defaultValue);
                        }
                        const [object] = funcArgs;
                        if (typeof object !== 'object' || object === null || Object.getPrototypeOf(object) !== Object.prototype) {
                            throw new ValueArgsError('object', object, defaultValue);
                        }
                        if (funcArgsLength < 2) {
                            throw new ValueArgsError('key', null, defaultValue);
                        }
                        const [, key] = funcArgs;
                        if (typeof key !== 'string') {
                            throw new ValueArgsError('key', key, defaultValue);
                        }
                        if (funcArgsLength > 3) {
                            throw new ValueArgsError(null, funcArgsLength, defaultValue);
                        }
                        return (Object.hasOwn(object, key) ? object[key] : defaultValue);
                    }
                    if (funcName === 'objectHas') {
                        if (funcArgsLength < 1) {
                            throw new ValueArgsError('object', null, false);
                        }
                        const [object] = funcArgs;
                        if (typeof object !== 'object' || object === null || Object.getPrototypeOf(object) !== Object.prototype) {
                            throw new ValueArgsError('object', object, false);
                        }
                        if (funcArgsLength < 2) {
                            throw new ValueArgsError('key', null, false);
                        }
                        const [, key] = funcArgs;
                        if (typeof key !== 'string') {
                            throw new ValueArgsError('key', key, false);
                        }
                        if (funcArgsLength > 2) {
                            throw new ValueArgsError(null, funcArgsLength, false);
                        }
                        return Object.hasOwn(object, key);
                    }
                    if (funcName === 'arrayGet') {
                        if (funcArgsLength < 1) {
                            throw new ValueArgsError('array', null);
                        }
                        const [array] = funcArgs;
                        if (!Array.isArray(array)) {
                            throw new ValueArgsError('array', array);
                        }
                        if (funcArgsLength < 2) {
                            throw new ValueArgsError('index', null);
                        }
                        const [, index] = funcArgs;
                        if (typeof index !== 'number' || Math.floor(index) !== index || index < 0) {
                            throw new ValueArgsError('index', index);
                        }
                        if (funcArgsLength > 2) {
                            throw new ValueArgsError(null, funcArgsLength);
                        }
                        if (index >= array.length) {
                            throw new ValueArgsError('index', index);
                        }
                        return array[index];
                    }
                    if (funcName === 'arrayLength') {
                        if (funcArgsLength < 1) {
                            throw new ValueArgsError('array', null, 0);
                        }
                        const [array] = funcArgs;
                        if (!Array.isArray(array)) {
                            throw new ValueArgsError('array', array, 0);
                        }
                        if (funcArgsLength > 1) {
                            throw new ValueArgsError(null, funcArgsLength, 0);
                        }
                        return array.length;
                    }
                    if (funcName === 'arrayPush') {
                        if (funcArgsLength < 1) {
                            throw new ValueArgsError('array', null);
                        }
                        const [array] = funcArgs;
                        if (!Array.isArray(array)) {
                            throw new ValueArgsError('array', array);
                        }
                        array.push(...funcArgs.slice(1));
                        return array;
                    }
                    if (funcName === 'objectSet') {
                        if (funcArgsLength < 1) {
                            throw new ValueArgsError('object', null);
                        }
                        const [object] = funcArgs;
                        if (typeof object !== 'object' || object === null || Object.getPrototypeOf(object) !== Object.prototype) {
                            throw new ValueArgsError('object', object);
                        }
                        if (funcArgsLength < 2) {
                            throw new ValueArgsError('key', null);
                        }
                        const [, key] = funcArgs;
                        if (typeof key !== 'string') {
                            throw new ValueArgsError('key', key);
                        }
                        if (funcArgsLength > 3) {
                            throw new ValueArgsError(null, funcArgsLength);
                        }
                        const value = (funcArgsLength >= 3 ? funcArgs[2] : null);
                        valueObjectSet(object, key, value);
                        return value;
                    }
                    if (funcName === 'stringLength') {
                        if (funcArgsLength < 1) {
                            throw new ValueArgsError('string', null, 0);
                        }
                        const [string] = funcArgs;
                        if (typeof string !== 'string') {
                            throw new ValueArgsError('string', string, 0);
                        }
                        if (funcArgsLength > 1) {
                            throw new ValueArgsError(null, funcArgsLength, 0);
                        }
                        return string.length;
                    }
                    if (funcName === 'systemType') {
                        return valueType(funcArgsLength >= 1 ? funcArgs[0] : null);
                    }
                    if (funcName === 'objectKeys') {
                        if (funcArgsLength < 1) {
                            throw new ValueArgsError('object', null);
                        }
                        const [object] = funcArgs;
                        if (typeof object !== 'object' || object === null || Object.getPrototypeOf(object) !== Object.prototype) {
                            throw new ValueArgsError('object', object);
                        }
                        if (funcArgsLength > 1) {
                            throw new ValueArgsError(null, funcArgsLength);
                        }
                        return Object.keys(object);
                    }
                    if (funcName === 'arraySet') {
                        if (funcArgsLength < 1) {
                            throw new ValueArgsError('array', null);
                        }
                        const [array] = funcArgs;
                        if (!Array.isArray(array)) {
                            throw new ValueArgsError('array', array);
                        }
                        if (funcArgsLength < 2) {
                            throw new ValueArgsError('index', null);
                        }
                        const [, index] = funcArgs;
                        if (typeof index !== 'number' || Math.floor(index) !== index || index < 0) {
                            throw new ValueArgsError('index', index);
                        }
                        if (funcArgsLength > 3) {
                            throw new ValueArgsError(null, funcArgsLength);
                        }
                        if (index >= array.length) {
                            throw new ValueArgsError('index', index);
                        }
                        const value = (funcArgsLength >= 3 ? funcArgs[2] : null);
                        array[index] = value;
                        return value;
                    }
                    if (funcName === 'mathSqrt') {
                        if (funcArgsLength < 1) {
                            throw new ValueArgsError('x', null);
                        }
                        const [xValue] = funcArgs;
                        if (typeof xValue !== 'number' || !(xValue >= 0)) {
                            throw new ValueArgsError('x', xValue);
                        }
                        if (funcArgsLength > 1) {
                            throw new ValueArgsError(null, funcArgsLength);
                        }
                        return Math.sqrt(xValue);
                    }
                }
                return funcValue(funcArgs, options) ?? null;
            } catch (error) {
                // Propogate runtime errors
                if (error instanceof BareScriptRuntimeError) {
                    throw error;
                }

                // Log and return null
                if (options !== null && 'logFn' in options && options.debug) {
                    const errorMessage = new BareScriptRuntimeError(
                        script, statement, `BareScript: Function "${funcName}" failed with error: ${error.message}`
                    );
                    options.logFn(errorMessage.message);
                }
                if (error instanceof ValueArgsError) {
                    return error.returnValue;
                }
                return null;
            }
        }

        throw new BareScriptRuntimeError(script, statement, `Undefined function "${funcName}"`);
    }

    // Binary expression
    if (exprKey === 'binary') {
        const {binary} = expr;
        const binOp = binary.op;
        const leftValue = evaluateExpressionHelper(binary.left, options, globals, locals, builtins, script, statement);

        // Short-circuiting "and" binary operator
        if (binOp === '&&') {
            if (!valueBoolean(leftValue)) {
                return leftValue;
            }
            return evaluateExpressionHelper(binary.right, options, globals, locals, builtins, script, statement);

        // Short-circuiting "or" binary operator
        } else if (binOp === '||') {
            if (valueBoolean(leftValue)) {
                return leftValue;
            }
            return evaluateExpressionHelper(binary.right, options, globals, locals, builtins, script, statement);
        }

        // Non-short-circuiting binary operators
        const rightValue = evaluateExpressionHelper(binary.right, options, globals, locals, builtins, script, statement);
        if (binOp === '+') {
            // number + number
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                const result = leftValue + rightValue;
                return (isFinite(result) ? result : null);

            // string + string
            } else if (typeof leftValue === 'string' && typeof rightValue === 'string') {
                return leftValue + rightValue;

            // string + <any>
            } else if (typeof leftValue === 'string') {
                return leftValue + valueString(rightValue);
            } else if (typeof rightValue === 'string') {
                return valueString(leftValue) + rightValue;

            // datetime + number
            } else if (leftValue instanceof Date && typeof rightValue === 'number') {
                const result = new Date(leftValue.getTime() + rightValue);
                return (isNaN(result.getTime()) ? null : result);
            } else if (typeof leftValue === 'number' && rightValue instanceof Date) {
                const result = new Date(leftValue + rightValue.getTime());
                return (isNaN(result.getTime()) ? null : result);
            }
        } else if (binOp === '-') {
            // number - number
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                const result = leftValue - rightValue;
                return (isFinite(result) ? result : null);

            // datetime - datetime
            } else if (leftValue instanceof Date && rightValue instanceof Date) {
                return leftValue - rightValue;
            }
        } else if (binOp === '*') {
            // number * number
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                const result = leftValue * rightValue;
                return (isFinite(result) ? result : null);
            }
        } else if (binOp === '/') {
            // number / number
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                const result = leftValue / rightValue;
                return (isFinite(result) ? result : null);
            }
        } else if (binOp === '<') {
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue < rightValue;
            }
            return valueCompare(leftValue, rightValue) < 0;
        } else if (binOp === '<=') {
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue <= rightValue;
            }
            return valueCompare(leftValue, rightValue) <= 0;
        } else if (binOp === '>') {
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue > rightValue;
            }
            return valueCompare(leftValue, rightValue) > 0;
        } else if (binOp === '>=') {
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue >= rightValue;
            }
            return valueCompare(leftValue, rightValue) >= 0;
        } else if (binOp === '==') {
            if ((typeof leftValue === 'number' && typeof rightValue === 'number') ||
                (typeof leftValue === 'string' && typeof rightValue === 'string')) {
                return leftValue === rightValue;
            }
            return valueCompare(leftValue, rightValue) === 0;
        } else if (binOp === '!=') {
            if ((typeof leftValue === 'number' && typeof rightValue === 'number') ||
                (typeof leftValue === 'string' && typeof rightValue === 'string')) {
                return leftValue !== rightValue;
            }
            return valueCompare(leftValue, rightValue) !== 0;
        } else if (binOp === '%') {
            // number % number
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                const result = leftValue % rightValue;
                return (isFinite(result) ? result : null);
            }
        } else if (binOp === '**') {
            // number ** number
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                const result = leftValue ** rightValue;
                return (isFinite(result) ? result : null);
            }
        } else if (binOp === '&') {
            if (Number.isInteger(leftValue) && Number.isInteger(rightValue)) {
                return leftValue & rightValue;
            }
        } else if (binOp === '|') {
            if (Number.isInteger(leftValue) && Number.isInteger(rightValue)) {
                return leftValue | rightValue;
            }
        } else if (binOp === '^') {
            if (Number.isInteger(leftValue) && Number.isInteger(rightValue)) {
                return leftValue ^ rightValue;
            }
        } else if (binOp === '<<') {
            if (Number.isInteger(leftValue) && Number.isInteger(rightValue)) {
                return leftValue << rightValue;
            }
        } else {
            // if (binOp === '>>')
            if (Number.isInteger(leftValue) && Number.isInteger(rightValue)) {
                return leftValue >> rightValue;
            }
        }

        // Invalid operation values
        return null;
    }

    // Unary expression
    if (exprKey === 'unary') {
        const {unary} = expr;
        const unaryOp = unary.op;
        const value = evaluateExpressionHelper(unary.expr, options, globals, locals, builtins, script, statement);
        if (unaryOp === '!') {
            return !valueBoolean(value);
        } else if (unaryOp === '-') {
            if (typeof value === 'number') {
                return -value;
            }
        } else {
            // if (unaryOp === '~'
            if (Number.isInteger(value)) {
                return ~value;
            }
        }

        // Invalid operation value
        return null;
    }

    // Expression group
    // else if (exprKey === 'group')
    return evaluateExpressionHelper(expr.group, options, globals, locals, builtins, script, statement);
}


/**
 * A BareScript runtime error
 *
 * @extends {Error}
 */
export class BareScriptRuntimeError extends Error {
    /**
     * Create a BareScript runtime error
     *
     * @param {string} message - The runtime error message
     */
    constructor(script, statement, message) {
        let messageScript;
        if (script !== null && statement !== null) {
            const [statementKey] = Object.keys(statement);
            const scriptName = script.scriptName ?? '';
            const lineno = statement[statementKey].lineNumber ?? '';
            messageScript = (scriptName && lineno ? `${scriptName}:${lineno}: ${message}` : message);
        } else {
            messageScript = message;
        }
        super(messageScript);
        this.name = this.constructor.name;
    }
}


/**
 * A BareScript parser error
 *
 * @extends {Error}
 * @property {string} error - The error description
 * @property {string} line - The line text
 * @property {number} columnNumber - The error column number
 * @property {?number} lineNumber - The error line number
 * @property {?string} scriptName - The script name
 */
export class BareScriptParserError extends Error {
    /**
     * Create a BareScript parser error
     *
     * @param {string} error - The error description
     * @param {string} line - The line text
     * @param {number} [columnNumber] - The error column number
     * @param {?number} [lineNumber] - The error line number
     * @param {?string} [scriptName] - The script name
     */
    constructor(error, line, columnNumber, lineNumber, scriptName) {
        // Parser error constants
        const lineLengthMax = 120;
        const lineSuffix = ' ...';
        const linePrefix = '... ';

        // Trim the error line, if necessary
        let lineError = line;
        let lineColumn = columnNumber;
        if (line.length > lineLengthMax) {
            const lineLeft = columnNumber - 1 - lineLengthMax / 2;
            const lineRight = lineLeft + lineLengthMax;
            if (lineLeft < 0) {
                lineError = line.slice(0, lineLengthMax) + lineSuffix;
            } else if (lineRight > line.length) {
                lineError = linePrefix + line.slice(line.length - lineLengthMax);
                lineColumn -= lineLeft - linePrefix.length - (lineRight - line.length);
            } else {
                lineError = linePrefix + line.slice(lineLeft, lineRight) + lineSuffix;
                lineColumn -= lineLeft - linePrefix.length;
            }
        }

        // Format the message
        const errorPrefix = (lineNumber ? `${scriptName || ''}:${lineNumber}: ` : '');
        const message = `\
${errorPrefix}${error}
${lineError}
${' '.repeat(lineColumn - 1)}^
`;
        super(message);
        this.name = this.constructor.name;
        this.error = error;
        this.line = line;
        this.columnNumber = columnNumber;
        this.lineNumber = lineNumber;
        this.scriptName = scriptName;
    }
}
