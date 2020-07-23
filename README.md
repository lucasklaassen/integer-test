## Notes

### Date

July 23rd, 2020

### Location of deployed application

If applicable, please provide the url where we can find and interact with your running application.

### Time spent

How much time did you spend on the assignment? Normally, this is expressed in hours.

### Assumptions made

Use this section to tell us about any assumptions that you made when creating your solution.

- Defaulted the starting integer to 1 since id's usually start at 1 instead of 0.
- integer is a reserved word in Dynamodb so I opted to call it integerValue in the schema
- DynamoDB only supports precision up to 38 digits so I added that validation to the update integer endpoint.

### Shortcuts/Compromises made

If applicable. Did you do something that you feel could have been done better in a real-world application? Please
let us know.

- For the sake of time and complexity I only created 3 environments: local, test and production. Ideally I would have created a a development environment, a testing environment, a staging environment and a production environment.

- Ideally when calling the update endpoint and making a PUT request you would supply the id of the resource you're updating. Since I'm using the users Auth0 ID (which I get from the JWT) as the id to keep track of the integer for the user, it's not needed. This isn't ideal since it doesn't follow the JSONApi.org spec completely, but I think for this small example it's ok.

- The next function will blow up once you reach the max integer value (for dynamo that will be when it reaches past 38 digits). Ideally in a real world app you should consider validating against this since the user could set the value to anything they want.

### Stretch goals attempted

If applicable, use this area to tell us what stretch goals you attempted. What went well? What do you wish you
could have done better? If you didn't attempt any of the stretch goals, feel free to let us know why.

### Instructions to run assignment locally

If applicable, please provide us with the necessary instructions to run your solution.

### What did you not include in your solution that you want us to know about?

Were you short on time and not able to include something that you want us to know
about? Please list it here so that we know that you considered it.

### Other information about your submission that you feel it's important that we know if applicable.

- For the back-end service I used a lot of middlewares. I like using middyJS in lambda projects because it allows me to abstract away config and allow the functions to solely contain business logic.

### Your feedback on this technical challenge

Have feedback for how we could make this assignment better? Please let us know.
