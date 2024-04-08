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
$(eval $(call WGET, https://raw.githubusercontent.com/craigahobbs/javascript-build/main/eslint.config.js))


# Include javascript-build
include Makefile.base


ESLINT_ARGS := $(ESLINT_ARGS) bin/ perf/


help:
	@echo "            [perf|test-doc]"


clean:
	rm -rf Makefile.base jsdoc.json eslint.config.js


doc:
    # Copy statics
	cp -R static/* build/doc/

    # Generate the library documentation
	$(NODE_DOCKER) npx baredoc lib/library.js -o build/doc/library/library.json

    # Generate the expression library documentation
	$(NODE_DOCKER) node --input-type=module -e "$$DOC_EXPR_JS" build/doc/library/library.json build/doc/library/expression.json

    # Generate the library model documentation
	$(NODE_DOCKER) node --input-type=module -e "$$DOC_LIBRARY_MODEL_JS" build/doc/library/model.json

    # Generate the runtime model documentation
	$(NODE_DOCKER) node --input-type=module -e "$$DOC_RUNTIME_MODEL_JS" build/doc/model/model.json


# JavaScript to generate the expression library documentation
define DOC_EXPR_JS
import {readFileSync, writeFileSync} from 'node:fs';
import {argv} from 'node:process';
import {expressionFunctionMap} from './lib/library.js';
import {valueJSON} from './lib/value.js';

// Command-line arguments
const [, libraryPath, expressionPath] = argv;

// Read the script library documentation model
const library = JSON.parse(readFileSync(libraryPath, {'encoding': 'utf-8'}));

// Create the expression documentation model
const libraryMap = Object.fromEntries(library.functions.map((func) => [func.name, func]));
const libraryExpr = {'functions': []};
for (const [exprFnName, scriptFnName] of Object.entries(expressionFunctionMap)) {
    libraryExpr.functions.push({...libraryMap[scriptFnName], 'name': exprFnName});
}

// Write the expression documentation model
writeFileSync(expressionPath, valueJSON(libraryExpr));
endef
export DOC_EXPR_JS


# JavaScript to generate the library model documentation
define DOC_LIBRARY_MODEL_JS
import {regexMatchTypes, systemFetchTypes} from './lib/library.js';
import {aggregationTypes} from './lib/data.js';
import {argv} from 'node:process';
import {valueJSON} from './lib/value.js';
import {writeFileSync} from 'node:fs';

// Command-line arguments
const [, typeModelPath] = argv;

// Create the library type model
const types = {...aggregationTypes, ...regexMatchTypes, ...systemFetchTypes};

// Write the library type model
writeFileSync(typeModelPath, valueJSON(types));
endef
export DOC_LIBRARY_MODEL_JS


# JavaScript to generate the runtime model documentation
define DOC_RUNTIME_MODEL_JS
import {argv} from 'node:process';
import {bareScriptTypes} from './lib/model.js';
import {valueJSON} from './lib/value.js';
import {writeFileSync} from 'node:fs';

// Command-line arguments
const [, typeModelPath] = argv;

// Write the runtime type model
writeFileSync(typeModelPath, valueJSON(bareScriptTypes));
endef
export DOC_RUNTIME_MODEL_JS


.PHONY: test-doc
commit: test-doc
test-doc: build/npm.build
	$(NODE_DOCKER) npx bare -s static/library/*.mds static/library/test/*.mds
	$(NODE_DOCKER) npx bare -c "include <markdownUp.bare>" static/library/test/runTests.mds$(if $(DEBUG), -d)$(if $(TEST), -v vTest "'$(TEST)'")


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
PERF_RUNS := 3


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
