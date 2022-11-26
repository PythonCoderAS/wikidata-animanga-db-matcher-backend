import bodyParser from "body-parser";
import express, { Response, static as expressStatic } from "express";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import { ResultItem } from "./interfaces";
import providers from "./providers/index.js";

const app = express();

app.use(bodyParser.json());

app.post<
  string,
  Record<string, never>,
  Record<string, ResultItem> | { error: string },
  { provider: string; titles: string[] }
>("/api/getResults", async (request, response) => {
  const providerId = request.body.provider;
  if (providerId in providers) {
    const provider = providers[providerId];
    const { titles } = request.body;
    const results = await provider.get(titles);
    response.json(results);
  } else {
    response.status(404).send({ error: "Provider not found." });
  }
});

const distPath = resolve(
  join(dirname(fileURLToPath(import.meta.url)), "..", "frontend-dist")
);

app.use(
  "/assets",
  expressStatic(join(distPath, "assets"), {
    etag: true,
    // 30 days
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
);
app.get(/.+/, (request, response) =>
  response.sendFile(join(distPath, "index.html"))
);

const handleError = (
  error: unknown,
  _1: unknown,
  res: Response<string, Record<string, unknown>>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _2: unknown
) => {
  console.error(error);
  res.status(500).send("Oops, something went wrong.");
};

app.use(handleError);

const port = parseInt(process.env.PORT ?? "6512", 10);
app.listen(port, () => console.log(`Listening on port ${port}.`));
