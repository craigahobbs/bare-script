Data functions provide operations for manipulating and analyzing arrays of data objects (also known
as data tables or datasets). These functions enable filtering, sorting, aggregating, joining, and
transforming tabular data.

A data array is an array of objects where each object represents a row:

~~~ bare-script
data = [ \
    {'name': 'Alice', 'age': 30, 'city': 'New York'}, \
    {'name': 'Bob', 'age': 25, 'city': 'Boston'}, \
    {'name': 'Charlie', 'age': 35, 'city': 'New York'} \
]
~~~

You can filter data using expressions:

~~~ bare-script
# Filter for people over 25 in New York
filtered = dataFilter(data, 'age > 25 && city == "New York"')
~~~

Sort data by one or more fields:

~~~ bare-script
# Sort by city ascending, then age descending
sorted = dataSort(data, [['city', false], ['age', true]])
~~~

Add calculated fields to your data:

~~~ bare-script
# Add a field that combines name and city
dataCalculatedField(data, 'location', 'name + ", " + city')
~~~

Aggregate data to compute summaries:

~~~ bare-script
aggregation = { \
    'categories': ['city'], \
    'measures': [ \
        {'field': 'age', 'function': 'average', 'name': 'avgAge'}, \
        {'field': 'city', 'function': 'count', 'name': 'count'} \
    ] \
}
summary = dataAggregate(data, aggregation)
~~~

Join two data arrays:

~~~ bare-script
cities = [ \
    {'city': 'New York', 'state': 'NY'}, \
    {'city': 'Boston', 'state': 'MA'} \
]
joined = dataJoin(data, cities, 'city')
~~~

Parse CSV text into a data array:

~~~ bare-script
csv = 'name,age,city\nAlice,30,New York\nBob,25,Boston'
data = dataParseCSV(csv)
~~~
