// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/parser */


/**
 * Parse a BareScript script
 *
 * @param {string|string[]} scriptText - The [script text](./language/)
 * @param {number} [startLineNumber = 1] - The script's starting line number
 * @returns {Object} The [BareScript model](./model/#var.vName='BareScript')
 * @throws [BareScriptParserError]{@link module:lib/parser.BareScriptParserError}
 */
export function parseScript(scriptText, startLineNumber = 1) {
    const script = {'statements': []};

    // Line-split all script text
    const lines = [];
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

        // Assignment?
        const matchAssignment = line.match(rScriptAssignment);
        if (matchAssignment !== null) {
            try {
                const exprStatement = {
                    'expr': {
                        'name': matchAssignment.groups.name,
                        'expr': parseExpression(matchAssignment.groups.expr)
                    }
                };
                statements.push(exprStatement);
                continue;
            } catch (error) {
                const columnNumber = line.length - matchAssignment.groups.expr.length + error.columnNumber;
                throw new BareScriptParserError(error.error, line, columnNumber, startLineNumber + ixLine);
            }
        }

        // Function definition begin?
        const matchFunctionBegin = line.match(rScriptFunctionBegin);
        if (matchFunctionBegin !== null) {
            // Nested function definitions are not allowed
            if (functionDef !== null) {
                throw new BareScriptParserError('Nested function definition', line, 1, startLineNumber + ixLine);
            }

            // Add the function definition statement
            functionLabelDefDepth = labelDefs.length;
            functionDef = {
                'function': {
                    'name': matchFunctionBegin.groups.name,
                    'statements': []
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
                throw new BareScriptParserError('No matching function definition', line, 1, startLineNumber + ixLine);
            }

            // Check for un-matched label definitions
            if (labelDefs.length > functionLabelDefDepth) {
                const labelDef = labelDefs.pop();
                const [defKey] = Object.keys(labelDef);
                const def = labelDef[defKey];
                throw new BareScriptParserError(`Missing end${defKey} statement`, def.line, 1, def.lineNumber);
            }

            functionDef = null;
            functionLabelDefDepth = null;
            continue;
        }

        // If-then begin?
        const matchIfBegin = line.match(rScriptIfBegin);
        if (matchIfBegin !== null) {
            // Add the if-then label definition
            const ifthen = {
                'jump': {
                    'label': `__bareScriptIf${labelIndex}`,
                    'expr': {'unary': {'op': '!', 'expr': parseExpression(matchIfBegin.groups.expr)}}
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
            // Get the if-then definition
            const labelDefDepth = (functionDef !== null ? functionLabelDefDepth : 0);
            const ifthen = (labelDefs.length > labelDefDepth ? (labelDefs[labelDefs.length - 1].if ?? null) : null);
            if (ifthen === null) {
                throw new BareScriptParserError('No matching if statement', line, 1, startLineNumber + ixLine);
            }

            // Cannot come after the else-then statement
            if (ifthen.hasElse) {
                throw new BareScriptParserError('Elif statement following else statement', line, 1, startLineNumber + ixLine);
            }

            // Generate the next if-then jump statement
            const prevLabel = ifthen.jump.label;
            ifthen.jump = {
                'label': `__bareScriptIf${labelIndex}`,
                'expr': {'unary': {'op': '!', 'expr': parseExpression(matchIfElseIf.groups.expr)}}
            };
            labelIndex += 1;

            // Add the if-then else statements
            statements.push(
                {'jump': {'label': ifthen.done}},
                {'label': prevLabel},
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
                throw new BareScriptParserError('No matching if statement', line, 1, startLineNumber + ixLine);
            }

            // Cannot have multiple else-then statements
            if (ifthen.hasElse) {
                throw new BareScriptParserError('Multiple else statements', line, 1, startLineNumber + ixLine);
            }
            ifthen.hasElse = true;

            // Add the if-then else statements
            statements.push(
                {'jump': {'label': ifthen.done}},
                {'label': ifthen.jump.label}
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
                throw new BareScriptParserError('No matching if statement', line, 1, startLineNumber + ixLine);
            }

            // Update the previous jump statement's label, if necessary
            if (!ifthen.hasElse) {
                ifthen.jump.label = ifthen.done;
            }

            // Add the if-then footer statement
            statements.push({'label': ifthen.done});
            continue;
        }

        // While-do begin?
        const matchWhileBegin = line.match(rScriptWhileBegin);
        if (matchWhileBegin !== null) {
            // Add the while-do label
            const whiledo = {
                'loop': `__bareScriptLoop${labelIndex}`,
                'continue': `__bareScriptLoop${labelIndex}`,
                'done': `__bareScriptDone${labelIndex}`,
                'expr': parseExpression(matchWhileBegin.groups.expr),
                line,
                'lineNumber': startLineNumber + ixLine
            };
            labelDefs.push({'while': whiledo});
            labelIndex += 1;

            // Add the while-do header statements
            statements.push(
                {'jump': {'label': whiledo.done, 'expr': {'unary': {'op': '!', 'expr': whiledo.expr}}}},
                {'label': whiledo.loop}
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
                throw new BareScriptParserError('No matching while statement', line, 1, startLineNumber + ixLine);
            }

            // Add the while-do footer statements
            statements.push(
                {'jump': {'label': whiledo.loop, 'expr': whiledo.expr}},
                {'label': whiledo.done}
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

            // Add the for-each header statements
            statements.push(
                {'expr': {'name': foreach.values, 'expr': parseExpression(matchForBegin.groups.values)}},
                {'expr': {
                    'name': foreach.length,
                    'expr': {'function': {'name': 'arrayLength', 'args': [{'variable': foreach.values}]}}
                }},
                {'jump': {'label': foreach.done, 'expr': {'unary': {'op': '!', 'expr': {'variable': foreach.length}}}}},
                {'expr': {'name': foreach.index, 'expr': {'number': 0}}},
                {'label': foreach.loop},
                {'expr': {
                    'name': foreach.value,
                    'expr': {'function': {'name': 'arrayGet', 'args': [{'variable': foreach.values}, {'variable': foreach.index}]}}
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
                throw new BareScriptParserError('No matching for statement', line, 1, startLineNumber + ixLine);
            }

            // Add the for-each footer statements
            if (foreach.hasContinue) {
                statements.push({'label': foreach.continue});
            }
            statements.push(
                {'expr': {
                    'name': foreach.index,
                    'expr': {'binary': {'op': '+', 'left': {'variable': foreach.index}, 'right': {'number': 1}}}
                }},
                {'jump': {
                    'label': foreach.loop,
                    'expr': {'binary': {'op': '<', 'left': {'variable': foreach.index}, 'right': {'variable': foreach.length}}}
                }},
                {'label': foreach.done}
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
                throw new BareScriptParserError('Break statement outside of loop', line, 1, startLineNumber + ixLine);
            }
            const [labelKey] = Object.keys(labelDef);
            const loopDef = labelDef[labelKey];

            // Add the break jump statement
            statements.push({'jump': {'label': loopDef.done}});
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
                throw new BareScriptParserError('Continue statement outside of loop', line, 1, startLineNumber + ixLine);
            }
            const [labelKey] = Object.keys(labelDef);
            const loopDef = labelDef[labelKey];

            // Add the continue jump statement
            loopDef.hasContinue = true;
            statements.push({'jump': {'label': loopDef.continue}});
            continue;
        }

        // Label definition?
        const matchLabel = line.match(rScriptLabel);
        if (matchLabel !== null) {
            statements.push({'label': matchLabel.groups.name});
            continue;
        }

        // Jump definition?
        const matchJump = line.match(rScriptJump);
        if (matchJump !== null) {
            const jumpStatement = {'jump': {'label': matchJump.groups.name}};
            if (typeof matchJump.groups.expr !== 'undefined') {
                try {
                    jumpStatement.jump.expr = parseExpression(matchJump.groups.expr);
                } catch (error) {
                    const columnNumber = matchJump.groups.jump.length - matchJump.groups.expr.length - 1 + error.columnNumber;
                    throw new BareScriptParserError(error.error, line, columnNumber, startLineNumber + ixLine);
                }
            }
            statements.push(jumpStatement);
            continue;
        }

        // Return definition?
        const matchReturn = line.match(rScriptReturn);
        if (matchReturn !== null) {
            const returnStatement = {'return': {}};
            if (typeof matchReturn.groups.expr !== 'undefined') {
                try {
                    returnStatement.return.expr = parseExpression(matchReturn.groups.expr);
                } catch (error) {
                    const columnNumber = matchReturn.groups.return.length - matchReturn.groups.expr.length + error.columnNumber;
                    throw new BareScriptParserError(error.error, line, columnNumber, startLineNumber + ixLine);
                }
            }
            statements.push(returnStatement);
            continue;
        }

        // Include definition?
        const matchInclude = line.match(rScriptInclude) || line.match(rScriptIncludeSystem);
        if (matchInclude !== null) {
            const {delim} = matchInclude.groups;
            const url = (delim === '<' ? matchInclude.groups.url : matchInclude.groups.url.replace(rExprStringEscape, '$1'));
            let includeStatement = (statements.length ? statements[statements.length - 1] : null);
            if (includeStatement === null || !('include' in includeStatement)) {
                includeStatement = {'include': {'includes': []}};
                statements.push(includeStatement);
            }
            includeStatement.include.includes.push(delim === '<' ? {url, 'system': true} : {url});
            continue;
        }

        // Expression
        try {
            const exprStatement = {'expr': {'expr': parseExpression(line)}};
            statements.push(exprStatement);
        } catch (error) {
            throw new BareScriptParserError(error.error, line, error.columnNumber, startLineNumber + ixLine);
        }
    }

    // Dangling label definitions?
    if (labelDefs.length > 0) {
        const labelDef = labelDefs.pop();
        const [defKey] = Object.keys(labelDef);
        const def = labelDef[defKey];
        throw new BareScriptParserError(`Missing end${defKey} statement`, def.line, 1, def.lineNumber);
    }

    return script;
}


// BareScript regex
const rScriptLineSplit = /\r?\n/;
const rScriptContinuation = /\\\s*$/;
const rScriptComment = /^\s*(?:#.*)?$/;
const rScriptAssignment = /^\s*(?<name>[A-Za-z_]\w*)\s*=\s*(?<expr>.+)$/;
const rScriptFunctionBegin = new RegExp(
    '^(?<async>\\s*async)?\\s*function\\s+(?<name>[A-Za-z_]\\w*)\\s*\\(' +
        '\\s*(?<args>[A-Za-z_]\\w*(?:\\s*,\\s*[A-Za-z_]\\w*)*)?(?<lastArgArray>\\s*\\.\\.\\.)?\\s*\\)\\s*:\\s*$'
);
const rScriptFunctionArgSplit = /\s*,\s*/;
const rScriptFunctionEnd = /^\s*endfunction\s*$/;
const rScriptLabel = /^\s*(?<name>[A-Za-z_]\w*)\s*:\s*$/;
const rScriptJump = /^(?<jump>\s*(?:jump|jumpif\s*\((?<expr>.+)\)))\s+(?<name>[A-Za-z_]\w*)\s*$/;
const rScriptReturn = /^(?<return>\s*return(?:\s+(?<expr>.+))?)\s*$/;
const rScriptInclude = /^\s*include\s+(?<delim>')(?<url>(?:\\'|[^'])*)'\s*$/;
const rScriptIncludeSystem = /^\s*include\s+(?<delim><)(?<url>[^>]*)>\s*$/;
const rScriptIfBegin = /^\s*if\s+(?<expr>.+)\s*:\s*$/;
const rScriptIfElseIf = /^\s*elif\s+(?<expr>.+)\s*:\s*$/;
const rScriptIfElse = /^\s*else\s*:\s*$/;
const rScriptIfEnd = /^\s*endif\s*$/;
const rScriptForBegin = /^\s*for\s+(?<value>[A-Za-z_]\w*)(?:\s*,\s*(?<index>[A-Za-z_]\w*))?\s+in\s+(?<values>.+)\s*:\s*$/;
const rScriptForEnd = /^\s*endfor\s*$/;
const rScriptWhileBegin = /^\s*while\s+(?<expr>.+)\s*:\s*$/;
const rScriptWhileEnd = /^\s*endwhile\s*$/;
const rScriptBreak = /^\s*break\s*$/;
const rScriptContinue = /^\s*continue\s*$/;


/**
 * Parse a BareScript expression
 *
 * @param {string} exprText - The [expression text](./language/#expressions)
 * @returns {Object} The [expression model](./model/#var.vName='Expression')
 * @throws [BareScriptParserError]{@link module:lib/parser.BareScriptParserError}
 */
export function parseExpression(exprText) {
    try {
        const [expr, nextText] = parseBinaryExpression(exprText);
        if (nextText.trim() !== '') {
            throw new BareScriptParserError('Syntax error', nextText);
        }
        return expr;
    } catch (error) {
        const columnNumber = exprText.length - error.line.length + 1;
        throw new BareScriptParserError(error.error, exprText, columnNumber);
    }
}


// Helper function to parse a binary operator expression chain
function parseBinaryExpression(exprText, binLeftExpr = null) {
    // Parse the binary operator's left unary expression if none was passed
    let leftExpr;
    let binText;
    if (binLeftExpr !== null) {
        binText = exprText;
        leftExpr = binLeftExpr;
    } else {
        [leftExpr, binText] = parseUnaryExpression(exprText);
    }

    // Match a binary operator - if not found, return the left expression
    const matchBinaryOp = binText.match(rExprBinaryOp);
    if (matchBinaryOp === null) {
        return [leftExpr, binText];
    }
    const [, binOp] = matchBinaryOp;
    const rightText = binText.slice(matchBinaryOp[0].length);

    // Parse the right sub-expression
    const [rightExpr, nextText] = parseUnaryExpression(rightText);

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
    return parseBinaryExpression(nextText, binExpr);
}


// Binary operator re-order map
const binaryReorder = {
    '**': new Set(['*', '/', '%', '+', '-', '<=', '<', '>=', '>', '==', '!=', '&&', '||']),
    '*': new Set(['+', '-', '<=', '<', '>=', '>', '==', '!=', '&&', '||']),
    '/': new Set(['+', '-', '<=', '<', '>=', '>', '==', '!=', '&&', '||']),
    '%': new Set(['+', '-', '<=', '<', '>=', '>', '==', '!=', '&&', '||']),
    '+': new Set(['<=', '<', '>=', '>', '==', '!=', '&&', '||']),
    '-': new Set(['<=', '<', '>=', '>', '==', '!=', '&&', '||']),
    '<=': new Set(['==', '!=', '&&', '||']),
    '<': new Set(['==', '!=', '&&', '||']),
    '>=': new Set(['==', '!=', '&&', '||']),
    '>': new Set(['==', '!=', '&&', '||']),
    '==': new Set(['&&', '||']),
    '!=': new Set(['&&', '||']),
    '&&': new Set(['||']),
    '||': new Set([])
};


// Helper function to parse a unary expression
function parseUnaryExpression(exprText) {
    // Group open?
    const matchGroupOpen = exprText.match(rExprGroupOpen);
    if (matchGroupOpen !== null) {
        const groupText = exprText.slice(matchGroupOpen[0].length);
        const [expr, nextText] = parseBinaryExpression(groupText);
        const matchGroupClose = nextText.match(rExprGroupClose);
        if (matchGroupClose === null) {
            throw new BareScriptParserError('Unmatched parenthesis', exprText);
        }
        return [{'group': expr}, nextText.slice(matchGroupClose[0].length)];
    }

    // Unary operator?
    const matchUnary = exprText.match(rExprUnaryOp);
    if (matchUnary !== null) {
        const unaryText = exprText.slice(matchUnary[0].length);
        const [expr, nextText] = parseUnaryExpression(unaryText);
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
                    throw new BareScriptParserError('Syntax error', argText);
                }
                argText = argText.slice(matchFunctionSeparator[0].length);
            }

            // Get the argument
            const [argExpr, nextArgText] = parseBinaryExpression(argText);
            args.push(argExpr);
            argText = nextArgText;
        }

        const fnExpr = {
            'function': {
                'name': matchFunctionOpen[1],
                'args': args
            }
        };
        return [fnExpr, argText];
    }

    // Number?
    const matchNumber = exprText.match(rExprNumber);
    if (matchNumber !== null) {
        const number = parseFloat(matchNumber[1]);
        const expr = {'number': number};
        return [expr, exprText.slice(matchNumber[0].length)];
    }

    // String?
    const matchString = exprText.match(rExprString);
    if (matchString !== null) {
        const string = matchString[1].replace(rExprStringEscape, '$1');
        const expr = {'string': string};
        return [expr, exprText.slice(matchString[0].length)];
    }

    // String (double quotes)?
    const matchStringDouble = exprText.match(rExprStringDouble);
    if (matchStringDouble !== null) {
        const string = matchStringDouble[1].replace(rExprStringDoubleEscape, '$1');
        const expr = {'string': string};
        return [expr, exprText.slice(matchStringDouble[0].length)];
    }

    // Variable?
    const matchVariable = exprText.match(rExprVariable);
    if (matchVariable !== null) {
        const expr = {'variable': matchVariable[1]};
        return [expr, exprText.slice(matchVariable[0].length)];
    }

    // Variable (brackets)?
    const matchVariableEx = exprText.match(rExprVariableEx);
    if (matchVariableEx !== null) {
        const variableName = matchVariableEx[1].replace(rExprVariableExEscape, '$1');
        const expr = {'variable': variableName};
        return [expr, exprText.slice(matchVariableEx[0].length)];
    }

    throw new BareScriptParserError('Syntax error', exprText);
}


// BareScript expression regex
const rExprBinaryOp = /^\s*(\*\*|\*|\/|%|\+|-|<=|<|>=|>|==|!=|&&|\|\|)/;
const rExprUnaryOp = /^\s*(!|-)/;
const rExprFunctionOpen = /^\s*([A-Za-z_]\w+)\s*\(/;
const rExprFunctionSeparator = /^\s*,/;
const rExprFunctionClose = /^\s*\)/;
const rExprGroupOpen = /^\s*\(/;
const rExprGroupClose = /^\s*\)/;
const rExprNumber = /^\s*([+-]?\d+(?:\.\d*)?(?:e[+-]\d+)?)/;
const rExprString = /^\s*'((?:\\\\|\\'|[^'])*)'/;
const rExprStringEscape = /\\([\\'])/g;
const rExprStringDouble = /^\s*"((?:\\\\|\\"|[^"])*)"/;
const rExprStringDoubleEscape = /\\([\\"])/g;
const rExprVariable = /^\s*([A-Za-z_]\w*)/;
const rExprVariableEx = /^\s*\[\s*((?:\\\]|[^\]])+)\s*\]/;
const rExprVariableExEscape = /\\([\\\]])/g;


/**
 * A BareScript parser error
 *
 * @extends {Error}
 * @property {string} error - The error description
 * @property {string} line - The line text
 * @property {number} columnNumber - The error column number
 * @property {?number} lineNumber - The error line number
 */
export class BareScriptParserError extends Error {
    /**
     * Create a BareScript parser error
     *
     * @param {string} error - The error description
     * @param {string} line - The line text
     * @param {number} [columnNumber=1] - The error column number
     * @param {?number} [lineNumber=null] - The error line number
     * @param {?string} [prefix=null] - The error message prefix line
     */
    constructor(error, line, columnNumber = 1, lineNumber = null, prefix = null) {
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
        const message = `\
${prefix !== null ? `${prefix}\n` : ''}${error}${lineNumber !== null ? `, line number ${lineNumber}` : ''}:
${lineError}
${' '.repeat(lineColumn - 1)}^
`;
        super(message);
        this.name = this.constructor.name;
        this.error = error;
        this.line = line;
        this.columnNumber = columnNumber;
        this.lineNumber = lineNumber;
    }
}
