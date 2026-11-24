import { applyGuards } from './_lib/guard.js';

export default async function handler(req, res) {
  if (!applyGuards(req, res)) return;

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY belum diset di server.' });

  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-image';
  const imageSize = process.env.GEMINI_IMAGE_SIZE || '1K';
  const { prompt, imageBase64, mimeType, aspectRatio } = req.body;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }, { inlineData: { mimeType, data: imageBase64 } }],
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { aspectRatio: aspectRatio || '1:1', imageSize },
    },
  };

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(payload),
      }
    );
    const json = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: json?.error?.message || `Gemini HTTP ${upstream.status}` });
    }

    const parts = json?.candidates?.[0]?.content?.parts || [];
    const img = parts.find((p) => p.inlineData?.data);
    if (!img) {
      const text = parts.find((p) => p.text)?.text;
      return res.status(502).json({
        error: text
          ? `Gemini mengembalikan teks, bukan gambar: ${text}`
          : 'Gemini tidak mengembalikan gambar.',
      });
    }

    return res.status(200).json({
      base64: img.inlineData.data,
      mimeType: img.inlineData.mimeType || 'image/png',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Gagal menghubungi Gemini.' });
  }
}
