# Licensed under the MIT License
# https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import datetime
import math
import sys

vVerbose = len(sys.argv) > 1 and sys.argv[1]


def main():
    timeBegin = datetime.datetime.now()
    width = 300
    height = 200
    iter = 60
    x = -0.5
    y = 0
    xRange = 2.6
    mandelbrotSet(width, height, x, y, xRange, iter)
    timeEnd = datetime.datetime.now()
    print((timeEnd - timeBegin).total_seconds() * 1000)


def mandelbrotSet(width, height, xCoord, yCoord, xRange, iter):
    # Compute the set extents
    yRange = (height / width) * xRange
    xMin = xCoord - 0.5 * xRange
    yMin = yCoord - 0.5 * yRange

    # Draw each pixel in the set
    x = 0
    while x < width:
        y = 0
        while y < height:
            xValue = xMin + (x / (width - 1)) * xRange
            yValue = yMin + (y / (height - 1)) * yRange
            n = mandelbrotValue(xValue, yValue, iter)
            if vVerbose:
                print('x = ' + str(xValue) + ', y = ' + str(yValue) + ', n = ' + str(n))
            y = y + 1
        x = x + 1


def mandelbrotValue(x, y, maxIterations):
    # c1 = complex(x, y)
    # c2 = complex(0, 0)
    c1r = x
    c1i = y
    c2r = 0
    c2i = 0

    # Iteratively compute the next c2 value
    n = 1
    while n <= maxIterations:
        # Done?
        if math.sqrt(c2r * c2r + c2i * c2i) > 2:
            return n

        # c2 = c2 * c2 + c1
        c2rNew = c2r * c2r - c2i * c2i + c1r
        c2i = 2 * c2r * c2i + c1i
        c2r = c2rNew

        n = n + 1

    # Hit max iterations - the point is in the Mandelbrot set
    return 0


# Execute main
main()
