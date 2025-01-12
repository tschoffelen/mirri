import { middleware } from "@includable/serverless-middleware";
import { nanoid } from "nanoid";

import { CloudFront } from "@aws-sdk/client-cloudfront";
import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "eu-west-1", useAccelerateEndpoint: true });
const cloudfront = new CloudFront({ region: "eu-west-1" });

export const app = async ({ filename, contentType, editable, id }) => {
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
      const command = new HeadObjectCommand({
        Bucket: "schof-link-files",
        Key: id,
      });
      meta = await s3.send(command);
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
      await cloudfront.createInvalidation({
        DistributionId: "EMJNEM0TGFXER",
        InvalidationBatch: {
          CallerReference: Date.now().toString(),
          Paths: {
            Quantity: 1,
            Items: [`/${key}`],
          },
        },
      });
    }
  }

  const command = new PutObjectCommand({
    Bucket: "schof-link-files",
    Key: key,
    ContentType: contentType,
    ContentDisposition: `inline; filename="${filename}"`,
    Metadata: {
      "original-filename": filename,
      editable: editable ? "true" : "false",
    },
    ACL: "public-read",
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });

  if (process.env.SLACK_WEBHOOK) {
    try {
      const url = process.env.SLACK_WEBHOOK;
      await fetch(url, {
        body: JSON.stringify({
          text: `${filename}\n\nhttps://mirri.link/${key}`,
        }),
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

export const handler = middleware(app);
