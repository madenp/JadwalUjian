// ===================================
// Configuration
// ===================================
const CONFIG = {
    // URL Google Apps Script Web App
    API_URL: 'https://script.google.com/macros/s/AKfycbxXYrmUQ-zXksxIyu5mzkQfrpZ4RV4sVpB7dh290Up477Xc8tZaczLfazLV9L5MGyHM/exec',
    // Untuk testing lokal, gunakan data dummy
    USE_DUMMY_DATA: false,
    // Tahun awal untuk kalender
    START_YEAR: 2026
};

// ===================================
// State Management
// ===================================
let allSchedules = [];
let currentDate = new Date(2026, 0, 1); // Januari 2026
let selectedDate = null;

// ===================================
// DOM Elements
// ===================================
const elements = {
    loadingOverlay: document.getElementById('loadingOverlay'),
    currentMonth: document.getElementById('currentMonth'),
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),
    calendarDays: document.getElementById('calendarDays'),
    scheduleDetails: document.getElementById('scheduleDetails'),
    selectedDate: document.getElementById('selectedDate'),
    scheduleList: document.getElementById('scheduleList'),
    closeDetails: document.getElementById('closeDetails'),

    // Stats
    monthSchedules: document.getElementById('monthSchedules'),
    todaySchedules: document.getElementById('todaySchedules'),
    weekSchedules: document.getElementById('weekSchedules')
};

// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    attachEventListeners();
});

async function initializeApp() {
    showLoading();
    await loadSchedules();
    renderCalendar();
    updateStatistics();
    hideLoading();
}

// ===================================
// Event Listeners
// ===================================
function attachEventListeners() {
    elements.prevMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        updateStatistics();
    });

    elements.nextMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        updateStatistics();
    });

    elements.closeDetails.addEventListener('click', () => {
        elements.scheduleDetails.style.display = 'none';
        selectedDate = null;
        // Remove selected class from all days
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
    });
}

// ===================================
// Loading State
// ===================================
function showLoading() {
    elements.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

// ===================================
// Data Loading
// ===================================
async function loadSchedules() {
    try {
        if (CONFIG.USE_DUMMY_DATA) {
            allSchedules = generateDummyData();
        } else {
            const response = await fetch(`${CONFIG.API_URL}?action=getSchedules`);
            const data = await response.json();

            if (data.success) {
                allSchedules = data.data || [];
            } else {
                showNotification('Error: ' + data.message, 'error');
                allSchedules = [];
            }
        }
    } catch (error) {
        console.error('Error loading schedules:', error);
        showNotification('Gagal memuat data jadwal', 'error');
        allSchedules = [];
    }
}

// ===================================
// Dummy Data Generator
// ===================================
function generateDummyData() {
    const dummyData = [];
    const startDate = new Date(2026, 0, 1); // Januari 2026

    const students = [
        'Ahmad Fauzi', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Lestari',
        'Eko Prasetyo', 'Fitri Handayani', 'Gunawan Wijaya', 'Hana Pertiwi',
        'Indra Kusuma', 'Joko Widodo', 'Kartika Sari', 'Lina Marlina'
    ];

    const examTypes = ['Proposal', 'Hasil', 'Tutup', 'Komprehensif'];

    const examiners = [
        'Dr. Ir. Agus Setiawan, M.T.',
        'Prof. Dr. Budi Raharjo, M.Kom.',
        'Dr. Citra Dewi, S.Si., M.T.',
        'Ir. Dedi Susanto, M.Eng.',
        'Dr. Eng. Eka Putri, S.T., M.T.',
        'Prof. Ir. Fajar Nugroho, Ph.D.'
    ];

    // Generate data untuk 6 bulan ke depan
    for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (i * 3) + Math.floor(Math.random() * 10));

        const startHour = 8 + Math.floor(Math.random() * 6);
        const endHour = startHour + 2;

        dummyData.push({
            id: i + 1,
            namaMahasiswa: students[Math.floor(Math.random() * students.length)],
            jenisUjian: examTypes[Math.floor(Math.random() * examTypes.length)],
            tanggal: formatDateForInput(date),
            jamMulai: `${String(startHour).padStart(2, '0')}:00`,
            jamSelesai: `${String(endHour).padStart(2, '0')}:00`,
            ruangLink: Math.random() > 0.5 ? `Ruang ${301 + i}` : 'https://meet.google.com/abc-defg-hij',
            ketua: examiners[Math.floor(Math.random() * examiners.length)],
            sekretaris: examiners[Math.floor(Math.random() * examiners.length)],
            anggota1: examiners[Math.floor(Math.random() * examiners.length)],
            anggota2: Math.random() > 0.5 ? examiners[Math.floor(Math.random() * examiners.length)] : '',
            anggota3: Math.random() > 0.7 ? examiners[Math.floor(Math.random() * examiners.length)] : '',
            catatan: Math.random() > 0.6 ? 'Harap membawa dokumen lengkap' : '',
            rowIndex: i + 2
        });
    }

    return dummyData.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
}

