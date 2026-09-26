import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// Same arrangement as SpinnerCockpit: the app entry is app.html, and the Pages build turns it into
// docs/index.html (see scripts/finish-pages-build.mjs). Serving "/" from app.html keeps `npm run dev`
// at the root URL.
const appEntry = fileURLToPath(new URL("./app.html", import.meta.url));
const serveAppAtRoot = {
  name: "serve-app-at-root",
  configureServer(server) {
    server.middlewares.use((request, _response, next) => {
      if (request.url === "/") request.url = "/app.html";
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((request, _response, next) => {
      if (request.url === "/") request.url = "/app.html";
      next();
    });
  },
};

export default defineConfig({
  plugins: [serveAppAtRoot],
  server: { fs: { deny: [".env", ".env.*", "**/.git/**"] } },
  build: {
    // three.js alone is ~700 kB minified; that is expected, not a warning-worthy regression
    chunkSizeWarningLimit: 900,
    rollupOptions: { input: appEntry },
  },
});
