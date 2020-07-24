# integer-test API

## Endpoints

### Local

You will need to pass an Auth0 JWT token via the Authorization header in order to use this endpoint.

The front-end client (https://integer-client.lucasklaassen.com/) is doing this right now after you login.

To get a JWT you can login to the front-end client and then inspect the indexdb. Find the `authResult` key and copy the accessToken within it. This can be supplied to the following endpoints to authenticate if you so choose!

#### http://localhost:3000/local/integers/current GET

Fetches the current integer.

#### http://localhost:3000/local/integers/current PUT

Updates the current integer to an integer you pass it.

#### http://localhost:3000/local/integers/next GET

Increases the current integer by one and returns it to you.

## Installation

---

Clone the repo and run `npm install`.
You will need to decrypt the secrets to be able to run the app:

- `npm run secrets:decrypt 'password goes here'`

To encrypt secrets run the following command:

- `npm run secrets:encrypt 'password goes here'`

The password has been sent to you via email.

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

## Testing

To run the test suite run the following command: `npm test`

## Adding environment variables

---

All environment variables are declared within `config/environment.yml`.

They can be referenced by using: `process.env.ENV_VARIABLE`
