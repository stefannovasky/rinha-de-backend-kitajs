globalThis.KITA_PROJECT_ROOT = __dirname;

import { Kita } from '@kitajs/runtime';
import fastify from 'fastify';

const app = fastify();

app.register(Kita);

// TODO: why does it only work on docker when set host 0.0.0.0?
app.listen({ port: 3000, host: "0.0.0.0" }).then((address) => {
  console.log(`Server listening on ${address}`);
});
