function Logger(caller){
  this.parent = caller;
}
Logger.prototype.log = function (message) {
  var date = new Date();
  var hour = date.getHours();
  hour = hour > 9 ? hour : "0" + hour;
  var min = date.getMinutes();
  min = min > 9 ? min : "0" + min;
  var sec = date.getSeconds();
  sec = sec > 9 ? sec : "0" + sec;
  var sDate = hour + ":" + min + ":" + sec;
  console.log("["+sDate+"][" + this.parent + "] " + message);
};

module.exports = Logger;
