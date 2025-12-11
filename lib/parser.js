// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/parser */


/**
 * Parse a BareScript script
 *
 * @param {string|string[]} scriptText - The [script text](./language/)
 * @param {number} [startLineNumber = 1] - The script's starting line number
 * @param {?string} [scriptName = null] - The script name
 * @returns {Object} The [BareScript model](./model/#var.vName='BareScript')
 * @throws [BareScriptParserError]{@link module:lib/parser.BareScriptParserError}
 */
export function parseScript(scriptText, startLineNumber = 1, scriptName = null) {
    const lines = [];
    const script = {'statements': [], 'scriptLines': lines};
    if (scriptName !== null) {
        script.scriptName = scriptName;
    }

    // Line-split all script text
    if (typeof scriptText === 'string') {
        lines.push(...scriptText.split(rScriptLineSplit));
    } else {
        for (const scriptTextPart of scriptText) {
            lines.push(...scriptTextPart.split(rScriptLineSplit));
        }
    }

    // Process each line
    const lineContinuation = [];
    let functionDef = null;
    let functionLabelDefDepth = null;
    const labelDefs = [];
    let labelIndex = 0;
    let ixLine;
    for (const [ixLinePart, linePart] of lines.entries()) {
        const statements = (functionDef !== null ? functionDef.function.statements : script.statements);

        // Comment?
        if (linePart.match(rScriptComment) !== null) {
            continue;
        }

        // Set the line index
        const isContinued = (lineContinuation.length !== 0);
        if (!isContinued) {
            ixLine = ixLinePart;
        }

        // Line continuation?
        const linePartNoContinuation = linePart.replace(rScriptContinuation, '');
        if (linePart !== linePartNoContinuation) {
            lineContinuation.push(isContinued ? linePartNoContinuation.trim() : linePartNoContinuation.trimEnd());
            continue;
        } else if (isContinued) {
            lineContinuation.push(linePartNoContinuation.trim());
        }

        // Join the continued script lines, if necessary
        let line;
        if (isContinued) {
            line = lineContinuation.join(' ');
            lineContinuation.length = 0;
        } else {
            line = linePart;
        }

        // Base statement members
        const lineNumber = ixLine + 1;
        const statementBase = {lineNumber};
        if (ixLine !== ixLinePart) {
            statementBase.lineCount = (ixLinePart - ixLine) + 1;
        }

        // Assignment?
        const matchAssignment = line.match(rScriptAssignment);
        if (matchAssignment !== null) {
            // Parse the expression
            let assignmentExpr;
            try {
                assignmentExpr = parseExpression(matchAssignment.groups.expr, lineNumber, scriptName, true);
            } catch (error) {
                const columnNumber = line.length - matchAssignment.groups.expr.length + error.columnNumber;
                throw new BareScriptParserError(error.error, line, columnNumber, startLineNumber + ixLine, scriptName);
            }

            // Add the expression statement
            const exprStatement = {
                'expr': {
                    'name': matchAssignment.groups.name,
                    'expr': assignmentExpr,
                    ...statementBase
                }
            };
            statements.push(exprStatement);
            continue;
        }

        // Function definition begin?
        const matchFunctionBegin = line.match(rScriptFunctionBegin);
        if (matchFunctionBegin !== null) {
            // Nested function definitions are not allowed
            if (functionDef !== null) {
                throw new BareScriptParserError('Nested function definition', line, 1, startLineNumber + ixLine, scriptName);
            }

            // Add the function definition statement
            functionLabelDefDepth = labelDefs.length;
            functionDef = {
                'function': {
                    'name': matchFunctionBegin.groups.name,
                    'statements': [],
                    ...statementBase
                }
            };
            if (typeof matchFunctionBegin.groups.args !== 'undefined') {
                functionDef.function.args = matchFunctionBegin.groups.args.split(rScriptFunctionArgSplit);
            }
            if (typeof matchFunctionBegin.groups.async !== 'undefined') {
                functionDef.function.async = true;
            }
            if (typeof matchFunctionBegin.groups.lastArgArray !== 'undefined') {
                functionDef.function.lastArgArray = true;
            }
            statements.push(functionDef);
            continue;
        }

        // Function definition end?
        const matchFunctionEnd = line.match(rScriptFunctionEnd);
        if (matchFunctionEnd !== null) {
            if (functionDef === null) {
                throw new BareScriptParserError('No matching function definition', line, 1, startLineNumber + ixLine, scriptName);
            }

            // Check for un-matched label definitions
            if (labelDefs.length > functionLabelDefDepth) {
                const labelDef = labelDefs.pop();
                const [defKey] = Object.keys(labelDef);
                const def = labelDef[defKey];
                throw new BareScriptParserError(`Missing end${defKey} statement`, def.line, 1, def.lineNumber, scriptName);
            }

            functionDef = null;
            functionLabelDefDepth = null;
            continue;
        }

        // If-then begin?
        const matchIfBegin = line.match(rScriptIfBegin);
        if (matchIfBegin !== null) {
            // Parse the if-then expression
            let ifthenExpr;
            try {
                ifthenExpr = parseExpression(matchIfBegin.groups.expr, lineNumber, scriptName, true);
            } catch (error) {
                const columnNumber = matchIfBegin.groups.if.length + error.columnNumber;
                throw new BareScriptParserError(error.error, line, columnNumber, startLineNumber + ixLine, scriptName);
            }

            // Add the if-then label definition
            const ifthen = {
                'jump': {
                    'label': `__bareScriptIf${labelIndex}`,
                    'expr': {'unary': {'op': '!', 'expr': ifthenExpr}},
                    ...statementBase
                },
                'done': `__bareScriptDone${labelIndex}`,
                'hasElse': false,
                line,
                'lineNumber': startLineNumber + ixLine
            };
            labelDefs.push({'if': ifthen});
            labelIndex += 1;

            // Add the if-then header statement
            statements.push({'jump': ifthen.jump});
            continue;
        }

        // Else-if-then?
        const matchIfElseIf = line.match(rScriptIfElseIf);
        if (matchIfElseIf !== null) {
            // Get the else-if-then definition
            const labelDefDepth = (functionDef !== null ? functionLabelDefDepth : 0);
            const ifthen = (labelDefs.length > labelDefDepth ? (labelDefs[labelDefs.length - 1].if ?? null) : null);
            if (ifthen === null) {
                throw new BareScriptParserError('No matching if statement', line, 1, startLineNumber + ixLine, scriptName);
            }

            // Cannot come after the else-then statement
            if (ifthen.hasElse) {
                throw new BareScriptParserError('Elif statement following else statement', line, 1, startLineNumber + ixLine, scriptName);
            }

            // Parse the else-if-then expression
            let ifElseIfExpr;
            try {
                ifElseIfExpr = parseExpression(matchIfElseIf.groups.expr, lineNumber, scriptName, true);
            } catch (error) {
                const columnNumber = matchIfElseIf.groups.elif.length + error.columnNumber;
                throw new BareScriptParserError(error.error, line, columnNumber, startLineNumber + ixLine, scriptName);
            }

            // Generate the next if-then jump statement
            const prevLabel = ifthen.jump.label;
            ifthen.jump = {
                'label': `__bareScriptIf${labelIndex}`,
                'expr': {'unary': {'op': '!', 'expr': ifElseIfExpr}},
                ...statementBase
            };
            labelIndex += 1;

            // Add the if-then else statements
            statements.push(
                {'jump': {'label': ifthen.done, ...statementBase}},
                {'label': {'name': prevLabel, ...statementBase}},
                {'jump': ifthen.jump}
            );
            continue;
        }

        // Else-then?
        const matchIfElse = line.match(rScriptIfElse);
        if (matchIfElse !== null) {
            // Get the if-then definition
            const labelDefDepth = (functionDef !== null ? functionLabelDefDepth : 0);
            const ifthen = (labelDefs.length > labelDefDepth ? (labelDefs[labelDefs.length - 1].if ?? null) : null);
            if (ifthen === null) {
                throw new BareScriptParserError('No matching if statement', line, 1, startLineNumber + ixLine, scriptName);
            }

            // Cannot have multiple else-then statements
            if (ifthen.hasElse) {
                throw new BareScriptParserError('Multiple else statements', line, 1, startLineNumber + ixLine, scriptName);
            }
            ifthen.hasElse = true;

            // Add the if-then else statements
            statements.push(
                {'jump': {'label': ifthen.done, ...statementBase}},
                {'label': {'name': ifthen.jump.label, ...statementBase}}
            );
            continue;
        }

        // If-then end?
        const matchIfEnd = line.match(rScriptIfEnd);
        if (matchIfEnd !== null) {
            // Pop the if-then definition
            const labelDefDepth = (functionDef !== null ? functionLabelDefDepth : 0);
            const ifthen = (labelDefs.length > labelDefDepth ? (labelDefs.pop().if ?? null) : null);
            if (ifthen === null) {
                throw new BareScriptParserError('No matching if statement', line, 1, startLineNumber + ixLine, scriptName);
            }

            // Update the previous jump statement's label, if necessary
            if (!ifthen.hasElse) {
                ifthen.jump.label = ifthen.done;
            }

            // Add the if-then footer statement
            statements.push({'label': {'name': ifthen.done, ...statementBase}});
            continue;
        }

        // While-do begin?
        const matchWhileBegin = line.match(rScriptWhileBegin);
        if (matchWhileBegin !== null) {
            // Parse the while-do expression
            let whileBeginExpr;
            try {
                whileBeginExpr = parseExpression(matchWhileBegin.groups.expr, lineNumber, scriptName, true);
            } catch (error) {
                const columnNumber = matchWhileBegin.groups.while.length + error.columnNumber;
                throw new BareScriptParserError(error.error, line, columnNumber, startLineNumber + ixLine, scriptName);
            }

            // Add the while-do label
            const whiledo = {
                'loop': `__bareScriptLoop${labelIndex}`,
                'continue': `__bareScriptLoop${labelIndex}`,
                'done': `__bareScriptDone${labelIndex}`,
                'expr': whileBeginExpr,
                line,
                'lineNumber': startLineNumber + ixLine
            };
            labelDefs.push({'while': whiledo});
            labelIndex += 1;

            // Add the while-do header statements
            statements.push(
                {'jump': {'label': whiledo.done, 'expr': {'unary': {'op': '!', 'expr': whiledo.expr}}, ...statementBase}},
                {'label': {'name': whiledo.loop, ...statementBase}}
            );
            continue;
        }

        // While-do end?
        const matchWhileEnd = line.match(rScriptWhileEnd);
        if (matchWhileEnd !== null) {
            // Pop the while-do definition
            const labelDefDepth = (functionDef !== null ? functionLabelDefDepth : 0);
            const whiledo = (labelDefs.length > labelDefDepth ? (labelDefs.pop().while ?? null) : null);
            if (whiledo === null) {
                throw new BareScriptParserError('No matching while statement', line, 1, startLineNumber + ixLine, scriptName);
            }

            // Add the while-do footer statements
            statements.push(
                {'jump': {'label': whiledo.loop, 'expr': whiledo.expr, ...statementBase}},
                {'label': {'name': whiledo.done, ...statementBase}}
            );
            continue;
        }

        // For-each begin?
        const matchForBegin = line.match(rScriptForBegin);
        if (matchForBegin !== null) {
            // Add the for-each label
            const foreach = {
                'loop': `__bareScriptLoop${labelIndex}`,
                'continue': `__bareScriptContinue${labelIndex}`,
                'done': `__bareScriptDone${labelIndex}`,
                'index': matchForBegin.groups.index ?? `__bareScriptIndex${labelIndex}`,
                'values': `__bareScriptValues${labelIndex}`,
                'length': `__bareScriptLength${labelIndex}`,
                'value': matchForBegin.groups.value,
                line,
                'lineNumber': startLineNumber + ixLine
            };
            labelDefs.push({'for': foreach});
            labelIndex += 1;

            // Parse the for-each expression
            let forBeginExpr;
            try {
                forBeginExpr = parseExpression(matchForBegin.groups.values, lineNumber, scriptName, true);
            } catch (error) {
                const columnNumber = matchForBegin.groups.for.length + error.columnNumber;
                throw new BareScriptParserError(error.error, line, columnNumber, startLineNumber + ixLine, scriptName);
            }

            // Add the for-each header statements
            statements.push(
                {'expr': {
                    'name': foreach.values,
                    'expr': forBeginExpr,
                    ...statementBase
                }},
                {'expr': {
                    'name': foreach.length,
                    'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': foreach.values}]}},
                    ...statementBase
                }},
                {'jump': {'label': foreach.done, 'expr': {'unary': {'op': '!', 'expr': {'variable': foreach.length}}}, ...statementBase}},
                {'expr': {'name': foreach.index, 'expr': {'number': 0}, ...statementBase}},
                {'label': {'name': foreach.loop, ...statementBase}},
                {'expr': {
                    'name': foreach.value,
                    'expr': {'function': {'name': 'arrayGet', 'args': [{'variable': foreach.values}, {'variable': foreach.index}]}},
                    ...statementBase
                }}
            );
            continue;
        }

        // For-each end?
        const matchForEnd = line.match(rScriptForEnd);
        if (matchForEnd !== null) {
            // Pop the foreach definition
            const labelDefDepth = (functionDef !== null ? functionLabelDefDepth : 0);
            const foreach = (labelDefs.length > labelDefDepth ? (labelDefs.pop().for ?? null) : null);
            if (foreach === null) {
                throw new BareScriptParserError('No matching for statement', line, 1, startLineNumber + ixLine, scriptName);
            }

            // Add the for-each footer statements
            if (foreach.hasContinue) {
                statements.push({'label': {'name': foreach.continue, ...statementBase}});
            }
            statements.push(
                {'expr': {
                    'name': foreach.index,
                    'expr': {'binary': {'op': '+', 'left': {'variable': foreach.index}, 'right': {'number': 1}}},
                    ...statementBase
                }},
                {'jump': {
                    'label': foreach.loop,
                    'expr': {'binary': {'op': '<', 'left': {'variable': foreach.index}, 'right': {'variable': foreach.length}}},
                    ...statementBase
                }},
                {'label': {'name': foreach.done, ...statementBase}}
            );
            continue;
        }

        // Break statement?
        const matchBreak = line.match(rScriptBreak);
        if (matchBreak !== null) {
            // Get the loop definition
            const labelDefDepth = (functionDef !== null ? functionLabelDefDepth : 0);
            const ixLabelDef = labelDefs.findLastIndex((def) => !('if' in def));
            const labelDef = (ixLabelDef >= labelDefDepth ? labelDefs[ixLabelDef] : null);
            if (labelDef === null) {
                throw new BareScriptParserError('Break statement outside of loop', line, 1, startLineNumber + ixLine, scriptName);
            }
            const [labelKey] = Object.keys(labelDef);
            const loopDef = labelDef[labelKey];

            // Add the break jump statement
            statements.push({'jump': {'label': loopDef.done, ...statementBase}});
            continue;
        }

        // Continue statement?
        const matchContinue = line.match(rScriptContinue);
        if (matchContinue !== null) {
            // Get the loop definition
            const labelDefDepth = (functionDef !== null ? functionLabelDefDepth : 0);
            const ixLabelDef = labelDefs.findLastIndex((def) => !('if' in def));
            const labelDef = (ixLabelDef >= labelDefDepth ? labelDefs[ixLabelDef] : null);
            if (labelDef === null) {
                throw new BareScriptParserError('Continue statement outside of loop', line, 1, startLineNumber + ixLine, scriptName);
            }
            const [labelKey] = Object.keys(labelDef);
            const loopDef = labelDef[labelKey];

            // Add the continue jump statement
            loopDef.hasContinue = true;
            statements.push({'jump': {'label': loopDef.continue, ...statementBase}});
            continue;
        }

        // Label definition?
        const matchLabel = line.match(rScriptLabel);
        if (matchLabel !== null) {
            statements.push({'label': {'name': matchLabel.groups.name, ...statementBase}});
            continue;
        }

        // Jump definition?
        const matchJump = line.match(rScriptJump);
        if (matchJump !== null) {
            const jumpStatement = {'jump': {'label': matchJump.groups.name, ...statementBase}};
            if (typeof matchJump.groups.expr !== 'undefined') {
                try {
                    jumpStatement.jump.expr = parseExpression(matchJump.groups.expr, lineNumber, scriptName, true);
                } catch (error) {
                    const columnNumber = matchJump.groups.jump.length - matchJump.groups.expr.length - 1 + error.columnNumber;
                    throw new BareScriptParserError(error.error, line, columnNumber, startLineNumber + ixLine, scriptName);
                }
            }
            statements.push(jumpStatement);
            continue;
        }

        // Return definition?
        const matchReturn = line.match(rScriptReturn);
        if (matchReturn !== null) {
            const returnStatement = {'return': {...statementBase}};
            if (typeof matchReturn.groups.expr !== 'undefined') {
                try {
                    returnStatement.return.expr = parseExpression(matchReturn.groups.expr, lineNumber, scriptName, true);
                } catch (error) {
                    const columnNumber = matchReturn.groups.return.length - matchReturn.groups.expr.length + error.columnNumber;
                    throw new BareScriptParserError(error.error, line, columnNumber, startLineNumber + ixLine, scriptName);
                }
            }
            statements.push(returnStatement);
            continue;
        }

        // Include definition?
        const matchInclude = line.match(rScriptInclude) || line.match(rScriptIncludeSystem);
        if (matchInclude !== null) {
            const {delim} = matchInclude.groups;
            const url = (
                delim === '<' ? matchInclude.groups.url : matchInclude.groups.url.replace(rExprStringEscapes, replaceStringEscape)
            );
            let includeStatement = (statements.length ? statements[statements.length - 1] : null);
            if (includeStatement === null || !('include' in includeStatement)) {
                includeStatement = {'include': {'includes': [], ...statementBase}};
                statements.push(includeStatement);
            } else {
                includeStatement.include.lineCount = (ixLinePart - includeStatement.include.lineNumber) + 2;
            }
            includeStatement.include.includes.push(delim === '<' ? {url, 'system': true} : {url});
            continue;
        }

        // Expression
        try {
            const exprStatement = {'expr': {'expr': parseExpression(line, lineNumber, scriptName, true), ...statementBase}};
            statements.push(exprStatement);
        } catch (error) {
            throw new BareScriptParserError(error.error, line, error.columnNumber, startLineNumber + ixLine, scriptName);
        }
    }

    // Dangling label definitions?
    if (labelDefs.length > 0) {
        const labelDef = labelDefs.pop();
        const [defKey] = Object.keys(labelDef);
        const def = labelDef[defKey];
        throw new BareScriptParserError(`Missing end${defKey} statement`, def.line, 1, def.lineNumber, scriptName);
    }

    return script;
}


