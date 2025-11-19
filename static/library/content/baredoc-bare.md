The "baredoc.bare" include library provides the main entry point for creating BareScript library
documentation applications. This library is used to generate documentation websites like the
[BareScript Library documentation](https://craigahobbs.github.io/bare-script/library/).

To create a documentation application, include the library and call the
[baredocMain](#var.vGroup='baredoc.bare'&baredoc) function with your library's JSON resource
URL:

~~~ bare-script
include <baredoc.bare>

baredocMain( \
    'my-library.json', \
    'My Library' \
)
~~~

The library JSON resource should contain function and type documentation in the format expected by
the documentation renderer. You can also provide optional menu links and group content URLs:

~~~ bare-script
menuLinks = [ \
    ['Home', 'index.html'], \
    ['GitHub', 'https://github.com/example/my-library'] \
]

groupURLs = { \
    '': 'intro.md', \
    'myGroup': 'group-content.md' \
}

baredocMain( \
    'my-library.json', \
    'My Library', \
    menuLinks, \
    groupURLs \
)
~~~
