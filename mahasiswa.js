// mahasiswa.js - Script untuk halaman Cek Mahasiswa

// Ganti dengan URL Google Apps Script Anda
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXYrmUQ-zXksxIyu5mzkQfrpZ4RV4sVpB7dh290Up477Xc8tZaczLfazLV9L5MGyHM/exec';

let allSchedules = [];
let mahasiswaBelumJadwal = [];
let mahasiswaSudahJadwal = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializePage();
    setupEventListeners();
});

/**
 * Initialize the page
 */
function initializePage() {
    showLoading(true);
    fetchSchedules();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Modal close
    const closeModalBtn = document.getElementById('closeModal');
    const modal = document.getElementById('detailModal');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => closeModal());
    }

    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

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

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    const activeTab = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

/**
 * Fetch schedules from Google Apps Script
 */
async function fetchSchedules() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getSchedules`);
        const result = await response.json();

        if (result.success) {
            allSchedules = result.data || [];
            processSchedules();
            updateStatistics();
            renderMahasiswaLists();
        } else {
            showError('Gagal memuat data: ' + result.message);
        }
    } catch (error) {
        console.error('Error fetching schedules:', error);
        showError('Terjadi kesalahan saat memuat data');
    } finally {
        showLoading(false);
    }
}

/**
 * Process schedules to categorize students
 */
function processSchedules() {
    // Create a map to track unique students
    const mahasiswaMap = new Map();

    allSchedules.forEach(schedule => {
        const nama = schedule.namaMahasiswa;
        if (!nama) return;

        if (!mahasiswaMap.has(nama)) {
            mahasiswaMap.set(nama, {
                nama: nama,
                schedules: []
            });
        }

        mahasiswaMap.get(nama).schedules.push(schedule);
    });

    // Categorize students based on whether they have a date
    mahasiswaBelumJadwal = [];
    mahasiswaSudahJadwal = [];

    mahasiswaMap.forEach((data, nama) => {
        // Check if any schedule has a date
        const hasDate = data.schedules.some(s => s.tanggal && s.tanggal.trim() !== '');

        if (hasDate) {
            mahasiswaSudahJadwal.push(data);
        } else {
            mahasiswaBelumJadwal.push(data);
        }
    });

    // Sort alphabetically
    mahasiswaBelumJadwal.sort((a, b) => a.nama.localeCompare(b.nama));
    mahasiswaSudahJadwal.sort((a, b) => a.nama.localeCompare(b.nama));
}

/**
 * Update statistics
 */
function updateStatistics() {
    const totalMahasiswa = mahasiswaBelumJadwal.length + mahasiswaSudahJadwal.length;

    document.getElementById('totalMahasiswa').textContent = totalMahasiswa;
    document.getElementById('sudahJadwal').textContent = mahasiswaSudahJadwal.length;
    document.getElementById('belumJadwal').textContent = mahasiswaBelumJadwal.length;

    // Update badges
    document.getElementById('badgeBelum').textContent = mahasiswaBelumJadwal.length;
    document.getElementById('badgeSudah').textContent = mahasiswaSudahJadwal.length;
}

/**
 * Handle search functionality
 */
function handleSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
        // Show all mahasiswa if search is empty
        renderMahasiswaLists();
        return;
    }

    // Filter mahasiswa based on search term
    const filteredBelum = mahasiswaBelumJadwal.filter(m =>
        m.nama.toLowerCase().includes(term)
    );
    const filteredSudah = mahasiswaSudahJadwal.filter(m =>
        m.nama.toLowerCase().includes(term)
    );

    // Render filtered lists
    renderMahasiswaList('listBelum', filteredBelum, 'emptyBelum');
    renderMahasiswaList('listSudah', filteredSudah, 'emptySudah');

    // Update tab badges with filtered counts
    document.getElementById('badgeBelum').textContent = filteredBelum.length;
    document.getElementById('badgeSudah').textContent = filteredSudah.length;
}

/**
 * Render mahasiswa lists
 */
function renderMahasiswaLists() {
    renderMahasiswaList('listBelum', mahasiswaBelumJadwal, 'emptyBelum');
    renderMahasiswaList('listSudah', mahasiswaSudahJadwal, 'emptySudah');
}

/**
 * Render a single mahasiswa list
 */
function renderMahasiswaList(containerId, mahasiswaList, emptyStateId) {
    const container = document.getElementById(containerId);
    const emptyState = document.getElementById(emptyStateId);

    if (!container) return;

    container.innerHTML = '';

    if (mahasiswaList.length === 0) {
        container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    mahasiswaList.forEach(mahasiswa => {
        const card = createMahasiswaCard(mahasiswa);
        container.appendChild(card);
    });
}

/**
 * Create mahasiswa card element
 */
function createMahasiswaCard(mahasiswa) {
    const card = document.createElement('div');
    card.className = 'mahasiswa-card';

    const schedulesWithDate = mahasiswa.schedules.filter(s => s.tanggal && s.tanggal.trim() !== '');
    const hasSchedule = schedulesWithDate.length > 0;

    // Get the earliest date if available
    let dateInfo = '';
    if (hasSchedule) {
        const sortedSchedules = schedulesWithDate.sort((a, b) => {
            return new Date(a.tanggal) - new Date(b.tanggal);
        });
        const earliestSchedule = sortedSchedules[0];
        dateInfo = formatDateIndonesia(earliestSchedule.tanggal);
    }

    // Get unique exam types
    const examTypes = [...new Set(mahasiswa.schedules.map(s => s.jenisUjian).filter(Boolean))];
    const examTypesHTML = examTypes.map(type => {
        const typeClass = `exam-type-${type.toLowerCase()}`;
        return `<span class="exam-type-badge ${typeClass}">${type}</span>`;
    }).join('');

    card.innerHTML = `
        <div class="mahasiswa-card-header">
            <div class="mahasiswa-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div class="mahasiswa-info">
                <h3>${mahasiswa.nama}</h3>
                ${hasSchedule ? `
                    <p class="mahasiswa-date">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${dateInfo}
                    </p>
                ` : `
                    <p class="mahasiswa-status-pending">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Belum ada jadwal
                    </p>
                `}
            </div>
        </div>
        <div class="mahasiswa-card-body">
            ${examTypes.length > 0 ? `
                <div class="mahasiswa-exam-types">
                    <span class="exam-types-label">Jenis Ujian:</span>
                    <div class="exam-types-badges">
                        ${examTypesHTML}
                    </div>
                </div>
            ` : ''}
            <div class="mahasiswa-stats">
                <div class="mahasiswa-stat">
                    <span class="stat-label">Total Jadwal</span>
                    <span class="stat-value">${mahasiswa.schedules.length}</span>
                </div>
                ${hasSchedule ? `
                    <div class="mahasiswa-stat">
                        <span class="stat-label">Terjadwal</span>
                        <span class="stat-value stat-value-success">${schedulesWithDate.length}</span>
                    </div>
                ` : ''}
            </div>
        </div>
        <div class="mahasiswa-card-footer">
            <button class="btn-detail" onclick="showMahasiswaDetail('${escapeHtml(mahasiswa.nama)}')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Lihat Detail
            </button>
        </div>
    `;

    return card;
}

/**
 * Show mahasiswa detail in modal
 */
function showMahasiswaDetail(namaMahasiswa) {
    const mahasiswaData = [...mahasiswaBelumJadwal, ...mahasiswaSudahJadwal]
        .find(m => m.nama === namaMahasiswa);

    if (!mahasiswaData) return;

    const modal = document.getElementById('detailModal');
    const nameElement = document.getElementById('mahasiswaName');
    const contentElement = document.getElementById('detailContent');

    nameElement.textContent = mahasiswaData.nama;

    // Sort schedules by date
    const sortedSchedules = mahasiswaData.schedules.sort((a, b) => {
        if (!a.tanggal) return 1;
        if (!b.tanggal) return -1;
        return new Date(a.tanggal) - new Date(b.tanggal);
    });

    let detailHTML = '<div class="detail-schedules">';

    if (sortedSchedules.length === 0) {
        detailHTML += `
            <div class="empty-state">
                <p>Tidak ada data jadwal</p>
            </div>
        `;
    } else {
        sortedSchedules.forEach(schedule => {
            const hasDate = schedule.tanggal && schedule.tanggal.trim() !== '';

            detailHTML += `
                <div class="detail-schedule-card ${!hasDate ? 'schedule-pending' : ''}">
                    <div class="schedule-header">
                        <h4>${schedule.jenisUjian || 'Jenis Ujian Tidak Diketahui'}</h4>
                        ${hasDate ? `
                            <span class="schedule-badge schedule-badge-success">Terjadwal</span>
                        ` : `
                            <span class="schedule-badge schedule-badge-pending">Belum Terjadwal</span>
                        `}
                    </div>
                    <div class="schedule-details">
                        ${hasDate ? `
                            <div class="schedule-detail-item">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span>${formatDateIndonesia(schedule.tanggal)}</span>
                            </div>
                            ${schedule.jamMulai ? `
                                <div class="schedule-detail-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    <span>${schedule.jamMulai}${schedule.jamSelesai ? ' - ' + schedule.jamSelesai : ''}</span>
                                </div>
                            ` : ''}
                            ${schedule.ruangLink ? `
                                <div class="schedule-detail-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    <span>${schedule.ruangLink}</span>
                                </div>
                            ` : ''}
                        ` : `
                            <div class="schedule-detail-item schedule-pending-info">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span>Jadwal belum ditentukan</span>
                            </div>
                        `}
                    </div>
                    ${hasDate ? `
                        <div class="schedule-examiners">
                            <h5>Tim Penguji:</h5>
                            <div class="examiners-list">
                                ${schedule.ketua ? `<div class="examiner-item"><strong>Ketua:</strong> ${schedule.ketua}</div>` : ''}
                                ${schedule.sekretaris ? `<div class="examiner-item"><strong>Sekretaris:</strong> ${schedule.sekretaris}</div>` : ''}
                                ${schedule.anggota1 ? `<div class="examiner-item"><strong>Anggota 1:</strong> ${schedule.anggota1}</div>` : ''}
                                ${schedule.anggota2 ? `<div class="examiner-item"><strong>Anggota 2:</strong> ${schedule.anggota2}</div>` : ''}
                                ${schedule.anggota3 ? `<div class="examiner-item"><strong>Anggota 3:</strong> ${schedule.anggota3}</div>` : ''}
                            </div>
                        </div>
                    ` : ''}
                    ${schedule.catatan ? `
                        <div class="schedule-notes">
                            <strong>Catatan:</strong> ${schedule.catatan}
                        </div>
                    ` : ''}
                </div>
            `;
        });
    }

    detailHTML += '</div>';
    contentElement.innerHTML = detailHTML;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('detailModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Format date to Indonesian format
 */
function formatDateIndonesia(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    return date.toLocaleDateString('id-ID', options);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Show error message
 */
function showError(message) {
    alert(message);
    console.error(message);
}
