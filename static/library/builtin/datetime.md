Datetime values represent moments in time. There is no datetime literal - create datetimes with
[datetimeNew](#var.vGroup='datetime'&datetimenew), [datetimeNow](#var.vGroup='datetime'&datetimenow),
[datetimeToday](#var.vGroup='datetime'&datetimetoday), or
[datetimeISOParse](#var.vGroup='datetime'&datetimeisoparse).

Datetimes are **local time**: `datetimeNew` takes local-time components, the accessor functions
(`datetimeYear`, `datetimeHour`, etc.) return local-time components, and `datetimeISOFormat` formats
with the local UTC offset. `datetimeISOParse` accepts any UTC offset.

Datetime arithmetic is in milliseconds. Adding a number to a datetime returns a new datetime, and
subtracting two datetimes returns the difference in milliseconds:

```bare-script
start = datetimeNew(2024, 1, 15, 14, 30)
end = start + 90 * 60 * 1000
minutes = (end - start) / (60 * 1000)
# minutes is 90
```
