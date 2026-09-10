import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { settings } from "./database/drizzle/schema";

/**
 * Modular seeder for the Settings module.
 * Standardized to export a named function `seed` for the dynamic seed runner.
 *
 * @param {NodePgDatabase} db - The Drizzle database instance.
 */
export async function seed(db: NodePgDatabase) {
  console.log("⚙️  [Settings] Seeding default system configurations...");

  const defaultSettings = [
    {
      key: "business_name",
      value: {
        name: "ForgeKit Demo Business",
        shortName: "ForgeKit",
        description: "Sample business profile seeded by the ForgeKit boilerplate.",
      },
    },
    {
      key: "timezone",
      value: {
        value: "Asia/Jakarta",
      },
    },
    {
      key: "deposit",
      value: {
        type: "flat",
        amount: 0,
      },
    },
    {
      key: "payment_method",
      value: {
        mode: "both",
        bankName: "BCA",
        accountNumber: "1234567890",
        accountHolder: "ForgeKit Demo Business",
        confirmationPhone: "628123456789",
        manualInstructions: "Harap melampirkan bukti transfer dan menuliskan nama lengkap Anda pada pesan WhatsApp konfirmasi.",
      },
    },
    {
      key: "cancellation",
      value: {
        mode: "flexible",
        refundPercent: 100,
      },
    },
    {
      key: "therapist_assignment",
      value: {
        mode: "patient_select",
      },
    },
  ];

  for (const item of defaultSettings) {
    await db
      .insert(settings)
      .values(item)
      .onConflictDoNothing();
  }

  console.log("✅ [Settings] Seeding selesai!");
  console.log(`   ⚙️  Seeded   : ${defaultSettings.length} konfigurasi sistem default`);
}
