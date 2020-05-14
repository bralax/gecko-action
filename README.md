# Gecko Exam System Javascript Action

This action takes a properly formatted github repo and uploads it as an exam to the Gecko Exam System.

## Inputs

### `geckoToken`

**Required** A token provied by gecko used to authenticate who is pushing to the repo. To get a token, create an exam on the gecko website and then copy the string you get from pressing the generate token button. Please note that the token only works on 1 exam and only lasts until 1 week after the enddate of the exam. If you change the end date, it would be a good idea to generate a new token.

### `examId`

**Required** A examId provied by gecko used to authenticate who is pushing to the repo. To get an examId, create an exam on the gecko website and then copy the id that appears when you press the generate token button.


## Example usage

uses: actions/gecko-action@v1
with:
  geckoToken: '{insert token here}'
  examId: '{insert id here}'
