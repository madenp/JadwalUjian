// ===================================
// Configuration
// ===================================
const CONFIG = {
    // URL Google Apps Script Web App
    API_URL: 'https://script.google.com/macros/s/AKfycbxXYrmUQ-zXksxIyu5mzkQfrpZ4RV4sVpB7dh290Up477Xc8tZaczLfazLV9L5MGyHM/exec',
    // Untuk testing lokal, gunakan data dummy
    USE_DUMMY_DATA: false,
    // Rentang waktu untuk pengujian (30 hari)
    DAYS_RANGE: 30
};

// ===================================
// State Management
// ===================================
let allSchedules = [];
let dosenData = {};
let selectedDosen = null;

// ===================================
// DOM Elements
// ===================================
const elements = {
    loadingOverlay: document.getElementById('loadingOverlay'),
    dosenContainer: document.getElementById('dosenContainer'),
    emptyState: document.getElementById('emptyState'),
    detailModal: document.getElementById('detailModal'),
    closeModal: document.getElementById('closeModal'),
    dosenName: document.getElementById('dosenName'),
    detailContent: document.getElementById('detailContent'),

    // Stats
    totalDosen: document.getElementById('totalDosen'),
    totalPengujian: document.getElementById('totalPengujian'),
    belumUjian: document.getElementById('belumUjian')
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
    processDosenData();
    renderDosenCards();
    updateStatistics();
    hideLoading();
}

// ===================================
// Event Listeners
// ===================================
function attachEventListeners() {
    elements.closeModal.addEventListener('click', closeModal);

    // Close modal on outside click
    elements.detailModal.addEventListener('click', (e) => {
        if (e.target === elements.detailModal) closeModal();
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');

    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value;
            handleSearch(searchTerm);

            // Show/hide clear button
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchTerm ? 'flex' : 'none';
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function () {
            if (searchInput) {
                searchInput.value = '';
                handleSearch('');
                clearSearchBtn.style.display = 'none';
                searchInput.focus();
            }
        });
    }
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

        // Filter hanya jadwal 30 hari ke depan dan belum ujian
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + CONFIG.DAYS_RANGE);

        allSchedules = allSchedules.filter(schedule => {
            const scheduleDate = new Date(schedule.tanggal);
            const isInRange = scheduleDate >= today && scheduleDate <= endDate;
            const belumUjian = !schedule.catatan || schedule.catatan.toLowerCase() !== 'sudah ujian';
            return isInRange && belumUjian;
        });

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
    const startDate = new Date(2026, 0, 1);

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

    for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (i * 2) + Math.floor(Math.random() * 5));

        const startHour = 8 + Math.floor(Math.random() * 6);
        const endHour = startHour + 2;

        // Random catatan - 70% belum ujian, 30% sudah ujian
        const catatan = Math.random() > 0.7 ? 'Sudah Ujian' : (Math.random() > 0.6 ? 'Harap membawa dokumen lengkap' : '');

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
            catatan: catatan,
            rowIndex: i + 2
        });
    }

    return dummyData.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
}

// ===================================
// Process Dosen Data
// ===================================
function processDosenData() {
    dosenData = {};

    allSchedules.forEach(schedule => {
        // Process each examiner role
        const examiners = [
            { name: schedule.ketua, role: 'Ketua' },
            { name: schedule.sekretaris, role: 'Sekretaris' },
            { name: schedule.anggota1, role: 'Anggota' },
            { name: schedule.anggota2, role: 'Anggota' },
            { name: schedule.anggota3, role: 'Anggota' }
        ];

        examiners.forEach(examiner => {
            if (examiner.name && examiner.name.trim() !== '') {
                if (!dosenData[examiner.name]) {
                    dosenData[examiner.name] = {
                        name: examiner.name,
                        schedules: []
                    };
                }

                dosenData[examiner.name].schedules.push({
                    ...schedule,
                    roleInExam: examiner.role
                });
            }
        });
    });

    // Sort schedules by date for each dosen
    Object.keys(dosenData).forEach(dosenName => {
        dosenData[dosenName].schedules.sort((a, b) =>
            new Date(a.tanggal) - new Date(b.tanggal)
        );
    });
}

