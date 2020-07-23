# integer-test API

## Installation

---

Clone the repo and run `npm install`.
You will need to decrypt the secrets to be able to run the app:

- `npm run secrets:decrypt 'password goes here'`

To encrypt secrets run the following command:

- `npm run secrets:encrypt 'password goes here'`

Repeat for each stage (local, test, production). The password has been sent to you via email.

## Linting

---

Download the [VSCode Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and enable the `formatOnSave` setting within VSCode settings, so indentation is formatted properly.

Our .prettierrc file defines the linting styles for indentation and will format your files automaticall on save.

We use eslint to lint our javascript for things like using `const` and `let` instead of `var`. Our .eslintrc file defines the rules for this.

## Running The App Locally

---

### Installing local dynamodb

To install the local version of dynamodb run the following command: `./node_modules/.bin/sls dynamodb install`

### Running serverless offline

To run the app: `npm start`. This will run the app locally on http://localhost:3000/ and dynamodb on http://localhost:8000/

## Adding environment variables

---

All environment variables are declared within `config/environment.yml`.

They can be referenced by using: `process.env.ENV_VARIABLE`
