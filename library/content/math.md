Math functions provide standard mathematical operations including trigonometric functions,
logarithms, rounding, and common calculations. These functions work with numeric values and return
numeric results.

Basic arithmetic and rounding:

~~~ bare-script
# Absolute value
abs = mathAbs(-5)

# Rounding
ceil = mathCeil(3.2)    # 4
floor = mathFloor(3.8)  # 3
round = mathRound(3.5)  # 4

# Sign
sign = mathSign(-5)  # -1
~~~

Trigonometric functions (angles in radians):

~~~ bare-script
# Basic trig functions
sin = mathSin(mathPi() / 2)  # 1
cos = mathCos(0)             # 1
tan = mathTan(mathPi() / 4)  # 1

# Inverse trig functions
asin = mathAsin(1)     # π/2
acos = mathAcos(1)     # 0
atan = mathAtan(1)     # π/4
atan2 = mathAtan2(1, 1)  # π/4
~~~

Logarithms and exponents:

~~~ bare-script
# Natural logarithm (base e)
ln = mathLn(2.718281828)

# Logarithm with custom base
log = mathLog(100, 10)  # 2
log2 = mathLog(8, 2)    # 3

# Square root
sqrt = mathSqrt(16)  # 4
~~~

Min, max, and random:

~~~ bare-script
# Minimum and maximum
min = mathMin(5, 2, 8, 1)  # 1
max = mathMax(5, 2, 8, 1)  # 8

# Random number between 0 and 1
random = mathRandom()
~~~

Constants:

~~~ bare-script
pi = mathPi()  # 3.141592653589793
~~~
