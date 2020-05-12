const core = require('@actions/core');
const github = require('@actions/github');
const ioUtil = require('@actions/io/lib/io-util');
const path = require('path');
const fs = require('fs');

const geckoToken = core.getInput('geckoToken');
const myToken = core.getInput('githubToken');

//joining path of directory
const directoryPath = __dirname;
//passsing directoryPath and callback function

function printFiles(err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        ioUtil.isDirectory(file).then(r => {
            if (r && !file.includes('.') && file !== "node_modules") {
                fs.readdir(path.join(__dirname, file), printFiles);
            }
        });
        console.log(file);
    });
}
fs.readdir(directoryPath, printFiles);
