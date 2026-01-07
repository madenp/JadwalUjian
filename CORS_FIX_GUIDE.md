# SOLUSI CORS ERROR - Google Apps Script

## 🔴 MASALAH
```
Access to fetch at 'https://script.google.com/...' from origin 'http://localhost:8000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

## ✅ SOLUSI LENGKAP

### STEP 1: CEK CODE.GS SUDAH BENAR

Pastikan file `Code.gs` memiliki kode berikut:

#### 1.1 Handler di doGet() (Baris 13-16)
```javascript
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getSchedules') {
    return getSchedules(e);
  } else if (action === 'updateCatatan') {
    return updateCatatanGet(e);  // ← HARUS ADA INI
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'API is running'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

#### 1.2 Fungsi updateCatatanGet() (Di akhir file)
Copy kode dari file `updateCatatanGet_function.txt` dan paste di akhir Code.gs

---

### STEP 2: DEPLOY DENGAN SETTING YANG BENAR

**INI LANGKAH PALING PENTING!**

1. **Buka Google Apps Script Editor**
   - Buka spreadsheet
   - Extensions → Apps Script

2. **Klik "Deploy" → "New deployment"**
   - JANGAN klik "Manage deployments"
   - Harus "New deployment"

3. **Klik icon ⚙️ (gear) di sebelah "Select type"**

4. **Pilih "Web app"**

5. **ISI FORM DENGAN BENAR:**
   ```
   Description: Fixed CORS - Allow Anyone Access
   
   Execute as: Me (your-email@gmail.com)
   
   Who has access: Anyone  ← PENTING! HARUS "Anyone"
   ```

6. **Klik "Deploy"**

7. **Authorize jika diminta:**
   - Klik "Authorize access"
   - Pilih akun Google Anda
   - Klik "Advanced" → "Go to [Project Name] (unsafe)"
   - Klik "Allow"

8. **COPY URL DEPLOYMENT**
   - Format: https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
   - Simpan URL ini

---

### STEP 3: UPDATE URL DI app.js (JIKA BERUBAH)

Jika URL deployment berubah, update di `app.js` baris 6:

```javascript
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/[URL_BARU]/exec',
    USE_DUMMY_DATA: false,
    START_YEAR: 2026
};
```

---

### STEP 4: TEST DI BROWSER

1. **Hard Refresh Browser**
   - Windows: Ctrl + Shift + R atau Ctrl + F5
   - Mac: Cmd + Shift + R

2. **Buka Console** (F12)

3. **Test GET request langsung di console:**
   ```javascript
   fetch('https://script.google.com/macros/s/[YOUR_ID]/exec?action=getSchedules')
     .then(r => r.json())
     .then(d => console.log(d))
   ```

4. **Jika berhasil**, coba test updateCatatan:
   ```javascript
   fetch('https://script.google.com/macros/s/[YOUR_ID]/exec?action=updateCatatan&rowIndex=59&catatan=Test&password=akt2026')
     .then(r => r.json())
     .then(d => console.log(d))
   ```

---

## 🔍 TROUBLESHOOTING

### Error: "Who has access" tidak ada pilihan "Anyone"

**Solusi:**
1. Buka Google Admin Console (jika G Suite/Workspace)
2. Apps → Google Workspace → Drive and Docs
3. Sharing settings → Pastikan "External sharing" enabled

**ATAU** gunakan akun Gmail pribadi (bukan G Suite)

---

### Error: Masih CORS setelah deploy ulang

**Kemungkinan penyebab:**
1. ❌ Belum deploy dengan "New deployment"
2. ❌ Masih pakai deployment lama
3. ❌ "Who has access" bukan "Anyone"
4. ❌ Browser cache belum clear

**Solusi:**
1. ✅ Deploy BARU (bukan edit deployment lama)
2. ✅ Pastikan "Who has access" = "Anyone"
3. ✅ Clear browser cache (Ctrl+Shift+Delete)
4. ✅ Hard refresh (Ctrl+F5)
5. ✅ Coba di Incognito/Private mode

---

### Error: "Authorization required"

**Solusi:**
1. Klik "Authorize access"
2. Pilih akun Google
3. Klik "Advanced"
4. Klik "Go to [Project] (unsafe)"
5. Klik "Allow"

---

### Error: "Script function not found: updateCatatanGet"

**Solusi:**
1. Pastikan fungsi `updateCatatanGet` sudah ada di Code.gs
2. Copy dari file `updateCatatanGet_function.txt`
3. Paste di akhir Code.gs
4. Save (Ctrl+S)
5. Deploy ulang

---

## 📝 CHECKLIST DEPLOYMENT

Gunakan checklist ini untuk memastikan semua langkah sudah benar:

- [ ] ✅ Fungsi `updateCatatanGet` sudah ada di Code.gs
- [ ] ✅ Handler di `doGet()` sudah ada (`else if (action === 'updateCatatan')`)
- [ ] ✅ Save Code.gs (Ctrl+S)
- [ ] ✅ Deploy → **New deployment** (bukan Manage)
- [ ] ✅ Type: **Web app**
- [ ] ✅ Execute as: **Me**
- [ ] ✅ Who has access: **Anyone** ← PENTING!
- [ ] ✅ Authorize jika diminta
- [ ] ✅ Copy URL deployment
- [ ] ✅ Update URL di app.js (jika berubah)
- [ ] ✅ Clear browser cache
- [ ] ✅ Hard refresh (Ctrl+F5)
- [ ] ✅ Test di browser

---

## 🎯 VERIFIKASI BERHASIL

Jika berhasil, Anda akan melihat:

1. **Di Console (F12):**
   ```
   ✅ Tidak ada CORS error
   ✅ Response: {success: true, message: "..."}
   ```

2. **Di Browser:**
   ```
   ✅ Alert: "Berhasil! Ujian telah ditandai sebagai selesai."
   ✅ Kalender auto-refresh
   ✅ Status berubah jadi "Ujian Telah Selesai"
   ```

3. **Di Google Sheet:**
   ```
   ✅ Kolom "Catatan" berubah jadi "Sudah Ujian"
   ```

---

## 🆘 JIKA MASIH ERROR

Jika setelah semua langkah masih error, kemungkinan:

1. **Akun G Suite dengan restriction**
   - Solusi: Gunakan akun Gmail pribadi
   - Atau hubungi admin untuk enable external sharing

2. **Browser extension blocking**
   - Solusi: Test di Incognito mode
   - Disable ad blocker / privacy extensions

3. **Network/Firewall blocking**
   - Solusi: Test di jaringan lain
   - Atau gunakan VPN

---

## 📞 BANTUAN TAMBAHAN

Jika masih ada masalah, screenshot:
1. Deployment settings (Who has access)
2. Console error (F12)
3. Network tab (F12 → Network)

Dan share untuk troubleshooting lebih lanjut.
