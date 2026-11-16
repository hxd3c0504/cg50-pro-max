import {DatabaseSync} from "node:sqlite";
import {mkdirSync} from "node:fs";
import {dirname} from "node:path";

export function openStores(filename) {
  mkdirSync(dirname(filename), {recursive:true});
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA synchronous=FULL;
    PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS blobs(
      namespace TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY(namespace,key)
    );
  `);
  const get = db.prepare(
    "SELECT value FROM blobs WHERE namespace=? AND key=?"
  );
  const insert = db.prepare(
    "INSERT OR IGNORE INTO blobs(namespace,key,value) VALUES(?,?,?)"
  );
  const upsert = db.prepare(`
    INSERT INTO blobs(namespace,key,value) VALUES(?,?,?)
    ON CONFLICT(namespace,key) DO UPDATE SET value=excluded.value
  `);
  const list = db.prepare(`
    SELECT key FROM blobs
    WHERE namespace=? AND substr(key,1,length(?))=?
    ORDER BY key
  `);
  return {
    store(namespace) {
      return {
        async get(key, options={}) {
          const row = get.get(namespace,key);
          if (!row) return null;
          return options.type==="json" ? JSON.parse(row.value) : row.value;
        },
        async setJSON(key,value,options={}) {
          const encoded = JSON.stringify(value);
          if (encoded===undefined) throw Error("Invalid JSON value");
          const result = (options.onlyIfNew ? insert : upsert)
            .run(namespace,key,encoded);
          return {modified:result.changes>0};
        },
        async list({prefix=""}={}) {
          return {blobs:list.all(namespace,prefix,prefix)
            .map(row=>({key:row.key}))};
        }
      };
    },
    close(){ db.close(); }
  };
}
