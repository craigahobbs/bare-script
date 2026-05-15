// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/runtime */

import {ValueArgsError, valueBoolean, valueCompare, valueString} from './value.js';
import {expressionFunctions, scriptFunctions} from './library.js';


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
    return executeScriptHelper(script, script.statements, options, null);
}


function executeScriptHelper(script, statements, options, locals) {
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
            const exprValue = evaluateExpression(stmtExpr.expr, options, locals, false, script, statement);
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
                valueBoolean(evaluateExpression(stmtJump.expr, options, locals, false, script, statement))) {
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
                return evaluateExpression(stmtReturn.expr, options, locals, false, script, statement);
            }
            return null;

        // Function?
        } else if (statementKey === 'function') {
            const stmtFunction = statement.function;
            globals[stmtFunction.name] = (args, fnOptions) => scriptFunction(script, stmtFunction, args, fnOptions);

        // Include?
        } else if (statementKey === 'include') {
            throw new BareScriptRuntimeError(script, statement, `Include of "${statement.include.includes[0].url}" within non-async scope`);
        }
    }

    return null;
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
export function scriptFunction(script, function_, args, options) {
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
    return executeScriptHelper(script, function_.statements, options, funcLocals);
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
    const [exprKey] = Object.keys(expr);
    const globals = (options !== null ? (options.globals ?? null) : null);

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
            const [valueExpr = null, trueExpr = null, falseExpr = null] = func.args ?? [];
            const value = (valueExpr !== null ? evaluateExpression(valueExpr, options, locals, builtins, script, statement) : false);
            const resultExpr = (valueBoolean(value) ? trueExpr : falseExpr);
            return resultExpr !== null ? evaluateExpression(resultExpr, options, locals, builtins, script, statement) : null;
        }

        // Compute the function arguments
        const argExprs = func.args ?? null;
        let funcArgs = null;
        if (argExprs !== null) {
            const numArgs = argExprs.length;
            funcArgs = new Array(numArgs);
            for (let ixArg = 0; ixArg < numArgs; ixArg++) {
                funcArgs[ixArg] = evaluateExpression(argExprs[ixArg], options, locals, builtins, script, statement);
            }
        }

        // Global/local function?
        let funcValue = (locals !== null ? locals[funcName] : undefined);
        if (typeof funcValue === 'undefined') {
            funcValue = (globals !== null ? globals[funcName] : undefined);
            if (typeof funcValue === 'undefined') {
                funcValue = (builtins ? (expressionFunctions[funcName] ?? null) : null);
            }
        }
        if (funcValue !== null) {
            // Async function called within non-async execution?
            if (typeof funcValue === 'function' && funcValue.constructor === AsyncFunction) {
                throw new BareScriptRuntimeError(script, statement, `Async function "${funcName}" called within non-async scope`);
            }

            // Call the function
            try {
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
        const leftValue = evaluateExpression(binary.left, options, locals, builtins, script, statement);

        // Short-circuiting "and" binary operator
        if (binOp === '&&') {
            if (!valueBoolean(leftValue)) {
                return leftValue;
            }
            return evaluateExpression(binary.right, options, locals, builtins, script, statement);

        // Short-circuiting "or" binary operator
        } else if (binOp === '||') {
            if (valueBoolean(leftValue)) {
                return leftValue;
            }
            return evaluateExpression(binary.right, options, locals, builtins, script, statement);
        }

        // Non-short-circuiting binary operators
        const rightValue = evaluateExpression(binary.right, options, locals, builtins, script, statement);
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
        const value = evaluateExpression(unary.expr, options, locals, builtins, script, statement);
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
    return evaluateExpression(expr.group, options, locals, builtins, script, statement);
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
