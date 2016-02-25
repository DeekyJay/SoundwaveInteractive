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
  /*** Content Elements ***/
  var tabs = $('#content>div');
  var tabStatus = $('#status');
  var tabSound = $('#soundboard');
  var tabSettings = $('#settings');
  var tabAbout = $('#about');
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
  showTab(tabStatus, btnStatus);

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
    //TODO Save to config file
    closeEditTitleOverlay();
  }

  function closeEditTitleOverlay() {
    txtTitleEdit.val('');
    txtTitleEdit.attr('name', '');
    txtTitleEdit.attr('sid', '');
    editSoundTitleOverlay.css('display', '');
  }
  /*################ Functions END ################*/

  /*################## Event Listeners ##################*/
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
    else {
      btnConnect.text("Connecting...");
    }
  });

  ipcRenderer.on('play-sound', function(event, id){
    var audio = $(sounds[id]);
    playAudio(audio);
  });
  /*################ Event Listeners END ################*/

  //&&&&&&&&&&&&&&&&&&&&& Funtionality END &&&&&&&&&&&&&&&&&&&&&//
});
