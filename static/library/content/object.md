Object functions provide operations for creating and manipulating objects. Objects are key-value
collections that can be created using object literal syntax (e.g., `{'a': 1, 'b': 2}`) or with the
[objectNew](#var.vGroup='object'&objectnew) function.

Create and manipulate objects:

~~~ bare-script
# Create a new object
person = {'name', 'Alice', 'age', 30}

# Set and get values
objectSet(person, 'city', 'New York')
name = objectGet(person, 'name')
city = objectGet(person, 'city', 'Unknown')  # With default value
~~~

Check for keys and get all keys:

~~~ bare-script
# Check if a key exists
hasAge = objectHas(person, 'age')

# Get all keys
keys = objectKeys(person)
~~~

Copy and assign objects:

~~~ bare-script
# Create a shallow copy
personCopy = objectCopy(person)

# Assign properties from one object to another
defaults = {'country': 'USA', 'status': 'active'}
objectAssign(person, defaults)
~~~

Delete keys:

~~~ bare-script
objectDelete(person, 'status')
~~~
