// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {
    addCalculatedField, aggregateData, compareValues, filterData, joinData, parseCSV, sortData, topData, validateAggregation, validateData
} from '../lib/data.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


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
        {'A': 'a2', 'B': 'null'}
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
        {'A': 3, 'B': '7', 'C': 'null'}
    ];
    assert.deepEqual(validateData(data, true), {
        'A': 'number',
        'B': 'number',
        'C': 'number'
    });
    assert.deepEqual(data, [
        {'A': 1, 'B': 5, 'C': 10},
        {'A': 2, 'B': 6, 'C': null},
        {'A': 3, 'B': 7, 'C': null}
    ]);
});


test('validateData, datetime', () => {
    const data = [
        {'date': new Date(Date.UTC(2022, 7, 30))},
        {'date': '2022-08-30'},
        {'date': '2022-08-30T11:04:00Z'},
        {'date': '2022-08-30T11:04:00-07:00'},
        {'date': null}
    ];
    assert.deepEqual(validateData(data, true), {
        'date': 'datetime'
    });

    // Fixup the date-format above as its affected by the current time zone
    const [, {date}] = data;
    data[1].date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    assert.deepEqual(data, [
        {'date': new Date(Date.UTC(2022, 7, 30))},
        {'date': new Date(Date.UTC(2022, 7, 30))},
        {'date': new Date(Date.UTC(2022, 7, 30, 11, 4))},
        {'date': new Date(Date.UTC(2022, 7, 30, 18, 4))},
        {'date': null}
    ]);
});


test('validateData, datetime string', () => {
    const data = [
        {'date': '2022-08-30'},
        {'date': new Date(Date.UTC(2022, 7, 30))},
        {'date': '2022-08-30T11:04:00Z'},
        {'date': '2022-08-30T11:04:00-07:00'},
        {'date': null}
    ];
    assert.deepEqual(validateData(data, true), {
        'date': 'datetime'
    });

    // Fixup the date-format above as its affected by the current time zone
    const [{date}] = data;
    data[0].date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    assert.deepEqual(data, [
        {'date': new Date(Date.UTC(2022, 7, 30))},
        {'date': new Date(Date.UTC(2022, 7, 30))},
        {'date': new Date(Date.UTC(2022, 7, 30, 11, 4))},
        {'date': new Date(Date.UTC(2022, 7, 30, 18, 4))},
        {'date': null}
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
        {'A': new Date(Date.UTC(2022, 7, 30))},
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
        {'A': new Date(Date.UTC(2022, 7, 30))},
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


test('joinData, options', () => {
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7},
        {'a': 3, 'b': 8}
    ];
    const rightData = [
        {'a': 2, 'c': 10},
        {'a': 4, 'c': 11},
        {'a': 4, 'c': 12}
    ];
    assert.deepEqual(
        joinData(leftData, rightData, 'a', 'a / denominator', true, {'denominator': 2}),
        [
            {'a': 1, 'b': 5, 'a2': 2, 'c': 10},
            {'a': 1, 'b': 6, 'a2': 2, 'c': 10},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 11},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 12}
        ]
    );
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


test('validateAggregation', () => {
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'average'},
            {'field': 'C', 'function': 'average', 'name': 'Average(C)'}
        ]
    };
    assert.deepEqual(validateAggregation(aggregation), aggregation);
});


test('validateAggregation, error', () => {
    const aggregation = {};
    assert.throws(
        () => {
            validateAggregation(aggregation);
        },
        {
            'name': 'ValidationError',
            'message': "Required member 'measures' missing"
        }
    );
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
    validateAggregation(aggregation);
    assert.deepEqual(aggregateData(data, aggregation), [
        {'C': 3}
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
    validateAggregation(aggregation);
    assert.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 3, 'Average(C)': 3},
        {'A': 1, 'B': 2, 'C': 7.5, 'Average(C)': 7.5},
        {'A': 2, 'B': 1, 'C': 9.5, 'Average(C)': 9.5},
        {'A': 2, 'B': 2, 'C': 0, 'Average(C)': 0}
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
    validateAggregation(aggregation);
    assert.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 3},
        {'A': 1, 'B': 2, 'C': 2},
        {'A': 2, 'B': 1, 'C': 2},
        {'A': 2, 'B': 2, 'C': 1}
    ]);
});


test('aggregateData, max', () => {
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
            {'field': 'C', 'function': 'max'}
        ]
    };
    validateAggregation(aggregation);
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
    validateAggregation(aggregation);
    assert.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': null},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 2, 'B': 1, 'C': 9},
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
    validateAggregation(aggregation);
    assert.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 11},
        {'A': 1, 'B': 2, 'C': 15},
        {'A': 2, 'B': 1, 'C': 19},
        {'A': 2, 'B': 2, 'C': 0}
    ]);
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


test('compareValues', () => {
    assert.equal(compareValues(1, 1), 0);
    assert.equal(compareValues(1, 2), -1);
    assert.equal(compareValues(2, 1), 1);
    assert.equal(compareValues(null, null), 0);
    assert.equal(compareValues(null, 1), -1);
    assert.equal(compareValues(1, null), 1);
});


test('compareValues, date', () => {
    const value1 = new Date(Date.UTC(2022, 6, 30));
    const value2 = new Date(Date.UTC(2022, 7, 30));
    assert.equal(compareValues(value1, value1), 0);
    assert.equal(compareValues(value1, value2), -1);
    assert.equal(compareValues(value2, value1), 1);
    assert.equal(compareValues(null, null), 0);
    assert.equal(compareValues(null, value1), -1);
    assert.equal(compareValues(value1, null), 1);
});
