# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

BareScript is a lightweight, embeddable scripting and expression language with a Python-like syntax. This repository is the **JavaScript implementation**; a companion Python implementation lives at `../bare-script-py` and shares the same `lib/include/` `.bare` library files and unit tests (synced via `make sync`). Both implementations are kept at 100% test coverage with identical test suites — changes here generally need a mirrored change in the Python repo.

## Authoring BareScript code

When the user asks you to write, modify, or review BareScript (`.bare` files, `markdown-script` blocks, MarkdownUp applications, or BareScript unit tests), first read `SKILL.md` at the repo root. It documents the language, the built-in and include libraries, the MarkdownUp app pattern, and the unit-test / mocking pattern used here. It is a model-agnostic skill file — Claude Code, other assistants, and human readers all use the same content.

## Common commands

The build is driven by `Makefile` + `Makefile.base` (the latter is downloaded from `javascript-build`). All commands run inside `$(NODE_SHELL)` — set `USE_DOCKER=1` or `USE_PODMAN=1` to containerize.

- `make test` — run the Node test suite (`node --test test/`)
- `make test TEST=<pattern>` — run a single test by name pattern
- `make lint` — ESLint over `lib/`, `test/`, `bin/`, `perf/`
- `make cover` — c8 coverage; enforces 100% (`--100`) on `lib/` and `test/`
- `make doc` — full JSDoc + library docs build (writes to `build/doc/`)
- `make commit` — runs test, lint, doc, cover (the pre-publish gate)
- `make test-include` — runs the `.bare` unit tests under `lib/include/test/` via the `bare` CLI
- `make test-include TEST=<name>` — single `.bare` test
- `make perf` — benchmark BareScript vs JavaScript vs Python implementations
- `make clean` / `make superclean` — remove `build/`, downloaded base files, container images
- `npm test` — bare `node --test test/` invocation (no container/build dependency setup)

## Architecture

### Layering

The runtime is split so the synchronous path stays free of `async`:

- `lib/parser.js` — text → AST (the "BareScript model", a plain JSON object validated against the schema in `lib/model.js`). `parseScript` and `parseExpression` are the entry points.
- `lib/runtime.js` — synchronous `executeScript` / `evaluateExpression`. Implements statement counting (`maxStatements`, default 1e9), coverage recording, and the core interpreter loop.
- `lib/runtimeAsync.js` — `executeScriptAsync` / `evaluateExpressionAsync`. Required when the script uses async globals (e.g. `systemFetch`, includes). Mirrors the sync runtime's structure.
- `lib/library.js` — all ~200 built-in functions (`scriptFunctions`) and the smaller expression-only set (`expressionFunctions`). Function metadata is encoded in `// $function: / $group: / $arg:` comments above each function; `baredoc` parses these to build `library.json`.
- `lib/model.js` — Schema-Markdown type model for the BareScript AST + `lintScript`.
- `lib/value.js` — type coercion and comparison primitives used everywhere (`valueType`, `valueCompare`, `valueArgsValidate`, etc.). Argument validation is declarative via `valueArgsModel`.
- `lib/options.js` — runtime option typedefs and the `urlFileRelative` URL resolver (platform-neutral).
- `lib/optionsNode.js` — Node-only `fetchFn` implementations (`fetchReadOnly`, `fetchReadWrite`) and `logStdout`. The browser/embedded use case skips this file.

### CLI

- `bin/bare.js` is a thin shim around `lib/bare.js#main` and wires in `fetchReadWrite` + `logStdout`.
- `lib/bare.js` implements the `bare` CLI: argument parsing, `-c`/`-m`/`-d`/`-v`/`-x` flags, HTML/MarkdownUp render modes, and the `-x` lint/syntax-check mode.

### Include library (`lib/include/*.bare`)

Pure-BareScript libraries (args parsing, data aggregation/charts, markdown rendering, diff, unittest framework, etc.) live under `lib/include/`. They are part of the **shipped package** (`files` in `package.json`) and are loaded via `include <name.bare>` using the system include prefix. Each has a `testXxx.bare` counterpart in `lib/include/test/` driven by `unittest.bare`.

When modifying include files, run `make test-include` (not just `make test`). After changes, sync to the Python repo: `make sync`.

### Where library functions are documented

Documentation comments inside `lib/library.js` and the `.bare` files use the `// $function:` / `# $function:` convention. `baredoc` (the CLI installed via `package.json` `bin`) reads these to generate `library.json`. To add a new built-in function:

1. Implement it in `lib/library.js`, register it in `scriptFunctions` (and `expressionFunctions` if expression-callable, plus `expressionFunctionMap` if the expression-context name differs).
2. Add the `$function: / $group: / $doc: / $arg:` doc block above it.
3. Add test cases in `test/testLibrary.js`.

## Conventions

- ESM throughout (`"type": "module"`). Use the `.js` extension in import paths.
- ESLint runs `js.configs.all` with project overrides in `eslint.config.js`; max line length 140, 4-space tabs, single quotes.
- All `lib/` code must keep coverage at 100% (c8 `--100`). New code without tests will fail `make commit`.
- The sync runtime (`lib/runtime.js`) must remain non-async; only `lib/runtimeAsync.js` may use `await`. The two interpreters are kept structurally parallel — when changing one, mirror the change in the other.
- Argument validation goes through `valueArgsModel` / `valueArgsValidate` from `lib/value.js`; do not hand-roll type checks in library functions.
- Only one runtime dependency (`schema-markdown`); avoid adding more.

## Cross-repo workflow

When changing anything under `lib/include/` or `static/`, the canonical workflow is: make the change here, run `make test-include`, then `make sync` to push to `../bare-script-py`. Equivalent JavaScript-side changes in `lib/*.js` typically need a parallel edit in the Python implementation's source.
