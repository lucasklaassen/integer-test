const AWS: any = require('aws-sdk');
let documentClient: any;

if (process.env.ENVIRONMENT === 'local') {
  documentClient = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: process.env.LOCAL_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.LOCAL_AWS_SECRET_ACCESS_KEY,
  });
} else {
  documentClient = new AWS.DynamoDB.DocumentClient();
}

export default class Dynamo {
  static async get(id: string, TableName: string) {
    const params = {
      TableName,
      Key: {
        id,
      },
    };
    const data = await documentClient.get(params).promise();
    if (!data || !data.Item) {
      console.log(params);
      console.trace();
      throw Error(`There was an error fetching the data for id for ${id} from ${TableName}`);
    }
    return data.Item;
  }

  static async getAll(TableName: string, FilterExpression?: any, ExpressionAttributeValues?: any) {
    const params = {
      TableName,
    };
    if (FilterExpression) {
      params['FilterExpression'] = FilterExpression;
    }
    if (ExpressionAttributeValues) {
      params['ExpressionAttributeValues'] = ExpressionAttributeValues;
    }
    const data = await documentClient.scan(params).promise();
    if (!data || !data.Items) {
      throw Error(`There was an error scanning the data from ${TableName}`);
    }
    return data.Items;
  }

  static async write(Item: any, TableName: string) {
    if (!Item) {
      console.trace();
      console.log('error data: ', Item);
      throw Error('no id on the data');
    }
    const params = {
      TableName,
      Item,
    };
    const res = await documentClient.put(params).promise();
    if (!res) {
      throw Error(`There was an error inserting id of ${Item.id} in table ${TableName}`);
    }
    return Item;
  }

  static async update(
    id: string,
    TableName: string,
    UpdateExpression: string,
    ExpressionAttributeValues: any,
    ExpressionAttributeNames: any
  ) {
    const params = {
      Key: {
        id,
      },
      TableName,
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    const res = await documentClient.update(params).promise();

    if (!res) {
      throw Error(`There was an error updating id of ${id} in table ${TableName}`);
    }
    return res.Attributes;
  }

  static async delete(id: string, TableName: string) {
    const params = {
      TableName,
      Key: {
        id,
      },
    };

    return documentClient.delete(params).promise();
  }
}
