import { $ } from "bun";

async function main() {
  const args = process.argv.slice(2);
  const moduleIndex = args.indexOf("--module");
  
  // Parse test type flags
  const runUnitOnly = args.includes("-u");
  const runE2EOnly = args.includes("-e");
  const runBothExplicit = args.includes("--ue");
  
  // Parse browser visual flags
  const headed = args.includes("--headed");
  const ui = args.includes("--ui");

  // Determine what to run (default to both unit and e2e if no explicit flag is passed)
  let shouldRunUnit = true;
  let shouldRunE2E = true;

  if (runUnitOnly) {
    shouldRunUnit = true;
    shouldRunE2E = false;
  } else if (runE2EOnly) {
    shouldRunUnit = false;
    shouldRunE2E = true;
  } else if (runBothExplicit) {
    shouldRunUnit = true;
    shouldRunE2E = true;
  }

  // Get module name
  const moduleName = (moduleIndex !== -1 && args[moduleIndex + 1]) ? args[moduleIndex + 1] : null;

  console.log(`\n🧪 \x1b[1;35mForgeKit Unified Test Runner\x1b[0m 🧪`);
  console.log(`-----------------------------------`);
  console.log(`📦 Module   : \x1b[36m${moduleName || "All Modules"}\x1b[0m`);
  console.log(`⚙️  Target   : \x1b[33m${shouldRunUnit ? "Unit " : ""}${shouldRunUnit && shouldRunE2E ? "& " : ""}${shouldRunE2E ? "E2E" : ""}\x1b[0m`);
  console.log(`🖥️  Browser  : \x1b[32m${ui ? "UI Dashboard" : headed ? "Headed Visual" : "Headless (Silent)"}\x1b[0m`);
  console.log(`-----------------------------------\n`);

  try {
    // 1. Run Unit Tests (bun test)
    if (shouldRunUnit) {
      console.log(`\x1b[33m--- 📦 Running Unit & Validation Tests ---\x1b[0m`);
      const unitPath = moduleName ? `src/modules/${moduleName}` : "src/modules";
      await $`bun test ${unitPath}`.nothrow();
    }

    // 2. Run E2E Tests (Playwright)
    if (shouldRunE2E) {
      console.log(`\n\x1b[33m--- 🌐 Running E2E Browser Tests ---\x1b[0m`);
      let playwrightCmd = "bunx playwright test";
      if (moduleName) {
        playwrightCmd += ` tests/e2e/${moduleName}.e2e.ts`;
      }
      if (headed) {
        playwrightCmd += " --headed";
      }
      if (ui) {
        playwrightCmd += " --ui";
      }

      console.log(`🚀 Executing: \x1b[36m${playwrightCmd}\x1b[0m\n`);

      const parts = playwrightCmd.split(" ");
      const cmd = parts[0];
      const cmdArgs = parts.slice(1);
      await $`${cmd} ${cmdArgs}`.nothrow();
    }

    console.log(`\n✅ \x1b[32mTesting process completed successfully!\x1b[0m\n`);
  } catch (err) {
    console.error("\n❌ Testing process failed:", err);
    process.exit(1);
  }
}

main();
