# Licensed under the MIT License
# https://github.com/craigahobbs/bare-script/blob/main/LICENSE

from datetime import datetime
import math
from sys import argv


vVerbose = len(argv) > 1 and argv[1]


def main():
    timeBegin = datetime.now()
    width = 300
    height = 200
    xCoord = -0.5
    yCoord = 0
    xRange = 2.6
    maxIter = 60
    mandelbrotSet(width, height, xCoord, yCoord, xRange, maxIter)
    timeEnd = datetime.now()
    print(f'{(timeEnd - timeBegin).total_seconds() * 1000}')


def mandelbrotSet(width, height, xCoord, yCoord, xRange, maxIter):
    # Compute the set extents
    yRange = (height / width) * xRange
    xMin = xCoord - 0.5 * xRange
    yMin = yCoord - 0.5 * yRange

    # Draw each pixel in the set
    ix = 0
    while ix < width:
        iy = 0
        while iy < height:
            xValue = xMin + (ix / (width - 1)) * xRange
            yValue = yMin + (iy / (height - 1)) * yRange
            iter_ = mandelbrotValue(xValue, yValue, maxIter)
            if vVerbose:
                print(f'x = {xValue}, y = {yValue}, n = {iter_}')
            iy = iy + 1
        ix = ix + 1


def mandelbrotValue(xValue, yValue, maxIter):
    # c1 = complex(x, y)
    # c2 = complex(0, 0)
    c1r = xValue
    c1i = yValue
    c2r = 0
    c2i = 0

    # Iteratively compute the next c2 value
    iter_ = 1
    while iter_ <= maxIter:
        # Done?
        if math.sqrt(c2r * c2r + c2i * c2i) > 2:
            return iter_

        # c2 = c2 * c2 + c1
        c2rNew = c2r * c2r - c2i * c2i + c1r
        c2i = 2 * c2r * c2i + c1i
        c2r = c2rNew

        iter_ = iter_ + 1

    # Hit max iterations - the point is in the Mandelbrot set
    return 0


# Execute main
main()
