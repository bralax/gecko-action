# Gecko Exam System Javascript Action

This action takes a properly formatted github repo and uploads it as an exam to the Gecko Exam System.

## Inputs

### `token`

**Required** A token provied by gecko used to authenticate who is pushing to the repo

## Outputs

### `success`

Whether the push was successful. A build will fail if either the repo is not properly formatted or there
are already submissions for the examination

## Example usage

uses: actions/gecko-action@v1
with:
  token: '{insert token here}'