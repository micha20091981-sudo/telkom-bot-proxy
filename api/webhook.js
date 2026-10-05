// ============================================================
// Vercel Serverless Function - Telegram → Apps Script Proxy
// Fix 302 Redirect dari Google Apps Script
// ============================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyFsws3lfhQ6Ywtl0d6uCK_nSql4lnPEVeaUQL2k_odtcvj7yR0f-wvVt91g94jozIENA/exec';

export default async function handler(req, res) {
  // GET request (untuk test di browser)
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      message: 'Vercel Proxy active',
      timestamp: new Date().toISOString()
    });
  }

  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    // Ambil body dari Telegram
    const body = JSON.stringify(req.body);
    
    console.log(`Received body: ${body.length} bytes`);

    // Teruskan ke Apps Script
    // fetch() di Vercel OTOMATIS follow redirect 302!
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    console.log(`Apps Script HTTP: ${response.status}`);

    // Balas ke Telegram (selalu OK)
    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Proxy error:', err.message);
    
    // Tetap balas OK biar Telegram tidak retry
    return res.status(200).json({ 
      ok: true, 
      warning: 'Proxy error, but returned OK to prevent retry' 
    });
  }
}
