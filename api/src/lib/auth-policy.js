'use strict';

const httpVerbToStringMap = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  HEAD: 'HEAD',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  ALL: '*'
};

export class AuthPolicy {
  constructor(principal, awsAccountId, apiOptions) {
    this.awsAccountId = awsAccountId;
    this.principalId = principal;
    this.version = '2012-10-17';
    this.pathRegex = new RegExp('^[/.a-zA-Z0-9-\*]+$');
    this.allowMethods = [];
    this.denyMethods = [];
    this.HttpVerb = httpVerbToStringMap;
    this._setApiOptions(this, apiOptions);
  };

  static policyResources(event) {
    const awsInfo = event.methodArn.split(':');
    const apiGatewayArnTmp = awsInfo[5].split('/');
    const data = {
      apiGatewayArnTmp: apiGatewayArnTmp,
      apiOptions: {
        restApiId: apiGatewayArnTmp[0],
        stage: apiGatewayArnTmp[1],
        region: awsInfo[3]
      },
      method: apiGatewayArnTmp[2],
      awsAccountId: awsInfo[4],
      resource: '/' // root resource
    };

    if (data.apiGatewayArnTmp[3]) data.resource += data.apiGatewayArnTmp.slice(3, data.apiGatewayArnTmp.length).join('/');

    return data;
  };

  build() {
    if (this._hasNoMethods()) throw new Error('No statements defined for the policy');
    const policy = {
      principalId: this.principalId
    };
    const doc = {
      Version: this.version,
      Statement: this._allowAndDenyStatements()
    };
    policy.policyDocument = doc;
    return policy;
  }

  addMethod(effect, verb, resource, conditions) {
    this._validateHttpVerb(verb);
    this._validateResource(resource);

    const cleanedResource = this._cleanResource(resource);
    const resourceArnAndConditions = this._resourceArnAndConditions(verb, cleanedResource, conditions);

    if (effect.toLowerCase() === 'allow') this.allowMethods.push(resourceArnAndConditions);
    if (effect.toLowerCase() === 'deny') this.denyMethods.push(resourceArnAndConditions);
  };

  getEmptyStatement(effect) {
    effect = effect.substring(0, 1).toUpperCase() + effect.substring(1, effect.length).toLowerCase();
    var statement = {};
    statement.Action = 'execute-api:Invoke';
    statement.Effect = effect;
    statement.Resource = [];

    return statement;
  };

  getStatementsForEffect(effect, methods) {
    if (methods.length === 0) return [];

    const statement = this.getEmptyStatement(effect);
    const statements = this._statementsFromMethods(effect, methods);

    if (this._hasResources(statement)) statements.push(statement);
    return statements;
  };

  allowAllMethods() {
    this.addMethod.call(this, 'allow', '*', '*', null);
  };

  denyAllMethods() {
    this.addMethod.call(this, 'deny', '*', '*', null);
  };

  allowMethod(verb, resource) {
    this.addMethod.call(this, 'allow', verb, resource, null);
  };

  denyMethod(verb, resource) {
    this.addMethod.call(this, 'deny', verb, resource, null);
  };

  allowMethodWithConditions(verb, resource, conditions) {
    this.addMethod.call(this, 'allow', verb, resource, conditions);
  };

  denyMethodWithConditions(verb, resource, conditions) {
    this.addMethod.call(this, 'deny', verb, resource, conditions);
  };

  _setApiOptions(object, apiOptions = {}) {
    ['restApiId', 'region', 'stage'].forEach(function(property) {
      object[property] = apiOptions['property'] || '*';
    });
  }

  _validateHttpVerb(verb) {
    if (verb !== '*' && !this.HttpVerb.hasOwnProperty(verb)) {
      throw new Error('Invalid HTTP verb ' + verb + '. Allowed verbs in AuthPolicy.HttpVerb');
    }
    return true;
  }

  _validateResource(resource) {
    if (this.pathRegex.test(resource)) return true;
    throw new Error('Invalid resource path: ' + resource + '. Path should match ' + this.pathRegex);
  }

  _cleanResource(resource) {
    return (resource.substring(0, 1) === '/') ? resource.substring(1, resource.length) : resource;
  }

  _resourceArnAndConditions(verb, cleanedResource, conditions) {
    const resourceArn = `arn:aws:execute-api:${this.region}:${this.awsAccountId}:${this.restApiId}/${this.stage}/${verb}/${cleanedResource}`;
    return {
      resourceArn: resourceArn,
      conditions: conditions
    };
  }

  _methodHasConditions(method) {
    return (method.conditions !== null && method.conditions.length > 0);
  }

  _generateStatement(effect, method, addConditional) {
    const conditionalStatement = this.getEmptyStatement(effect);
    conditionalStatement.Resource.push(method.resourceArn);
    if (addConditional) conditionalStatement.Condition = method.conditions;
    return conditionalStatement;
  }

  _statementsFromMethods(effect, methods) {
    return methods.reduce((statements, method) => {
      const statement = this._generateStatement(effect, method, this._methodHasConditions(method));

      statements.push(statement);
      return statements;
    }, []);
  }

  _hasResources(statement) {
    return (statement.Resource !== null && statement.Resource.length > 0);
  }

  _hasNoMethods() {
    const hasNoAllowMethods = (!this.allowMethods || this.allowMethods.length === 0);
    const hasNoDenyMethods = (!this.denyMethods || this.denyMethods.length === 0);
    return (hasNoAllowMethods && hasNoDenyMethods);
  }

  _allowAndDenyStatements() {
    const allow = this.getStatementsForEffect.call(this, 'Allow', this.allowMethods);
    const deny = this.getStatementsForEffect.call(this, 'Deny', this.denyMethods);
    return allow.concat(deny);
  }
};
