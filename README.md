# BILAL

موقع مشاهدة بتصميم سينمائي يعرض فيديوهات يوتيوب بالمشغّل الرسمي المضمَّن. بدون أي أدوات بناء: HTML/CSS/JS فقط.

## التشغيل
1. Google Cloud Console ← مشروع جديد ← فعّل **YouTube Data API v3** ← أنشئ مفتاح API.
2. قيّد المفتاح بـ **HTTP referrers** على `https://USERNAME.github.io/*` (ومحلياً `http://localhost:*` للتجربة).
3. ضع المفتاح في `config.js` عند `API_KEY`.
4. جرّب محلياً: `python3 -m http.server` ثم افتح http://localhost:8000

## النشر على GitHub Pages
1. ارفع كل الملفات إلى مستودع جديد.
2. Settings ← Pages ← Source: Deploy from a branch ← main / root.
3. الرابط: `https://USERNAME.github.io/REPO/`

## التخصيص
- الصفوف والأقسام: `ROWS` في `config.js`.
- الألوان: متغيرات `:root` في `style.css`.
- الحصة: البحث 100 وحدة، والرائج وقوائم التشغيل 1 وحدة، والنتائج تُحفظ في المتصفح (`CACHE_HOURS`). الحصة اليومية 10,000.
