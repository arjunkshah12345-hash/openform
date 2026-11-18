import { createApp } from "./app.mjs";
import { openDatabase } from "./db.mjs";

const db = openDatabase();
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "127.0.0.1";
const server = createApp(db).listen(port, host, () =>
  console.log(
    `Openform ${process.env.NODE_ENV === "production" ? "app" : "API"} running at http://${host}:${port}`,
  ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
