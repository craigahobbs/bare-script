The "data.bare" include library manipulates and analyzes data arrays. A **data array** is an array
of objects, one per row, with a value for each field:

```bare-script
include <data.bare>

data = [ \
    {'name': 'Alice', 'age': 30, 'city': 'New York'}, \
    {'name': 'Bob', 'age': 25, 'city': 'Boston'}, \
    {'name': 'Charlie', 'age': 35, 'city': 'New York'} \
]
newYork = dataFilter(data, 'age > 25 && city == "New York"')
```

The filter and calculated-field functions take
[BareScript expressions](https://craigahobbs.github.io/bare-script/language/#expressions), evaluated
for each row with the row's fields as variables and the
[expression library](expression.html) functions available. Data arrays are rendered by the
[dataTable.bare](#var.vGroup='dataTable.bare'&_top) and
[dataLineChart.bare](#var.vGroup='dataLineChart.bare'&_top) include libraries.
