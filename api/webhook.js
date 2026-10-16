// ============================================================
// Vercel Serverless Function - Telegram → Apps Script Proxy
// Fix: Fire-and-forget, tidak nunggu Apps Script selesai
// ============================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyFsws3lfhQ6Ywtl0d6uCK_nSql4lnPEVeaUQL2k_odtcvj7yR0f-wvVt91g94jozIENA/exec';

export const config = {
  maxDuration: 30, // max 30 detik
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

  // ===== 1. BALAS INSTAN KE TELEGRAM DULU =====
  res.status(200).json({ ok: true });

  // ===== 2. FORWARD KE APPS SCRIPT DI BACKGROUND =====
  try {
    const body = JSON.stringify(req.body);
    console.log(`[${updateId}] Forwarding ${body.length} bytes`);

    // Fire-and-forget: TANPA await, biar Vercel gak tunggu
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      redirect: 'follow',
    })
      .then(r => {
        console.log(`[${updateId}] Apps Script: ${r.status}`);
      })
      .catch(e => {
        console.error(`[${updateId}] Forward err: ${e.message}`);
      });

  } catch (err) {
    console.error(`[${updateId}] Error: ${err.message}`);
  }
}
