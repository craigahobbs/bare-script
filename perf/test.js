// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

const vVerbose = process.argv.length > 2 && process.argv[2];


function main() {
    const timeBegin = new Date();
    const width = 300;
    const height = 200;
    const iter = 60;
    const x = -0.5;
    const y = 0;
    const xRange = 2.6;
    mandelbrotSet(width, height, x, y, xRange, iter);
    const timeEnd = new Date();
    console.log(timeEnd - timeBegin);
}


function mandelbrotSet(width, height, xCoord, yCoord, xRange, iter) {
    // Compute the set extents
    const yRange = (height / width) * xRange;
    const xMin = xCoord - 0.5 * xRange;
    const yMin = yCoord - 0.5 * yRange;

    // Draw each pixel in the set
    let x = 0;
    while (x < width) {
        let y = 0;
        while (y < height) {
            const xValue = xMin + (x / (width - 1)) * xRange;
            const yValue = yMin + (y / (height - 1)) * yRange;
            const n = mandelbrotValue(xValue, yValue, iter);
            if (vVerbose) {
                console.log('x = ' + xValue + ', y = ' + yValue + ', n = ' + n);
            }
            y = y + 1;
        }
        x = x + 1;
    }
}


function mandelbrotValue(x, y, maxIterations) {
    // c1 = complex(x, y) {
    // c2 = complex(0, 0)
    let c1r = x;
    let c1i = y;
    let c2r = 0;
    let c2i = 0;

    // Iteratively compute the next c2 value
    let n = 1;
    while ((n <= maxIterations) ) {
        // Done?
        if (Math.sqrt(c2r * c2r + c2i * c2i) > 2) {
            return n;
        }

        // c2 = c2 * c2 + c1
        const c2rNew = c2r * c2r - c2i * c2i + c1r;
        c2i = 2 * c2r * c2i + c1i;
        c2r = c2rNew;

        n = n + 1;
    }

    // Hit max iterations - the point is in the Mandelbrot set
    return 0;
}


// Execute main
main();
