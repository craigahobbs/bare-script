// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {
    addCalculatedField, aggregateData, filterData, joinData, parseCSV, sortData, topData, validateData
} from '../lib/data.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';
import {valueParseDatetime} from '../lib/value.js';


test('parseCSV', () => {
    const data = parseCSV(`\
ColumnA,Column B,ColumnC,ColumnD
1,abc,"10","xyz"
2,def,"11","pdq"
`);
    assert.deepEqual(data, [
        {'ColumnA': '1', 'Column B': 'abc', 'ColumnC': '10', 'ColumnD': 'xyz'},
        {'ColumnA': '2', 'Column B': 'def', 'ColumnC': '11', 'ColumnD': 'pdq'}
    ]);
});


test('parseCSV, array', () => {
    const data = parseCSV([
        'A,B\na1,b1',
        'a2,b2'
    ]);
    assert.deepEqual(data, [
        {'A': 'a1', 'B': 'b1'},
        {'A': 'a2', 'B': 'b2'}
    ]);
});


test('parseCSV, short row', () => {
    const data = parseCSV(`\
A,B
a1,b1
a2
`);
    assert.deepEqual(data, [
        {'A': 'a1', 'B': 'b1'},
        {'A': 'a2', 'B': null}
    ]);
});


test('parseCSV, blank lines', () => {
    const data = parseCSV([
        'A,B',
        '  ',
        'a1,b1',
        '',
        'a2,b2'
    ]);
    assert.deepEqual(data, [
        {'A': 'a1', 'B': 'b1'},
        {'A': 'a2', 'B': 'b2'}
    ]);
});


test('parseCSV, quotes', () => {
    const data = parseCSV(`\
A,B
"a,1",b1
a2,"b,2"
`);
    assert.deepEqual(data, [
        {'A': 'a,1', 'B': 'b1'},
        {'A': 'a2', 'B': 'b,2'}
    ]);
});


test('parseCSV, quotes escaped', () => {
    const data = parseCSV(`\
A,B
"a,""1""",b1
a2,"b,""2"""
`);
    assert.deepEqual(data, [
        {'A': 'a,"1"', 'B': 'b1'},
        {'A': 'a2', 'B': 'b,"2"'}
    ]);
});


test('parseCSV, spaces', () => {
    const data = parseCSV([
        'A,B',
        ' a1,b1 ',
        ' "a2","b2" '
    ]);
    assert.deepEqual(data, [
        {'A': ' a1', 'B': 'b1 '},
        {'A': ' "a2"', 'B': 'b2'}
    ]);
});


test('parseCSV, empty file', () => {
    const data = parseCSV('');
    assert.deepEqual(data, []);
});


test('validateData', () => {
    const data = [
        {'A': 1, 'B': '5', 'C': 10},
        {'A': 2, 'B': '6', 'C': null},
        {'A': 3, 'B': '7', 'C': null}
    ];
    assert.deepEqual(validateData(data), {
        'A': 'number',
        'B': 'string',
        'C': 'number'
    });
    assert.deepEqual(data, [
        {'A': 1, 'B': '5', 'C': 10},
        {'A': 2, 'B': '6', 'C': null},
        {'A': 3, 'B': '7', 'C': null}
    ]);
});


test('validateData, csv', () => {
    const data = [
        {'A': 1, 'B': '5', 'C': 10},
        {'A': 2, 'B': 6, 'C': null},
        {'A': 3, 'B': '7', 'C': 'null'},
        {'A': 4, 'B': 8, 'C': ''}
    ];
    assert.deepEqual(validateData(data, true), {
        'A': 'number',
        'B': 'number',
        'C': 'number'
    });
    assert.deepEqual(data, [
        {'A': 1, 'B': 5, 'C': 10},
        {'A': 2, 'B': 6, 'C': null},
        {'A': 3, 'B': 7, 'C': null},
        {'A': 4, 'B': 8, 'C': null}
    ]);
});


