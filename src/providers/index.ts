import Provider from "../provider.js";
import MangaMangadex from "./manga/mangadex.js";

const providers: Record<string, Provider> = {
  "manga-mangadex": new MangaMangadex()
}

export default providers;
