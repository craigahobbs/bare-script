// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/runtimeAsync */

import {
    AsyncFunction, BareScriptRuntimeError, defaultMaxStatements, evaluateExpression, recordStatementCoverage, scriptFunction,
    systemGlobalCoverageName, systemGlobalIncludesName
} from './runtime.js';
import {ValueArgsError, valueBoolean, valueCompare, valueString} from './value.js';
import {expressionFunctions, scriptFunctions} from './library.js';
import {lintScript} from './model.js';
import {parseScript} from './parser.js';
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
    // Create the global variable object, if necessary
    let {globals = null} = options;
    if (globals === null) {
        globals = {};
        options.globals = globals;
    }

    // Set the script function globals variables
    for (const scriptFuncName of Object.keys(scriptFunctions)) {
        if (!(scriptFuncName in globals)) {
            globals[scriptFuncName] = scriptFunctions[scriptFuncName];
        }
    }

    // Execute the script
    options.statementCount = 0;
    return executeScriptHelperAsync(script, script.statements, options, null);
}


async function executeScriptHelperAsync(script, statements, options, locals) {
    const {globals} = options;
    const maxStatements = options.maxStatements ?? defaultMaxStatements;
    options.statementCount ??= 0;

    // Coverage configuration is invariant across this helper invocation
    const coverageGlobal = globals[systemGlobalCoverageName] ?? null;
    const hasCoverage = coverageGlobal !== null && typeof coverageGlobal === 'object' && coverageGlobal.enabled && !script.system;

    // Iterate each script statement
    let labelIndexes = null;
    const statementsLength = statements.length;
    for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
        const statement = statements[ixStatement];
        const [statementKey] = Object.keys(statement);

        // Increment the statement counter
        options.statementCount += 1;
        if (maxStatements > 0 && options.statementCount > maxStatements) {
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
                    globals[stmtExpr.name] = exprValue;
                }
            }

        // Jump?
        } else if (statementKey === 'jump') {
            const stmtJump = statement.jump;
            // Evaluate the expression (if any)
            if (!('expr' in stmtJump) ||
                valueBoolean(await evaluateExpressionAsync(stmtJump.expr, options, locals, false, script, statement))) {
                // Find the label
                const jumpLabel = stmtJump.label;
                if (labelIndexes !== null && jumpLabel in labelIndexes) {
                    ixStatement = labelIndexes[jumpLabel];
                } else {
                    const ixLabel = statements.findIndex((stmt) => 'label' in stmt && stmt.label.name === jumpLabel);
                    if (ixLabel === -1) {
                        throw new BareScriptRuntimeError(script, statement, `Unknown jump label "${jumpLabel}"`);
                    }
                    if (labelIndexes === null) {
                        labelIndexes = {};
                    }
                    labelIndexes[jumpLabel] = ixLabel;
                    ixStatement = ixLabel;
                }

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
            if (stmtFunction.async) {
                globals[stmtFunction.name] =
                    // eslint-disable-next-line require-await
                    async (args, fnOptions) => scriptFunctionAsync(script, stmtFunction, args, fnOptions);
            } else {
                globals[stmtFunction.name] = (args, fnOptions) => scriptFunction(script, stmtFunction, args, fnOptions);
            }

        // Include?
        } else if (statementKey === 'include') {
            // Compute the include script URLs
            const urlFn = options.urlFn ?? null;
            const unfilteredIncludeURLs = statement.include.includes.map(({url, system = false}) => {
                let includeURL;
                if (system && 'systemPrefix' in options) {
                    includeURL = urlFileRelative(options.systemPrefix, url);
                } else {
                    includeURL = (urlFn !== null ? urlFn(url) : url);
                }
                return {includeURL, 'systemInclude': system};
            });

            // Filter already included
            let globalIncludes = globals[systemGlobalIncludesName] ?? null;
            if (globalIncludes === null || typeof globalIncludes !== 'object') {
                globalIncludes = {};
                globals[systemGlobalIncludesName] = globalIncludes;
            }
            const includeURLs = unfilteredIncludeURLs.filter(({includeURL}) => {
                if (globalIncludes[includeURL]) {
                    return false;
                }
                return true;
            });

            // Fetch the include script text
            const responses = await Promise.all(includeURLs.map(async ({includeURL, systemInclude}) => {
                try {
                    const response = ('fetchFn' in options ? await options.fetchFn(includeURL) : null);
                    return {response, systemInclude};
                } catch {
                    return {'response': null, systemInclude};
                }
            }));
            const includeTexts = await Promise.all(responses.map(async ({response, systemInclude}) => {
                try {
                    const includeText = (response !== null && response.ok ? await response.text() : null);
                    return {includeText, systemInclude};
                } catch {
                    return {'includeText': null, systemInclude};
                }
            }));

            // Parse and execute each script
            for (const [ixScriptText, {includeText, systemInclude}] of includeTexts.entries()) {
                const {includeURL} = includeURLs[ixScriptText];

                // Error?
                if (includeText === null) {
                    throw new BareScriptRuntimeError(script, statement, `Include of "${includeURL}" failed`);
                }

                // Mark as included. Check again if the URL is included.
                if (globalIncludes[includeURL]) {
                    continue;
                }
                globalIncludes[includeURL] = true;

                // Parse the include script
                const includeScript = parseScript(includeText, 1, includeURL);
                if (systemInclude) {
                    includeScript.system = true;
                }

                // Execute the include script
                const includeOptions = {...options};
                includeOptions.urlFn = (url) => urlFileRelative(includeURL, url);
                await executeScriptHelperAsync(includeScript, includeScript.statements, includeOptions, null);

                // Run the bare-script linter?
                if ('logFn' in options && options.debug) {
                    const warnings = lintScript(includeScript, globals);
                    const warningPrefix = `BareScript: Include "${includeURL}" static analysis...`;
                    if (warnings.length) {
                        options.logFn(`${warningPrefix} ${warnings.length} warning${warnings.length > 1 ? 's' : ''}:`);
                        for (const warning of warnings) {
                            options.logFn(`BareScript: ${warning}`);
                        }
                    }
                }
            }
        }
    }

    return null;
}