test('validateData, datetime', () => {
    const data = [
        {'date': valueParseDatetime('2022-08-30T00:00:00+00:00')},
        {'date': '2022-08-30'},
        {'date': '2022-08-30T11:04:00Z'},
        {'date': '2022-08-30T11:04:00-07:00'},
        {'date': null}
    ];
    assert.deepEqual(validateData(data, true), {
        'date': 'datetime'
    });

    assert.deepEqual(data, [
        {'date': valueParseDatetime('2022-08-30T00:00:00+00:00')},
        {'date': valueParseDatetime('2022-08-30')},
        {'date': valueParseDatetime('2022-08-30T11:04:00+00:00')},
        {'date': valueParseDatetime('2022-08-30T18:04:00+00:00')},
        {'date': null}
    ]);
});


test('validateData, datetime string', () => {
    const data = [
        {'date': '2022-08-30'},
        {'date': valueParseDatetime('2022-08-30T00:00:00+00:00')},
        {'date': '2022-08-30T11:04:00Z'},
        {'date': '2022-08-30T11:04:00-07:00'},
        {'date': null},
        {'date': 'null'},
        {'date': ''}
    ];
    assert.deepEqual(validateData(data, true), {
        'date': 'datetime'
    });

    assert.deepEqual(data, [
        {'date': valueParseDatetime('2022-08-30')},
        {'date': valueParseDatetime('2022-08-30T00:00:00+00:00')},
        {'date': valueParseDatetime('2022-08-30T11:04:00+00:00')},
        {'date': valueParseDatetime('2022-08-30T18:04:00+00:00')},
        {'date': null},
        {'date': null},
        {'date': null}
    ]);
});


test('validateData, bool', () => {
    const data = [
        {'A': 1, 'B': true},
        {'A': 2, 'B': false},
        {'A': 3, 'B': 'true'},
        {'A': 4, 'B': 'false'},
        {'A': 5, 'B': null}
    ];
    assert.deepEqual(validateData(data, true), {
        'A': 'number',
        'B': 'boolean'
    });
    assert.deepEqual(data, [
        {'A': 1, 'B': true},
        {'A': 2, 'B': false},
        {'A': 3, 'B': true},
        {'A': 4, 'B': false},
        {'A': 5, 'B': null}
    ]);
});


test('validateData, bool string', () => {
    const data = [
        {'A': 1, 'B': 'true'},
        {'A': 2, 'B': 'false'},
        {'A': 3, 'B': true},
        {'A': 4, 'B': false},
        {'A': 5, 'B': null},
        {'A': 5, 'B': 'null'},
        {'A': 5, 'B': ''}
    ];
    assert.deepEqual(validateData(data, true), {
        'A': 'number',
        'B': 'boolean'
    });
    assert.deepEqual(data, [
        {'A': 1, 'B': true},
        {'A': 2, 'B': false},
        {'A': 3, 'B': true},
        {'A': 4, 'B': false},
        {'A': 5, 'B': null},
        {'A': 5, 'B': null},
        {'A': 5, 'B': null}
    ]);
});


test('validateData, unknown', () => {
    const data = [
        {'A': 1, 'B': /^foo/},
        {'A': 2, 'B': /^bar/}
    ];
    assert.deepEqual(validateData(data, true), {
        'A': 'number'
    });
    assert.deepEqual(data, [
        {'A': 1, 'B': /^foo/},
        {'A': 2, 'B': /^bar/}
    ]);
});


test('validateData, undetermined', () => {
    const data = [
        {'A': '', 'B': 'null'},
        {'A': 2, 'B': ''}
    ];
    assert.deepEqual(validateData(data, true), {
        'A': 'number',
        'B': 'string'
    });
    assert.deepEqual(data, [
        {'A': null, 'B': null},
        {'A': 2, 'B': ''}
    ]);
});


test('validateData, number error', () => {
    const data = [
        {'A': 1},
        {'A': '2'}
    ];
    assert.throws(
        () => {
            validateData(data);
        },
        {
            'name': 'Error',
            'message': 'Invalid "A" field value "2", expected type number'
        }
    );
});


