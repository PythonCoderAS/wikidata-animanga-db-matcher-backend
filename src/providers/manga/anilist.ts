import axios from "axios";

import { ResultItem } from "../../interfaces";
import Provider from "../../provider.js";

interface Item {
  title: { userPreferred: string };
  id: number;
  isAdult: boolean;
}

interface Result {
  data: { Page: { media: Item[] } };
}

const query = `query ($title: String) {
  Page(perPage: 50) {
    media(type: MANGA, search: $title) {
      title {
        userPreferred
      }
      id
      isAdult
    }
  }
}`;

export default class MangaAnilist extends Provider {
  constructor() {
    super(750, { name: "AniList" });
  }

  async getTitle(title: string): Promise<Record<string, ResultItem>> {
    console.log({
      query,
      variables: {
        title,
      },
    });
    const resp = await axios.post<Result>(
      "https://graphql.anilist.co",
      {
        query,
        variables: {
          title,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const retval: Record<string, ResultItem> = {};
    resp.data.data.Page.media.forEach((item) => {
      retval[item.id.toString()] = {
        title: item.title.userPreferred,
        nsfw: item.isAdult,
      };
    });
    return retval;
  }
}
