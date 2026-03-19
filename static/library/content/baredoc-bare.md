The "baredoc.bare" include library contains the BareScript library documentation application, baredoc.
See baredoc in action by visiting the
[BareScript Library documentation](https://craigahobbs.github.io/bare-script/library/).

To run the baredoc application, include "baredoc.bare" and call the [baredocMain](#baredocmain)
function with your [library model JSON](model.html#var.vName='BaredocLibrary') URL and library name:

~~~ bare-script
include <baredoc.bare>

baredocMain('my-library.json', 'My Library')
~~~

You can add menu links and group content URLs:

~~~ bare-script
include <baredoc.bare>

menuLinks = [ \
    ['Home', 'index.html'], \
    ['GitHub', 'https://github.com/example/my-library'] \
]

groupURLs = { \
    '': 'intro.md', \
    'myGroup': 'group-content.md' \
}

baredocMain('my-library.json', 'My Library', menuLinks, groupURLs)
~~~
