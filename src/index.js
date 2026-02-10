import { parseQuery } from "./parse-query.js";

/**
 * Simple wrapper around `parseQuery` to print the result as JSON, for Alfred to consume.
 */
console.log(
  JSON.stringify({ items: parseQuery(process.argv[2] ?? "", new Date()) }),
);
