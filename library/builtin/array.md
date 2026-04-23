Array functions provide operations for creating, manipulating, and querying arrays. Arrays are
ordered collections of values that can be created using array literal syntax (e.g., `[1, 2, 3]`) or
with the [arrayNew](#var.vGroup='array'&arraynew) function.

To access and modify array elements, use the [arrayGet](#var.vGroup='array'&arrayget) and
[arraySet](#var.vGroup='array'&arrayset) functions:

~~~ bare-script
values = [1, 2, 3, 4, 5]
firstValue = arrayGet(values, 0)
arraySet(values, 0, 10)
~~~

Arrays can be extended, sliced, and manipulated in various ways:

~~~ bare-script
# Add elements to the end
arrayPush(values, 6, 7, 8)

# Remove and return the last element
lastValue = arrayPop(values)

# Create a copy of part of an array
subset = arraySlice(values, 1, 4)

# Join array elements into a string
text = arrayJoin(values, ', ')
~~~

Arrays can also be sorted, searched, and flattened:

~~~ bare-script
# Sort an array
arraySorted = arraySort([3, 1, 4, 1, 5, 9])

# Find an element
index = arrayIndexOf(values, 3)

# Flatten nested arrays
nested = [[1, 2], [3, [4, 5]]]
flat = arrayFlat(nested, 2)
~~~
