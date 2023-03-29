import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { get_guides } from "./lib/dynamo.mjs";

const client = new DynamoDBClient({});

const ddbDocClient = DynamoDBDocumentClient.from(client);

export const get_new_firms = async (guide_id) => {
  return paginate(
    new QueryCommand({
      TableName: "firms",
      IndexName: "guide-name-index",
      ExpressionAttributeNames: {
        "#g": "guide",
        "#i": "id",
      },
      ExpressionAttributeValues: {
        ":g": guide_id,
        ":i": 100000000,
      },
      FilterExpression: "#i >= :i",
      KeyConditionExpression: "#g = :g",
    })
  );
};

const find_firm_by_name_and_guide = async (name, guide_id) => {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: "firms",
      IndexName: "name-guide-index",
      ExpressionAttributeNames: {
        "#n": "name",
        "#i": "id",
      },
      ExpressionAttributeValues: {
        ":n": name,
        ":g": guide_id,
        ":i": 100000000,
      },
      FilterExpression: "#i < :i",
      KeyConditionExpression: "#n = :n and guide = :g",
    })
  );

  return response.Items[0];
};

export const find_lawyer_by_name_and_guide = async (name, guide_id) => {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: "lawyers",
      IndexName: "guide-name-index",
      ExpressionAttributeNames: {
        "#n": "name",
      },
      ExpressionAttributeValues: {
        ":n": name.trim(),
        ":g": guide_id,
      },
      KeyConditionExpression: "#n = :n and guide = :g",
    })
  );

  return response.Items[0];
};

const save_firm = async (firm) => {
  await ddbDocClient.send(
    new PutCommand({
      TableName: "firms",
      Item: firm,
    })
  );
};

const delete_firm = async (firm) => {
  await ddbDocClient.send(
    new DeleteCommand({
      TableName: "firms",
      Key: {
        id: firm.id,
        guide: firm.guide,
      },
    })
  );
};

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

const run_guide = async (guide_id) => {
  const new_firms = await get_new_firms(guide_id);
  for (const new_firm of new_firms) {
    const trimmed_name = new_firm.name.trim();

    if (new_firm.name == trimmed_name) {
      continue;
    }

    console.log(`"${new_firm.name}" -> "${trimmed_name}"`);

    let preffered_entry = await find_firm_by_name_and_guide(
      trimmed_name,
      guide_id
    );

    if (preffered_entry) {
      console.log("Found by trimmed name");
    } else {
      preffered_entry = await find_firm_by_name_and_guide(
        new_firm.name,
        guide_id
      );
    }

    if (preffered_entry) {
      console.log("Found by untrimmed name");
    } else {
      console.log(`Renamed firm "${new_firm.name}" -> "${trimmed_name}"`);
      new_firm.name = trimmed_name;
      console.log(`Updated: ${new_firm.name} - ${new_firm.id}`);
      await save_firm(new_firm);
      continue;
    }

    for (const [key, data] of Object.entries(new_firm.ranking)) {
      if (key in preffered_entry.ranking) {
        // update history
        for (const [year, rank] of Object.entries(
          new_firm.ranking[key].history
        )) {
          preffered_entry.ranking[key].history[year] = rank;
        }
      } else {
        // add ranking
        preffered_entry.ranking[key] = new_firm.ranking[key];
      }
    }

    const trimmed_target = preffered_entry.name.trim();
    if (trimmed_target !== preffered_entry.name) {
      console.log(
        `Renamed firm "${preffered_entry.name}" -> "${trimmed_target}"`
      );
      preffered_entry.name = trimmed_target;
    }
    console.log(`Updated: ${preffered_entry.name} - ${preffered_entry.id}`);
    console.log(`Delete: ${new_firm.name} - ${new_firm.id}`);
    await save_firm(preffered_entry);
    await delete_firm(new_firm);
  }
};

const run = async () => {
  const guides = await get_guides();

  // iterate through unscraped publications
  for (const guide of guides) {
    console.log(guide.publicationTypeDescription);
    const guide_id = guide.publicationTypeId;
    await run_guide(guide_id);
  }
};

run();
