function DebugPrint(title, obj) {
  console.log("------" + title + "------");
  console.log("");
  console.log(obj);
  console.log("");
  console.log("------END-----");
}
function DebugSpot(message) {
  console.log("----------------\n" + message + "\n----------------");
}
module.exports = DebugPrint;
module.exports = DebugSpot;
