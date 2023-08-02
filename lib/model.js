// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

/** @module lib/model */

import {parseSchemaMarkdown} from 'schema-markdown/lib/parser.js';
import {validateType} from 'schema-markdown/lib/schema.js';


/**
 * The CalcScript type model
 */
export const calcScriptTypes = parseSchemaMarkdown(`\
# A CalcScript script
struct CalcScript

    # The script's statements
    ScriptStatement[] statements


# A script statement
union ScriptStatement

    # An expression
    ExpressionStatement expr

    # A jump statement
    JumpStatement jump

    # A return statement
    ReturnStatement return

    # A label definition
    string label

    # A function definition
    FunctionStatement function

    # An include statement
    IncludeStatement include


# An expression statement
struct ExpressionStatement

    # The variable name to assign the expression value
    optional string name

    # The expression to evaluate
    Expression expr


# A jump statement
struct JumpStatement

    # The label to jump to
    string label

    # The test expression
    optional Expression expr


# A return statement
struct ReturnStatement

    # The expression to return
    optional Expression expr


# A function definition statement
struct FunctionStatement

    # If true, the function is defined as async
    optional bool async

    # The function name
    string name

    # The function's argument names
    optional string[len > 0] args

    # The function's statements
    ScriptStatement[] statements


# An include statement
struct IncludeStatement

    # The list of include scripts to load and execute in the global scope
    string[] includes

    # The list of system include scripts to load and execute in the global scope
    string[] systemIncludes


# An expression
union Expression

    # A number literal
    float number

    # A string literal
    string string

    # A variable value
    string variable

    # A function expression
    FunctionExpression function

    # A binary expression
    BinaryExpression binary

    # A unary expression
    UnaryExpression unary

    # An expression group
    Expression group


# A binary expression
struct BinaryExpression

    # The binary expression operator
    BinaryExpressionOperator op

    # The left expression
    Expression left

    # The right expression
    Expression right


# A binary expression operator
enum BinaryExpressionOperator

    # Exponentiation
    "**"

    # Multiplication
    "*"

    # Division
    "/"

    # Remainder
    "%"

    # Addition
    "+"

    # Subtraction
    "-"

    # Less than or equal
    "<="

    # Less than
    "<"

    # Greater than or equal
    ">="

    # Greater than
    ">"

    # Equal
    "=="

    # Not equal
    "!="

    # Logical AND
    "&&"

    # Logical OR
    "||"


# A unary expression
struct UnaryExpression

    # The unary expression operator
    UnaryExpressionOperator op

    # The expression
    Expression expr


# A unary expression operator
enum UnaryExpressionOperator

    # Unary negation
    "-"

    # Logical NOT
    "!"


# A function expression
struct FunctionExpression

    # The function name
    string name

    # The function arguments
    optional Expression[] args
`);


/**
 * Validate a CalcScript script model
 *
 * @param {Object} script - The [CalcScript model]{@link https://craigahobbs.github.io/calc-script/model/#var.vName='CalcScript'}
 * @returns {Object} The validated CalcScript model
 * @throws [ValidationError]{@link https://craigahobbs.github.io/schema-markdown-js/module-lib_schema.ValidationError.html}
 */
export function validateScript(script) {
    return validateType(calcScriptTypes, 'CalcScript', script);
}


/**
 * Validate an expression model
 *
 * @param {Object} expr - The [expression model]{@link https://craigahobbs.github.io/calc-script/model/#var.vName='Expression'}
 * @returns {Object} The validated expression model
 * @throws [ValidationError]{@link https://craigahobbs.github.io/schema-markdown-js/module-lib_schema.ValidationError.html}
 */
export function validateExpression(expr) {
    return validateType(calcScriptTypes, 'Expression', expr);
}


/**
 * Lint a CalcScript script model
 *
 * @param {Object} script - The [CalcScript model]{@link https://craigahobbs.github.io/calc-script/model/#var.vName='CalcScript'}
 * @returns {string[]} The array of lint warnings
 */