// BareScript regex
const rScriptLineSplit = /\r?\n/;
const rScriptContinuation = /\\\s*$/;
const rScriptComment = /^\s*(?:#.*)?$/;
const rScriptAssignment = /^\s*(?<name>[A-Za-z_]\w*)\s*=\s*(?<expr>.+)$/;
const rPartComment = '\\s*(#.*)?$';
const rScriptFunctionBegin = new RegExp(
    '^(?<async>\\s*async)?\\s*function\\s+(?<name>[A-Za-z_]\\w*)\\s*\\(' +
        `\\s*(?<args>[A-Za-z_]\\w*(?:\\s*,\\s*[A-Za-z_]\\w*)*)?(?<lastArgArray>\\s*\\.\\.\\.)?\\s*\\)\\s*:${rPartComment}`
);
const rScriptFunctionArgSplit = /\s*,\s*/;
const rScriptFunctionEnd = new RegExp(`^\\s*endfunction${rPartComment}`);
const rScriptLabel = new RegExp(`^\\s*(?<name>[A-Za-z_]\\w*)\\s*:${rPartComment}`);
const rScriptJump = new RegExp(`^(?<jump>\\s*(?:jump|jumpif\\s*\\((?<expr>.+)\\)))\\s+(?<name>[A-Za-z_]\\w*)${rPartComment}`);
const rScriptReturn = new RegExp(`^(?<return>\\s*return(?:\\s+(?<expr>[^#\\s].*))?)${rPartComment}`);
const rScriptInclude = new RegExp(`^\\s*include\\s+(?<delim>')(?<url>(?:\\'|[^'])*)'${rPartComment}`);
const rScriptIncludeSystem = new RegExp(`^\\s*include\\s+(?<delim><)(?<url>[^>]*)>${rPartComment}`);
const rScriptIfBegin = new RegExp(`^(?<if>\\s*if\\s+)(?<expr>.+)\\s*:${rPartComment}`);
const rScriptIfElseIf = new RegExp(`^(?<elif>\\s*elif\\s+)(?<expr>.+)\\s*:${rPartComment}`);
const rScriptIfElse = new RegExp(`^\\s*else\\s*:${rPartComment}`);
const rScriptIfEnd = new RegExp(`^\\s*endif${rPartComment}`);
const rScriptForBegin = new RegExp(
    `^(?<for>\\s*for\\s+(?<value>[A-Za-z_]\\w*)(?:\\s*,\\s*(?<index>[A-Za-z_]\\w*))?\\s+in\\s+)(?<values>.+)\\s*:${rPartComment}`
);
const rScriptForEnd = new RegExp(`^\\s*endfor${rPartComment}`);
const rScriptWhileBegin = new RegExp(`^(?<while>\\s*while\\s+)(?<expr>.+)\\s*:${rPartComment}`);
const rScriptWhileEnd = new RegExp(`^\\s*endwhile${rPartComment}`);
const rScriptBreak = new RegExp(`^\\s*break${rPartComment}`);
const rScriptContinue = new RegExp(`^\\s*continue${rPartComment}`);


/**
 * Parse a BareScript expression
 *
 * @param {string} exprText - The [expression text](./language/#expressions)
 * @param {number} [lineNumber = 1] - The script line number
 * @param {?string} [scriptName = null] - The script name
 * @param {boolean} [arrayLiterals = false] - If True, allow parsing of array literals
 * @returns {Object} The [expression model](./model/#var.vName='Expression')
 * @throws [BareScriptParserError]{@link module:lib/parser.BareScriptParserError}
 */
export function parseExpression(exprText, lineNumber = null, scriptName = null, arrayLiterals = false) {
    try {
        const [expr, nextText] = parseBinaryExpression(exprText, null, arrayLiterals);
        if (nextText.trim() !== '') {
            throw new BareScriptParserError('Syntax error', nextText, 1, lineNumber, scriptName);
        }
        return expr;
    } catch (error) {
        const columnNumber = exprText.length - error.line.length + 1;
        throw new BareScriptParserError(error.error, exprText, columnNumber, lineNumber, scriptName);
    }
}


// Helper function to parse a binary operator expression chain
function parseBinaryExpression(exprText, binLeftExpr, arrayLiterals) {
    // Parse the binary operator's left unary expression if none was passed
    let leftExpr;
    let binText;
    if (binLeftExpr !== null) {
        binText = exprText;
        leftExpr = binLeftExpr;
    } else {
        [leftExpr, binText] = parseUnaryExpression(exprText, arrayLiterals);
    }

    // Match a binary operator - if not found, return the left expression
    const matchBinaryOp = binText.match(rExprBinaryOp);
    if (matchBinaryOp === null) {
        // End-of-line comment?
        if (binText.match(rExprComment)) {
            binText = '';
        }

        return [leftExpr, binText];
    }
    const [, binOp] = matchBinaryOp;
    const rightText = binText.slice(matchBinaryOp[0].length);

    // Parse the right sub-expression
    const [rightExpr, nextText] = parseUnaryExpression(rightText, arrayLiterals);

    // Create the binary expression - re-order for binary operators as necessary
    let binExpr;
    if (Object.keys(leftExpr)[0] === 'binary' && binaryReorder[binOp].has(leftExpr.binary.op)) {
        // Left expression has lower precendence - find where to put this expression within the left expression
        binExpr = leftExpr;
        let reorderExpr = leftExpr;
        while (Object.keys(reorderExpr.binary.right)[0] === 'binary' &&
               binaryReorder[binOp].has(reorderExpr.binary.right.binary.op)) {
            reorderExpr = reorderExpr.binary.right;
        }
        reorderExpr.binary.right = {'binary': {'op': binOp, 'left': reorderExpr.binary.right, 'right': rightExpr}};
    } else {
        binExpr = {'binary': {'op': binOp, 'left': leftExpr, 'right': rightExpr}};
    }

    // Parse the next binary expression in the chain
    return parseBinaryExpression(nextText, binExpr, arrayLiterals);
}


// Binary operator re-order map
const binaryReorder = {
    '**': new Set(['*', '/', '%', '+', '-', '<<', '>>', '<=', '<', '>=', '>', '==', '!=', '&', '^', '|', '&&', '||']),
    '*': new Set(['+', '-', '<<', '>>', '<=', '<', '>=', '>', '==', '!=', '&', '^', '|', '&&', '||']),
    '/': new Set(['+', '-', '<<', '>>', '<=', '<', '>=', '>', '==', '!=', '&', '^', '|', '&&', '||']),
    '%': new Set(['+', '-', '<<', '>>', '<=', '<', '>=', '>', '==', '!=', '&', '^', '|', '&&', '||']),
    '+': new Set(['<<', '>>', '<=', '<', '>=', '>', '==', '!=', '&', '^', '|', '&&', '||']),
    '-': new Set(['<<', '>>', '<=', '<', '>=', '>', '==', '!=', '&', '^', '|', '&&', '||']),
    '<<': new Set(['<=', '<', '>=', '>', '==', '!=', '&', '^', '|', '&&', '||']),
    '>>': new Set(['<=', '<', '>=', '>', '==', '!=', '&', '^', '|', '&&', '||']),
    '<=': new Set(['==', '!=', '&', '^', '|', '&&', '||']),
    '<': new Set(['==', '!=', '&', '^', '|', '&&', '||']),
    '>=': new Set(['==', '!=', '&', '^', '|', '&&', '||']),
    '>': new Set(['==', '!=', '&', '^', '|', '&&', '||']),
    '==': new Set(['&', '^', '|', '&&', '||']),
    '!=': new Set(['&', '^', '|', '&&', '||']),
    '&': new Set(['^', '|', '&&', '||']),
    '^': new Set(['|', '&&', '||']),
    '|': new Set(['&&', '||']),
    '&&': new Set(['||']),
    '||': new Set([])
};


// Helper function to parse a unary expression
function parseUnaryExpression(exprText, arrayLiterals) {
    // Group open?
    const matchGroupOpen = exprText.match(rExprGroupOpen);
    if (matchGroupOpen !== null) {
        const groupText = exprText.slice(matchGroupOpen[0].length);
        const [expr, nextText] = parseBinaryExpression(groupText, null, arrayLiterals);
        const matchGroupClose = nextText.match(rExprGroupClose);
        if (matchGroupClose === null) {
            throw new BareScriptParserError('Unmatched parenthesis', exprText, 1, null, null);
        }
        return [{'group': expr}, nextText.slice(matchGroupClose[0].length)];
    }

    // Number?
    const matchNumber = exprText.match(rExprNumber);
    if (matchNumber !== null) {
        const [, numberStr] = matchNumber;
        const number = (numberStr.startsWith('0x') ? parseInt(numberStr, 16) : parseFloat(numberStr));
        const expr = {'number': number};
        return [expr, exprText.slice(matchNumber[0].length)];
    }

    // String?
    const matchString = exprText.match(rExprString);
    if (matchString !== null) {
        const string = matchString[1].replace(rExprStringEscapes, replaceStringEscape);
        const expr = {'string': string};
        return [expr, exprText.slice(matchString[0].length)];
    }

    // String (double quotes)?
    const matchStringDouble = exprText.match(rExprStringDouble);
    if (matchStringDouble !== null) {
        const string = matchStringDouble[1].replace(rExprStringEscapes, replaceStringEscape);
        const expr = {'string': string};
        return [expr, exprText.slice(matchStringDouble[0].length)];
    }

    // Unary operator?
    const matchUnary = exprText.match(rExprUnaryOp);
    if (matchUnary !== null) {
        const unaryText = exprText.slice(matchUnary[0].length);
        const [expr, nextText] = parseUnaryExpression(unaryText, arrayLiterals);
        const unaryExpr = {
            'unary': {
                'op': matchUnary[1],
                expr
            }
        };
        return [unaryExpr, nextText];
    }

    // Function?
    const matchFunctionOpen = exprText.match(rExprFunctionOpen);
    if (matchFunctionOpen !== null) {
        let argText = exprText.slice(matchFunctionOpen[0].length);
        const args = [];
        while (true) {
            // Function close?
            const matchFunctionClose = argText.match(rExprFunctionClose);
            if (matchFunctionClose !== null) {
                argText = argText.slice(matchFunctionClose[0].length);
                break;
            }

            // Function argument separator
            if (args.length !== 0) {
                const matchFunctionSeparator = argText.match(rExprFunctionSeparator);
                if (matchFunctionSeparator === null) {
                    throw new BareScriptParserError('Syntax error', argText, 1, null, null);
                }
                argText = argText.slice(matchFunctionSeparator[0].length);
            }

            // Get the argument
            const [argExpr, nextArgText] = parseBinaryExpression(argText, null, arrayLiterals);
            argText = nextArgText;
            args.push(argExpr);
        }

        const fnExpr = {
            'function': {
                'name': matchFunctionOpen[1],
                'args': args
            }
        };
        return [fnExpr, argText];
    }

    // Object creation?
    const matchObjectOpen = exprText.match(rExprObjectOpen);
    if (matchObjectOpen !== null) {
        let argText = exprText.slice(matchObjectOpen[0].length);
        const args = [];
        while (true) {
            // Object close?
            const matchObjectClose = argText.match(rExprObjectClose);
            if (matchObjectClose !== null) {
                argText = argText.slice(matchObjectClose[0].length);
                break;
            }

            // Key/value pair separator
            if (args.length !== 0) {
                const matchObjectSeparator = argText.match(rExprObjectSeparator);
                if (matchObjectSeparator === null) {
                    throw new BareScriptParserError('Syntax error', argText, 1, null, null);
                }
                argText = argText.slice(matchObjectSeparator[0].length);
            }

            // Get the key
            const [argKey, nextArgText] = parseBinaryExpression(argText, null, arrayLiterals);
            argText = nextArgText;
            args.push(argKey);

            // Key/value separator
            if (args.length !== 0) {
                const matchObjectSeparatorKey = argText.match(rExprObjectSeparatorKey);
                if (matchObjectSeparatorKey === null) {
                    throw new BareScriptParserError('Syntax error', argText, 1, null, null);
                }
                argText = argText.slice(matchObjectSeparatorKey[0].length);
            }

            // Get the value
            const [argValue, nextArgText2] = parseBinaryExpression(argText, null, arrayLiterals);
            argText = nextArgText2;
            args.push(argValue);
        }
        const fnExpr = {'function': {'name': 'objectNew', 'args': args}};
        return [fnExpr, argText];
    }

    // Array creation?
    if (arrayLiterals) {
        const matchArrayOpen = exprText.match(rExprArrayOpen);
        if (matchArrayOpen !== null) {
            let argText = exprText.slice(matchArrayOpen[0].length);
            const args = [];
            while (true) {
                // Array close?
                const matchArrayClose = argText.match(rExprArrayClose);
                if (matchArrayClose !== null) {
                    argText = argText.slice(matchArrayClose[0].length);
                    break;
                }

                // Array value separator
                if (args.length !== 0) {
                    const matchArraySeparator = argText.match(rExprArraySeparator);
                    if (matchArraySeparator === null) {
                        throw new BareScriptParserError('Syntax error', argText, 1, null, null);
                    }
                    argText = argText.slice(matchArraySeparator[0].length);
                }

                // Get the value
                const [argValue, nextArgText2] = parseBinaryExpression(argText, null, arrayLiterals);
                argText = nextArgText2;
                args.push(argValue);
            }
            const fnExpr = {'function': {'name': 'arrayNew', 'args': args}};
            return [fnExpr, argText];
        }
    }

    // Variable?
    const matchVariable = exprText.match(rExprVariable);
    if (matchVariable !== null) {
        const expr = {'variable': matchVariable[1]};
        return [expr, exprText.slice(matchVariable[0].length)];
    }

    // Variable (brackets)?
    if (!arrayLiterals) {
        const matchVariableEx = exprText.match(rExprVariableEx);
        if (matchVariableEx !== null) {
            const variableName = matchVariableEx[1].replace(rExprVariableExEscape, '$1');
            const expr = {'variable': variableName};
            return [expr, exprText.slice(matchVariableEx[0].length)];
        }
    }

    throw new BareScriptParserError('Syntax error', exprText, 1, null, null);
}


// BareScript expression regex
const rExprComment = /^\s*#.*$/;
const rExprBinaryOp = /^\s*(\*\*|\*|\/|%|\+|-|<<|>>|<=|<|>=|>|==|!=|&&|\|\||&|\^|\|)/;
const rExprUnaryOp = /^\s*(!|-|~)/;
const rExprFunctionOpen = /^\s*([A-Za-z_]\w+)\s*\(/;
const rExprFunctionSeparator = /^\s*,/;
const rExprFunctionClose = /^\s*\)/;
const rExprGroupOpen = /^\s*\(/;
const rExprGroupClose = /^\s*\)/;
const rExprNumber = /^\s*(0x[A-Fa-f0-9]+|[+-]?\d+(?:\.\d*)?(?:e[+-]?\d+)?)/;
const rExprArrayOpen = /^\s*\[/;
const rExprArraySeparator = /^\s*,/;
const rExprArrayClose = /^\s*\]/;
const rExprObjectOpen = /^\s*\{/;
const rExprObjectSeparatorKey = /^\s*:/;
const rExprObjectSeparator = /^\s*,/;
const rExprObjectClose = /^\s*\}/;
const rExprString = /^\s*'((?:\\\\|\\'|[^'])*)'/;
const rExprStringDouble = /^\s*"((?:\\\\|\\"|[^"])*)"/;
const rExprVariable = /^\s*([A-Za-z_]\w*)/;
const rExprVariableEx = /^\s*\[\s*((?:\\\]|[^\]])+)\s*\]/;
const rExprVariableExEscape = /\\([\\\]])/g;


