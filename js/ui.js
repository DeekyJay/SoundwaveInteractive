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
  /*** Status Elements ***/
  var btnConnect = $('#btnConnect');
  var lblConStatus = $('#lblConStatus');
  var lblUserCount = $('#lblUserCount');
  /*** Sound Board Elements ***/
  var btnSounds = $('.sound');
  /*** Content Elements ***/
  var tabs = $('#content > div');
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
  /*** Status Button Events **/
  btnConnect.click(function(){toggleConnection();});
  /*################ Click Events END ################*/

  //&&&&&&&&&&&&&&&&&&&&&&&&&& UI END &&&&&&&&&&&&&&&&&&&&&&&&&&//

  //&&&&&&&&&&&&&&&&&&&&&&& Funtionality &&&&&&&&&&&&&&&&&&&&&&&//

  /*################## Declares ##################*/
  const ipcRenderer = require('electron').ipcRenderer;
  /*################ Declares END ################*/

  /*################## Variables ##################*/
  var boolConnect = false;
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

    var btnParent = btnCurrent.parent();
    btnParent.css('background',
        'linear-gradient(to right, rgba(46,46,46,1) 0%, rgba(6,39,69,0) 100%)');
    btnParent.css('border-left', '8px solid #2f549d');
    btnParent.css('margin-left', '0px');

    if(tabCurrent.css('display') !== 'inline-block') {
      tabs.hide();
      tabCurrent.fadeIn();
    }
  }

  /**
   * Toggles the connection to Beam
   */
  function toggleConnection() {
    ipcRenderer.send('toggle-connection', boolConnect);
    var strCommand = boolConnect ? "Connect" : "Disconnect";
    btnConnect.text(strCommand);
    if(boolConnect)
    {
      lblNavConStatus.text("Disconnected");
      lblConStatus.text("Disconnected");
    }
    boolConnect = !boolConnect;
  }

  /*################ Functions END ################*/

  /*################## Event Listeners ##################*/
  ipcRenderer.on('connection-status', function(event, status, count){
    lblConStatus.text(status);
    lblNavConStatus.text(status);
    count  = count === null ? "Unknown" : count;
    lblUserCount.text(count);
  });
  /*################ Event Listeners END ################*/

  //&&&&&&&&&&&&&&&&&&&&& Funtionality END &&&&&&&&&&&&&&&&&&&&&//
});
