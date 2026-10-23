// إعدادات موقع BILAL — عدّل هذا الملف فقط
window.BILAL = {
  // مفتاح YouTube Data API v3 (قيّده على نطاق موقعك من Google Cloud)
  API_KEY: "AIzaSyCCVPmvaapoVuF5AfnhoQDThVaPG35MKXo",
  REGION: "DZ",          // بلد الرائج
  CACHE_HOURS: 12,       // مدة حفظ النتائج لتوفير الحصة
  // الصفوف: chart = رائج (1 وحدة) | playlistId = قائمة تشغيل (1 وحدة) | query = بحث (100 وحدة)
  ROWS: [
    { title: "الرائج الآن", chart: "mostPopular" },
    { title: "أفلام وثائقية", query: "فيلم وثائقي بالعربية" },
    { title: "تقنية وذكاء اصطناعي", query: "ذكاء اصطناعي شرح بالعربي" },
    { title: "طبخ", query: "وصفات طبخ سهلة" },
    { title: "رياضة", query: "ملخصات مباريات" },
    { title: "موسيقى", query: "أغاني عربية" }
    // مثال قائمة تشغيل: { title: "قناتي", playlistId: "PLxxxxxxxx" }
  ]
};
