// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/* c8 ignore start */

import {argv, stdout} from 'node:process';


const vVerbose = argv.length > 2 && argv[2];


function main() {
    const timeBegin = performance.now();
    const width = 300;
    const height = 200;
    const xCoord = -0.5;
    const yCoord = 0;
    const xRange = 2.6;
    const maxIter = 60;
    mandelbrotSet(width, height, xCoord, yCoord, xRange, maxIter);
    const timeEnd = performance.now();
    stdout.write(`${timeEnd - timeBegin}\n`);
}


function mandelbrotSet(width, height, xCoord, yCoord, xRange, maxIter) {
    // Compute the set extents
    const yRange = (height / width) * xRange;
    const xMin = xCoord - 0.5 * xRange;
    const yMin = yCoord - 0.5 * yRange;

    // Draw each pixel in the set
    let ix = 0;
    while (ix < width) {
        let iy = 0;
        while (iy < height) {
            const xValue = xMin + (ix / (width - 1)) * xRange;
            const yValue = yMin + (iy / (height - 1)) * yRange;
            const iter = mandelbrotValue(xValue, yValue, maxIter);
            if (vVerbose) {
                stdout.write(`x = ${xValue}, y = ${yValue}, n = ${iter}\n`);
            }
            iy++;
        }
        ix++;
    }
}


function mandelbrotValue(xValue, yValue, maxIter) {
    // c1 = complex(x, y) {
    // c2 = complex(0, 0)
    const c1r = xValue;
    const c1i = yValue;
    let c2r = 0;
    let c2i = 0;

    // Iteratively compute the next c2 value
    let iter = 1;
    while (iter <= maxIter) {
        // Done?
        if (Math.sqrt(c2r * c2r + c2i * c2i) > 2) {
            return iter;
        }

        // c2 = c2 * c2 + c1
        const c2rNew = c2r * c2r - c2i * c2i + c1r;
        c2i = 2 * c2r * c2i + c1i;
        c2r = c2rNew;

        iter++;
    }

    // Hit max iterations - the point is in the Mandelbrot set
    return 0;
}


// Execute main
main();

/* c8 ignore end */