// ===================================
// Search Functionality
// ===================================
function handleSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const dosenList = Object.values(dosenData);

    if (!term) {
        // Show all dosen if search is empty
        renderDosenCards();
        return;
    }

    // Filter dosen based on search term
    const filteredDosen = dosenList.filter(dosen =>
        dosen.name.toLowerCase().includes(term)
    );

    // Render filtered list
    if (filteredDosen.length === 0) {
        elements.dosenContainer.style.display = 'none';
        elements.emptyState.style.display = 'flex';
        elements.emptyState.querySelector('h3').textContent = 'Tidak ada dosen ditemukan';
        elements.emptyState.querySelector('p').textContent = `Tidak ada dosen yang cocok dengan pencarian "${searchTerm}".`;
        return;
    }

    elements.dosenContainer.style.display = 'grid';
    elements.emptyState.style.display = 'none';

    // Sort by number of schedules (descending)
    filteredDosen.sort((a, b) => b.schedules.length - a.schedules.length);

    const html = filteredDosen.map(dosen => createDosenCard(dosen)).join('');
    elements.dosenContainer.innerHTML = html;

    // Attach click listeners
    document.querySelectorAll('.dosen-card').forEach(card => {
        card.addEventListener('click', () => {
            const dosenName = card.dataset.dosen;
            showDosenDetail(dosenName);
        });
    });
}

// ===================================
// Rendering
// ===================================
function renderDosenCards() {
    const dosenList = Object.values(dosenData);

    if (dosenList.length === 0) {
        elements.dosenContainer.style.display = 'none';
        elements.emptyState.style.display = 'block';
        return;
    }

    elements.dosenContainer.style.display = 'grid';
    elements.emptyState.style.display = 'none';

    // Sort by number of schedules (descending)
    dosenList.sort((a, b) => b.schedules.length - a.schedules.length);

    const html = dosenList.map(dosen => createDosenCard(dosen)).join('');
    elements.dosenContainer.innerHTML = html;

    // Attach click listeners
    document.querySelectorAll('.dosen-card').forEach(card => {
        card.addEventListener('click', () => {
            const dosenName = card.dataset.dosen;
            showDosenDetail(dosenName);
        });
    });
}

function createDosenCard(dosen) {
    const count = dosen.schedules.length;

    return `
        <div class="dosen-card" data-dosen="${dosen.name}">
            <div class="dosen-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div class="dosen-info">
                <h3 class="dosen-name">${dosen.name}</h3>
                <div class="dosen-stats">
                    <div class="dosen-stat-item">
                        <span class="stat-number">${count}</span>
                        <span class="stat-text">Pengujian</span>
                    </div>
                </div>
            </div>
            <div class="dosen-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
        </div>
    `;
}

// ===================================
// Detail Modal
// ===================================
function showDosenDetail(dosenName) {
    selectedDosen = dosenData[dosenName];
    if (!selectedDosen) return;

    elements.dosenName.textContent = dosenName;

    const html = `
        <div class="detail-summary">
            <p><strong>Total Pengujian:</strong> ${selectedDosen.schedules.length} ujian dalam 30 hari ke depan</p>
        </div>
        
        <div class="schedule-list">
            ${selectedDosen.schedules.map(schedule => createScheduleDetailCard(schedule)).join('')}
        </div>
    `;

    elements.detailContent.innerHTML = html;
    elements.detailModal.classList.add('active');
}

function createScheduleDetailCard(schedule) {
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
            
            <div class="schedule-meta">
                <div class="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${formatDateDisplay(schedule.tanggal)}</span>
                </div>
                <div class="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${schedule.jamMulai} - ${schedule.jamSelesai}</span>
                </div>
            </div>
            
            ${locationHTML}
            
            <div class="role-badge">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
                <span>Berperan sebagai: <strong>${schedule.roleInExam}</strong></span>
            </div>
            
            ${schedule.catatan && schedule.catatan.toLowerCase() !== 'sudah ujian' ? `
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
        </div>
    `;
}

function closeModal() {
    elements.detailModal.classList.remove('active');
    selectedDosen = null;
}

// ===================================
// Statistics
// ===================================
function updateStatistics() {
    const totalDosenCount = Object.keys(dosenData).length;
    const totalPengujianCount = allSchedules.length;

    elements.totalDosen.textContent = totalDosenCount;
    elements.totalPengujian.textContent = totalPengujianCount;
    elements.belumUjian.textContent = totalPengujianCount;
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
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

function showNotification(message, type = 'info') {
    alert(message);
}
