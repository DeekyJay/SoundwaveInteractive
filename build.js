var packager = require('electron-packager');
var packageData = require('./package.json');

packager({
    all:true,
    asar:true,
    name:"Beam Soundly Interactive",
    version:"0.36.8",
    dir: './',
    out: './build/',
    ignore: "build/",
    "app-version":packageData.version,
    "version-string": {
        "CompanyName":"Derek Jensen",
        "LegalCopyright": "© "+new Date().getUTCFullYear() + " Derek Jensen",
        "ProductName":"Beam Soundly Interactive",
        "InternalName":"Beam Soundly Interactive"
    }
}, function done (err, appPath) {
    if(err) {
        throw err;
    }
});
