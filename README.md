# CRT Cinema Donduseni - Sistem de Rezervare Filme

Sistem complet de rezervare bilete pentru cinema cu funcționalități de gestionare filme, generare coduri QR, scanare și feedback.

## 🌐 Deployment Public (GitHub + Vercel)

Site-ul poate fi deployat pe **Vercel** gratuit pentru acces public de oriunde din lume.

Vezi [DEPLOYMENT_GITHUB_VERCEL.md](./DEPLOYMENT_GITHUB_VERCEL.md) pentru instrucțiuni complete.

### Deploy Rapid pe Vercel (5 minute):
1. Încarcă proiectul pe GitHub
2. Creează cont pe https://vercel.com cu GitHub
3. Importă repository-ul în Vercel
4. Configurează variabilele de mediu (GMAIL_USER, GMAIL_APP_PASSWORD, JWT_SECRET)
5. Deploy automat!

**URL public:** `https://nume-proiect.vercel.app`

## 🎬 Funcționalități

### Pentru Public
- **Vizualizare filme** cu postere și detalii complete
- **Rezervare bilete online** cu validare date
- **Validare vârstă automată** conform restricțiilor filmului
- **Generare cod QR unic** pentru fiecare rezervare
- **Trimitere email automat** cu codul QR
- **Sistem feedback** cu rating stele și comentarii
- **Salvare date** în localStorage pentru viitoare rezervări

### Pentru Admin
- **Autentificare securizată** cu JWT
- **Dashboard cu statistici** în timp real
- **Gestionare filme** (CRUD complet)
- **Upload postere** pentru filme
- **Vizualizare înregistrări** per film
- **Scanner QR codes** cu validare
- **Vizualizare feedback** de la utilizatori

### Securitate
- Validare vârstă automată
- Expirare coduri QR (2 zile după film)
- Prevenire scanare multiplă
- Parole criptate cu bcrypt
- Token JWT pentru sesiuni

## 📋 Cerințe

- Node.js (v14 sau mai nou)
- npm sau yarn
- Gmail account cu App Password pentru trimitere email-uri

## 🚀 Instalare

### 1. Instalare dependențe

```bash
# Instalare dependențe backend
npm install

# Instalare dependențe frontend
cd client
npm install
cd ..
```

### 2. Configurare variabile de mediu

Editează fișierul `.env` în rădăcina proiectului:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here_change_in_production
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here
```

**Pentru a obține Gmail App Password:**
1. Accesează https://myaccount.google.com/security
2. Activează 2-Factor Authentication
3. Mergi la App Passwords
4. Generează o parolă nouă pentru "Mail"
5. Folosește acea parolă în `.env`

### 3. Creare directoare necesare

```bash
mkdir server\uploads
mkdir server\qrcodes
```

Aceste directoare vor fi create automat la prima rulare, dar le poți crea manual.

## 🎮 Rulare

### Mod Dezvoltare (cu hot reload)

```bash
npm run dev
```

Aceasta va porni simultan:
- Backend pe http://localhost:5000
- Frontend pe http://localhost:5173

### Mod Producție

```bash
# Build frontend
cd client
npm run build
cd ..

# Start backend
npm start
```

## 🌐 Acces Rețea

Serverul rulează pe `0.0.0.0:5000`, deci este accesibil din rețea locală.

Pentru a accesa de pe alte dispozitive:
1. Află IP-ul localului (ex: 192.168.1.14)
2. Accesează http://192.168.1.14:5000

## 🔐 Credențiale Admin Implicite

- **Utilizator:** `lilian`
- **Parolă:** `292009`

⚠️ **Important:** Schimbă parola implicită în producție!

## 📁 Structură Proiect

```
crt-cinema-donduseni/
├── server/
│   ├── routes/          # API endpoints
│   │   ├── auth.js      # Autentificare
│   │   ├── movies.js    # Gestionare filme
│   │   ├── registrations.js  # Rezervări
│   │   ├── feedback.js  # Feedback
│   │   └── qr.js        # QR scanner
│   ├── utils/
│   │   └── email.js     # Email sending
│   ├── uploads/         # Postere filme
│   ├── qrcodes/         # Coduri QR generate
│   ├── database.js      # SQLite database
│   └── server.js        # Express server
├── client/
│   ├── src/
│   │   ├── pages/       # Pagini publice
│   │   │   ├── Home.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Feedback.jsx
│   │   ├── pages/admin/ # Pagini admin
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminMovies.jsx
│   │   │   ├── AdminRegistrations.jsx
│   │   │   ├── AdminFeedback.jsx
│   │   │   └── QRScanner.jsx
│   │   ├── api/
│   │   │   └── axios.js # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env                 # Variabile de mediu
├── package.json         # Dependințe backend
└── README.md
```

## 🗄️ Bază de Date

Sistemul folosește SQLite cu următoarele tabele:
- `movies` - Filme și detalii
- `registrations` - Rezervări utilizatori
- `feedback` - Evaluări și comentarii
- `admins` - Utilizatori admin

Baza de date este creată automat la prima rulare în `server/cinema.db`.

## 📧 Configurare Email

Sistemul trimite email-uri automate cu:
- Confirmare rezervare
- Cod QR unic
- Detalii film și instrucțiuni

Asigură-te că ai configurat corect Gmail în `.env`.

## 🎨 Design

- Temă întunecată modernă cu gradient
- Culori consistente (accent roșu #e94560)
- Design responsive pentru toate dispozitivele
- Animații smooth pe hover
- Interfață intuitivă

## 📱 Funcționalități Mobile

- Design complet responsive
- Scanner QR cu camera telefonului
- Touch-friendly UI
- Optimizat pentru ecrane mici

## 🔧 API Endpoints

### Autentificare
- `POST /api/auth/login` - Login admin
- `GET /api/auth/verify` - Verificare token

### Filme
- `GET /api/movies` - Lista filme
- `GET /api/movies/:id` - Detalii film
- `POST /api/movies` - Adaugare film
- `PUT /api/movies/:id` - Editare film
- `DELETE /api/movies/:id` - Ștergere film

### Rezervări
- `POST /api/registrations` - Creare rezervare
- `GET /api/registrations/movie/:movieId` - Rezervări per film
- `GET /api/registrations/stats/total` - Total rezervări
- `GET /api/registrations/stats/scanned` - Total scanate

### Feedback
- `POST /api/feedback` - Trimitere feedback
- `GET /api/feedback/movie/:movieId` - Feedback per film
- `GET /api/feedback/stats/total` - Total feedback

### QR Scanner
- `POST /api/qr/scan` - Scanare și validare QR
- `POST /api/qr/validate` - Validare fără scanare

## 🐛 Troubleshooting

### Email-ul nu se trimite
- Verifică credențialele Gmail în `.env`
- Asigură-te că ai activat 2FA și generat App Password
- Verifică conexiunea la internet

### Camera nu funcționează
- Verifică permisiunile browser-ului pentru camera
- Asigură-te că folosești HTTPS sau localhost
- Încearcă introducerea manuală a codului QR

### Eroare la conexiune
- Verifică că backend-ul rulează pe portul 5000
- Verifică configurarea proxy în `vite.config.js`
- Asigură-te că firewall-ul nu blochează conexiunea

## 📝 Licență

ISC

## 👨‍💻 Suport

Pentru probleme sau întrebări, contactează echipa de dezvoltare.
