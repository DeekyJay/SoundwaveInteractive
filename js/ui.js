window.$ = window.jQuery = require('jquery');
var Open = require('open');
var remote = require('electron').remote;
var BrowserWindow = remote.BrowserWindow;
var ipcRenderer = require('electron').ipcRenderer;
var dialog = remote.dialog;
$(function() {
  //&&&&&&&&&&&&&&&&&&&&&&&&&&&& UI &&&&&&&&&&&&&&&&&&&&&&&&&&&&//

  /*################## Elements ##################*/
  var btnClose = $('#btnClose');
  var btnMinimize = $('#btnMinimize');
  /*** Navigation Button Elements ***/
  var btnStatus = $('#btnStatus');
  var btnBoard = $('#btnBoard');
  var btnSettings = $('#btnSettings');
  var btnAbout = $('#btnAbout');
  /*** Navigation Label ELements ***/
  var lblNavConStatus = $('#lblNavConStatus');
  var lblTabTitle = $('#title>span');
  /*** Content Elements ***/
  var tabs = $('#content>div');
  var tabStatus = $('#status');
  var tabSound = $('#soundboard');
  var tabSettings = $('#settings');
  var tabAbout = $('#about');
  /*** Status Elements ***/
  var btnConnect = $('#btnConnect');
  var lblConStatus = $('#lblConStatus');
  var lblUserCount = $('#lblUserCount');
  var txtTitleEdit = $('#txtTitleEdit');
  var editSoundTitleOverlay = $('#editSoundTitleOverlay');
  var btnEditTitle = $('#btnEditTitle');
  var btnEditCancel = $('#btnEditCancel');
  /*** Sound Board Elements ***/
  var sounds = [];
  var btnSoundTitles = $('.sound>span:first-child');
  var btnPlays = $('.img-play');
  var btnLoads = $(".sound>span:last-child");
  /*** Settings Elements ***/
  var txtUsername = $('#txtUsername');
  var txtPassword = $('#txtPassword');
  //var txtChannel = $('#txtChannel');
  var txtProfileName = $('#txtProfileName');
  var btnCreateProfile = $('#btnCreateProfile');
  var btnClearCreate = $('#btnClearCreate');
  var cboProfile = $('#cboProfile');
  var ulProfiles = $('#ulProfiles');
  var btnDeleteProfile = $('#btnDeleteProfile');
  var txtCooldown = $('#txtCooldown');
  /*** About Elements ***/
  var btnGitHub = $('#btnGitHub');
  /*################ Elements END ################*/

  /*################## Click Events ##################*/

  /*** Global Click Events ***/
  $(document).on('click', function(event) {
    if (!$(event.target).closest('#cboProfile').length) {
      ulProfiles.removeClass("show");
    }
  });

  btnClose.click(function() {
    ipcRenderer.send('shutdown');
    ipcRenderer.removeAllListeners();
    var window = BrowserWindow.getFocusedWindow();
    window.close();
  });

  btnMinimize.click(function() {
    var window = BrowserWindow.getFocusedWindow();
    window.minimize();
  });
  /*** Navigation Button Events ***/
  btnStatus.click(function() {showTab(tabStatus, btnStatus);});
  btnBoard.click(function() {showTab(tabSound, btnBoard);});
  btnSettings.click(function() {showTab(tabSettings, btnSettings);});
  btnAbout.click(function() {showTab(tabAbout, btnAbout);});
  /*** Status Button Events ***/
  btnConnect.click(function() {toggleConnection();});
  /*** Sound Board Button Events ***/
  btnLoads.each(function(index) {
    $(this).click(function() {loadAudioFile(index);});
  });

  btnPlays.each(function(index) {
     $(this).click(function() {playAudio(index);});
   });

  btnSoundTitles.each(function(i) {
    $(this).attr('sid', i);
    $(this).attr('name', $(this).text());
    $(this).attr('default', $(this).text());
    $(this).click(function() {
      editSoundTitle($(this));
    });
  });
  btnEditCancel.click(function() {closeEditTitleOverlay();});
  btnEditTitle.click(function() {saveTitle();});
  /*** Settings Button Events ***/
  btnCreateProfile.click(function() {
    if(!btnCreateProfile.hasClass("disabled")) createProfile();});
  btnClearCreate.click(function() {txtProfileName.val("");});
  cboProfile.click(function() {displayDropdown(cboProfile);});
  btnDeleteProfile.click(function() {
    if(!btnDeleteProfile.hasClass("disabled")) deleteCurrentProfile();}
  );
  /*** About Button Events ***/
  btnGitHub.click(function() {
    Open("https://github.com/Leviathan5");
  });
  /*################ Click Events END ################*/

  /*################## Hover Events ##################*/
  btnSoundTitles.each(function() {
    $(this).mouseover(function() {
      $(this).text('Edit');
    });
    $(this).mouseleave(function() {
      $(this).text($(this).attr('name'));
    });
  });
  /*################ Hover Events END ################*/

  /*################## Key Events ##################*/
  /*** Sound Board Key Events ***/
  txtTitleEdit.keydown(function(e){
    if(e.keyCode == 13) saveTitle();
    else if (e.keyCode == 27) closeEditTitleOverlay();
  });
  /*** Settings Key Events ***/
  txtUsername.keyup(function() {saveConfig(); canConnect();});
  txtPassword.keyup(function() {saveConfig(); canConnect();});
  //txtChannel.keyup (function() {saveConfig(); canConnect();});
  txtProfileName.keyup(function(e){
    checkCanCreateProfile();
    if(e.keyCode == 13 &&
      !btnCreateProfile.hasClass("disabled")) createProfile();
  });
  txtCooldown.keyup(function(){
    checkIsValidCooldown();
  });

  /*################ Key Events END ################*/

  //&&&&&&&&&&&&&&&&&&&&&&&&&& UI END &&&&&&&&&&&&&&&&&&&&&&&&&&//

  //&&&&&&&&&&&&&&&&&&&&&&& Funtionality &&&&&&&&&&&&&&&&&&&&&&&//

  /*################## Variables ##################*/
  var boolConnect = false;
  var boolCanToggle = true;
  var mainConfig;
  /*################ Variables END ################*/

  /*################## Functions ##################*/

  /**
   * Displays the Tab Passed in and hides
   * the rest of the tabs.
   * @param {tab} tabCurrent - The tab to display
   * @param {button} btnCurrent - The current button being clicked
   */
  function showTab(tabCurrent, btnCurrent) {
    $('#nav ul li').each(function() {
      $(this).css('margin-left', '');
      $(this).css('border-left', '');
      $(this).css('background', '');
    });

    btnCurrent.css('background',
        'background: linear-gradient(to right, #222B3C 70%, #1E222F);');
    btnCurrent.css('border-left', '8px solid #2f549d');
    btnCurrent.css('margin-left', '0px');

    lblTabTitle.text(btnCurrent.text());
    tabs.hide();
    tabCurrent.fadeIn(100);
    tabCurrent.css('display', 'flex');
  }

  /**
   * Toggles the connection to Beam.
   */
  function toggleConnection() {
    if(boolCanToggle)
    {
      ipcRenderer.send('toggle-connection', boolConnect);
      boolCanToggle = false;
      btnConnect.addClass("disabled");
      boolConnect = !boolConnect;
    }
  }

  /**
   * Sets the Audio SRC for playback.
   * @param  {button} audio - The load button for the sound
   */
  function loadAudioFile(id) {
    dialog.showOpenDialog(
      {
        filters: [
          { name: 'Audio', extensions: ['mp3', 'wav', 'ogg'] }
        ]
      },
      function(fileNames) {
        if (fileNames === undefined) return;
        var fileName = fileNames[0];
        sounds[id] = new Howl({ urls: [fileName], onend: function() {
          $(btnPlays[id]).removeClass("playing");
        }});
        saveConfig();
      });
  }

  /**
   * Plays the current audio passed in.
   * @param  {button} play - The audio to play
   */
  function playAudio(id) {
    var audio = sounds[id];
    var btnPlay = $(btnPlays[id]);
    if(!btnPlay.hasClass("playing"))
    {
      btnPlay.addClass("playing");
      audio.play();
    }
    else {
      btnPlay.removeClass("playing");
      audio.stop();
    }
  }

  function stopAudio(id) {
    $(btnPlays[id]).removeClass("playing");
  }

  /**
   * Displays the Edit Title overlay
   * @param  {title} title - The title to edit
   */
  function editSoundTitle(title) {
    txtTitleEdit.val(title.attr('name'));
    txtTitleEdit.attr('name', title.attr('name'));
    txtTitleEdit.attr('sid', title.attr('sid'));
    editSoundTitleOverlay.fadeIn(300);
    editSoundTitleOverlay.css('display', 'flex');
    txtTitleEdit[0].select();
  }

  /**
   * Saves the newly edited title
   */
  function saveTitle() {
    var sid = txtTitleEdit.attr('sid');
    var title = $(btnSoundTitles[sid]);
    //TODO Make sure you cannot save if input is empty by disabling button
    if(txtTitleEdit.val() === "")
    {
      txtTitleEdit.val(title.attr('default'));
    }
    title.text(txtTitleEdit.val());
    title.attr('name', txtTitleEdit.val());
    saveConfig();
    closeEditTitleOverlay();
  }

  /**
   * Closes the Edit Title Overlay
   */
  function closeEditTitleOverlay() {
    txtTitleEdit.val('');
    txtTitleEdit.attr('name', '');
    txtTitleEdit.attr('sid', '');
    editSoundTitleOverlay.css('display', 'none');
  }

  /**
   * Save the current settings into the config files.
   */
  function saveConfig() {
    mainConfig.auth.username = txtUsername.val();
    mainConfig.auth.password = txtPassword.val();
    //mainConfig.auth.channel = txtChannel.val();
    mainConfig.auth.channel = txtUsername.val();
    mainConfig.auth.last = cboProfile.text();

    var curProId = cboProfile.attr('pid');
    var currentProfile = mainConfig.profiles[curProId];
    currentProfile.cooldown = txtCooldown.val();

    btnSoundTitles.each(function(index){
      i = index;
      var curTitle = $(this);
      var curAudio = sounds[i];
      var curSound = currentProfile.sounds[i];
      if(curTitle.text() === curTitle.attr('default'))
        curSound.title = "";
      else
        curSound.title = curTitle.text();
      curSound.url = curAudio.urls()[0];
    });
    ipcRenderer.send('update-config', mainConfig);
  }

  /**
   * Loads the config from the backend to the frontend and sets the appropriate
   * fields up.
   * @param  {Config} config - The new config to set.
   */
  function loadConfig(config) {
    txtUsername.val(config.auth.username);
    txtPassword.val(config.auth.password);
    //txtChannel.val(config.auth.channel);
    ulProfiles.html("");
    var curPid;
    for(var i in config.profiles)
    {
      var curProfile = config.profiles[i].profile;
      if(curProfile.name === config.auth.last)
        curPid = i;
      if(curProfile == "Default")
        ulProfiles.prepend("<li pid='"+i+"'>" + curProfile + "</li>");
      else
        ulProfiles.append("<li pid='"+i+"'>" + curProfile + "</li>");
    }
    mainConfig = config;
    var liProfiles = ulProfiles.children("li");

    liProfiles.each(function() {
      if($(this).text() === config.auth.last)
        setProfile($(this));
      $(this).click(function() {setProfile($(this));});
    });
  }

  /**
   * Set the current profile to the profile clicked in the dropdown menu.
   * @param {Profile} li - The profile to set.
   */
  function setProfile(li) {
    if(ulProfiles.hasClass("show"))
      ulProfiles.toggleClass("show");
    cboProfile.html(li.text() + "<span class='caret'></span>");
    var currentProfile;
    for(var i in mainConfig.profiles){
      if(li.attr('pid') == i)
      {
        currentProfile = mainConfig.profiles[i];
        cboProfile.attr('pid', i);
        break;
      }
    }
    txtCooldown.val(currentProfile.cooldown);
    sounds = [];
    currentProfile.sounds.forEach(function(obj, j){
      var currentSound = currentProfile.sounds[j];
      var curTitle = $(btnSoundTitles[j]);
      if(currentSound.title !== "")
      {
        curTitle.text(currentSound.title);
        curTitle.attr('name', currentSound.title);
      }
      else {
        curTitle.text(curTitle.attr('default'));
        curTitle.attr('name', curTitle.attr('default'));
      }
      var how = new Howl({urls: [currentSound.url], onend: function(){stopAudio(j);}});
      sounds.push(how);
    });

    if(boolConnect)
    {
      btnConnect.click();
      setTimeout(function(){ btnConnect.click();}, 500);
    }

    checkCanDeleteProfile();
    saveConfig();
  }

  /**
   * Displays the dropdown menu clicked
   * @param  {Dropdown Menu} cbo - The Dropdown Menu to display
   */
  function displayDropdown(cbo) {
    cbo.siblings("ul").toggleClass("show");
  }

  /**
   * Checks to see if you can delete the current profile.
   * Stops the user from deleting the Default profile.
   */
  function checkCanDeleteProfile()
  {
    if(cboProfile.text().toLowerCase() == "default")
      btnDeleteProfile.addClass("disabled");
    else
      btnDeleteProfile.removeClass("disabled");
  }

  /**
   * Deletes the current selected profile from the config.
   */
  function deleteCurrentProfile() {
    var liProfiles = ulProfiles.children("li");
    liProfiles.each(function() {
      if($(this).attr('pid') == cboProfile.attr('pid'))
      {
        var num = parseInt($(this).attr('pid'));
        mainConfig.profiles.splice(num, 1);
        $(this).remove();
        ipcRenderer.send('delete-profile', cboProfile.text());
      }
    });
    liProfiles = ulProfiles.children("li");
    setProfile(liProfiles.first());
  }

  /**
   * Checks to see if we can create a profile with the name in the textbox.
   * Stops the user from creating a duplicate or an empty.
   */
  function checkCanCreateProfile() {
    var newProfile = txtProfileName.val();
    btnCreateProfile.removeClass("disabled");
    for(var i in mainConfig.profiles)
    {
      var curProfile = mainConfig.profiles[i];
      if(curProfile.profile.toLowerCase() == newProfile.toLowerCase() ||
        newProfile === "")
      {
        btnCreateProfile.addClass("disabled");
        break;
      }
    }
  }

  /**
   * Creates a new profile with the name in the Profile name textbox then
   * clears the textbox.
   */
  function createProfile() {
    ipcRenderer.send('create-profile', txtProfileName.val());
    txtProfileName.val("");
    btnCreateProfile.addClass("disabled");
  }

  /**
   * Checks to see if the application can attempt to connect to Beam or not.
   */
  function canConnect() {
    var username = txtUsername.val();
    var password = txtPassword.val();
    //var channel = txtChannel.val();
    var channel = txtUsername.val();
    if(username === "" || password === "" || channel === "")
    {
      btnConnect.addClass("disabled");
      boolCanToggle = false;
    }
    else
    {
      btnConnect.removeClass("disabled");
      boolCanToggle = true;
    }
  }

  function checkIsValidCooldown() {
    var cooldown = txtCooldown.val();
    console.log(cooldown);
    var pat = new RegExp(/^\d+$/);
    console.log(pat.test(cooldown) && Number(cooldown) >= 0 && Number(cooldown) <= 240000);
    if(pat.test(cooldown) && Number(cooldown) >= 0 && Number(cooldown) <= 240000)
    {
      txtCooldown.removeClass('error');
      saveConfig();
    }
    else {
      txtCooldown.addClass('error');
    }
  }
  /*################ Functions END ################*/

  /*################## Event Listeners ##################*/
  /**
   * Called when the config has been loading in the backend and needs to be
   * loaded in the front end, then checks to see if config is good enough
   * to connect.
   */
  ipcRenderer.on('load-config', function(event, config) {
    loadConfig(config);
    canConnect();
  });

  /**
   * Called when there is a Connection Status update.
   */
  ipcRenderer.on('connection-status', function(event, status, args){
    if(status == "Error")
      lblConStatus.text(args.error !== null ? "Error - " + args.error : "Error - Unknown");
    else
      lblConStatus.text(status);

    lblNavConStatus.text(status);
    count = args === undefined || args.count === undefined ? "Unknown" : args.count;
    lblUserCount.text(count);
    if(status == "Error" || status == "Disconnected")
    {
      boolConnect = false;
      btnConnect.text("Connect");
      boolCanToggle = true;
      btnConnect.removeClass("disabled");
    }
    else if(status == "Connected") {
      boolConnect = true;
      boolCanToggle = true;
      btnConnect.text("Disconnect");
      btnConnect.removeClass("disabled");
    }
    else
      btnConnect.text("Connecting...");
  });


  /**
   * Called when a tactile is pushed to trigger the playing of a sound.
   */
  ipcRenderer.on('play-sound', function(event, id){
    var audio = sounds[id];
    var btnPlay = $(btnPlays[id]);
    if(btnPlay.hasClass("playing"))
    {
      btnPlay.removeClass("playing");
      audio.stop();
    }
    playAudio(id);
  });
  /*################ Event Listeners END ################*/

  //&&&&&&&&&&&&&&&&&&&&& Funtionality END &&&&&&&&&&&&&&&&&&&&&//

  //&&&&&&&&&&&&&&&&&&&&&&& Startup &&&&&&&&&&&&&&&&&&&&&&&//
  ipcRenderer.send('initialize');
  showTab(tabStatus, btnStatus);
  //&&&&&&&&&&&&&&&&&&&&& Startup END &&&&&&&&&&&&&&&&&&&&&//
});
