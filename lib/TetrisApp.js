"use strict";
var WsabiClient = require('wsabi-client-bacon');
module.exports = class TetrisApp
{
  constructor (username, password, name, description, installation)
  {
    this.username = username;
    this.password = password;
    this.name = name;
    this.description = description;
    this.installation = installation;
    this.client = new WsabiClient('https://beam.pro');
    this.client.liveUrl = '/api/v1/live';
  }

  create()
  {
    //Login and create the game app and get the game ID and version
    this._login()
      .then((res) => {
         return this._getID(res);
       })
       .then((id) => {
         return this._createApp(id);
       })
       .then((res) => {
         return this._getID(res);
       })
       .then((id) => {
         console.log(id);
         this.appId = id;
       })
      .catch((err) => { console.log(err);});
  }

  destroy()
  {
    console.log("Destroyed");
  }

  _login()
  {
    var res = this.client.post('/api/v1/users/login',
      {username : this.username, password: this.password});
    return res;
  }

  _getID(response)
  {
    return response.id;
  }

  _createApp(id)
  {
    var data = {
      ownerId : id,
      name : this.name,
      description: this.description,
      installation: this.installation
    };

    return this.client.post('/api/v1/tetris/games?', data);
  }
}