test('validateData, number error bool', () => {
    const data = [
        {'A': 1},
        {'A': true}
    ];
    assert.throws(
        () => {
            validateData(data);
        },
        {
            'name': 'Error',
            'message': 'Invalid "A" field value true, expected type number'
        }
    );
});


test('validateData, number error csv', () => {
    const data = [
        {'A': 1},
        {'A': 'abc'}
    ];
    assert.throws(
        () => {
            validateData(data, true);
        },
        {
            'name': 'Error',
            'message': 'Invalid "A" field value "abc", expected type number'
        }
    );
});


test('validateData, datetime error', () => {
    const data = [
        {'A': valueParseDatetime('2022-07-30T00:00:00+00:00')},
        {'A': 2}
    ];
    assert.throws(
        () => {
            validateData(data);
        },
        {
            'name': 'Error',
            'message': 'Invalid "A" field value 2, expected type datetime'
        }
    );
});


test('validateData, datetime error csv', () => {
    const data = [
        {'A': valueParseDatetime('2022-07-30T00:00:00+00:00')},
        {'A': 'abc'}
    ];
    assert.throws(
        () => {
            validateData(data, true);
        },
        {
            'name': 'Error',
            'message': 'Invalid "A" field value "abc", expected type datetime'
        }
    );
});


test('validateData, boolean error', () => {
    const data = [
        {'A': false},
        {'A': 2}
    ];
    assert.throws(
        () => {
            validateData(data);
        },
        {
            'name': 'Error',
            'message': 'Invalid "A" field value 2, expected type boolean'
        }
    );
});


test('validateData, boolean error csv', () => {
    const data = [
        {'A': true},
        {'A': 'abc'}
    ];
    assert.throws(
        () => {
            validateData(data, true);
        },
        {
            'name': 'Error',
            'message': 'Invalid "A" field value "abc", expected type boolean'
        }
    );
});


test('validateData, string error', () => {
    const data = [
        {'A': 'a1'},
        {'A': 2}
    ];
    assert.throws(
        () => {
            validateData(data, true);
        },
        {
            'name': 'Error',
            'message': 'Invalid "A" field value 2, expected type string'
        }
    );
});


test('joinData', () => {
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7},
        {'a': 3, 'b': 8}
    ];
    const rightData = [
        {'a': 1, 'c': 10},
        {'a': 2, 'c': 11},
        {'a': 2, 'c': 12}
    ];
    assert.deepEqual(joinData(leftData, rightData, 'a'), [
        {'a': 1, 'b': 5, 'a2': 1, 'c': 10},
        {'a': 1, 'b': 6, 'a2': 1, 'c': 10},
        {'a': 2, 'b': 7, 'a2': 2, 'c': 11},
        {'a': 2, 'b': 7, 'a2': 2, 'c': 12},
        {'a': 3, 'b': 8}
    ]);
});


test('joinData, left', () => {
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 2, 'b': 7}
    ];
    const rightData = [
        {'a': 1, 'c': 10}
    ];
    assert.deepEqual(joinData(leftData, rightData, 'a'), [
        {'a': 1, 'b': 5, 'a2': 1, 'c': 10},
        {'a': 2, 'b': 7}
    ]);
    assert.deepEqual(joinData(leftData, rightData, 'a', null, true), [
        {'a': 1, 'b': 5, 'a2': 1, 'c': 10}
    ]);
});


test('joinData, variables', () => {
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7}
    ];
    const rightData = [
        {'a': 2, 'c': 10},
        {'a': 4, 'c': 11},
        {'a': 4, 'c': 12}
    ];
    assert.deepEqual(
        joinData(leftData, rightData, 'a', 'a / denominator', null, {'denominator': 2}),
        [
            {'a': 1, 'b': 5, 'a2': 2, 'c': 10},
            {'a': 1, 'b': 6, 'a2': 2, 'c': 10},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 11},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 12}
        ]
    );
});


