/goal Port src/bare_script/runtime.py to src/bare_script/runtime_c.c from scratch and improve
measured performance measures by 90%.

Provide frequent, "fancy" status reports with current optimization statistics and current task
description at all phases of the process.

---

## Phase 0 — Measure existing `runtime_c.c` performance

First, `make clean` and `make commit` to verify all checks and tests pass.

Measure the pure-Python `runtime.py` performance by blending the following commands:

```
make test-include
```

and:

```
make perf
```

---

## Phase 1 — Port `runtime.py` to `runtime_c.c` from scratch

Begin by deleting any existing `src/bare_script/runtime_c.c` entirely and do not refer to it.

Next, port `runtime.py` to a new `runtime_c.c` from scratch.

Read these files:

- `src/bare_script/runtime.py` — **source of truth**; port this to C
- `src/bare_script/__init__.py` — which symbols the module must export
- `setup.py` — C extension build configuration
- `src/tests/test_runtime.py` — test suite; understand coverage requirements

Build and test:

```
make clean test
```

Check that `src/build/runtime_c.so` exists - if it doesn't then the `runtime_c.c` build failed.

Once all tests pass, commit the initial port with a brief description.

Measure baseline performance of the `runtime_c.c` port.

```
make test-include BARESCRIPT_RUNTIME_C=1
```

and:

```
make perf BARESCRIPT_RUNTIME_C=1
```

---

## Phase 2 — Optimization Planning

Analyze the `runtime_c.c` code looking for optimization ideas. Prefer simplicity and improved
core-architecture to complexity and side-cases. Conservatively estimate the expected improvement in
performance for each optimization.

Prioritize tasks with judgement based on estimated performance impact and simplicity/complexity. Do
not be afraid of aggressive changes if you think they can be highly impactful.

Please continue to update and re-prioritize our optimization ideas throughout the optimization
process.

---

## Phase 3 — Iterative Optimization

Implement the current top optimization idea.

Build and test:

```
make clean test BARESCRIPT_RUNTIME_C=1
```

Check that `src/build/runtime_c.so` exists - if it doesn't then the `runtime_c.c` build failed.

Measure `runtime_c.c` performance again and compute the percent improvement. Revert optimizations
that don't improve performance or meaningfully simplify. Reject if the performance gain is small and
the change comparatively complex.

If accepting the optimization, commit with a brief comment.

---

## Phase 4 - Final Review

When you have exhausted worthwhile optimization ideas, stop the optimization.

Do a careful review of runtime_c.c with an eye for memory and reference leaks.

Add a comment to `runtime_c.c` that describes the process by which it was created and the
progression of optimizations. Commit.

You are done (even if goal hasn't been achieved).
