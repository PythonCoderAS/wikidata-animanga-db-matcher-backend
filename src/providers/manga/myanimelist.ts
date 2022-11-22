import axios from "axios";

import { ResultItem } from "../../interfaces";
import Provider from "../../provider.js";
import config from "../../configs/myanimelist.config.json" assert { type: "json" };

enum NSFWStatus {
  white = "white",
  gray = "gray",
  black = "black"
}

interface Item {
  id: number,
  title: string
  nsfw: NSFWStatus
}

interface Result {
  data: { node: Item }[]
}

export default class MangaMyanimelist extends Provider {
  constructor() {
    super(1000);
  }

  async getTitle(title: string): Promise<Record<string, ResultItem>> {
    const resp = await axios.get<Result>("https://api.myanimelist.net/v2/manga", {
      params: {
        nsfw: true,
        limit: 100,
        q: title,
        fields: "id,title,nsfw"
      },
      headers: {
        "X-MAL-CLIENT-ID": config.clientId
      }
    })
    const retval: Record<string, ResultItem> = {}
    resp.data.data.forEach((item) => {
      retval[item.node.id.toString()] = {
        title: item.node.title,
        nsfw: item.node.nsfw !== NSFWStatus.white
      }
    })
    return retval;
  }
}
