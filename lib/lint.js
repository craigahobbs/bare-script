// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/lint */


/**
 * Lint a BareScript script model
 *
 * @param {Object} script - The [BareScript model](./model/#var.vName='BareScript')
 * @param {?Object} globals - The script global variables
 * @returns {string[]} The array of lint warnings
 */
export function lintScript(script, globals = null) {
    const warnings = [];
    const {statements} = script;

    // Empty script?
    if (statements.length === 0) {
        lintScriptWarning(warnings, script, null, 'Empty script');
    }

    // Variable used before assignment? Script-derived names are tracked in null-prototype
    // objects so names like "__proto__" are own keys, matching the Python implementation
    const varAssigns = Object.create(null);
    const varUses = Object.create(null);
    getVariableAssignmentsAndUses(statements, varAssigns, varUses);
    for (const varName of Object.keys(varAssigns)) {
        if (varName in varUses && varUses[varName] <= varAssigns[varName]) {
            lintScriptWarning(warnings, script, statements[varUses[varName]], `Global variable "${varName}" used before assignment`);
        }
    }

    // Unknown global variable?
    if (globals !== null) {
        for (const varName of Object.keys(varUses).sort()) {
            if (!(varName in varAssigns) && !Object.hasOwn(globals, varName) && !builtinGlobals.has(varName)) {
                lintScriptWarning(warnings, script, statements[varUses[varName]], `Unknown global variable "${varName}"`);
            }
        }
    }

    // Iterate global statements
    const functionsDefined = Object.create(null);
    const labelsDefined = Object.create(null);
    const labelsUsed = Object.create(null);
    for (const [ixStatement, statement] of statements.entries()) {
        const [statementKey] = Object.keys(statement);

        // Function definition checks
        if (statementKey === 'function') {
            // Function redefinition?
            if (statement.function.name in functionsDefined) {
                lintScriptWarning(warnings, script, statement, `Redefinition of function "${statement.function.name}"`);
            } else {
                functionsDefined[statement.function.name] = ixStatement;
            }

            // Variable used before assignment?
            const fnVarAssigns = Object.create(null);
            const fnVarUses = Object.create(null);
            const args = (statement.function.args ?? null);
            const fnStatements = statement.function.statements;
            getVariableAssignmentsAndUses(fnStatements, fnVarAssigns, fnVarUses);
            for (const varName of Object.keys(fnVarAssigns)) {
                // Ignore re-assigned function arguments
                if (args !== null && args.indexOf(varName) !== -1) {
                    continue;
                }
                if (varName in fnVarUses && fnVarUses[varName] <= fnVarAssigns[varName]) {
                    lintScriptWarning(
                        warnings, script, fnStatements[fnVarUses[varName]],
                        `Variable "${varName}" of function "${statement.function.name}" used before assignment`
                    );
                }
            }

            // Unused variables?
            for (const varName of Object.keys(fnVarAssigns)) {
                if (!(varName in fnVarUses)) {
                    lintScriptWarning(
                        warnings, script, fnStatements[fnVarAssigns[varName]],
                        `Unused variable "${varName}" defined in function "${statement.function.name}"`
                    );
                }
            }

            // Unknown global variable?
            if (globals !== null) {
                for (const varName of Object.keys(fnVarUses).sort()) {
                    if (!(varName in fnVarAssigns) && (args === null || args.indexOf(varName) === -1) &&
                        !Object.hasOwn(globals, varName) && !builtinGlobals.has(varName)) {
                        lintScriptWarning(
                            warnings, script, fnStatements[fnVarUses[varName]], `Unknown global variable "${varName}"`
                        );
                    }
                }
            }

            // Function argument checks
            if (args !== null) {
                const argsDefined = new Set();
                for (const arg of args) {
                    // Duplicate argument?
                    if (argsDefined.has(arg)) {
                        lintScriptWarning(
                            warnings, script, statement, `Duplicate argument "${arg}" of function "${statement.function.name}"`
                        );
                    } else {
                        argsDefined.add(arg);

                        // Unused argument?
                        if (!(arg in fnVarUses)) {
                            lintScriptWarning(
                                warnings, script, statement, `Unused argument "${arg}" of function "${statement.function.name}"`
                            );
                        }
                    }
                }
            }

            // Iterate function statements
            const fnLabelsDefined = Object.create(null);
            const fnLabelsUsed = Object.create(null);
            let hasAsyncStatement = false;
            for (const [ixFnStatement, fnStatement] of fnStatements.entries()) {
                const [fnStatementKey] = Object.keys(fnStatement);

                // Any async statements?
                if (globals !== null) {
                    hasAsyncStatement ||= isAsyncStatement(fnStatement, globals, statement.function.async ?? false);
                }

                // Function expression statement checks
                if (fnStatementKey === 'expr') {
                    // Pointless function expression statement?
                    if (!('name' in fnStatement.expr) && isPointlessExpression(fnStatement.expr.expr)) {
                        lintScriptWarning(warnings, script, statement, `Pointless statement in function "${statement.function.name}"`);
                    }

                // Function label statement checks
                } else if (fnStatementKey === 'label') {
                    // Label redefinition?
                    const fnStatementLabel = fnStatement.label.name;
                    if (fnStatementLabel in fnLabelsDefined) {
                        lintScriptWarning(
                            warnings, script, statement,
                            `Redefinition of label "${fnStatementLabel}" in function "${statement.function.name}"`
                        );
                    } else {
                        fnLabelsDefined[fnStatementLabel] = ixFnStatement;
                    }

                // Function jump statement checks
                } else if (fnStatementKey === 'jump') {
                    if (!(fnStatement.jump.label in fnLabelsUsed)) {
                        fnLabelsUsed[fnStatement.jump.label] = ixFnStatement;
                    }
                }
            }

            // Unused function labels?
            for (const label of Object.keys(fnLabelsDefined)) {
                if (!(label in fnLabelsUsed)) {
                    lintScriptWarning(warnings, script, statement, `Unused label "${label}" in function "${statement.function.name}"`);
                }
            }

            // Unknown function labels?
            for (const label of Object.keys(fnLabelsUsed)) {
                if (!(label in fnLabelsDefined)) {
                    lintScriptWarning(warnings, script, statement, `Unknown label "${label}" in function "${statement.function.name}"`);
                }
            }

            // Async function issues?
            if (globals !== null) {
                if (statement.function.async && !hasAsyncStatement) {
                    lintScriptWarning(warnings, script, statement, `Unecessary async function "${statement.function.name}"`);
                } else if (!statement.function.async && hasAsyncStatement) {
                    lintScriptWarning(warnings, script, statement, `Function "${statement.function.name}" requires async`);
                }
            }

        // Global expression statement checks
        } else if (statementKey === 'expr') {
            // Pointless global expression statement?
            if (!('name' in statement.expr) && isPointlessExpression(statement.expr.expr)) {
                lintScriptWarning(warnings, script, statement, 'Pointless global statement');
            }

        // Global label statement checks
        } else if (statementKey === 'label') {
            // Label redefinition?
            const statementLabel = statement.label.name;
            if (statementLabel in labelsDefined) {
                lintScriptWarning(warnings, script, statement, `Redefinition of global label "${statementLabel}"`);
            } else {
                labelsDefined[statementLabel] = ixStatement;
            }

        // Global jump statement checks
        } else if (statementKey === 'jump') {
            if (!(statement.jump.label in labelsUsed)) {
                labelsUsed[statement.jump.label] = ixStatement;
            }
        }
    }

    // Unused global labels?
    for (const label of Object.keys(labelsDefined)) {
        if (!(label in labelsUsed)) {
            lintScriptWarning(warnings, script, statements[labelsDefined[label]], `Unused global label "${label}"`);
        }
    }

    // Unknown global labels?
    for (const label of Object.keys(labelsUsed)) {
        if (!(label in labelsDefined)) {
            lintScriptWarning(warnings, script, statements[labelsUsed[label]], `Unknown global label "${label}"`);
        }
    }

    return warnings;
}


