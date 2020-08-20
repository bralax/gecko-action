const core = require('@actions/core');
const fetch = require('node-fetch');
const io = require('@actions/io');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');


const geckoToken = core.getInput('geckoToken');
const myToken = core.getInput('githubToken');
const examid = core.getInput('examId');

const directoryPath = process.env.GITHUB_WORKSPACE;
const metadata = {questions: [], examid: examid};

function getQuestions(files) {
    let count = 0;
    files.forEach(function (file) {
        let r = fs.lstatSync(path.join(directoryPath,file)).isDirectory();
        if (r && !isNaN(file)) {
            metadata.questions.push({questionNum: parseInt(file), versions: []});
            count++;
        }
    });
    return count;
}

function post(url, body, headers) {
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

function failed(message) {
    core.setFailed(message);
    process.exit(1);
}


let files = fs.readdirSync(directoryPath);
let count = getQuestions(files);
if (count === 0) {
    failed("This repository does not contain any questions");
}
const qNums = metadata.questions.map(obj => obj.questionNum);
qNums.sort((a, b) => a - b);
if (qNums[0] !== 1) {
    failed("Missing Question # 1");
}
for (var i = 1; i < qNums.length; i++) {
    const expectedIndex = qNums[i-1] + 1;
    if (qNums[i] !== expectedIndex) {
        failed("Missing question #" + expectedIndex);
    }
}
for (let i = 0; i < metadata.questions.length; i++) {
    files = fs.readdirSync(path.join(directoryPath, "" + metadata.questions[i].questionNum));
    const qNum = metadata.questions[i].questionNum;
    if (files.length === 0) {
        failed("Quetion # " + qNum + " contains no versions");
    }
    files.forEach(function (file) {
        let r = fs.lstatSync(path.join(directoryPath,"" + qNum,"" + file)).isDirectory();
        if (r && !isNaN("" + file)) {
            const question = metadata.questions[i];
            question.versions.push({version: parseInt(file), starterCodeFiles: [], type: 'LongResponse'});
        }
    });
    if (metadata.questions[i].versions === 0) {
        failed("Question # " + qNum + " has no versions!");
    }
    const vNums = metadata.questions[i].versions.map(obj => obj.version);
    vNums.sort((a, b) => a - b);
    if (vNums[0] !== 1) {
        failed("Missing Question # " + qNum +" Version # 1");
    }
    for (var x = 1; x < vNums.length; x++) {
        const expectedIndex = vNums[x-1] + 1;
        if (vNums[x] !== expectedIndex) {
            failed("Missing question #" + expectedIndex);
        }
    }
    for (let j = 0; j < metadata.questions[i].versions.length; j++) {
        files = fs.readdirSync(path.join(directoryPath, "" + metadata.questions[i].questionNum, "" + metadata.questions[i].versions[j].version));
        const qNum = metadata.questions[i].questionNum;
        const vNum = metadata.questions[i].versions[j].version;
        if (files.length === 0) {
            failed("Quetion # " + qNum + " Version # " + vNum + " contains no files");
        }
        files.forEach(function (file) {
            let r = fs.lstatSync(path.join(directoryPath,"" + qNum,"" + vNum,"" + file)).isDirectory();
            if (!r && file !== "Question.html") {
                const version = metadata.questions[i].versions[j];
                version.starterCodeFiles.push(file);
                //Determine Question type
                if (file === 'mcinfo.json') {
                    version.type = 'MultipleChoice';
                } else if (file === 'srinfo.json') {
                    version.type = 'ShortResponse';
                } else if (file.substring(file.lastIndexOf('.')) + 1 === 'txt') {
                    version.type = 'LongResponse';
                } else {
                    version.type = 'Code';
                }
                
            }
        });
        if (metadata.questions[i].versions[j].starterCodeFiles.length === 0) {
            failed("Question # " + qNum + " Version #" + vNum + " has no starter files");
        }
    }
}


post("exams/github", JSON.stringify(metadata)).then(data => {
    return data.text();
}).then(data => {
    if (data === "Success") {
        metadata.questions.forEach((value => {
            value.versions.forEach((value1, index, array) => {
                const fileNames = value1.starterCodeFiles.map((file) => {
                    if (file === 'mcinfo.json' || file === 'srinfo.json') {
                        return 'info.json';
                    } else {
                        return file;
                    }
                });
                const files = [];
                fileNames.forEach(fileName => {
                    const curpath = path.join(directoryPath,"" + value.questionNum, "" + value1.version, "" + fileName);
                    let content = fs.readFileSync(curpath, {encoding: 'utf8'});
                    files.push(content);
                });
                
                const cur = path.join(directoryPath, "" + value.questionNum, "" + value1.version, "Question.html");
                let instructionContent = fs.readFileSync(cur, {encoding: 'utf8'});
                const formData = new FormData();
                formData.append("examId" , examid);
                formData.append("questionNum" , value.questionNum);
                formData.append("questionVer" , value1.version);
                formData.append("files", JSON.stringify(files));
                formData.append("fileNames", JSON.stringify(fileNames));
                formData.append("fileData", JSON.stringify('{}'));
                post("exams/"+examid+"/questions/"+value.questionNum+"/"+value1.version+"/starter", formData).catch(reason => {
                    failed(reason);
                });
                const forms = new FormData();
                forms.append("examId" , examid);
                forms.append("questionNum" , value.questionNum);
                forms.append("questionVer" , value1.version);
                forms.append("prompt", "" + instructionContent);
                post("exams/"+examid+"/questions/"+value.questionNum+"/"+value1.version+"/prompt", forms).catch(reason => {
                    failed(reason);
                });

            });

        }));
    }
}).catch(reason => {
    failed(reason);
});
