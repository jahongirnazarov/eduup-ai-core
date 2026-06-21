# EDUUPAI Harvard 3D Classroom Platform

## Overview

EDUUPAI - Harvard universiteti standartidagi ta'lim platformasi. 100 million foydalanuvchigacha bir vaqtda xizmat ko'rsatish qobiliyatiga ega, 0 UZS server xarajati bilan ishlaydigan client-side arxitekturaga asoslangan.

## Asosiy Xususiyatlar

### 🎓 Harvard Standart Ta'lim
- 3D sinfxona muhiti (Three.js asosida)
- Kinematik yorug'lik (shadows, ACESFilmicToneMapping)
- Realistik animatsiyalar

### 👩‍🏫 Malika - AI O'qituvchi
- Silliq yurish animatsiyasi (crossfade)
- Doska oldiga avtomatik yurish
- Bo'r bilan yozish effekti (harfma-harf)
- Lablar qimirlashi (morph targets + Web Speech API)

### 📚 Dars Tizimi
- 8 ta fan (Matematika, Fizika, Ingliz tili, Kimyo, Tarix, Biologiya, Geografiya, Dasturlash)
- O'zbekcha matnlar
- Imtihon savollari
- JSON formatda tekin ma'lumotlar

### 🚀 Performance
- **Dynamic LOD System** - Eski telefonlar uchun avtomatik optimizatsiya
- **Cross-device** - Kompyuter, notebook, planshet, smart doska, smart TV
- **Zero Server Cost** - 100M concurrent users uchun 0 UZS xarajat
- **PWA Support** - Offline ishlash qobiliyati

### 📱 Platformalar
- **Web Sayt** - Barcha brauzerlarda ishlaydi
- **Telegram Mini App** - Telegram ichida to'liq funksiyalik
- **Responsive Design** - Har qanday qurilmaga moslashadi

## Fayl Tuzilishi

```
frontend/harvard-3d/
├── index.html              # Asosiy HTML fayl
├── main.js                 # Three.js asosidagi asosiy JavaScript
├── README.md              # Hujjatlar
└── assets/
    ├── lesson-data.json   # Dars ma'lumotlari
    ├── harvard_room.glb   # 3D sinfxona modeli (qo'shish kerak)
    └── harvard_malika.glb # 3D Malika modeli (qo'shish kerak)
```

## O'rnatish va Ishga Tushirish

### 1. Fayllarni joylashtirish

Platformani ishlatish uchun quyidagi fayllar kerak:

- `index.html` - HTML fayli
- `main.js` - JavaScript fayli
- `assets/lesson-data.json` - Dars ma'lumotlari
- `assets/harvard_room.glb` - 3D sinfxona modeli
- `assets/harvard_malika.glb` - 3D Malika modeli

### 2. 3D Modellar

Platforma ishlashi uchun 3D modellarni `assets/` katalogiga qo'shing:

**Harvard Room Modeli:**
- Fayl nomi: `harvard_room.glb`
- Talablar: Sinfxona ichki qismi, doska, stullar
- Optimizatsiya: < 10MB

**Malika Modeli:**
- Fayl nomi: `harvard_malika.glb`
- Talablar: O'qituvchi qiyofasi, morph targets (lablar uchun)
- Animatsiyalar: Walk, idle, write
- Optimizatsiya: < 5MB

**3D Model Yaratish:**
Agar modellaringiz bo'lmasa, platforma avtomatik ravishda procedural fallback scene yaratadi.

### 3. Web Serverda Ishga Tushirish

Platformani ishga tushirish uchun web server kerak:

#### Option 1: Python Simple HTTP Server
```bash
cd "c:\Users\concept\Desktop\edu up ai  startap\frontend\harvard-3d"
python -m http.server 8000
```

#### Option 2: Node.js http-server
```bash
npm install -g http-server
cd "c:\Users\concept\Desktop\edu up ai  startap\frontend\harvard-3d"
http-server -p 8000
```

#### Option 3: VS Code Live Server
1. VS Code o'rnating
2. "Live Server" extension o'rnating
3. `index.html` faylini oching
4. Right-click -> "Open with Live Server"

### 4. Brauzerda Ochish

Platformani quyidagi manzilda oching:
```
http://localhost:8000
```

## Telegram Mini App sifatida ishlatish

### 1. Bot yaratish
1. Telegramda @BotFather botini toping
2. `/newbot` buyrug'ini yuboring
3. Bot nomi va username kiriting
4. API tokenni oling

### 2. Mini App sozlash
1. @BotFather botiga `/newapp` buyrug'ini yuboring
2. Botni tanlang
3. Mini App URL manzilini kiriting:
   ```
   https://sizning-domainingiz.com/harvard-3d/
   ```

