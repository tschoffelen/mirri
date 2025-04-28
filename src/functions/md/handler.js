import { middleware } from "@includable/serverless-middleware";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import showdown from "showdown";

const s3 = new S3Client({
  region: "eu-west-1",
  useAccelerateEndpoint: true,
});

const Bucket = process.env.BUCKET_NAME;

export const app = async ({ body: { content } }) => {
  if (!content) {
    throw new Error("Missing required parameters.");
  }

  const key = nanoid(7);
  const converter = new showdown.Converter({
    tables: true,
    strikethrough: true,
    tasklists: true,
    ghCodeBlocks: true,
  });

  const html = `<!DOCTYPE html><html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Note</title>
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <meta name="robots" content="noindex, nofollow"/>
  <link href="/_markdown.css" rel="stylesheet" type="text/css" />
  <link href="/_code-highlighting.css" rel="stylesheet" type="text/css" />
</head>
<body>
<article class="markdown-body">
  ${converter.makeHtml(content)}
</article>
<script src="/_code-highlighting.js"></script>
<!--



${content.replace(/<!--/g, "< ! - -").replace(/-->/g, "- - >")}



-->
</body>
</html>`;

  const command = new PutObjectCommand({
    Bucket,
    Key: key,
    ContentType: "text/html",
    ContentDisposition: `inline; filename="index.html"`,
    ACL: "public-read",
    Body: html,
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
