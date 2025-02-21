import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "@reach/router";

import "./index.scss";
import Box from "./routes/box/Box";
import Md from "./routes/md/Md";
import Docs from "./routes/docs/Docs";
import Draw from "./routes/draw/Draw";
import Preview from "./routes/preview/Preview";

// Redirect www subdomain -> naked domain
if (window.location.hostname.startsWith("www.")) {
  window.location.href = window.location.href.replace("/www.", "/");
}
if (window.location.hostname.includes("schof.link")) {
  window.location.href = window.location.href.replace(
    "/schof.link",
    "/mirri.link"
  );
}
if (
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1" &&
  window.location.protocol === "http:"
) {
  window.location.href = window.location.href.replace("http://", "https://");
}

const container = document.getElementById("root");
const root = createRoot(container);

// Render application
root.render(
  <Router>
    <Md path="/md" />
    <Md path="/md/:id" />
    <Draw path="/draw" />
    <Draw path="/draw/:id" />
    <Docs path="/docs" />
    <Docs path="/api" />
    <Preview path="/preview/:id" />
    <Box default path="/" />
  </Router>
);
