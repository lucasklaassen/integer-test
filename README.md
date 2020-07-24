## Notes

### Date

July 23rd, 2020

### Location of deployed application

Front-end: https://integer-client.lucasklaassen.com/integers

Back-end: https://integer-api.lucasklaassen.com/integers

### Time spent

- I spent 6-7 hours on this project all-in over the course of 1 day.

### Assumptions made

- Defaulted the starting Integer to 1 since ids usually start at one instead of 0.
- If you hit any of the endpoints for the first time, you will be defaulted to start at 1
- If you hit the "next" endpoint as your first endpoint, it will return 2 as you started at 1 and then increased from it.
- integer is a reserved word in Dynamodb so I opted to call it integerValue in the schema
- DynamoDB only supports precision up to 38 digits but javascript has problems with integers over 15 digits so I added that validation to the update integer endpoint.
- The error messages from the API are intentionally verbose to outline some of the design decisions.
- I used Auth0 for authentication since I'm very comfortable with it. I implemented it across a microservice network at WineDirect and I'm a big believer in working smarter and not harder!

### Shortcuts/Compromises made

- For the sake of time and complexity, I only created 3 environments: local, test and production. Ideally, I would have created a development environment, a testing environment, a staging environment and a production environment.
- Ideally when calling the update endpoint and making a PUT request you would supply the id of the resource you're updating. Since I'm using the users Auth0 ID (which I get from the JWT) as the id to keep track of the Integer for the user, it's not needed. This isn't ideal since it doesn't follow the JSONApi.org spec completely, but I think it's ok for this small example.
- The next function will blow up once you reach the max integer value (for dynamo that will be when it reaches past 38 digits). Ideally, in a real world app you should consider validating against this since the user could set the value to anything they want.
- I did write some unit tests but I didn't write unit tests for all of the integer api endpoint public methods. I wanted to spend more time creating a front-end experience that had a login and sign up.
- I didn't write any unit tests for the lib functions or common library functions. Ideally these are npm packages that are tested within themselves in the future.
- The JWT is stored in the users browser which is not secure. Ideally I would have a httpOnly cookie that contains the JWT which gets passed to the front-end and back-end and never gets exposed to the client side.
- The front-end has an environment file that contains an auth0 client id. This isn't a secret because the client-side JS needs it and uses it. However, if we used the strategy I mentioned in the above comment, we could omit it.
- Using a model named Integer is dangerous since it is used in many programming languages. It worked for this project but if I had more time I would refactor the name Integer out of the entire project.

### Stretch goals attempted

- Using Auth0 for authentication was a piece of cake and saved time creating my own JWT auth. (an API token approach would have been quick and dirty but I wanted to impress you all)
- A fully working SPA that connects to the back-end. This turned out well and was easy to deploy within AWS.
- The back-end is comprised of NodeJS lambda functions, which are interfaced through API Gateway.
- The front-end is an Angular 9 SPA which is deployed to S3 and served through AWS Cloudfront.
- I'm using DynamoDB as the database for this as it's just a simple key value store based on the user's id.
- Wrote some unit tests for the back-end.
- I have solid front-end and back-end validaton that I'm pretty happy with.

### Instructions to run assignment locally

- You will need to have Node version 12.18.3 installed locally on your computer.
- If you use node version manager (nvm) then you shouldn't have to do anything special.
- Both the api and client folders have their own README.md's that will have detailed instructions for how to run them.
- For the back-end service, I've encrypted the secrets with a password. The password has been sent to you via email.
- To get a JWT you can login to the front-end client and then inspect the indexdb. Find the `authResult` key and copy the accessToken within it. This can be supplied to the back-end endpoints to authenticate!

### What did you not include in your solution that you want us to know about?

- I was going to build an easier way for you to retrieve a JWT to hit the back-end endpoints from curl, but since I built out the front-end I hoped that wouldn't be high on your priority list.

- I didn't include any unit tests within the Angular front-end. I spent a lot of time completing the stretch goals and because of that I chose to only put effort into unit testing the back-end.

### Other information about your submission that you feel it's important that we know if applicable.

- For the back-end service I used a lot of middleware. I like using middyJS in lambda projects because they allow me to abstract away config and allow the functions to contain business logic.

- To deploy this project I'm using a docker container which has the AWS CLI installed within it. I'm mounting a few volumes into the container so it has access to the code and my AWS Creds. I've used this approach in previous projects and it's always worked well.

- Since the back-end is using lambda functions you may experience some slowness when using the API on the first few hits due to cold starts.

### Your feedback on this technical challenge

- This is definitely one of the more fun challenges I've taken on so far. It allows you to be quite creative and have total control over a full stack solution.