export function lintScript(script) {
    const warnings = [];

    // Empty script?
    if (script.statements.length === 0) {
        warnings.push('Empty script');
    }

    // Variable used before assignment?
    const varAssigns = {};
    const varUses = {};
    getVariableAssignmentsAndUses(script.statements, varAssigns, varUses);
    for (const varName of Object.keys(varAssigns)) {
        if (varName in varUses && varUses[varName] <= varAssigns[varName]) {
            warnings.push(
                `Global variable "${varName}" used (index ${varUses[varName]}) before assignment (index ${varAssigns[varName]})`
            );
        }
    }

    // Iterate global statements
    const functionsDefined = {};
    const labelsDefined = {};
    const labelsUsed = {};
    for (const [ixStatement, statement] of script.statements.entries()) {
        const [statementKey] = Object.keys(statement);

        // Function definition checks
        if (statementKey === 'function') {
            // Function redefinition?
            if (statement.function.name in functionsDefined) {
                warnings.push(`Redefinition of function "${statement.function.name}" (index ${ixStatement})`);
            } else {
                functionsDefined[statement.function.name] = ixStatement;
            }

            // Variable used before assignment?
            const fnVarAssigns = {};
            const fnVarUses = {};
            const args = (statement.function.args ?? null);
            getVariableAssignmentsAndUses(statement.function.statements, fnVarAssigns, fnVarUses);
            for (const varName of Object.keys(fnVarAssigns)) {
                // Ignore re-assigned function arguments
                if (args !== null && args.indexOf(varName) !== -1) {
                    continue;
                }
                if (varName in fnVarUses && fnVarUses[varName] <= fnVarAssigns[varName]) {
                    warnings.push(
                        `Variable "${varName}" of function "${statement.function.name}" used (index ${fnVarUses[varName]}) ` +
                            `before assignment (index ${fnVarAssigns[varName]})`
                    );
                }
            }

            // Unused variables?
            for (const varName of Object.keys(fnVarAssigns)) {
                if (!(varName in fnVarUses)) {
                    warnings.push(
                        `Unused variable "${varName}" defined in function "${statement.function.name}" (index ${fnVarAssigns[varName]})`
                    );
                }
            }

            // Function argument checks
            if (args !== null) {
                const argsDefined = new Set();
                for (const arg of args) {
                    // Duplicate argument?
                    if (argsDefined.has(arg)) {
                        warnings.push(`Duplicate argument "${arg}" of function "${statement.function.name}" (index ${ixStatement})`);
                    } else {
                        argsDefined.add(arg);

                        // Unused argument?
                        if (!(arg in fnVarUses)) {
                            warnings.push(`Unused argument "${arg}" of function "${statement.function.name}" (index ${ixStatement})`);
                        }
                    }
                }
            }

            // Iterate function statements
            const fnLabelsDefined = {};
            const fnLabelsUsed = {};
            for (const [ixFnStatement, fnStatement] of statement.function.statements.entries()) {
                const [fnStatementKey] = Object.keys(fnStatement);

                // Function expression statement checks
                if (fnStatementKey === 'expr') {
                    // Pointless function expression statement?
                    if (!('name' in fnStatement.expr) && isPointlessExpression(fnStatement.expr.expr)) {
                        warnings.push(`Pointless statement in function "${statement.function.name}" (index ${ixFnStatement})`);
                    }

                // Function label statement checks
                } else if (fnStatementKey === 'label') {
                    // Label redefinition?
                    if (fnStatement.label in fnLabelsDefined) {
                        warnings.push(
                            `Redefinition of label "${fnStatement.label}" in function "${statement.function.name}" (index ${ixFnStatement})`
                        );
                    } else {
                        fnLabelsDefined[fnStatement.label] = ixFnStatement;
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
                    warnings.push(`Unused label "${label}" in function "${statement.function.name}" (index ${fnLabelsDefined[label]})`);
                }
            }

            // Unknown function labels?
            for (const label of Object.keys(fnLabelsUsed)) {
                if (!(label in fnLabelsDefined)) {
                    warnings.push(`Unknown label "${label}" in function "${statement.function.name}" (index ${fnLabelsUsed[label]})`);
                }
            }

        // Global expression statement checks
        } else if (statementKey === 'expr') {
            // Pointless global expression statement?
            if (!('name' in statement.expr) && isPointlessExpression(statement.expr.expr)) {
                warnings.push(`Pointless global statement (index ${ixStatement})`);
            }

        // Global label statement checks
        } else if (statementKey === 'label') {
            // Label redefinition?
            if (statement.label in labelsDefined) {
                warnings.push(`Redefinition of global label "${statement.label}" (index ${ixStatement})`);
            } else {
                labelsDefined[statement.label] = ixStatement;
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
            warnings.push(`Unused global label "${label}" (index ${labelsDefined[label]})`);
        }
    }

    // Unknown global labels?
    for (const label of Object.keys(labelsUsed)) {
        if (!(label in labelsDefined)) {
            warnings.push(`Unknown global label "${label}" (index ${labelsUsed[label]})`);
        }
    }

    return warnings;
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
