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


ESLINT_ARGS := $(ESLINT_ARGS) bin/ perf/


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
		$(NODE_DOCKER) node --input-type=module -e "$$DOC_EXPR_JS" > build/doc/library/expression.json

    # Generate the model documentation
	$(NODE_DOCKER) node --input-type=module \
		-e 'import {bareScriptTypes} from "./lib/model.js"; console.log(JSON.stringify(bareScriptTypes))' \
		> build/doc/model/model.json


# JavaScript to generate the expression library documentation
define DOC_EXPR_JS
import {expressionFunctionMap} from "./lib/library.js";
import {readFileSync} from 'node:fs';

// Read the script library documentation JSON from stdin
const library = JSON.parse(readFileSync(0).toString());
const libraryFunctionMap = Object.fromEntries(library.functions.map((func) => [func.name, func]));

// Output the expression library documentation
const libraryExpr = {'functions': []};
for (const [exprFnName, scriptFnName] of Object.entries(expressionFunctionMap)) {
	libraryExpr.functions.push({...libraryFunctionMap[scriptFnName], 'name': exprFnName});
}
console.log(JSON.stringify(libraryExpr, null, 4));
endef
export DOC_EXPR_JS


# Run performance tests
.PHONY: perf
perf: build/npm.build
	mkdir -p $(dir $(PERF_JSON))
	echo "[" > $(PERF_JSON)
	for X in $$(seq 1 $(PERF_RUNS)); do echo '{"language": "BareScript", "timeMs": '$$($(NODE_DOCKER) npx bare perf/test.bare)'},' >> $(PERF_JSON); done
	for X in $$(seq 1 $(PERF_RUNS)); do echo '{"language": "JavaScript", "timeMs": '$$($(NODE_DOCKER) node perf/test.js)'},' >> $(PERF_JSON); done
	for X in $$(seq 1 $(PERF_RUNS)); do echo '{"language": "Python", "timeMs": '$$($(PYTHON_DOCKER) python3 perf/test.py)'},' >> $(PERF_JSON); done
	echo '{"language": null, "timeMs": null}' >> $(PERF_JSON)
	echo "]" >> $(PERF_JSON)
	$(NODE_DOCKER) node --input-type=module -e "$$PERF_JS"


# Performance test constants
PERF_JSON := build/perf.json
PERF_RUNS := 5


# JavsScript to report on performance test data
define PERF_JS
import {readFileSync} from 'node:fs';

// Read the performance test data
const bestTimings = {};
for (const {language, timeMs}  of JSON.parse(readFileSync('$(PERF_JSON)'))) {
	if (language !== null && (!(language in bestTimings) || timeMs < bestTimings[language])) {
		bestTimings[language] = timeMs;
	}
}

// Report the timing multiples
for (const [language, timeMs] of Object.entries(bestTimings).sort(([, timeMs1], [, timeMs2]) => timeMs2 - timeMs1)) {
	const report = `$${language} - $${timeMs.toFixed(3)} milliseconds`;
	console.log(language === 'BareScript' ? report : `$${report} ($${(bestTimings.BareScript / timeMs).toFixed(0)}x)`);
}
endef
export PERF_JS
