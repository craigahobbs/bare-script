The "dataTable.bare" include library provides functions for rendering data arrays as formatted
Markdown tables. This is useful for displaying tabular data in MarkdownUp applications.

To render a data table, use the [dataTableMarkdown](#var.vGroup='dataTable.bare'&datatablemarkdown)
function with a data array and an optional data table model:

~~~ bare-script
include <dataTable.bare>

data = [ \
    {'name': 'Alice', 'age': 30, 'city': 'New York'}, \
    {'name': 'Bob', 'age': 25, 'city': 'Boston'}, \
    {'name': 'Charlie', 'age': 35, 'city': 'New York'} \
]

model = { \
    'fields': ['name', 'age', 'city'], \
    'formats': {'age': {'align': 'right'}} \
}

markdownPrint(dataTableMarkdown(data, model))
~~~

The data table model allows you to control which fields are displayed, their order, and how values
are formatted. You can specify field alignment, headers, and other display options.

If no model is provided, all fields are displayed in their natural order with default formatting:

~~~ bare-script
markdownPrint(dataTableMarkdown(data))
~~~
