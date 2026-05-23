import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

// 1. Load env variables manually from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    const key = parts[0].trim();
    const val = parts.slice(1).join("=").trim().replace(/(^['"]|['"]$)/g, "");
    process.env[key] = val;
  });
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not defined in .env.local!");
  process.exit(1);
}

// 2. Parse command-line arguments
const args = process.argv.slice(2);
let targetModule: string | null = null;

for (let i = 0; i < args.length; i++) {
  if ((args[i] === "--module" || args[i] === "-m") && args[i + 1]) {
    targetModule = args[i + 1].toLowerCase();
    break;
  }
}

async function runSeeders() {
  console.log("🌱 ForgeKit Centralized Dynamic Seed Runner 🌱");
  console.log("-------------------------------------------------");

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle({ client: pool });

  const modulesDir = path.resolve(process.cwd(), "src/modules");
  
  try {
    if (!fs.existsSync(modulesDir)) {
      throw new Error(`Modules directory not found at: ${modulesDir}`);
    }

    // 3. Scan src/modules dynamically for any infrastructure/seeder.ts file
    const activeModules = fs.readdirSync(modulesDir).filter((file) => {
      const isDir = fs.statSync(path.join(modulesDir, file)).isDirectory();
      if (!isDir) return false;

      const seederPath = path.join(modulesDir, file, "infrastructure/seeder.ts");
      return fs.existsSync(seederPath);
    });

    // 4. Filter based on CLI flag
    let modulesToSeed = activeModules;
    if (targetModule && targetModule !== "all") {
      if (!activeModules.includes(targetModule)) {
        console.error(`❌ Module "${targetModule}" does not have a seeder file at src/modules/${targetModule}/infrastructure/seeder.ts`);
        console.log(`💡 Available seeders: ${activeModules.join(", ")}`);
        process.exit(1);
      }
      modulesToSeed = [targetModule];
    }

    console.log(`🚀 Found ${modulesToSeed.length} active seeder(s) to run: [ ${modulesToSeed.join(", ")} ]\n`);

    // 5. Dynamically load and execute each seeder
    for (const moduleName of modulesToSeed) {
      console.log(`➡️  Running seeder for module: "${moduleName}"`);
      const seederPath = `../src/modules/${moduleName}/infrastructure/seeder`;
      
      const seederModule = await import(seederPath);
      if (typeof seederModule.seed !== "function") {
        throw new Error(`Module "${moduleName}" seeder does not export a named "seed" function!`);
      }
      
      await seederModule.seed(db);
      console.log("");
    }

    console.log("-------------------------------------------------");
    console.log("✨ All selected seeding processes completed successfully!");
  } catch (error) {
    console.error("\n❌ Seeding failed with error:", error);
  } finally {
    await pool.end();
  }
}

runSeeders();
