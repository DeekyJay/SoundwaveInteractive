var fs = require('fs-extra');
var Logger = require('./Logger');
var logger = new Logger("Config");
function Config(folder) {
  this.file = folder + "/user.json";
  this.profilesPath = folder + "/profiles/";
  this.version = '504';
  this.auth = {
    username: '',
    password: '',
    channel: '',
    last: ''
  };
  this.profiles = [];

  this.loadUser = function() {
    logger.log(this.file);
    if(!fs.existsSync(this.file)) {
      logger.log("No user config file exists. Creating one . . .");
      var def = {
        username: "",
        password: "",
        channel: "",
        last: "Default"
      };

      fs.writeFileSync(this.file, JSON.stringify(def, null, '\t'));
    }
    this.file = this.file.replace('\\', '/');

    var config;
    try {
      config = require(this.file);
      Object.assign(this.auth, config);
    }catch(e){
      logger.log(e);
      if(e.code === "MODULE_NOT_FOUND") {
        throw new Error("Cannot find " + this.file);
      } else {
        throw new Error("Your config file is not json");
      }
    }
    logger.log("User config file loaded.");
  };

  this.loadProfiles = function() {
    logger.log("Attempting to load profiles.");
    this.profiles = [];
    /*** DEFAULT PROFILE FORMAT ***/
    var defp = {"profile": "",
    "sounds": [
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""}
      ]};

    var itrDefp = JSON.parse(JSON.stringify(defp));

    try {
      var stats = fs.lstatSync(this.profilesPath);
    }
    catch(e) {
      logger.log("Directory 'profiles' did not exist. Creating.");
      fs.mkdirSync(this.profilesPath);
    }

    if(!fs.existsSync(this.profilesPath+"default.json"))
    {
      logger.log("Default profile does not exist. Creating.");
      defp.profile = "Default";
      fs.writeFileSync(this.profilesPath+"default.json",
       JSON.stringify(defp, null, '\t'));
       defp.profile = "";
    }

    try {
      var files = fs.readdirSync(this.profilesPath);
      for (var i in files) {
        if(files[i].endsWith(".json")){
          var curPath = this.profilesPath + files[i];
          var profile;
          try {
            profile = require(curPath);
            //logger.log(defp);
            Object.assign(itrDefp, profile);
            //logger.log(defp);
            this.profiles.push(itrDefp);
            itrDefp = JSON.parse(JSON.stringify(defp));
            logger.log("Loaded profile from " + files[i]);
          }

          catch(e) {
            logger.log(e);
            logger.log(files[i] + " is incorrectly formatted. Ignoring.");
          }
        }
      }
    }
    catch(e) {
      logger.log(e);
    }
  };

  this.deleteProfile = function(profileName) {
    try {
      fs.removeSync(this.profilesPath+profileName.toLowerCase() + ".json");
      logger.log(profileName.toLowerCase()+".json has been deleted.");
    }
    catch(e) {
      logger.log(e);
    }
  };

  this.createProfile = function(profileName) {
    var defp = {"profile": "",
    "sounds": [
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""},
        {"title":"", "url":""}
      ]};

      if(!fs.existsSync(this.profilesPath+profileName+".json"))
      {
        logger.log("Creating profile " +profileName.toLowerCase()+ ".json");
        defp.profile = profileName;
        fs.writeFileSync(this.profilesPath+profileName.toLowerCase()+".json",
         JSON.stringify(defp, null, '\t'));
      }
      else {
        logger.log("This shouldnt happen, but that profile already exists.");
      }
      this.loadProfiles();
  };

  this.loadUser();
  this.loadProfiles();
}

Config.prototype.loadProfiles = function() {this.loadProfiles();};

Config.prototype.save = function (){

  fs.writeFileSync(this.file, JSON.stringify(this.auth, null, '\t'));
  for(var i in this.profiles)
  {
    var curProfile = this.profiles[i];
    fs.writeFileSync(this.profilesPath+curProfile.profile.toLowerCase() + ".json", JSON.stringify(curProfile,null, '\t'));
  }
};

Config.prototype.deleteProfile = function(profileName) {this.deleteProfile(profileName);};

module.exports = Config;
