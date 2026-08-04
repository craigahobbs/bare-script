// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {
    barescriptTypeModel, barescriptValidateExpression, barescriptValidateScript, dataAggregate, dataCalculatedField, dataFilter, dataJoin,
    dataLineChartElements, dataLineChartValidate, dataParseCSV, dataSort, dataTableElements, dataTableMarkdown, dataTableValidate, dataTop,
    dataValidate, elementModelToString, elementModelValidate, includeSetLogFn, markdownElements, markdownElementsAsync, markdownEscape,
    markdownHeaderId, markdownParagraphText, markdownParse, markdownTitle, markdownValidate, qrcodeElements, qrcodeMatrix,
    schemaDocMarkdown, schemaGetEnumValues, schemaGetReferencedTypes, schemaGetStructMembers, schemaParse, schemaTypeModel,
    schemaTypeModelValidate, schemaValidate, urlDecodeComponent, urlDecodeQueryString, urlEncode, urlEncodeComponent, urlEncodeQueryString
} from '../lib/include.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('includeSetLogFn', () => {
    const data = [{'a': 1, 'b': 2}, {'a': 1, 'b': 4}];
    const logs = [];
    try {
        includeSetLogFn((message) => logs.push(message));
        assert.equal(dataAggregate(data, {'invalid': 'model'}), null);
        assert.deepEqual(logs, [
            'schema.bare: Required member "measures" missing',
            'data.bare: dataAggregate - invalid aggregation model'
        ]);

        // Disable logging
        includeSetLogFn(null);
        assert.equal(dataAggregate(data, {'invalid': 'model'}), null);
        assert.deepEqual(logs, [
            'schema.bare: Required member "measures" missing',
            'data.bare: dataAggregate - invalid aggregation model'
        ]);
    } finally {
        includeSetLogFn(null);
    }
});


test('barescriptModel, barescriptTypeModel', () => {
    const typeModel = barescriptTypeModel();
    assert.equal('BareScript' in typeModel, true);
    assert.equal('ScriptStatement' in typeModel, true);
    assert.equal('Expression' in typeModel, true);
});


test('barescriptModel, barescriptValidateExpression', () => {
    const expr = {'number': 1};
    assert.deepEqual(barescriptValidateExpression(expr), expr);
});


test('barescriptModel, barescriptValidateExpression error', () => {
    assert.throws(
        () => {
            barescriptValidateExpression({});
        },
        {
            'name': 'SchemaValidationError',
            'message': 'Invalid value {} (type "object"), expected type "Expression"',
            'memberFqn': null
        }
    );
});


test('barescriptModel, barescriptValidateScript', () => {
    const script = {'statements': []};
    assert.deepEqual(barescriptValidateScript(script), script);
});


test('barescriptModel, barescriptValidateScript error', () => {
    assert.throws(
        () => {
            barescriptValidateScript({});
        },
        {
            'name': 'SchemaValidationError',
            'message': 'Required member "statements" missing',
            'memberFqn': null
        }
    );
});


test('data, dataAggregate', () => {
    const data = [{'a': 1, 'b': 2}, {'a': 1, 'b': 4}];
    assert.deepEqual(dataAggregate(data, {'categories': ['a'], 'measures': [{'field': 'b', 'function': 'sum'}]}), [{'a': 1, 'b': 6}]);
});


test('data, dataCalculatedField', () => {
    assert.deepEqual(dataCalculatedField([{'a': 2}], 'c', 'a * 2'), [{'a': 2, 'c': 4}]);
});


test('data, dataFilter', () => {
    assert.deepEqual(dataFilter([{'a': 1}, {'a': 3}], 'a > aMin', {'aMin': 1}), [{'a': 3}]);
});


test('data, dataJoin', () => {
    assert.deepEqual(dataJoin([{'a': 1, 'b': 2}], [{'a': 1, 'c': 3}], 'a'), [{'a': 1, 'b': 2, 'a2': 1, 'c': 3}]);
});


test('data, dataParseCSV', () => {
    assert.deepEqual(dataParseCSV('a,b\n1,2\n3,4'), [{'a': 1, 'b': 2}, {'a': 3, 'b': 4}]);
});