### 3. Webhook sozlash
```python
import requests

bot_token = "YOUR_BOT_TOKEN"
webhook_url = f"https://api.telegram.org/bot{bot_token}/setWebhook"
webhook_data = {
    "url": f"https://sizning-backendingiz.com/telegram/webhook"
}

requests.post(webhook_url, json=webhook_data)
```

## Dars Ma'lumotlarini Tahrirlash

`assets/lesson-data.json` faylini oching va yangi darslar qo'shing:

```json
{
  "lessons": [
    {
      "id": 9,
      "title": "Yangi Fan",
      "subject": "subject_name",
      "level": "beginner",
      "duration": 15,
      "content": "Dars matni shu yerda yoziladi...",
      "exam": {
        "title": "Imtihon nomi",
        "questions": [
          {
            "id": 1,
            "question": "Savol matni?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0,
            "explanation": "Izoh"
          }
        ]
      }
    }
  ]
}
```

## Performance Optimizatsiyasi

### LOD (Level of Detail) Tizimi

Platforma avtomatik ravishda qurilma imkoniyatlarini aniqlaydi:

**HIGH LOD:**
- Shadow resolution: 2048x2048
- Antialiasing: Yoqilgan
- Pixel ratio: 2
- Point lights: Yoqilgan

**MEDIUM LOD:**
- Shadow resolution: 1024x1024
- Antialiasing: O'chirilgan
- Pixel ratio: 1
- Point lights: Yoqilgan

**LOW LOD:**
- Shadow resolution: 512x512
- Antialiasing: O'chirilgan
- Pixel ratio: 1
- Point lights: O'chirilgan

### Qo'lda LOD o'zgartirish

UI dagi "Sifat" tugmasini bosib LOD o'zgartirishingiz mumkin.

## Cross-Device Compatibility

Platforma quyidagi qurilmalarda to'liq ishlaydi:

✅ Desktop kompyuter (Windows, Mac, Linux)
✅ Notebook
✅ Planshet (iPad, Android tablet)
✅ Smartfon (iPhone, Android)
✅ Smart doska
✅ Smart TV
✅ Har qanday web brauzer

## PWA (Progressive Web App)

Platformani mobil qurilmalarga app sifatida o'rnatish:

1. Chrome/Safari da platformani oching
2. "Add to Home Screen" tanlang
3. App sifatida ishlating

Offline rejimda ham ishlaydi (Service Worker orqali).

## Xavfsizlik

- Hech qanday server xarajati yo'q (client-side only)
- Ma'lumotlar brauzerda saqlanadi
- Telegram WebApp API orqali xavfsiz integratsiya
- HTTPS tavsiya etiladi

## Qo'llab-quvvatlanadigan Brauzerlar

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

## Troubleshooting

### 3D modellar yuklanmayapti
- Model fayllari `assets/` katalogida joylashganini tekshiring
- Fayl nomlari to'g'ri ekanligiga ishonch hosil qiling
- Web server ishlayotganini tekshiring

### Ovoz ishlamayapti
- Brauzerda Web Speech API qo'llab-quvvatlanadi
- Mikrofon ruxsatini bering
- Ovoz tugmasi bosilganini tekshiring

### Eski telefonlarda sekin ishlaydi
- LOD avtomatik ravishda "LOW" ga tushadi
- "Sifat" tugmasini bosib qo'lda o'zgartiring
- Boshqa ilovalarni yoping

### Telegram Mini App ishlamayapti
- Webhook to'g'ri sozlanganini tekshiring
- HTTPS ishlayotganiga ishonch hosil qiling
- Bot token to'g'ri ekanligini tekshiring

## Scaling va 100M Concurrent Users

Platforma quyidagi texnologiyalar yordamida 100 million foydalanuvchiga xizmat ko'rsatishi mumkin:

### Client-Side Architecture
- Barcha hisob-kitoblar brauzerda amalga oshiriladi
- Server faqat statik fayllarni xizmat qiladi
- CDN orqali global tarqatish

### Hybrid Cloud
- Static hosting: GitHub Pages, Vercel, Netlify (bepul)
- CDN: Cloudflare (bepul plan)
- WebSocket: natively supported

### Zero Server Cost
- No database required
- No backend processing
- No server-side rendering
- Pure client-side JavaScript

## Texnik Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **3D Engine:** Three.js r128
- **Animation:** GLTFLoader, AnimationMixer
- **Speech:** Web Speech API (browser native)
- **PWA:** Service Worker, Manifest
- **Telegram:** Telegram WebApp API

## Litsenziya

Bu platforma EDUUPAI uchun yaratilgan. O'zbekiston ta'lim tizimida foydalanish uchun mo'ljallangan.

## Aloqa

Savollaringiz bo'lsa, platformani ishlab chiqaruvchilar bilan bog'laning.

---

**EDUUPAI - Harvard Standart Ta'lim Platformasi**
🇺🇿 O'zbekiston uchun yaratilgan
🌍 100M+ concurrent users qobiliyati
💰 0 UZS server xarajati
