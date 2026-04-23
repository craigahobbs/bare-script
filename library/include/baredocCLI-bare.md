The "baredocCLI.bare" include library contains the baredoc command-line interface (CLI), baredocCLI.
baredocCLI is used to generate a [library model JSON file](model.html#var.vName='BaredocLibrary')
for consumption by the [baredoc application](#var.vGroup='baredoc.bare'&_top).

To output the [library model JSON](model.html#var.vName='BaredocLibrary'), include and execute the
`baredocCLIMain` function from the command line:

```sh
bare -m -v vFiles "'[\"test.bare\"]'" -c 'include <baredocCLI.bare>' -c 'baredocCLIMain()'
```

The baredocCLI input files argument, "vFiles", is the string literal of the JSON-serialized input
filename array. You can glob the input files argument as follows:

```sh
bare -m \
    -v 'vFiles' "'$(python3 -c 'import json; import sys; print(json.dumps(sys.argv[1:]))' src/bare_script/library.py src/bare_script/include/*.bare)'" \
    -c 'include <baredocCLI.bare>' -c 'baredocCLIMain()'
```

You can specify an output file by using the output argument, "vOutput":

```sh
bare -m -v vFiles "'[\"test.bare\"]'" -v vOutput '"test.json"' -c 'include <baredocCLI.bare>' -c 'baredocCLIMain()'
```


## baredoc Comment Syntax


baredoc documentation comments begin with the "$" character, followed immediately by a keyword
("function", "group", "doc", "arg", or "return"), followed by the ":" character, followed by the
keyword value. The "function" keyword begins every library function definition. For example:

```barescript
# $function: myFunction
# $group: My Group
# $doc: This is my function.
# $doc:
# $doc: More on the function.
# $arg arg1: The first argument
# $arg arg2: The second argument.
# $arg arg2:
# $arg arg2: More on the second argument.
# $return: The message
function myFunction(arg1, arg2)
    message = 'Hello'
    systemLog(message)
    return message
endfunction
```