test('data, dataSort', () => {
    assert.deepEqual(dataSort([{'a': 1}, {'a': 3}], [['a', true]]), [{'a': 3}, {'a': 1}]);
});


test('data, dataTop', () => {
    assert.deepEqual(dataTop([{'a': 1}, {'a': 2}, {'a': 3}], 2), [{'a': 1}, {'a': 2}]);
});


test('data, dataValidate', () => {
    assert.deepEqual(dataValidate([{'a': 1, 'b': 'x'}]), {'a': 'number', 'b': 'string'});
});


test('data, dataValidate error', () => {
    assert.throws(
        () => {
            dataValidate([{'a': 1}, {'a': '2'}]);
        },
        {
            'name': 'SchemaValidationError',
            'message': 'Invalid "a" field value "2", expected type number',
            'memberFqn': null
        }
    );
});


test('dataLineChart, dataLineChartElements', () => {
    const data = [{'a': 1, 'b': 2}, {'a': 2, 'b': 3}];
    const elements = dataLineChartElements(data, {'x': 'a', 'y': ['b'], 'width': 100, 'height': 50});
    assert.equal(elements.svg, 'svg');
});


test('dataLineChart, dataLineChartValidate', () => {
    assert.deepEqual(dataLineChartValidate({'x': 'a', 'y': ['b']}), {'x': 'a', 'y': ['b']});
});


test('dataLineChart, dataLineChartValidate error', () => {
    assert.throws(
        () => {
            dataLineChartValidate({'x': 1, 'y': ['b']});
        },
        {
            'name': 'SchemaValidationError',
            'message': 'Invalid value 1 (type "number") for member "x", expected type "string"',
            'memberFqn': 'x'
        }
    );
});


test('dataTable, dataTableElements', () => {
    assert.deepEqual(dataTableElements([{'a': 1}]), {
        'html': 'table',
        'elem': [
            {'html': 'tr', 'elem': [{'html': 'th', 'attr': null, 'elem': {'text': 'a'}}]},
            {'html': 'tr', 'elem': [{'html': 'td', 'attr': null, 'elem': {'text': '1'}}]}
        ]
    });
});


test('dataTable, dataTableMarkdown', () => {
    assert.deepEqual(dataTableMarkdown([{'a': 1}]), ['| a |', '|---|', '| 1 |']);
});


test('dataTable, dataTableValidate', () => {
    assert.deepEqual(dataTableValidate({'fields': ['a']}), {'fields': ['a']});
});


test('dataTable, dataTableValidate error', () => {
    assert.throws(
        () => {
            dataTableValidate({'fields': 1});
        },
        {
            'name': 'SchemaValidationError',
            'message': 'Invalid value 1 (type "number") for member "fields", expected type "array"',
            'memberFqn': 'fields'
        }
    );
});


test('elementModel, elementModelToString', () => {
    assert.equal(elementModelToString({'html': 'div'}), '<div></div>');
});


test('elementModel, elementModelValidate', () => {
    assert.deepEqual(elementModelValidate({'html': 'div'}), {'html': 'div'});
});


test('elementModel, elementModelValidate error', () => {
    assert.throws(
        () => {
            elementModelValidate({});
        },
        {
            'name': 'SchemaValidationError',
            'message': 'Missing element member {}',
            'memberFqn': null
        }
    );
});


test('markdown, markdownEscape', () => {
    assert.equal(markdownEscape('*text*'), '\\*text\\*');
});


test('markdown, markdownHeaderId', () => {
    assert.equal(markdownHeaderId('Hello, World!'), 'hello-world');
});


test('markdown, markdownParagraphText', () => {
    const markdown = markdownParse('# Title');
    assert.equal(markdownParagraphText(markdown.parts[0].paragraph), 'Title');
});


test('markdown, markdownTitle', () => {
    assert.equal(markdownTitle(markdownParse('# Title')), 'Title');
});


test('markdown, markdownValidate', () => {
    const markdown = {'parts': [{'paragraph': {'style': 'h1', 'spans': [{'text': 'Title'}]}}]};
    assert.deepEqual(markdownValidate(markdown), markdown);
});


