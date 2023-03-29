import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const paginate = async (command) => {
  let items = [];
  let lastEvaluatedKey;

  do {
    command.input.ExclusiveStartKey = lastEvaluatedKey;
    const response = await ddbDocClient.send(command);

    items = items.concat(response.Items);
    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
};

const get_practises = async () => {
  return await paginate(
    new ScanCommand({
      TableName: "practises",
    })
  );
};

const add_practice = async (id, description) => {
  await ddbDocClient.send(
    new PutCommand({
      TableName: "practices",
      Item: {
        id,
        description,
      },
    })
  );
};

const run = async () => {
  let practises = await get_practises();
  console.log(practises.length);
  practises = practises.filter((practise) => practise.id < 100000000);
  console.log(practises.length);
  for (const practise of practises) {
    await add_practice(practise.id, practise.description);
  }
};

run();
