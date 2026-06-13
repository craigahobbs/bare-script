# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

BareScript is a lightweight, embeddable scripting and expression language with a Python-like syntax. This repository is the **JavaScript implementation**; a companion **Python implementation** lives at `../bare-script-py/` and shares the same include-library `.bare` files and unit tests (synced via `make sync`). Both implementations are kept at 100% test coverage with identical test suites — changes here generally need a mirrored change in the Python repo.

## Authoring BareScript code

When writing, modifying, or reviewing BareScript code (`.bare` files, `markdown-script` blocks, MarkdownUp apps, or BareScript unit tests), first read `SKILL.md` at the repo root. It's the model-agnostic reference for the language, built-in library, include library, MarkdownUp app pattern, and unit-test / mocking pattern.

## Common commands

Build driven by `Makefile` + `Makefile.base` (the latter downloaded from `javascript-build`). Set `USE_DOCKER=1` or `USE_PODMAN=1` to containerize.

- `make test` — run the Node test suite (`node --test test/`)
- `make test TEST=<pattern>` — run a single Node test by name pattern
- `make lint` — ESLint over `lib/`, `test/`, `bin/`, `perf/`
- `make cover` — c8 coverage; enforces 100% on `lib/` and `test/`
- `make doc` — JSDoc + library docs build (writes to `build/doc/`)
- `make commit` — full pre-publish gate (test + lint + doc + cover)
- `make test-include` — run the `.bare` test suite under `lib/include/test/` via the `bare` CLI
- `make test-include TEST=<name>` — single `.bare` test
- `make perf` — benchmark BareScript (JS) vs JavaScript vs Python
- `make sync` — push `lib/include/` and `static/` to the Python repo
- `make clean` / `make superclean` — remove `build/`, downloaded base files, container images
- `npm test` — bare `node --test test/` invocation (skips container/build setup)

`make perf` benchmarks the runtime itself. For optimizing an individual include file, write a throwaway `.bare` harness under `perf/` and run with `node bin/bare.js perf/<file>.bare` — `perf/` is outside the shipped package and isn't synced cross-repo, so harnesses can live there until you're done and then be removed (regenerate as needed).

## Architecture

### Modules

The runtime is split so the synchronous path stays free of `async`:

- `lib/parser.js` — text → AST (the "BareScript model", a plain JSON object validated against the schema in `lib/model.js`). `parseScript` and `parseExpression` are the entry points.
- `lib/runtime.js` — synchronous `executeScript` / `evaluateExpression`. Implements statement counting (`maxStatements`, default 1e9), coverage recording, and the core interpreter loop.
- `lib/runtimeAsync.js` — `executeScriptAsync` / `evaluateExpressionAsync`. Required when the script uses async globals (e.g. `systemFetch`, includes). Mirrors the sync runtime's structure.
- `lib/library.js` — all ~200 built-in functions (`scriptFunctions`) and the smaller expression-only set (`expressionFunctions`).
- `lib/model.js` — Schema-Markdown type model for the BareScript AST + `lintScript`.
- `lib/value.js` — type coercion and comparison primitives (`valueType`, `valueCompare`, `valueArgsValidate`, etc.). Argument validation is declarative via `valueArgsModel`.
- `lib/options.js` — runtime option typedefs and the `urlFileRelative` URL resolver (platform-neutral).
- `lib/optionsNode.js` — Node-only `fetchFn` implementations (`fetchReadOnly`, `fetchReadWrite`) and `logStdout`. The browser/embedded use case skips this file.

### CLI

`bin/bare.js` is a thin shim around `lib/bare.js#main` that wires in `fetchReadWrite` + `logStdout`. `lib/bare.js` implements the `bare` CLI: argument parsing, `-c`/`-m`/`-d`/`-v`/`-x` flags, HTML/MarkdownUp render modes, and the `-x` lint/syntax-check mode.

### Include library (`lib/include/*.bare`)

Pure-BareScript libraries (args parsing, data aggregation/charts, markdown rendering, diff, unittest framework, etc.) live under `lib/include/`. They are part of the **shipped package** (`files` in `package.json`) and are loaded via `include <name.bare>` using the system include prefix. Each has a `testXxx.bare` counterpart in `lib/include/test/` driven by `unittest.bare`. Modify with `make test-include` (not just `make test`).

### Library function documentation

`lib/library.js` and `.bare` files use the `// $function:` / `# $function:` doc-comment convention. `baredoc` (CLI installed via `package.json` `bin`) reads these to generate the library documentation model JSON (e.g. `library-builtin.json`). To add a new built-in function:

