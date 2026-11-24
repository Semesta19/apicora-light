# APICORA LIGHT — Vercel + GitHub

AI photo relighting dengan dua model: **Gemini** dan **OpenAI**.

```
apicora-light/
├── api/
│   ├── _lib/guard.js   # validasi + kode akses (bukan endpoint)
│   ├── gemini.js       # POST /api/gemini
│   └── openai.js       # POST /api/openai
├── public/
│   └── index.html      # frontend (file asli, sudah dipatch)
├── .env.example
├── .gitignore
├── package.json
└── vercel.json
```

## Environment Variables (Vercel > Settings > Environment Variables)

| Nama | Wajib | Keterangan |
|---|---|---|
| GEMINI_API_KEY | ya* | dari https://aistudio.google.com/apikey |
| OPENAI_API_KEY | ya* | dari https://platform.openai.com/api-keys |
| ACCESS_CODE | disarankan | kode akses sederhana pelindung kredit API |
| GEMINI_MODEL | tidak | default `gemini-3.1-flash-image` |
| GEMINI_IMAGE_SIZE | tidak | default `1K` |
| OPENAI_IMAGE_MODEL | tidak | default `gpt-image-2.6-sunburst` |
| OPENAI_IMAGE_QUALITY | tidak | `low` / `medium` / `high` |

\* wajib untuk model yang ingin dipakai.

## Test lokal
```bash
npm i -g vercel
vercel dev        # isi .env.local dari .env.example
```
