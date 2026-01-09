// status.js - Script untuk halaman Cek Status

// Ganti dengan URL Google Apps Script Anda
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXYrmUQ-zXksxIyu5mzkQfrpZ4RV4sVpB7dh290Up477Xc8tZaczLfazLV9L5MGyHM/exec';

let allSchedules = [];
let sudahJadwalBelumUjian = {}; // Grouped by jenisUjian
let belumAdaJadwal = {}; // Grouped by jenisUjian

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
            renderStatusSections();
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
    sudahJadwalBelumUjian = {};
    belumAdaJadwal = {};

    allSchedules.forEach(schedule => {
        const nama = schedule.namaMahasiswa;
        const jenisUjian = schedule.jenisUjian || 'Tidak Diketahui';
        const hasTanggal = schedule.tanggal && schedule.tanggal.trim() !== '';
        const sudahUjian = schedule.catatan && schedule.catatan.toLowerCase().includes('sudah ujian');

        if (!nama) return;

        // Kategori 1: Sudah ada jadwal (tanggal terisi) tapi belum ujian
        if (hasTanggal && !sudahUjian) {
            if (!sudahJadwalBelumUjian[jenisUjian]) {
                sudahJadwalBelumUjian[jenisUjian] = [];
            }
            sudahJadwalBelumUjian[jenisUjian].push(schedule);
        }

        // Kategori 2: Belum ada jadwal (tanggal kosong)
        if (!hasTanggal) {
            if (!belumAdaJadwal[jenisUjian]) {
                belumAdaJadwal[jenisUjian] = [];
            }
            belumAdaJadwal[jenisUjian].push(schedule);
        }
    });

    // Sort each group by nama mahasiswa
    Object.keys(sudahJadwalBelumUjian).forEach(key => {
        sudahJadwalBelumUjian[key].sort((a, b) => {
            // Sort by date (A-Z / earliest to latest)
            const dateA = a.tanggal ? new Date(a.tanggal) : new Date('9999-12-31');
            const dateB = b.tanggal ? new Date(b.tanggal) : new Date('9999-12-31');

            if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB; // Sort by date ascending
            }

            // If dates are the same, sort by name
            return a.namaMahasiswa.localeCompare(b.namaMahasiswa);
        });
    });

    Object.keys(belumAdaJadwal).forEach(key => {
        // For students without schedules, just sort by name
        belumAdaJadwal[key].sort((a, b) => a.namaMahasiswa.localeCompare(b.namaMahasiswa));
    });
}

/**
 * Update statistics
 */
function updateStatistics() {
    // Count total schedules with dates
    const terjadwal = allSchedules.filter(s => s.tanggal && s.tanggal.trim() !== '').length;

    // Count schedules that are already done
    const sudahUjian = allSchedules.filter(s =>
        s.catatan && s.catatan.toLowerCase().includes('sudah ujian')
    ).length;

    // Count schedules with dates but not done yet
    const belumUjian = Object.values(sudahJadwalBelumUjian).reduce((sum, arr) => sum + arr.length, 0);

    // Count schedules without dates
    const belumJadwal = Object.values(belumAdaJadwal).reduce((sum, arr) => sum + arr.length, 0);

    document.getElementById('totalTerjadwal').textContent = terjadwal;
    document.getElementById('totalBelumUjian').textContent = belumUjian;
    document.getElementById('totalSudahUjian').textContent = sudahUjian;
    document.getElementById('totalBelumJadwal').textContent = belumJadwal;

    // Update section badges
    document.getElementById('badgeBelumUjian').textContent = belumUjian;
    document.getElementById('badgeBelumJadwal').textContent = belumJadwal;
}

/**
 * Render status sections
 */
function renderStatusSections() {
    renderStatusSection('contentBelumUjian', sudahJadwalBelumUjian, 'Semua mahasiswa sudah ujian', 'scheduled');
    renderStatusSection('contentBelumJadwal', belumAdaJadwal, 'Semua mahasiswa sudah terjadwal', 'pending');
}

