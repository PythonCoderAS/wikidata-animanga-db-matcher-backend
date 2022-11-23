import axios from "axios";

import { ResultItem } from "../../interfaces";
import Provider from "../../provider.js";

interface Item {
  series_id: number;
  title: string;
  genres: { genre: string }[] | null;
}

interface Result {
  results: { record: Item }[];
}

const nsfwGenres = new Set(["adult", "hentai", "smut"]);

export default class MangaMangaupdates extends Provider {
  constructor() {
    super(2000);
  }

  async getTitle(title: string): Promise<Record<string, ResultItem>> {
    const resp = await axios.post<Result>(
      "https://api.mangaupdates.com/v1/series/search",
      {
        search: title,
        perpage: 25,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const retval: Record<string, ResultItem> = {};
    resp.data.results.forEach((record) => {
      retval[record.record.series_id.toString(36)] = {
        title: record.record.title,
        nsfw: (record.record.genres ?? [])
          .map((genre) => nsfwGenres.has(genre.genre))
          .includes(true),
      };
    });
    return retval;
  }
}
