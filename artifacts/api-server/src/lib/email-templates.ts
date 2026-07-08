const BRAND_GREEN = "#1f4d20";
const BRAND_GREEN_DARK = "#173a18";
const BRAND_GOLD = "#c9a84c";
const TEXT_DARK = "#2b2b26";
const MUTED = "#6b6b63";
const BORDER = "#e7e2d5";
const BG = "#f5f1e8";

const MASJID_NAME = "Grays Park Masjid";
const MASJID_ADDRESS = "Grays Park Masjid, Grays, Essex";

/**
 * Renders a full HTML email document with a consistent branded header/footer.
 * All email HTML across the app should be produced via this helper (or emailButton)
 * so every message looks like a deliberately designed piece of communication.
 */
export function renderEmailTemplate(options: {
  preheader?: string;
  heading: string;
  bodyHtml: string;
  bannerImageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const { preheader, heading, bodyHtml, bannerImageUrl, ctaLabel, ctaUrl } = options;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${BG};font-family:Georgia,'Times New Roman',serif;color:${TEXT_DARK};">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>` : ""}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BORDER};">
            <tr>
              <td style="background:linear-gradient(135deg, ${BRAND_GREEN} 0%, ${BRAND_GREEN_DARK} 100%);padding:28px 32px;text-align:center;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 12px auto;">
                  <tr>
                    <td style="width:44px;height:44px;border-radius:50%;background-color:${BRAND_GOLD};text-align:center;vertical-align:middle;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${BRAND_GREEN_DARK};font-weight:bold;">
                      G
                    </td>
                  </tr>
                </table>
                <p style="margin:0;color:#ffffff;font-size:19px;letter-spacing:0.02em;font-family:Georgia,'Times New Roman',serif;">
                  ${MASJID_NAME}
                </p>
                <p style="margin:4px 0 0 0;color:${BRAND_GOLD};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">
                  Serving the community
                </p>
              </td>
            </tr>
            ${
              bannerImageUrl
                ? `<tr>
              <td style="padding:0;line-height:0;">
                <img src="${bannerImageUrl}" alt="" width="560" style="width:100%;max-width:560px;height:auto;display:block;border:0;" />
              </td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding:36px 32px 8px 32px;">
                <h1 style="margin:0 0 18px 0;font-size:22px;line-height:1.35;color:${TEXT_DARK};font-family:Georgia,'Times New Roman',serif;">
                  ${escapeHtml(heading)}
                </h1>
                <div style="font-size:15px;line-height:1.7;color:${TEXT_DARK};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                  ${bodyHtml}
                </div>
                ${
                  ctaLabel && ctaUrl
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px 0;">
                        <tr>
                          <td style="border-radius:8px;background-color:${BRAND_GREEN};">
                            <a href="${ctaUrl}" style="display:inline-block;padding:12px 26px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                              ${escapeHtml(ctaLabel)}
                            </a>
                          </td>
                        </tr>
                      </table>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;">
                <div style="border-top:1px solid ${BORDER};padding-top:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                  <p style="margin:0 0 4px 0;font-size:13px;color:${MUTED};">${MASJID_NAME}</p>
                  <p style="margin:0;font-size:12px;color:${MUTED};">${MASJID_ADDRESS}</p>
                  <p style="margin:14px 0 0 0;font-size:11px;color:${MUTED};">
                    You are receiving this email because of your interaction with ${MASJID_NAME}. If you believe this was sent in error, please contact us.
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function emailParagraphs(lines: string[]): string {
  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => `<p style="margin:0 0 14px 0;">${line}</p>`)
    .join("\n");
}

export function emailInfoBox(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map(
      (row) => `
        <tr>
          <td style="padding:6px 12px 6px 0;font-size:13px;color:${MUTED};white-space:nowrap;vertical-align:top;">${escapeHtml(row.label)}</td>
          <td style="padding:6px 0;font-size:14px;color:${TEXT_DARK};font-weight:600;">${row.value}</td>
        </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px 0;background-color:${BG};border-radius:8px;padding:6px 16px;">
    ${rowsHtml}
  </table>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
