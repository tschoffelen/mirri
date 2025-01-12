import { middleware } from "@includable/serverless-middleware";
import { nanoid } from "nanoid";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  useAccelerateEndpoint: true,
});

const Bucket = process.env.BUCKET_NAME;

export const app = async ({ body: { url } }) => {
  if (!url) {
    throw new Error("Missing required parameters.");
  }

  const key = nanoid(7);

  const command = new PutObjectCommand({
    Bucket,
    Key: key,
    ContentType: "text/html",
    ContentDisposition: `inline; filename="index.html"`,
    ACL: "public-read",
    Body: `<html><meta http-equiv="refresh" content="0;URL='${url}'"/>Redirecting to ${url}...</html>`,
    WebsiteRedirectLocation: url,
  });

  await s3.send(command);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      url: `https://mirri.link/${key}`,
      publicUrl: `https://mirri.link/${key}`,
    }),
  };
};

export const handler = middleware(app);
