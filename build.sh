#!/bin/sh

set -e

bin=rna2d.js

cat src/intro.js > $bin
cat src/main.js src/utils.js src/config.js src/brush.js >> $bin
for view in src/views/*.js; do
  base=`basename $view .js`;
  cat $view >> $bin
  cat src/views/$base/*.js >> $bin
done
cat src/outro.js >> $bin

lint=`command -v jsl || true`
if [[ -d "$lint" ]]; then
  exec $lint -process $bin
fi

compress=`command -v yuicompressor || true`
if [[ -x "$compress" ]]; then
  base=`basename $bin .js`
  $compress --type js -o $base.min.js $bin
fi
