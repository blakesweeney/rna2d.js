$file = 'rna2d.js'
$compressed = $file.sub('js', 'min.js')

def append(file)
  sh("cat #{file} >> #{$file}")
end

desc "Run a jsl over the RNA2D library"
task :lint do
  sh "jsl -process %s", $file
end

desc "Generate the RNA2D library"
task :build do
  sh('cat src/intro.js src/main.js > %s' % $file)

  Dir['src/*.js'].each do |file|
    next if ['src/main.js', 'src/intro.js', 'src/outro.js'].include?(file)
    append(file)
  end

  Dir['src/components/*.js'].each do |file|
    append(file)
  end

  Dir['src/views/*.js'].each do |file|
    append(file)
    base = File.basename(file, '.js')
    Dir['src/views/%s/*.js' % base].each do |file|
      append(file)
    end
  end

  append('src/outro.js')
end

desc "Compress the generate file"
task :compress do
  sh("yuicompressor --type js -o %s %s" % [$compressed, $file])
end

desc "Build and compress"
task :release => [:build, :compress]

task :default => :build
