// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {argv, stdout} from 'node:process';
import {decodeQueryString, encodeQueryString} from 'schema-markdown/lib/encode.js';
import {markdownElements} from 'markdown-model/lib/elements.js';
import {parseMarkdown} from 'markdown-model/lib/parser.js';
import {parseSchemaMarkdown} from 'schema-markdown/lib/parser.js';
import {readFileSync} from 'node:fs';
import {validateType} from 'schema-markdown/lib/schema.js';


const language = argv.length > 2 ? argv[2] : 'JavaScript';
const testArg = argv.length > 3 ? argv[3] : null;

// The performance tests and their iteration counts - tuned so the fastest runtime's measurement stays well above
// millisecond timer resolution while the slowest runtime's measurement doesn't run excessively long
const perfTests = {
    'mandelbrot': 1,
    'schemaParse': 250,
    'schemaValidate': 250,
    'markdownParse': 250,
    'markdownElements': 1000,
    'urlEncode': 2000,
    'urlDecode': 2000
};

function main() {
    for (const test of (testArg !== null ? [testArg] : Object.keys(perfTests))) {
        // Skip tests this program doesn't implement (e.g. BareScript-only tests)
        const runs = perfTests[test] ?? null;
        if (runs === null) {
            continue;
        }
        const timeMs = perfRun(test, runs);
        stdout.write(`${language},${test},${runs},${timeMs}\n`);
    }
}


function perfRun(test, iterations) {
    let timeBegin;
    let timeEnd;

    // mandelbrot?
    if (test === 'mandelbrot') {
        // Compute the "seahorse valley", a computationally dense region on the Mandelbrot set boundary
        timeBegin = performance.now();
        for (let ix = 0; ix < iterations; ix++) {
            mandelbrotSet(120, 80, -0.75, 0.1, 0.05, 60);
        }
        timeEnd = performance.now();

    // schemaParse?
    } else if (test === 'schemaParse') {
        // Warmup
        parseSchemaMarkdown(schemaText);

        timeBegin = performance.now();
        for (let ix = 0; ix < iterations; ix++) {
            parseSchemaMarkdown(schemaText);
        }
        timeEnd = performance.now();

    // schemaValidate?
    } else if (test === 'schemaValidate') {
        // Warmup
        const types = parseSchemaMarkdown(schemaText);
        validateType(types, 'Types', types);

        timeBegin = performance.now();
        for (let ix = 0; ix < iterations; ix++) {
            validateType(types, 'Types', types);
        }
        timeEnd = performance.now();

    // markdownParse?
    } else if (test === 'markdownParse') {
        // Warmup
        const markdownText = readFileSync(new URL('../README.md', import.meta.url), 'utf-8');
        parseMarkdown(markdownText);

        timeBegin = performance.now();
        for (let ix = 0; ix < iterations; ix++) {
            parseMarkdown(markdownText);
        }
        timeEnd = performance.now();

    // markdownElements?
    } else if (test === 'markdownElements') {
        // Warmup
        const markdownText = readFileSync(new URL('../README.md', import.meta.url), 'utf-8');
        const markdownModel = parseMarkdown(markdownText);
        markdownElements(markdownModel);

        timeBegin = performance.now();
        for (let ix = 0; ix < iterations; ix++) {
            markdownElements(markdownModel);
        }
        timeEnd = performance.now();

    // urlEncode?
    } else if (test === 'urlEncode') {
        // Warmup
        encodeQueryString(urlArgs);

        timeBegin = performance.now();
        for (let ix = 0; ix < iterations; ix++) {
            encodeQueryString(urlArgs);
        }
        timeEnd = performance.now();

    // urlDecode?
    } else if (test === 'urlDecode') {
        // Warmup
        decodeQueryString(urlHash);

        timeBegin = performance.now();
        for (let ix = 0; ix < iterations; ix++) {
            decodeQueryString(urlHash);
        }
        timeEnd = performance.now();
    }

    return timeEnd - timeBegin;
}


function mandelbrotSet(width, height, xCoord, yCoord, xRange, maxIter) {
    // Compute the set extents
    const yRange = (height / width) * xRange;
    const xMin = xCoord - 0.5 * xRange;
    const yMin = yCoord - 0.5 * yRange;

    // Compute each pixel in the set
    let ix = 0;
    while (ix < width) {
        let iy = 0;
        while (iy < height) {
            const xValue = xMin + (ix / (width - 1)) * xRange;
            const yValue = yMin + (iy / (height - 1)) * yRange;
            mandelbrotValue(xValue, yValue, maxIter);
            iy++;
        }
        ix++;
    }
}


