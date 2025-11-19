# The BareScript Runtime Model

## Table of Contents

- [Enums](#var.vPublish=true&var.vSingle=true&enums)
- [Structs](#var.vPublish=true&var.vSingle=true&structs)

---

## Enums

### enum BinaryExpressionOperator

A binary expression operator

| Value | Description           |
|-------|-----------------------|
| **    | Exponentiation        |
| *     | Multiplication        |
| /     | Division              |
| %     | Remainder             |
| +     | Addition              |
| -     | Subtraction           |
| <<    | Bitwise left shift    |
| >>    | Bitwise right shift   |
| <=    | Less than or equal    |
| <     | Less than             |
| >=    | Greater than or equal |
| >     | Greater than          |
| ==    | Equal                 |
| !=    | Not equal             |
| &     | Bitwise AND           |
| ^     | Bitwise XOR           |
| |     | Bitwise OR            |
| &&    | Logical AND           |
| ||    | Logical OR            |

### enum UnaryExpressionOperator

A unary expression operator

| Value | Description    |
|-------|----------------|
| -     | Unary negation |
| !     | Logical NOT    |
| ~     | Bitwise NOT    |

---

## Structs

### struct BareScript

A BareScript script

| Name        | Type                                         | Attributes | Description                              |
|-------------|----------------------------------------------|------------|------------------------------------------|
| statements  | [ScriptStatement](#union-scriptstatement) [] |            | The script's statements                  |
| scriptName  | string                                       | optional   | The script name                          |
| scriptLines | string []                                    | optional   | The script's lines                       |
| system      | bool                                         | optional   | If true, this is a system include script |

### struct BaseStatement

Script statement base struct

| Name       | Type | Attributes | Description                                                |
|------------|------|------------|------------------------------------------------------------|
| lineNumber | int  | optional   | The script statement's line number                         |
| lineCount  | int  | optional   | The number of lines in the script statement (default is 1) |

### struct BinaryExpression

A binary expression

| Name  | Type                                                       | Description                    |
|-------|------------------------------------------------------------|--------------------------------|
| op    | [BinaryExpressionOperator](#enum-binaryexpressionoperator) | The binary expression operator |
| left  | [Expression](#union-expression)                            | The left expression            |
| right | [Expression](#union-expression)                            | The right expression           |

### struct CoverageGlobal

The coverage global configuration

| Name    | Type                                                    | Attributes | Description                               |
|---------|---------------------------------------------------------|------------|-------------------------------------------|
| enabled | bool                                                    | optional   | If true, coverage is enabled              |
| scripts | [CoverageGlobalScript](#struct-coverageglobalscript) {} | optional   | The map of script name to script coverage |

### struct CoverageGlobalScript

The script coverage

| Name    | Type                                                          | Description                                                       |
|---------|---------------------------------------------------------------|-------------------------------------------------------------------|
| script  | [BareScript](#struct-barescript)                              | The script                                                        |
| covered | [CoverageGlobalStatement](#struct-coverageglobalstatement) {} | The map of script line number string to script statement coverage |

### struct CoverageGlobalStatement

The script statement coverage

| Name      | Type                                      | Description                    |
|-----------|-------------------------------------------|--------------------------------|
| statement | [ScriptStatement](#union-scriptstatement) | The script statement           |
| count     | int                                       | The statement's coverage count |

### union Expression

An expression

| Name     | Type                                             | Description           |
|----------|--------------------------------------------------|-----------------------|
| number   | float                                            | A number literal      |
| string   | string                                           | A string literal      |
| variable | string                                           | A variable value      |
| function | [FunctionExpression](#struct-functionexpression) | A function expression |
| binary   | [BinaryExpression](#struct-binaryexpression)     | A binary expression   |
| unary    | [UnaryExpression](#struct-unaryexpression)       | A unary expression    |
| group    | [Expression](#union-expression)                  | An expression group   |

### struct ExpressionStatement

Bases: [BaseStatement](#struct-basestatement)

An expression statement

| Name       | Type                            | Attributes | Description                                                |
|------------|---------------------------------|------------|------------------------------------------------------------|
| lineNumber | int                             | optional   | The script statement's line number                         |
| lineCount  | int                             | optional   | The number of lines in the script statement (default is 1) |
| name       | string                          | optional   | The variable name to assign the expression value           |
| expr       | [Expression](#union-expression) |            | The expression to evaluate                                 |

### struct FunctionExpression

A function expression

| Name | Type                               | Attributes | Description            |
|------|------------------------------------|------------|------------------------|
| name | string                             |            | The function name      |
| args | [Expression](#union-expression) [] | optional   | The function arguments |

### struct FunctionStatement

Bases: [BaseStatement](#struct-basestatement)

A function definition statement

| Name         | Type                                         | Attributes                 | Description                                                                   |
|--------------|----------------------------------------------|----------------------------|-------------------------------------------------------------------------------|
| lineNumber   | int                                          | optional                   | The script statement's line number                                            |
| lineCount    | int                                          | optional                   | The number of lines in the script statement (default is 1)                    |
| async        | bool                                         | optional                   | If true, the function is defined as async                                     |
| name         | string                                       |                            | The function name                                                             |
| args         | string []                                    | optional<br>len(array) > 0 | The function's argument names                                                 |
| lastArgArray | bool                                         | optional                   | If true, the function's last argument is the array of all remaining arguments |
| statements   | [ScriptStatement](#union-scriptstatement) [] |                            | The function's statements                                                     |

### struct IncludeScript

An include script

| Name   | Type   | Attributes | Description                       |
|--------|--------|------------|-----------------------------------|
| url    | string |            | The include script URL            |
| system | bool   | optional   | If true, this is a system include |

### struct IncludeStatement

Bases: [BaseStatement](#struct-basestatement)

An include statement

| Name       | Type                                      | Attributes     | Description                                                         |
|------------|-------------------------------------------|----------------|---------------------------------------------------------------------|
| lineNumber | int                                       | optional       | The script statement's line number                                  |
| lineCount  | int                                       | optional       | The number of lines in the script statement (default is 1)          |
| includes   | [IncludeScript](#struct-includescript) [] | len(array) > 0 | The list of include scripts to load and execute in the global scope |

### struct JumpStatement

Bases: [BaseStatement](#struct-basestatement)

A jump statement

| Name       | Type                            | Attributes | Description                                                |
|------------|---------------------------------|------------|------------------------------------------------------------|
| lineNumber | int                             | optional   | The script statement's line number                         |
| lineCount  | int                             | optional   | The number of lines in the script statement (default is 1) |
| label      | string                          |            | The label to jump to                                       |
| expr       | [Expression](#union-expression) | optional   | The test expression                                        |

### struct LabelStatement

Bases: [BaseStatement](#struct-basestatement)

A label statement

| Name       | Type   | Attributes | Description                                                |
|------------|--------|------------|------------------------------------------------------------|
| lineNumber | int    | optional   | The script statement's line number                         |
| lineCount  | int    | optional   | The number of lines in the script statement (default is 1) |
| name       | string |            | The label name                                             |

### struct ReturnStatement

Bases: [BaseStatement](#struct-basestatement)

A return statement

| Name       | Type                            | Attributes | Description                                                |
|------------|---------------------------------|------------|------------------------------------------------------------|
| lineNumber | int                             | optional   | The script statement's line number                         |
| lineCount  | int                             | optional   | The number of lines in the script statement (default is 1) |
| expr       | [Expression](#union-expression) | optional   | The expression to return                                   |

### union ScriptStatement

A script statement

| Name     | Type                                               | Description           |
|----------|----------------------------------------------------|-----------------------|
| expr     | [ExpressionStatement](#struct-expressionstatement) | An expression         |
| jump     | [JumpStatement](#struct-jumpstatement)             | A jump statement      |
| return   | [ReturnStatement](#struct-returnstatement)         | A return statement    |
| label    | [LabelStatement](#struct-labelstatement)           | A label definition    |
| function | [FunctionStatement](#struct-functionstatement)     | A function definition |
| include  | [IncludeStatement](#struct-includestatement)       | An include statement  |

### struct UnaryExpression

A unary expression

| Name | Type                                                     | Description                   |
|------|----------------------------------------------------------|-------------------------------|
| op   | [UnaryExpressionOperator](#enum-unaryexpressionoperator) | The unary expression operator |
| expr | [Expression](#union-expression)                          | The expression                |
