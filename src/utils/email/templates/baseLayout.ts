export function baseEmailLayout({
  title,
  subtitle,
  bodyHtml,
  footerNote,
}: {
  title: string;
  subtitle: string;
  bodyHtml: string;
  footerNote?: string;
}) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f6f6f6; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f6f6; padding:30px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0"
            style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background-color:#16463B; padding:20px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:22px;">
                  Pervesh Rasayan Pvt. Ltd.
                </h1>
                <p style="color:#cfe8dc; margin:6px 0 0; font-size:14px;">
                  ${subtitle}
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:30px;">
                ${bodyHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f0f5f3; padding:15px; text-align:center;">
                <p style="margin:0; font-size:12px; color:#777;">
                  ${footerNote ?? `© ${new Date().getFullYear()} Pervesh Rasayan Pvt. Ltd.`}
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
