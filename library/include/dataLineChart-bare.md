The "dataLineChart.bare" include library provides functions for rendering line charts from data arrays.

To render a line chart, use the [dataLineChart](#var.vGroup='dataLineChart.bare'&datalinechart)
function with a data array and a [line chart model](model.html#var.vName='DataLineChart'):

~~~ bare-script
include <dataLineChart.bare>

data = [ \
    {'month': 1, 'sales': 120, 'costs': 80}, \
    {'month': 2, 'sales': 150, 'costs': 90}, \
    {'month': 3, 'sales': 130, 'costs': 85}, \
    {'month': 4, 'sales': 170, 'costs': 95} \
]

dataLineChart(data, { \
    'title': 'Monthly Sales vs Costs', \
    'width': 800, \
    'height': 400, \
    'x': 'month', \
    'y': ['sales', 'costs'] \
})
~~~

You can customize axis tick marks, annotations, and the chart dimensions:

~~~ bare-script
dataLineChart(data, { \
    'title': 'Sales Trend', \
    'x': 'month', \
    'y': ['sales'], \
    'yTicks': {'count': 5}, \
    'yLines': [{'value': 140, 'label': 'Target'}] \
})
~~~

You can use a color encoding field to group lines by a category:

~~~ bare-script
data = [ \
    {'month': 1, 'sales': 120, 'region': 'East'}, \
    {'month': 1, 'sales': 95, 'region': 'West'}, \
    {'month': 2, 'sales': 150, 'region': 'East'}, \
    {'month': 2, 'sales': 110, 'region': 'West'} \
]

dataLineChart(data, { \
    'x': 'month', \
    'y': ['sales'], \
    'color': 'region' \
})
~~~

To obtain the line chart SVG
[element model](https://github.com/craigahobbs/element-model#readme)
instead of rendering directly, use the
[dataLineChartElements](#var.vGroup='dataLineChart.bare'&datalinechartelements) function.

~~~ bare-script
elementModelRender(dataLineChartElements(data, { \
    'x': 'month', \
    'y': ['sales'], \
    'color': 'region' \
}))
~~~
