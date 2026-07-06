import { eq, and } from "drizzle-orm";
import { db, adminUsersTable, notificationRecipientsTable, type NotificationModule } from "@workspace/db";
import { sendEmail } from "./mail";
import { sendSms } from "./sms";
import { logger } from "./logger";

interface NotifyModuleOptions {
  subject: string;
  text: string;
  html: string;
  smsBody: string;
}

export async function notifyModule(module: NotificationModule, options: NotifyModuleOptions): Promise<void> {
  try {
    const rows = await db
      .select({
        emailEnabled: notificationRecipientsTable.emailEnabled,
        smsEnabled: notificationRecipientsTable.smsEnabled,
        email: adminUsersTable.email,
        phone: adminUsersTable.phone,
        active: adminUsersTable.active,
      })
      .from(notificationRecipientsTable)
      .innerJoin(adminUsersTable, eq(notificationRecipientsTable.adminUserId, adminUsersTable.id))
      .where(and(eq(notificationRecipientsTable.module, module), eq(adminUsersTable.active, true)));

    for (const row of rows) {
      if (row.emailEnabled) {
        try {
          await sendEmail({ to: row.email, subject: options.subject, text: options.text, html: options.html });
        } catch (err) {
          logger.warn({ err, module, to: row.email }, "Failed to send notification email");
        }
      }

      if (row.smsEnabled && row.phone) {
        try {
          await sendSms(row.phone, options.smsBody);
        } catch (err) {
          logger.warn({ err, module, to: row.phone }, "Failed to send notification SMS");
        }
      }
    }
  } catch (err) {
    logger.warn({ err, module }, "Failed to run notifyModule");
  }
}

export async function sendUserConfirmationEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  try {
    await sendEmail(options);
  } catch (err) {
    logger.warn({ err, to: options.to }, "Failed to send user confirmation email");
  }
}
