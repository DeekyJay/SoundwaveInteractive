var fs = require('fs');
function Config(file) {
  this.file = file;
  this.auth = {
    username: '',
    password: '',
    channel: '',
  };
  this.version = '504';

  if(!fs.existsSync(file)) {
    var def = {
      "username": "",
      "password": "",
      "channel": ""
    };

    fs.writeFileSync(file, JSON.stringify(def, null, '\t'));
  }
  file = file.replace('\\', '/');

  var config;
  try {
    config = require(file);
    Object.assign(this.auth, config);
  }catch(e){
    console.log(e);
    if(e.code === "MODULE_NOT_FOUND") {
      throw new Error("Cannot find " + file);
    } else {
      throw new Error("Your config file is not json");
    }
  }
}

Config.prototype.save = function (){
  fs.writeFileSync(this.file, JSON.stringify(this.auth, null, '\t'));
};

module.exports = Config;
