The "dataLineChart.bare" include library provides functions for rendering line charts from data
arrays.

To render a line chart, use the [dataLineChart](#var.vGroup='dataLineChart.bare'&datalinechart)
function with a data array and a [line chart model](model.html#var.vName='DataLineChart'):

```bare-script
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
```

By default each axis computes its own tick marks. The tick step is a "nice" value - one, two, or
five times a power of ten - chosen so the labels fit the space available, and the axis spans the
data, taking the tick step boundaries that fall within it. The range is not rounded outward to a
whole tick step - a step boundary is not a value the axis is expected to open on, and rounding out
to one can leave most of a step empty, half a year for a six-month step. Only a chart too narrow to
fit two boundaries within its data range falls back to the rounded-out range, which is labeled at
both ends. A constant series has no range of its own, so its axis expands around the value - a
decade either side on a logarithmic axis, a day either side on a datetime axis - and the data is
drawn within the chart rather than along its edge. A datetime axis steps by calendar units -
milliseconds through years - labels each tick at the precision of its step, and shows only the part
of a label that changes, so a year or a date is not repeated across the axis.

To hold an axis to a range of your own, set `xMin`, `xMax`, `yMin` and `yMax`. Each is independent -
give only `yMin` to fix a zero baseline and let the top follow the data. The tick marks stay
automatic: the step is the same "nice" value, chosen from the range you asked for, and the tick
marks are the ones that fall inside it, so the axis begins and ends exactly where you said. Data
outside the range is clipped to the chart area, and an explicit bound wins over an annotation - a
`yLines` value outside the range does not widen it:

```bare-script
dataLineChart(data, { \
    'title': 'Utilization', \
    'x': 'month', \
    'y': ['percent'], \
    'yMin': 0, \
    'yMax': 100 \
})
```

Numeric tick labels are compacted when plain decimal notation would need too many digits: large
values take an SI prefix (`12M`, `1.5G`) and small values - or values beyond the SI prefix range -
use exponential notation (`3e-5`, `1e20`). Set `xFormat` or `yFormat` to `decimal`, `si`, or
`exponential` to choose an axis's notation yourself. An annotation with no label of its own is
labeled in its axis's notation too, keeping up to three significant digits:

```bare-script
dataLineChart(data, { \
    'title': 'Revenue', \
    'x': 'month', \
    'y': ['revenue'], \
    'yFormat': 'si' \
})
```

Either axis can use a base-10 logarithmic scale, which plots data spanning many orders of magnitude
- growth curves, response curves, algorithmic complexity - as straight lines. Tick marks land on
whole decades, with sub-tick marks at the intermediate multiples - the one place sub-ticks earn
their ink, since they show the scale's nonlinearity - and a narrow range labels the 1, 2, and 5 of
each decade. Non-positive values cannot be plotted on a logarithmic axis, so they are excluded from
the chart:

```bare-script
dataLineChart(data, { \
    'title': 'Response Curve', \
    'x': 'dose', \
    'y': ['response'], \
    'xScale': 'log' \
})
```

A color encoding field groups lines by a category. The legend is ordered by where each line ends, so
it reads top-to-bottom with the lines; `colorOrder` orders the color assignment, not the legend:

```bare-script
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
```

To obtain the line chart SVG
[element model](https://github.com/craigahobbs/element-model#readme)
instead of rendering directly, use the
[dataLineChartElements](#var.vGroup='dataLineChart.bare'&datalinechartelements) function.

```bare-script
elementModelRender(dataLineChartElements(data, { \
    'x': 'month', \
    'y': ['sales'], \
    'color': 'region' \
}))
```

Every label stays on the chart. A tick label is never shortened - a truncated number would read as a
different number - so the Y-axis makes room for its tick labels and gives up its axis title when
both will not fit. Titles and legend labels are text, so where they must fit they are ellipsized
rather than dropped. The plot area never gives up more than half the chart.

Each series is drawn in its own color. The palette is five semi-precious stone tones - lapis,
carnelian, malachite, garnet and amethyst - placed as far apart as they will go at the width of a
chart line, since color difference shrinks with mark size and a line is a thin mark. Five is as many
as fit there, so past the fifth series the colors repeat with a line dash pattern, giving
twenty-five series before any two are drawn alike. The color legend shows a segment of each line,
dash pattern included.

A chart names itself for assistive technology - `role="img"` with the chart's title as its
accessible name, or a description of what it plots when it has no title. A chart drawn into a
drawing of your own with `drawLineChart` is named by whoever owns that drawing.

Line charts are drawn with the [draw.bare](#var.vGroup='draw.bare') include library. To compose a
chart with other drawing content - several charts on one canvas, or a chart alongside a legend,
annotation, or logo of your own - draw it into the current drawing with the
[drawLineChart](#var.vGroup='dataLineChart.bare'&drawlinechart) function, which takes the chart's
position and size:

```bare-script
include <dataLineChart.bare>

drawNew(640, 720)
drawLineChart(data, {'title': 'Sales', 'x': 'month', 'y': ['sales']}, 0, 0, 640, 360)
drawLineChart(data, {'title': 'Costs', 'x': 'month', 'y': ['costs']}, 0, 360, 640, 360)
drawRender()
```
