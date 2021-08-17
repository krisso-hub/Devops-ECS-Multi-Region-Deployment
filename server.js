var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

const AWS = require('aws-sdk');

//UPDATE THE REGION IF YOU ARE USING ANYTHING OTHER THAN us-east-1

AWS.config.update({
  region: "us-east-1",
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

var schema = buildSchema(`
  type Query {
    hello: String
    getTemp(station_id: String): String
  }
`);

var root = {
  hello: () => {
    return 'Hello to the whole world from ' + process.env.LOCATION;
  },

  getTemp: async function ({station_id}) {
	params = {
		TableName : "weather",
		ProjectionExpression:"station_id, observation_unixtime, temp_c",
		KeyConditionExpression: "station_id = :station",
		ExpressionAttributeValues: {
			":station": station_id
		},
		ScanIndexForward: false,
		Limit: 1
	};

	var data = await dynamoDb.query(params).promise() 
    return data.Items[0].temp_c
  },
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
