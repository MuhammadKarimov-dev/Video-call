# WebRTC bilan Video Chat Dasturi

Bu React va WebRTC texnologiyalari yordamida yaratilgan real vaqt rejimida video qo'ng'iroqlarni amalga oshiradigan dastur.

## Texnologiyalar

- Frontend: React.js
- Signaling server: Node.js + Socket.IO
- Real vaqt aloqa: WebRTC

## O'rnatish

1. Kerakli paketlarni o'rnatish:
```bash
npm install
```

2. Dasturni ishga tushirish:

Frontend qismini ishga tushirish:
```bash
npm run dev
```

Signaling serverni ishga tushirish:
```bash
npm run server
```

## Foydalanish

1. Frontend qismi `http://localhost:5173` manzilida ishlaydi
2. Signaling server `http://localhost:5001` manzilida ishlaydi
3. Video chatni sinab ko'rish uchun ikkita brauzer oching yoki ikkinchi qurilmada ochib, "Qo'ng'iroq qilish" tugmasini bosing

## Muhim eslatmalar

- WebRTC faqat HTTPS serverida yoki localhost da to'g'ri ishlaydi
- Haqiqiy loyihalarda STUN/TURN serverlarini to'g'ri sozlash kerak
