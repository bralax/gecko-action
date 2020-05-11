const core = require('@actions/core');
const github = require('@actions/github');


const geckoToken = core.getInput('geckoToken');
const myToken = core.getInput('githubToken');
console.log(geckoToken);
console.log(myToken);
