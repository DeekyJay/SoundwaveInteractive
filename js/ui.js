window.$ = window.jQuery = require('jquery');
$(function(){
  //&&&&&&&&&&&&&&&&&&&&&&&&&&&& UI &&&&&&&&&&&&&&&&&&&&&&&&&&&&//

  /*################## Elements ##################*/
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
  var sounds = $('.sound>audio');
  var btnSoundTitles = $('.sound>span:first-child');
  var btnPlays = $('.sound>span>div>a');
  var btnLoads = $(".sound>span:last-child>a");
  /*** Settings Elements ***/
  var txtUsername = $('#txtUsername');
  var txtPassword = $('#txtPassword');
  var txtChannel = $('#txtChannel');
  var txtProfileName = $('#txtProfileName');
  var btnCreateProfile = $('#btnCreateProfile');
  var btnClearCreate = $('#btnClearCreate');
  var cboProfile = $('#cboProfile');
  var ulProfiles = $('#ulProfiles');
  var btnDeleteProfile = $('#btnDeleteProfile');
  /*################ Elements END ################*/

  /*################## Click Events ##################*/
  /*** Navigation Button Events ***/
  btnStatus.click(function() {showTab(tabStatus, btnStatus);});
  btnBoard.click(function() {showTab(tabSound, btnBoard);});
  btnSettings.click(function() {showTab(tabSettings, btnSettings);});
  btnAbout.click(function() {showTab(tabAbout, btnAbout);});
  /*** Status Button Events ***/
  btnConnect.click(function(){toggleConnection();});
  /*** Sound Board Button Events ***/
  btnLoads.each(function(){
    $(this).click(function(){loadAudioFile($(this));});
  });
  btnPlays.each(function(){
    $(this).click(function(){playAudio($(this).parent().parent()
      .parent().children('audio'));});
  });
  var i = 0;
  btnSoundTitles.each(function() {
    $(this).attr('sid', i);
    i+=1;
    $(this).attr('name', $(this).text());
    $(this).attr('default', $(this).text());
    $(this).click(function() {
      editSoundTitle($(this));
    });
  });
  btnEditCancel.click(function(){closeEditTitleOverlay();});
  btnEditTitle.click(function(){saveTitle();});
  /*** Settings Button Events ***/
  btnCreateProfile.click(function(){createProfile();});
  btnClearCreate.click(function(){txtProfileName.val("");});
  cboProfile.click(function(){displayDropdown(cboProfile);});
  btnDeleteProfile.click(function() {deleteCurrentProfile();});
  /*################ Click Events END ################*/

  /*################## Hover Events ##################*/
  btnSoundTitles.each(function(){
    $(this).mouseover(function(){
      $(this).text('Edit');
    });
    $(this).mouseleave(function(){
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
  txtUsername.keyup(function() {saveConfig();});
  txtPassword.keyup(function() {saveConfig();});
  txtChannel.keyup (function() {saveConfig();});
  txtProfileName.keydown(function(){checkCanCreateProfile();});
  txtProfileName.keyup(function(e){
    if(e.keyCode == 13 && !btnCreateProfile.hasClass("disabled")) createProfile();
  });

  /*################ Key Events END ################*/

  //&&&&&&&&&&&&&&&&&&&&&&&&&& UI END &&&&&&&&&&&&&&&&&&&&&&&&&&//

  //&&&&&&&&&&&&&&&&&&&&&&& Funtionality &&&&&&&&&&&&&&&&&&&&&&&//

  /*################## Declares ##################*/
  const ipcRenderer = require('electron').ipcRenderer;
  var remote = require('remote');
  var dialog = remote.dialog;
  /*################ Declares END ################*/

  /*################## Variables ##################*/
  var boolConnect = false;
  var boolCanToggle = true;
  var mainConfig;
  /*################ Variables END ################*/

  /*################## Functions ##################*/

  /**
   * Displays the Tab Passed in and hides
   * the rest of the tabs
   * @param {tab} tabCurrent - The tab to display
   * @param {button} btnCurrent - The current button being clicked
   */
  function showTab(tabCurrent, btnCurrent) {
    $('#nav ul li').each(function(){
      $(this).css('margin-left', '');
      $(this).css('border-left', '');
      $(this).css('background', '');
    });

    btnCurrent.css('background',
        'linear-gradient(to right, rgba(46,46,46,1) 0%, rgba(6,39,69,0) 100%)');
    btnCurrent.css('border-left', '8px solid #2f549d');
    btnCurrent.css('margin-left', '0px');

    lblTabTitle.text(btnCurrent.text());
    tabs.hide();
    tabCurrent.fadeIn();
    tabCurrent.css('display', 'flex');
  }

  /**
   * Toggles the connection to Beam
   */
  function toggleConnection() {
    if(boolCanToggle)
    {
      ipcRenderer.send('toggle-connection', boolConnect);
      boolCanToggle = false;
      boolConnect = !boolConnect;
    }
  }

  /**
   * Sets the Audio SRC for playback
   * @param  {button} audio - The load button for the sound
   */
  function loadAudioFile(audio) {
    dialog.showOpenDialog(
      {
        filters: [
          { name: 'Audio', extensions: ['mp3', 'wav', 'ogg'] }
        ]
      },
      function(fileNames) {
        if (fileNames === undefined) return;
        var fileName = fileNames[0];
        console.log(fileName);
        audio.parent().parent().children('audio').attr('src', fileName);
      });
  }

  /**
   * [playAudio description]
   * @param  {button} play - The audio to play
   */
  function playAudio(play) {
    play.trigger('play');
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

  function saveConfig()
  {
    mainConfig.auth.username = txtUsername.val();
    mainConfig.auth.password = txtPassword.val();
    mainConfig.auth.channel = txtChannel.val();
    mainConfig.auth.last = cboProfile.text();

    var curProId = cboProfile.attr('pid');
    var currentProfile = mainConfig.profiles[curProId];

    btnSoundTitles.each(function(index){
      i = index;
      var curTitle = $(this);
      var curAudio = $(sounds[i]);
      var curSound = currentProfile.sounds[i];
      if(curTitle.text() === curTitle.attr('default'))
        curSound.title = "";
      else
        curSound.title = curTitle.text();
      curSound.url = curAudio.attr('src');
    });

    ipcRenderer.send('update-config', mainConfig);
  }

  function loadConfig(config) {
    txtUsername.val(config.auth.username);
    txtPassword.val(config.auth.password);
    txtChannel.val(config.auth.channel);
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

    liProfiles.each(function(){
      if($(this).text() === config.auth.last)
        setProfile($(this));
      $(this).click(function(){setProfile($(this));});
    });
  }

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
    console.log(currentProfile);
    for(var j in currentProfile.sounds)
    {
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
      $(sounds[j]).attr('src', currentSound.url);
    }
    checkCanDeleteProfile();
    saveConfig();
  }

  function displayDropdown(cbo) {
    cbo.siblings("ul").toggleClass("show");
  }

  function checkCanDeleteProfile()
  {
    if(cboProfile.text() == "Default")
      btnDeleteProfile.addClass("disabled");
    else
      btnDeleteProfile.removeClass("disabled");
  }

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

  function checkCanCreateProfile()
  {

  }

  function createProfile() {

  }
  /*################ Functions END ################*/

  /*################## Event Listeners ##################*/
  ipcRenderer.on('load-config', function(event, config) {
    loadConfig(config);
  });

  ipcRenderer.on('connection-status', function(event, status, count){
    lblConStatus.text(status);
    lblNavConStatus.text(status);
    count = count === undefined ? "Unknown" : count;
    lblUserCount.text(count);
    if(status == "Error" || status == "Disconnected")
    {
      boolConnect = false;
      btnConnect.text("Connect");
      boolCanToggle = true;
    }
    else if(status == "Connected") {
      boolConnect = true;
      boolCanToggle = true;
      btnConnect.text("Disconnect");
    }
    else
      btnConnect.text("Connecting...");
  });

  ipcRenderer.on('play-sound', function(event, id){
    var audio = $(sounds[id]);
    playAudio(audio);
  });
  /*################ Event Listeners END ################*/

  //&&&&&&&&&&&&&&&&&&&&& Funtionality END &&&&&&&&&&&&&&&&&&&&&//

  //&&&&&&&&&&&&&&&&&&&&&&& Startup &&&&&&&&&&&&&&&&&&&&&&&//
  ipcRenderer.send('initialize');
  showTab(tabStatus, btnStatus);
  //&&&&&&&&&&&&&&&&&&&&& Startup END &&&&&&&&&&&&&&&&&&&&&//
});
