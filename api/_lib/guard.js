// Helper bersama. Folder berawalan "_" tidak dijadikan endpoint oleh Vercel.

export function applyGuards(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }

  const required = process.env.ACCESS_CODE;
  if (required && req.headers['x-access-code'] !== required) {
    res.status(401).json({ error: 'Kode akses salah atau belum diisi.' });
    return false;
  }

  const { prompt, imageBase64, mimeType } = req.body || {};
  if (!prompt || !imageBase64 || !mimeType) {
    res.status(400).json({ error: 'Field prompt, imageBase64, mimeType wajib ada.' });
    return false;
  }
  if (!/^image\/(jpeg|png|webp)$/.test(mimeType)) {
    res.status(400).json({ error: 'Tipe gambar harus JPEG, PNG, atau WebP.' });
    return false;
  }
  return true;
}
