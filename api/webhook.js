// ============================================================
// Vercel Serverless Function - Telegram → Apps Script Proxy
// Fix: Balas instan ke Telegram, forward di background
// ============================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyFsws3lfhQ6Ywtl0d6uCK_nSql4lnPEVeaUQL2k_odtcvj7yR0f-wvVt91g94jozIENA/exec';

export default async function handler(req, res) {
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

  // ===== BALAS INSTAN KE TELEGRAM DULUAN =====
  // Ini bikin Telegram gak retry, jadi gak spam
  res.status(200).json({ ok: true });

  try {
    const body = JSON.stringify(req.body);
    const updateId = req.body.update_id || '-';
    console.log(`[${updateId}] Forwarding ${body.length} bytes`);

    // ===== FORWARD KE APPS SCRIPT DI BACKGROUND =====
    // fetch tanpa await (fire-and-forget)
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    })
    .then(r => console.log(`[${updateId}] Apps Script: ${r.status}`))
    .catch(e => console.error(`[${updateId}] Forward error:`, e.message));

  } catch (err) {
    console.error('Proxy error:', err.message);
  }
}
