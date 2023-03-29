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

export const get_lawyers = async (guide_id) => {
  return paginate(
    new QueryCommand({
      TableName: "lawyers",
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

const save_lawyer = async (lawyer) => {
  await ddbDocClient.send(
    new PutCommand({
      TableName: "lawyers",
      Item: lawyer,
    })
  );
};

const delete_lawyer = async (lawyer) => {
  await ddbDocClient.send(
    new DeleteCommand({
      TableName: "lawyers",
      Key: {
        id: lawyer.id,
        guide: lawyer.guide,
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
  const lawyers = await get_lawyers(guide_id);
  for (const lawyer of lawyers) {
    const suffix = lawyer.firm.split(",")[0];
    const stripped_suffix = suffix.replace(/\./g, '');

    if (
      !["JR", "SR", "II", "III", "IV", "PHD", "ESQ", "PE", "BCS"].includes(
        stripped_suffix.toUpperCase()
      )
    ) {
      continue;
    }

    const firm_array = lawyer.firm.split(",");
    firm_array.shift();
    const firm = firm_array.join(",").trim();
    const name = `${lawyer.name}, ${suffix}`;

    let preffered_entry = await find_lawyer_by_name_and_guide(name, guide_id);

    if (preffered_entry) {
      for (const [key, data] of Object.entries(lawyer.ranking)) {
        if (key in preffered_entry.ranking) {
          // update history
          for (const [year, rank] of Object.entries(
            lawyer.ranking[key].history
          )) {
            preffered_entry.ranking[key].history[year] = rank;
          }
        } else {
          // add ranking
          preffered_entry.ranking[key] = lawyer.ranking[key];
        }
      }

      console.log("   ", preffered_entry.name, " - ", preffered_entry.firm);
      await save_lawyer(preffered_entry);
      await delete_lawyer(lawyer);
    } else {
      // rename
      lawyer.name = name;
      lawyer.firm = firm;
      console.log("   ", lawyer.name, " - ", lawyer.firm);
      await save_lawyer(lawyer);
    }
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
