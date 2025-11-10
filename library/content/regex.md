Regular expression functions provide pattern matching and text manipulation capabilities. Regular
expressions are patterns used to match character combinations in strings.

Create a regular expression:

~~~ bare-script
# Basic pattern
regex = regexNew('[0-9]+')

# Pattern with flags
caseInsensitive = regexNew('[a-z]+', 'i')
multiline = regexNew('^Line', 'm')
dotAll = regexNew('.*', 's')
~~~

Find matches in strings:

~~~ bare-script
# Find first match
text = 'The year is 2024'
match = regexMatch(regexNew('[0-9]+'), text)
if match:
    groups = objectGet(match, 'groups')
    matchedText = objectGet(groups, '0')  # '2024'
    index = objectGet(match, 'index')      # 12
endif

# Find all matches
text = 'Prices: $10, $20, $30'
matches = regexMatchAll(regexNew('\\$([0-9]+)'), text)
~~~

Replace text using patterns:

~~~ bare-script
# Replace all digits with X
text = 'Phone: 555-1234'
result = regexReplace(regexNew('[0-9]'), text, 'X')
# Result: 'Phone: XXX-XXXX'
~~~

Split strings with patterns:

~~~ bare-script
# Split on whitespace
text = 'one  two   three'
parts = regexSplit(regexNew('\\s+'), text)
# Result: ['one', 'two', 'three']
~~~

Common regex patterns:
- `[a-zA-Z]+` - One or more letters
- `\\d+` - One or more digits
- `\\s+` - One or more whitespace characters
- `^` - Start of line/string
- `$` - End of line/string
- `.` - Any character (except newline without 's' flag)
- `*` - Zero or more
- `+` - One or more
- `?` - Zero or one
- `(...)` - Capture group
