The "markdownUp.bare: sessionStorage" section contains functions for interacting with the browser's
session storage. Session storage provides key-value storage that persists for the duration of the
browser session (until the tab or window is closed).

Set a value in session storage:

~~~ bare-script
sessionStorageSet('currentPage', 'home')
~~~

Get a value from session storage:

~~~ bare-script
currentPage = sessionStorageGet('currentPage')
~~~

Remove a key from session storage:

~~~ bare-script
sessionStorageRemove('currentPage')
~~~

Clear all keys from session storage:

~~~ bare-script
sessionStorageClear()
~~~

Session storage is useful for temporary state that should persist across page refreshes but not
across browser sessions. Like local storage, values are stored as strings:

~~~ bare-script
# Store an object
state = {'page': 'home', 'filters': ['active', 'new']}
sessionStorageSet('appState', jsonStringify(state))

# Retrieve the object
stateJson = sessionStorageGet('appState')
state = jsonParse(stateJson)
~~~
