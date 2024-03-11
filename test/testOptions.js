// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {strict as assert} from 'node:assert';
import test from 'node:test';
import {urlFileRelative} from '../lib/options.js';


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
});
