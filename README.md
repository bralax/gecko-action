# Gecko Exam System Javascript Action

This action takes a properly formatted github repo and uploads it as an exam to the Gecko Exam System.

Current Version: v3.0
   
## Inputs

### `geckoToken`

**Required** A token provied by gecko used to authenticate who is pushing to the repo. To get a token, create an exam on the gecko website and then copy the string you get from pressing the generate token button. Please note that the token only works on 1 exam and only lasts until 1 week after the enddate of the exam. If you change the end date, it would be a good idea to generate a new token.

### `examId`

**Required** A examId provied by gecko used to authenticate who is pushing to the repo. To get an examId, create an exam on the gecko website and then copy the id that appears when you press the generate token button.

## Repo Formatting
The top level of the repository should contain the folders that represent each question. The question folders should be named with a number starting at 1 increasing by one. The second level contains folders representing the versions of the question. They should be named in the same way as the top level. Each version folder should contain all the information about the given question. See below for what information you need for each question type. All question types require a Question.html/Question.md file which should contain all information related to the questions prompt.   

```
├── 1  
│   ├── 1  
│   │   ├── Question.[html/md]
|   |   ├── [.geckoignore]
│   │   └── Additional Question Files  
│   └── 2  
│       ├── Question.[html/md]  
|       ├── [.geckoignore]
│       └── Additional Question Files  
└── 2  
    └── 1  
        ├── Question.[html/md]  
        ├── [.geckoignore]
        └── Additional Question Files  
```
   
## Gecko Ignore Files
This tool allows for a method of ignoring files similar to git's `.gitignore` files. The name for these files should be `.geckoignore`.
There are a couple of specific rules about `.geckoignore` files.
1. The file should contain a single filename or regex per line
2. `.geckoignore` files have no understanding of sub-directories which has two implications:
      1. The file needs to be in the bottom directory (any `.geckoignore` file will not be handled correctly on the top two levels)
      2. You can not use paths such as dir/*/{some-file} as we dont recognize directories
3. The system will ignore blank lines
4. The system automatically ignores subdirectories below the question version directory. Nothing from those sub-directories will be acknowledged or uploaded        

## Markdown Support
This action accepts both HTML and Markdown files for the question prompt. Our markdown parser tries to match all the features available in Markdown files posted on Github.com. For a guide on our markdown syntax see [https://guides.github.com/features/mastering-markdown/](https://guides.github.com/features/mastering-markdown/)
      
## Question Types

The system currently supports four different question types. All four of the types require a Question.[html/md] file in each question directory. What changes between the question types is what else will need to be included for the system to properly read the question.

**Note:** If a question folder has both a Question.html and a Question.md file, the system will use the Question.html as the prompt and will ignore the Question.md file completely
   
### Code Question         
This is the default type of question that system interprets. The system looks for any additional files outside of the Question.html to determine the starter code for the question. There must be at least one additional file besides the Question.[html/md] file.
The language of the starter code will be intepreted from the files extension.

   
### Long Response Question
   This question type is mostly the same as the Code question. The difference is that the editor is changed to no longer be a code editor. There is no syntax highlighting and no line numbers. This is a giant text box that the student can write in. Any starter text that you want to provide to a student (if you want to break up the students answers into parts or such) that file should be named {question #}.txt

   
### Multiple Choice Question
Multiple choice questions look for a single additional file besided the Question.html file. To create a multiple choice question, you must provide a file named mcinfo.json that follows the below schema. All properties shown are mandatory except you can have as many questions/options in those arrays as you wish.

#### Properties

`Top-Level Json`
     
Name | Type | Descrition
-- | ---- | ----
questions | array of Questions | The questions to display see below for description
shuffleQuestions | boolean | Whether to shuffle the questions for the students
shuffleOptions | boolean | Whether to shuffle the answer choices for the students
displayCount | integer/string | Either 'all' to display all questions or the count of the number of questions to display


`Question syntax`

Name | Type | Descrition
-- | ---- | ----
options | array of Options | The answers choices for the given question
required | boolean | Whether the question is mandatory if only a limited number of questions are displayed
isMulti | boolean | Whether the questions requires the student to select 1 or more than one answer
anchored | boolean | Whether the questions has to stay at the specific index in the order of the questions   
prompt | string | The question to be asked
index | integer | The id assigned to the question used to reference the question in the students answers file. Can not repeat within a json file.

`Option Syntax`  

Name | Type | Descrition
-- | ---- | ----
option | string | The actual answer choice to display
isActive | boolean | Whether the choice is active -> for professors it represents whether the answer is the correct answer
anchored | boolean | Whether the answer choice must stay in a specific spot in the answer choice order
index | integer | The id assigned to the answer choice used to reference the choice in the students answers file. Can not repeat within a question.
     
      
##### Example:   
```json
   {
  "questions": [ 
    {
      "options": [
        {
          "index": 1,
          "isActive": false,
          "anchored": false,
          "option": "testing"
        }
      ],
      "required": false,
      "isMulti": false,
      "anchored": false,
      "prompt": "",
      "index": 1,
    }
  ],
  "shuffleQuestions": false,
  "shuffleOptions": false,
  "displayCount": "all",
}
```     
### Short Response Question      

Short Response questions look for a single additional file besided the Question.html file. To create a short response question, you must provide a file named srinfo.json that follows the below schema. All properties shown are mandatory except you can have as many questions in the array as you want.

#### Properties

`Top-Level Json`
     
Name | Type | Descrition
-- | ---- | ----
questions | array of Questions | The questions to display see below for description
shuffleQuestions | boolean | Whether to shuffle the questions for the student
displayCount | integer/string | Either 'all' to display all questions or the count of the number of questions to display


`Question syntax`

Name | Type | Descrition
-- | ---- | ----
answer | string | The answer for the given question
required | boolean | Whether the question is mandatory if only a limited number of questions are displayed
anchored | boolean | Whether the questions has to stay at the specific index in the order of the questions   
prompt | string | The question to be asked
index | integer | The id assigned to the question used to reference the question in the students answers file. Can not repeat within a json file.
     
      
##### Example:   
```json
{
  "questions": [
    {
      "required": false,
      "anchored": false,
      "prompt": "",
      "index": 0,
      "answer": "testing"
    }
  ],
  "shuffleQuestions": false,
  "displayCount": 0,
}
```
      
## Example usage

```
uses: actions/gecko-action@v3.0
with:
  geckoToken: '{insert token here}'
  examId: '{insert id here}'
```