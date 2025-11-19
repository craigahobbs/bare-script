# Licensed under the MIT License
# https://github.com/craigahobbs/bare-script/blob/main/LICENSE


# Download javascript-build
JAVASCRIPT_BUILD_DIR ?= ../javascript-build
define WGET
ifeq '$$(wildcard $(notdir $(1)))' ''
$$(info Downloading $(notdir $(1)))
$$(shell [ -f $(JAVASCRIPT_BUILD_DIR)/$(notdir $(1)) ] && cp $(JAVASCRIPT_BUILD_DIR)/$(notdir $(1)) . || $(call WGET_CMD, $(1)))
endif
endef
WGET_CMD = if command -v wget >/dev/null 2>&1; then wget -q -c $(1); else curl -f -Os $(1); fi
$(eval $(call WGET, https://craigahobbs.github.io/javascript-build/Makefile.base))
$(eval $(call WGET, https://craigahobbs.github.io/javascript-build/jsdoc.json))
$(eval $(call WGET, https://craigahobbs.github.io/javascript-build/eslint.config.js))


# Include javascript-build
include Makefile.base


ESLINT_ARGS := $(ESLINT_ARGS) bin/ perf/


help:
	@echo "            [perf|sync-include|test-include]"


clean:
	rm -rf Makefile.base jsdoc.json eslint.config.js


.PHONY: sync-include
sync-include:
	rsync -rv --delete --exclude=.git/ --exclude=__init__.py lib/include/ ../bare-script-py/src/bare_script/include/
	rsync -rv --delete --exclude=.git/ static/ ../bare-script-py/static/


.PHONY: test-include
commit: test-include
test-include: build/npm.build
	$(NODE_SHELL) npx bare -x -m lib/include/*.bare lib/include/test/*.bare
	$(NODE_SHELL) npx bare -d -m lib/include/test/runTests.bare$(if $(TEST), -v vUnittestTest "'$(TEST)'")
	$(NODE_SHELL) npx bare -d -v vUnittestReport true lib/include/test/runTestsMarkdownUp.bare$(if $(TEST), -v vUnittestTest "'$(TEST)'")


doc:
    # Copy statics
	cp -R static/* build/doc/

    # Generate the library documentation
	$(NODE_SHELL) npx baredoc lib/library.js lib/include/*.bare -o build/doc/library/library.json

    # Generate the single-page library documentation
	cd build/doc/library/ && \
	$(NODE_SHELL) npx bare -m -c 'include <baredoc.bare>' \
		-v 'vSingle' 'true' -v 'vPublish' 'true' \
		-c "baredocMain('library.json', 'The BareScript Library', null, 'libraryContent.json')" \
		> barescript-library.md

    # Generate the expression library documentation
	$(NODE_SHELL) node --input-type=module -e "$$DOC_EXPR_JS" build/doc/library/library.json build/doc/library/expression.json

    # Generate the single-page expression library documentation
	cd build/doc/library/ && \
	$(NODE_SHELL) npx bare -m -c 'include <baredoc.bare>' \
		-v 'vSingle' 'true' -v 'vPublish' 'true' \
		-c "baredocMain('expression.json', 'The BareScript Expression Library', null, 'expressionContent.json')" \
		> barescript-expression-library.md

    # Generate the library model documentation
	$(NODE_SHELL) node --input-type=module -e "$$DOC_LIBRARY_MODEL_JS" build/doc/library/model.json

    # Generate the single-page library model documentation
	cd build/doc/library/ && \
	$(NODE_SHELL) npx bare -m -c 'include <schemaDocApp.bare>' \
		-v 'vSingle' 'true' -v 'vPublish' 'true' \
		-c "schemaDocAppMain('model.json', 'The BareScript Library Models')" \
		> barescript-library-model.md

    # Generate the runtime model documentation
	$(NODE_SHELL) node --input-type=module -e "$$DOC_RUNTIME_MODEL_JS" build/doc/model/model.json

    # Generate the single-page runtime model documentation
	cd build/doc/model/ && \
	$(NODE_SHELL) npx bare -m -c 'include <schemaDocApp.bare>' \
		-v 'vSingle' 'true' -v 'vPublish' 'true' \
		-c "schemaDocAppMain('model.json', 'The BareScript Runtime Model')" \
		> barescript-model.md


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
import {fetchReadWrite, logStdout} from './lib/optionsNode.js';
import {regexMatchTypes, systemFetchTypes} from './lib/library.js';
import {aggregationTypes} from './lib/data.js';
import {argv} from 'node:process';
import {executeScriptAsync} from './lib/runtimeAsync.js';
import {parseScript} from './lib/parser.js';
import {valueJSON} from './lib/value.js';
import {writeFileSync} from 'node:fs';

// Command-line arguments
const [, typeModelPath] = argv;

// Create the library type model
const types = {...aggregationTypes, ...regexMatchTypes, ...systemFetchTypes};

// Create the include library type model
const script = parseScript(`\
include 'lib/include/args.bare'
include 'lib/include/dataLineChart.bare'
include 'lib/include/dataTable.bare'
include 'lib/include/diff.bare'
include 'lib/include/pager.bare'

includeTypes = {}
objectAssign(includeTypes, argsTypes)
objectAssign(includeTypes, dataLineChartTypes)
objectAssign(includeTypes, dataTableTypes)
objectAssign(includeTypes, diffTypes)
objectAssign(includeTypes, pagerTypes)
return includeTypes
`);
const includeTypes = await executeScriptAsync(script, {'fetchFn': fetchReadWrite, 'logFn': logStdout});
Object.assign(types, includeTypes);

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


# Run performance tests
.PHONY: perf
perf: build/npm.build
	mkdir -p $(dir $(PERF_JSON))
	echo "[" > $(PERF_JSON)
	for X in $$(seq 1 $(PERF_RUNS)); do echo '{"language": "BareScript", "timeMs": '$$($(NODE_SHELL) npx bare perf/test.bare)'},' >> $(PERF_JSON); done
	for X in $$(seq 1 $(PERF_RUNS)); do echo '{"language": "JavaScript", "timeMs": '$$($(NODE_SHELL) node perf/test.js)'},' >> $(PERF_JSON); done
	for X in $$(seq 1 $(PERF_RUNS)); do echo '{"language": "Python", "timeMs": '$$($(PYTHON_SHELL) python3 perf/test.py)'},' >> $(PERF_JSON); done
	echo '{"language": null, "timeMs": null}' >> $(PERF_JSON)
	echo "]" >> $(PERF_JSON)
	$(NODE_SHELL) node --input-type=module -e "$$PERF_JS"


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
