The "baredoc.bare" include library contains the BareScript library documentation application, baredoc.
See baredoc in action by visiting the
[BareScript Library documentation](https://craigahobbs.github.io/bare-script/library/).

To run the baredoc application, include "baredoc.bare" and call the [baredocMain](#baredocmain)
function with a [documentation configuration](model.html#var.vName='BaredocConfig') object (or the URL
of its JSON resource). Each section's `url` is a
[library model JSON](model.html#var.vName='BaredocLibrary') resource (for example, one produced by
[baredocCLI](baredocCLI-bare.md)):

~~~ bare-script
include <baredoc.bare>

baredocMain({ \
    'title': 'My Library', \
    'sections': [ \
        {'title': 'My Functions', 'url': 'my-library.json'} \
    ] \
})
~~~

You can add top-level content, multiple sections, and per-section group content:

~~~ bare-script
include <baredoc.bare>

baredocMain({ \
    'title': 'My Library', \
    'content': 'intro.md', \
    'sections': [ \
        { \
            'title': 'Builtin Functions', \
            'url': 'my-builtin.json', \
            'groups': [{'name': 'myGroup', 'content': 'group-content.md'}] \
        }, \
        {'title': 'Include Functions', 'url': 'my-include.json'} \
    ] \
})
~~~

Instead of an inline object, you can pass the URL of a configuration JSON resource:

~~~ bare-script
include <baredoc.bare>

baredocMain('my-library-config.json')
~~~
