# Contoh Data untuk Google Sheets

## Sheet: Jadwal

Berikut adalah contoh data yang bisa Anda masukkan ke Google Sheets untuk testing:

### Header (Row 1)
```
ID | Nama Mahasiswa | Jenis Ujian | Tanggal | Jam Mulai | Jam Selesai | Ruang/Link | Ketua | Sekretaris | Anggota 1 | Anggota 2 | Anggota 3 | Catatan
```

### Data Contoh (Row 2 dst)

```
1 | Ahmad Fauzi | Proposal | 2026-01-10 | 09:00 | 11:00 | Ruang 301 | Dr. Ir. Agus Setiawan, M.T. | Dr. Citra Dewi, S.Si., M.T. | Ir. Dedi Susanto, M.Eng. | | | Harap membawa dokumen lengkap

2 | Siti Nurhaliza | Hasil | 2026-01-10 | 13:00 | 15:00 | https://meet.google.com/abc-defg-hij | Prof. Dr. Budi Raharjo, M.Kom. | Dr. Eng. Eka Putri, S.T., M.T. | Dr. Ir. Agus Setiawan, M.T. | Ir. Dedi Susanto, M.Eng. | | 

3 | Budi Santoso | Tutup | 2026-01-11 | 10:00 | 12:00 | Ruang 302 | Prof. Ir. Fajar Nugroho, Ph.D. | Dr. Citra Dewi, S.Si., M.T. | Dr. Eng. Eka Putri, S.T., M.T. | | | 

4 | Dewi Lestari | Komprehensif | 2026-01-12 | 08:00 | 10:00 | Ruang 303 | Dr. Ir. Agus Setiawan, M.T. | Ir. Dedi Susanto, M.Eng. | Prof. Dr. Budi Raharjo, M.Kom. | Dr. Citra Dewi, S.Si., M.T. | Prof. Ir. Fajar Nugroho, Ph.D. | Ujian komprehensif akhir

5 | Eko Prasetyo | Proposal | 2026-01-13 | 09:00 | 11:00 | https://meet.google.com/xyz-abcd-efg | Dr. Eng. Eka Putri, S.T., M.T. | Prof. Dr. Budi Raharjo, M.Kom. | Dr. Ir. Agus Setiawan, M.T. | | | 
```

## Cara Input Data ke Google Sheets

### Metode 1: Manual Copy-Paste

1. Buka Google Sheets Anda
2. Pastikan sheet "Jadwal" sudah ada
3. Di Row 1, masukkan header sesuai urutan di atas
4. Copy data contoh di atas
5. Paste ke sheet mulai dari Row 2

### Metode 2: Import CSV

1. Buat file `jadwal.csv` dengan format:
```csv
ID,Nama Mahasiswa,Jenis Ujian,Tanggal,Jam Mulai,Jam Selesai,Ruang/Link,Ketua,Sekretaris,Anggota 1,Anggota 2,Anggota 3,Catatan
1,Ahmad Fauzi,Proposal,2026-01-10,09:00,11:00,Ruang 301,"Dr. Ir. Agus Setiawan, M.T.","Dr. Citra Dewi, S.Si., M.T.","Ir. Dedi Susanto, M.Eng.",,,Harap membawa dokumen lengkap
2,Siti Nurhaliza,Hasil,2026-01-10,13:00,15:00,https://meet.google.com/abc-defg-hij,"Prof. Dr. Budi Raharjo, M.Kom.","Dr. Eng. Eka Putri, S.T., M.T.","Dr. Ir. Agus Setiawan, M.T.","Ir. Dedi Susanto, M.Eng.",,
```

2. Di Google Sheets:
   - File → Import
   - Upload → pilih file CSV
   - Import location: Replace current sheet
   - Klik Import data

## Format Data Penting

### Tanggal
- Format: `YYYY-MM-DD` (contoh: `2026-01-10`)
- Atau gunakan format tanggal Google Sheets langsung

### Waktu
- Format: `HH:MM` (contoh: `09:00`, `13:30`)
- Gunakan format 24 jam

### Jenis Ujian
Hanya gunakan salah satu dari:
- `Proposal`
- `Hasil`
- `Tutup`
- `Komprehensif`

(Huruf besar di awal, sesuai persis)

### Ruang/Link
- Untuk ruang fisik: `Ruang 301`, `Lab Komputer`, dll
- Untuk online: URL lengkap `https://meet.google.com/...`

### Kolom Opsional
Kolom berikut boleh dikosongkan:
- Anggota 1
- Anggota 2
- Anggota 3
- Catatan

### Kolom Wajib
Kolom berikut HARUS diisi:
- ID (angka unik)
- Nama Mahasiswa
- Jenis Ujian
- Tanggal
- Jam Mulai
- Jam Selesai
- Ruang/Link
- Ketua
- Sekretaris

## Tips

1. **ID Auto-increment**: Jika menggunakan form dashboard, ID akan otomatis di-generate
2. **Konsistensi Format**: Pastikan format tanggal dan waktu konsisten
3. **Validasi**: Gunakan Data Validation di Google Sheets untuk Jenis Ujian
4. **Backup**: Selalu backup data Anda secara berkala

## Contoh Lengkap untuk Copy-Paste

Anda bisa langsung copy tabel di bawah ini dan paste ke Google Sheets:

| ID | Nama Mahasiswa | Jenis Ujian | Tanggal | Jam Mulai | Jam Selesai | Ruang/Link | Ketua | Sekretaris | Anggota 1 | Anggota 2 | Anggota 3 | Catatan |
|----|----------------|-------------|---------|-----------|-------------|------------|-------|------------|-----------|-----------|-----------|---------|
| 1 | Ahmad Fauzi | Proposal | 2026-01-10 | 09:00 | 11:00 | Ruang 301 | Dr. Ir. Agus Setiawan, M.T. | Dr. Citra Dewi, S.Si., M.T. | Ir. Dedi Susanto, M.Eng. | | | Harap membawa dokumen lengkap |
| 2 | Siti Nurhaliza | Hasil | 2026-01-10 | 13:00 | 15:00 | https://meet.google.com/abc-defg-hij | Prof. Dr. Budi Raharjo, M.Kom. | Dr. Eng. Eka Putri, S.T., M.T. | Dr. Ir. Agus Setiawan, M.T. | Ir. Dedi Susanto, M.Eng. | | |
| 3 | Budi Santoso | Tutup | 2026-01-11 | 10:00 | 12:00 | Ruang 302 | Prof. Ir. Fajar Nugroho, Ph.D. | Dr. Citra Dewi, S.Si., M.T. | Dr. Eng. Eka Putri, S.T., M.T. | | | |
| 4 | Dewi Lestari | Komprehensif | 2026-01-12 | 08:00 | 10:00 | Ruang 303 | Dr. Ir. Agus Setiawan, M.T. | Ir. Dedi Susanto, M.Eng. | Prof. Dr. Budi Raharjo, M.Kom. | Dr. Citra Dewi, S.Si., M.T. | Prof. Ir. Fajar Nugroho, Ph.D. | Ujian komprehensif akhir |
| 5 | Eko Prasetyo | Proposal | 2026-01-13 | 09:00 | 11:00 | https://meet.google.com/xyz-abcd-efg | Dr. Eng. Eka Putri, S.T., M.T. | Prof. Dr. Budi Raharjo, M.Kom. | Dr. Ir. Agus Setiawan, M.T. | | | |
