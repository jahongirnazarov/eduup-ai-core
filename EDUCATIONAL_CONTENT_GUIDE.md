# 🎓 EDUUP Educational Content Research System

## 📋 Tizim Haqida

Bu tizim ta'limiy materiallarni ishonchli manbalardan (Google, YouTube, Instagram) qidirib, ularni qayta generatsiya qilib (mualliflik huquqi muammolaridan qochish uchun), savollarni generatsiya qilib, adminga PDF qilib yuborish uchun yaratilgan.

## 🏗️ Tizim Arxitekturasi

### Modullar

1. **research_content_scraper.py** - Ma'lumot qidirish moduli
   - Google'dan ta'limiy ma'lumotlar qidirish
   - YouTube'dan ta'limiy videolar va transcriptlar olish
   - Instagram'dan ta'limiy kontent olish
   - Ishonchli manbalardan foydalanish

2. **content_rewriter.py** - Kontent qayta yozish moduli
   - Synonym replacement (sinonimlar bilan almashtirish)
   - Sentence restructuring (gaplarni qayta tuzish)
   - Voice change (aktiv/pasiv o'zgartirish)
   - Mualliflik huquqi uchun xavfsiz qayta yozish

3. **pdf_generator.py** - PDF generatsiya moduli
   - Research report PDF yaratish
   - Question bank PDF yaratish
   - Material PDF yaratish
   - Comprehensive report yaratish

4. **reliable_sources_config.py** - Ishonchli manbalar konfiguratsiyasi
   - Har bir fan uchun ishonchli domenlar
   - YouTube kanallari
   - Ta'lim muassasalari
   - Akademik jurnallar

5. **educational_content_orchestrator.py** - Asosiy orchestrator
   - Barcha modullarni birlashtirish
   - To'liq workflow boshqaruvi
   - Admin approval bilan integratsiya

## 🚀 O'rnatish

### Kutubxonalarni o'rnatish

```bash
pip install -r requirements.txt
```

### Yangi qo'shilgan kutubxonalar:

```
googlesearch-python==1.2.3
youtube-transcript-api==0.6.1
beautifulsoup4==4.12.2
nltk==3.8.1
reportlab==4.0.7
requests==2.31.0
```

## 📖 Ishlatish

### 1. Oddiy foydalanish

```python
from educational_content_orchestrator import educational_orchestrator

# Ta'limiy kontent yaratish
result = educational_orchestrator.create_educational_content(
    subject="matematika",
    topic="algebra",
    admin_id=0,
    sources=["google", "youtube"],
    num_questions=10
)

print(f"PDF yaratildi: {result['pdf_path']}")
print(f"Content ID: {result['content_id']}")
```

### 2. Batch foydalanish (ko'p fanlar uchun)

```python
from educational_content_orchestrator import educational_orchestrator

# Ko'p fanlar uchun kontent yaratish
subjects_topics = {
    "matematika": "algebra",
    "fizika": "mechanics",
    "kimyo": "organic chemistry"
}

result = educational_orchestrator.batch_create_content(
    subjects_topics=subjects_topics,
    admin_id=0
)

print(f"Muvaffaqiyatli: {result['successful']}")
print(f("Muvaffaqiyatsiz: {result['failed']}")
```

### 3. Admin approval

```python
from educational_content_orchestrator import educational_orchestrator

# Kutayotgan kontentlarni olish
pending = educational_orchestrator.get_pending_approvals(limit=10)

# Kontentni tasdiqlash
educational_orchestrator.approve_content(
    content_id=1,
    admin_id=0,
    admin_password="123456",
    feedback="Kontent tasdiqlandi"
)

# Qayta ko'rish so'rash
educational_orchestrator.request_revision(
    content_id=1,
    admin_id=0,
    admin_password="123456",
    feedback="Qo'shimcha ma'lumot kerak"
)
```

### 4. Content rewriter alohida

```python
from content_rewriter import content_rewriter

# Matnni qayta yozish
result = content_rewriter.rewrite_content(
    original_content="Calculate the equation to find the solution.",
    strategy="mixed",
    intensity=0.7
)

print(f"Qayta yozilgan: {result['rewritten_content']}")
print(f"O'xshashlik: {result['similarity_score']}")
print(f"Mualliflik huquqi xavfsiz: {result['copyright_safe']}")
```

### 5. PDF generator alohida

```python
from pdf_generator import pdf_generator

# Savollar banki PDF yaratish
questions = [
    {
        "question": "What is 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "correct_answer": "4",
        "difficulty": "easy"
    }
]

result = pdf_generator.generate_question_bank_pdf(
    questions=questions,
    subject="matematika",
    admin_id=0
)

print(f"PDF: {result['pdf_path']}")
```

## 🧪 Testlash

Test skriptini ishga tushirish:

```bash
python test_educational_content.py
```

Testlar quyidagilarni o'z ichiga oladi:
1. Reliable sources config
2. Content rewriter
3. PDF generator
4. Research scraper
5. Full workflow
6. Admin approval integration

## 📚 Mavjud Fanlar

Tizim quyidagi fanlar uchun tayyorlangan:

- **matematika** - Algebra, geometry, calculus, statistics
- **fizika** - Mechanics, thermodynamics, electromagnetism
- **kimyo** - Organic chemistry, inorganic chemistry, biochemistry
- **biologiya** - Cell biology, genetics, ecology
- **ona_tili** - Grammar, vocabulary, literature
- **ingliz_tili** - Grammar, vocabulary, reading comprehension
- **tarix** - Ancient history, medieval history, modern history
- **geografiya** - Physical geography, human geography

## 🔒 Mualliflik Huquqi Xavfsizligi

Tizim quyidagi usullar bilan mualliflik huquqi muammolaridan qochadi:

1. **Synonym Replacement** - So'zlarni sinonimlar bilan almashtirish
2. **Sentence Restructuring** - Gaplarni qayta tuzish
3. **Voice Change** - Aktiv/pasiv o'zgartirish
4. **Sentence Order Change** - Gap tartibini o'zgartirish
5. **Citation Generation** - Manbalarni to'g'ri citation qilish
6. **Similarity Score** - O'xshashlik ballini hisoblash (<85% xavfsiz)

## 📊 Workflow

1. **Research** - Ishonchli manbalardan ma'lumot qidirish
2. **Rewrite** - Kontentni qayta yozish (mualliflik huquqi uchun xavfsiz)
3. **Generate Questions** - Savollarni generatsiya qilish
4. **Generate PDF** - PDF report yaratish
5. **Submit for Approval** - Admin tasdiqlashiga yuborish
6. **Admin Review** - Admin tomonidan ko'rib chiqish
7. **Approve/Reject** - Tasdiqlash yoki rad etish

## ⚠️ Eslatmalar

1. **API Keys** - Haqiqiy Google va YouTube API kalitlari kerak bo'lishi mumkin
2. **Rate Limiting** - Qidirishlar orasida delay qo'yilgan (rate limitingdan qochish uchun)
3. **Mock Mode** - Hozircha YouTube va Instagram mock mode da ishlaydi
4. **Database** - Ma'lumotlar bazasi kerak (database.py moduli)

## 🛠️ Troubleshooting

### Google search ishlamayapti

```bash
pip install googlesearch-python
```

### YouTube transcript ishlamayapti

```bash
pip install youtube-transcript-api
```

### PDF generatsiya ishlamayapti

```bash
pip install reportlab
```

### NLTK ishlamayapti

```bash
pip install nltk
python -c "import nltk; nltk.download('punkt'); nltk.download('averaged_perceptron_tagger')"
```

## 📞 Yordam

Agar muammo bo'lsa, quyidagilarni tekshiring:

1. Barcha kutubxonalar o'rnatilganmi
2. Database.py moduli mavjudmi
3. .env fayl to'g'ri konfiguratsiya qilinganmi
4. Admin paroli to'g'ri (default: "123456")

## 🎯 Keyingi Qadamlar

1. Haqiqiy API kalitlarini qo'shish (Google Custom Search, YouTube Data API)
2. Instagram Basic Display API integratsiyasi
3. Ko'proq fanlar qo'shish
4. Advanced NLP texnikalarini qo'shish
5. Real-time monitoring va logging
6. Web dashboard yaratish

---

**Yaratildi:** 2026-yil  
**Versiya:** 1.0.0  
**Litsenziya:** EduUp Global Exam Academy
