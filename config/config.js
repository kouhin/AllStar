var config = {
  dev: {
    mongo: {
      uri: 'mongodb://localhost:27017/allstar',
      options: {
        db: {
          native_parser: true
        },
        server: {
          poolSize: 5
        }
      }
    }
  },
  production: {
    mongo: {
      uri: 'mongodb://localhost:27017/allstar',
      options: {
        db: {
          native_parser: true
        },
        server: {
          poolSize: 5
        }
      }
    }
  }
};

module.exports = config[process.env.NODE_ENV] || config['dev'];