test('joinData, globals', () => {
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7}
    ];
    const rightData = [
        {'a': 2, 'c': 10},
        {'a': 4, 'c': 11},
        {'a': 4, 'c': 12}
    ];
    assert.deepEqual(
        joinData(leftData, rightData, 'a', 'a / denominator', null, null, {'globals': {'denominator': 2}}),
        [
            {'a': 1, 'b': 5, 'a2': 2, 'c': 10},
            {'a': 1, 'b': 6, 'a2': 2, 'c': 10},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 11},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 12}
        ]
    );
});


test('joinData, globals variables', () => {
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7}
    ];
    const rightData = [
        {'a': 2, 'c': 10},
        {'a': 4, 'c': 11},
        {'a': 4, 'c': 12}
    ];
    assert.deepEqual(
        joinData(leftData, rightData, 'a', 'a / (d1 + d2)', false, {'d1': 1.5}, {'globals': {'d2': 0.5}}),
        [
            {'a': 1, 'b': 5, 'a2': 2, 'c': 10},
            {'a': 1, 'b': 6, 'a2': 2, 'c': 10},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 11},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 12}
        ]
    );
});


test('joinData, unique', () => {
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7},
        {'a': 3, 'b': 8}
    ];
    const rightData = [
        {'a': 1, 'a2': 0, 'c': 10},
        {'a': 2, 'a2': 0, 'c': 11},
        {'a': 2, 'a2': 0, 'c': 12}
    ];
    assert.deepEqual(joinData(leftData, rightData, 'a'), [
        {'a': 1, 'b': 5, 'a2': 0, 'a3': 1, 'c': 10},
        {'a': 1, 'b': 6, 'a2': 0, 'a3': 1, 'c': 10},
        {'a': 2, 'b': 7, 'a2': 0, 'a3': 2, 'c': 11},
        {'a': 2, 'b': 7, 'a2': 0, 'a3': 2, 'c': 12},
        {'a': 3, 'b': 8}
    ]);
});


test('addCalculatedField', () => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 2, 'B': 6}
    ];
    assert.deepEqual(addCalculatedField(data, 'C', 'A * B'), [
        {'A': 1, 'B': 5, 'C': 5},
        {'A': 2, 'B': 6, 'C': 12}
    ]);
});


test('addCalculatedField, variables', () => {
    const data = [
        {'A': 1},
        {'A': 2}
    ];
    assert.deepEqual(addCalculatedField(data, 'C', 'A * B', {'B': 5}), [
        {'A': 1, 'C': 5},
        {'A': 2, 'C': 10}
    ]);
});


test('addCalculatedField, globals', () => {
    const data = [
        {'A': 1},
        {'A': 2}
    ];
    assert.deepEqual(addCalculatedField(data, 'C', 'A * B * X', {'B': 5}, {'globals': {'X': 2}}), [
        {'A': 1, 'C': 10},
        {'A': 2, 'C': 20}
    ]);
});


test('filterData', () => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 6, 'B': 2},
        {'A': 3, 'B': 7}
    ];
    assert.deepEqual(filterData(data, 'A > B'), [
        {'A': 6, 'B': 2}
    ]);
});


test('filterData, variables', () => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 6, 'B': 2},
        {'A': 3, 'B': 7}
    ];
    assert.deepEqual(filterData(data, 'A > test', {'test': 5}), [
        {'A': 6, 'B': 2}
    ]);
});


test('filterData, globals', () => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 6, 'B': 2},
        {'A': 3, 'B': 7}
    ];
    assert.deepEqual(filterData(data, 'A > test * X', {'test': 2.5}, {'globals': {'X': 2}}), [
        {'A': 6, 'B': 2}
    ]);
});


test('aggregateData', () => {
    const data = [
        {'A': 1, 'B': 1, 'C': 4},
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1}
    ];
    const aggregation = {
        'measures': [
            {'field': 'C', 'function': 'average'}
        ]
    };
    assert.deepEqual(aggregateData(data, aggregation), [
        {'C': 4.5}
    ]);
});