// ===================================
// Calendar Rendering
// ===================================
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update header
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    elements.currentMonth.textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Clear calendar
    elements.calendarDays.innerHTML = '';

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        elements.calendarDays.appendChild(emptyDay);
    }

    // Add days of month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dateStr = formatDateForInput(dayDate);

        // Count schedules for this day
        const schedulesOnDay = allSchedules.filter(s => s.tanggal === dateStr);

        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';

        // Check if today
        if (dayDate.getTime() === today.getTime()) {
            dayElement.classList.add('today');
        }

        // Check if has schedules
        if (schedulesOnDay.length > 0) {
            dayElement.classList.add('has-schedule');
        }

        dayElement.innerHTML = `
            <span class="day-number">${day}</span>
            ${schedulesOnDay.length > 0 ? `<span class="schedule-count">${schedulesOnDay.length}</span>` : ''}
        `;

        // Add click event
        dayElement.addEventListener('click', () => {
            if (schedulesOnDay.length > 0) {
                showScheduleDetails(dayDate, schedulesOnDay);

                // Remove selected class from all days
                document.querySelectorAll('.calendar-day').forEach(d => {
                    d.classList.remove('selected');
                });

                // Add selected class to clicked day
                dayElement.classList.add('selected');
            }
        });

        elements.calendarDays.appendChild(dayElement);
    }
}

// ===================================
// Schedule Details
// ===================================
function showScheduleDetails(date, schedules) {
    selectedDate = date;

    // Update header
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = dayNames[date.getDay()];
    const formattedDate = formatDateDisplay(formatDateForInput(date));

    elements.selectedDate.textContent = `${dayName}, ${formattedDate}`;

    // Render schedule list
    elements.scheduleList.innerHTML = schedules.map(schedule => createScheduleCard(schedule)).join('');

    // Show details section
    elements.scheduleDetails.style.display = 'block';

    // Scroll to details
    elements.scheduleDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function createScheduleCard(schedule) {
    const examTypeClass = `exam-type-${schedule.jenisUjian.toLowerCase()}`;

    const isLink = schedule.ruangLink.startsWith('http');
    const locationHTML = isLink
        ? `<a href="${schedule.ruangLink}" target="_blank" class="schedule-location-link">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${schedule.ruangLink}</span>
           </a>`
        : `<div class="schedule-location">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${schedule.ruangLink}</span>
           </div>`;

    return `
        <div class="schedule-card">
            <div class="schedule-header">
                <div class="schedule-title">
                    <h3>${schedule.namaMahasiswa}</h3>
                    <span class="exam-type-badge ${examTypeClass}">${schedule.jenisUjian}</span>
                </div>
            </div>
            <div class="schedule-time">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${schedule.jamMulai} - ${schedule.jamSelesai}</span>
            </div>
            ${locationHTML}
            <div class="schedule-examiners">
                <div class="examiner-item">
                    <span class="examiner-role">Ketua:</span>
                    <span class="examiner-name">${schedule.ketua}</span>
                </div>
                <div class="examiner-item">
                    <span class="examiner-role">Sekretaris:</span>
                    <span class="examiner-name">${schedule.sekretaris}</span>
                </div>
                ${schedule.anggota1 ? `
                    <div class="examiner-item">
                        <span class="examiner-role">Anggota 1:</span>
                        <span class="examiner-name">${schedule.anggota1}</span>
                    </div>
                ` : ''}
                ${schedule.anggota2 ? `
                    <div class="examiner-item">
                        <span class="examiner-role">Anggota 2:</span>
                        <span class="examiner-name">${schedule.anggota2}</span>
                    </div>
                ` : ''}
                ${schedule.anggota3 ? `
                    <div class="examiner-item">
                        <span class="examiner-role">Anggota 3:</span>
                        <span class="examiner-name">${schedule.anggota3}</span>
                    </div>
                ` : ''}
            </div>
            ${schedule.catatan ? `
                <div class="schedule-notes">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>${schedule.catatan}</span>
                </div>
            ` : ''}
            
            ${schedule.catatan !== 'Sudah Ujian' ? `
                <div class="schedule-actions">
                    <button class="btn-mark-done" onclick="markAsDone(${schedule.rowIndex}, '${schedule.namaMahasiswa.replace(/'/g, "\\'")}')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Sudah Ujian
                    </button>
                </div>
            ` : `
                <div class="schedule-status-done">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Ujian Telah Selesai</span>
                </div>
            `}
        </div>
    `;
}

