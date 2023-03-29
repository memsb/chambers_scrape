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

const get_locations = async () => {
  return await paginate(
    new ScanCommand({
      TableName: "locations",
    })
  );
};

const add_location = async (id, description) => {
  await ddbDocClient.send(
    new PutCommand({
      TableName: "new_locations",
      Item: {
        id,
        description,
      },
    })
  );
};

const run = async () => {
  let locations = await get_locations();
  locations = locations.filter((location) => location.id < 100000000);
  for (const location of locations) {
    await add_location(location.id, location.description);
  }
};

run();
