Datetime functions provide operations for creating, manipulating, and formatting date and time
values. Datetime values represent specific moments in time.

Create a new datetime with specific components:

~~~ bare-script
# Create a datetime for January 15, 2024 at 2:30 PM
dt = datetimeNew(2024, 1, 15, 14, 30, 0, 0)
~~~

Get the current date and time:

~~~ bare-script
now = datetimeNow()
today = datetimeToday()  # Today at midnight
~~~

Extract components from a datetime:

~~~ bare-script
year = datetimeYear(dt)
month = datetimeMonth(dt)
day = datetimeDay(dt)
hour = datetimeHour(dt)
minute = datetimeMinute(dt)
second = datetimeSecond(dt)
millisecond = datetimeMillisecond(dt)
~~~

Parse and format datetime strings using ISO 8601 format:

~~~ bare-script
# Parse an ISO datetime string
dt = datetimeISOParse('2024-01-15T14:30:00.000Z')

# Format as ISO datetime string
isoString = datetimeISOFormat(dt, false)

# Format as ISO date string
isoDate = datetimeISOFormat(dt, true)
~~~

Perform datetime arithmetic using addition and subtraction:

~~~ bare-script
# Add 1 hour (3600000 milliseconds)
later = dt + 3600000

# Calculate the difference between two datetimes
difference = dt2 - dt1  # Returns milliseconds
~~~
