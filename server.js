require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// إعدادات أساسية للسماح باستقبال البيانات من المتصفح
app.use(cors({ origin: "*" })); // السماح لأي موقع بالاتصال بالسيرفر
app.use(express.json()); 

// 1. الاتصال بقاعدة البيانات
const dbUrl = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/school_bus';
mongoose.connect(dbUrl)
  .then(() => console.log('✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح!'))
  .catch((err) => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

// 2. تصميم "هيكل" البيانات (Schema)
const locationSchema = new mongoose.Schema({
  phoneNumber: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now }
});

// إنشاء الـ Model (والذي سيتحول لجدول اسمه locations تلقائياً)
const Location = mongoose.model('Location', locationSchema);

// 3. مسار (API) لاستقبال الإحداثيات من واجهة المستخدم
// 3. مسار (API) لاستقبال الإحداثيات من واجهة المستخدم
// مسار (API) للتحقق من الرقم قبل السماح بالدخول للخريطة
app.post('/api/check-phone', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    // فحص قاعدة البيانات
    const existingLocation = await Location.findOne({ phoneNumber: phoneNumber });
    
    if (existingLocation) {
      // إذا الرقم موجود، نرجع خطأ
      return res.status(400).json({ error: 'عذراً، هذا الرقم مسجل مسبقاً. لا يمكنك المتابعة.' });
    }

    // إذا الرقم مش موجود، نعطي الضوء الأخضر
    res.status(200).json({ message: 'الرقم متاح' });
  } catch (error) {
    console.error("خطأ أثناء فحص الرقم:", error);
    res.status(500).json({ error: 'حدث خطأ داخلي في السيرفر' });
  }
});
// إضافة للتعامل مع ملف index.html
const path = require('path');

// إخبار السيرفر أن يرسل ملف index.html عند فتح الرابط الرئيسي
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// 4. تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال ومستعد لاستقبال البيانات على البورت ${PORT}`);
});