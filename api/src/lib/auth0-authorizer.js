import {
  AuthPolicy
} from './auth-policy';

const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const client = jwksClient({
  strictSsl: true, // Default value
  jwksUri: process.env.AUTH0_DOMAIN + '.well-known/jwks.json'
});

export const decodeToken = (token) => {
  return new Promise(function (resolve, reject) {
    client.getKeys((err, key) => {
      if (err) return reject(err);
      client.getSigningKey(key[0].kid, (err, key) => {

        if (err) return reject(err);
        const signingKey = key.publicKey || key.rsaPublicKey;

        jwt.verify(token, signingKey, {
          algorithms: [process.env.AUTH0_ALGORITHM],
          audience: process.env.AUTH0_AUDIENCE
        }, (err, payload) => {
          if (err) return reject(err);
          return resolve(payload);
        });
      });
    });
  });
};

export const auth0Authorizer = (event) => {
  return new Promise(function (resolve, reject) {
    if (typeof event.authorizationToken === 'undefined') return reject(new Error('Unauthorized'));
    const policyResources = AuthPolicy.policyResources(event);
    const token = event.authorizationToken.substring(7);
    decodeToken(token).then(function (payload, err) {
      if (err) return reject(err);
      const principalId = payload ? payload.sub : 'invalidJWT';
      const policy = new AuthPolicy(principalId, policyResources.awsAccountId, policyResources.apiOptions);
      payload ? policy.allowAllMethods() : policy.denyAllMethods();
      const authResponse = policy.build();
      return resolve(authResponse);
    });
  });
};