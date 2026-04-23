String functions provide operations for creating, manipulating, and analyzing text strings. Strings
are sequences of characters enclosed in single or double quotes.

Get string information:

~~~ bare-script
text = 'Hello, World!'
length = stringLength(text)  # 13

# Get character codes
charCode = stringCharCodeAt(text, 0)  # 72 ('H')

# Create string from character codes
fromCode = stringFromCharCode(72, 101, 108, 108, 111)  # 'Hello'
~~~

Search within strings:

~~~ bare-script
# Find first occurrence
index = stringIndexOf(text, 'World')  # 7
notFound = stringIndexOf(text, 'xyz')  # -1

# Find last occurrence
lastIndex = stringLastIndexOf('aa bb aa', 'aa')  # 6

# Check start and end
starts = stringStartsWith(text, 'Hello')  # true
ends = stringEndsWith(text, 'World!')    # true
~~~

Transform strings:

~~~ bare-script
# Case conversion
upper = stringUpper('hello')  # 'HELLO'
lower = stringLower('HELLO')  # 'hello'

# Trim whitespace
trimmed = stringTrim('  hello  ')  # 'hello'

# Repeat strings
repeated = stringRepeat('abc', 3)  # 'abcabcabc'
~~~

Extract and split strings:

~~~ bare-script
# Extract substring
slice = stringSlice(text, 7, 12)  # 'World'

# Split into array
parts = stringSplit('a,b,c', ',')  # ['a', 'b', 'c']
~~~

Replace text:

~~~ bare-script
# Replace all occurrences
replaced = stringReplace('Hello World', 'o', '0')  # 'Hell0 W0rld'
~~~

Create new strings:

~~~ bare-script
# Convert any value to string
str = stringNew(42)  # '42'
str2 = stringNew(true)  # 'true'
~~~

Strings in BareScript support Unicode characters and can be concatenated using the `+` operator:

~~~ bare-script
greeting = 'Hello, ' + 'World!'
message = 'The answer is ' + 42  # Automatic conversion
~~~
