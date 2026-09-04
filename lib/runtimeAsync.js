// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/runtimeAsync */

import {
    AsyncFunction, BareScriptRuntimeError, barescriptParseScript, computeLabelIndexes, defaultMaxStatements, evaluateExpression,
    executeScriptInit, lintInclude, recordStatementCoverage, scriptFunction, scriptFunctionLocals, systemGlobalCoverageName,
    systemGlobalIncludes
} from './runtime.js';
import {ValueArgsError, valueBoolean, valueCompare, valueObjectSet, valueString} from './value.js';
import {expressionFunctions} from './library.js';
import {systemIncludes} from './includeSource.js';
import {urlFileRelative} from './options.js';


/**
 * Execute a BareScript model asynchronously.
 * Use this form of the function if you have any global asynchronous functions.
 *
 * @param {Object} script - The [BareScript model](./model/#var.vName='BareScript')
 * @param {Object} [options = {}] - The [script execution options]{@link module:lib/options~ExecuteScriptOptions}
 * @returns The script result
 * @throws [BareScriptRuntimeError]{@link module:lib/runtime.BareScriptRuntimeError}
 */
export function executeScriptAsync(script, options = {}) {
    executeScriptInit(options);
    return executeScriptHelperAsync(script, script.statements, options, null, computeLabelIndexes(script.statements));
}


async function executeScriptHelperAsync(script, statements, options, locals, labelIndexes) {
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
            const exprValue = await evaluateExpressionAsync(stmtExpr.expr, options, locals, false, script, statement);
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
                valueBoolean(await evaluateExpressionAsync(stmtJump.expr, options, locals, false, script, statement))) {
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
                return evaluateExpressionAsync(stmtReturn.expr, options, locals, false, script, statement);
            }
            return null;

        // Function?
        } else if (statementKey === 'function') {
            const stmtFunction = statement.function;
            const fnLabelIndexes = computeLabelIndexes(stmtFunction.statements);
            if (stmtFunction.async) {
                valueObjectSet(globals, stmtFunction.name,
                    // eslint-disable-next-line require-await
                    async (args, fnOptions) => scriptFunctionAsync(script, stmtFunction, fnLabelIndexes, args, fnOptions));
            } else {
                valueObjectSet(globals, stmtFunction.name,
                    (args, fnOptions) => scriptFunction(script, stmtFunction, fnLabelIndexes, args, fnOptions));
            }

        // Include?
        } else if (statementKey === 'include') {
            // Compute the include script URLs
            const urlFn = options.urlFn ?? null;
            const unfilteredIncludeURLs = statement.include.includes.map(({url, system = false}) => {
                const includeURL = (!system && urlFn !== null ? urlFn(url) : url);

                // System include keys are bracketed so they can't collide with local include URLs
                const includeKey = (system ? `<${includeURL}>` : includeURL);
                return {includeURL, includeKey, 'systemInclude': system};
            });

            // Filter already included
            const globalIncludes = systemGlobalIncludes(globals);
            const includeURLs = unfilteredIncludeURLs.filter(({includeKey}) => !globalIncludes[includeKey]);

            // Get the include script text - system includes from the system include map, otherwise fetch.
            // Cache fetches so a nested include of a URL already in this parallel batch shares the GET.
            let {includeFetch} = options;
            if (includeFetch === null || typeof includeFetch !== 'object') {
                includeFetch = {};
                options.includeFetch = includeFetch;
            }
            const includeTexts = await Promise.all(includeURLs.map(async ({includeURL, includeKey, systemInclude}) => {
                if (systemInclude) {
                    const includeText = (Object.hasOwn(systemIncludes, includeURL) ? systemIncludes[includeURL] : null);
                    return {includeText, systemInclude};
                }
                if (!(includeKey in includeFetch)) {
                    includeFetch[includeKey] = (async () => {
                        try {
                            const response = ('fetchFn' in options ? await options.fetchFn(includeURL) : null);
                            return (response !== null && response.ok ? await response.text() : null);
                        } catch {
                            return null;
                        }
                    })();
                }
                const includeText = await includeFetch[includeKey];
                return {includeText, systemInclude};
            }));

            // Parse and execute each script
            for (const [ixScriptText, {includeText, systemInclude}] of includeTexts.entries()) {
                const {includeURL, includeKey} = includeURLs[ixScriptText];

                // Error?
                if (includeText === null) {
                    throw new BareScriptRuntimeError(script, statement, `Include of "${includeURL}" failed`);
                }

                // Mark as included. Check again if the URL is included.
                if (globalIncludes[includeKey]) {
                    continue;
                }
                globalIncludes[includeKey] = true;

                // Parse the include script. A system include starting with "{" is the
                // parser-compiled JSON script model (all system includes are embedded pre-compiled).
                const includeScript = (systemInclude && includeText.charCodeAt(0) === 0x7B
                    ? JSON.parse(includeText) : barescriptParseScript(includeText, 1, includeURL));
                if (systemInclude) {
                    includeScript.system = true;
                }

                // Execute the include script
                const includeOptions = {...options};
                includeOptions.urlFn = (url) => urlFileRelative(includeURL, url);
                await executeScriptHelperAsync(
                    includeScript, includeScript.statements, includeOptions, null, computeLabelIndexes(includeScript.statements)
                );

                // Run the bare-script linter?
                lintInclude(options, includeScript, includeURL);
            }
        }
    }

    return null;
}


