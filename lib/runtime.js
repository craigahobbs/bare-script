// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/runtime */


// Binary operator map
export const binaryOperators = {
    '**': (left, right) => left ** right,
    '*': (left, right) => left * right,
    '/': (left, right) => left / right,
    '%': (left, right) => left % right,
    '+': (left, right) => left + right,
    '-': (left, right) => left - right,
    '<=': (left, right) => left <= right,
    '<': (left, right) => left < right,
    '>=': (left, right) => left >= right,
    '>': (left, right) => left > right,
    '==': (left, right) => left === right,
    '!=': (left, right) => left !== right,
    '&&': null,
    '||': null
};


// Unary operator map
export const unaryOperators = {
    '!': (value) => !value,
    '-': (value) => -value
};


// Function map (name => fn)
const calcFunctions = {
    'abs': ([number]) => Math.abs(number),
    'acos': ([number]) => Math.acos(number),
    'asin': ([number]) => Math.asin(number),
    'atan': ([number]) => Math.atan(number),
    'atan2': ([number]) => Math.atan2(number),
    'ceil': ([number]) => Math.ceil(number),
    'cos': ([number]) => Math.cos(number),
    'date': ([year, month, day]) => new Date(year, month - 1, day),
    'day': ([datetime]) => datetime.getDate(),
    'encodeURIComponent': ([text]) => encodeURIComponent(text),
    'indexOf': ([text, findText, index = 0]) => text.indexOf(findText, index),
    'fixed': ([number, decimals = 2]) => number.toFixed(decimals),
    'floor': ([number]) => Math.floor(number),
    'hour': ([datetime]) => datetime.getHours(),
    'len': ([text]) => text.length,
    'lower': ([text]) => text.toLowerCase(),
    'ln': ([number]) => Math.log(number),
    'log': ([number, base = 10]) => Math.log(number) / Math.log(base),
    'log10': ([number]) => Math.log10(number),
    'max': (args) => Math.max(...args),
    'min': (args) => Math.min(...args),
    'minute': ([datetime]) => datetime.getMinutes(),
    'month': ([datetime]) => datetime.getMonth() + 1,
    'now': () => new Date(),
    'pi': () => Math.PI,
    'rand': () => Math.random(),
    'replace': ([text, oldText, newText]) => text.replaceAll(oldText, newText),
    'rept': ([text, count]) => text.repeat(count),
    'round': ([number, digits]) => {
        const multiplier = 10 ** digits;
        return Math.round(number * multiplier) / multiplier;
    },
    'second': ([datetime]) => datetime.getSeconds(),
    'sign': ([number]) => Math.sign(number),
    'sin': ([number]) => Math.sin(number),
    'slice': ([text, beginIndex, endIndex]) => text.slice(beginIndex, endIndex),
    'sqrt': ([number]) => Math.sqrt(number),
    'text': ([value]) => `${value}`,
    'tan': ([number]) => Math.tan(number),
    'today': () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },
    'trim': ([text]) => text.trim(),
    'upper': ([text]) => text.toUpperCase(),
    'value': ([text]) => parseFloat(text),
    'year': ([datetime]) => datetime.getFullYear()
};


// Script function map (name => fn)
const scriptFunctions = {
    // Array functions
    'arrayCopy': ([array]) => [...array],
    'arrayGet': ([array, index]) => array[index],
    'arrayIndexOf': ([array, value, index = 0]) => array.indexOf(value, index),
    'arrayJoin': ([array, sep]) => array.join(sep),
    'arrayLength': ([array]) => array.length,
    'arrayNew': ([size = 0, value = 0]) => {
        const array = [];
        for (let ix = 0; ix < size; ix++) {
            array.push(value);
        }
        return array;
    },
    'arrayPush': ([array, ...values]) => array.push(...values),
    'arraySet': ([array, index, value]) => {
        array[index] = value;
    },
    'arraySize': ([size = 0, value = 0]) => new Array(size).fill(value),
    'arraySplit': ([text, sep]) => text.split(sep),

    // Object functions
    'objectCopy': ([obj]) => ({...obj}),
    'objectDelete': ([obj, key]) => {
        delete obj[key];
    },
    'objectGet': ([obj, key]) => obj[key],
    'objectKeys': ([obj]) => Object.keys(obj),
    'objectNew': () => ({}),
    'objectSet': ([obj, key, value]) => {
        obj[key] = value;
    }
};


/**
 * Execute a calculation language script
 *
 * @param {Object} script - The calculation script model
 * @param {Object} [globals = {}] - The global variables
 * @param {number} [maxStatements = 1e7] - The maximum number of statements, 0 for no maximum
 * @returns The calculation script result
 */
export function executeScript(script, globals = {}, maxStatements = 1e7) {
    // The statement counter
    let statementCount = 0;
    const statementCounter = () => {
        if (maxStatements !== 0 && ++statementCount > maxStatements) {
            throw new Error(`Exceeded maximum script statements (${maxStatements})`);
        }
    };

    // Execute the script
    for (const scriptFuncName of Object.keys(scriptFunctions)) {
        if (!(scriptFuncName in globals)) {
            globals[scriptFuncName] = scriptFunctions[scriptFuncName];
        }
    }
    return executeScriptHelper(script.statements, globals, null, statementCounter);
}


