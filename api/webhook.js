// ============================================================
// Vercel Serverless Function - Telegram → Apps Script Proxy
// Fix: waitUntil biar forward gak ke-kill
// ============================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyFsws3lfhQ6Ywtl0d6uCK_nSql4lnPEVeaUQL2k_odtcvj7yR0f-wvVt91g94jozIENA/exec';

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  // GET request
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      message: 'Vercel Proxy active',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const updateId = req.body?.update_id || '-';
  console.log(`[${updateId}] MASUK`);

  const body = JSON.stringify(req.body);
  console.log(`[${updateId}] Forwarding ${body.length} bytes`);

  // ===== FORWARD KE APPS SCRIPT (AWAIT dengan timeout 25 detik) =====
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const startTime = Date.now();
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    console.log(`[${updateId}] Apps Script: ${response.status} (${duration}ms)`);

  } catch (err) {
    console.error(`[${updateId}] Forward ERROR: ${err.name} - ${err.message}`);
  }

  // ===== BALAS KE TELEGRAM =====
  return res.status(200).json({ ok: true });
}
