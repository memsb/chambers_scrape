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

export const find_location = async (name) => {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: "new_locations",
      IndexName: "description-index",
      ExpressionAttributeNames: {
        "#d": "description",
      },
      ExpressionAttributeValues: {
        ":d": name.trim(),
      },
      KeyConditionExpression: "#d = :d",
    })
  );

  return response.Items[0];
};

export const add_location = async (location) => {
  await ddbDocClient.send(
    new PutCommand({
      TableName: "new_locations",
      Item: location,
    })
  );
};

export const find_practice = async (name) => {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: "practices",
      IndexName: "description-index",
      ExpressionAttributeNames: {
        "#d": "description",
      },
      ExpressionAttributeValues: {
        ":d": name.trim(),
      },
      KeyConditionExpression: "#d = :d",
    })
  );

  return response.Items[0];
};

export const add_practise = async (practise, guide_id) => {
  practise.guide = guide_id;

  await ddbDocClient.send(
    new PutCommand({
      TableName: "practises",
      Item: practise,
    })
  );
};

export const find_subsection = async (location_id, practice_id, guide_id) => {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: "subsections",
      IndexName: "locationId-practiceAreaId-index",
      ExpressionAttributeNames: {
        "#l": "locationId",
        "#p": "practiceAreaId",
      },
      ExpressionAttributeValues: {
        ":l": location_id,
        ":p": practice_id,
        ":g": guide_id,
      },
      FilterExpression: "publicationTypeId = :g",
      KeyConditionExpression: "#l = :l and #p = :p",
    })
  );

  return response.Items[0];
};

export const add_subsection = async (subsection) => {
  await ddbDocClient.send(
    new PutCommand({
      TableName: "subsections",
      Item: subsection,
    })
  );
};

const get_lawyer = async (lawyer_id, guide_id) => {
  const response = await ddbDocClient.send(
    new GetCommand({
      TableName: "lawyers",
      Key: {
        id: lawyer_id,
        guide: guide_id,
      },
    })
  );

  return response.Item;
};

export const find_lawyer_by_name_and_firm = async (name, firm) => {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: "lawyers",
      IndexName: "name-firm-index",
      ExpressionAttributeNames: {
        "#n": "name",
      },
      ExpressionAttributeValues: {
        ":n": name.trim(),
        ":f": firm.trim(),
      },
      KeyConditionExpression: "#n = :n and firm = :f",
    })
  );

  return response.Items[0];
};

export const find_lawyer_by_name_firm_and_guide = async (
  name,
  firm,
  guide_id
) => {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: "lawyers",
      IndexName: "name-firm-index",
      ExpressionAttributeNames: {
        "#n": "name",
      },
      ExpressionAttributeValues: {
        ":n": name.trim(),
        ":f": firm.trim(),
        ":g": guide_id,
      },
      FilterExpression: "guide = :g",
      KeyConditionExpression: "#n = :n and firm = :f",
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

export const find_by_name_and_firm = async (name, firm) => {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: "lawyers",
      IndexName: "name-firm-index",
      ExpressionAttributeNames: {
        "#n": "name",
      },
      ExpressionAttributeValues: {
        ":n": name.trim(),
        ":f": firm.trim(),
      },
      KeyConditionExpression: "#n = :n and firm = :f",
    })
  );

  return response.Items[0];
};

export const find_lawyer_by_name = async (name) => {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: "lawyers",
      IndexName: "name-firm-index",
      ExpressionAttributeNames: {
        "#n": "name",
      },
      ExpressionAttributeValues: {
        ":n": name.trim(),
      },
      KeyConditionExpression: "#n = :n",
    })
  );

  return response.Items[0];
};

export const new_lawyer = async (data, guide_id) => {
  return {
    id: data.personOrganisationId,
    guide: guide_id,
    name: data.displayName,
    firm: data.organisationName,
    ranking: {},
  };
};

export const get_individual = async (lawyer, guide_id) => {
  return await get_lawyer(lawyer.personOrganisationId, guide_id);
};

export const save_individual = async (lawyer) => {
  await ddbDocClient.send(
    new PutCommand({
      TableName: "lawyers",
      Item: lawyer,
    })
  );
};

const read_firm = async (firm_id, guide_id) => {
  const response = await ddbDocClient.send(
    new GetCommand({
      TableName: "firms",
      Key: {
        id: firm_id,
        guide: guide_id,
      },
    })
  );

  return response.Item;
};

const new_firm = async (data, guide_id) => {
  return {
    id: data.parentOrganisationId,
    guide: guide_id,
    name: data.displayName,
    ranking: {},
  };
};

export const get_firm = async (data, guide_id) => {
  return await read_firm(data.parentOrganisationId, guide_id);
};

export const find_firm_by_guide = async (name, guide_id) => {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: "firms",
      IndexName: "name-guide-index",
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

export const find_firm = async (name) => {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: "firms",
      IndexName: "name-guide-index",
      ExpressionAttributeNames: {
        "#n": "name",
      },
      ExpressionAttributeValues: {
        ":n": name.trim(),
      },
      KeyConditionExpression: "#n = :n",
    })
  );

  return response.Items[0];
};

export const save_firm = async (firm) => {
  await ddbDocClient.send(
    new PutCommand({
      TableName: "firms",
      Item: firm,
    })
  );
};

export const get_firms_for_guide = async (guide_id) => {
  return await paginate(
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

export const get_laywers_for_guide = async (guide_id) => {
  return await paginate(
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

export const get_unscraped_publications = async (field) => {
  return await paginate(
    new ScanCommand({
      TableName: "chambers_publications",
      ExpressionAttributeNames: {
        "#s": field,
      },
      ExpressionAttributeValues: {
        ":s": false,
      },
      FilterExpression: "#s = :s",
    })
  );
};

export const set_publication_scraped = async (pub, field) => {
  pub[field] = true;
  await ddbDocClient.send(
    new PutCommand({
      TableName: "chambers_publications",
      Item: pub,
    })
  );
};

export const get_guide = async (publicationTypeId) => {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: "chambers_guides",
      ExpressionAttributeNames: {
        "#p": "publicationTypeId",
      },
      ExpressionAttributeValues: {
        ":p": publicationTypeId,
      },
      KeyConditionExpression: "#p = :p",
    })
  );

  return response.Items[0];
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

export const get_guides = async () => {
  return await paginate(
    new ScanCommand({
      TableName: "chambers_guides",
    })
  );
};
