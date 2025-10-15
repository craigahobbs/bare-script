// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {normalizePath, urlFileRelative} from '../lib/options.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('urlFileRelative', () => {
    // URL
    assert.equal(
        urlFileRelative('http://craigahobbs.github.io/file.txt', 'http://craigahobbs.github.io/'),
        'http://craigahobbs.github.io/'
    );
    assert.equal(
        urlFileRelative('/subdir/file.txt', 'http://craigahobbs.github.io/'),
        'http://craigahobbs.github.io/'
    );
    assert.equal(
        urlFileRelative('/', 'http://craigahobbs.github.io/'),
        'http://craigahobbs.github.io/'
    );
    assert.equal(
        urlFileRelative('subdir/file.txt', 'http://craigahobbs.github.io/'),
        'http://craigahobbs.github.io/'
    );
    assert.equal(
        urlFileRelative('file.txt', 'http://craigahobbs.github.io/'),
        'http://craigahobbs.github.io/'
    );

    // Absolute path
    assert.equal(
        urlFileRelative('http://craigahobbs.github.io/file.txt', '/file2.txt'),
        '/file2.txt'
    );
    assert.equal(
        urlFileRelative('/subdir/file.txt', '/file2.txt'),
        '/file2.txt'
    );
    assert.equal(
        urlFileRelative('/', '/file2.txt'),
        '/file2.txt'
    );
    assert.equal(
        urlFileRelative('subdir/file.txt', '/file2.txt'),
        '/file2.txt'
    );
    assert.equal(
        urlFileRelative('file.txt', '/file2.txt'),
        '/file2.txt'
    );

    // Relative path
    assert.equal(
        urlFileRelative('http://craigahobbs.github.io/file.txt', 'file2.txt'),
        'http://craigahobbs.github.io/file2.txt'
    );
    assert.equal(
        urlFileRelative('/subdir/file.txt', 'file2.txt'),
        '/subdir/file2.txt'
    );
    assert.equal(
        urlFileRelative('/', 'file2.txt'),
        '/file2.txt'
    );
    assert.equal(
        urlFileRelative('subdir/file.txt', 'file2.txt'),
        'subdir/file2.txt'
    );
    assert.equal(
        urlFileRelative('file.txt', 'file2.txt'),
        'file2.txt'
    );

    // Normalize paths
    assert.equal(
        urlFileRelative('http://craigahobbs.github.io/foo/../file.txt', 'file2.txt'),
        'http://craigahobbs.github.io/foo/../file2.txt'
    );
    assert.equal(
        urlFileRelative('/subdir/../file.txt', 'file2.txt'),
        '/file2.txt'
    );
    assert.equal(
        urlFileRelative('subdir/../file.txt', 'file2.txt'),
        'file2.txt'
    );
    assert.equal(
        urlFileRelative('../file.txt', 'file2.txt'),
        '../file2.txt'
    );
    assert.equal(
        urlFileRelative('./file.txt', 'file2.txt'),
        'file2.txt'
    );
});


test('normalizePath', () => {
    // Empty string
    assert.equal(normalizePath(''), '.');

    // Just '.'
    assert.equal(normalizePath('.'), '.');

    // Absolute path
    assert.equal(normalizePath('/a/b/c'), '/a/b/c');

    // Relative path
    assert.equal(normalizePath('a/b/c'), 'a/b/c');

    // Path with '..'
    assert.equal(normalizePath('a/b/../c'), 'a/c');
    assert.equal(normalizePath('a/../b'), 'b');
    assert.equal(normalizePath('./a/../b/./c/../d/../e'), 'b/e');

    // Multiple '..'
    assert.equal(normalizePath('a/b/../../c'), 'c');
    assert.equal(normalizePath('a/../../../b'), '../../b');
    assert.equal(normalizePath('../../../c'), '../../../c');

    // Absolute with '..'
    assert.equal(normalizePath('/a/b/../c'), '/a/c');
    assert.equal(normalizePath('/a/../b'), '/b');
    assert.equal(normalizePath('/../a'), '/a');
    assert.equal(normalizePath('/../../b'), '/b');
    assert.equal(normalizePath('/a/../../../b'), '/b');
    assert.equal(normalizePath('/../../..'), '/');

    // Relative with too many '..'
    assert.equal(normalizePath('a/../../..'), '../..');
    assert.equal(normalizePath('../../..'), '../../..');

    // Path with '.'
    assert.equal(normalizePath('./a/b/./c'), 'a/b/c');
    assert.equal(normalizePath('a/./b/../c/./d'), 'a/c/d');

    // Just '..'
    assert.equal(normalizePath('..'), '..');

    // Multiple empty segments
    assert.equal(normalizePath('a//b'), 'a/b');
    assert.equal(normalizePath('a/b//c'), 'a/b/c');
    assert.equal(normalizePath('/a//b'), '/a/b');
    assert.equal(normalizePath('//a/b'), '/a/b');

    // Trailing slash
    assert.equal(normalizePath('a/b/'), 'a/b');
    assert.equal(normalizePath('/a/b/'), '/a/b');
});