export function executeScriptHelper(statements, globals, locals, statementCounter) {
    // Iterate each script statement
    const labelIndexes = {};
    const statementsLength = statements.length;
    for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
        const statement = statements[ixStatement];
        const [statementKey] = Object.keys(statement);

        // Increment the statement counter
        statementCounter();

        // Assignment?
        if (statementKey === 'assignment') {
            const assignStatement = statement.assignment;
            const exprValue = evaluateExpression(assignStatement.expression, globals, locals);
            if (locals !== null) {
                locals[assignStatement.name] = exprValue;
            } else {
                globals[assignStatement.name] = exprValue;
            }

        // Function?
        } else if (statementKey === 'function') {
            const funcStatement = statement.function;
            const funcArgs = funcStatement.arguments;
            const funcArgsLength = (typeof funcArgs !== 'undefined' ? funcArgs.length : 0);
            globals[funcStatement.name] = (args) => {
                const funcLocals = {};
                if (funcArgsLength) {
                    const argsLength = args.length;
                    for (let ixArg = 0; ixArg < funcArgsLength; ixArg++) {
                        funcLocals[funcArgs[ixArg]] = (ixArg < argsLength ? args[ixArg] : null);
                    }
                }
                return executeScriptHelper(funcStatement.statements, globals, funcLocals, statementCounter);
            };

        // Jump?
        } else if (statementKey === 'jump') {
            // Evaluate the expression (if any)
            const jumpStatement = statement.jump;
            const jumpExpr = jumpStatement.expression;
            if (typeof jumpExpr === 'undefined' || evaluateExpression(jumpExpr, globals, locals)) {
                // Find the label
                const jumpLabel = jumpStatement.label;
                let ixJump = labelIndexes[jumpLabel];
                if (typeof ixJump === 'undefined') {
                    ixJump = statements.findIndex((stmt) => stmt.label === jumpLabel);
                    if (ixJump === -1) {
                        throw new Error(`Jump label "${jumpLabel}" not found`);
                    }
                    labelIndexes[jumpLabel] = ixJump;
                }

                // Set the new execution statement index
                ixStatement = ixJump;
            }

        // Return?
        } else if (statementKey === 'return') {
            return evaluateExpression(statement.return, globals, locals);

        // Expression
        } else if (statementKey === 'expression') {
            evaluateExpression(statement.expression, globals, locals);
        }
    }

    return null;
}


/**
 * Evaluate a calculation language expression model
 *
 * @param {Object} expr - The calculation expression model
 * @param {Object} [globals = {}] - The global variables
 * @param {Object} [locals = null] - The local variables
 * @returns The calculation expression result
 */
export function evaluateExpression(expr, globals = {}, locals = null) {
    const [exprKey] = Object.keys(expr);

    // Number
    if (exprKey === 'number') {
        return expr.number;

    // String
    } else if (exprKey === 'string') {
        return expr.string;

    // Variable
    } else if (exprKey === 'variable') {
        // "null" is a keyword
        const varName = expr.variable;
        if (varName === 'null') {
            return null;
        }

        // Get the local or global variable value or null if undefined
        let varValue = locals !== null ? locals[varName] : undefined;
        if (typeof varValue === 'undefined') {
            varValue = globals[varName];
        }
        return typeof varValue !== 'undefined' ? varValue : null;

    // Function
    } else if (exprKey === 'function') {
        // "if" built-in function?
        const funcExpr = expr.function;
        const funcName = funcExpr.name;
        if (funcName === 'if') {
            const [valueExpr = null, trueExpr = null, falseExpr = null] = funcExpr.arguments;
            const value = (valueExpr !== null ? evaluateExpression(valueExpr, globals, locals) : false);
            const resultExpr = (value ? trueExpr : falseExpr);
            return resultExpr !== null ? evaluateExpression(resultExpr, globals, locals) : null;
        }

        // Compute the function arguments
        const funcArgExprs = funcExpr.arguments;
        const funcArgs = typeof funcArgExprs !== 'undefined' ? funcArgExprs.map((arg) => evaluateExpression(arg, globals, locals)) : null;

        // Global/local function?
        let funcValue = locals !== null ? locals[funcName] : undefined;
        if (typeof funcValue === 'undefined') {
            funcValue = globals[funcName];
        }
        if (typeof funcValue !== 'undefined') {
            return funcValue(funcArgs);
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
        funcValue = calcFunctions[funcName];
        if (typeof funcValue !== 'undefined') {
            return calcFunctions[funcName](funcArgs);
        }

        throw new Error(`Undefined function "${funcName}"`);

    // Binary expression
    } else if (exprKey === 'binary') {
        const binExpr = expr.binary;
        if (binExpr.operator === '&&') {
            return evaluateExpression(binExpr.left, globals, locals) && evaluateExpression(binExpr.right, globals, locals);
        } else if (binExpr.operator === '||') {
            return evaluateExpression(binExpr.left, globals, locals) || evaluateExpression(binExpr.right, globals, locals);
        }
        return binaryOperators[binExpr.operator](
            evaluateExpression(binExpr.left, globals, locals),
            evaluateExpression(binExpr.right, globals, locals)
        );

    // Unary expression
    } else if (exprKey === 'unary') {
        const value = evaluateExpression(expr.unary.expr, globals, locals);
        return unaryOperators[expr.unary.operator](value);
    }

    // Expression group
    // else if (exprKey === 'group')
    return evaluateExpression(expr.group, globals, locals);
}