// Builtin global variable names
const builtinGlobals = new Set(['false', 'if', 'null', 'true']);


// Helper to format static analysis warnings
function lintScriptWarning(warnings, script, statement, message) {
    const scriptName = script.scriptName ?? '';
    const lineno = (statement !== null ? (statement[Object.keys(statement)[0]].lineNumber ?? 1) : 1);
    warnings.push(`${scriptName}:${lineno}: ${message}`);
}


// Helper function to determine if an expression statement's expression is pointless
function isPointlessExpression(expr) {
    const [exprKey] = Object.keys(expr);
    if (exprKey === 'function') {
        return false;
    } else if (exprKey === 'binary') {
        return isPointlessExpression(expr.binary.left) && isPointlessExpression(expr.binary.right);
    } else if (exprKey === 'unary') {
        return isPointlessExpression(expr.unary.expr);
    } else if (exprKey === 'group') {
        return isPointlessExpression(expr.group);
    }
    return true;
}


// Helper function to determine if a statement requires async
function isAsyncStatement(statement, globals, isAsyncScope) {
    const [statementKey] = Object.keys(statement);
    if (statementKey === 'expr') {
        return isAsyncExpression(statement.expr.expr, globals, isAsyncScope);
    } else if (statementKey === 'include') {
        return true;
    } else if (statementKey === 'jump') {
        return 'expr' in statement.jump ? isAsyncExpression(statement.jump.expr, globals, isAsyncScope) : false;
    } else if (statementKey === 'return') {
        return 'expr' in statement.return ? isAsyncExpression(statement.return.expr, globals, isAsyncScope) : false;
    }
    return false;
}


