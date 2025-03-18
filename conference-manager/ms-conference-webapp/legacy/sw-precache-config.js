module.exports = {
  staticFileGlobs: [
    'build/static/css/**.css', 'build/**.html', 'build/images/**.*', 'build/static/js/**.js', 'build/static/media/**.*'
  ],
  swFilePath: './build/service-worker.js',
  stripPrefix: 'build/',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/us-central1-spider-node-app.cloudfunctions.net\/app\/api\//,
      handler: 'networkFirst'
    }, {
      urlPattern: /^https:\/\/firebasestorage.googleapis.com\//,
      handler: 'cacheFirst'
    }
  ]
};
