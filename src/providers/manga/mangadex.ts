import axios from "axios";
import { ResultItem } from "../../interfaces";
import Provider from "../../provider.js";

export enum ContentRating {
  safe = "safe",
  suggestive = "suggestive",
  erotica = "erotica",
  pornographic = "pornographic"
}

export interface Manga {
  id: string;
  attributes: {
    title: Record<string, string>;
    contentRating: ContentRating;
  }
}

export interface Response {
  data: Manga[]
}

export default class MangaMangadex extends Provider {
  constructor(){
    super(250);
  }

  async getTitle(title: string): Promise<Record<string, ResultItem>> {
    const resp = await axios.get<Response>("https://api.mangadex.org/manga", {
      params: {
        title: title,
        contentRating: [ContentRating.safe, ContentRating.suggestive, ContentRating.erotica, ContentRating.pornographic],
        limit: 100
      }
  })
  const retval: Record<string, ResultItem> = {};
  resp.data.data.filter((manga) => Object.values(manga.attributes.title).length > 0 ).forEach((manga) => {
    retval[manga.id] = {
      title: manga.attributes.title.en ?? Object.values(manga.attributes.title)[0],
      nsfw: [ContentRating.erotica, ContentRating.pornographic].includes(manga.attributes.contentRating)
    }
  })
  return retval;
  }
}
