const env = process.env.NODE_ENV || 'development';

module.exports = {
  env: env,
  src: {
    scripts: {
      entry: './src/main.js',
      all: ['./src/**/*.js'],
      bundled: env === 'development' ? 'rna2d.js' : 'rna2d.min.js',
    },
  },
  tests: {
    all: ['./test/**/*.js']
  },
  dest: './dist',
  serverport: 8080,
};
