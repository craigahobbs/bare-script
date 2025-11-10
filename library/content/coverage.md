Coverage functions provide runtime code coverage tracking for BareScript scripts. These functions
are primarily used in unit testing to ensure that tests exercise all code paths.

To collect coverage data, start coverage tracking at the beginning of your test suite and stop it
at the end:

~~~ bare-script
include <unittest.bare>

# Start coverage tracking
coverageStart()

# Run your tests
include 'test1.bare'
include 'test2.bare'

# Stop coverage tracking
coverageStop()

# Generate report with minimum coverage requirement
return unittestReport({'coverageMin': 80})
~~~

The coverage system tracks which statements in your scripts have been executed. The coverage data is
stored in a global variable that can be accessed using
[coverageGlobalGet](#var.vGroup='coverage'&coverageglobalget):

~~~ bare-script
coverageData = coverageGlobalGet()
~~~

Coverage data is automatically used by the [unittest.bare](#var.vGroup='unittest.bare') library to
generate coverage reports showing which lines of code were executed during testing.
