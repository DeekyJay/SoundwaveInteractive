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
    return beam.request('GET','channels/' + config.auth.channel , {timeout: 7000})
    .then(function(res) {
      if(res.body.id === undefined)
      {
        logger.log(res.body);
        sender.send('connection-status', 'Error', {error:'Invalid Channel'});
        return null;
      }
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
    logger.log("Getting Interactive Controls");
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
      //console.log(report);
      sender.send('connection-status', 'Connected', {count: report.users.connected});

      var tactileResults;
      var progress = {
        tactile: tactileResults,
        joystick: [],
        state: "default"
      };
      //robot.send(new Packets.ProgressUpdate(progress));
      report.tactile.forEach(function (tac) {

        //var tactile = report.ProgressUpdate.TactileUpdate({
        //  id: tac.id,
        //  cooldown: 5000,
        //  fired: true,
        //  progress: 0
        //});

        //tactileResults.push(tactile);

        if(tac.pressFrequency == 1)
        {
          logger.log(robot);
          //robot.send(new Packets.ProgressUpdate(progress));
          var date = new Date();
          var hour = date.getHours();
          var min = date.getMinutes();
          var sec = date.getSeconds();
          var sDate = hour + ":" + min + ":" + sec;
          logger.log("Tactile: " + tac.id + ", Press: " +
                  tac.pressFrequency + ", Release: " + tac.releaseFrequency + ", Connected: " + report.users.connected);
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
    logger.log("Authenticated with Beam. Starting Interactive Handshake.");
    var details = res.body;
    details.remote = details.address;
    details.channel = id;

    robot = new Tetris.Robot(details);
    robot.handshake(function(err){
      if(err) {
        sender.send('connection-status', 'Error', {error: "Problem Connecting"});
        logger.log("There was a problem connecting to Tetris.");
        logger.log(err);
      }
      else {
        logger.log("Connected to Tetris.");
        sender.send('connection-status', 'Connected');
      }
    });
    robot.on('report', handleReport);
    robot.on('error', function(err){
      logger.log(err);
      if(err.code === 'ECONNRESET')
        sender.send('connection-status', 'Error', {error: "Connection Reset"});
      else {

      }
    });
  }

  /**
  * Called after setup is complete.
  * Connects to Beam Interactive
  * @param {int} channel ID to connect to
  */
  function init(id) {
    logger.log("ChannelID: " + id);
    beam.use('password', {
      username: config.auth.username,
      password: config.auth.password
    }).attempt()
    .then(function() {
      return requestInteractive(id, config.version, config.code);
    }).then(function(res) {
      if(res.body.tetrisGameId === 'You don\'t have access to that.')
      {
        throw Error("Permission Denied");
      }
      else {
        sender.send('connection-status', 'Getting Controls');
        return getInteractiveControls(id);
      }
    }).then(function(controls) {
      sender.send('connection-status', "Validating Controls");
      return validateInteractiveControls(controls);
    }).then(function() {
      return beam.game.join(id);
    }).then(function (res) {
      initHandshake(id, res);
    }).catch(function(err) {
      logger.log(err);
      sender.send('connection-status', 'Error', {error: err.message});
    });
  }

  /**
  * Setup before initialization
  */
  function start () {
    sender.send('connection-status', 'Connecting');
    logger.log("Starting Tetris.");
    //Check to see if the config file is correct
    logger.log("Validating Configuration.");
    validateConfig();
    logger.log("Getting Channel ID for " + config.auth.channel + ".");
    getChannelID(config.auth.channel)
    .then(function (result) {
        if(result) {
          init(result);
        }
      }, function (e) {
          logger.log(e);
          if(e.code == "EAI_AGAIN")
            sender.send('connection-status', 'Error', {error: 'No Connection'});
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

  ipcMain.on('create-profile', function(event, createProfile){
    config.createProfile(createProfile);
    sender.send('load-config', config);
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
