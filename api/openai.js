import { applyGuards } from './_lib/guard.js';

// gpt-image hanya mendukung beberapa ukuran tetap
function pickSize(aspectRatio = '1:1') {
  const [w, h] = aspectRatio.split(':').map(Number);
  const r = w / h;
  if (r > 1.15) return '1536x1024'; // landscape
  if (r < 0.87) return '1024x1536'; // portrait
  return '1024x1024';
}

export default async function handler(req, res) {
  if (!applyGuards(req, res)) return;

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: 'OPENAI_API_KEY belum diset di server.' });

  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
  const quality = process.env.OPENAI_IMAGE_QUALITY || 'medium';
  const { prompt, imageBase64, mimeType, aspectRatio } = req.body;

  try {
    const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
    const form = new FormData();
    form.append('model', model);
    form.append('prompt', prompt);
    form.append('image', new Blob([Buffer.from(imageBase64, 'base64')], { type: mimeType }), `input.${ext}`);
    form.append('size', pickSize(aspectRatio));
    form.append('quality', quality);
    form.append('output_format', 'jpeg'); // lebih kecil, aman dari batas 4.5MB Vercel
    form.append('output_compression', '90');
    form.append('input_fidelity', 'high'); // jaga wajah & detail asli

    const upstream = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
    const json = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: json?.error?.message || `OpenAI HTTP ${upstream.status}` });
    }

    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) return res.status(502).json({ error: 'OpenAI tidak mengembalikan gambar.' });

    return res.status(200).json({ base64: b64, mimeType: 'image/jpeg' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Gagal menghubungi OpenAI.' });
  }
}
