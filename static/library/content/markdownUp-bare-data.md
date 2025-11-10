The "markdownUp.bare: data" section contains functions for visualizing data in MarkdownUp
applications. These functions integrate with the data manipulation functions to create charts and
tables.

Draw a data table:

~~~ bare-script
data = [ \
    {'product': 'Widget', 'sales': 1000, 'profit': 250}, \
    {'product': 'Gadget', 'sales': 1500, 'profit': 400}, \
    {'product': 'Doohickey', 'sales': 800, 'profit': 150} \
]

tableModel = { \
    'fields': ['product', 'sales', 'profit'], \
    'formats': { \
        'sales': {'align': 'right'}, \
        'profit': {'align': 'right'} \
    } \
}

dataTable(data, tableModel)
~~~

Draw a line chart:

~~~ bare-script
chartData = [ \
    {'month': 1, 'revenue': 10000, 'costs': 7000}, \
    {'month': 2, 'revenue': 12000, 'costs': 7500}, \
    {'month': 3, 'revenue': 15000, 'costs': 8000} \
]

chartModel = { \
    'x': 'month', \
    'y': ['revenue', 'costs'], \
    'title': 'Monthly Revenue and Costs' \
}

dataLineChart(chartData, chartModel)
~~~

These functions render visualizations directly into the MarkdownUp document, making it easy to
create data-driven reports and dashboards.