test('markdown, markdownValidate error', () => {
    assert.throws(
        () => {
            markdownValidate({'parts': 1});
        },
        {
            'name': 'SchemaValidationError',
            'message': 'Invalid value 1 (type "number") for member "parts", expected type "array"',
            'memberFqn': 'parts'
        }
    );
});


test('markdownElements, markdownElements', () => {
    const markdown = markdownParse('# Title');
    assert.deepEqual(markdownElements(markdown), [{'html': 'h1', 'attr': null, 'elem': [{'text': 'Title'}]}]);
});


test('markdownElements, markdownElementsAsync', async () => {
    const markdown = markdownParse('# Title');
    assert.deepEqual(await markdownElementsAsync(markdown), [{'html': 'h1', 'attr': null, 'elem': [{'text': 'Title'}]}]);
});


test('markdownElements, markdownElementsAsync code block', async () => {
    const markdown = markdownParse('~~~ fenced\nHello\n~~~');
    const options = {'codeBlocks': {'fenced': ([codeBlock]) => ({'html': 'pre', 'elem': {'text': codeBlock.lines.join('\n')}})}};
    assert.deepEqual(await markdownElementsAsync(markdown, options), [{'html': 'pre', 'elem': {'text': 'Hello'}}]);
});


test('markdownElements, markdownElementsAsync async code block', async () => {
    const markdown = markdownParse('~~~ fenced\nHello\n~~~');
    // eslint-disable-next-line require-await
    const codeBlockFn = async ([codeBlock]) => ({'html': 'pre', 'elem': {'text': codeBlock.lines.join('\n')}});
    const options = {'codeBlocks': {'fenced': codeBlockFn}};
    assert.deepEqual(await markdownElementsAsync(markdown, options), [{'html': 'pre', 'elem': {'text': 'Hello'}}]);
});


test('markdownParser, markdownParse', () => {
    assert.deepEqual(markdownParse('# Title'), {'parts': [{'paragraph': {'spans': [{'text': 'Title'}], 'style': 'h1'}}]});
});


test('qrcode, qrcodeElements', () => {
    const elements = qrcodeElements('hello', 100);
    assert.equal(elements.svg, 'svg');
    assert.deepEqual(elements.attr, {'width': 100, 'height': 100});
});


test('qrcode, qrcodeMatrix', () => {
    const matrix = qrcodeMatrix('hello');
    assert.equal(matrix.length, 25);
    assert.equal(matrix[0][0], 1);
});


test('schema, schemaGetEnumValues', () => {
    const types = schemaParse('enum E\n    A\n    B');
    assert.deepEqual(schemaGetEnumValues(types, types.E.enum), [{'name': 'A'}, {'name': 'B'}]);
});


test('schema, schemaGetReferencedTypes', () => {
    const types = schemaParse('# My struct\nstruct S\n    int a');
    assert.deepEqual(schemaGetReferencedTypes(types, 'S'), {
        'S': {'struct': {'name': 'S', 'doc': ['My struct'], 'members': [{'name': 'a', 'type': {'builtin': 'int'}}]}}
    });
});


test('schema, schemaGetStructMembers', () => {
    const types = schemaParse('struct S\n    int a');
    assert.deepEqual(schemaGetStructMembers(types, types.S.struct), [{'name': 'a', 'type': {'builtin': 'int'}}]);
});


test('schemaDoc, schemaDocMarkdown', () => {
    const types = schemaParse('# My struct\nstruct S\n    int a');
    assert.deepEqual(schemaDocMarkdown(types, 'S'), [
        '# struct S',
        '',
        'My struct',
        '',
        '| Name | Type |',
        '|------|------|',
        '| a    | int  |'
    ]);
});


test('schemaTypeModel, schemaTypeModel', () => {
    const types = schemaTypeModel();
    assert.equal('Types' in types, true);
});


test('schemaTypeModel, schemaTypeModelValidate', () => {
    const types = schemaTypeModel();
    assert.deepEqual(schemaTypeModelValidate(types), types);
});


test('schemaTypeModel, schemaTypeModelValidate error', () => {
    assert.throws(
        () => {
            schemaTypeModelValidate({'Bad': {'struct': {}}});
        },
        {
            'name': 'SchemaValidationError',
            'message': 'Required member "Bad.struct.name" missing',
            'memberFqn': null
        }
    );
});


