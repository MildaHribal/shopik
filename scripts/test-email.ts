/**
 * Diagnose transactional email on the machine it actually runs on (production).
 *
 * It (1) prints the resolved SMTP config, (2) verifies the connection +
 * credentials, and (3) optionally sends a real test email.
 *
 * Run on the PRODUCTION server (where the real SMTP_* env vars live):
 *   npx tsx scripts/test-email.ts                 # config + connection check
 *   npx tsx scripts/test-email.ts you@example.com # + send a test email
 */
import 'dotenv/config';
import { verifyMail, sendMail } from '../server/utils/email';

const port = Number(process.env.SMTP_PORT || 587);
const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;

console.log('── SMTP konfigurace ─────────────────────────');
console.log('SMTP_HOST  :', process.env.SMTP_HOST || '(prázdné → emaily jsou vypnuté!)');
console.log('SMTP_PORT  :', port);
console.log('SMTP_SECURE:', secure, process.env.SMTP_SECURE ? '' : '(auto z portu)');
console.log('SMTP_USER  :', process.env.SMTP_USER || '(prázdné → emaily jsou vypnuté!)');
console.log('SMTP_PASS  :', process.env.SMTP_PASS ? '••• nastaveno' : '(prázdné!)');
console.log('MAIL_FROM  :', process.env.MAIL_FROM || '(výchozí noreply@localhost)');
console.log();

console.log('── Ověřuji připojení… ───────────────────────');
const result = await verifyMail();
if (!result.configured) {
  console.error('❌ SMTP není nakonfigurované (chybí SMTP_HOST nebo SMTP_USER). Emaily se neodesílají.');
  process.exit(1);
}
if (!result.ok) {
  console.error('❌ Připojení/přihlášení selhalo:', result.error);
  console.error('   Časté příčiny: špatné heslo, MAIL_FROM ≠ SMTP_USER (Seznam to vyžaduje),');
  console.error('   zablokovaný odchozí port 465 na serveru, nebo nepovolený SMTP přístup v nastavení schránky.');
  process.exit(1);
}
console.log('✅ Připojení i přihlášení OK.');

const to = process.argv[2]?.trim();
if (!to) {
  console.log('\nℹ️  Pro odeslání testovacího emailu: npx tsx scripts/test-email.ts tvuj@email.cz');
  process.exit(0);
}

console.log(`\n── Odesílám testovací email na ${to}… ──────────`);
const sent = await sendMail({
  to,
  subject: 'Test odesílání – Tynky Bordel ✅',
  html: '<p>Tohle je testovací email z produkce. Když ho čteš, odesílání funguje. 🎉</p>',
  text: 'Testovací email z produkce – odesílání funguje.',
});
console.log(sent ? '✅ Email odeslán.' : '❌ Odeslání selhalo (viz log výše).');
process.exit(sent ? 0 : 1);
