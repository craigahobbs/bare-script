The "args.bare" include library parses and validates a MarkdownUp application's URL arguments, and
creates URLs and links back to the application.

MarkdownUp sets each URL hash argument as a global variable - `#var.vValue1=5` sets the global
`vValue1` to 5. An [arguments model] names the application's arguments, their types, and their
defaults. The [argsParse] function reads each argument from its global variable ("v" followed by
the capitalized argument name, by default) and returns the validated arguments object. The
[argsLink] function creates a link to the application with updated arguments:

```bare-script
include <args.bare>

arguments = [ \
    {'name': 'value1', 'type': 'float', 'default': 0}, \
    {'name': 'value2', 'type': 'float', 'default': 0} \
]
args = argsParse(arguments)
value1 = objectGet(args, 'value1')
value2 = objectGet(args, 'value2')

markdownPrint('The sum is: ' + (value1 + value2))
markdownPrint('', argsLink(arguments, 'Value1 More', {'value1': value1 + 1}))
markdownPrint('', argsLink(arguments, 'Reset', null, true))
```

A link keeps the application's current arguments unless overridden (or cleared with null). The
"explicit" argument of [argsLink] clears them all.


[argsLink]: #var.vGroup='args.bare'&argslink
[argsParse]: #var.vGroup='args.bare'&argsparse
[arguments model]: model.html#var.vName='ArgsArguments'
