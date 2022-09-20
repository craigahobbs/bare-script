// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

/** @module lib/runtimeAsync */

import {CalcScriptParserError, parseScript} from './parser.js';
import {CalcScriptRuntimeError, evaluateExpression, executeScriptHelper} from './runtime.js';
import {defaultMaxStatements, expressionFunctions, scriptFunctions} from './library.js';


/* eslint-disable no-await-in-loop */


/**
 * Execute a CalcScript model asynchronously.
 * Use this form of the function if you have any global asynchronous functions.
 *
 * @async
 * @param {Object} script - The [CalcScript model]{@link https://craigahobbs.github.io/calc-script/model/#var.vName='CalcScript'}
 * @param {Object} [options = {}] - The [script execution options]{@link module:lib/runtime~ExecuteScriptOptions}
 * @returns The script result
 * @throws [CalcScriptRuntimeError]{@link module:lib/runtime.CalcScriptRuntimeError}
 */
export async function executeScriptAsync(script, options = {}) {
    let {globals = null} = options;
    if (globals === null) {
        globals = {};
        options.globals = globals;
    }

    // Execute the script
    const timeBegin = performance.now();
    for (const scriptFuncName of Object.keys(scriptFunctions)) {
        if (!(scriptFuncName in globals)) {
            globals[scriptFuncName] = scriptFunctions[scriptFuncName];
        }
    }
    options.statementCount = 0;
    const result = await executeScriptHelperAsync(script.statements, options, null);

    // Report script duration
    if ('logFn' in options) {
        const timeEnd = performance.now();
        options.logFn(`Script executed in ${(timeEnd - timeBegin).toFixed(1)} milliseconds`);
    }

    return result;
}


async function executeScriptHelperAsync(statements, options, locals) {
    const {globals} = options;

    // Iterate each script statement
    let labelIndexes = null;
    const statementsLength = statements.length;
    for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
        const statement = statements[ixStatement];
        const [statementKey] = Object.keys(statement);

        // Increment the statement counter
        const maxStatements = options.maxStatements ?? defaultMaxStatements;
        if (maxStatements > 0 && ++options.statementCount > maxStatements) {
            throw new CalcScriptRuntimeError(`Exceeded maximum script statements (${maxStatements})`);
        }

        // Expression?
        if (statementKey === 'expr') {
            const exprValue = await evaluateExpressionAsync(statement.expr.expr, options, locals, false);
            if ('name' in statement.expr) {
                if (locals !== null) {
                    locals[statement.expr.name] = exprValue;
                } else {
                    globals[statement.expr.name] = exprValue;
                }
            }

        // Jump?
        } else if (statementKey === 'jump') {
            // Evaluate the expression (if any)
            if (!('expr' in statement.jump) || await evaluateExpressionAsync(statement.jump.expr, options, locals, false)) {
                // Find the label
                if (labelIndexes !== null && statement.jump.label in labelIndexes) {
                    ixStatement = labelIndexes[statement.jump.label];
                } else {
                    const ixLabel = statements.findIndex((stmt) => stmt.label === statement.jump.label);
                    if (ixLabel === -1) {
                        throw new CalcScriptRuntimeError(`Unknown jump label "${statement.jump.label}"`);
                    }
                    if (labelIndexes === null) {
                        labelIndexes = {};
                    }
                    labelIndexes[statement.jump.label] = ixLabel;
                    ixStatement = ixLabel;
                }
            }

        // Return?
        } else if (statementKey === 'return') {
            if ('expr' in statement.return) {
                return evaluateExpressionAsync(statement.return.expr, options, locals, false);
            }
            return null;

        // Function?
        } else if (statementKey === 'function') {
            if (statement.function.async) {
                // eslint-disable-next-line require-await
                globals[statement.function.name] = async (args, fnOptions) => {
                    const funcLocals = {};
                    if ('args' in statement.function) {
                        const argsLength = args.length;
                        for (let ixArg = 0; ixArg < statement.function.args.length; ixArg++) {
                            funcLocals[statement.function.args[ixArg]] = (ixArg < argsLength ? args[ixArg] : null);
                        }
                    }
                    return executeScriptHelperAsync(statement.function.statements, fnOptions, funcLocals);
                };
            } else {
                globals[statement.function.name] = (args, fnOptions) => {
                    const funcLocals = {};
                    if ('args' in statement.function) {
                        const argsLength = args.length;
                        for (let ixArg = 0; ixArg < statement.function.args.length; ixArg++) {
                            funcLocals[statement.function.args[ixArg]] = (ixArg < argsLength ? args[ixArg] : null);
                        }
                    }
                    return executeScriptHelper(statement.function.statements, fnOptions, funcLocals);
                };
            }

        // Include?
        } else if (statementKey === 'include') {
            const includeURL = ('urlFn' in options ? options.urlFn(statement.include) : statement.include);
            const fetchFn = (options !== null && 'fetchFn' in options ? options.fetchFn : null);
            const scriptResponse = (fetchFn !== null ? await options.fetchFn(includeURL) : null);
            let errorMessage = (scriptResponse !== null && !scriptResponse.ok ? scriptResponse.statusText : null);
            let scriptModel = null;
            if (scriptResponse !== null && scriptResponse.ok) {
                let scriptText = null;
                try {
                    scriptText = await scriptResponse.text();
                } catch (error) {
                    errorMessage = error.message;
                }
                try {
                    if (scriptText !== null) {
                        scriptModel = parseScript(scriptText);
                    }
                } catch (error) {
                    throw new CalcScriptParserError(
                        error.error, error.line, error.columnNumber, error.lineNumber, `Included from "${includeURL}"`
                    );
                }
            }
            if (scriptModel === null) {
                throw new CalcScriptRuntimeError(
                    `Include of "${statement.include}" failed${errorMessage !== null ? ` with error: ${errorMessage}` : ''}`
                );
            }
            const includeOptions = {...options};
            includeOptions.urlFn = (url) => (isRelativeURL(url) ? `${getBaseURL(includeURL)}${url}` : url);
            await executeScriptHelperAsync(scriptModel.statements, includeOptions, null);
        }
    }

    return null;
}