// Helper function to determine if an expression statement requires async
function isAsyncExpression(expr, globals, isAsyncScope) {
    const [exprKey] = Object.keys(expr);
    if (exprKey === 'function') {
        // Builtin function?
        const funcName = expr.function.name;
        if (builtinGlobals.has(funcName)) {
            return false;
        }

        // Is function async? Assume unknown OK for the scope
        let isAsync = isAsyncScope;
        const funcValue = (Object.hasOwn(globals, funcName) ? globals[funcName] : null);
        if (typeof funcValue === 'function') {
            isAsync = (funcValue.constructor.name === 'AsyncFunction') ||
                ('args' in expr.function && expr.function.args.some((argExpr) => isAsyncExpression(argExpr, globals, isAsyncScope)));
        }
        return isAsync;
    } else if (exprKey === 'binary') {
        return isAsyncExpression(expr.binary.left, globals, isAsyncScope) || isAsyncExpression(expr.binary.right, globals, isAsyncScope);
    } else if (exprKey === 'unary') {
        return isAsyncExpression(expr.unary.expr, globals, isAsyncScope);
    } else if (exprKey === 'group') {
        return isAsyncExpression(expr.group, globals, isAsyncScope);
    }
    return false;
}


// Helper function to set variable assignments/uses for a statements array
function getVariableAssignmentsAndUses(statements, assigns, uses) {
    for (const [ixStatement, statement] of statements.entries()) {
        const [statementKey] = Object.keys(statement);
        if (statementKey === 'expr') {
            if ('name' in statement.expr) {
                if (!(statement.expr.name in assigns)) {
                    assigns[statement.expr.name] = ixStatement;
                }
            }
            getExpressionVariableUses(statement.expr.expr, uses, ixStatement);
        } else if (statementKey === 'jump' && 'expr' in statement.jump) {
            getExpressionVariableUses(statement.jump.expr, uses, ixStatement);
        } else if (statementKey === 'return' && 'expr' in statement.return) {
            getExpressionVariableUses(statement.return.expr, uses, ixStatement);
        }
    }
}


// Helper function to set variable uses for an expression
function getExpressionVariableUses(expr, uses, ixStatement) {
    const [exprKey] = Object.keys(expr);
    if (exprKey === 'variable') {
        if (!(expr.variable in uses)) {
            uses[expr.variable] = ixStatement;
        }
    } else if (exprKey === 'binary') {
        getExpressionVariableUses(expr.binary.left, uses, ixStatement);
        getExpressionVariableUses(expr.binary.right, uses, ixStatement);
    } else if (exprKey === 'unary') {
        getExpressionVariableUses(expr.unary.expr, uses, ixStatement);
    } else if (exprKey === 'group') {
        getExpressionVariableUses(expr.group, uses, ixStatement);
    } else if (exprKey === 'function') {
        if (!(expr.function.name in uses)) {
            uses[expr.function.name] = ixStatement;
        }
        if ('args' in expr.function) {
            for (const argExpr of expr.function.args) {
                getExpressionVariableUses(argExpr, uses, ixStatement);
            }
        }
    }
}
