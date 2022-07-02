// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

/** @module lib/model */

import {SchemaMarkdownParser} from 'schema-markdown/lib/parser.js';
import {validateType} from 'schema-markdown/lib/schema.js';


// The calc model's Schema Markdown
const calcScriptSmd = `\
# The calc-script model
struct CalcScript

    # The script's statements
    ScriptStatement[] statements


# A script statement
union ScriptStatement

    # An expression
    ExpressionStatement expr

    # A variable assignment
    AssignmentStatement assign

    # A function definition
    FunctionStatement function

    # A label definition
    string label

    # A jump statement
    JumpStatement jump

    # A return statement
    ReturnStatement return

    # An include statement
    IncludeStatement include


# A return statement
struct ReturnStatement

    # The expression to return
    optional Expression expr


# A script expression statement
struct ExpressionStatement

    # The expression to evaluate
    Expression expr


# A script variable assignment statement
struct AssignmentStatement

    # The variable name
    string name

    # The expression to assign to the variable
    Expression expr


# A script function statement
struct FunctionStatement

    # If true, the function is defined as async
    optional bool async

    # The function name
    string name

    # The function's argument names
    optional string[len > 0] args

    # The function's statements
    ScriptStatement[] statements


# A script jump statement
struct JumpStatement

    # The label to jump to
    string label

    # The test expression
    optional Expression expr


# An include statement
struct IncludeStatement

    # The resource URL
    string url


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
    "**"
    "*"
    "/"
    "%"
    "+"
    "-"
    "<="
    "<"
    ">="
    ">"
    "=="
    "!="
    "&&"
    "||"


# A unary expression
struct UnaryExpression

    # The unary expression operator
    UnaryExpressionOperator op

    # The expression
    Expression expr


# A unary expression operator
enum UnaryExpressionOperator
    "-"
    "!"


# A function expression
struct FunctionExpression

    # The function name
    string name

    # The function arguments
    optional Expression[] args
`;


/**
 * The calc-script model
 *
 * @property {string} title - The model's title
 * @property {Object} types - The model's referenced types dictionary
 */
export const calcScriptTypes = (new SchemaMarkdownParser(calcScriptSmd)).types;


/**
 * Validate a calc-script model
 *
 * @param {Object} script - The calc-script model
 * @returns {Object} The validated calc-script model
 */
export function validateScript(script) {
    return validateType(calcScriptTypes, 'CalcScript', script);
}


/**
 * Validate a calculation expression model
 *
 * @param {Object} expr - The calculation expression model
 * @returns {Object} The validated calculation expression model
 */
export function validateExpression(expr) {
    return validateType(calcScriptTypes, 'Expression', expr);
}
