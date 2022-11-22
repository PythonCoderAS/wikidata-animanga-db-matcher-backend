import bodyParser from "body-parser";
import express from "express";

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

app.listen(6512, () => console.log(`Listening on port 6512.`));