function mandelbrotValue(xValue, yValue, maxIter) {
    // c1 = complex(x, y)
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


const schemaText = `\
# Map of user type name to user type model
typedef UserType{len > 0} Types


# Union representing a member type
union Type

    # A built-in type
    BuiltinType builtin

    # An array type
    Array array

    # A dictionary type
    Dict dict

    # A user type name
    string user


# A type or member's attributes
struct Attributes

    # If true, the value may be null
    optional bool nullable

    # The value is equal
    optional float eq

    # The value is less than
    optional float lt

    # The value is less than or equal to
    optional float lte

    # The value is greater than
    optional float gt

    # The value is greater than or equal to
    optional float gte

    # The length is equal to
    optional int lenEq

    # The length is less-than
    optional int lenLT

    # The length is less than or equal to
    optional int lenLTE

    # The length is greater than
    optional int lenGT

    # The length is greater than or equal to
    optional int lenGTE


# The built-in type enumeration
enum BuiltinType

    # The string type
    string

    # The integer type
    int

    # The float type
    float

    # The boolean type
    bool

    # A date formatted as an ISO-8601 date string
    date

    # A date/time formatted as an ISO-8601 date/time string
    datetime

    # A UUID formatted as string
    uuid

    # A value of any type
    any


# An array type
struct Array

    # The contained type
    Type type

    # The contained type's attributes
    optional Attributes attr


# A dictionary type
struct Dict

    # The contained value type
    Type type

    # The contained value type's attributes
    optional Attributes attr

    # The contained key type
    optional Type keyType

    # The contained key type's attributes
    optional Attributes keyAttr


# A user type
union UserType

    # An enumeration type
    Enum enum

    # A struct type
    Struct struct

    # A type definition
    Typedef typedef

    # A JSON web API (not reference-able)
    Action action


# User type base struct
struct UserBase

    # The user type name
    string name

    # The documentation markdown text lines
    optional string[] doc

    # The documentation group name
    optional string docGroup


# An enumeration type
struct Enum (UserBase)

    # The enum's base enumerations
    optional string[len > 0] bases

    # The enumeration values
    optional EnumValue[len > 0] values


# An enumeration type value
struct EnumValue

    # The value string
    string name

    # The documentation markdown text lines
    optional string[] doc


# A struct type
struct Struct (UserBase)

    # The struct's base classes
    optional string[len > 0] bases

    # If true, the struct is a union and exactly one of the optional members is present
    optional bool union

    # The struct members
    optional StructMember[len > 0] members


# A struct member
struct StructMember

    # The member name
    string name

    # The documentation markdown text lines
    optional string[] doc

    # The member type
    Type type

    # The member type attributes
    optional Attributes attr

    # If true, the member is optional and may not be present
    optional bool optional


# A typedef type
struct Typedef (UserBase)

    # The typedef's type
    Type type

    # The typedef's type attributes
    optional Attributes attr


# A JSON web service API
struct Action (UserBase)

    # The action's URLs
    optional ActionURL[len > 0] urls

    # The path parameters struct type name
    optional string path

    # The query parameters struct type name
    optional string query

    # The content body struct type name
    optional string input

    # The response body struct type name
    optional string output

    # The custom error response codes enum type name
    optional string errors


# An action URL model
struct ActionURL

    # The HTTP method. If not provided, matches all HTTP methods.
    optional string method

    # The URL path. If not provided, uses the default URL path of "/<actionName>".
    optional string path`;


// An arguments object to encode as a query string - the same shape a MarkdownUp application passes
// to urlEncodeQueryString when building a link's URL variables
const urlArgs = {
    'url': 'doc/index.md',
    'name': 'Getting Started',
    'count': 17,
    'show': true,
    'filter': 'a & b',
    'rows': [1, 2, 3],
    'nested': {'alpha': 'one', 'beta': 'two 2', 'gamma': [10, 20]}
};


// A query string to decode - the application hash a MarkdownUp application decodes on page load
const urlHash = 'url=doc%2Findex.md&var.vGroup=%27url.bare%27&var.vName=%27Getting%20Started%27&' +
    'var.vCount=17&var.vShow=true&var.vFilter=%27a%20%26%20b%27&var.vRows.0=1&var.vRows.1=2&var.vRows.2=3';


// Execute main
main();
