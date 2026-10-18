# 🚀 Deployment pe GitHub și Hosting Public

Aceste instrucțiuni te ajută să publici site-ul pe GitHub și să îl faci accesibil tuturor de pe internet.

## 📦 Opțiuni de Hosting

### Opțiunea 1: Render.com (Recomandat - Gratuit)
Render.com oferă hosting gratuit pentru Node.js aplicații cu baza de date PostgreSQL.

### Opțiunea 2: Railway.app (Recomandat - Gratuit)
Railway.app oferă hosting gratuit cu suport pentru baze de date.

### Opțiunea 3: Heroku (Plătit)
Heroku este o platformă populară dar nu mai are plan gratuit.

### Opțiunea 4: VPS propriu (DigitalOcean, Linode)
Pentru control complet, dar necesită configurare manuală.

---

## 🎯 Deployment pe Render.com (Recomandat)

### Pasul 1: Creează cont pe Render
1. Accesează https://render.com
2. Înregistrează-te cu GitHub
3. Autorizează Render să acceseze contul tău GitHub

### Pasul 2: Modifică proiectul pentru Render

#### 2.1 Creează fișierul `render.yaml` în rădăcina proiectului:

```yaml
services:
  - type: web
    name: crt-cinema-backend
    env: node
    buildCommand: npm install
    startCommand: node server/server.js
    envVars:
      - key: PORT
        value: 10000
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: GMAIL_USER
        sync: false
      - key: GMAIL_APP_PASSWORD
        sync: false
    disk:
      name: uploads
      mountPath: /opt/render/project/server/uploads
      sizeGB: 1
```

#### 2.2 Modifică `server/server.js` pentru port dinamic:

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 2.3 Adaugă script de build în `package.json`:

```json
{
  "scripts": {
    "start": "node server/server.js",
    "build": "cd client && npm run build"
  }
}
```

### Pasul 3: Încarcă pe GitHub

```bash
# Inițializează Git
git init
git add .
git commit -m "Initial commit"

# Creează repository pe GitHub apoi:
git remote add origin https://github.com/USERNAME/crt-cinema-donduseni.git
git branch -M main
git push -u origin main
```

### Pasul 4: Conectează pe Render

1. În Render, click "New +"
2. Selectează "Web Service"
3. Conectează repository-ul GitHub
4. Selectează branch-ul `main`
5. Render va detecta automat fișierul `render.yaml`
6. Click "Create Web Service"

### Pasul 5: Configurează variabilele de mediu

În Render Dashboard:
1. Mergi la Web Service-ul creat
2. Click pe "Environment"
3. Adaugă următoarele variabile:
   - `GMAIL_USER` - email-ul tău Gmail
   - `GMAIL_APP_PASSWORD` - parola App de la Gmail
   - `JWT_SECRET` - un string random lung (sau lasă-l generat automat)

### Pasul 6: Deploy Frontend separat (opțional)

Dacă vrei frontend pe Vercel/Netlify:

#### Pe Vercel:
1. Instalează Vercel CLI: `npm i -g vercel`
2. În folderul `client`:
   ```bash
   vercel
   ```
3. Configurează API URL în `client/vite.config.js`:
   ```javascript
   export default defineConfig({
     server: {
       proxy: {
         '/api': {
           target: 'https://nume-backend.onrender.com',
           changeOrigin: true
         }
       }
     }
   })
   ```

---

## 🎯 Deployment pe Railway.app

### Pasul 1: Creează cont pe Railway
1. Accesează https://railway.app
2. Înregistrează-te cu GitHub

### Pasul 2: Importă proiectul
1. Click "New Project"
2. Selectează "Deploy from GitHub repo"
3. Alege repository-ul tău

### Pasul 3: Configurează
1. Railway va detecta automat că e Node.js
2. Adaugă variabilele de mediu în tab-ul "Variables"
3. Click "Deploy"

---

## 🎯 Deployment cu Frontend și Backend împreună

### Modifică `server/server.js` pentru a servi frontend-ul:

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const registrationRoutes = require('./routes/registrations');
const feedbackRoutes = require('./routes/feedback');
const qrRoutes = require('./routes/qr');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/qrcodes', express.static(path.join(__dirname, 'qrcodes')));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/qr', qrRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Modifică `package.json` pentru build:

```json
{
  "scripts": {
    "start": "node server/server.js",
    "build": "cd client && npm install && npm run build",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "nodemon server/server.js",
    "client": "cd client && npm run dev"
  }
}
```

### Creează `.buildscript`:

```bash
#!/bin/bash
npm install
cd client
npm install
npm run build
cd ..
```

---

## 🔐 Securitate în Producție

### 1. Schimbă parola admin implicită
După deployment, schimbă parola admin din baza de date sau adaugă un nou admin.

### 2. Folosește variabile de mediu
Nu commit niciodată `.env` pe GitHub. Folosește variabilele de mediu din platforma de hosting.

### 3. JWT Secret
Folosește un JWT secret puternic în producție.

### 4. Rate Limiting
Adaugă rate limiting pentru a preveni abuzuri:

```bash
npm install express-rate-limit
```

În `server/server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 100 // limită la 100 requesturi per IP
});

app.use('/api/', limiter);
```

---

## 📊 Bază de Date în Producție

SQLite nu este ideal pentru producție. Recomandări:

### PostgreSQL (Render/Railway)
Majoritatea platformelor oferă PostgreSQL gratuit.

Modifică `server/database.js` pentru PostgreSQL:

```bash
npm install pg
```

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Adaptează query-urile pentru PostgreSQL
```

---

## 🌐 Acces Public

După deployment, vei primi un URL de genul:
- Render: `https://crt-cinema-backend.onrender.com`
- Railway: `https://crt-cinema.up.railway.app`

Acest URL va fi accesibil de oriunde din lume.

---

## 📱 Testing în Producție

1. Testează toate funcționalitățile
2. Verifică email-urile se trimit
3. Testează QR scanner-ul
4. Verifică upload-ul de postere

---

## 🔄 Actualizări

Pentru a actualiza site-ul:

```bash
git add .
git commit -m "Update"
git push
```

Platforma de hosting va redeploy automat.

---

## 💰 Costuri

- **Render.com**: Gratuit (cu limite)
- **Railway.app**: Gratuit ($5 credit/lună)
- **Heroku**: ~$5/lună
- **VPS**: ~$5/lună (DigitalOcean)

---

## 📝 Checklist înainte de deployment

- [ ] Testează local totul
- [ ] Configurează `.env` pe platforma de hosting
- [ ] Adaugă JWT secret puternic
- [ ] Schimbă parola admin
- [ ] Configurează email-ul
- [ ] Testează deployment
- [ ] Verifică URL-ul public
- [ ] Testează de pe dispozitive diferite
