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
    var data = {
      ownerId : this.ownerId,
      name : this.name,
      description: this.description,
      installation: this.installation
    };

    this.client.post('/api/v1/interactive/games?', data)
      .then((res) => {
        this.gameId = res.id;
      })
      .catch((err)=>{console.log(err)});

    _getVersionInfo();
  }

  destroy()
  {
    console.log("Destroyed");
  }

  exists()
  {
    var exist = this._login()
      .then(this._getVersionInfoByGameName)
      .catch(this._err);
    return exist;
  }

  _login()
  {
    console.log("Login");
    return this.client.post('/api/v1/users/login',
      {username : this.username, password: this.password})
      .then((res)=> {
        this.ownerId = res.id;
        return res.id;
      })
      .catch((err)=>{console.log(err)});
  }

  _createVersion()
  {
    var data = {
      ownerId: this.ownerId,
      gameId: this.gameId,
      version: '1.0.0',
      changelog: '',
      installation: null,
      download: null
    }

    var res = this.client.post('/api/v1/tetris/versions?', data);

    this.versionId = res.id;
    this.version = res.version;
  }

  _getVersionInfo()
  {
    var res = this.client.get('/api/v1/tetris/games/owned?user=' +
        this.ownerId + '&where=id.eq.' + this.gameId);

    this.versionId = res[0].versions[0].id;
    this.version = res[0].versions[0].version;
  }

  _getVersionInfoByGameName()
  {
    return this.client.get('/api/v1/tetris/games/owned?user='+
      this.ownerId+'&where=name.eq.'+this.name)
      .then((res) => {
        if(res.length > 0)
        {
          this.gameId = res[0].id;
          this.versionId = res[0].versions[0].id;
          this.version = res[0].versions[0].version;
          return true;
        }
        else
          return false;
      })
      .catch((err)=>{console.log(err)});
  }

  _err(err)
  {
    console.log(err);
  }
}
