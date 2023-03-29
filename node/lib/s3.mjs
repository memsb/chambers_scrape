import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const upload = async (path, contents) => {
  const client = new S3Client();
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: "lcmillsconsulting.com",
        Key: path,
        Body: contents,
        ContentType: "text/html",
      })
    );
  } catch (e) {
    console.log(`Error uploading to S3: ${path}`);
  }
};
