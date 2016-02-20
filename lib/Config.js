function Config(file) {
  this.auth = {
    username: '',
    password: '',
    channel: '',
  };
  this.version = '';
  this.code = '';

  if(file) {
    file = file.replace('\\', '/');
  }
  else {
    throw new Error("Config File does not exist!");
  }

  var config;
  try {
    config = require('../'+file);
    Object.assign(this, config);
  }catch(e){
    console.log(e);
    if(e.code === "MODULE_NOT_FOUND") {
      throw new Error("Cannot find " + file);
    } else {
      throw new Error("Your config file is not json");
    }
  }

  var authConfig;
  try {
    authConfig = require('../config/auth.json');
    Object.assign(this.auth, authConfig);
  } catch(e) {
    console.log(e);
  }
}

module.exports = Config;
