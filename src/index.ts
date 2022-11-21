import express from 'express';
import bodyParser from 'body-parser';
import config from '../config.json' assert { type: "json" };
import { ResultItem } from './interfaces';
import providers from './providers/index.js';

const app = express();

app.use(bodyParser.json());

app.post<string, {}, Record<string, ResultItem> | {error: string}, { provider: string, titles: string[]}>("/api/getResults", async function (request, response) {
  const providerId = request.body.provider;
  if (providerId in providers){
    const provider = providers[providerId];
    const titles = request.body.titles;
    const results = await provider.get(titles);
    response.json(results);
  } else {
    response.status(404).send({error: "Provider not found."});
  }
})

app.listen(config.port, () => console.log(`Listening on port ${config.port}.`));
