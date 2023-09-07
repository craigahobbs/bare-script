# Licensed under the MIT License
# https://github.com/craigahobbs/bare-script/blob/main/LICENSE


# Download javascript-build
define WGET
ifeq '$$(wildcard $(notdir $(1)))' ''
$$(info Downloading $(notdir $(1)))
_WGET := $$(shell $(call WGET_CMD, $(1)))
endif
endef
WGET_CMD = if which wget; then wget -q -c $(1); else curl -f -Os $(1); fi
$(eval $(call WGET, https://raw.githubusercontent.com/craigahobbs/javascript-build/main/Makefile.base))
$(eval $(call WGET, https://raw.githubusercontent.com/craigahobbs/javascript-build/main/jsdoc.json))
$(eval $(call WGET, https://raw.githubusercontent.com/craigahobbs/javascript-build/main/.eslintrc.cjs))


# Include javascript-build
include Makefile.base


ESLINT_ARGS := $(ESLINT_ARGS) bin/


help:
	@echo "            [perf]"


clean:
	rm -rf Makefile.base jsdoc.json .eslintrc.cjs


doc:
    # Copy statics
	cp -R static/* build/doc/

    # Generate the library documentation
	$(NODE_DOCKER) npx baredoc lib/library.js > build/doc/library/library.json

    # Generate the expression library documentation
	$(NODE_DOCKER) npx baredoc lib/library.js | \
		$(NODE_DOCKER) node --input-type=module -e "$$LIBRARY_EXPR" > build/doc/library/expression.json

    # Generate the model documentation
	$(NODE_DOCKER) node --input-type=module \
		-e 'import {bareScriptTypes} from "./lib/model.js"; console.log(JSON.stringify(bareScriptTypes))' \
		> build/doc/model/model.json


# JavaScript to generate the expression library documentation
define LIBRARY_EXPR
import {expressionFunctionMap} from "./lib/library.js";
import {readFileSync} from 'node:fs';

// Read the script library documentation JSON from stdin
const library = JSON.parse(fs.readFileSync(0).toString());
const libraryFunctionMap = Object.fromEntries(library.functions.map((func) => [func.name, func]));

// Output the expression library documentation
const libraryExpr = {'functions': []};
for (const [exprFnName, scriptFnName] of Object.entries(expressionFunctionMap)) {
	libraryExpr.functions.push({...libraryFunctionMap[scriptFnName], 'name': exprFnName});
}
console.log(JSON.stringify(libraryExpr, null, 4));
endef
export LIBRARY_EXPR


# Run performance tests
.PHONY: perf
perf: commit
	echo "Language,TimeMs" > $(PERF_CSV)
	for X in $$(seq 1 $(PERF_RUNS)); do echo "BareScript,$$($(NODE_DOCKER) npx bare perf/test.bare)" >> $(PERF_CSV); done
	for X in $$(seq 1 $(PERF_RUNS)); do echo "JavaScript,$$($(NODE_DOCKER) node perf/test.js)" >> $(PERF_CSV); done
	for X in $$(seq 1 $(PERF_RUNS)); do echo "Python,$$($(PYTHON_DOCKER) python3 perf/test.py)" >> $(PERF_CSV); done
	$(PYTHON_DOCKER) python3 -c "$$PERF_PY"


# Performance test constants
PERF_CSV := build/perf.csv
PERF_RUNS := 5


# Python to report on performance test data
define PERF_PY
import csv
from collections import defaultdict

# Read the performance test data
languageTimings = defaultdict(list)
with open('$(PERF_CSV)', 'r') as csvfile:
	reader = csv.DictReader(csvfile)
	for row in reader:
		languageTimings[row['Language']].append(float(row['TimeMs']))

# Report language timings
timings = dict((language, min(timings)) for language, timings in languageTimings.items())
for language, timing in sorted(timings.items(), key = lambda kv: kv[1], reverse = True):
	report = f'{language} - {timing:.1f} milliseconds'
	print(report if language == 'BareScript' else f'{report} ({timings["BareScript"] / timing:.0f}x)')
endef
export PERF_PY