test('url, urlDecodeComponent', () => {
    assert.equal(urlDecodeComponent('a%20b'), 'a b');
});


test('url, urlDecodeQueryString', () => {
    assert.deepEqual(urlDecodeQueryString('a=1&b=x%20y'), {'a': '1', 'b': 'x y'});
});


test('url, urlEncode', () => {
    assert.equal(urlEncode('http://foo.com/a b'), 'http://foo.com/a%20b');
});


test('url, urlEncodeComponent', () => {
    assert.equal(urlEncodeComponent('a b/c'), 'a%20b%2Fc');
});


test('url, urlEncodeQueryString', () => {
    assert.equal(urlEncodeQueryString({'a': 1, 'b': 'x y'}), 'a=1&b=x%20y');
});


test('schema, schemaParse', () => {
    const types = schemaParse(`\
# A test struct
struct TestStruct

    # The test member
    int a
`);
    assert.deepEqual(types, {
        'TestStruct': {
            'struct': {
                'name': 'TestStruct',
                'doc': ['A test struct'],
                'members': [
                    {'name': 'a', 'doc': ['The test member'], 'type': {'builtin': 'int'}}
                ]
            }
        }
    });
});


test('schema, schemaParse error', () => {
    assert.throws(
        () => {
            schemaParse('asdf asdf');
        },
        {
            'name': 'SchemaParserError',
            'message': ':1: error: Syntax error',
            'errors': [':1: error: Syntax error']
        }
    );
});


test('schema, schemaParse types', () => {
    const types = schemaParse('struct S1\n    int a');
    const types2 = schemaParse('struct S2\n    S1 s1', types);
    assert.equal(types2, types);
    assert.deepEqual(types, {
        'S1': {
            'struct': {
                'name': 'S1',
                'members': [
                    {'name': 'a', 'type': {'builtin': 'int'}}
                ]
            }
        },
        'S2': {
            'struct': {
                'name': 'S2',
                'members': [
                    {'name': 's1', 'type': {'user': 'S1'}}
                ]
            }
        }
    });
});


test('schema, schemaParse filename', () => {
    assert.throws(
        () => {
            schemaParse('asdf asdf', null, 'test.smd');
        },
        {
            'name': 'SchemaParserError',
            'message': 'test.smd:1: error: Syntax error',
            'errors': ['test.smd:1: error: Syntax error']
        }
    );
});


test('schema, schemaParse validate', () => {
    assert.throws(
        () => {
            schemaParse('struct S\n    Unknown a');
        },
        {
            'name': 'SchemaParserError',
            'message': ':2: error: Unknown type "Unknown" from "S" member "a"',
            'errors': [':2: error: Unknown type "Unknown" from "S" member "a"']
        }
    );
    assert.deepEqual(schemaParse('struct S\n    Unknown a', null, null, false), {
        'S': {
            'struct': {
                'name': 'S',
                'members': [
                    {'name': 'a', 'type': {'user': 'Unknown'}}
                ]
            }
        }
    });
});


test('schema, schemaValidate', () => {
    const types = schemaParse(`\
# A test struct
struct TestStruct

    # The test member
    int a
`);
    assert.deepEqual(schemaValidate(types, 'TestStruct', {'a': 5}), {'a': 5});
});


test('schema, schemaValidate error', () => {
    const types = schemaParse(`\
# A test struct
struct TestStruct

    # The test member
    int a
`);
    assert.throws(
        () => {
            schemaValidate(types, 'TestStruct', {'a': 'abc'});
        },
        {
            'name': 'SchemaValidationError',
            'message': 'Invalid value "abc" (type "string") for member "a", expected type "int"',
            'memberFqn': 'a'
        }
    );
});


test('schema, schemaValidate error memberFqn', () => {
    const types = schemaParse(`\
# A test struct
struct TestStruct

    # The test member
    int a
`);
    assert.throws(
        () => {
            schemaValidate(types, 'TestStruct', {'a': 'abc'}, 'test');
        },
        {
            'name': 'SchemaValidationError',
            'message': 'Invalid value "abc" (type "string") for member "test.a", expected type "int"',
            'memberFqn': 'test.a'
        }
    );
});
