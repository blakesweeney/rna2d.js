$file = 'rna2d.js'
$compressed = $file.sub('js', 'min.js')

def append(file)
  sh("cat #{file} >> #{$file}")
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
  end

  append('src/outro.js')
end

desc "Compress the generate file"
task :compress do
  sh("yuicompressor --type js -o %s %s" % [$compressed, $file])
end

desc "Build and compress"
task :release => [:build, :compress] do
  sh("git add rna2d.js rna2d.min.js")
  sh("git commit -m 'Update libs'")
end

desc "Merge and push to github"
task :deploy => :release do
  sh('git push origin develop')
  sh('git checkout master')
  sh('git merge master develop')
  sh('git push origin master')
  sh('git checkout develop')
end

task :default => :build
