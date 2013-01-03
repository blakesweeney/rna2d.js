desc "Update the RNA2D lib"
task :update do
  sh 'curl https://raw.github.com/blakesweeney/rna2d.js/develop/rna2d.js > static/js/rna2d.js'
  sh "git add static/js/rna2d.js"
  sh "git commit -m 'Latest RNA2D.js'"
end

desc "Generate css from less"
task :less do
  sh 'lessc static/less/main.less > static/css/main.css'
end