// String literal escapes
const rExprStringEscapes = /\\([nrtbf'"\\]|u[0-9a-fA-F]{4})/g;

function replaceStringEscape(unusedMatch, esc) {
    if (esc.startsWith('u')) {
        return String.fromCharCode(parseInt(esc.slice(1), 16));
    }
    return exprStringEscapes[esc];
}

const exprStringEscapes = {
    'n': '\n',
    'r': '\r',
    't': '\t',
    'b': '\b',
    'f': '\f',
    "'": "'",
    '"': '"',
    '\\': '\\'
};


/**
 * A BareScript parser error
 *
 * @extends {Error}
 * @property {string} error - The error description
 * @property {string} line - The line text
 * @property {number} columnNumber - The error column number
 * @property {?number} lineNumber - The error line number
 * @property {?string} scriptName - The script name
 */
export class BareScriptParserError extends Error {
    /**
     * Create a BareScript parser error
     *
     * @param {string} error - The error description
     * @param {string} line - The line text
     * @param {number} [columnNumber] - The error column number
     * @param {?number} [lineNumber] - The error line number
     * @param {?string} [scriptName] - The script name
     */
    constructor(error, line, columnNumber, lineNumber, scriptName) {
        // Parser error constants
        const lineLengthMax = 120;
        const lineSuffix = ' ...';
        const linePrefix = '... ';

        // Trim the error line, if necessary
        let lineError = line;
        let lineColumn = columnNumber;
        if (line.length > lineLengthMax) {
            const lineLeft = columnNumber - 1 - lineLengthMax / 2;
            const lineRight = lineLeft + lineLengthMax;
            if (lineLeft < 0) {
                lineError = line.slice(0, lineLengthMax) + lineSuffix;
            } else if (lineRight > line.length) {
                lineError = linePrefix + line.slice(line.length - lineLengthMax);
                lineColumn -= lineLeft - linePrefix.length - (lineRight - line.length);
            } else {
                lineError = linePrefix + line.slice(lineLeft, lineRight) + lineSuffix;
                lineColumn -= lineLeft - linePrefix.length;
            }
        }

        // Format the message
        const errorPrefix = (lineNumber ? `${scriptName || ''}:${lineNumber}: ` : '');
        const message = `\
${errorPrefix}${error}
${lineError}
${' '.repeat(lineColumn - 1)}^
`;
        super(message);
        this.name = this.constructor.name;
        this.error = error;
        this.line = line;
        this.columnNumber = columnNumber;
        this.lineNumber = lineNumber;
        this.scriptName = scriptName;
    }
}
