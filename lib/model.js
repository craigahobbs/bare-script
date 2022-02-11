// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/model */

import {SchemaMarkdownParser} from 'schema-markdown/lib/parser.js';
import {validateType} from 'schema-markdown/lib/schema.js';


// The calc model's Schema Markdown
const calcScriptModelSmd = `\
# The calculation script model
struct CalcScript

    # The calculation script's statements
    CalcStatement[] statements


# A calculation script statement
union CalcStatement

    # An expression
    ExpressionStatement expression

    # A variable assignment
    AssignmentStatement assignment

    # A function definition
    FunctionStatement function

    # A label definition
    string label

    # A jump statement
    JumpStatement jump


# A calculation script expression statement
struct ExpressionStatement

    # If true, await the (async) expression
    optional bool await

    # If true, the expression value is returned
    optional bool return

    # The expression to assign to the variable
    CalcExpr expression


# A calculation script variable assignment statement
struct AssignmentStatement

    # If true, await the (async) expression
    optional bool await

    # The variable name
    string name

    # The expression to assign to the variable
    CalcExpr expression


# A calculation script function statement
struct FunctionStatement

    # If true, the function is defined as async
    optional bool async

    # The function name
    string name

    # The function's argument names
    optional string[len > 0] arguments

    # The function's statements
    CalcStatement[] statements


# A calculation script jump statement
struct JumpStatement

    # The label to jump to
    string label

    # The test expression
    optional CalcExpr expression


# A calculation script expression
union CalcExpr

    # A number literal
    float number

    # A string literal
    string string

    # A variable value
    string variable

    # A function expression
    CalcExprFunction function

    # A binary expression
    CalcExprBinary binary

    # A unary expression
    CalcExprUnary unary

    # An expression group
    CalcExpr group


# A calculation script binary expression
struct CalcExprBinary

    # The binary expression operator
    CalcExprBinaryOperator operator

    # The left expression
    CalcExpr left

    # The right expression
    CalcExpr right


# A calculation script binary expression operator
enum CalcExprBinaryOperator
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


# A calculation script unary expression
struct CalcExprUnary

    # The unary expression operator
    CalcExprUnaryOperator operator

    # The expression
    CalcExpr expr


# A calculation script unary expression operator
enum CalcExprUnaryOperator
    "-"
    "!"


# A calculation script function expression
struct CalcExprFunction

    # The function name
    string name

    # The function arguments
    optional CalcExpr[] arguments
`;


/**
 * The calculation script model
 *
 * @property {string} title - The model's title
 * @property {Object} types - The model's referenced types dictionary
 */
export const calcScriptModel = {
    'title': 'The Calculation Language Model',
    'types': new SchemaMarkdownParser(calcScriptModelSmd).types
};


/**
 * Validate a calculation script model
 *
 * @param {Object} script - The calculation script model
 * @returns {Object} The validated calculation script model
 */
export function validateScript(script) {
    return validateType(calcScriptModel.types, 'CalcScript', script);
}


/**
 * Validate a calculation expression model
 *
 * @param {Object} expr - The calculation expression model
 * @returns {Object} The validated calculation expression model
 */
export function validateExpression(expr) {
    return validateType(calcScriptModel.types, 'CalcExpr', expr);
}
