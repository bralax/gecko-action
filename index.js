const core = require('@actions/core');
const github = require('@actions/github');
const ioUtil = require('@actions/io/lib/io-util');
const io = require('@actions/io');
const path = require('path');
const fs = require('fs');

const geckoToken = core.getInput('geckoToken');
const myToken = core.getInput('githubToken');

//joining path of directory
const directoryPath = process.env.GITHUB_WORKSPACE;
const metadata = {questions: []};

function getQuestions(err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
        console.log(file);
        // Do whatever you want to do with the file
        ioUtil.isDirectory(file).then(r => {
            const num = /^\d+$/.test(file);
            if (r && num) {
                metadata.questions.push({questionNum: file, versions: []});
            }
        });
    });
}


fs.readdir(directoryPath, getQuestions);
for (let i = 0; i < metadata.questions.length; i++) {
    fs.readdir(path.join(directoryPath, metadata.questions[i].questionNum),  (err, files) => {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        //listing all files using forEach
        files.forEach(function (file) {
            console.log(i + "/" + file);
            // Do whatever you want to do with the file
            ioUtil.isDirectory(file).then(r => {
                const num = /^\d+$/.test(file);
                if (r && num) {
                    const question = metadata.questions.find((element) => {element.questionNum === i});
                    question.versions.push({version: file, starterCodeFiles: []});
                }
            });
        });
    });
    for (let j = 0; j < metadata.questions[i].versions.length; j++) {
        fs.readdir(path.join(directoryPath, metadata.questions[i].questionNum, metadata.questions[i].versions[j].version),
            (err, files) => {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            //listing all files using forEach
            files.forEach(function (file) {
                console.log(i + "/" + j + "/" + file);
                // Do whatever you want to do with the file
                ioUtil.isDirectory(file).then(r => {
                    if (!r && file != "Question.html") {
                        const question = metadata.questions.find((element) => {element.questionNum === i});
                        const version = question.versions.find((element) => {element.version === j});
                        version.starterCodeFiles.push(file);
                    }
                });
            });
        });
    }
}


console.log(metadata);
