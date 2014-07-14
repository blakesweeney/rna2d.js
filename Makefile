INPUT=src/main.js
OUTPUT=rna2d.js
MIN=rna2d.min.js
BROWSERIFY=./node_modules/.bin/browserify
UGLIFY=./node_modules/.bin/uglifyjs
LESS=$(wildcard static/less/*.less)
CSS=static/css/main.css
JS=$(wildcard src/*.js src/**/*.js)

all: js css doc

js: $(OUTPUT) $(MIN)

$(OUTPUT): $(JS)
	$(BROWSERIFY) $(INPUT) > $@

$(MIN): $(OUTPUT)
	$(UGLIFY) $^ > $@

css: $(CSS)

$(CSS): $(LESS)
	lessc $^ > $@

doc: $(OUTPUT)
	./node_modules/.bin/jsdoc -d doc $(OUTPUT)
