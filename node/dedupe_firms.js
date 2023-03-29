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

export const get_firms = async (guide_id) => {
  return paginate(
    new QueryCommand({
      TableName: "firms",
      IndexName: "guide-name-index",
      ExpressionAttributeNames: {
        "#g": "guide",
      },
      ExpressionAttributeValues: {
        ":g": guide_id,
      },
      KeyConditionExpression: "#g = :g",
    })
  );
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
  const firms = await get_firms(guide_id);
  for (const firm of firms) {
    const matches = firms.filter((f) => {
      return f.name === firm.name && f.guide === firm.guide;
    });

    if (matches.length > 1) {
      console.log(firm.name);
      let best_match = matches.reduce((prev, current) => {
        return current.id < prev.id ? current : prev;
      }, matches[0]);

      let others = matches.filter((m) => {
        return m.id !== best_match.id;
      });

      for (const match of others) {
        for (const [key, data] of Object.entries(match.ranking)) {
          if (key in best_match.ranking) {
            // update history
            for (const [year, rank] of Object.entries(
              match.ranking[key].history
            )) {
              best_match.ranking[key].history[year] = rank;
            }
          } else {
            // add ranking
            best_match.ranking[key] = match.ranking[key];
          }
        }

        console.log("save", best_match);
        await save_firm(best_match);
        console.log("delete", match);
        await delete_firm(match);
      }
    }
  }

  return;
};

const run = async () => {
  const guides = await get_guides();

  // await run_guide(5);
  // return;

  // iterate through unscraped publications
  for (const guide of guides) {
    console.log(guide.publicationTypeDescription);
    const guide_id = guide.publicationTypeId;
    await run_guide(guide_id);
  }
};

run();
