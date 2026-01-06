# Dashboard Jadwal Ujian - Read-Only Version

Dashboard untuk menampilkan jadwal ujian mahasiswa dari Google Sheets. **Versi ini hanya menampilkan data (Read-Only)** tanpa fitur Create, Update, atau Delete.

## 🌟 Fitur

- ✅ **Tampilan Data Real-time** - Menampilkan jadwal ujian dari Google Sheets
- 📊 **Statistik** - Total jadwal, hari ini, dan minggu ini
- 🔍 **Filter & Pencarian** - Cari berdasarkan nama, tanggal, dan jenis ujian
- 📱 **Responsive Design** - Tampilan optimal di desktop, tablet, dan mobile
- 🎨 **Modern UI/UX** - Desain premium dengan animasi smooth
- 👁️ **Dua Mode Tampilan** - Timeline dan Grid view
- 🔗 **Link Otomatis** - Link meeting online dapat diklik langsung
- 📝 **Informasi Lengkap** - Semua detail ditampilkan di card (tidak perlu modal)

## 📋 Struktur Google Sheets

### Sheet "Jadwal"

| Kolom | Deskripsi |
|-------|-----------|
| ID | ID unik jadwal |
| Nama Mahasiswa | Nama lengkap mahasiswa |
| Jenis Ujian | Proposal/Hasil/Tutup/Komprehensif |
| Tanggal | Tanggal ujian (format: YYYY-MM-DD) |
| Jam Mulai | Waktu mulai (format: HH:MM) |
| Jam Selesai | Waktu selesai (format: HH:MM) |
| Ruang/Link | Ruang fisik atau link meeting online |
| Ketua | Nama ketua penguji |
| Sekretaris | Nama sekretaris |
| Anggota 1 | Nama anggota penguji 1 (opsional) |
| Anggota 2 | Nama anggota penguji 2 (opsional) |
| Anggota 3 | Nama anggota penguji 3 (opsional) |
| Catatan | Catatan tambahan (opsional) |

## 🚀 Cara Deploy

### Langkah 1: Deploy Google Apps Script (5 menit)

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
   - **COPY URL** yang diberikan

### Langkah 2: Konfigurasi Frontend (2 menit)

1. **Edit file `app.js`**
   - Buka file `app.js`
   - Cari baris:
     ```javascript
     const CONFIG = {
         API_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
         USE_DUMMY_DATA: false
     };
     ```
   
2. **Ganti dengan URL Anda**
   - Paste URL Web App yang Anda copy
   - Pastikan `USE_DUMMY_DATA: false`

3. **Save file**

### Langkah 3: Deploy ke GitHub Pages (5 menit)

1. **Buat Repository Baru**
   - Login ke GitHub
   - Klik **New repository**
   - Nama: `dashboard-jadwal-ujian`
   - Public
   - Klik **Create repository**

2. **Upload Files**
   - Klik **uploading an existing file**
   - Drag & drop: `index.html`, `style.css`, `app.js`
   - Klik **Commit changes**

3. **Aktifkan GitHub Pages**
   - Klik **Settings** → **Pages**
   - Source: **main** branch
   - Klik **Save**
   - Tunggu 1-2 menit
   - Akses: `https://[USERNAME].github.io/dashboard-jadwal-ujian/`

## 📝 Mengelola Data

Karena dashboard ini **read-only**, semua pengelolaan data dilakukan langsung di Google Sheets:

### Menambah Jadwal Baru
1. Buka Google Sheets
2. Tambahkan baris baru di sheet "Jadwal"
3. Isi semua kolom sesuai format
4. Refresh dashboard untuk melihat data baru

### Mengubah Jadwal
1. Buka Google Sheets
2. Edit data yang ingin diubah
3. Refresh dashboard untuk melihat perubahan

### Menghapus Jadwal
1. Buka Google Sheets
2. Hapus baris yang ingin dihapus
3. Refresh dashboard untuk melihat perubahan

## 🎯 Keunggulan Versi Read-Only

✅ **Lebih Aman** - Tidak ada risiko data dihapus/diubah dari dashboard
✅ **Lebih Sederhana** - Fokus pada tampilan informasi
✅ **Lebih Cepat** - Tidak ada overhead untuk form dan validasi
✅ **Kontrol Penuh** - Semua perubahan data terkontrol di Google Sheets
✅ **Audit Trail** - Google Sheets mencatat semua perubahan

## 🔧 Troubleshooting

### Data Tidak Muncul

**Solusi:**
1. Buka Console Browser (F12)
2. Lihat error di tab Console
3. Pastikan API_URL sudah benar
4. Test API langsung: buka `[API_URL]?action=getSchedules` di browser
5. Pastikan Google Apps Script sudah di-deploy dengan benar

### Data Tidak Update

**Solusi:**
1. Hard refresh browser (Ctrl+F5)
2. Clear browser cache
3. Pastikan perubahan sudah disimpan di Google Sheets

### Link Tidak Bisa Diklik

**Solusi:**
- Pastikan link dimulai dengan `http://` atau `https://`
- Format yang benar: `https://meet.google.com/abc-defg-hij`

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

## 🎨 Customization

### Mengubah Warna Tema

Edit file `style.css` di bagian CSS Variables:

```css
:root {
    --primary-500: #0ea5e9;  /* Warna utama */
    --secondary-500: #a855f7; /* Warna sekunder */
    /* ... */
}
```

### Menambah Jenis Ujian

1. Edit `index.html` - tambahkan option di select `examTypeFilter`
2. Edit `style.css` - tambahkan class untuk badge warna
3. Tambahkan data di Google Sheets dengan jenis ujian baru

## 📄 File Structure

```
Apss 3/
├── index.html          # Halaman utama dashboard (read-only)
├── style.css           # Styling dan design system
├── app.js              # Logic untuk menampilkan data
├── Code.gs             # Google Apps Script backend
└── README.md           # Dokumentasi (file ini)
```

## 🔄 Perubahan dari Versi Sebelumnya

### Dihapus:
- ❌ Tombol "Tambah Jadwal"
- ❌ Modal form untuk tambah/edit
- ❌ Modal detail
- ❌ Tombol edit dan hapus
- ❌ Semua fungsi CRUD di JavaScript

### Ditambahkan:
- ✅ Informasi lengkap langsung di card
- ✅ Link yang bisa diklik untuk meeting online
- ✅ Tampilan catatan di card (jika ada)
- ✅ Semua anggota penguji ditampilkan di card

## 💡 Tips Penggunaan

- **Refresh Otomatis**: Untuk auto-refresh, gunakan browser extension seperti "Auto Refresh"
- **Bookmark**: Simpan URL dashboard sebagai bookmark untuk akses cepat
- **Mobile**: Dashboard juga sempurna di smartphone untuk cek jadwal on-the-go
- **Print**: Gunakan Ctrl+P untuk print jadwal

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat Issue di GitHub repository.

## 📝 License

MIT License - Bebas digunakan untuk keperluan pribadi maupun komersial.

---

**Dashboard Read-Only - Fokus pada Informasi, Bukan Manipulasi Data** 📊
