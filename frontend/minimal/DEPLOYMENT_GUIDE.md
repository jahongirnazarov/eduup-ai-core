# 🚀 Minimal Versiya - Deploy Qo'llanmasi

## 📋 Qadamlar

### 1-Qadam: Cloudflare Pages'ga Deploy

#### Variant A: Web UI orqali (eng oson)

1. **Cloudflare Dashboard'ga kiring**
   - https://dash.cloudflare.com/
   - Login qiling

2. **Pages bo'limiga o'ting**
   - Chap menudan "Workers & Pages" → "Pages"
   - "Create a project" tugmasini bosing

3. **"Upload assets" tanlang**
   - "Direct Upload" ni tanlang
   - Project nomini yozing: `eduupai-minimal`

4. **Fayllarni yuklang**
   - `frontend/minimal/` papkasidan barcha fayllarni tanlang:
     - `index.html`
     - `teacher_simple.js`
     - `storage_simple.js`
     - `exam_simple.js`

5. **Deploy tugmasini bosing**
   - 1-2 daqiqada tugaydi
   - URL olasiz: `https://eduupai-minimal.pages.dev`

---

#### Variant B: Wrangler CLI orqali

```bash
# Wrangler CLI ni o'rnating
npm install -g wrangler

# Cloudflare'ga login qiling
wrangler login

# Deploy qiling
cd "c:\Users\concept\Desktop\edu up ai  startap\frontend\minimal"
wrangler pages deploy . --project-name=eduupai-minimal
```

---

### 2-Qadam: Domenni Ulash (eduupai.uz)

#### 2.1 Bilur.com'da Nameserverlarni O'zgartirish

1. **Bilur.com'ga kiring**
   - https://bilur.com/
   - Login qiling

2. **DNS boshqaruviga o'ting**
   - `eduupai.uz` domenini tanlang
   - "DNS Management" bo'limiga o'ting

3. **Nameserverlarni o'zgartiring**
   - Hozirgi nameserverlarni o'chirib tashlang
   - Quyidagilarni qo'shing:
     - NS1: `ns1.cloudflare.com`
     - NS2: `ns2.cloudflare.com`

4. **Saqlang**
   - "Save" tugmasini bosing

#### 2.2 DNS Tarqalishini Kuting

- **Vaqt:** 24-48 soat
- **Tekshirish:** https://www.whatsmydns.net/
- Domain: `eduupai.uz`

#### 2.3 Cloudflare'da Domain Qo'shish

1. **Cloudflare Dashboard'ga kiring**
   - https://dash.cloudflare.com/

2. **Add a Site tugmasini bosing**
   - Domain: `eduupai.uz`
   - "Add site" tugmasini bosing

3. **Plan tanlang**
   - "Free" planni tanlang
   - "Continue" tugmasini bosing

4. **DNS yozuvlarini tekshiring**
   - Cloudflare avtomatik tekshiradi
   - Agar nameserverlar o'zgargan bo'lsa, "Continue" tugmasi yoqiladi

#### 2.4 DNS Yozuvlarini Qo'shish

Cloudflare DNS bo'limida quyidagi yozuvlarni qo'shing:

```
Type: A
Name: @
IPv4 address: 192.0.2.1 (Cloudflare Pages IP - avtomatik)
Proxy status: Proxied (orange cloud)
TTL: Auto
```

```
Type: CNAME
Name: www
Target: eduupai-minimal.pages.dev
Proxy status: Proxified (orange cloud)
TTL: Auto
```

#### 2.5 Cloudflare Pages'da Custom Domain Qo'shish

1. **Pages project'ga o'ting**
   - Workers & Pages → Pages
   - `eduupai-minimal` project'ni tanlang

2. **Custom domains bo'limiga o'ting**
   - "Custom domains" tugmasini bosing

3. **Domain qo'shing**
   - `eduupai.uz` ni kiriting
   - "Add domain" tugmasini bosing

4. **SSL sertifikatini kuting**
   - Cloudflare avtomatik SSL yaratadi
   - 5-10 daqiqa

---

### 3-Qadam: Test Qilish

1. **Saytni oching**
   - https://eduupai.uz
   - Yoki https://www.eduupai.uz

2. **Funksiyalarni tekshiring**
   - 2D o'qituvchi ko'rinishi
   - Imtihon boshlash
   - Javob berish
   - Natijalarni ko'rish
   - Statistika

---

## 🔧 Muammolar va Yechimlar

### Muammo: DNS tarqalmayapti
**Yechim:**
- 24-48 soat kuting
- Bilur.com'da nameserverlarni tekshiring
- https://dnschecker.org/ orqali tekshiring

### Muammo: SSL sertifikat bo'lmayapti
**Yechim:**
- Cloudflare Pages'da custom domain qo'shganingizni tekshiring
- 5-10 daqiqa kuting
- Agar bo'lmasa, Cloudflare support'ga murojaat qiling

### Muammo: Sayt ochilmayapti
**Yechim:**
- Browser cache'ni tozalang
- Incognito modda oching
- DNS yozuvlarini tekshiring
- Cloudflare Pages build log'ini tekshiring

---

## 📊 Deploy Status Checklist

- [ ] Cloudflare Pages'ga deploy qilindi
- [ ] Bilur.com'da nameserverlar o'zgardi
- [ ] DNS tarqaldi (24-48 soat)
- [ ] Cloudflare'da domain qo'shildi
- [ ] DNS yozuvlari qo'shildi
- [ ] Cloudflare Pages'da custom domain qo'shildi
- [ ] SSL sertifikat yaratildi
- [ ] Sayt https://eduupai.uz da ishlayapti
- [ ] Barcha funksiyalar test qilindi

---

## 🎞️ Video Qo'llanma (Agar kerak bo'lsa)

Agar yordam kerak bo'lsa, men sizga video qo'llanma yozib beraman yoki qadamma-qadam yordam beraman.

---

## 📞 Yordam

Agar muammo bo'lsa:
1. Browser console'da xatlarni tekshiring
2. Cloudflare Pages build log'ini ko'ring
3. DNS statusini tekshiring
4. Menga ayting, yordam beraman