test('aggregateData, categories', () => {
    const data = [
        {'A': 1, 'B': 1, 'C': 4},
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'average'},
            {'field': 'C', 'function': 'average', 'name': 'Average(C)'}
        ]
    };
    assert.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 4.5, 'Average(C)': 4.5},
        {'A': 1, 'B': 2, 'C': 7.5, 'Average(C)': 7.5},
        {'A': 2, 'B': 1, 'C': 9.5, 'Average(C)': 9.5},
        {'A': 2, 'B': 2, 'C': null, 'Average(C)': null}
    ]);
});


test('aggregateData, count', () => {
    const data = [
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 1},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'count'}
        ]
    };
    assert.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 2},
        {'A': 1, 'B': 2, 'C': 2},
        {'A': 2, 'B': 1, 'C': 2},
        {'A': 2, 'B': 2, 'C': null}
    ]);
});


test('aggregateData, max', () => {
    const data = [
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 1, 'C': 4},
        {'A': 1, 'B': 1},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'max'}
        ]
    };
    assert.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2, 'C': null}
    ]);
});


test('aggregateData, min', () => {
    const data = [
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 1, 'C': 4},
        {'A': 1, 'B': 1},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'min'}
        ]
    };
    assert.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 4},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 2, 'C': null}
    ]);
});


test('aggregateData, stddev', () => {
    const data = [
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 1},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 10},
        {'A': 2, 'B': 1, 'C': 5},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'stddev'}
        ]
    };
    assert.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 0.5},
        {'A': 1, 'B': 2, 'C': 1.5},
        {'A': 2, 'B': 1, 'C': 2.5},
        {'A': 2, 'B': 2, 'C': null}
    ]);
});


test('aggregateData, sum', () => {
    const data = [
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 1},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'sum'}
        ]
    };
    assert.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 11},
        {'A': 1, 'B': 2, 'C': 15},
        {'A': 2, 'B': 1, 'C': 19},
        {'A': 2, 'B': 2, 'C': null}
    ]);
});


test('aggregateData, invalid model', () => {
    assert.throws(
        () => {
            aggregateData([], {});
        },
        {
            'name': 'ValidationError',
            'message': "Required member 'measures' missing"
        }
    );
});


test('sortData', () => {
    const data = [
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1},
        {'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    assert.deepEqual(sortData(data, [['A', true], ['B']]), [
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2},
        {'A': 1},
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 2, 'C': 8},
        {'B': 2, 'C': 7}
    ]);
});


test('topData', () => {
    const data = [
        {'A': 'abc', 'B': 1, 'C': 1},
        {'A': 'abc', 'B': 1, 'C': 2},
        {'A': 'abc', 'B': 1, 'C': 3},
        {'A': 'abc', 'B': 2, 'C': 1},
        {'A': 'abc', 'B': 2, 'C': 2},
        {'A': 'def', 'B': 1, 'C': 1},
        {'A': 'ghi', 'C': 1}
    ];
    assert.deepEqual(topData(data, 2, ['A', 'B']), [
        {'A': 'abc', 'B': 1, 'C': 1},
        {'A': 'abc', 'B': 1, 'C': 2},
        {'A': 'abc', 'B': 2, 'C': 1},
        {'A': 'abc', 'B': 2, 'C': 2},
        {'A': 'def', 'B': 1, 'C': 1},
        {'A': 'ghi', 'C': 1}
    ]);
    assert.deepEqual(topData(data, 1, ['A']), [
        {'A': 'abc', 'B': 1, 'C': 1},
        {'A': 'def', 'B': 1, 'C': 1},
        {'A': 'ghi', 'C': 1}
    ]);
    assert.deepEqual(topData(data, 3), [
        {'A': 'abc', 'B': 1, 'C': 1},
        {'A': 'abc', 'B': 1, 'C': 2},
        {'A': 'abc', 'B': 1, 'C': 3}
    ]);
});
