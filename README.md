# ClinicApp Mobile

Mobile app untuk Clinic App. Stack: Expo, React Native, React Navigation, NativeWind v5, Zustand, Axios, dan TypeScript.

## Requirements

- Node.js
- npm
- Expo Go atau Android Emulator
- Backend Clinic App berjalan di `http://localhost:5050`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start Expo:

```bash
npm run start
```

Atau langsung buka Android emulator:

```bash
npm run android
```

## Backend URL

Default API URL sudah disiapkan untuk Android emulator:

```txt
http://10.0.2.2:5050/api
```

`10.0.2.2` adalah alamat khusus Android emulator untuk mengakses `localhost` laptop.

Jika menjalankan app dari Expo Go di HP fisik, gunakan IP laptop:

```powershell
$env:EXPO_PUBLIC_API_URL="http://YOUR_LAPTOP_IP:5050/api"
npm run start
```

Contoh:

```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.1.10:5050/api"
npm run start
```

Pastikan HP dan laptop berada di jaringan Wi-Fi yang sama.

## Seed Login

Gunakan akun dari backend seed:

```txt
admin@clinic.test  / password123
staff@clinic.test  / password123
doctor@clinic.test / password123
```

## Main Features

- Login
- Dashboard
- Patients CRUD
- Visit/check-in antrean
- Consultation form
- Invoice list, detail, payment status

## Useful Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npx tsc --noEmit
npx expo export --platform android
```

## Project Notes

- Navigation menggunakan React Navigation, bukan Expo Router.
- State auth menggunakan Zustand.
- Token disimpan melalui storage helper di `src/auth/storage.ts`.
- API request menggunakan Axios wrapper di `src/api/client.ts`.
- Styling menggunakan NativeWind v5 dan font Poppins.

## Troubleshooting

### Network Error

Pastikan backend sedang berjalan:

```bash
npm run dev
```

Backend harus bisa diakses di:

```txt
http://localhost:5050/api/test
```

Untuk Android emulator, app memakai:

```txt
http://10.0.2.2:5050/api
```

Untuk HP fisik, gunakan `EXPO_PUBLIC_API_URL` dengan IP laptop.

### App masih menampilkan cache lama

Restart Expo dengan clear cache:

```bash
npx expo start --clear
```

### Login gagal

Pastikan backend sudah menjalankan seed:

```bash
npm run prisma:seed
```

Lalu gunakan akun di bagian `Seed Login`.
