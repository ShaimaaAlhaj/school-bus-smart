require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json()); 

const dbUrl = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/school_bus';
mongoose.connect(dbUrl)
  .then(() => console.log('✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح!'))
  .catch((err) => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

const locationSchema = new mongoose.Schema({
  phoneNumber: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now }
});

const Location = mongoose.model('Location', locationSchema);

// مسار 1: فحص الرقم في الشاشة الأولى
app.post('/api/check-phone', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const existingLocation = await Location.findOne({ phoneNumber: phoneNumber });
    if (existingLocation) {
      return res.status(400).json({ error: 'عذراً، هذا الرقم مسجل مسبقاً. لا يمكنك المتابعة.' });
    }
    res.status(200).json({ message: 'الرقم متاح' });
  } catch (error) {
    console.error("خطأ أثناء فحص الرقم:", error);
    res.status(500).json({ error: 'حدث خطأ داخلي في السيرفر' });
  }
});

// مسار 2: حفظ الموقع للرقم الجديد
app.post('/api/save-location', async (req, res) => {
  try {
    const { phoneNumber, lat, lng } = req.body;
    
    // فحص إضافي للتأكيد
    const existingLocation = await Location.findOne({ phoneNumber: phoneNumber });
    if (existingLocation) {
      return res.status(400).json({ error: 'عذراً، هذا الرقم مسجل مسبقاً في النظام!' });
    }

    const newLocation = new Location({ phoneNumber, lat, lng });
    await newLocation.save(); 

    console.log(`✅ تم استلام وحفظ موقع جديد للرقم: ${phoneNumber}`);
    res.status(201).json({ message: 'تم حفظ الموقع بنجاح!' });
  } catch (error) {
    console.error("❌ خطأ أثناء الحفظ:", error);
    res.status(500).json({ error: 'حدث خطأ داخلي في السيرفر' });
  }
});

app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال ومستعد لاستقبال البيانات على البورت ${PORT}`);
});