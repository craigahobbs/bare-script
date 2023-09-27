# Changelog

## 2.2.2 (2023-09-27)

- [74f3b42](https://github.com/craigahobbs/bare-script/commit/74f3b42) - library - update indexOf functions to return -1 on non-array/string

## 2.2.1 (2023-09-26)

- [8d36cac](https://github.com/craigahobbs/bare-script/commit/8d36cac) - fix library objectGet for non-objects with default

## 2.2.0 (2023-09-19)

- [cd2098f](https://github.com/craigahobbs/bare-script/commit/cd2098f) - function statements now require colon

- [b1cfaf5](https://github.com/craigahobbs/bare-script/commit/b1cfaf5) - add data functions \(moved from markdown-up\)

## 2.1.1 (2023-09-15)

- [d878111](https://github.com/craigahobbs/bare-script/commit/d878111)
  - add function last-arg-array syntax \(e.g. "function foo\(args...\)"\)
  - allow colon at end of function definition

## 2.1.0 (2023-09-01)

- [222cc07](https://github.com/craigahobbs/bare-script/commit/222cc07) - add the bare CLI

## 2.0.3 (2023-08-07)

- [7b86ca1](https://github.com/craigahobbs/bare-script/commit/7b86ca1) - fix expression library docs

## 2.0.2 (2023-08-07)

- [6add38b](https://github.com/craigahobbs/bare-script/commit/6add38b) - rename calc-script to bare-script

## 2.0.1 (2023-08-03)

- [783442c](https://github.com/craigahobbs/bare-script/commit/783442c) - ensure system include order

## 2.0.0 (2023-08-02)

- [2dfab50](https://github.com/craigahobbs/bare-script/commit/2dfab50) - cleanup standard library function prefixes

- [18773e1](https://github.com/craigahobbs/bare-script/commit/18773e1) - add system includes

- [dcae0c3](https://github.com/craigahobbs/bare-script/commit/dcae0c3) - make branch syntax more like Python

## 1.4.5 (2023-05-28)

- [20f54e3](https://github.com/craigahobbs/bare-script/commit/20f54e3) - remove jsdom dev dependency

## 1.4.4 (2023-05-23)

- [e93a3b4](https://github.com/craigahobbs/bare-script/commit/e93a3b4) - run tests with node --test

## 1.4.3 (2023-04-26)

- [c6a4832](https://github.com/craigahobbs/bare-script/commit/c6a4832) - fix datetimeNewUTC

## 1.4.2 (2023-04-20)

- [f9d5c63](https://github.com/craigahobbs/bare-script/commit/f9d5c63) - add datetimeNewUTC library function

## 1.4.1 (2023-04-19)

- [00ca597](https://github.com/craigahobbs/bare-script/commit/00ca597) - add schemaParseEx library function

## 1.4.0 (2023-03-02)

- [dd69a0c](https://github.com/craigahobbs/bare-script/commit/dd69a0c) - implement parallel fetch of include urls

## 1.3.20 (2023-02-27)

- [fbefbd0](https://github.com/craigahobbs/bare-script/commit/fbefbd0) - fix for Firefox versions prior to 103 \(missing Array.findLast\)

## 1.3.19 (2023-02-25)

- [c254e92](https://github.com/craigahobbs/bare-script/commit/c254e92) - improve foreach statement generation

## 1.3.18 (2023-02-25)

- [1d1e1ab](https://github.com/craigahobbs/bare-script/commit/1d1e1ab) - add defaultValue argument to objectGet function

## 1.3.17 (2023-02-24)

- [948924d](https://github.com/craigahobbs/bare-script/commit/948924d) - optimize while-do statement generation

- [f6dd84b](https://github.com/craigahobbs/bare-script/commit/f6dd84b) - optimize if-then statement generation

## 1.3.16 (2023-02-24)

- [27fc701](https://github.com/craigahobbs/bare-script/commit/27fc701) - run linter on included scripts

## 1.3.15 (2023-02-23)

- [9298087](https://github.com/craigahobbs/bare-script/commit/9298087) - add if-then, while-do, and foreach statements

## 1.3.14 (2023-02-10)

- [da4035a](https://github.com/craigahobbs/bare-script/commit/da4035a) - increase defaultMaxStatements to 1e9

## 1.3.13 (2023-02-06)

- [194fc3e](https://github.com/craigahobbs/bare-script/commit/194fc3e) - don't restrict arrays from objectGet and objectHas

## 1.3.12 (2023-02-06)

- [641a140](https://github.com/craigahobbs/bare-script/commit/641a140) - use jsonStringifySortKeys

## 1.3.11 (2023-02-03)

- [7da90f8](https://github.com/craigahobbs/bare-script/commit/7da90f8) - add objectHas script library function

## 1.3.10 (2023-02-02)

- [e06d518](https://github.com/craigahobbs/bare-script/commit/e06d518) - fix fetch of array of urls with failure

## 1.3.9 (2023-01-19)

- [07648ce](https://github.com/craigahobbs/bare-script/commit/07648ce) - fix jsonStringify

## 1.3.8 (2023-01-19)

- [0a9761c](https://github.com/craigahobbs/bare-script/commit/0a9761c) - jsonStringify now sorts keys

## 1.3.7 (2023-01-13)

- [78c7d4b](https://github.com/craigahobbs/bare-script/commit/78c7d4b) - fix string literal parsing when backslash is final character

## 1.3.6 (2022-12-15)

- [c774759](https://github.com/craigahobbs/bare-script/commit/c774759) - cleanup logging

## 1.3.5 (2022-10-28)

- [011d103](https://github.com/craigahobbs/bare-script/commit/011d103) - add schema functions

## 1.3.4 (2022-09-21)

- [f08fdc0](https://github.com/craigahobbs/bare-script/commit/f08fdc0) - fix lintScript function issues

## 1.3.3 (2022-09-21)

- [e875a2f](https://github.com/craigahobbs/bare-script/commit/e875a2f) - fix lintScript function issues

## 1.3.2 (2022-09-21)

- [2c1e8c1](https://github.com/craigahobbs/bare-script/commit/2c1e8c1) - add lintScript

## 1.3.1 (2022-09-20)

- [2e36f2e](https://github.com/craigahobbs/bare-script/commit/2e36f2e) - improve jsonParse and fetch

## 1.3.0 (2022-09-19)

- [efafefb](https://github.com/craigahobbs/bare-script/commit/efafefb) - language reference TOC and expressions sections

- [9f418fa](https://github.com/craigahobbs/bare-script/commit/9f418fa) - simplify jump

- [b4989d1](https://github.com/craigahobbs/bare-script/commit/b4989d1) - language reference introduction and statements section

## 1.2.6 (2022-09-14)

- [52b048b](https://github.com/craigahobbs/bare-script/commit/52b048b) - simplify the statement model

## 1.2.5 (2022-09-13)

- [9b64feb](https://github.com/craigahobbs/bare-script/commit/9b64feb) - fix fetch function with node's built-in fetch, update README

## 1.2.4 (2022-08-31)

- [5f359a6](https://github.com/craigahobbs/bare-script/commit/5f359a6) - add arrayExtend and objectAssign functions

## 1.2.3 (2022-08-29)

- [2d8d928](https://github.com/craigahobbs/bare-script/commit/2d8d928) - add datetimeISOFormat

## 1.2.2 (2022-08-26)

- [ab54537](https://github.com/craigahobbs/bare-script/commit/ab54537) - fix library documentation tool error message

## 1.2.1 (2022-08-19)

- [235b4a8](https://github.com/craigahobbs/bare-script/commit/235b4a8) - schema-markdown 1.2

## 1.2.0 (2022-08-19)

- [67f24b0](https://github.com/craigahobbs/bare-script/commit/67f24b0) - add encodeURI and encodeURIComponent to expression functions

## 1.1.10 (2022-08-19)

- [a5d9117](https://github.com/craigahobbs/bare-script/commit/a5d9117) - add encodeURI and encodeURIComponent functions

## 1.1.9 (2022-08-18)

- [a3f4c0a](https://github.com/craigahobbs/bare-script/commit/a3f4c0a) - remove encodeURIComponent

## 1.1.8 (2022-08-18)

- [0599f4f](https://github.com/craigahobbs/bare-script/commit/0599f4f) - add encodeURIComponent function

## 1.1.7 (2022-08-18)

- [8c2cb97](https://github.com/craigahobbs/bare-script/commit/8c2cb97) - separate model from library

## 1.1.6 (2022-08-17)

- [f0db8fa](https://github.com/craigahobbs/bare-script/commit/f0db8fa) - consolidate library documentation

## 1.1.5 (2022-08-16)

- [31498b4](https://github.com/craigahobbs/bare-script/commit/31498b4) - remove stringEncodeURL library function

## 1.1.4 (2022-08-08)

- [744a659](https://github.com/craigahobbs/bare-script/commit/744a659) - create function scope label object on demand

## 1.1.3 (2022-08-04)

- [9e789c1](https://github.com/craigahobbs/bare-script/commit/9e789c1) - move language reference to /language/

## 1.1.2 (2022-07-28)

- [0de5bcd](https://github.com/craigahobbs/bare-script/commit/0de5bcd) - update readme

## 1.1.1 (2022-07-25)

- [87e1356](https://github.com/craigahobbs/bare-script/commit/87e1356) - remove get/setGlobal from expression library

## 1.1.0 (2022-07-26)

- [71d1cc3](https://github.com/craigahobbs/bare-script/commit/71d1cc3) - move globals to runtime options

## 1.0.1 (2022-07-21)

- [0e4e92d](https://github.com/craigahobbs/bare-script/commit/0e4e92d) - calc-script 1.0.1

## 1.0.0 (2022-07-21)

- [46cbb12](https://github.com/craigahobbs/bare-script/commit/46cbb12) - calc-script 1.0.0
