import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.resolve(__dirname, "..", "api-zod", "src", "index.ts");

writeFileSync(indexPath, 'export * from "./generated/api";\n');
