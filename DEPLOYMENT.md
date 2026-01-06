# 🚀 Panduan Deployment Cepat

## Langkah 1: Deploy Google Apps Script (5 menit)

1. **Buka Google Sheets Anda**
   - Link: https://docs.google.com/spreadsheets/d/1Mtb2hLAwqxrlMQfEQUumyxJw5mVIxi0J_WYvydYufdk

2. **Buka Apps Script Editor**
   - Klik **Extensions** → **Apps Script**

3. **Copy Code**
   - Hapus semua kode default
   - Copy seluruh isi file `Code.gs`
   - Paste ke Apps Script Editor
   - Klik **Save** (Ctrl+S)

4. **Deploy sebagai Web App**
   - Klik **Deploy** → **New deployment**
   - Klik ⚙️ → Pilih **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Klik **Deploy**
   - **Authorize access** (ikuti langkah authorization)
   - **COPY URL** yang diberikan (format: `https://script.google.com/macros/s/.../exec`)

## Langkah 2: Konfigurasi Frontend (2 menit)

1. **Edit file `app.js`**
   - Buka file `app.js`
   - Cari baris:
     ```javascript
     const CONFIG = {
         API_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
         USE_DUMMY_DATA: true
     };
     ```
   
2. **Ganti dengan URL Anda**
   ```javascript
   const CONFIG = {
       API_URL: 'https://script.google.com/macros/s/[YOUR_ID]/exec',
       USE_DUMMY_DATA: false  // Ubah ke false untuk pakai Google Sheets
   };
   ```

3. **Save file**

## Langkah 3: Testing Lokal (1 menit)

**Menggunakan Python:**
```bash
cd "c:\Dokumen\CRUD\Google\Apss 3"
python -m http.server 8000
```

**Atau menggunakan Live Server di VS Code:**
- Install extension "Live Server"
- Klik kanan `index.html` → **Open with Live Server**

**Buka browser:**
- Akses: `http://localhost:8000`

## Langkah 4: Deploy ke GitHub Pages (5 menit)

### Via GitHub Web Interface (Mudah)

1. **Buat Repository Baru**
   - Login ke GitHub
   - Klik **New repository**
   - Nama: `dashboard-jadwal-ujian`
   - Public
   - Klik **Create repository**

2. **Upload Files**
   - Klik **uploading an existing file**
   - Drag & drop: `index.html`, `style.css`, `app.js`, `README.md`
   - Klik **Commit changes**

3. **Aktifkan GitHub Pages**
   - Klik **Settings** → **Pages**
   - Source: **main** branch
   - Klik **Save**
   - Tunggu 1-2 menit
   - Akses: `https://[USERNAME].github.io/dashboard-jadwal-ujian/`

### Via Git Command Line (Advanced)

```bash
cd "c:\Dokumen\CRUD\Google\Apss 3"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[USERNAME]/dashboard-jadwal-ujian.git
git push -u origin main
```

Kemudian aktifkan GitHub Pages di Settings → Pages.

## ✅ Selesai!

Dashboard Anda sudah online dan siap digunakan! 🎉

## 🔧 Troubleshooting Cepat

**Data tidak muncul?**
- Pastikan `USE_DUMMY_DATA: false`
- Pastikan API_URL sudah benar
- Test API: buka `[API_URL]?action=getSchedules` di browser

**CORS Error?**
- Re-deploy Apps Script dengan versi baru
- Pastikan "Who has access" = "Anyone"

**Styling rusak?**
- Clear cache browser (Ctrl+Shift+Delete)
- Hard reload (Ctrl+F5)

## 📞 Butuh Bantuan?

Lihat file `README.md` untuk dokumentasi lengkap.
