The "markdownUp.bare: localStorage" section contains functions for interacting with the browser's
local storage. Local storage provides persistent key-value storage that survives browser restarts.

Set a value in local storage:

~~~ bare-script
localStorageSet('username', 'Alice')
localStorageSet('theme', 'dark')
~~~

Get a value from local storage:

~~~ bare-script
username = localStorageGet('username')
theme = localStorageGet('theme')
~~~

Remove a key from local storage:

~~~ bare-script
localStorageRemove('username')
~~~

Clear all keys from local storage:

~~~ bare-script
localStorageClear()
~~~

Local storage is useful for saving user preferences, application state, or cached data that should
persist across sessions. Values are stored as strings, so you may need to use
[jsonStringify](#var.vGroup='json'&jsonstringify) and [jsonParse](#var.vGroup='json'&jsonparse) for
complex data:

~~~ bare-script
# Store an object
preferences = {'theme': 'dark', 'fontSize': 14}
localStorageSet('preferences', jsonStringify(preferences))

# Retrieve the object
preferencesJson = localStorageGet('preferences')
preferences = jsonParse(preferencesJson)
~~~
