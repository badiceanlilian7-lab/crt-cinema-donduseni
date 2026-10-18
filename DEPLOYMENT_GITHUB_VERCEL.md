# 🚀 Deployment pe GitHub și Vercel

Instrucțiuni pentru a face site-ul accesibil public prin GitHub și Vercel.

## 📦 Arhitectură

- **Backend (API):** Vercel Serverless Functions
- **Frontend:** Vercel Static Site
- **Bază de date:** SQLite (stocată în Vercel Storage)

---

## 🎯 Pas cu Pas Deployment

### Pasul 1: Încarcă pe GitHub

```bash
cd "c:\Users\User\OneDrive\Desktop\Folder nou (7)"
git init
git add .
git commit -m "Initial commit - CRT Cinema Donduseni"
git remote add origin https://github.com/USERNAME/crt-cinema-donduseni.git
git branch -M main
git push -u origin main
```

**Important:** Înlocuiește `USERNAME` cu numele tău de utilizator GitHub.

### Pasul 2: Deploy Backend pe Vercel

#### 2.1 Creează cont pe Vercel
1. Accesează https://vercel.com
2. Înregistrează-te cu GitHub
3. Autorizează Vercel să acceseze contul tău GitHub

#### 2.2 Importă proiectul
1. Click "Add New Project"
2. Selectează repository-ul `crt-cinema-donduseni`
3. Configurează setările:

**Framework Preset:** Other

**Build Command:** `npm install`

**Output Directory:** `.`

**Install Command:** `npm install`

#### 2.3 Configurează Environment Variables
În secțiunea "Environment Variables", adaugă:

```
NODE_ENV = production
JWT_SECRET = crt_cinema_secret_key_2024_secure_random_string
GMAIL_USER = badiceanlilian7@gmail.com
GMAIL_APP_PASSWORD = sittar-5mujfi-Qagcej
```

#### 2.4 Deploy
Click "Deploy" și așteaptă finalizarea.

### Pasul 3: Deploy Frontend pe Vercel (separat - opțional)

Dacă vrei frontend separat de backend:

#### 3.1 Creează un nou proiect Vercel pentru frontend
1. Click "Add New Project"
2. Selectează același repository
3. Configurează:

**Framework Preset:** Vite

**Root Directory:** `client`

**Build Command:** `npm run build`

**Output Directory:** `dist`

#### 3.2 Configurează Environment Variables pentru Frontend
```
VITE_API_URL = https://nume-proiect.vercel.app/api
```

#### 3.3 Modifică `client/src/api/axios.js`

```javascript
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

---

## 🎯 Metoda Simplificată (Un singur deploy)

Dacă vrei totul într-un singur deploy, fișierul `vercel.json` pe care l-am creat va gestiona automat:

1. Backend serverless functions
2. Frontend static
3. Static files (uploads, qrcodes)

Doar urmează Pasul 1 și Pasul 2 de mai sus.

---

## 🔧 Configurare Bază de Date pe Vercel

Vercel nu suportă nativ SQLite persistență. Pentru producție, recomandăm:

### Opțiunea 1: Vercel Postgres (Recomandat)

1. În Vercel Dashboard, mergi la "Storage"
2. Creează un nou database Postgres
3. Copiază connection string-ul
4. Adaugă în Environment Variables: `DATABASE_URL`
5. Modifică `server/database.js` pentru a folosi Postgres

### Opțiunea 2: Păstrează SQLite (pentru testing)

Pentru testing/demo, SQLite va funcționa dar datele se vor pierde la redeploy.

---

## 📝 Verificare după Deploy

1. Accesează URL-ul Vercel (ex: https://crt-cinema.vercel.app)
2. Testează:
   - Vizualizare filme
   - Rezervare bilete
   - Email-uri
   - Admin login
   - QR scanner

---

## 🔄 Actualizări

Pentru a actualiza site-ul:

```bash
git add .
git commit -m "Update"
git push
```

Vercel va redeploy automat.

---

## 💰 Costuri

- **Vercel:** Gratuit (Hobby plan)
  - 100GB bandwidth/lună
  - Unlimited deployments
  - Serverless functions incluse
  - Custom domains

---

## 🌐 Custom Domain (opțional)

1. În Vercel Dashboard, mergi la "Settings" → "Domains"
2. Adaugă domeniul tău (ex: crt-cinema.ro)
3. Configurează DNS conform instrucțiunilor Vercel

---

## 📱 Testing

Testează de pe:
- Desktop (Chrome, Firefox, Edge)
- Mobile (iOS Safari, Android Chrome)
- Tablete

---

## 🔒 Securitate în Producție

1. **Schimbă parola admin:**
   - După primul deploy, accesează baza de date
   - Schimbă parola pentru utilizatorul `lilian`

2. **JWT Secret:**
   - Folosește un string random lung și complex
   - Nu îl commit pe GitHub

3. **Rate Limiting:**
   - Adaugă rate limiting pentru API

4. **HTTPS:**
   - Vercel oferă HTTPS automat gratuit

---

## 🐛 Troubleshooting

### Deploy eșuează
- Verifică fișierul `vercel.json`
- Verifică că toate dependențele sunt în `package.json`
- Verifică Environment Variables

### API nu funcționează
- Verifică rutele în `vercel.json`
- Verifică că `api/index.js` există
- Verifică logs în Vercel Dashboard

### Frontend nu se încarcă
- Verifică build-ul în client
- Verifică path-urile în `vercel.json`

### Email-uri nu se trimit
- Verifică GMAIL_USER și GMAIL_APP_PASSWORD
- Verifică că 2FA este activat pe Gmail
- Verifică că App Password este corect

---

## 📊 Monitorizare

Vercel oferă:
- Analytics gratuit
- Logs în timp real
- Deploy history
- Performance monitoring

Accesează Vercel Dashboard pentru detalii.

---

## 🎉 Succes!

Site-ul tău va fi accesibil la: `https://nume-proiect.vercel.app`

Din acest punct, oricine din lume poate accesa site-ul!
