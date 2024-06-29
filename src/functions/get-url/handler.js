import { middleware } from "@includable/serverless-middleware";
import { nanoid } from "nanoid";
import AWS from "aws-sdk";
import axios from "axios";

const dependencies = () => ({
  s3: new AWS.S3({ useAccelerateEndpoint: true }),
  cloudfront: new AWS.CloudFront({ region: "eu-west-1" }),
});

export const app = async (
  { filename, contentType, editable, id },
  { s3, cloudfront }
) => {
  if (!filename || !contentType) {
    throw new Error("Missing required parameters.");
  }

  // Create unique key
  let key = nanoid(7);
  editable = editable === true || editable === "true" || editable === "1";

  // Or use existing key (if existing file is editable)
  if (id && id.length === 7) {
    let meta;
    try {
      meta = await s3
        .headObject({
          Bucket: "schof-link-files",
          Key: id,
        })
        .promise();
    } catch (e) {
      throw new Error("File does not exist.");
    }
    if (meta?.Metadata?.["editable"] !== "true") {
      throw new Error("File is not editable.");
    }
    key = id;
    editable = true;

    if (meta) {
      // only invalidate if file exists
      await cloudfront
        .createInvalidation({
          DistributionId: "EMJNEM0TGFXER",
          InvalidationBatch: {
            CallerReference: Date.now().toString(),
            Paths: {
              Quantity: 1,
              Items: [`/${key}`],
            },
          },
        })
        .promise();
    }
  }

  const url = s3.getSignedUrl("putObject", {
    Bucket: "schof-link-files",
    Key: key,
    Expires: 300,
    ContentType: contentType,
    ContentDisposition: `inline; filename="${filename}"`,
    Metadata: {
      "original-filename": filename,
      editable: editable ? "true" : "false",
    },
    ACL: "public-read",
  });

  if (process.env.SLACK_WEBHOOK) {
    try {
      const url = process.env.SLACK_WEBHOOK;
      await axios.post(url, {
        text: `${filename}\n\nhttps://mirri.link/${key}`,
      });
    } catch (e) {
      console.log(e);
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      url,
      publicUrl: `https://mirri.link/${key}`,
      editable,
    }),
  };
};

export const handler = middleware(app).register(dependencies);
