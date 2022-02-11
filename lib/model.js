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


# A calculation language statement
union CalcStatement

    # A variable assignment
    CalcVariableAssignment assignment

    # A function definition
    CalcFunction function

    # A label definition
    string label

    # A jump statement
    CalcJump jump

    # A return statement
    CalcExpr return

    # An expression
    CalcExpr expression


# A calculation language variable assignment statement
struct CalcVariableAssignment

    # The variable name
    string name

    # The expression to assign to the variable
    CalcExpr expression


# A calculation language function statement
struct CalcFunction

    # The function name
    string name

    # The function's argument names
    optional string[len > 0] arguments

    # The function's statements
    CalcStatement[] statements


# A calculation language jump statement
struct CalcJump

    # The label to jump to
    string label

    # The test expression
    optional CalcExpr expression


# A calculation language expression
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


# A calculation language binary expression
struct CalcExprBinary

    # The binary expression operator
    CalcExprBinaryOperator operator

    # The left expression
    CalcExpr left

    # The right expression
    CalcExpr right


# A calculation language binary expression operator
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


# A calculation language unary expression
struct CalcExprUnary

    # The unary expression operator
    CalcExprUnaryOperator operator

    # The expression
    CalcExpr expr


# A calculation language unary expression operator
enum CalcExprUnaryOperator
    "-"
    "!"


# A calculation language function expression
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
