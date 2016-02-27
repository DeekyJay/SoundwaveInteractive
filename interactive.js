function Interactive(electron) {
  var ipcMain = electron.ipcMain;
  var app = electron.app;
  var Beam = require('beam-client-node');
  var Tetris = require('beam-interactive-node');
  var Player = require('play-sound')(opts = {});

  var Config = require('./lib/Config');
  var config = new Config(app.getPath("userData"));
  var Logger = require('./lib/Logger');
  var logger = new Logger("Tetris");
  var beam = new Beam();
  var robot = null;
  var sender = null;
  var running = false;

  ipcMain.on('initialize', function(event){
    logger.log("IPCMain and IPCRenderer Talking . . .");
    sender = event.sender;
    sender.send('load-config', config);
  });

  /**
   * Gets the Channel ID from the Channel's Name
   * @param {string} The name of the channel
   */
  function getChannelID() {
    return beam.request('GET','channels/' + config.auth.channel)
    .then(function(res) {
      return res.body.id;
    });
  }

  /**
   * Validates the Config Object before attempting to connect
   */
  function validateConfig() {
    //If the Config File was not created because it does not exist
    if(!config) {
      throw new Error('The config file is missing, Please create a config file.');
    }
    if(!config.version) {
      throw new Error('Missing version id and share code.');
    }
    var required = ["channel","password","username"];
    required.forEach(function(value){
      if(!config.auth[value]) {
        throw new Error(value + " is required in your config file.");
      }
    });
  }

  /**
  * Validates the controls on the Beam Interactive application to see
  * if there is the proper amount of buttons
  * @param {Object} Controls recieved from the channel
  */
  function validateInteractiveControls(controls) {
    //Make sure the Interactive app has controls.
    if(!controls.tactiles || controls.tactiles.length === 0) {
      throw new Error("No buttons defined on the app.");
    }

    //Make sure all the buttons have holding and fequency enabled
    var analysis = controls.tactiles.every(function(tactile) {
      return (tactile.analysis.frequency);
    });

    if(!analysis)
    {
      throw new Error("Buttons require holding and frequency to be " +
                      "checked for analysis");
    }
    return controls;
  }

  /**
  * Get's the controls of the interactive app running on a channel
  * @param {string} The ID of the channel
  */
  function getInteractiveControls(channelID) {
    return beam.request('GET', 'tetris/'+channelID)
    .then(function(res) {
      return res.body.version.controls;
    }, function() {
      throw new Error('Incorrect Version ID or Share Code in your config file');
    });
  }

  /**
  * Initializes the handsake between the application and Beam Tetris
  * To make the stream run the application
  * @param {string} the versionID of the Beam Interactive application
  * @param {string} the shareID of the Beam Interactive application
  */
  function requestInteractive(channelID, versionId, shareId) {
    return beam.request('PUT', 'channels/'+channelID,
    { body :
      {
        interactive: true,
        tetrisGameId: versionId
      },
      json:true
    }
  );
  }

  function handleReport(report) {
    //console.log("*****************");
    if(running)
    {
      sender.send('connection-status', 'Connected', report.users.connected);
      report.tactile.forEach(function (tac) {
        if(tac.pressFrequency == 1)
        {
          var date = new Date();
          var hour = date.getHours();
          var min = date.getMinutes();
          var sec = date.getSeconds();
          var sDate = hour + ":" + min + ":" + sec;
          logger.log("Tactile: " + tac.id + ", Press: " +
                  tac.pressFrequency + ", Release: " + tac.releaseFrequency);
          sender.send('play-sound', tac.id);
        }
      });
    }

  }

  /**
   * Initialize and start Hanshake with Interactive app
   * @param {int} Channel ID
   * @param {Object} Result of the channel join
   */
  function initHandshake(id, res) {
    logger.log("Authenticated with Beam. Starting Interactive Handshake");
    var details = res.body;
    details.remote = details.address;
    details.channel = id;

    robot = new Tetris.Robot(details);
    robot.handshake(function(err){
      if(err) {
        sender.send('connection-status', 'Error');
        logger.log("There was a problem connecting to Tetris");
        logger.log(err);
      }
      else {
        logger.log("Connected to Tetris");
        sender.send('connection-status', 'Connected');
      }
    });
    robot.on('report', handleReport);
    robot.on('error', function(err){
      logger.log(err);
      sender.send('connection-status', 'Error');
    });
  }

  /**
  * Called after setup is complete.
  * Connects to Beam Interactive
  * @param {int} channel ID to connect to
  */
  function init(id) {
    sender.send('connection-status', 'Connecting');
    logger.log("ChannelID: " + id);
    beam.use('password', {
      username: config.auth.username,
      password: config.auth.password
    }).attempt()
    .then(function() {
      return requestInteractive(id, config.version, config.code);
    }).then(function(res) {
      sender.send('connection-status', 'Getting Controls');
      return getInteractiveControls(id);
    }).then(function(controls) {
      sender.send('connection-status', "Validating Controls");
      return validateInteractiveControls(controls);
    }).then(function() {
      return beam.game.join(id);
    }).then(function (res) {
      initHandshake(id, res);
    }).catch(function(err) {
      logger.log("Error Connecting...");
      sender.send('connection-status', 'Error');
      throw err;
    });
  }

  /**
  * Setup before initialization
  */
  function start () {
    //Check to see if the config file is correct
    validateConfig();
    getChannelID(config.auth.channel)
    .then(function (result) {
        if(result) {
          init(result);
        }
      }, function (e) {
        throw new Error('Invalid channel specified in config file,' +
                ' or no channel found on beam');
      });
  }

  function stop () {
    if(running === true)
    {
      logger.log("Closing Connection");
      robot.close();
      sender.send('connection-status', 'Disconnected');
    }
  }

  ipcMain.on('toggle-connection', function(event, args){
    if (args === false)
    {
      start();
      running = true;
    }
    else {
      stop();
      running = false;
    }
  });

  ipcMain.on('update-config', function(event, newConfig){
    config.auth = newConfig.auth;
    config.profiles = newConfig.profiles;
    config.save();
  });

  ipcMain.on('delete-profile', function(event, deleteProfile){
    config.deleteProfile(deleteProfile);
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    stop();
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

module.exports = Interactive;
