var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'soundbarrel'
    },
    port: 3000,
    db: 'mongodb://localhost/soundbarrel-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'soundbarrel'
    },
    port: 3000,
    db: 'mongodb://localhost/soundbarrel-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'soundbarrel'
    },
    port: 3000,
    db: 'mongodb://localhost/soundbarrel-production'
  }
};

module.exports = config[env];