// Runtime script async function implementation
function scriptFunctionAsync(script, function_, args, options) {
    const funcLocals = {};
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
    return executeScriptHelperAsync(script, function_.statements, options, funcLocals);
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
    const [exprKey] = Object.keys(expr);
    const globals = (options !== null ? (options.globals ?? null) : null);

    // If this expression does not require async then evaluate non-async
    const hasSubExpr = (exprKey !== 'number' && exprKey !== 'string' && exprKey !== 'variable');
    if (hasSubExpr && !isAsyncExpr(expr, globals, locals)) {
        return evaluateExpression(expr, options, locals, builtins, script, statement);
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

        // Get the local or global variable value or null if undefined
        let varValue = (locals !== null ? locals[variable] : undefined);
        if (typeof varValue === 'undefined') {
            varValue = (globals !== null ? (globals[variable] ?? null) : null);
        }
        return varValue;
    }

    // Function
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

        // Global/local function?
        let funcValue = (locals !== null ? locals[funcName] : undefined);
        if (typeof funcValue === 'undefined') {
            funcValue = (globals !== null ? globals[funcName] : undefined);
            if (typeof funcValue === 'undefined') {
                funcValue = (builtins ? expressionFunctions[funcName] : null) ?? null;
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
            return evaluateExpressionAsync (binary.right, options, locals, builtins);
        }

        // Non-short-circuiting binary operators
        const rightValue = await evaluateExpressionAsync(binary.right, options, locals, builtins, script, statement);
        if (binOp === '+') {
            // number + number
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue + rightValue;

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
                return new Date(leftValue.getTime() + rightValue);
            } else if (typeof leftValue === 'number' && rightValue instanceof Date) {
                return new Date(leftValue + rightValue.getTime());
            }
        } else if (binOp === '-') {
            // number - number
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue - rightValue;

            // datetime - datetime
            } else if (leftValue instanceof Date && rightValue instanceof Date) {
                return leftValue - rightValue;
            }
        } else if (binOp === '*') {
            // number * number
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue * rightValue;
            }
        } else if (binOp === '/') {
            // number / number
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue / rightValue;
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
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue === rightValue;
            }
            return valueCompare(leftValue, rightValue) === 0;
        } else if (binOp === '!=') {
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue !== rightValue;
            }
            return valueCompare(leftValue, rightValue) !== 0;
        } else if (binOp === '%') {
            // number % number
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue % rightValue;
            }
        } else if (binOp === '**') {
            // number ** number
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue ** rightValue;
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
    const [exprKey] = Object.keys(expr);
    if (exprKey === 'function') {
        // Is the global/local function async?
        const funcName = expr.function.name;
        const localFuncValue = (locals !== null ? locals[funcName] : undefined);
        const funcValue = (typeof localFuncValue !== 'undefined' ? localFuncValue : (globals !== null ? globals[funcName] : undefined));
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