1. Implement in `lib/library.js`, register in `scriptFunctions` (and `expressionFunctions` if expression-callable, plus `expressionFunctionMap` if the expression-context name differs).
2. Add the `$function: / $group: / $doc: / $arg:` doc block above it.
3. Add test cases in `test/testLibrary.js`.

`make doc` (and therefore `make commit`) also renders single-page Markdown versions of the library and library-model docs into `build/doc/library/` — `barescript-library.md` and `barescript-library-model.md` — published at <https://craigahobbs.github.io/bare-script/library/barescript-library.md> and <https://craigahobbs.github.io/bare-script/library/barescript-library-model.md>. These are the Markdown equivalents of the HTML library reference, intended for fetching into an AI assistant's context alongside `SKILL.md`.

## Conventions

- ESM throughout (`"type": "module"`). Use the `.js` extension in import paths.
- ESLint runs `js.configs.all` with project overrides in `eslint.config.js`; max line length 140, 4-space tabs, single quotes.
- All `lib/` code must keep coverage at 100% (c8 `--100`). New code without tests will fail `make commit`. Beware: defensive checks that become unreachable after a refactor (e.g. a `continue` guard left in place when the surrounding logic now guarantees its condition is false) will break coverage. Either remove the dead check and rely on the proven invariant, or add a test that exercises the defensive path.
- The sync runtime (`lib/runtime.js`) must remain non-async; only `lib/runtimeAsync.js` may use `await`. The two interpreters are kept structurally parallel — when changing one, mirror the change in the other.
- Argument validation goes through `valueArgsModel` / `valueArgsValidate` from `lib/value.js`; do not hand-roll type checks in library functions.
- Only one runtime dependency (`schema-markdown`); avoid adding more.

## Perf measurement

When optimizing an include file, measure within a single session — system load drifts noticeably between runs minutes apart and will produce false-positive or false-negative wins. The reliable pattern:

```bash
git diff lib/include/foo.bare > /tmp/foo.patch
git checkout lib/include/foo.bare
node bin/bare.js perf/foo.bare    # BEFORE
git apply /tmp/foo.patch
node bin/bare.js perf/foo.bare    # AFTER
```

Have the harness run each scenario 3–5 times; the first iteration is usually slow due to JIT warmup — focus on the steady-state numbers. Treat changes under ~2% as noise. Optimization ideas that look promising in isolation often regress in real workloads — measure each candidate against a same-session baseline before committing.

Prefer a *real* document over a synthetic one for the harness input. The distribution of features in real content — span density, link patterns, code-block sizes, paragraph length — reflects what users actually feed the library; a hand-built blob can over-weight one feature and miss the actual bottleneck. For markdown-rendering work, `static/language/README.md` is a convenient ~14 KB sample. Two practical notes:

- `systemFetch` is async, so a harness that calls it needs `async function main():`.
- `systemFetch` resolves relative paths against the script's directory, not the process CWD. From `perf/foo.bare`, the README is `'../static/language/README.md'`.

When an optimization is behaviorally correct but fails a test, consider whether the test is asserting on a "don't care" edge case — for example, a code-block-line input with a baked-in trailing `\n` that the parser pipeline never actually produces. Modifying the test input is sometimes the right call. Check whether the corner case is documented behavior first.

## Cross-repo workflow / tandem development

The JS and Python implementations are mirrors of each other — great effort has been made to keep `lib/*.js` and the corresponding `bare_script/*.py` files (runtime, value, parser, library, model, options, etc.) as close to line-for-line identical as possible, and they must stay that way. **Any change to one implementation needs a parallel change to the other in the same working session** — features, bug fixes, refactors, optimizations, and test additions all apply.

Workflow for a tandem change:

- Changes to `lib/include/` or `static/` (the shared `.bare` sources and include-library tests): make the change here, run `make test-include`, then `make sync` to push to `../bare-script-py/`. Do not hand-edit those files in the Python repo.
- Changes to `lib/*.js`: make the parallel edit in `../bare-script-py/`'s corresponding module. Keep structure, naming, and ordering aligned so the two files diff cleanly.
- After editing both repos, run the full gate in each: `make commit` (tests + lint + 100% coverage), plus `make test-include`. For perf-sensitive changes also run `make perf` in both.
- For optimization work specifically: an optimization should not disproportionately regress either implementation. Favor wins that make `bare-script` (JavaScript) faster, since JS is the more performance-sensitive target. Stage the changes in each repo with a prepared commit message but don't commit until you've made an accept/reject recommendation per project based on the measured deltas — an optimization can be worth keeping in one repo and rejecting in the other if perf diverges sharply.
