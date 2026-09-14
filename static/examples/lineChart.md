# dataLineChart Demo

This [MarkdownUp](https://craigahobbs.github.io/markdown-up/) application exercises every
capability of the [dataLineChart.bare](https://craigahobbs.github.io/bare-script/library/#var.vGroup='dataLineChart.bare')
include library using real-world data. Each section names the
[line chart model](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='DataLineChart')
members it demonstrates, and every chart is preceded by its model as JSON, so what the chart draws
can be read against what the model asks for.

The figures below are drawn from public sources - NASA GISTEMP, the U.S. Energy Information
Administration, the U.S. Census Bureau, the European Central Bank, and published chip
specifications - rounded and abridged for the demo.

- [1. A single series](#1-a-single-series)
- [2. Title, width, and height](#2-title-width-and-height)
- [3. Axis annotations](#3-axis-annotations)
- [4. Explicit axis bounds](#4-explicit-axis-bounds)
- [5. Axis padding](#5-axis-padding)
- [6. Multiple Y-axis fields](#6-multiple-y-axis-fields)
- [7. Color encoding](#7-color-encoding)
- [8. Color order](#8-color-order)
- [9. Many series](#9-many-series)
- [10. Sparse data](#10-sparse-data)
- [11. A datetime X-axis](#11-a-datetime-x-axis)
- [12. Datetime format](#12-datetime-format)
- [13. A logarithmic Y-axis](#13-a-logarithmic-y-axis)
- [14. Log-log](#14-log-log)
- [15. Number formats](#15-number-formats)
- [16. Precision](#16-precision)
- [17. Font size](#17-font-size)
- [18. Composing charts with drawLineChart](#18-composing-charts-with-drawlinechart)
- [19. Annotations drawn on the chart](#19-annotations-drawn-on-the-chart)
- [20. Chart element models](#20-chart-element-models)
- [21. Model validation](#21-model-validation)
- [22. Edge cases](#22-edge-cases)

```markdown-script
include <data.bare>
include <dataLineChart.bare>
include <markdown.bare>

documentSetTitle('dataLineChart Demo')

# Render a chart model as a JSON code block
function demoModel(model):
    markdownPrint('', '~~~', demoModelLines(model, ''), '~~~')
endfunction


# The model's JSON lines - a member is compacted onto one line where it fits within the width below,
# and expanded a member per line where it does not, so a model reads in a few lines and none of them
# runs off the page
demoModelWidth = 100

function demoModelLines(model, indent):
    isArray = systemType(model) == 'array'
    items = if(isArray, model, objectKeys(model))
    itemIndent = indent + '    '
    lines = [indent + if(isArray, '[', '{')]
    for item, ixItem in items:
        comma = if(ixItem + 1 < arrayLength(items), ',', '')
        prefix = if(isArray, '', jsonStringify(item) + ': ')
        value = if(isArray, item, objectGet(model, item))
        valueType = systemType(value)
        line = itemIndent + prefix + demoJSON(value) + comma
        if (valueType != 'object' && valueType != 'array') || stringLength(line) <= demoModelWidth:
            arrayPush(lines, line)
        else:
            valueLines = demoModelLines(value, itemIndent)
            arraySet(valueLines, 0, itemIndent + prefix + stringTrim(arrayGet(valueLines, 0)))
            ixLast = arrayLength(valueLines) - 1
            arraySet(valueLines, ixLast, arrayGet(valueLines, ixLast) + comma)
            arrayExtend(lines, valueLines)
        endif
    endfor
    arrayPush(lines, indent + if(isArray, ']', '}'))
    return lines
endfunction


# A value as one line of JSON - jsonStringify with no indent packs it tighter than is comfortable to
# read, so this is the same thing with a space after each colon and comma
function demoJSON(value):
    type = systemType(value)
    if type == 'object':
        parts = []
        for key in objectKeys(value):
            arrayPush(parts, jsonStringify(key) + ': ' + demoJSON(objectGet(value, key)))
        endfor
        return '{' + arrayJoin(parts, ', ') + '}'
    elif type == 'array':
        parts = []
        for item in value:
            arrayPush(parts, demoJSON(item))
        endfor
        return '[' + arrayJoin(parts, ', ') + ']'
    endif
    return jsonStringify(value)
endfunction


# Render a line chart, preceded by its model
function demoChart(data, lineChart, options):
    demoModel(lineChart)
    dataLineChart(data, lineChart, options)
endfunction


# Draw an arrow that points from (x1, y1) to (x2, y2), stopping "gap" pixels short of the point so
# that the head does not touch what it points at. The head's base and half-width are measured along
# the arrow's own direction, so the head stays symmetric at any angle, and the shaft stops at that
# base rather than running on under the head.
function demoArrow(x1, y1, x2, y2, gap, color):
    headLength = 11
    headWidth = 4.5
    dx = x2 - x1
    dy = y2 - y1
    length = mathSqrt(dx * dx + dy * dy)
    ux = dx / length
    uy = dy / length
    tipX = x2 - gap * ux
    tipY = y2 - gap * uy
    baseX = tipX - headLength * ux
    baseY = tipY - headLength * uy

    drawStyle(color, 1.5, 'none')
    drawMove(x1, y1)
    drawLine(baseX, baseY)

    drawStyle('none', 0, color)
    drawMove(tipX, tipY)
    drawLine(baseX - headWidth * uy, baseY + headWidth * ux)
    drawLine(baseX + headWidth * uy, baseY - headWidth * ux)
    drawClose()
endfunction
```


## 1. A single series

The minimum model is an X field and one Y field. The Y-axis range is rounded outward to a whole
tick step and the X-axis spans its data - see [5. Axis padding](#5-axis-padding) - and both axis
titles come from the field names. With a single series and no color encoding there is no legend.

Global mean surface temperature anomaly, in degrees Celsius relative to the 1951-1980 average
(NASA GISTEMP v4, annual):

```markdown-script
# Global mean surface temperature anomaly (NASA GISTEMP v4), degrees C vs. the 1951-1980 mean
temperatureAnomalies = [ \
    0.26, 0.32, 0.14, 0.31, 0.16, 0.12, 0.18, 0.32, 0.39, 0.27, \
    0.45, 0.41, 0.22, 0.23, 0.32, 0.45, 0.33, 0.46, 0.61, 0.38, \
    0.39, 0.54, 0.63, 0.62, 0.53, 0.68, 0.64, 0.66, 0.54, 0.66, \
    0.72, 0.61, 0.65, 0.68, 0.75, 0.90, 1.01, 0.92, 0.85, 0.98, \
    1.01, 0.85, 0.89, 1.17, 1.28 \
]
temperatureData = []
for anomaly, ixYear in temperatureAnomalies:
    arrayPush(temperatureData, {'Year': 1980 + ixYear, 'Anomaly (°C)': anomaly})
endfor

demoChart(temperatureData, {'x': 'Year', 'y': ['Anomaly (°C)']})
```


## 2. Title, width, and height

**title** names the chart, **width** and **height** size it in pixels (the default is 640 by 320).
Everything else scales to fit: the same chart at 800 by 400 admits more X-axis ticks, and at 320 by
180 the tick-fitting loop drops back to the ticks that fit without overlapping.

```markdown-script
demoChart(temperatureData, { \
    'title': 'Global Temperature Anomaly, 1980-2024', \
    'width': 800, \
    'height': 400, \
    'x': 'Year', \
    'y': ['Anomaly (°C)'] \
})

demoChart(temperatureData, { \
    'title': 'Global Temperature Anomaly, 1980-2024', \
    'width': 320, \
    'height': 180, \
    'x': 'Year', \
    'y': ['Anomaly (°C)'] \
})
```


## 3. Axis annotations

**xLines** and **yLines** draw reference lines across the plot. An annotation with a **label**
carries that text, and an annotation with no label is labeled with its value in the axis's own
notation and decimal count - the 1.0 °C line below reads `1.0`, like the ticks beside it, and an
annotation whose value is finer than the tick step keeps the decimals it needs. An annotation
outside the data range extends the axis to include it, which is how the 1.5 °C line pulls the Y-axis
up past the data.

A baseline at zero is the axis's job, not an annotation's: **yMin** puts it there as the end of the
scale, where an annotation would instead draw a heavy black rule on top of the axis line.

```markdown-script
demoChart(temperatureData, { \
    'title': 'Warming Against the Paris Agreement Target', \
    'width': 800, \
    'height': 400, \
    'x': 'Year', \
    'y': ['Anomaly (°C)'], \
    'yMin': 0, \
    'yLines': [ \
        {'value': 1.5, 'label': 'Paris Agreement target'}, \
        {'value': 1.0} \
    ], \
    'xLines': [ \
        {'value': 1997, 'label': 'Kyoto Protocol'}, \
        {'value': 2015, 'label': 'Paris Agreement'} \
    ] \
})
```


## 4. Explicit axis bounds

**xMin**, **xMax**, **yMin**, and **yMax** replace the computed bounds. A fixed bound is exact -
the axis is not rounded outward past it - and a line segment that leaves the plot area is clipped at
its edge rather than drawn outside it. Cropping the series to the 21st century and to the 0.5 to
1.2 °C band clips it at both: the line enters at the left edge above 2000 and runs off the top in
2023.

```markdown-script
demoChart(temperatureData, { \
    'title': 'Cropped to 2000-2024 and to 0.5-1.2 °C', \
    'width': 800, \
    'height': 400, \
    'x': 'Year', \
    'y': ['Anomaly (°C)'], \
    'xMin': 2000, \
    'xMax': 2024, \
    'yMin': 0.5, \
    'yMax': 1.2 \
})
```

A single bound works too - fixing only **yMin** at zero keeps the automatic maximum, which is the
usual way to stop a chart from exaggerating a trend.

```markdown-script
demoChart(temperatureData, { \
    'title': 'Zero-Based Y-Axis', \
    'width': 800, \
    'height': 400, \
    'x': 'Year', \
    'y': ['Anomaly (°C)'], \
    'yMin': 0 \
})
```


## 5. Axis padding

**yPad** and **xPad** round an axis's range outward to a whole tick step, so that the data stops
short of the axis's ends. The Y-axis pads by default and the X-axis does not, which is where each is
usually wanted. A measured value is read against the gridlines, so its extremes want a labeled tick
at or beyond them - without one, the highest point on the chart sits above everything the axis
labels. An X-axis is usually the independent variable over a range the reader already knows, and
rounding a year of dates out into the next year invents range the data does not have.

The default, and each override:

```markdown-script
demoChart(temperatureData, { \
    'title': 'Default - the Y-axis pads, the X-axis does not', \
    'width': 800, \
    'height': 300, \
    'x': 'Year', \
    'y': ['Anomaly (°C)'] \
})

demoChart(temperatureData, { \
    'title': "yPad: false - the Y-axis ends at the data", \
    'width': 800, \
    'height': 300, \
    'x': 'Year', \
    'y': ['Anomaly (°C)'], \
    'yPad': false \
})

demoChart(temperatureData, { \
    'title': "xPad: true - the X-axis rounds out to whole tick steps", \
    'width': 800, \
    'height': 300, \
    'x': 'Year', \
    'y': ['Anomaly (°C)'], \
    'xPad': true \
})
```

Two notes. An explicit bound wins: **yMin**, **yMax**, **xMin**, and **xMax** are exact, so padding
never carries an axis past an end the caller pinned. And a logarithmic axis always rounds its range
outward to whole decades, whatever the padding members say - a decade end is what its 1, 2, and 5
tick marks are laid out from.


## 6. Multiple Y-axis fields

**y** takes any number of fields, one line each, colored in field order and named in the legend.
With more than one Y field the chart has no Y-axis title - the legend names the series instead.

U.S. median sale price of a new home against median household income (Census Bureau):

```markdown-script
housingData = [ \
    {'Year': 1990, 'New Home Price': 122900, 'Household Income': 29943}, \
    {'Year': 1995, 'New Home Price': 133900, 'Household Income': 34076}, \
    {'Year': 2000, 'New Home Price': 169000, 'Household Income': 41990}, \
    {'Year': 2005, 'New Home Price': 240900, 'Household Income': 46326}, \
    {'Year': 2010, 'New Home Price': 221800, 'Household Income': 49276}, \
    {'Year': 2015, 'New Home Price': 296400, 'Household Income': 56516}, \
    {'Year': 2020, 'New Home Price': 336900, 'Household Income': 67521}, \
    {'Year': 2022, 'New Home Price': 457800, 'Household Income': 74580}, \
    {'Year': 2024, 'New Home Price': 419200, 'Household Income': 80610} \
]

demoChart(housingData, { \
    'title': 'U.S. New Home Price and Household Income', \
    'width': 800, \
    'height': 400, \
    'x': 'Year', \
    'y': ['New Home Price', 'Household Income'] \
})
```


## 7. Color encoding

**color** names a field whose values each become a line - the shape most real data arrives in, one
row per observation. The Y-axis keeps its title because there is still a single Y field.

U.S. electricity net generation by source, in terawatt-hours (EIA):

```markdown-script
# U.S. electricity net generation by source, terawatt-hours (EIA)
generationYears = [2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024]
generationSources = { \
    'Coal': [1847, 1514, 1582, 1239, 1146, 774, 831, 653], \
    'Natural Gas': [987, 1225, 1126, 1380, 1482, 1624, 1689, 1855], \
    'Nuclear': [807, 769, 797, 805, 807, 790, 772, 782], \
    'Wind': [95, 141, 182, 227, 275, 338, 435, 453], \
    'Solar': [1, 4, 18, 36, 63, 89, 146, 219], \
    'Hydro': [260, 276, 259, 268, 292, 285, 254, 242], \
    'Petroleum': [37, 23, 30, 24, 25, 17, 23, 17], \
    'Other': [56, 57, 64, 62, 63, 57, 55, 53] \
}
generationData = []
for generationSource in objectKeys(generationSources):
    for generationValue, ixGenerationYear in objectGet(generationSources, generationSource):
        arrayPush(generationData, { \
            'Year': arrayGet(generationYears, ixGenerationYear), \
            'Source': generationSource, \
            'TWh': generationValue \
        })
    endfor
endfor

# The four largest sources
generationMajor = dataFilter(generationData, \
    "Source == 'Coal' || Source == 'Natural Gas' || Source == 'Nuclear' || Source == 'Wind'")

demoChart(generationMajor, { \
    'title': 'U.S. Electricity Generation by Source', \
    'width': 800, \
    'height': 400, \
    'x': 'Year', \
    'y': ['TWh'], \
    'color': 'Source' \
})
```

The legend is ordered by where each line ends, topmost first, so it reads in the same order as the
lines - note that gas, nuclear, coal, wind is the order of the lines at the right edge, not the
alphabetical order the colors were assigned in.


## 8. Color order

Without **colorOrder** the color encoding values are sorted and colored in that order. **colorOrder**
assigns the colors in the order listed instead - here natural gas takes the first color rather than
coal - and any value not listed follows in sorted order. It orders the *colors*; the legend still
reads with the lines.

```markdown-script
demoChart(generationMajor, { \
    'title': 'Same Data, Colors Assigned by colorOrder', \
    'width': 800, \
    'height': 400, \
    'x': 'Year', \
    'y': ['TWh'], \
    'color': 'Source', \
    'colorOrder': ['Natural Gas', 'Coal', 'Nuclear'] \
})
```


## 9. Many series

The palette is five colors. A sixth series repeats the first color with a dash pattern, a
seventh the second color with that pattern, and so on - twenty-five series before any two are
drawn alike. All eight generation sources:

```markdown-script
demoChart(generationData, { \
    'title': 'U.S. Electricity Generation, All Sources', \
    'width': 800, \
    'height': 400, \
    'x': 'Year', \
    'y': ['TWh'], \
    'color': 'Source' \
})
```

The legend line samples are segments of the lines themselves, so a dashed series can be matched to
its legend entry without relying on color alone.


## 10. Sparse data

A data array is a table, not one series per row: a row that has no value for a field simply does
not measure that series there, so the line continues through it. This is what lets several series
of different sampling rates share one array.

An indoor sensor reporting every five minutes alongside an outdoor sensor reporting every fifteen:

```markdown-script
sensorIndoor = [21.4, 21.5, 21.5, 21.6, 21.8, 22.0, 22.1, 22.1, 22.0, 21.9, 21.8, 21.8, 21.9]
sensorOutdoor = [8.2, null, null, 9.1, null, null, 10.4, null, null, 11.2, null, null, 11.9]
sensorData = []
for sensorValue, ixSensor in sensorIndoor:
    sensorRow = {'Minute': 5 * ixSensor, 'Indoor (°C)': sensorValue}
    sensorOutdoorValue = arrayGet(sensorOutdoor, ixSensor)
    if sensorOutdoorValue != null:
        objectSet(sensorRow, 'Outdoor (°C)', sensorOutdoorValue)
    endif
    arrayPush(sensorData, sensorRow)
endfor

demoChart(sensorData, { \
    'title': 'Two Sensors, Different Sampling Rates', \
    'width': 800, \
    'height': 400, \
    'x': 'Minute', \
    'y': ['Indoor (°C)', 'Outdoor (°C)'] \
})
```


## 11. A datetime X-axis

A datetime X field is charted directly. The tick step is chosen in datetime units - years, months,
days, hours, minutes, or seconds - and each tick label drops the part it repeats from the label
before it. The hourly chart below reads `2024-06-11, 06:00, 12:00, 18:00` rather than repeating the
date at every tick.

U.S. retail e-commerce sales, quarterly, in billions of dollars (Census Bureau):

```markdown-script
# U.S. retail e-commerce sales, quarterly, billions of dollars (Census Bureau)
ecommerceSales = [ \
    128, 138, 145, 187, \
    160, 211, 209, 247, \
    205, 222, 226, 274, \
    224, 246, 254, 300, \
    244, 267, 274, 325, \
    265, 292, 300, 352 \
]
ecommerceData = []
for ecommerceValue, ixQuarter in ecommerceSales:
    arrayPush(ecommerceData, { \
        'Quarter': datetimeNew(2019 + mathFloor(ixQuarter / 4), 1 + 3 * (ixQuarter % 4), 1), \
        'Sales ($B)': ecommerceValue \
    })
endfor

demoChart(ecommerceData, { \
    'title': 'U.S. Retail E-Commerce Sales', \
    'width': 800, \
    'height': 400, \
    'x': 'Quarter', \
    'y': ['Sales ($B)'] \
})
```

At hour resolution the axis switches to hour labels on its own. An annotation value is a datetime
here, like the axis it annotates - the three deploys below are marked with **xLines**, and only the
first carries a label, since an annotation whose label is the empty string draws the line alone.
Repeating "Deploy" three times would say nothing the first label has not.

API response-time percentiles over one day, with a spike at 14:00 that lines up with a deploy:

```markdown-script
latencyP50 = [42, 39, 37, 36, 36, 38, 45, 58, 72, 81, 86, 88, 91, 95, 112, 98, 90, 84, 79, 71, 63, 55, 49, 44]
latencyP90 = [110, 101, 96, 94, 95, 99, 118, 152, 190, 214, 228, 233, 241, 252, 340, 262, 238, 222, 209, 188, 167, 145, 129, 116]
latencyP99 = [380, 350, 332, 325, 328, 342, 408, 525, 656, 740, 788, 806, 833, 872, 1840, 905, 823, 768, 722, 650, 577, 501, 446, 401]
latencyData = []
for latencyValue, ixHour in latencyP50:
    arrayPush(latencyData, { \
        'Time': datetimeNew(2024, 6, 11, ixHour), \
        'p50 (ms)': latencyValue, \
        'p90 (ms)': arrayGet(latencyP90, ixHour), \
        'p99 (ms)': arrayGet(latencyP99, ixHour) \
    })
endfor

demoChart(latencyData, { \
    'title': 'API Response Time Percentiles', \
    'width': 800, \
    'height': 400, \
    'x': 'Time', \
    'y': ['p50 (ms)', 'p90 (ms)', 'p99 (ms)'], \
    'xLines': [ \
        {'value': datetimeNew(2024, 6, 11, 8), 'label': 'Deploy'}, \
        {'value': datetimeNew(2024, 6, 11, 14), 'label': ''}, \
        {'value': datetimeNew(2024, 6, 11, 20), 'label': ''} \
    ] \
})
```


## 12. Datetime format

**datetime** overrides the computed datetime format with `year`, `month`, or `day`. Two years of the
quarterly series is short enough that the automatic format is month labels - `2019-01, 04, 07, 10,
2020-01, ...` - which the two overrides then coarsen and widen:

```markdown-script
ecommerceTwoYears = arraySlice(ecommerceData, 0, 8)

demoChart(ecommerceTwoYears, { \
    'title': 'Automatic - month labels', \
    'width': 800, \
    'height': 300, \
    'x': 'Quarter', \
    'y': ['Sales ($B)'] \
})

demoChart(ecommerceTwoYears, { \
    'title': "datetime: 'year'", \
    'width': 800, \
    'height': 300, \
    'x': 'Quarter', \
    'y': ['Sales ($B)'], \
    'datetime': 'year' \
})

demoChart(ecommerceTwoYears, { \
    'title': "datetime: 'day'", \
    'width': 800, \
    'height': 300, \
    'x': 'Quarter', \
    'y': ['Sales ($B)'], \
    'datetime': 'day' \
})
```

An override coarser than the tick step repeats itself - the year chart labels four quarterly ticks
`2020` - because a label is trimmed only of the context it shares with the label before it, and
these labels share all of it.


## 13. A logarithmic Y-axis

**yScale** set to `log` gives a base-10 logarithmic Y-axis. Its ticks fall on powers of ten - or on
1, 2, and 5 within a decade when the range is narrow enough for that - with sub-tick marks between
them. This is the only axis that draws sub-ticks, because it is the only one the eye cannot
interpolate. Each label is scaled by its own decade rather than by one exponent shared across the
axis, which is what keeps the labels below from reading `0.000001G`.

Transistor count of a representative processor by year of introduction. Fifty years of
exponential growth is a straight line on this scale:

```markdown-script
transistorData = [ \
    {'Year': 1971, 'Transistors': 2300}, \
    {'Year': 1974, 'Transistors': 6000}, \
    {'Year': 1978, 'Transistors': 29000}, \
    {'Year': 1982, 'Transistors': 134000}, \
    {'Year': 1985, 'Transistors': 275000}, \
    {'Year': 1989, 'Transistors': 1180000}, \
    {'Year': 1993, 'Transistors': 3100000}, \
    {'Year': 1997, 'Transistors': 7500000}, \
    {'Year': 1999, 'Transistors': 9500000}, \
    {'Year': 2000, 'Transistors': 42000000}, \
    {'Year': 2003, 'Transistors': 220000000}, \
    {'Year': 2006, 'Transistors': 291000000}, \
    {'Year': 2008, 'Transistors': 731000000}, \
    {'Year': 2012, 'Transistors': 1400000000}, \
    {'Year': 2015, 'Transistors': 5560000000}, \
    {'Year': 2017, 'Transistors': 19200000000}, \
    {'Year': 2019, 'Transistors': 39540000000}, \
    {'Year': 2022, 'Transistors': 114000000000}, \
    {'Year': 2023, 'Transistors': 134000000000} \
]

demoChart(transistorData, { \
    'title': "Moore's Law - Transistors per Processor", \
    'width': 800, \
    'height': 400, \
    'x': 'Year', \
    'y': ['Transistors'], \
    'yScale': 'log' \
})
```

A log axis is also what makes a percentile chart readable when the percentiles are an order of
magnitude apart - the same latency data as above, where the p50 line was flat against the bottom:

```markdown-script
demoChart(latencyData, { \
    'title': 'API Response Time Percentiles, Log Scale', \
    'width': 800, \
    'height': 400, \
    'x': 'Time', \
    'y': ['p50 (ms)', 'p90 (ms)', 'p99 (ms)'], \
    'yScale': 'log' \
})
```


## 14. Log-log

**xScale** takes the same values, so both axes can be logarithmic. Zipf's law - a word's frequency
in a corpus against its frequency rank - is the canonical straight line on log-log axes (Brown
corpus, abridged):

```markdown-script
zipfData = [ \
    {'Rank': 1, 'Occurrences': 69971}, \
    {'Rank': 2, 'Occurrences': 36411}, \
    {'Rank': 3, 'Occurrences': 28852}, \
    {'Rank': 4, 'Occurrences': 26149}, \
    {'Rank': 5, 'Occurrences': 23237}, \
    {'Rank': 10, 'Occurrences': 9543}, \
    {'Rank': 20, 'Occurrences': 4370}, \
    {'Rank': 50, 'Occurrences': 1960}, \
    {'Rank': 100, 'Occurrences': 1010}, \
    {'Rank': 200, 'Occurrences': 510}, \
    {'Rank': 500, 'Occurrences': 215}, \
    {'Rank': 1000, 'Occurrences': 110}, \
    {'Rank': 2000, 'Occurrences': 54}, \
    {'Rank': 5000, 'Occurrences': 21}, \
    {'Rank': 10000, 'Occurrences': 9} \
]

demoChart(zipfData, { \
    'title': "Zipf's Law - Word Frequency by Rank", \
    'width': 800, \
    'height': 400, \
    'x': 'Rank', \
    'y': ['Occurrences'], \
    'xScale': 'log', \
    'yScale': 'log' \
})
```


## 15. Number formats

Numeric tick labels compact themselves: SI prefixes once the largest magnitude reaches a million
and the prefixes cover the axis, exponential notation when they do not, and plain decimals
otherwise. **xFormat** and **yFormat** override the choice per axis with `decimal`, `si`, or
`exponential`.

A linear axis factors out one shared power of ten, so the three formats of the housing data differ
only in how that power is written:

```markdown-script
for numberFormat in ['decimal', 'si', 'exponential']:
    demoChart(housingData, { \
        'title': "yFormat: '" + numberFormat + "'", \
        'width': 800, \
        'height': 260, \
        'x': 'Year', \
        'y': ['New Home Price', 'Household Income'], \
        'yFormat': numberFormat \
    })
endfor
```

A logarithmic axis scales each label by its own decade instead - sharing one exponent across eight
decades would produce labels like `0.0000001G`. The transistor chart in each format:

```markdown-script
for numberFormat in ['decimal', 'si', 'exponential']:
    demoChart(transistorData, { \
        'title': "yScale: 'log', yFormat: '" + numberFormat + "'", \
        'width': 800, \
        'height': 260, \
        'x': 'Year', \
        'y': ['Transistors'], \
        'yScale': 'log', \
        'yFormat': numberFormat \
    })
endfor
```


**xFormat** does the same for the X-axis. The ranks in the Zipf chart reach ten thousand, which the
automatic choice writes out in full because the axis does not reach a million - SI prefixes shorten
both axes:

```markdown-script
demoChart(zipfData, { \
    'title': "xFormat and yFormat: 'si'", \
    'width': 800, \
    'height': 300, \
    'x': 'Rank', \
    'y': ['Occurrences'], \
    'xScale': 'log', \
    'yScale': 'log', \
    'xFormat': 'si', \
    'yFormat': 'si' \
})
```


## 16. Precision

Tick labels default to the number of decimals the axis tick step needs, which keeps them consistent
down a scale - `1.0, 1.5, 2.0` rather than `1, 1.5, 2`. **precision** overrides that count, for data
whose meaningful digits are finer than its tick step.

Euro-dollar reference rate, daily (European Central Bank). At the default precision the axis reads
in hundredths; at four decimals it reads the way the rate is quoted:

```markdown-script
exchangeRates = [ \
    1.0904, 1.0876, 1.0872, 1.0892, 1.0801, \
    1.0765, 1.0741, 1.0808, 1.0736, 1.0703, \
    1.0735, 1.0742, 1.0745, 1.0703, 1.0694 \
]
exchangeDays = [3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21]
exchangeData = []
for exchangeRate, ixExchange in exchangeRates:
    arrayPush(exchangeData, { \
        'Date': datetimeNew(2024, 6, arrayGet(exchangeDays, ixExchange)), \
        'EUR/USD': exchangeRate \
    })
endfor

demoChart(exchangeData, { \
    'title': 'Euro Reference Rate - Automatic Precision', \
    'width': 800, \
    'height': 300, \
    'x': 'Date', \
    'y': ['EUR/USD'] \
})

demoChart(exchangeData, { \
    'title': 'Euro Reference Rate - precision: 4', \
    'width': 800, \
    'height': 300, \
    'x': 'Date', \
    'y': ['EUR/USD'], \
    'precision': 4 \
})
```


## 17. Font size

The options object's **fontSize** member sets the type size in pixels; every other dimension in the
chart - title, axis titles, tick labels, legend, and the space each is given - is derived from it.
Without it the chart uses the document font size. It is an option rather than a model member, so it
is not part of the model shown below. The same chart at 10 pixels and at 24:

```markdown-script
demoChart(generationMajor, { \
    'title': 'fontSize: 10', \
    'width': 800, \
    'height': 400, \
    'x': 'Year', \
    'y': ['TWh'], \
    'color': 'Source' \
}, {'fontSize': 10})

demoChart(generationMajor, { \
    'title': 'fontSize: 24', \
    'width': 800, \
    'height': 400, \
    'x': 'Year', \
    'y': ['TWh'], \
    'color': 'Source' \
}, {'fontSize': 24})
```


## 18. Composing charts with drawLineChart

`dataLineChart` and `dataLineChartElements` each create a drawing of their own. `drawLineChart`
instead draws into the *current* drawing at a position and size you choose, so several charts and
whatever else you draw can share one canvas. It returns `true`, or `null` when the data has no
chartable points.

A one-day home energy card - two charts, a heading, and a card frame, in a single drawing. The two
chart models are hoisted into variables here, so both can be listed before the drawing:

```markdown-script
solarProduction = [0, 0, 0, 0, 0, 0.1, 0.5, 1.2, 2.3, 3.4, 4.3, 5.0, 5.4, 5.5, 5.2, 4.6, 3.6, 2.4, 1.3, 0.4, 0.05, 0, 0, 0]
solarLoad = [0.4, 0.35, 0.3, 0.3, 0.35, 0.5, 0.9, 1.2, 0.9, 0.7, 0.6, 0.6, 0.7, 0.7, 0.8, 0.9, 1.1, 1.6, 2.1, 2.3, 1.9, 1.3, 0.8, 0.5]
solarBattery = [62, 58, 54, 51, 47, 43, 40, 41, 48, 60, 74, 88, 97, 100, 100, 100, 100, 96, 88, 79, 72, 68, 66, 64]
solarData = []
for solarValue, ixSolarHour in solarProduction:
    arrayPush(solarData, { \
        'Hour': ixSolarHour, \
        'Solar (kW)': solarValue, \
        'Load (kW)': arrayGet(solarLoad, ixSolarHour), \
        'Battery (%)': arrayGet(solarBattery, ixSolarHour) \
    })
endfor

# The two chart models, hoisted so that both can be listed before the drawing
solarLineChart = { \
    'title': 'Production and Consumption', \
    'x': 'Hour', \
    'y': ['Solar (kW)', 'Load (kW)'], \
    'yMin': 0 \
}
batteryLineChart = { \
    'title': 'Battery State of Charge', \
    'x': 'Hour', \
    'y': ['Battery (%)'], \
    'yMin': 0, \
    'yMax': 100, \
    'yLines': [{'value': 40, 'label': 'Reserve'}] \
}
demoModel([solarLineChart, batteryLineChart])

# The card
drawNew(800, 660)
drawStyle('none', 0, '#eeeeee')
drawRect(0, 0, 800, 660)
drawTextStyle(22, '#333333', true)
drawText('Home Energy - Thursday, June 11', 400, 30, 'middle', 'middle')

# The two charts, drawn into the card
drawLineChart(solarData, solarLineChart, 20, 55, 760, 290)
drawLineChart(solarData, batteryLineChart, 20, 355, 760, 290)

# The card border, drawn last so it is on top of the chart backgrounds
drawStyle('#999999', 2, 'none')
drawRect(10, 10, 780, 640, 6, 6)

drawRender()
```

Note that a composed chart is not given an accessible name of its own - the drawing it is part of
is named by whoever owns it. `dataLineChartElements`, which owns its drawing, sets one from the
chart title, or from the fields when the chart has no title.


## 19. Annotations drawn on the chart

Because `drawLineChart` draws into the current drawing, anything `draw.bare` can draw can go on top
of the chart - a shaded window, a callout, an arrow, a note below the plot. Draw the marks *after*
the chart: the chart paints its own white background across its whole rectangle, so anything drawn
before it is painted over.

What the chart places for you exactly is the reference line - **xLines** and **yLines** take data
values and the chart converts them, as the SLO line does here. Everything else is placed in the
drawing's pixel coordinates, because `drawLineChart` reports only whether it drew, not the plot
rectangle it computed or the scale it chose. So a mark pinned to a data point - the ring around the
14:00 peak - is positioned by hand, and has to be re-measured whenever the chart's size, font, or
data range changes.

```markdown-script
incidentLineChart = { \
    'title': 'Incident Review - 11 June 2024', \
    'x': 'Time', \
    'y': ['p50 (ms)', 'p90 (ms)', 'p99 (ms)'], \
    'yLines': [{'value': 1000, 'label': 'SLO'}] \
}
demoModel(incidentLineChart)

# The chart fills the top of a taller drawing, leaving room for a note underneath. The drawing
# takes the chart's own background color, so the note below the plot reads in either page theme.
drawNew(800, 460)
drawStyle('none', 0, 'white')
drawRect(0, 0, 800, 460)
drawLineChart(latencyData, incidentLineChart, 0, 0, 800, 400)

# The 14:00 peak and the plot area, in the drawing's pixels, measured from this chart
incidentPeakX = 427.7
incidentPeakY = 43.9
incidentPlotTop = 43.4
incidentPlotBottom = 338
incidentHourWidth = 25.9

# The incident window, shaded
drawStyle('none', 0, '#d6272818')
drawRect(incidentPeakX - 0.4 * incidentHourWidth, incidentPlotTop, \
    1.6 * incidentHourWidth, incidentPlotBottom - incidentPlotTop)

# A ring around the peak
drawStyle('#d62728', 2, 'none')
drawCircle(incidentPeakX, incidentPeakY, 8)

# The leader line from the callout to the ring, and its arrow head
demoArrow(322, 78, incidentPeakX, incidentPeakY, 10, '#d62728')

# The callout
drawStyle('#d62728', 1, '#ffffffe6')
drawRect(90, 58, 232, 52, 4, 4)
drawTextStyle(14, '#d62728', true)
drawText('14:00 deploy', 102, 76, 'start', 'middle')
drawTextStyle(12, '#333333')
drawText('p99 1.84 s - 2.0x the next worst hour', 102, 96, 'start', 'middle')

# The note below the chart
drawTextStyle(12, '#555555')
drawText('Rolled back at 14:40; the 15:00 sample is already back to trend.', 8, 425, 'start', 'middle')

drawRender()
```


## 20. Chart element models

`dataLineChartElements` returns the chart's
[element model](https://github.com/craigahobbs/element-model#readme) instead of rendering it, so a
chart can be placed inside markup of your own. It returns `null` when the data has no chartable
points.

```markdown-script
figureLineChart = { \
    'title': 'Global Temperature Anomaly', \
    'width': 560, \
    'height': 300, \
    'x': 'Year', \
    'y': ['Anomaly (°C)'] \
}
demoModel(figureLineChart)

figureElements = dataLineChartElements(temperatureData, figureLineChart)

elementModelRender({ \
    'html': 'figure', \
    'attr': {'style': 'display: inline-block; margin: 0; padding: 0.5em; border: 1px solid #999999;'}, \
    'elem': [ \
        figureElements, \
        { \
            'html': 'figcaption', \
            'attr': {'style': 'font-size: 0.8em; color: #555555; max-width: 560px;'}, \
            'elem': {'text': 'Figure 1 - Annual global mean surface temperature anomaly, ' + \
                'degrees Celsius relative to the 1951-1980 average. Source: NASA GISTEMP v4.'} \
        } \
    ] \
})
```


## 21. Model validation

`dataLineChartValidate` returns the validated model, or `null` when the model is invalid.
`dataLineChartValidateEx` reports the failure instead of discarding it, as an object with an
**error** message and the **memberFqn** of the member at fault.

```markdown-script
markdownPrint('A valid model, as validated:', '', '```', \
    jsonStringify(dataLineChartValidate({'x': 'Year', 'y': ['Anomaly (°C)'], 'yScale': 'log'}), 4), \
    '```')

badScale = dataLineChartValidateEx({'x': 'Year', 'y': ['Anomaly (°C)'], 'yScale': 'logarithmic'})
markdownPrint('', 'An unknown axis scale:', '', \
    '- **error** - ' + markdownEscape(objectGet(badScale, 'error')), \
    '- **memberFqn** - ' + markdownEscape(objectGet(badScale, 'memberFqn')))

missingY = dataLineChartValidateEx({'x': 'Year'})
missingYMember = objectGet(missingY, 'memberFqn')
markdownPrint('', 'A missing required member - the failure is the model itself, so there is no ' + \
    'member name to report:', '', \
    '- **error** - ' + markdownEscape(objectGet(missingY, 'error')), \
    '- **memberFqn** - ' + if(missingYMember != null, markdownEscape(missingYMember), '`null`'))

emptyY = dataLineChartValidateEx({'x': 'Year', 'y': []})
markdownPrint('', 'An empty Y-field list:', '', \
    '- **error** - ' + markdownEscape(objectGet(emptyY, 'error')), \
    '- **memberFqn** - ' + markdownEscape(objectGet(emptyY, 'memberFqn')))
```


## 22. Edge cases

**Rows need not be sorted.** The chart sorts the data by the X field before plotting, so rows may
arrive in any order - as they do from most queries. The shuffled series below draws the same line
as section 1.

```markdown-script
# Walk the rows with a stride co-prime with their count - every row once, in scrambled order
shuffledData = []
ixShuffle = 0
while arrayLength(shuffledData) < arrayLength(temperatureData):
    arrayPush(shuffledData, arrayGet(temperatureData, ixShuffle))
    ixShuffle = (ixShuffle + 7) % arrayLength(temperatureData)
endwhile

demoChart(shuffledData, { \
    'title': 'Shuffled Rows, Same Chart', \
    'width': 800, \
    'height': 300, \
    'x': 'Year', \
    'y': ['Anomaly (°C)'] \
})
```

**A logarithmic axis excludes non-positive values.** An epidemic curve starts at zero, and zero has
no place on a log scale - those points are dropped, and the line begins at the first positive value.

```markdown-script
outbreakCases = [0, 0, 1, 3, 8, 21, 55, 140, 310, 640, 1180, 1950, 2600, 3100, 2900, 2300, 1600, 980, 520, 260, 120]
outbreakData = []
for outbreakValue, ixOutbreakDay in outbreakCases:
    arrayPush(outbreakData, {'Day': ixOutbreakDay + 1, 'New Cases': outbreakValue})
endfor

demoChart(outbreakData, { \
    'title': 'New Cases - Linear', \
    'width': 800, \
    'height': 300, \
    'x': 'Day', \
    'y': ['New Cases'] \
})

demoChart(outbreakData, { \
    'title': 'New Cases - Log (the two zero days are dropped)', \
    'width': 800, \
    'height': 300, \
    'x': 'Day', \
    'y': ['New Cases'], \
    'yScale': 'log' \
})
```

**Text is ellipsised to fit; numbers are not.** The chart title, the axis titles, and the legend
labels are truncated when they do not fit, because a shortened word still reads as that word. Tick
labels are given room instead - a truncated number would read as a different number. A narrow chart
with long series names:

```markdown-script
regionNames = ['us-east-1 (N. Virginia)', 'eu-central-1 (Frankfurt)', 'ap-southeast-2 (Sydney)']
regionLatencies = [ \
    [86, 84, 91, 88, 83, 85, 87], \
    [122, 119, 126, 131, 124, 120, 118], \
    [241, 238, 252, 265, 249, 244, 240] \
]
regionData = []
for regionName, ixRegion in regionNames:
    for regionLatency, ixRegionDay in arrayGet(regionLatencies, ixRegion):
        arrayPush(regionData, { \
            'Day': ixRegionDay + 1, \
            'Region': regionName, \
            'Latency (ms)': regionLatency \
        })
    endfor
endfor

demoChart(regionData, { \
    'title': 'Edge Latency by Region, Averaged Over the Week', \
    'width': 380, \
    'height': 260, \
    'x': 'Day', \
    'y': ['Latency (ms)'], \
    'color': 'Region' \
})

demoChart(regionData, { \
    'title': 'Edge Latency by Region', \
    'width': 800, \
    'height': 300, \
    'x': 'Day', \
    'y': ['Latency (ms)'], \
    'color': 'Region' \
})
```

**Data with nothing to chart draws nothing.** A chart whose Y values are all null or missing has no
points, so `dataLineChart` renders nothing at all and `dataLineChartElements` returns `null` - there
should be no chart between this paragraph and the next.

```markdown-script
noPointsData = [ \
    {'Year': 2022, 'Backlog': null}, \
    {'Year': 2023, 'Backlog': null}, \
    {'Year': 2024} \
]

demoChart(noPointsData, {'x': 'Year', 'y': ['Backlog']})

markdownPrint('`dataLineChartElements` returned: **' + \
    systemType(dataLineChartElements(noPointsData, {'x': 'Year', 'y': ['Backlog']})) + '**')
```
