System functions provide logging, global variable access, value type and comparison functions,
partial function application, and resource fetching.

An assignment within a function creates a local variable, even if a global of that name exists. To
update a global variable from within a function, use
[systemGlobalSet](#var.vGroup='system'&systemglobalset). See
[Variable Scope and Globals](https://craigahobbs.github.io/bare-script/language/#variable-scope-and-globals).
