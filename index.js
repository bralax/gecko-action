const core = require('@actions/core');
const fetch = require('node-fetch');
const io = require('@actions/io');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');


const geckoToken = core.getInput('geckoToken');
const myToken = core.getInput('githubToken');
const examid = core.getInput('examId');

//joining path of directory
const directoryPath = process.env.GITHUB_WORKSPACE;
const metadata = {questions: [], examid: examid};

function getQuestions(files) {
    //listing all files using forEach
    let count = 0;
    files.forEach(function (file) {
        console.log(file);
        // Do whatever you want to do with the file
        let r = fs.lstatSync(path.join(directoryPath,file)).isDirectory();
        console.log(!isNaN(file));
        if (r && !isNaN(file)) {
            metadata.questions.push({questionNum: parseInt(file), versions: []});
            count++;
        }
    });
    return count;
}

function post(url, body, headers) {
    console.log(geckoToken);
    const header = headers ? headers : new fetch.Headers({'Authorization': geckoToken});
    return fetch("https://polar-earth-21424.herokuapp.com/" + url, {
        method: 'POST',
        headers: header,
        body: body
    }).then(res => {
        if (!res.ok) {
            core.error("Post Failed");
        }
        return res;
    })
}


let files = fs.readdirSync(directoryPath);
let count = getQuestions(files);
if (count === 0) {
    core.error("This repository does not contain any questions");
}
for (let i = 0; i < metadata.questions.length; i++) {
    files = fs.readdirSync(path.join(directoryPath, "" + metadata.questions[i].questionNum));
    //listing all files using forEach
    const qNum = metadata.questions[i].questionNum;
    if (files.length === 0) {
        core.error("Quetion # " + qNum + " contains no versions");
    }
    files.forEach(function (file) {
        console.log(qNum + "/" + file);
        // Do whatever you want to do with the file
        let r = fs.lstatSync(path.join(directoryPath,"" + qNum,"" + file)).isDirectory();
        if (r && !isNaN("" + file)) {
            const question = metadata.questions[i];
            question.versions.push({version: parseInt(file), starterCodeFiles: []});
        }
    });
    for (let j = 0; j < metadata.questions[i].versions.length; j++) {
        files = fs.readdirSync(path.join(directoryPath, "" + metadata.questions[i].questionNum, "" + metadata.questions[i].versions[j].version));
        const qNum = metadata.questions[i].questionNum;
        const vNum = metadata.questions[i].versions[j].version;
        //listing all files using forEach
        if (files.length === 0) {
            core.error("Quetion # " + qNum + " Version # " + vNum + " contains no files");
        }
        files.forEach(function (file) {

            console.log(qNum + "/" + vNum + "/" + file);
            // Do whatever you want to do with the file
            let r = fs.lstatSync(path.join(directoryPath,"" + qNum,"" + vNum,"" + file)).isDirectory();
            if (!r && file !== "Question.html") {
                const version = metadata.questions[i].versions[j];
                version.starterCodeFiles.push(file);
            }
        });
    }
}


console.log(metadata);
post("updateExamGithub", JSON.stringify(metadata)).then(data => {
    return data.text();
}).then(data => {
    if (data === "Success") {
        metadata.questions.forEach((value => {
            value.versions.forEach((value1, index, array) => {
                const fileNames = value1.starterCodeFiles;
                const files = [];
                fileNames.forEach(fileName => {
                    const curpath = path.join(directoryPath,"" + value.questionNum, "" + value1.version, "" + fileName);
                    let content = fs.readFileSync(curpath, {encoding: 'utf8'});
                    files.push(content);
                });
                const cur = path.join(directoryPath, "" + value.questionNum, "" + value1.version, "Question.html");
                console.log(cur);
                let instructionContent = fs.readFileSync(cur, {encoding: 'utf8'});
                const formData = new FormData();
                formData.append("examId" , examid);
                formData.append("questionNum" , value.questionNum);
                formData.append("version" , value1.version);
                formData.append("files", JSON.stringify(files));
                formData.append("fileNames", JSON.stringify(fileNames));
                post("updateSC", formData);
                const forms = new FormData();
                forms.append("examId" , examid);
                forms.append("questionNum" , value.questionNum);
                forms.append("version" , value1.version);
                forms.append("instructions", "" + instructionContent);
                console.log(forms);
                post("updateQP", forms);

            });

        }));
    }
}).catch(reason => {
    core.error(reason);
});
