/**
 * SPAYD (Short Payment Descriptor) — Czech instant-payment QR code format.
 *
 * Reference: https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
 * Example: SPD*1.0*ACC:CZ6508000000192000145399*AM:350.00*CC:CZK*X-VS:1234*MSG:Objednavka 1234
 *
 * Configure via env:
 *   BANK_ACCOUNT_IBAN=CZ6508000000192000145399  (destination account)
 *   BANK_ACCOUNT_HOLDER="Tynky Bordel"          (only shown to customer, not in QR)
 */

// qrcode is a CJS module; use dynamic import to get compatible interop under Nitro.

export type SpaydArgs = {
  amount: number;
  variableSymbol: string | number;
  message?: string;
};

/**
 * Compute CZ IBAN from account number (with optional prefix) and 4-digit bank code.
 * Format: CZkk BBBB PPPPPP NNNNNNNNNN
 *   BBBB   = bank code
 *   PPPPPP = optional account prefix (left-padded to 6)
 *   NNNN…  = account number (left-padded to 10)
 * IBAN check digits per ISO 13616 (mod-97-10).
 */
export function computeCzIban(accountNumber: string, bankCode: string, prefix = ''): string {
  const bank = String(bankCode).padStart(4, '0');
  const pref = String(prefix || '').padStart(6, '0');
  const acc = String(accountNumber).padStart(10, '0');
  const bban = bank + pref + acc;
  // Move country code + "00" to end, convert letters (C=12, Z=35), compute mod 97.
  const numeric = bban + '123500'; // "CZ00" → 12 35 00
  // Mod 97 using string chunking (BigInt is fine, but chunking is portable).
  let mod = 0;
  for (const ch of numeric) mod = (mod * 10 + Number(ch)) % 97;
  const check = String(98 - mod).padStart(2, '0');
  return `CZ${check}${bban}`;
}

export function getBankAccount() {
  // Prefer explicit IBAN; fall back to computing from local account+bank code.
  let iban = process.env.BANK_ACCOUNT_IBAN || '';
  if (!iban) {
    const number = process.env.BANK_ACCOUNT_NUMBER || '';
    const bank = process.env.BANK_ACCOUNT_BANK_CODE || '';
    const prefix = process.env.BANK_ACCOUNT_PREFIX || '';
    if (number && bank) {
      iban = computeCzIban(number, bank, prefix);
    }
  }
  return {
    iban,
    holder: process.env.BANK_ACCOUNT_HOLDER || 'Tynky Bordel',
    // Local-format display (e.g. "8294444959/5500") for humans reading the details.
    localFormat: process.env.BANK_ACCOUNT_NUMBER && process.env.BANK_ACCOUNT_BANK_CODE
      ? `${process.env.BANK_ACCOUNT_PREFIX ? process.env.BANK_ACCOUNT_PREFIX + '-' : ''}${process.env.BANK_ACCOUNT_NUMBER}/${process.env.BANK_ACCOUNT_BANK_CODE}`
      : '',
  };
}

/**
 * Build SPAYD payment string. Returns empty string if IBAN is not configured.
 * Message is stripped of non-ASCII and truncated to 60 chars per spec.
 */
export function buildSpayd({ amount, variableSymbol, message }: SpaydArgs): string {
  const { iban } = getBankAccount();
  if (!iban) return '';

  const parts = [
    'SPD*1.0',
    `ACC:${iban}`,
    `AM:${amount.toFixed(2)}`,
    'CC:CZK',
    `X-VS:${String(variableSymbol)}`,
  ];
  if (message) {
    const clean = message
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\*/g, ' ')
      .slice(0, 60);
    parts.push(`MSG:${clean}`);
  }
  return parts.join('*');
}

/**
 * Generate a data-URL PNG QR code for the given SPAYD string.
 * Returns null if generation fails or the payload is empty.
 */
export async function spaydToDataUrl(spayd: string): Promise<string | null> {
  if (!spayd) return null;
  try {
    const mod: any = await import('qrcode');
    const toDataURL = mod.toDataURL || mod.default?.toDataURL;
    if (typeof toDataURL !== 'function') {
      console.error('[spayd] qrcode.toDataURL not found on module');
      return null;
    }
    return await toDataURL(spayd, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 400,
      color: { dark: '#000000', light: '#FFFFFF' },
    });
  } catch (err) {
    console.error('[spayd] QR generation failed:', err);
    return null;
  }
}
