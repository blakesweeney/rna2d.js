INPUT=src/main.js
OUTPUT=rna2d.js
MIN=rna2d.min.js
BROWSERIFY=./node_modules/.bin/browserify
UGLIFY=./node_modules/.bin/uglifyjs
JS=$(wildcard src/*.js src/**/*.js)

.PHONY: test

all: test js doc

js: $(OUTPUT) $(MIN)

$(OUTPUT): $(JS)
	$(BROWSERIFY) $(INPUT) --standalone Rna2D > $@

$(MIN): $(OUTPUT)
	$(UGLIFY) $^ > $@

doc: $(OUTPUT)
	./node_modules/.bin/jsdoc -d doc $(OUTPUT)

test:
	./node_modules/.bin/vows test/rna2d/* --spec