/**
 * Render a single status section
 */
function renderStatusSection(containerId, groupedData, emptyMessage, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const jenisUjianKeys = Object.keys(groupedData);

    if (jenisUjianKeys.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <h3>${emptyMessage}</h3>
                <p>Tidak ada data untuk ditampilkan.</p>
            </div>
        `;
        return;
    }

    jenisUjianKeys.forEach(jenisUjian => {
        const schedules = groupedData[jenisUjian];
        const groupCard = createGroupCard(jenisUjian, schedules, type);
        container.appendChild(groupCard);
    });
}

/**
 * Create group card for each jenis ujian
 */
function createGroupCard(jenisUjian, schedules, type) {
    const card = document.createElement('div');
    card.className = 'status-group-card collapsed';

    const typeClass = `exam-type-${jenisUjian.toLowerCase()}`;
    const statusClass = type === 'scheduled' ? 'status-scheduled' : 'status-pending';

    let studentsHTML = '';
    schedules.forEach(schedule => {
        const dateInfo = schedule.tanggal ? formatDateIndonesia(schedule.tanggal) : 'Belum dijadwalkan';
        const timeInfo = schedule.jamMulai ? `${schedule.jamMulai}${schedule.jamSelesai ? ' - ' + schedule.jamSelesai : ''}` : '';

        studentsHTML += `
            <div class="student-item ${statusClass}" onclick="event.stopPropagation(); showScheduleDetail(${schedule.rowIndex})">
                <div class="student-info">
                    <div class="student-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div class="student-details">
                        <h4>${schedule.namaMahasiswa}</h4>
                        ${type === 'scheduled' ? `
                            <div class="student-schedule-info">
                                <span class="schedule-date">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    ${dateInfo}
                                </span>
                                ${timeInfo ? `
                                    <span class="schedule-time">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        ${timeInfo}
                                    </span>
                                ` : ''}
                            </div>
                        ` : `
                            <p class="student-pending-text">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                Menunggu jadwal
                            </p>
                        `}
                    </div>
                </div>
                <div class="student-action">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            </div>
        `;
    });

    card.innerHTML = `
        <div class="group-header-clickable">
            <div class="group-title">
                <span class="exam-type-badge ${typeClass}">${jenisUjian}</span>
                <h3>${schedules.length} Mahasiswa</h3>
            </div>
            <div class="toggle-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
        </div>
        <div class="group-students">
            ${studentsHTML}
        </div>
    `;

    // Add click event to toggle collapse
    const header = card.querySelector('.group-header-clickable');
    header.addEventListener('click', function () {
        card.classList.toggle('collapsed');
    });

    return card;
}

/**
 * Show schedule detail in modal
 */
function showScheduleDetail(rowIndex) {
    const schedule = allSchedules.find(s => s.rowIndex === rowIndex);
    if (!schedule) return;

    const modal = document.getElementById('detailModal');
    const titleElement = document.getElementById('modalTitle');
    const contentElement = document.getElementById('detailContent');

    titleElement.textContent = schedule.namaMahasiswa;

    const hasDate = schedule.tanggal && schedule.tanggal.trim() !== '';
    const sudahUjian = schedule.catatan && schedule.catatan.toLowerCase().includes('sudah ujian');

    let detailHTML = `
        <div class="detail-schedule-card">
            <div class="schedule-header">
                <h4>${schedule.jenisUjian || 'Jenis Ujian Tidak Diketahui'}</h4>
                ${hasDate ?
            (sudahUjian ?
                `<span class="schedule-badge schedule-badge-success">Sudah Ujian</span>` :
                `<span class="schedule-badge schedule-badge-scheduled">Terjadwal</span>`
            ) :
            `<span class="schedule-badge schedule-badge-pending">Belum Terjadwal</span>`
        }
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
