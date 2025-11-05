The "args.bare" include library contains functions for parsing/validating a MarkdownUp application's
URL arguments, and functions for creating MarkdownUp application URLs and links.

Consider the following example of an application that sums numbers. First, include the "args.bare"
library and define an [arguments model] with three floating point number URL arguments: "value1",
"value2" and "value3".

~~~ bare-script
include <args.bare>

arguments = [ \
    {'name': 'value1', 'type': 'float', 'default': 0}, \
    {'name': 'value2', 'type': 'float', 'default': 0}, \
    {'name': 'value3', 'type': 'float', 'default': 0} \
]
~~~

Next, parse the arguments with the [argsParse] function.

~~~ bare-script
args = argsParse(arguments)
~~~

You access arguments by name from the "args" object.

~~~ bare-script
value1 = objectGet(args, 'value1')
value2 = objectGet(args, 'value2')
value3 = objectGet(args, 'value3')
sum = value1 + value2 + value3
markdownPrint('The sum is: ' + sum)
~~~

You can create links to the application using the [argsLink] function.

~~~ bare-script
markdownPrint( \
    '', argsLink(arguments, 'Value1 Less', {'value1': value1 - 1}), \
    '', argsLink(arguments, 'Value1 More', {'value1': value1 + 1}), \
    '', argsLink(arguments, 'Value2 Less', {'value2': value2 - 1}), \
    '', argsLink(arguments, 'Value2 More', {'value2': value2 + 1}), \
    '', argsLink(arguments, 'Value3 Less', {'value3': value3 - 1}), \
    '', argsLink(arguments, 'Value3 More', {'value3': value3 + 1}) \
)
~~~

By default, any argument previously supplied to the application is included in the link (unless
overridden by null). All arguments are cleared by setting the [argsLink] "explicit" argument to
true. Arguments may also be marked "explicit" individually in the [arguments model].

~~~ bare-script
markdownPrint('', argsLink(arguments, 'Reset', null, true))
~~~


[argsLink]: include.html#var.vGroup='args.bare'&argslink
[argsParse]: include.html#var.vGroup='args.bare'&argsparse
[arguments model]: includeModel.html#var.vName='ArgsArguments'
