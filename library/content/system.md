System functions provide core utilities for type checking, comparison, global variable management,
logging, and HTTP requests.

Logging:

~~~ bare-script
# Always log
systemLog('Application started')

# Log only in debug mode
systemLogDebug('Debug information')
~~~

Global variable management:

~~~ bare-script
# Set a global variable
systemGlobalSet('appConfig', {'debug': true})

# Get a global variable
config = systemGlobalGet('appConfig', {})
~~~

Fetch data from URLs:

~~~ bare-script
# Simple fetch
async function getData():
    response = systemFetch('data.json')
    return jsonParse(response)
endfunction

# Fetch with request options
async function postData():
    request = { \
        'url': 'submitAPI', \
        'body': jsonStringify({'key': 'value'}), \
        'headers': {'Content-Type': 'application/json'} \
    }
    response = systemFetch(request)
    return response
endfunction

# Fetch multiple URLs
async function getMultiple():
    urls = ['data.json', 'data2.json']
    responses = systemFetch(urls)
    return responses
endfunction
~~~

Create partial functions:

~~~ bare-script
# Create a function with pre-filled arguments
add = function(a, b):
    return a + b
endfunction

add5 = systemPartial(add, 5)
result = add5(3)  # Returns 8
~~~

Type checking and comparison:

~~~ bare-script
# Get type of a value
type = systemType([1, 2, 3])  # 'array'

# Check if value is truthy
bool = systemBoolean(0)  # false

# Compare values
cmp = systemCompare(5, 10)  # -1 (less than)

# Test object identity
same = systemIs(obj1, obj2)
~~~
