import Provider from "../provider.js";
import MangaAnilist from "./manga/anilist.js";
import MangaMangadex from "./manga/mangadex.js";
import MangaMangaupdates from "./manga/mangaupdates.js";
import MangaMyanimelist from "./manga/myanimelist.js";

const providers: Record<string, Provider> = {
  "manga-mangadex": new MangaMangadex(),
  "manga-myanimelist": new MangaMyanimelist(),
  "manga-anilist": new MangaAnilist(),
  "manga-mangaupdates": new MangaMangaupdates(),
};

export default providers;
