JSON functions provide operations for parsing and serializing JSON (JavaScript Object Notation)
data. JSON is a lightweight data interchange format that is easy to read and write.

Parse a JSON string to create an object:

~~~ bare-script
jsonText = '{"name": "Alice", "age": 30, "hobbies": ["reading", "hiking"]}'
obj = jsonParse(jsonText)
name = objectGet(obj, 'name')
~~~

Convert an object to a JSON string:

~~~ bare-script
obj = {'name': 'Bob', 'age': 25, 'active': true}
jsonText = jsonStringify(obj)
~~~

Format JSON with indentation for readability:

~~~ bare-script
# Indent with 2 spaces
prettyJson = jsonStringify(obj, 2)
~~~
