globalThis.KITA_PROJECT_ROOT = __dirname;

import { Kita } from "@kitajs/runtime";
import fastify from "fastify";
import { sql } from "./db";
import { customersCache } from "./cache";

const app = fastify();

app.register(Kita);

app.addHook("onReady", done => {
  sql<{ id: number; limit: number; }[]>`SELECT id, "limit" FROM customers;`
    .then((rows) => {
      rows.forEach(row =>
        customersCache.set(row.id, { id: row.id, limit: row.limit }));
      done();
    });
});

// TODO: why does it only work on docker when set host 0.0.0.0?
app.listen({ port: 3000, host: "0.0.0.0" }).then((address) => {
  console.log(`Server listening on ${address}`);
});