export function isRelativeURL(url) {
    return !rNotRelativeURL.test(url);
}

const rNotRelativeURL = /^(?:[a-z]+:|\/|\?|#)/;


export function getBaseURL(url) {
    return url.slice(0, url.lastIndexOf('/') + 1);
}


/**
 * Evaluate an expression model asynchronously.
 * Use this form of the function if you have any asynchronous functions.
 *
 * @async
 * @param {Object} expr - The [expression model]{@link https://craigahobbs.github.io/calc-script/model/#var.vName='Expression'}
 * @param {?Object} [options = null] - The [script execution options]{@link module:lib/runtime~ExecuteScriptOptions}
 * @param {?Object} [locals = null] - The local variables
 * @param {boolean} [builtins = true] - If true, include the
 *     [built-in expression functions]{@link https://craigahobbs.github.io/calc-script/library/expression.html}
 * @returns The expression result
 * @throws [CalcScriptRuntimeError]{@link module:lib/runtime.CalcScriptRuntimeError}
 */
export async function evaluateExpressionAsync(expr, options = null, locals = null, builtins = true) {
    const [exprKey] = Object.keys(expr);
    const globals = (options !== null ? (options.globals ?? null) : null);

    // If this expression does not require async then evaluate non-async
    const hasSubExpr = (exprKey !== 'number' && exprKey !== 'string' && exprKey !== 'variable');
    if (hasSubExpr && !isAsyncExpr(expr, globals, locals)) {
        return evaluateExpression(expr, options, locals, builtins);
    }

    // Number
    if (exprKey === 'number') {
        return expr.number;

    // String
    } else if (exprKey === 'string') {
        return expr.string;

    // Variable
    } else if (exprKey === 'variable') {
        // Keywords
        if (expr.variable === 'null') {
            return null;
        } else if (expr.variable === 'false') {
            return false;
        } else if (expr.variable === 'true') {
            return true;
        }

        // Get the local or global variable value or null if undefined
        let varValue = (locals !== null ? locals[expr.variable] : undefined);
        if (typeof varValue === 'undefined') {
            varValue = (globals !== null ? (globals[expr.variable] ?? null) : null);
        }
        return varValue;

    // Function
    } else if (exprKey === 'function') {
        // "if" built-in function?
        const funcName = expr.function.name;
        if (funcName === 'if') {
            const [valueExpr, trueExpr = null, falseExpr = null] = expr.function.args;
            const value = await evaluateExpressionAsync(valueExpr, options, locals, builtins);
            const resultExpr = (value ? trueExpr : falseExpr);
            return resultExpr !== null ? evaluateExpressionAsync(resultExpr, options, locals, builtins) : null;
        }

        // Compute the function arguments
        const funcArgs = 'args' in expr.function
            ? await Promise.all(expr.function.args.map((arg) => evaluateExpressionAsync(arg, options, locals, builtins)))
            : null;

        // Global/local function?
        let funcValue = (locals !== null ? locals[funcName] : undefined);
        if (typeof funcValue === 'undefined') {
            /* c8 ignore next */
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
                if (error instanceof CalcScriptRuntimeError) {
                    throw error;
                }

                // Log and return null
                if (options !== null && 'logFn' in options) {
                    options.logFn(`Error: Function "${funcName}" failed with error: ${error.message}`);
                }
                return null;
            }
        }

        throw new CalcScriptRuntimeError(`Undefined function "${funcName}"`);

    // Binary expression
    } else if (exprKey === 'binary') {
        const binOp = expr.binary.op;
        const leftValue = await evaluateExpressionAsync(expr.binary.left, options, locals, builtins);

        // Short-circuiting binary operators - evaluate right expression only if necessary
        if (binOp === '&&') {
            return leftValue && evaluateExpressionAsync(expr.binary.right, options, locals, builtins);
        } else if (binOp === '||') {
            return leftValue || evaluateExpressionAsync(expr.binary.right, options, locals, builtins);
        }

        // Non-short-circuiting binary operators
        const rightValue = await evaluateExpressionAsync(expr.binary.right, options, locals, builtins);
        if (binOp === '**') {
            return leftValue ** rightValue;
        } else if (binOp === '*') {
            return leftValue * rightValue;
        } else if (binOp === '/') {
            return leftValue / rightValue;
        } else if (binOp === '%') {
            return leftValue % rightValue;
        } else if (binOp === '+') {
            return leftValue + rightValue;
        } else if (binOp === '-') {
            return leftValue - rightValue;
        } else if (binOp === '<=') {
            return leftValue <= rightValue;
        } else if (binOp === '<') {
            return leftValue < rightValue;
        } else if (binOp === '>=') {
            return leftValue >= rightValue;
        } else if (binOp === '>') {
            return leftValue > rightValue;
        } else if (binOp === '==') {
            return leftValue === rightValue;
        }
        // else if (binOp === '!=')
        return leftValue !== rightValue;

    // Unary expression
    } else if (exprKey === 'unary') {
        const unaryOp = expr.unary.op;
        const value = await evaluateExpressionAsync(expr.unary.expr, options, locals, builtins);
        if (unaryOp === '!') {
            return !value;
        }
        // else if (unaryOp === '-')
        return -value;
    }

    // Expression group
    // else if (exprKey === 'group')
    return evaluateExpressionAsync(expr.group, options, locals, builtins);
}


function isAsyncExpr(expr, globals, locals) {
    const [exprKey] = Object.keys(expr);
    if (exprKey === 'function') {
        // Is the global/local function async?
        const funcName = expr.function.name;
        const localFuncValue = (locals !== null ? locals[funcName] : undefined);
        const funcValue = (typeof localFuncValue !== 'undefined' ? localFuncValue : (globals !== null ? globals[funcName] : undefined));
        if (typeof funcValue === 'function' && funcValue.constructor.name === 'AsyncFunction') {
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
