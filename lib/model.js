// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/model */

import {schemaParse, schemaValidate} from './include.js';


/**
 * The BareScript type model
 */
export const barescriptTypes = schemaParse(`\
# A BareScript script
struct BareScript

    # The script's statements
    ScriptStatement[] statements

    # The script name
    optional string scriptName

    # The script's lines
    optional string[] scriptLines

    # If true, this is a system include script
    optional bool system


# A script statement
union ScriptStatement

    # An expression
    ExpressionStatement expr

    # A jump statement
    JumpStatement jump

    # A return statement
    ReturnStatement return

    # A label definition
    LabelStatement label

    # A function definition
    FunctionStatement function

    # An include statement
    IncludeStatement include


# Script statement base struct
struct BaseStatement

    # The script statement's line number
    optional int lineNumber

    # The number of lines in the script statement (default is 1)
    optional int lineCount


# An expression statement
struct ExpressionStatement (BaseStatement)

    # The variable name to assign the expression value
    optional string name

    # The expression to evaluate
    Expression expr


# A jump statement
struct JumpStatement (BaseStatement)

    # The label to jump to
    string label

    # The test expression
    optional Expression expr


# A return statement
struct ReturnStatement (BaseStatement)

    # The expression to return
    optional Expression expr


# A label statement
struct LabelStatement (BaseStatement)

    # The label name
    string name


# A function definition statement
struct FunctionStatement (BaseStatement)

    # If true, the function is defined as async
    optional bool async

    # The function name
    string name

    # The function's argument names
    optional string[len > 0] args

    # If true, the function's last argument is the array of all remaining arguments
    optional bool lastArgArray

    # The function's statements
    ScriptStatement[] statements


# An include statement
struct IncludeStatement (BaseStatement)

    # The list of include scripts to load and execute in the global scope
    IncludeScript[len > 0] includes


# An include script
struct IncludeScript

    # The include script URL
    string url

    # If true, this is a system include
    optional bool system


# The coverage global configuration
struct CoverageGlobal

    # If true, coverage is enabled
    optional bool enabled

    # The map of script name to script coverage
    optional CoverageGlobalScript{} scripts


# The script coverage
struct CoverageGlobalScript

    # The script
    BareScript script

    # The map of script line number string to script statement coverage
    CoverageGlobalStatement{} covered


# The script statement coverage
struct CoverageGlobalStatement

    # The script statement
    ScriptStatement statement

    # The statement's coverage count
    int count


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

    # Bitwise left shift
    "<<"

    # Bitwise right shift
    ">>"

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

    # Bitwise AND
    "&"

    # Bitwise XOR
    "^"

    # Bitwise OR
    "|"

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

    # Bitwise NOT
    "~"


# A function expression
struct FunctionExpression

    # The function name
    string name

    # The function arguments
    optional Expression[] args
`);


/**
 * Validate a BareScript script model
 *
 * @param {Object} script - The [BareScript model](./model/#var.vName='BareScript')
 * @returns {Object} The validated BareScript model
 * @throws [SchemaValidationError]{@link module:lib/include.SchemaValidationError}
 */
export function validateScript(script) {
    return schemaValidate(barescriptTypes, 'BareScript', script);
}


/**
 * Validate an expression model
 *
 * @param {Object} expr - The [expression model](./model/#var.vName='Expression')
 * @returns {Object} The validated expression model
 * @throws [SchemaValidationError]{@link module:lib/include.SchemaValidationError}
 */
export function validateExpression(expr) {
    return schemaValidate(barescriptTypes, 'Expression', expr);
}
