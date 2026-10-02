The "dataTable.bare" include library renders [data arrays](#var.vGroup='data.bare'&_top) as Markdown
tables. The optional [data table model](model.html#var.vName='DataTable') selects and orders the
fields and sets their formatting - without one, all fields are displayed with default formatting.

```bare-script
include <dataTable.bare>

markdownPrint(dataTableMarkdown(data, {'fields': ['name', 'age'], 'formats': {'age': {'align': 'right'}}}))
```
