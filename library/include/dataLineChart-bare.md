The "dataLineChart.bare" include library renders line charts from
[data arrays](#var.vGroup='data.bare'&_top). Describe a chart with a
[line chart model](model.html#var.vName='DataLineChart') - its member documentation covers the axis
ranges, scales, tick label formats, annotations, and color encoding.

```bare-script
include <dataLineChart.bare>

data = [ \
    {'month': 1, 'sales': 120, 'costs': 80}, \
    {'month': 2, 'sales': 150, 'costs': 90}, \
    {'month': 3, 'sales': 130, 'costs': 85}, \
    {'month': 4, 'sales': 170, 'costs': 95} \
]
dataLineChart(data, {'title': 'Monthly Sales vs Costs', 'x': 'month', 'y': ['sales', 'costs']})
```

To obtain the chart's SVG element model instead of rendering it, use
[dataLineChartElements](#var.vGroup='dataLineChart.bare'&datalinechartelements). To draw a chart
within the current [drawing](#var.vGroup='draw.bare'&_top), use
[drawLineChart](#var.vGroup='dataLineChart.bare'&drawlinechart).
