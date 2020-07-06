# Gecko Exam System Javascript Action

This action takes a properly formatted github repo and uploads it as an exam to the Gecko Exam System.

## Inputs

### `geckoToken`

**Required** A token provied by gecko used to authenticate who is pushing to the repo. To get a token, create an exam on the gecko website and then copy the string you get from pressing the generate token button. Please note that the token only works on 1 exam and only lasts until 1 week after the enddate of the exam. If you change the end date, it would be a good idea to generate a new token.

### `examId`

**Required** A examId provied by gecko used to authenticate who is pushing to the repo. To get an examId, create an exam on the gecko website and then copy the id that appears when you press the generate token button.

## Repo Formatting

├── 1
│   ├── 1
│   │   ├── Question.html
│   │   └── Additional Question Files
│   └── 2
│       ├── Question.html
│       └── Additional Question Files
└── 2
    └── 1
        ├── Question.html
        └── Additional Question Files
   
   
## Question Types

The system currently supports four different question types. All four of the types require a Question.html file in each question directory. What changes between the question types is what else will need to be included for the system to properly read the question.

### 1. Code Question         
This is the default type of question that system interprets. The system looks for any additional files outside of the Question.html to determine the starter code for the question. There must be at least one additional file besides the Question.html file.
The language of the starter code will be intepreted from the files extension.

   
### 2. Long Response Question
   This question type is mostly the same as the Code question. The difference is that the editor is changed to no longer be a code editor. There is no syntax highlighting and no line numbers. This is a giant text box that the student can write in. Any starter text that you want to provide to a student (if you want to break up the students answers into parts or such) that file should be named {question #}.txt

   
### 3. Multiple Choice Question
Multiple choice questions look for a single additional file besided the Question.html file. To create a multiple choice question, you must provide a file named mcinfo.json that follows the below schema. All properties shown are mandatory except you can have as many questions/options in those arrays as you wish.

#### Properties

Top-Level Json
     
Name | Type | Descrition
-- | ---- | ----
questions | array of Questions | The questions to display see below for description
shuffleQuestions | boolean | Whether to shuffle the questions for the students
shuffleOptions | boolean | Whether to shuffle the answer choices for the students
displayCount | integer/string | Either 'all' to display all questions or the count of the number of questions to display


Question syntax

Name | Type | Descrition
-- | ---- | ----
options | array of Options | The answers choices for the given question
required | boolean | Whether the question is mandatory if only a limited number of questions are displayed
isMulti | boolean | Whether the questions requires the student to select 1 or more than one answer
anchored | boolean | Whether the questions has to stay at the specific index in the order of the questions   
prompt | string | The question to be asked
index | integer | The id assigned to the question used to reference the question in the students answers file. Can not repeat within a json file.

Option Syntax   

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
  "displayCount": 'all',
}
```     
### 4. Short Response Question      

Short Response questions look for a single additional file besided the Question.html file. To create a short response question, you must provide a file named srinfo.json that follows the below schema. All properties shown are mandatory except you can have as many questions in the array as you want.

#### Properties

Top-Level Json
     
Name | Type | Descrition
-- | ---- | ----
questions | array of Questions | The questions to display see below for description
shuffleQuestions | boolean | Whether to shuffle the questions for the student
displayCount | integer/string | Either 'all' to display all questions or the count of the number of questions to display


Question syntax

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

uses: actions/gecko-action@v1
with:
  geckoToken: '{insert token here}'
  examId: '{insert id here}'
