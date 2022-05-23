// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

/** @module lib/runtime */

import {defaultMaxStatements, expressionFunctions, scriptFunctions} from './library.js';


/**
 * @typedef {Object} ExecuteScriptOptions
 * @property {module:lib/runtime~FetchFn} [fetchFn] - The URL fetch function
 * @property {module:lib/runtime~LogFn} [logFn] - The log function
 * @property {number} [maxStatements = 1e7] - The maximum number of statements, 0 for no maximum
 */

/**
 * The fetch function
 *
 * @callback FetchFn
 * @param {string} url - The URL to fetch
 * @param {?Object} [init] - The fetch options
 * @returns {Promise} The fetch promise
 */

/**
 * A log function
 *
 * @callback LogFn
 * @param {string} text - The log text
 */


/**
 * Execute a calculation language script.
 *
 * @param {Object} script - The calculation script model
 * @param {Object} [globals = {}] - The global variables
 * @param {module:lib/runtime~ExecuteScriptOptions} [options = null] - The script execution options
 * @returns The calculation script result
 */
export function executeScript(script, globals = {}, options = null) {
    // The statement counter
    let statementCount = 0;
    const maxStatements = (options !== null && 'maxStatements' in options ? options.maxStatements : defaultMaxStatements);
    const statementCounter = () => {
        if (maxStatements !== 0 && ++statementCount > maxStatements) {
            throw new Error(`Exceeded maximum script statements (${maxStatements})`);
        }
    };

    // Execute the script
    const timeBegin = performance.now();
    for (const scriptFuncName of Object.keys(scriptFunctions)) {
        if (!(scriptFuncName in globals)) {
            globals[scriptFuncName] = scriptFunctions[scriptFuncName];
        }
    }
    const result = executeScriptHelper(script.statements, globals, null, options, statementCounter);

    // Report script duration
    if (options !== null && 'logFn' in options) {
        const timeEnd = performance.now();
        options.logFn(`Script executed in ${(timeEnd - timeBegin).toFixed(1)} milliseconds`);
    }

    return result;
}


export function executeScriptHelper(statements, globals, locals, options, statementCounter) {
    // Iterate each script statement
    const labelIndexes = {};
    const statementsLength = statements.length;
    for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
        const statement = statements[ixStatement];
        const [statementKey] = Object.keys(statement);

        // Increment the statement counter
        statementCounter();

        // Assignment?
        if (statementKey === 'assign') {
            const exprValue = evaluateExpression(statement.assign.expr, globals, locals, options);
            if (locals !== null) {
                locals[statement.assign.name] = exprValue;
            } else {
                globals[statement.assign.name] = exprValue;
            }

        // Function?
        } else if (statementKey === 'function') {
            globals[statement.function.name] = (args) => {
                const funcLocals = {};
                if ('args' in statement.function) {
                    const argsLength = args.length;
                    for (let ixArg = 0; ixArg < statement.function.args.length; ixArg++) {
                        funcLocals[statement.function.args[ixArg]] = (ixArg < argsLength ? args[ixArg] : null);
                    }
                }
                return executeScriptHelper(statement.function.statements, globals, funcLocals, options, statementCounter);
            };

        // Jump?
        } else if (statementKey === 'jump') {
            // Evaluate the expression (if any)
            if (!('expr' in statement.jump) || evaluateExpression(statement.jump.expr, globals, locals, options)) {
                // Find the label
                if (statement.jump.label in labelIndexes) {
                    ixStatement = labelIndexes[statement.jump.label];
                } else {
                    const ixLabel = statements.findIndex((stmt) => stmt.label === statement.jump.label);
                    if (ixLabel === -1) {
                        throw new Error(`Jump label "${statement.jump.label}" not found`);
                    }
                    labelIndexes[statement.jump.label] = ixLabel;
                    ixStatement = ixLabel;
                }
            }

        // Return?
        } else if (statementKey === 'return') {
            if ('expr' in statement.return) {
                return evaluateExpression(statement.return.expr, globals, locals, options);
            }
            return null;

        // Expression
        } else if (statementKey === 'expr') {
            evaluateExpression(statement.expr.expr, globals, locals, options);
        }
    }

    return null;
}


/**
 * Evaluate a calculation language expression model.
 *
 * @param {Object} expr - The calculation expression model
 * @param {Object} [globals = {}] - The global variables
 * @param {Object} [locals = null] - The local variables
 * @returns The calculation expression result
 */
export function evaluateExpression(expr, globals = {}, locals = null, options = null) {
    const [exprKey] = Object.keys(expr);

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
        let varValue = locals !== null ? locals[expr.variable] : undefined;
        if (typeof varValue === 'undefined') {
            varValue = globals[expr.variable];
            if (typeof varValue === 'undefined') {
                varValue = null;
            }
        }
        return varValue;

    // Function
    } else if (exprKey === 'function') {
        // "if" built-in function?
        const funcName = expr.function.name;
        if (funcName === 'if') {
            const [valueExpr = null, trueExpr = null, falseExpr = null] = expr.function.args;
            const value = (valueExpr !== null ? evaluateExpression(valueExpr, globals, locals, options) : false);
            const resultExpr = (value ? trueExpr : falseExpr);
            return resultExpr !== null ? evaluateExpression(resultExpr, globals, locals, options) : null;
        }

        // Compute the function arguments
        const funcArgs = 'args' in expr.function
            ? expr.function.args.map((arg) => evaluateExpression(arg, globals, locals, options))
            : null;

        // Global/local function?
        let funcValue = (locals !== null ? (locals[funcName] ?? globals[funcName]) : globals[funcName]) ?? null;
        if (funcValue !== null) {
            if (typeof funcValue === 'function' && funcValue.constructor.name === 'AsyncFunction') {
                throw new Error(`Async function "${funcName}" called within non-async scope`);
            }
            return funcValue(funcArgs, options);
        }

        // Built-in globals accessor function?
        if (funcName === 'getGlobal') {
            const [name] = funcArgs;
            const value = globals[name];
            return typeof value !== 'undefined' ? value : null;
        } else if (funcName === 'setGlobal') {
            const [name, value] = funcArgs;
            globals[name] = value;
            return value;
        }

        // Built-in function?
        funcValue = expressionFunctions[funcName];
        if (typeof funcValue !== 'undefined') {
            return expressionFunctions[funcName](funcArgs);
        }

        throw new Error(`Undefined function "${funcName}"`);

    // Binary expression
    } else if (exprKey === 'binary') {
        const binOp = expr.binary.op;
        const leftValue = evaluateExpression(expr.binary.left, globals, locals);
        if (binOp === '&&') {
            return leftValue && evaluateExpression(expr.binary.right, globals, locals);
        } else if (binOp === '||') {
            return leftValue || evaluateExpression(expr.binary.right, globals, locals);
        }

        const rightValue = evaluateExpression(expr.binary.right, globals, locals);
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
        const value = evaluateExpression(expr.unary.expr, globals, locals);
        if (unaryOp === '!') {
            return !value;
        }
        // else if (unaryOp === '-')
        return -value;
    }

    // Expression group
    // else if (exprKey === 'group')
    return evaluateExpression(expr.group, globals, locals);
}
