import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

let url = process.env.DATABASE_URL;

if (!url) {
  url = "file:" + path.join(process.cwd(), "db", "iftar.db");
} else {
  if (!url.startsWith("file:") && !url.startsWith("libsql:") && !url.startsWith("http:") && !url.startsWith("https:")) {
    url = "file:" + path.resolve(process.cwd(), url);
  } else if (url.startsWith("file:")) {
    const p = url.slice(5);
    if (!path.isAbsolute(p)) {
      url = "file:" + path.resolve(process.cwd(), p);
    }
  }
}

const authToken = process.env.TURSO_AUTH_TOKEN;

// Create directory if using local file
if (url.startsWith("file:")) {
  const dbPath = url.replace("file:", "");
  // If dbPath is relative, make absolute to ensure directory exists
  const absolutePath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);
  const dbDir = path.dirname(absolutePath);

  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch (e) {
      console.warn("Could not create database directory:", e);
    }
  }
}

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