// Runtime script async function implementation
function scriptFunctionAsync(script, function_, labelIndexes, args, options) {
    return executeScriptHelperAsync(script, function_.statements, options, scriptFunctionLocals(function_, args), labelIndexes);
}


/**
 * Evaluate an expression model asynchronously.
 * Use this form of the function if you have any asynchronous functions.
 *
 * @async
 * @param {Object} expr - The [expression model](./model/#var.vName='Expression')
 * @param {?Object} [options = null] - The [script execution options]{@link module:lib/options~ExecuteScriptOptions}
 * @param {?Object} [locals = null] - The local variables
 * @param {boolean} [builtins = true] - If true, include the [built-in expression functions](./library/expression.html)
 * @returns The expression result
 * @throws [BareScriptRuntimeError]{@link module:lib/runtime.BareScriptRuntimeError}
 */
export async function evaluateExpressionAsync(expr, options = null, locals = null, builtins = true, script = null, statement = null) {
    // If this expression does not require async then evaluate non-async
    const globals = (options !== null ? (options.globals ?? null) : null);
    if (!isAsyncExpr(expr, globals, locals)) {
        return evaluateExpression(expr, options, locals, builtins, script, statement);
    }

    // Function
    // The expression kind is its single key - read it with for-in, which does not allocate a keys array
    let exprKey;
    // eslint-disable-next-line guard-for-in, no-unreachable-loop
    for (exprKey in expr) {
        break;
    }
    if (exprKey === 'function') {
        const {function: func} = expr;

        // "if" built-in function?
        const funcName = func.name;
        if (funcName === 'if') {
            const [valueExpr, trueExpr = null, falseExpr = null] = func.args;
            const value = await evaluateExpressionAsync(valueExpr, options, locals, builtins, script, statement);
            const resultExpr = (valueBoolean(value) ? trueExpr : falseExpr);
            return resultExpr !== null ? evaluateExpressionAsync(resultExpr, options, locals, builtins, script, statement) : null;
        }

        // Compute the function arguments
        const argExprs = func.args ?? null;
        let funcArgs = null;
        if (argExprs !== null) {
            const numArgs = argExprs.length;
            const argPromises = new Array(numArgs);
            for (let ixArg = 0; ixArg < numArgs; ixArg++) {
                argPromises[ixArg] = evaluateExpressionAsync(argExprs[ixArg], options, locals, builtins, script, statement);
            }
            funcArgs = await Promise.all(argPromises);
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
            // Call the function
            try {
                return await funcValue(funcArgs, options) ?? null;
            } catch (error) {
                // Propogate runtime errors
                if (error instanceof BareScriptRuntimeError) {
                    throw error;
                }

                // Log and return null
                if (options !== null && 'logFn' in options && options.debug) {
                    options.logFn(`BareScript: Function "${funcName}" failed with error: ${error.message}`);
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
        const leftValue = await evaluateExpressionAsync(binary.left, options, locals, builtins, script, statement);

        // Short-circuiting "and" binary operator
        if (binOp === '&&') {
            if (!valueBoolean(leftValue)) {
                return leftValue;
            }
            return evaluateExpressionAsync(binary.right, options, locals, builtins, script, statement);

        // Short-circuiting "or" binary operator
        } else if (binOp === '||') {
            if (valueBoolean(leftValue)) {
                return leftValue;
            }
            return evaluateExpressionAsync(binary.right, options, locals, builtins, script, statement);
        }

        // Non-short-circuiting binary operators
        const rightValue = await evaluateExpressionAsync(binary.right, options, locals, builtins, script, statement);
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
        const value = await evaluateExpressionAsync(unary.expr, options, locals, builtins, script, statement);
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
    return evaluateExpressionAsync(expr.group, options, locals, builtins, script, statement);
}


function isAsyncExpr(expr, globals, locals) {
    // The expression kind is its single key - read it with for-in, which does not allocate a keys array
    let exprKey;
    // eslint-disable-next-line guard-for-in, no-unreachable-loop
    for (exprKey in expr) {
        break;
    }
    if (exprKey === 'function') {
        // Is the global/local function async?
        const funcName = expr.function.name;
        const localFuncValue = (locals !== null ? locals[funcName] : undefined);
        const funcValue = (typeof localFuncValue !== 'undefined' ? localFuncValue
            : (globals !== null && Object.hasOwn(globals, funcName) ? globals[funcName] : undefined));
        if (typeof funcValue === 'function' && funcValue.constructor === AsyncFunction) {
            return true;
        }

        // Are any of the function argument expressions async?
        return 'args' in expr.function && expr.function.args.some((exprArg) => isAsyncExpr(exprArg, globals, locals));
    } else if (exprKey === 'binary') {
        return isAsyncExpr(expr.binary.left, globals, locals) || isAsyncExpr(expr.binary.right, globals, locals);
    } else if (exprKey === 'unary') {
        return isAsyncExpr(expr.unary.expr, globals, locals);
    } else if (exprKey === 'group') {
        return isAsyncExpr(expr.group, globals, locals);
    }
    return false;
}
