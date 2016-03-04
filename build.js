var packager = require('electron-packager');
var packageData = require('./package.json');

packager({
    platform: plat,
    arch: "all",
    asar:true,
    name:"BeamSoundlyInteractive",
    version:"0.36.8",
    icon: './fav',
    dir: './',
    out: './build/',
    ignore: 'build/',
    "app-version":packageData.version,
    "version-string": {
        "CompanyName":"Derek Jensen",
        "LegalCopyright": "© "+new Date().getUTCFullYear() + " Derek Jensen",
	      "FileDescription":"Beam Soundly Interactive",
	      "OriginalFilename":"BeamSoundlyInteractive.exe",
        "ProductName":"Beam Soundly Interactive",
        "InternalName":"Beam Soundly Interactive"
    }
}, function done (err, appPath) {
    if(err) {
        throw err;
    }
});
