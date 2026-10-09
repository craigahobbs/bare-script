The "wsgi.bare" include library creates schema-validated JSON API
[WSGI](https://peps.python.org/pep-3333/) application functions. Host the application function with
the Python package's
[bare_script.wsgi.wsgi_application](https://craigahobbs.github.io/bare-script-py/wsgi.html#bare_script.wsgi.wsgi_application)
function:

```bare-script
include <schemaParser.bare>
include <wsgi.bare>

myappTypes = schemaParse( \
    'action myappDouble', \
    '    input', \
    '        float value', \
    '    output', \
    '        float answer' \
)

function myappDouble(request):
    return {'answer': 2 * objectGet(request, 'value')}
endfunction

myappApplication = wsgiCreateAPIApplication(myappTypes, { \
    'doc': true, \
    'requests': [ \
        {'type': 'action', 'name': 'myappDouble', 'path': '/double'}, \
        {'type': 'request', 'path': '/index.html', 'function': wsgiStatic(systemFetch('frontend/index.html'))} \
    ] \
})
```
