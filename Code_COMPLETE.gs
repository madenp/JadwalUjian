// Google Apps Script untuk Dashboard Jadwal Ujian
// URL Spreadsheet: https://docs.google.com/spreadsheets/d/1Mtb2hLAwqxrlMQfEQUumyxJw5mVIxi0J_WYvydYufdk

const SPREADSHEET_ID = '1Mtb2hLAwqxrlMQfEQUumyxJw5mVIxi0J_WYvydYufdk';
const SHEET_NAME = 'Jadwal';

/**
 * Fungsi untuk menangani HTTP GET request
 * Mengembalikan halaman HTML atau data JSON
 */
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getSchedules') {
    return getSchedules(e);
  } else if (action === 'updateCatatan') {
    return updateCatatanGet(e);
  }
  
  // Default: return HTML page (jika diperlukan)
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'API is running'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Fungsi untuk menangani HTTP POST request
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'addSchedule') {
      return addSchedule(data);
    } else if (action === 'updateSchedule') {
      return updateSchedule(data);
    } else if (action === 'deleteSchedule') {
      return deleteSchedule(data);
    } else if (action === 'updateCatatan') {
      return updateCatatan(data);
    }
    
    return createResponse(false, 'Invalid action');
  } catch (error) {
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Mengambil semua jadwal ujian
 */
function getSchedules(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse(false, 'Sheet "Jadwal" tidak ditemukan');
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return createResponse(true, 'No data found', []);
    }
    
    const headers = data[0];
    const schedules = [];
    
    // Konversi data ke format JSON
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip baris kosong
      if (!row[0] && !row[1]) continue;
      
      const schedule = {
        id: row[0] || '',
        namaMahasiswa: row[1] || '',
        jenisUjian: row[2] || '',
        tanggal: row[3] ? formatDate(row[3]) : '',
        jamMulai: row[4] || '',
        jamSelesai: row[5] || '',
        ruangLink: row[6] || '',
        ketua: row[7] || '',
        sekretaris: row[8] || '',
        anggota1: row[9] || '',
        anggota2: row[10] || '',
        anggota3: row[11] || '',
        catatan: row[12] || '',
        rowIndex: i + 1 // Untuk update/delete
      };
      
      schedules.push(schedule);
    }
    
    return createResponse(true, 'Data retrieved successfully', schedules);
  } catch (error) {
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Menambah jadwal ujian baru
 */
function addSchedule(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse(false, 'Sheet "Jadwal" tidak ditemukan');
    }
    
    // Generate ID baru
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? parseInt(sheet.getRange(lastRow, 1).getValue()) + 1 : 1;
    
    const newRow = [
      newId,
      data.namaMahasiswa || '',
      data.jenisUjian || '',
      data.tanggal || '',
      data.jamMulai || '',
      data.jamSelesai || '',
      data.ruangLink || '',
      data.ketua || '',
      data.sekretaris || '',
      data.anggota1 || '',
      data.anggota2 || '',
      data.anggota3 || '',
      data.catatan || ''
    ];
    
    sheet.appendRow(newRow);
    
    return createResponse(true, 'Jadwal berhasil ditambahkan', { id: newId });
  } catch (error) {
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Update jadwal ujian
 */
function updateSchedule(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse(false, 'Sheet "Jadwal" tidak ditemukan');
    }
    
    const rowIndex = data.rowIndex;
    if (!rowIndex) {
      return createResponse(false, 'Row index tidak ditemukan');
    }
    
    const updatedRow = [
      data.id || '',
      data.namaMahasiswa || '',
      data.jenisUjian || '',
      data.tanggal || '',
      data.jamMulai || '',
      data.jamSelesai || '',
      data.ruangLink || '',
      data.ketua || '',
      data.sekretaris || '',
      data.anggota1 || '',
      data.anggota2 || '',
      data.anggota3 || '',
      data.catatan || ''
    ];
    
    sheet.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);
    
    return createResponse(true, 'Jadwal berhasil diupdate');
  } catch (error) {
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Hapus jadwal ujian
 */
function deleteSchedule(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse(false, 'Sheet "Jadwal" tidak ditemukan');
    }
    
    const rowIndex = data.rowIndex;
    if (!rowIndex) {
      return createResponse(false, 'Row index tidak ditemukan');
    }
    
    sheet.deleteRow(rowIndex);
    
    return createResponse(true, 'Jadwal berhasil dihapus');
  } catch (error) {
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Helper function untuk format tanggal
 */
function formatDate(date) {
  if (!date) return '';
  
  if (typeof date === 'string') return date;
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Helper function untuk membuat response JSON
 */
function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Update catatan (notes) untuk jadwal tertentu via POST
 * Dengan verifikasi password
 */
function updateCatatan(data) {
  try {
    // Verifikasi password
    const PASSWORD = 'akt2026';
    if (!data.password || data.password !== PASSWORD) {
      return createResponse(false, 'Password salah! Akses ditolak.');
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse(false, 'Sheet "Jadwal" tidak ditemukan');
    }
    
    const rowIndex = data.rowIndex;
    if (!rowIndex) {
      return createResponse(false, 'Row index tidak ditemukan');
    }
    
    // Update hanya kolom Catatan (kolom ke-13, index M)
    const catatanColumn = 13;
    const newCatatan = data.catatan || '';
    
    sheet.getRange(rowIndex, catatanColumn).setValue(newCatatan);
    
    return createResponse(true, 'Catatan berhasil diupdate');
  } catch (error) {
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Update catatan via GET request (untuk menghindari CORS issues)
 * Dengan verifikasi password
 */
function updateCatatanGet(e) {
  try {
    // Ambil parameter dari URL
    const password = e.parameter.password;
    const rowIndex = parseInt(e.parameter.rowIndex);
    const catatan = e.parameter.catatan || '';
    
    // Verifikasi password
    const PASSWORD = 'akt2026';
    if (!password || password !== PASSWORD) {
      return createResponse(false, 'Password salah! Akses ditolak.');
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse(false, 'Sheet "Jadwal" tidak ditemukan');
    }
    
    if (!rowIndex || isNaN(rowIndex)) {
      return createResponse(false, 'Row index tidak valid');
    }
    
    // Update hanya kolom Catatan (kolom ke-13, index M)
    const catatanColumn = 13;
    
    sheet.getRange(rowIndex, catatanColumn).setValue(catatan);
    
    return createResponse(true, 'Catatan berhasil diupdate');
  } catch (error) {
    return createResponse(false, 'Error: ' + error.message);
  }
}
