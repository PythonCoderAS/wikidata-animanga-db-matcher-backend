import Provider from "../provider.js";
import MangaMangadex from "./manga/mangadex.js";
import MangaMyanimelist from "./manga/myanimelist.js";

const providers: Record<string, Provider> = {
  "manga-mangadex": new MangaMangadex(),
  "manga-myanimelist": new MangaMyanimelist(),
};

export default providers;
