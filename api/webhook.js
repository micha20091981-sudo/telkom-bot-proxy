// ============================================================
// Vercel Serverless Function - Telegram → Apps Script Proxy
// Fix: Timeout 9 detik + redirect follow + log detail
// ============================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyFsws3lfhQ6Ywtl0d6uCK_nSql4lnPEVeaUQL2k_odtcvj7yR0f-wvVt91g94jozIENA/exec';

export const config = {
  maxDuration: 10, // Vercel Hobby max 10 detik
};

export default async function handler(req, res) {
  // GET request (test di browser)
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
  console.log(`[${updateId}] === REQUEST MASUK ===`);

  try {
    const body = JSON.stringify(req.body);
    console.log(`[${updateId}] Forwarding ${body.length} bytes`);

    // ===== FETCH DENGAN TIMEOUT 9 DETIK =====
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const startTime = Date.now();
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Proxy/1.0'
      },
      body: body,
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    console.log(`[${updateId}] Apps Script HTTP ${response.status} (${duration}ms)`);

    // Baca response body untuk debug (kalau ada error)
    const responseText = await response.text();
    console.log(`[${updateId}] Response: ${responseText.substring(0, 200)}`);

  } catch (err) {
    console.error(`[${updateId}] FORWARD ERROR: ${err.name} - ${err.message}`);
  }

  // ===== SELALU BALAS 200 OK KE TELEGRAM =====
  return res.status(200).json({ ok: true });
}