// ===================================
// Statistics
// ===================================
function updateStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Month statistics
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const monthCount = allSchedules.filter(s => {
        const scheduleDate = new Date(s.tanggal);
        return scheduleDate >= monthStart && scheduleDate <= monthEnd;
    }).length;

    const todayCount = allSchedules.filter(s => {
        const scheduleDate = new Date(s.tanggal);
        return scheduleDate >= today && scheduleDate <= todayEnd;
    }).length;

    const weekCount = allSchedules.filter(s => {
        const scheduleDate = new Date(s.tanggal);
        return scheduleDate >= today && scheduleDate <= weekEnd;
    }).length;

    elements.monthSchedules.textContent = monthCount;
    elements.todaySchedules.textContent = todayCount;
    elements.weekSchedules.textContent = weekCount;
}

// ===================================
// Utility Functions
// ===================================
function formatDateForInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

function showNotification(message, type = 'info') {
    alert(message);
}

// ===================================
// Mark as Done Functionality
// ===================================
async function markAsDone(rowIndex, namaMahasiswa) {
    // Prompt for password
    const password = prompt(`Masukkan password untuk menandai ujian "${namaMahasiswa}" sebagai selesai:`);

    if (!password) {
        return; // User cancelled
    }

    // Show loading
    showLoading();

    try {
        const result = await updateCatatan(rowIndex, 'Sudah Ujian', password);

        if (result.success) {
            alert('✅ Berhasil! Ujian telah ditandai sebagai selesai.');

            // Reload schedules and refresh display
            await loadSchedules();
            renderCalendar();
            updateStatistics();

            // If schedule details is open, refresh it
            if (selectedDate) {
                const dateStr = formatDateForInput(selectedDate);
                const schedulesOnDay = allSchedules.filter(s => s.tanggal === dateStr);
                if (schedulesOnDay.length > 0) {
                    showScheduleDetails(selectedDate, schedulesOnDay);
                } else {
                    elements.scheduleDetails.style.display = 'none';
                }
            }
        } else {
            alert('❌ ' + result.message);
        }
    } catch (error) {
        console.error('Error marking as done:', error);
        alert('❌ Terjadi kesalahan: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function updateCatatan(rowIndex, catatan, password) {
    try {
        // Gunakan GET request dengan parameter untuk menghindari CORS issues
        const params = new URLSearchParams({
            action: 'updateCatatan',
            rowIndex: rowIndex,
            catatan: catatan,
            password: password
        });

        const response = await fetch(`${CONFIG.API_URL}?${params.toString()}`);

        const result = await response.json();
        return result;
    } catch (error) {
        throw new Error('Gagal menghubungi server: ' + error.message);
    }
}
