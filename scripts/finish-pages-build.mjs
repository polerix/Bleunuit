import { rename, writeFile } from "node:fs/promises";

const appPage = new URL("../docs/app.html", import.meta.url);
const homePage = new URL("../docs/index.html", import.meta.url);
const noJekyll = new URL("../docs/.nojekyll", import.meta.url);

// The Vite entry is app.html; Pages needs index.html at the root of docs/.
await rename(appPage, homePage);
// Stop GitHub running Jekyll over the build output.
await writeFile(noJekyll, "");
