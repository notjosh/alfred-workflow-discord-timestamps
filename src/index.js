import { parseQuery } from "./lib.js";

console.log(
  JSON.stringify({ items: parseQuery(process.argv[2] || "", new Date()) }),
);
