Number functions provide operations for parsing, formatting, and converting numeric values.

Parse strings as numbers:

~~~ bare-script
# Parse floating-point numbers
num = numberParseFloat('3.14159')
negative = numberParseFloat('-2.5')

# Parse integers
int = numberParseInt('42')
hex = numberParseInt('FF', 16)
binary = numberParseInt('1010', 2)
~~~

Format numbers with fixed decimal places:

~~~ bare-script
# Format with 2 decimal places (default)
formatted = numberToFixed(3.14159)  # '3.14'

# Format with specific decimal places
precise = numberToFixed(3.14159, 4)  # '3.1416'

# Format with no decimal places
integer = numberToFixed(3.14159, 0)  # '3'

# Trim trailing zeros
trimmed = numberToFixed(3.5, 2, true)  # '3.5' instead of '3.50'
~~~
