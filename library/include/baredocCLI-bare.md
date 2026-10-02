The "baredocCLI.bare" include library contains the baredoc command-line interface (CLI), baredocCLI.
baredocCLI generates a [library model JSON file](model.html#var.vName='BaredocLibrary') for the
[baredoc application](#var.vGroup='baredoc.bare'&_top) from the documentation comments of its input
files.

Run baredocCLI with the `bare` CLI. The "vFiles" argument is the string literal of the JSON array of
input file names, and the optional "vOutput" argument is the output file (the default is standard
output). To glob the input files, build the JSON array with a script:

```sh
bare -m -v vFiles "'[\"lib/myLib.bare\"]'" -v vOutput '"my-library.json"' \
    -c 'include <baredocCLI.bare>' -c 'return baredocCLIMain()'

bare -m \
    -v vFiles "'$(python3 -c 'import json, sys; print(json.dumps(sys.argv[1:]))' lib/*.bare)'" \
    -c 'include <baredocCLI.bare>' -c 'return baredocCLIMain()'
```


**baredoc Comment Syntax** - baredoc documentation comments begin with the "$" character, followed
immediately by a keyword ("function", "group", "doc", "arg", "return", "async", or "ignore"),
followed by the ":" character, followed by the keyword value. The "function" keyword begins every
library function definition. The "arg" keyword is followed by the argument name - `[name]` for an
optional argument, or `[name = value]` for an optional argument with a default value, a BareScript
literal (a number, string, null, true, false, or an array or object literal of these) - and
repeating an argument's keyword continues its documentation. "$async: true" marks a function as
asynchronous (the calling function must be declared with "async function"), and "$ignore: true"
excludes a function from the documentation. For example:

```bare-script
# $function: myFunction
# $group: My Group
# $doc: This is my function.
# $doc:
# $doc: More on the function.
# $arg arg1: The first argument
# $arg [arg2 = 'Hello']: The second argument.
# $arg arg2:
# $arg arg2: More on the second argument.
# $return: The message
function myFunction(arg1, arg2):
    message = if(arg2 != null, arg2, 'Hello')
    systemLog(message)
    return message
endfunction
```
