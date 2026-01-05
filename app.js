let appData = {
    students: [],
    specialties: [],
    system_users: [],
    certificates: [],
    settings: {
        disableStatusRollback: false
    }
};

/**
 * Toggles the mobile sidebar visibility.
 */
function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    } else {
        sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }
}


// Syncing Logic
async function loadFromServer() {
    try {
        const res = await fetch('/api/data');
        if (res.ok) {
            const data = await res.json();
            appData = { ...appData, ...data };

            // Core Fallback Keys
            if (!appData.students) appData.students = [];
            if (!appData.specialties) appData.specialties = [];
            if (!appData.gifted_applications) appData.gifted_applications = [];
            if (!appData.contests) appData.contests = [];
            if (!appData.settings.contestTitle) appData.settings.contestTitle = "Iqtidorli Bolalar Tanlovi";

            // Sync EVERYTHING to localStorage for offline cache
            localStorage.setItem('app_db_full', JSON.stringify(appData));

            // Legacy individual keys for compatibility
            localStorage.setItem('students', JSON.stringify(appData.students));
            localStorage.setItem('specialties', JSON.stringify(appData.specialties));
            localStorage.setItem('app_settings', JSON.stringify(appData.settings));
        } else {
            throw new Error("Server xatosi: " + res.status);
        }
    } catch (e) {
        console.warn("Serverga ulanib bo'lmadi, lokal xotiradan foydalaniladi.", e);
        const cached = localStorage.getItem('app_db_full');
        if (cached) {
            appData = JSON.parse(cached);
        } else {
            // Very old legacy fallback
            appData.students = JSON.parse(localStorage.getItem('students')) || [];
            appData.specialties = JSON.parse(localStorage.getItem('specialties')) || [];
            appData.settings = JSON.parse(localStorage.getItem('app_settings')) || { disableStatusRollback: false };
        }
    }
}

// Helper to Show/Hide Global Loading
function showLoading(text = "Yuklanmoqda...") {
    document.getElementById('globalLoadingText').innerText = text;
    document.getElementById('globalSpinner').style.display = 'block';
    document.getElementById('globalSuccessIcon').style.display = 'none';
    document.getElementById('globalLoadingOverlay').style.display = 'flex';
}

function hideLoading(successText = null) {
    if (successText) {
        document.getElementById('globalLoadingText').innerText = successText;
        document.getElementById('globalSpinner').style.display = 'none';
        document.getElementById('globalSuccessIcon').style.display = 'block';

        setTimeout(() => {
            document.getElementById('globalLoadingOverlay').style.display = 'none';
        }, 2000);
    } else {
        document.getElementById('globalLoadingOverlay').style.display = 'none';
    }
}

async function saveToServer() {
    try {
        showLoading("Ma'lumotlar saqlanmoqda...");

        // Save to local cache
        localStorage.setItem('app_db_full', JSON.stringify(appData));

        const res = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appData)
        });
        if (!res.ok) {
            throw new Error("Server saqlashni rad etdi");
        }
        console.log("Ma'lumotlar serverga saqlandi.");
        hideLoading("Muvaffaqiyatli saqlandi!");
    } catch (e) {
        console.error("Saqlashda xatolik:", e);
        hideLoading(); // Hide overlay without success message
        if (e.name === 'QuotaExceededError') {
            console.warn("LocalStorage to'lib qoldi, faqat serverga saqlanadi.");
        } else {
            alert("DIQQAT: Ma'lumotlar serverga saqlanmadi! \nServer yoniqligini tekshiring.");
        }
    }
}

// Initial Load handled in Auth logic now

// Switch Tabs
function switchTab(tabId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
    // Deactivate all nav buttons
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    // Show target section
    let sectionId;
    if (tabId === 'dashboard') sectionId = 'dashboard-section';
    else if (tabId === 'list') sectionId = 'list-section';
    else if (tabId === 'settings') sectionId = 'settings-section';
    else if (tabId === 'analysis') sectionId = 'analysis-section';
    else if (tabId === 'exam') sectionId = 'exam-section'; // Reverted
    else if (tabId === 'lesson') sectionId = 'lesson-section'; // New
    else if (tabId === 'student') sectionId = 'student-section'; // New
    else if (tabId === 'updates') sectionId = 'updates-section'; // New
    else if (tabId === 'specialties') sectionId = 'specialties-section'; // New
    else if (tabId === 'users') sectionId = 'users-section'; // New
    else if (tabId === 'gifted') sectionId = 'gifted-section'; // New
    else if (tabId === 'student-gifted-contests') sectionId = 'student-gifted-contests-section'; // New
    else if (tabId === 'student-gifted-apps') sectionId = 'student-gifted-apps-section'; // New
    else if (tabId === 'attendance') sectionId = 'attendance-section';
    else if (tabId === 'student-attendance') sectionId = 'student-attendance-section';
    else if (tabId === 'student-ai') sectionId = 'student-ai-section';
    else sectionId = tabId + '-section';
    document.getElementById(sectionId).classList.add('active');

    const btns = document.querySelectorAll('.nav-btn');
    btns.forEach(btn => btn.classList.remove('active'));

    const dashboardToggle = document.getElementById('nav-dashboard-toggle');
    if (dashboardToggle) dashboardToggle.classList.remove('active');

    const dMenu = document.getElementById('dashboard-submenu');
    const sMenu = document.getElementById('schedules-submenu');

    // Handle Dashboard Submenu
    if (tabId === 'dashboard' || tabId === 'specialties' || tabId === 'users' || tabId === 'gifted') {
        if (dashboardToggle) dashboardToggle.classList.add('active');
        if (dMenu && (dMenu.style.display === 'none' || dMenu.style.display === '')) {
            toggleDashboardMenu();
        }
    } else {
        if (dMenu && dMenu.style.display === 'flex') {
            toggleDashboardMenu();
        }
    }

    // Handle Schedules Submenu
    if (tabId === 'exam' || tabId === 'lesson') {
        if (sMenu && (sMenu.style.display === 'none' || sMenu.style.display === '')) {
            toggleSchedulesMenu();
        }
    } else {
        if (sMenu && sMenu.style.display === 'flex') {
            toggleSchedulesMenu();
        }
    }

    // Handle Student Gifted Submenu
    const gMenu = document.getElementById('student-gifted-submenu');
    if (tabId === 'student-gifted-contests' || tabId === 'student-gifted-apps') {
        const sgToggle = document.getElementById('nav-student-gifted-toggle');
        if (sgToggle) sgToggle.classList.add('active');
        if (gMenu && (gMenu.style.display === 'none' || gMenu.style.display === '')) {
            toggleStudentGiftedMenu();
        }
    } else {
        if (gMenu && gMenu.style.display === 'flex') {
            toggleStudentGiftedMenu();
        }
    }

    if (tabId === 'dashboard') {
        const dBtn = document.getElementById('nav-dashboard');
        if (dBtn) dBtn.classList.add('active');
    }
    else if (tabId === 'list') {
        const lBtn = document.getElementById('nav-list');
        if (lBtn) lBtn.classList.add('active');
    }
    else if (tabId === 'attendance') {
        const atBtn = document.getElementById('nav-attendance');
        if (atBtn) atBtn.classList.add('active');
    }
    else if (tabId === 'updates') {
        const upBtn = document.getElementById('nav-updates');
        if (upBtn) upBtn.classList.add('active');
    }
    else if (tabId === 'settings') {
        const setBtn = document.getElementById('nav-settings');
        if (setBtn) setBtn.classList.add('active');
    }
    else if (tabId === 'specialties') {
        const spBtn = document.getElementById('nav-specialties');
        if (spBtn) spBtn.classList.add('active');
    }
    else if (tabId === 'users') {
        const uBtn = document.getElementById('nav-users');
        if (uBtn) uBtn.classList.add('active');
    }
    else if (tabId === 'gifted') {
        const gBtn = document.getElementById('nav-gifted');
        if (gBtn) gBtn.classList.add('active');
    }
    else if (tabId === 'analysis') {
        const anBtn = document.getElementById('nav-analysis');
        if (anBtn) anBtn.classList.add('active');
    }
    else if (tabId === 'student-attendance') {
        const staBtn = document.getElementById('nav-student-attendance');
        if (staBtn) staBtn.classList.add('active');
    }
    else if (tabId === 'student-ai') {
        const saiBtn = document.getElementById('nav-student-ai');
        if (saiBtn) saiBtn.classList.add('active');
        initStudentAI(); // Initialize AI features
    }

    else if (tabId === 'analysis') {
        const anBtn = document.getElementById('nav-analysis');
        if (anBtn) anBtn.classList.add('active');
    }

    // Student Submenu Buttons
    if (tabId === 'student-gifted-contests') {
        const sgcBtn = document.getElementById('nav-student-contests');
        if (sgcBtn) sgcBtn.classList.add('active');
    }
    if (tabId === 'student-gifted-apps') {
        const sgaBtn = document.getElementById('nav-student-apps');
        if (sgaBtn) sgaBtn.classList.add('active');
    }
    if (tabId === 'exam') {
        const examBtn = document.getElementById('nav-exam');
        if (examBtn) examBtn.classList.add('active');
        document.getElementById('nav-schedules-toggle').classList.add('active');
    }
    if (tabId === 'lesson') {
        const lessonBtn = document.getElementById('nav-lesson');
        if (lessonBtn) lessonBtn.classList.add('active');
        document.getElementById('nav-schedules-toggle').classList.add('active');
    }

    if (tabId === 'list') {
        loadStudents();
    } else if (tabId === 'dashboard') {
        loadDashboard();
        renderSpecialties();
        renderUsers();
    } else if (tabId === 'settings') {
        loadSettings();
    } else if (tabId === 'specialties') {
        renderSpecialties();
    } else if (tabId === 'users') {
        renderUsers();
    } else if (tabId === 'gifted') {
        loadContestsList();
    } else if (tabId === 'student-gifted-contests') {
        loadStudentContestsList();
    } else if (tabId === 'student-gifted-apps') {
        // Yield to render cycle to ensure DOM is ready
        setTimeout(loadStudentApplications, 50);
    } else if (tabId === 'analysis') {
        // Analysis view
    } else if (tabId === 'exam') {
        // Exam view
    } else if (tabId === 'lesson') {
        // Lesson view
    } else if (tabId === 'student') {
        loadStudentPortal();
        loadNotifications();
    } else if (tabId === 'updates') {
        loadUpdates();
    } else if (tabId === 'attendance') {
        loadAdminCertificates();
    } else if (tabId === 'student-attendance') {
        loadStudentCertificates();
    }
    localStorage.setItem('activeTab', tabId);
}

function toggleDashboardMenu() {
    const subMenu = document.getElementById('dashboard-submenu');
    const toggleBtn = document.getElementById('nav-dashboard-toggle');
    const icon = toggleBtn.querySelector('.fa-chevron-down, .fa-chevron-up');

    if (subMenu.style.display === 'none' || subMenu.style.display === '') {
        subMenu.style.display = 'flex';
        subMenu.style.flexDirection = 'column';
        if (icon) icon.className = 'fas fa-chevron-up';
    } else {
        subMenu.style.display = 'none';
        if (icon) icon.className = 'fas fa-chevron-down';
    }
}

function toggleQueueMenu() {
    const subMenu = document.getElementById('queue-submenu');
    const toggleBtn = document.getElementById('nav-queue-toggle');
    const icon = toggleBtn.querySelector('.fa-chevron-down, .fa-chevron-up');

    if (subMenu.style.display === 'none' || subMenu.style.display === '') {
        subMenu.style.display = 'flex';
        subMenu.style.flexDirection = 'column';
        if (icon) icon.className = 'fas fa-chevron-up';
    } else {
        subMenu.style.display = 'none';
        if (icon) icon.className = 'fas fa-chevron-down';
    }
}


function toggleSchedulesMenu() {
    const subMenu = document.getElementById('schedules-submenu');
    const toggleBtn = document.getElementById('nav-schedules-toggle');
    const icon = toggleBtn.querySelector('.fa-chevron-down, .fa-chevron-up');

    if (subMenu.style.display === 'none' || subMenu.style.display === '') {
        subMenu.style.display = 'flex';
        if (icon) icon.className = 'fas fa-chevron-up';
    } else {
        subMenu.style.display = 'none';
        if (icon) icon.className = 'fas fa-chevron-down';
    }
}

function toggleStudentGiftedMenu() {
    const subMenu = document.getElementById('student-gifted-submenu');
    const toggleBtn = document.getElementById('nav-student-gifted-toggle');
    const icon = toggleBtn.querySelector('.fa-chevron-down, .fa-chevron-up');

    if (subMenu.style.display === 'none' || subMenu.style.display === '') {
        subMenu.style.display = 'flex';
        subMenu.style.flexDirection = 'column';
        if (icon) icon.className = 'fas fa-chevron-up';
    } else {
        subMenu.style.display = 'none';
        if (icon) icon.className = 'fas fa-chevron-down';
    }
}

// REMOVED: switchScheduleSubTab(subTab) - No longer used with sidebar accordion


// Modal Functions
function openModal() {
    const modal = document.getElementById('studentModal');
    const form = document.getElementById('studentForm');

    if (form) form.reset();
    document.getElementById('studentId').value = '';

    // Reset Checkboxes explicitly (though form.reset does it, good for clarity if we change defaults)
    document.getElementById('status_passport').checked = false;
    document.getElementById('status_diplom').checked = false;
    document.getElementById('status_ilova').checked = false;
    document.getElementById('status_imtiyoz').checked = false;

    const title = document.getElementById('modalTitle');
    if (title) title.innerHTML = '<i class="fas fa-user-plus"></i> Yangi Talaba Kiritish';

    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.error("Modal element not found!");
    }
}

function closeModal() {
    const modal = document.getElementById('studentModal');
    if (modal) modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('studentModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Load Dashboard Stats
function loadDashboard() {
    const students = appData.students;
    document.getElementById('totalStudents').innerText = students.length;

    // Count logic: Check if file exists OR manual status is true
    const diplomCount = students.filter(s => (s.diplom && s.diplom.length > 0) || s.status_diplom === true).length;
    const ilovaCount = students.filter(s => (s.ilova && s.ilova.length > 0) || s.status_ilova === true).length;
    const imtiyozCount = students.filter(s => (s.imtiyoz && s.imtiyoz.length > 0) || s.status_imtiyoz === true).length;

    document.getElementById('totalDiplom').innerText = diplomCount;
    document.getElementById('totalIlova').innerText = ilovaCount;
    document.getElementById('totalImtiyoz').innerText = imtiyozCount;
}

// Helper to convert file to Base64
const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

// Helper to compress image
function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.7) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            // Not an image (e.g. PDF), just return base64
            getBase64(file).then(resolve).catch(reject);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// Save Student
async function saveStudent(event) {
    event.preventDefault();

    try {
        const studentId = document.getElementById('studentId').value;
        const passportFile = document.getElementById('passport').files[0];
        const diplomFile = document.getElementById('diplom').files[0];
        const ilovaFile = document.getElementById('ilova').files[0];
        const imtiyozFile = document.getElementById('imtiyoz').files[0];

        // Get Checkbox Values
        const statusPassportCb = document.getElementById('status_passport').checked;
        const statusDiplomCb = document.getElementById('status_diplom').checked;
        const statusIlovaCb = document.getElementById('status_ilova').checked;
        const statusImtiyozCb = document.getElementById('status_imtiyoz').checked;

        const [passportBase64, diplomBase64, ilovaBase64, imtiyozBase64] = await Promise.all([
            getBase64(passportFile),
            getBase64(diplomFile),
            getBase64(ilovaFile),
            getBase64(imtiyozFile)
        ]);

        if (studentId) {
            // EDIT MODE
            const index = appData.students.findIndex(s => s.id == studentId);
            if (index > -1) {
                appData.students[index].fio = document.getElementById('fio').value;
                appData.students[index].student_id = document.getElementById('student_id_val').value;
                appData.students[index].passport_serial = document.getElementById('passport_serial').value;
                appData.students[index].year = document.getElementById('year').value;
                appData.students[index].specialty = document.getElementById('specialtySelect').value;

                if (passportBase64) appData.students[index].passport = passportBase64;
                if (diplomBase64) appData.students[index].diplom = diplomBase64;
                if (ilovaBase64) appData.students[index].ilova = ilovaBase64;
                if (imtiyozBase64) appData.students[index].imtiyoz = imtiyozBase64;

                appData.students[index].status_passport = statusPassportCb;
                appData.students[index].status_diplom = statusDiplomCb;
                appData.students[index].status_ilova = statusIlovaCb;
                appData.students[index].status_imtiyoz = statusImtiyozCb;
            }
        } else {
            // CREATE MODE
            const student = {
                id: Date.now(),
                fio: document.getElementById('fio').value,
                student_id: document.getElementById('student_id_val').value,
                passport_serial: document.getElementById('passport_serial').value,
                specialty: document.getElementById('specialtySelect').value,
                year: document.getElementById('year').value,
                passport: passportBase64 || "",
                diplom: diplomBase64 || "",
                ilova: ilovaBase64 || "",
                imtiyoz: imtiyozBase64 || "",
                status_passport: statusPassportCb,
                status_diplom: statusDiplomCb,
                status_ilova: statusIlovaCb,
                status_imtiyoz: statusImtiyozCb
            };
            appData.students.push(student);
        }

        await saveToServer();

        event.target.reset();
        document.getElementById('studentId').value = '';
        // Reset checkboxes visual state (actually reset() does this, but good to ensure)

        alert(studentId ? "Ma'lumot yangilandi!" : "Talaba qo'shildi!");

        closeModal();
        loadStudents();


    } catch (error) {
        console.error("Xatolik:", error);
        alert("Xatolik yuz berdi");
    }
}

// Helper to render image link
// Helper to render image link or status toggle
function renderDocCell(data, studentId, type) {
    // If file exists (Base64), show View button
    if (data && data.startsWith('data:image')) {
        return `<button class="view-btn" onclick="viewImage('${data}')"><i class="fas fa-image"></i> Ko'rish</button>`;
    }

    // Check manual status (passed as data if it's not a file string, or we need to access student obj)
    // Actually, simple way: loadStudents passes `s.diplom` etc. 
    // We need to change loadStudents to pass the whole student or handle logic there.
    // Let's change loadStudents to call this with student object properties.

    // BUT specific to this function signature change request:
    // We will change loadStudents to pass (s.diplom, s.id, 'diplom') etc.
    // data arg here might be the file string OR the manual status boolean if we structurally change it, 
    // but the task says "update data model".
    // Let's assume we store manual status in a separate field like `s.status_diplom`.

    // Refactored approach: logic inside loadStudents is easier, but helper is cleaner if arguments are right.
    // We will assume loadStudents calls: renderDocCell(s.diplom, s.status_diplom, s.id, 'diplom')
    return ''; // Placeholder, see loadStudents update
}

function renderDocCellWithStatus(fileData, manualStatus, id, type, isViewer = false) {
    const hasFile = fileData && fileData.length > 10;
    const isAccepted = manualStatus === true;

    let statusHtml = '';
    let fileHtml = '';

    // 1. Status Button (Department Acceptance)
    const clickAction = isViewer ? '' : `toggleDocStatus('${id}', '${type}')`;
    const cursorStyle = isViewer ? 'opacity: 0.7; cursor: default;' : 'cursor: pointer;';

    if (isAccepted) {
        statusHtml = `<button class="status-btn yes" style="${cursorStyle}" onclick="${clickAction}"><i class="fas fa-check"></i> Topshirgan</button>`;
    } else if (hasFile) {
        statusHtml = `<button class="status-btn" style="${cursorStyle} background:#e0f2fe; color:#0369a1; border-color:#bae6fd;" onclick="${clickAction}"><i class="fas fa-history"></i> Tekshirilmoqda</button>`;
    } else {
        statusHtml = `<button class="status-btn no" style="${cursorStyle}" onclick="${clickAction}"><i class="fas fa-times"></i> Topshirmagan</button>`;
    }

    // 2. File Button (Always clickable if file exists, even for viewer)
    if (hasFile) {
        fileHtml = `<button class="view-btn" onclick="viewImage('${fileData}')"><i class="fas fa-eye"></i> Fayl bor</button>`;
    } else {
        fileHtml = `<span class="no-file-badge"><i class="fas fa-ban"></i> Fayl yo'q</span>`;
    }

    return `<div class="cell-actions">${statusHtml}${fileHtml}</div>`;
}

// Load Students into Table
function loadStudents() {
    const students = appData.students;

    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return; // Safety check
    tbody.innerHTML = '';

    // Populate Year Filter
    const yearSelect = document.getElementById('yearFilter');
    const currentFilter = yearSelect.value; // Remember selection

    // Get unique years and sort them
    const years = [...new Set(students.map(s => s.year))].sort().filter(y => y);

    // Reset options but keep "Barcha Yillar"
    yearSelect.innerHTML = '<option value="">Barcha Yillar</option>';

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // Restore selection if possible, otherwise reset
    if (years.includes(currentFilter)) {
        yearSelect.value = currentFilter;
    }

    // Load Specialty Filter Options
    loadSpecialtiesDropdowns();

    // Check Role
    const currentRole = sessionStorage.getItem('currentRole') || 'user';
    const isViewer = currentRole === 'user';

    students.forEach((s, index) => {
        // Calculate total approved attendance days for the main list
        const studentApprovedCerts = (appData.certificates || []).filter(cert =>
            cert.studentId == s.id && cert.status === 'approved'
        );
        const totalApprovedDays = studentApprovedCerts.reduce((sum, cert) => sum + cert.days, 0);
        const attendanceLabel = totalApprovedDays > 0 ? ` <span style="color:#10b981; font-weight:normal; font-size:12px;">(${totalApprovedDays} kun)</span>` : '';

        const row = document.createElement('tr');
        row.setAttribute('data-specialty', s.specialty || "");

        // Overall Status Calculation
        const isPassport = (s.passport && s.passport.length > 10) || s.status_passport === true;
        const isDiplom = (s.diplom && s.diplom.length > 10) || s.status_diplom === true;
        const isIlova = (s.ilova && s.ilova.length > 10) || s.status_ilova === true;

        const isComplete = isPassport && isDiplom && isIlova;
        const statusBadge = isComplete ?
            `<span class="badge" style="background:#dcfce7; color:#15803d; font-size:11px; padding:3px 8px;">To'liq</span>` :
            `<span class="badge" style="background:#fee2e2; color:#991b1b; font-size:11px; padding:3px 8px;">Chala</span>`;

        // Viewer cannot see Edit/Delete
        const actionButtons = isViewer ?
            `<span style="color:#94a3b8; font-size:12px;">Ruxsat yo'q</span>` :
            `<button class="action-btn" onclick="editStudent('${s.id}')" title="Tahrirlash" style="color: var(--primary-color);">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" onclick="deleteStudent('${s.id}')" title="O'chirish">
                <i class="fas fa-trash-alt"></i>
            </button>`;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td style="font-weight: 500;">${s.fio}${attendanceLabel}</td>
            <td style="font-family: monospace; color: #64748b; font-size: 13px;">${s.student_id || '-'}</td>
            <td style="font-family: monospace; color: #64748b; font-size: 13px;">${s.passport_serial || '-'}</td>
            <td>${s.specialty || '-'}</td>
            <td>${s.year}</td>
            <td>${statusBadge}</td>
            <td>${renderDocCellWithStatus(s.passport, s.status_passport, s.id, 'passport', isViewer)}</td>
            <td>${renderDocCellWithStatus(s.diplom, s.status_diplom, s.id, 'diplom', isViewer)}</td>
            <td>${renderDocCellWithStatus(s.ilova, s.status_ilova, s.id, 'ilova', isViewer)}</td>
            <td>${renderDocCellWithStatus(s.imtiyoz, s.status_imtiyoz, s.id, 'imtiyoz', isViewer)}</td>
            <td>${actionButtons}</td>
        `;
        tbody.appendChild(row);
    });
}

// Toggle Document Status
async function toggleDocStatus(id, type) {
    const index = appData.students.findIndex(s => s.id == id);
    const currentRole = sessionStorage.getItem('currentRole') || 'user';

    if (index > -1) {
        const field = `status_${type}`;
        const currentVal = appData.students[index][field];

        // Check restriction: If rollback is disabled AND current status is TRUE AND user is not admin
        if (appData.settings?.disableStatusRollback && currentVal === true && currentRole !== 'admin') {
            alert("Topshirilgan holatni qaytarish cheklangan (Admin bilan bog'laning).");
            return;
        }

        appData.students[index][field] = !currentVal;

        await saveToServer();
        loadStudents();
    }
}

// Edit Student
function editStudent(id) {
    const student = appData.students.find(s => s.id == id);

    if (student) {
        document.getElementById('studentId').value = student.id;
        document.getElementById('fio').value = student.fio;
        document.getElementById('student_id_val').value = student.student_id || "";
        document.getElementById('passport_serial').value = student.passport_serial || "";

        loadSpecialtiesDropdowns(); // Ensure options exist
        document.getElementById('specialtySelect').value = student.specialty || "";

        document.getElementById('year').value = student.year;

        // Populate Checkboxes
        document.getElementById('status_passport').checked = student.status_passport === true;
        document.getElementById('status_diplom').checked = student.status_diplom === true;
        document.getElementById('status_ilova').checked = student.status_ilova === true;
        document.getElementById('status_imtiyoz').checked = student.status_imtiyoz === true;

        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Talabani Tahrirlash';
        document.getElementById('studentModal').style.display = 'flex';
    }
}

// View Image Modal (Simple implementation)
function viewImage(src) {
    const win = window.open();
    win.document.write(`<img src="${src}" style="max-width:100%; height:auto;">`);
}

// Download File Helper
function downloadFile(src, filename) {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename || 'fayl';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Download Multiple Files as PDF (Advanced merge using pdf-lib)
async function downloadCertAsPdf(files, filename, status = 'pending') {
    showLoading("PDF tayyorlanmoqda...");
    try {
        const lib = window.PDFLib;
        if (!lib) {
            alert("PDF kutubxonasi yuklanmagan. Iltimos, sahifani yangilang.");
            hideLoading();
            return;
        }

        const { PDFDocument, rgb, StandardFonts, degrees } = lib;
        const mergedPdf = await PDFDocument.create();

        const validFiles = (Array.isArray(files) ? files : [files]).filter(f => f && typeof f === 'string');

        if (validFiles.length === 0) {
            alert("Hujjat fayllari topilmadi.");
            hideLoading();
            return;
        }

        const isApproved = status === 'approved';
        const isRejected = status === 'rejected';

        let sealText = '';
        let sealColor = rgb(0.31, 0.27, 0.9); // Default Indigo
        if (isApproved) sealText = 'REGISTRATOR OFISI TASDIQLADI';
        if (isRejected) {
            sealText = 'RAD ETILDI';
            sealColor = rgb(0.94, 0.27, 0.27); // #ef4444
        }

        const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

        for (const file of validFiles) {
            try {
                let targetPage = null;
                if (file.startsWith('data:image/')) {
                    const imgBytes = await fetch(file).then(res => res.arrayBuffer());
                    let image;
                    if (file.includes('png')) {
                        image = await mergedPdf.embedPng(imgBytes);
                    } else {
                        image = await mergedPdf.embedJpg(imgBytes);
                    }

                    const page = mergedPdf.addPage([image.width, image.height]);
                    page.drawImage(image, {
                        x: 0,
                        y: 0,
                        width: image.width,
                        height: image.height,
                    });
                    targetPage = page;
                } else if (file.startsWith('data:application/pdf')) {
                    const pdfBytes = await fetch(file).then(res => res.arrayBuffer());
                    const srcPdf = await PDFDocument.load(pdfBytes);
                    const pagesToCopy = srcPdf.getPageIndices();
                    const copiedPages = await mergedPdf.copyPages(srcPdf, pagesToCopy);

                    copiedPages.forEach((page, idx) => {
                        const newPage = mergedPdf.addPage(page);
                        if (idx === 0) targetPage = newPage;
                    });
                }

                if (sealText && targetPage) {
                    const { width, height } = targetPage.getSize();
                    const textSize = Math.min(width / 20, 20);
                    const textWidth = font.widthOfTextAtSize(sealText, textSize);

                    const x = width - textWidth - 50;
                    const y = height - 60;

                    targetPage.drawRectangle({
                        x: x - 10,
                        y: y - 10,
                        width: textWidth + 20,
                        height: textSize + 20,
                        borderColor: sealColor,
                        borderWidth: 3,
                        rotate: degrees ? degrees(-10) : 0,
                        opacity: 0.8
                    });

                    targetPage.drawText(sealText, {
                        x: x,
                        y: y,
                        size: textSize,
                        font: font,
                        color: sealColor,
                        rotate: degrees ? degrees(-10) : 0,
                        opacity: 0.9
                    });
                }
            } catch (fileErr) {
                console.warn("Faylni PDFga qo'shishda xatolik:", fileErr);
            }
        }

        if (mergedPdf.getPageCount() === 0) {
            throw new Error("PDF sahifalari bo'sh");
        }

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const safeFilename = filename.toString().replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = safeFilename + ".pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        hideLoading("PDF muvaffaqiyatli yuklandi!");
    } catch (err) {
        console.error("PDF yaratishda xatolik:", err);
        hideLoading();
        alert("Xatolik: PDF faylini tayyorlashda muammo yuz berdi. Iltimos, fayl o'lchami yoki formatini tekshiring.");
    }
}

// Helper to view cert by ID (prevents passing huge strings in HTML)
function viewCert(id) {
    const cert = (appData.certificates || []).find(c => c.id == id);
    if (!cert) return alert("Hujjat topilmadi.");
    viewCertFiles(cert.files || [cert.file], cert.status);
}

// Helper to download cert by ID
function downloadCert(id) {
    const cert = (appData.certificates || []).find(c => c.id == id);
    if (!cert) return alert("Hujjat topilmadi.");

    const student = (appData.students || []).find(s => s.id == cert.studentId);
    const name = student ? student.fio : 'malumotnoma';
    const filename = `${name.replace(/\s+/g, '_')}_${cert.id}`;

    downloadCertAsPdf(cert.files || [cert.file], filename, cert.status);
}

// View Multiple Files
function viewCertFiles(files, status = 'pending') {
    if (!files) return;
    const validFiles = (Array.isArray(files) ? files : [files]).filter(f => f && typeof f === 'string');
    if (validFiles.length === 0) {
        alert("Hujjat fayllari topilmadi.");
        return;
    }

    const isApproved = status === 'approved';
    const isRejected = status === 'rejected';

    let sealText = '';
    let sealColor = '#4f46e5'; // Indigo
    let shadowColor = 'rgba(79,70,229,0.3)';

    if (isApproved) sealText = 'REGISTRATOR OFISI TASDIQLADI';
    if (isRejected) {
        sealText = 'RAD ETILDI';
        sealColor = '#ef4444'; // Red
        shadowColor = 'rgba(239,68,68,0.3)';
    }

    const win = window.open();
    if (!win) return alert("Iltimos, brauzeringizga oyna ochishga ruxsat bering (Pop-ups blocked).");

    let content = `<html><head><title>Hujjatlarni ko'rish</title><style>
        body{text-align:center; background:#f3f4f6; margin:0; padding:20px; font-family:sans-serif;} 
        .container { position: relative; display: inline-block; margin-bottom: 20px; background:white; padding:10px; border-radius:12px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);}
        img{max-width:100%; border-radius:8px;} 
        iframe{width:90vw; height:85vh; border: none; border-radius:8px;}
        .seal {
            position: absolute;
            top: 25px;
            right: 25px;
            border: 5px solid ${sealColor};
            color: ${sealColor};
            padding: 12px 24px;
            font-family: 'Arial Black', sans-serif;
            font-size: 28px;
            text-transform: uppercase;
            transform: rotate(-12deg);
            background: rgba(255,255,255,0.9);
            border-radius: 12px;
            z-index: 1000;
            pointer-events: none;
            box-shadow: 0 0 15px ${shadowColor};
            user-select: none;
        }
    </style></head><body>`;

    validFiles.forEach(f => {
        let blobUrl = f;
        try {
            if (f.startsWith('data:')) {
                const parts = f.split(',');
                const mime = parts[0].match(/:(.*?);/)[1];
                const bstr = atob(parts[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) u8arr[n] = bstr.charCodeAt(n);
                const blob = new Blob([u8arr], { type: mime });
                blobUrl = URL.createObjectURL(blob);
            }
        } catch (e) { console.error("Blob yaratishda xatolik:", e); }

        content += `<div class="container">`;
        if (sealText) {
            content += `<div class="seal">${sealText}</div>`;
        }
        if (f.startsWith('data:image/')) {
            content += `<img src="${blobUrl}">`;
        } else if (f.startsWith('data:application/pdf')) {
            content += `<iframe src="${blobUrl}"></iframe>`;
        }
        content += `</div><br>`;
    });

    content += `</body></html>`;
    win.document.write(content);
    win.document.close();
}

// Delete Student
async function deleteStudent(id) {
    if (confirm("Rostdan ham bu talabani o'chirmoqchimisiz?")) {
        appData.students = appData.students.filter(s => s.id !== id);
        await saveToServer();
        loadStudents();
    }
}

// Search and Filter Table
function filterTable() {
    const searchInput = document.getElementById('searchInput');
    const yearFilter = document.getElementById('yearFilter');
    const specialtyFilter = document.getElementById('specialtyFilter');
    const statusFilter = document.getElementById('statusFilter');

    const searchText = searchInput.value.toLowerCase();
    const selectedYear = yearFilter.value;
    const selectedSpecialty = specialtyFilter ? specialtyFilter.value : "";
    const selectedStatus = statusFilter ? statusFilter.value : "";

    const table = document.querySelector('.data-table');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        const nameTd = tr[i].getElementsByTagName('td')[1]; // FIO
        const specialtyTd = tr[i].getElementsByTagName('td')[4]; // Specialty
        const yearTd = tr[i].getElementsByTagName('td')[5]; // Year
        const statusTd = tr[i].getElementsByTagName('td')[6]; // Overall Status (Badge)

        if (nameTd && yearTd && statusTd) {
            const nameValue = nameTd.textContent || nameTd.innerText;
            const specialtyValue = specialtyTd ? (specialtyTd.textContent || specialtyTd.innerText) : "";
            const yearValue = yearTd.textContent || yearTd.innerText;
            const statusValue = statusTd.textContent || statusTd.innerText;

            const matchesSearch = nameValue.toLowerCase().indexOf(searchText) > -1;
            const matchesYear = selectedYear === "" || yearValue === selectedYear;
            const matchesSpec = selectedSpecialty === "" || specialtyValue === selectedSpecialty;
            const matchesStatus = selectedStatus === "" || statusValue === selectedStatus;

            if (matchesSearch && matchesYear && matchesSpec && matchesStatus) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// Excel Import Logic
function triggerExcelImport() {
    document.getElementById('excelInput').click();
}

async function importExcel(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Assume data is in the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const headers = rows[0].map(h => h ? h.toString().trim() : '');
            const dataRows = rows.slice(1);
            let newStudentsList = [];

            // Smart Header Mapping
            const findIdx = (terms) => headers.findIndex(h => terms.some(t => h.toLowerCase().includes(t.toLowerCase())));

            const fioIdx = findIdx(['f.i.o', 'fio', 'ism', 'to\'liq ismi', 'f.i.sh']);
            const idIdx = findIdx(['id', 'kod', 'talaba id']);
            const passportIdx = findIdx(['pasport', 'passport', 'seriya']);
            const yearIdx = findIdx(['yil', 'kurs', 'qabul']);
            const specIdx = findIdx(['yo\'nalish', 'mutaxassis', 'specialty']);

            dataRows.forEach((row) => {
                const name = fioIdx !== -1 ? row[fioIdx] : row[0];
                if (name && name.toString().trim().length > 0) {
                    newStudentsList.push({
                        id: Date.now() + Math.random(),
                        fio: name.toString().trim(),
                        student_id: idIdx !== -1 ? row[idIdx]?.toString().trim() : "",
                        passport_serial: passportIdx !== -1 ? row[passportIdx]?.toString().trim() : "",
                        year: yearIdx !== -1 ? row[yearIdx]?.toString().trim() : "",
                        specialty: specIdx !== -1 ? row[specIdx]?.toString().trim() : "",
                        diplom: "", ilova: "", imtiyoz: "", passport: ""
                    });
                }
            });

            if (newStudentsList.length > 0) {
                appData.students = [...appData.students, ...newStudentsList];
                await saveToServer();
                alert(`${newStudentsList.length} ta talaba muvaffaqiyatli yuklandi!`);
                switchTab('list');
            } else {
                alert("Ma'lumot topilmadi.");
            }

        } catch (error) {
            console.error("Excel xatoligi:", error);
            alert("Excel faylni o'qishda xatolik bo'ldi.");
        }

        // Reset input to allow selecting same file again
        input.value = '';
    };

    reader.readAsArrayBuffer(file);
}

// Export to Excel
function exportStudentList() {
    const students = appData.students;

    if (students.length === 0) {
        alert("Ro'yxat bo'sh, yuklash uchun ma'lumot yo'q.");
        return;
    }

    // Prepare data for Excel
    // Prepare data for Excel
    const dataToExport = students.map(s => {
        const getStatus = (fileStr, manualBool) => {
            if (fileStr && fileStr.length > 0) return "Mavjud";
            if (manualBool === true) return "Qabul qilingan";
            return "Yo'q";
        };

        // Overall Status Calculation
        const isPassport = (s.passport && s.passport.length > 10) || s.status_passport === true;
        const isDiplom = (s.diplom && s.diplom.length > 10) || s.status_diplom === true;
        const isIlova = (s.ilova && s.ilova.length > 10) || s.status_ilova === true;
        const isComplete = isPassport && isDiplom && isIlova;

        return {
            "F.I.O": s.fio,
            "Talaba ID": s.student_id || "",
            "Pasport Ma'lumoti": s.passport_serial || "",
            "Yo'nalish": s.specialty || "",
            "Qabul Yili": s.year,
            "Hujjatlar Holati": isComplete ? "To'liq" : "Chala",
            "Pasport (Fayl)": getStatus(s.passport, s.status_passport),
            "Diplom (Fayl)": getStatus(s.diplom, s.status_diplom),
            "Ilova (Fayl)": getStatus(s.ilova, s.status_ilova),
            "Imtiyoz (Fayl)": getStatus(s.imtiyoz, s.status_imtiyoz)
        };
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Auto-width for columns
    const wscols = [
        { wch: 40 }, // FIO
        { wch: 15 }, // Year
        { wch: 20 }, // Pasport
        { wch: 20 }, // Diplom
        { wch: 20 }, // Ilova
        { wch: 20 }  // Imtiyoz
    ];
    ws['!cols'] = wscols;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Talabalar");

    // Generate file
    XLSX.writeFile(wb, "Talabalar_Royxati.xlsx");
}

// Backup System
function downloadBackup() {
    const students = JSON.stringify(appData.students);
    if (!students) {
        alert("Saqlash uchun ma'lumot yo'q.");
        return;
    }

    const blob = new Blob([students], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    // Format date: YYYY-MM-DD
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `talabalar_baza_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function restoreBackup(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const json = e.target.result;
            const data = JSON.parse(json);

            if (Array.isArray(data)) {
                if (confirm("Diqqat! Joriy ma'lumotlar o'chib ketadi va fayldagi ma'lumotlar bilan almashinadi. Rozimisiz?")) {
                    appData.students = data;
                    await saveToServer();
                    loadStudents();
                    location.reload();
                    alert("Baza muvaffaqiyatli tiklandi!");
                }
            } else {
                alert("Fayl formati noto'g'ri. Bu baza fayli emas.");
            }
        } catch (error) {
            console.error("Backup error:", error);
            alert("Faylni o'qishda xatolik. Fayl shikastlangan bo'lishi mumkin.");
        }
        input.value = ''; // Reset
    };
    reader.readAsText(file);
}

// --- SPECIALTY MANAGEMENT ---
function renderSpecialties() {
    const specialties = appData.specialties;
    const containers = ['secSpecialtyTableBody'];

    containers.forEach(id => {
        const tbody = document.getElementById(id);
        if (!tbody) return;

        tbody.innerHTML = '';
        if (specialties.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; color:#888;">Hozircha yo\'nalishlar yo\'q</td></tr>';
        } else {
            specialties.forEach((spec, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${spec}</td>
                    <td>
                        <button class="action-btn delete" onclick="deleteSpecialty(${index})"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    });

    loadSpecialtiesDropdowns();
}

function loadSettings() {
    if (!appData.settings) appData.settings = { disableStatusRollback: false };
    const toggle = document.getElementById('rollbackToggle');
    if (toggle) {
        toggle.checked = appData.settings.disableStatusRollback === true;
    }
}

async function updateSystemSetting(key, value) {
    if (!appData.settings) appData.settings = {};
    appData.settings[key] = value;
    await saveToServer();
}

async function addSpecialty(source) {
    const inputId = source === 'dash' ? 'dashSpecialtyInput' : 'secSpecialtyInput';
    const input = document.getElementById(inputId);
    const val = input.value.trim();
    if (!val) return;

    if (!appData.specialties.includes(val)) {
        appData.specialties.push(val);
        await saveToServer();
        renderSpecialties();
        input.value = '';
    } else {
        alert("Bu yo'nalish allaqachon mavjud!");
    }
}

async function deleteSpecialty(index) {
    if (confirm("O'chirilsinmi?")) {
        appData.specialties.splice(index, 1);
        await saveToServer();
        renderSpecialties();
    }
}

function loadSpecialtiesDropdowns() {
    const specialties = appData.specialties;

    // Modal Dropdown
    const modalSelect = document.getElementById('specialtySelect');
    if (modalSelect) {
        // Save current value if rewriting (not relevant usually as we call on open, but good practice)
        modalSelect.innerHTML = '<option value="">Tanlang...</option>';
        specialties.forEach(spec => {
            const opt = document.createElement('option');
            opt.value = spec;
            opt.textContent = spec;
            modalSelect.appendChild(opt);
        });

        // If no specialties, make it not required so it doesn't block saves
        if (specialties.length === 0) {
            modalSelect.removeAttribute('required');
        } else {
            modalSelect.setAttribute('required', 'required');
        }
    }

    // Filter Dropdown
    const filterSelect = document.getElementById('specialtyFilter');
    if (filterSelect) {
        const current = filterSelect.value;
        filterSelect.innerHTML = '<option value="">Barcha Yo\'nalishlar</option>';
        specialties.forEach(spec => {
            const opt = document.createElement('option');
            opt.value = spec;
            opt.textContent = spec;
            filterSelect.appendChild(opt);
        });
        filterSelect.value = current;
    }
}

// --- AUTH SYSTEM ---

// Check login on load
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch data from server first
    await loadFromServer();

    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    let role = sessionStorage.getItem('currentRole');
    const name = sessionStorage.getItem('currentUser') || 'Foydalanuvchi';

    // Fix for legacy sessions or fresh updates:
    // If logged in as Administrator but role is missing/wrong, force admin
    if (isLoggedIn && name === 'Administrator' && (!role || role === 'user')) {
        role = 'admin';
        sessionStorage.setItem('currentRole', 'admin');
    }

    // Default fallback
    if (!role) role = 'user';

    if (!isLoggedIn) {
        document.getElementById('loginOverlay').style.display = 'flex';
    } else {
        document.getElementById('loginOverlay').style.display = 'none';

        const profileName = document.getElementById('userProfileName');
        if (profileName) profileName.innerText = `${name} (${role.toUpperCase()})`;

        applyPermissions(role);
        checkAdminVisibility();

        const savedTab = localStorage.getItem('activeTab');
        if (savedTab) {
            switchTab(savedTab);
        } else {
            if (role === 'student') switchTab('student');
            else switchTab('dashboard');
        }
    }
});

function handleLogin(event) {
    event.preventDefault();
    const userIn = document.getElementById('loginUser').value.trim();
    const passIn = document.getElementById('loginPass').value.trim();
    const errorMsg = document.getElementById('loginError');

    // Default Admin
    if (userIn === 'admin' && passIn === '123') {
        loginSuccess('Administrator', 'admin');
        return;
    }

    // Check stored users
    const users = appData.system_users;
    const found = users.find(u => u.username === userIn && u.password === passIn);

    if (found) {
        loginSuccess(found.fullname, found.role || 'operator'); // Default old users to operator
    } else {
        // Try Student Login: Smart detection
        const studentFound = appData.students.find(s => {
            const login = userIn.toLowerCase().trim();
            const pass = passIn.toLowerCase().trim();

            const s_id = (s.student_id || "").toLowerCase().trim();
            const s_fio = (s.fio || "").toLowerCase().trim();
            const s_passport = (s.passport_serial || "").toLowerCase().trim();

            // Matches Student ID or FIO (fallback)
            const matchesUser = s_id === login || s_fio === login;

            // Matches Passport or Student ID (fallback) or Internal ID suffix
            const matchesPass = s_passport === pass ||
                s_id === pass ||
                String(Math.floor(s.id)).endsWith(passIn.trim());

            return matchesUser && matchesPass;
        });

        if (studentFound) {
            sessionStorage.setItem('studentId', studentFound.id);
            loginSuccess(studentFound.fio, 'student');
        } else {
            errorMsg.style.display = 'block';
        }
    }
}

function loginSuccess(name, role) {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('currentUser', name);
    sessionStorage.setItem('currentRole', role);

    document.getElementById('loginOverlay').style.display = 'none';

    // Update Profile
    const profileName = document.getElementById('userProfileName');
    if (profileName) profileName.innerText = `${name} (${role.toUpperCase()})`;

    applyPermissions(role);
    checkAdminVisibility();

    if (role === 'student') switchTab('student');
    else switchTab('dashboard');
}

function applyPermissions(role) {
    // Elements to Control
    const navDashboard = document.getElementById('nav-dashboard');
    const navList = document.getElementById('nav-list');
    const navSettings = document.getElementById('nav-settings');
    const navAnalysis = document.getElementById('nav-analysis');
    const navSchedules = document.getElementById('nav-schedules-toggle');
    const navStudent = document.getElementById('nav-student');
    const navBackup = document.getElementById('nav-backup');
    const navAttendance = document.getElementById('nav-attendance');
    const navStudentAttendance = document.getElementById('nav-student-attendance');
    const navStudentAI = document.getElementById('nav-student-ai');

    const btnAddStudent = document.getElementById('btnAddStudent');
    const btnExportExcel = document.getElementById('btnExportExcel');
    const btnImportExcel = document.getElementById('btnImportExcel');

    const userMgmtCard = document.getElementById('userManagementCard');
    const dangerZoneCard = document.getElementById('dangerZoneCard');
    const btnAdminAddCert = document.getElementById('btnAdminAddCert');

    const dToggle = document.getElementById('nav-dashboard-toggle');
    const navU = document.getElementById('nav-users');
    const navS = document.getElementById('nav-specialties');
    const navG = document.getElementById('nav-gifted');
    const navUpdates = document.getElementById('nav-updates');

    // Default: Show All for Admins
    [navDashboard, navList, navSettings, navAnalysis, navSchedules, navBackup, navAttendance, navUpdates].forEach(el => {
        if (el) el.style.display = 'flex';
    });
    if (navBackup) navBackup.style.display = 'block';
    if (navStudent) navStudent.style.display = 'none';
    if (btnAdminAddCert) btnAdminAddCert.style.display = 'block';

    updateUpdatesBadge();

    // Reset Tab Labels
    const pTab = document.getElementById('sub-tab-pending');
    const aTab = document.getElementById('sub-tab-approved');
    const rTab = document.getElementById('sub-tab-rejected');
    if (pTab) pTab.innerHTML = '<i class="fas fa-clock"></i> Arizalar';
    if (aTab) aTab.innerHTML = '<i class="fas fa-check-circle"></i> Tasdiqlanganlar';
    if (rTab) rTab.innerHTML = '<i class="fas fa-times-circle"></i> Bekor qilinganlar';

    if (role === 'admin' || role === 'operator' || role === 'registrator') {
        if (dToggle) dToggle.style.display = 'flex';
        if (navU) navU.style.display = (role === 'admin' ? 'flex' : 'none');
        if (navS) navS.style.display = 'flex';
        if (navG) navG.style.display = 'flex';

        if (role === 'operator' || role === 'registrator') {
            if (navSettings) navSettings.style.display = 'none';
            if (navBackup) navBackup.style.display = 'none';
            if (userMgmtCard) userMgmtCard.style.display = 'none';
            if (dangerZoneCard) dangerZoneCard.style.display = 'none';
        }
    } else if (role === 'tutor') {
        // Tutor ONLY sees Attendance
        [dToggle, navSettings, navBackup, navAnalysis, navSchedules, navUpdates, navList, navG, navU, navS].forEach(el => {
            if (el) el.style.display = 'none';
        });
        if (navAttendance) navAttendance.style.display = 'flex';
        if (btnAdminAddCert) btnAdminAddCert.style.display = 'none';

        // Override labels for Tutor
        if (pTab) pTab.innerHTML = '<i class="fas fa-clock"></i> Kelib tushgan';
        if (aTab) aTab.innerHTML = '<i class="fas fa-paper-plane"></i> Yuborilgan';
        if (rTab) rTab.innerHTML = '<i class="fas fa-times-circle"></i> Qaytarilgan';
    } else if (role === 'operator2') {
        // Limited: Only Gifted Children
        if (dToggle) dToggle.style.display = 'flex';
        if (navU) navU.style.display = 'none';
        if (navS) navS.style.display = 'none';
        if (navG) navG.style.display = 'flex';

        [navList, navSettings, navAnalysis, navSchedules, navBackup, navUpdates, navDashboard].forEach(el => {
            if (el) el.style.display = 'none';
        });
    } else {
        // Student, Viewer and Others
        if (dToggle) dToggle.style.display = 'none';

        // Hide all admin/operator sections by default
        [navSettings, navBackup, navUpdates, navS, navU, navG, navDashboard, navList, navAnalysis, navSchedules, navAttendance].forEach(el => {
            if (el) el.style.display = 'none';
        });

        if (role === 'student') {
            if (navStudent) navStudent.style.display = 'flex';
            if (navStudentAttendance) navStudentAttendance.style.display = 'flex';
            if (navStudentAI) navStudentAI.style.display = 'flex';
            if (document.getElementById('nav-student-gifted-toggle')) document.getElementById('nav-student-gifted-toggle').style.display = 'flex';
        } else if (role === 'viewer') {
            // Viewers can see Dashboard and List, but not add/edit
            if (navDashboard) navDashboard.style.display = 'flex';
            if (navList) navList.style.display = 'flex';
            if (navAttendance) navAttendance.style.display = 'flex';

            if (btnAddStudent) btnAddStudent.style.display = 'none';
            if (btnExportExcel) btnExportExcel.style.display = 'none';
            if (btnImportExcel) btnImportExcel.style.display = 'none';
            if (dangerZoneCard) dangerZoneCard.style.display = 'none';
        }
    }
}
function checkAdminVisibility() {
    const role = sessionStorage.getItem('currentRole');
    const name = sessionStorage.getItem('currentUser');
    const adminLink = document.getElementById('nav-queue-admin');

    if (adminLink) {
        // Only Admin or Operator 1 can see Admin Panel
        if (role === 'admin' || role === 'administrator' || role === 'registrator' || name === 'Operator 1') {
            adminLink.style.display = 'flex';
        } else {
            adminLink.style.display = 'none';
        }
    }
}

function logout() {
    sessionStorage.clear();
    location.reload();
}

// --- USER MANAGEMENT ---
function renderUsers() {
    const users = appData.system_users;
    const containers = ['secUsersTableBody'];

    containers.forEach(id => {
        const tbody = document.getElementById(id);
        if (!tbody) return;

        tbody.innerHTML = '';
        // Static Admin Row
        const adminRow = document.createElement('tr');
        adminRow.innerHTML = `
            <td><span class="badge" style="background:#e0f2fe; color:#0369a1;">admin</span></td>
            <td>Administrator</td>
            <td><span class="badge" style="background:#dcfce7; color:#15803d;">ADMIN</span></td>
            <td><i class="fas fa-lock" style="color:#94a3b8" title="O'chirib bo'lmaydi"></i></td>
        `;
        tbody.appendChild(adminRow);

        users.forEach((u, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${u.username}</td>
                <td>${u.fullname}</td>
                <td><span class="badge">${(u.role || 'operator').toUpperCase()}</span></td>
                <td>
                    <button class="action-btn delete" onclick="deleteUser(${index})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

async function addUser(source) {
    const uId = source === 'dash' ? 'dashUsername' : 'secUsername';
    const pId = source === 'dash' ? 'dashPassword' : 'secPassword';
    const nId = source === 'dash' ? 'dashFullname' : 'secFullname';
    const rId = source === 'dash' ? 'dashRole' : 'secRole';

    const userIn = document.getElementById(uId).value.trim();
    const passIn = document.getElementById(pId).value.trim();
    const nameIn = document.getElementById(nId).value.trim();
    const roleIn = document.getElementById(rId).value;

    if (!userIn || !passIn || !nameIn) {
        alert("Barcha maydonlarni to'ldiring!");
        return;
    }
    if (userIn.length < 4) {
        alert("Login kamida 4 ta belgidan iborat bo'lishi kerak.");
        return;
    }

    appData.system_users.push({ username: userIn, password: passIn, fullname: nameIn, role: roleIn });
    await saveToServer();

    document.getElementById(uId).value = '';
    document.getElementById(pId).value = '';
    document.getElementById(nId).value = '';

    renderUsers();
    alert("Foydalanuvchi qo'shildi!");
}

async function deleteUser(index) {
    if (confirm("Foydalanuvchini o'chirmoqchimisiz?")) {
        appData.system_users.splice(index, 1);
        await saveToServer();
        renderUsers();
    }
}

// --- DANGER ZONE ---
async function clearAllStudents() {
    if (confirm("DIQQAT! Barcha talabalar ro'yxati o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.\n\nRozimisiz?")) {
        if (confirm("Haqiqatan ham o'chirilsinmi?")) {
            appData.students = [];
            await saveToServer();
            loadDashboard(); // Reset stats
            alert("Baza tozalandi.");
            switchTab('dashboard');
        }
    }
}

async function removeDuplicates() {
    if (confirm("F.I.O bo'yicha takrorlangan talabalar o'chirilsinmi?")) {
        let students = appData.students;
        const originalCount = students.length;

        // Filter duplicates based on FIO (keep first occurrence)
        const unique = [];
        const seen = new Set();

        students.forEach(s => {
            const key = s.fio.toLowerCase().trim();
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(s);
            }
        });

        appData.students = unique;
        await saveToServer();
        const deletedCount = originalCount - unique.length;

        alert(`${deletedCount} ta dublikat o'chirildi.`);
        loadDashboard();
        switchTab('list'); // Show list
    }
}

// --- ANALYSIS & PAYMENT SYSTEM ---

// Store last processed data for filtering without re-parsing
let lastAnalysisData = [];

function runPaymentAnalysis(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // A3:S4 Header Search Logic
            let fioIdx = 0;
            let amountIdx = -1;
            let startRow = 1;

            const kFio = ['fio', 'f.i.o', 'familiya', 'ism'];
            const kAmount = ['summa', 'to\'lov', 'miqdor', 'shartnoma'];

            // Scan first 10 rows
            for (let r = 0; r < Math.min(rows.length, 10); r++) {
                const row = rows[r];
                if (!row) continue;

                let foundFio = false;
                row.forEach((cell, cIdx) => {
                    if (typeof cell !== 'string') return;
                    const val = cell.toLowerCase().trim();
                    if (kFio.some(k => val.includes(k))) { fioIdx = cIdx; foundFio = true; }
                    if (kAmount.some(k => val.includes(k))) amountIdx = cIdx;
                });

                if (foundFio) {
                    startRow = r + 1; // Data starts next row
                    break;
                }
            }

            if (amountIdx === -1) amountIdx = 1; // Fallback col 2

            const payments = [];
            for (let i = startRow; i < rows.length; i++) {
                const row = rows[i];
                if (!row) continue;

                const name = row[fioIdx];
                if (!name || typeof name !== 'string' || name.trim().length < 3) continue;

                let rawAmount = row[amountIdx];
                let amount = 0;

                if (typeof rawAmount === 'number') {
                    amount = rawAmount;
                } else if (typeof rawAmount === 'string') {
                    amount = parseFloat(rawAmount.replace(/[^\d\.]/g, '')) || 0;
                }

                payments.push({
                    fio: name.trim().toLowerCase(),
                    originalFio: name.trim(),
                    amount: amount
                });
            }

            lastAnalysisData = payments; // Store globally
            generateAnalysisReport(payments);

        } catch (error) {
            console.error("Analysis Error:", error);
            alert("Faylni o'qishda xatolik!");
        }
        input.value = '';
    };
    reader.readAsArrayBuffer(file);
}

function applyAnalysisFilter() {
    if (lastAnalysisData.length > 0) {
        generateAnalysisReport(lastAnalysisData);
    }
}

function generateAnalysisReport(payments) {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const tbody = document.getElementById('analysisTableBody');
    tbody.innerHTML = '';

    const insightsList = document.getElementById('insightsList');
    const insightsBox = document.getElementById('insightsBox');
    insightsList.innerHTML = '';
    let insightsCount = 0;

    // Stats
    let totalSum = 0;
    let fullPayers = 0;
    let debtors = 0;

    // 1. Map Payments to Students (Left Join Logic on Student DB)
    // Create a map for fast lookup
    const paymentMap = {};
    // Handle duplicates in payment file (e.g. multiple installments)
    payments.forEach(p => {
        if (paymentMap[p.fio]) {
            paymentMap[p.fio].amount += p.amount;
        } else {
            paymentMap[p.fio] = { ...p };
        }
    });

    // We also need to track who was matched to find "Orphans" (Paid but not in DB)
    const matchedPaymentNames = new Set();

    students.forEach(s => {
        const key = s.fio.trim().toLowerCase();
        const payData = paymentMap[key];

        let paidAmount = 0;
        let pStatus = 'Qarzdor'; // Default assumption
        let rowColor = '';

        if (payData) {
            paidAmount = payData.amount;
            matchedPaymentNames.add(key);

            // LOGIC: Assume 'Full Payment' threshold. For now, let's say > 0 is "Paid Something"
            // Use 5,000,000 as dummy contract price or just checking positive
            if (paidAmount >= 5000000) {
                pStatus = 'To\'liq';
                fullPayers++;
                rowColor = 'color: #15803d; font-weight:bold;'; // Green
            } else {
                pStatus = 'Qisman';
                debtors++; // Partial is also debtor? Or separate? Let's count as debt
                rowColor = 'color: #ca8a04;'; // Yellow/Orange
            }
        } else {
            // No payment found
            debtors++;
            rowColor = 'color: #dc2626; font-weight:bold;'; // Red

            // INSIGHT: Active student but no payment
            addInsight(`⚠️ <b>${s.fio}</b> (Kurs: ${s.year}) - To'lov ma'lumoti topilmadi!`);
            insightsCount++;
        }

        totalSum += paidAmount;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.fio}</td>
            <td>${s.specialty || '-'}</td>
            <td>${s.year}</td>
            <td style="${rowColor}">${paidAmount.toLocaleString()} so'm</td>
            <td><span class="badge" style="${getStatusStyle(pStatus)}">${pStatus}</span></td>
        `;
        tbody.appendChild(row);
    });

    // 2. Find Orphans (Payments that didn't match any student)
    Object.keys(paymentMap).forEach(key => {
        if (!matchedPaymentNames.has(key)) {
            const orphan = paymentMap[key];
            addInsight(`❓ <b>${orphan.originalFio}</b> - Bazada yo'q, lekin to'lov qilgan (${orphan.amount.toLocaleString()} so'm).`);
            insightsCount++;

            // Add to table as "Unknown"
            const row = document.createElement('tr');
            row.style.backgroundColor = '#fef2f2';
            row.innerHTML = `
                <td>${orphan.originalFio} <span style="font-size:10px; color:red;">(Bazada yo'q)</span></td>
                <td>-</td>
                <td>-</td>
                <td>${orphan.amount.toLocaleString()} so'm</td>
                <td><span class="badge" style="background:#fee2e2; color:#991b1b">Noma'lum</span></td>
            `;
            tbody.appendChild(row);
            totalSum += orphan.amount; // Should we include? Yes, actual money received.
        }
    });

    // Update Dashboard Stats
    document.getElementById('payTotalSum').innerText = totalSum.toLocaleString() + " so'm";
    document.getElementById('payFullCount').innerText = fullPayers;
    document.getElementById('payDebtCount').innerText = debtors;

    // Show/Hide Insights
    if (insightsCount > 0) {
        insightsBox.style.display = 'block';
    } else {
        insightsBox.style.display = 'none';
    }
}

function addInsight(html) {
    const ul = document.getElementById('insightsList');
    const li = document.createElement('li');
    li.style.marginBottom = '5px';
    li.innerHTML = html;
    ul.appendChild(li);
}

// --- STUDENT PORTAL LOGIC ---
function loadStudentPortal() {
    const studentId = sessionStorage.getItem('studentId');
    const student = appData.students.find(s => s.id == studentId);
    if (!student) return;

    document.getElementById('portalStudentName').innerText = student.fio;
    document.getElementById('portalStudentDetails').innerText = `Yo'nalish: ${student.specialty || 'Belgilanmagan'} | Yil: ${student.year || '-'}`;

    updateGiftedStatusUI(student.id);
    loadStudentQueue();
    // Auto-refresh queue status every 10 seconds
    if (window.queueInterval) clearInterval(window.queueInterval);
    window.queueInterval = setInterval(loadStudentQueue, 10000);

    const grid = document.getElementById('studentDocsList');
    grid.innerHTML = '';

    const docs = [
        { key: 'passport', label: 'Pasport / ID Card', val: student.passport, status: student.status_passport },
        { key: 'diplom', label: 'Diplom Malumoti', val: student.diplom, status: student.status_diplom },
        { key: 'ilova', label: 'Diplom Ilova', val: student.ilova, status: student.status_ilova },
        { key: 'imtiyoz', label: 'Imtiyoz Hujjati', val: student.imtiyoz, status: student.status_imtiyoz }
    ];

    docs.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.padding = '15px';
        card.style.border = '1px solid #e2e8f0';

        const isUploaded = doc.val && doc.val.length > 10;
        const isAccepted = doc.status === true;

        let statusText = 'Kutilmoqda'; // Red (Base)
        let statusStyle = 'background:#fee2e2; color:#991b1b;';

        if (isAccepted && isUploaded) {
            statusText = 'Qabul qilingan';
            statusStyle = 'background:#dcfce7; color:#15803d;'; // Green (Asli + Nusxa)
        } else if (isAccepted && !isUploaded) {
            statusText = 'Topshirgan';
            statusStyle = 'background:#fef9c3; color:#a16207;'; // Yellow (Faqat Asli)
        } else if (!isAccepted && isUploaded) {
            statusText = 'Tekshirilmoqda';
            statusStyle = 'background:#e0f2fe; color:#0369a1;'; // Blue (Faqat Nusxa)
        }

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;">
                <h4 style="margin:0; font-size:16px;">${doc.label}</h4>
                <span class="badge" style="${statusStyle}">
                    ${statusText}
                </span>
            </div>
            
            <div id="preview-${doc.key}" style="width:100%; height:120px; background:#f8fafc; border-radius:8px; display:flex; align-items:center; justify-content:center; border:2px dashed #e2e8f0; margin-bottom:15px; overflow:hidden;">
                ${isUploaded ? `<img src="${doc.val}" style="width:100%; height:100%; object-fit:cover; cursor:pointer;" onclick="viewImage('${doc.val}')">` : '<i class="fas fa-file-upload" style="font-size:24px; color:#cbd5e1;"></i>'}
            </div>

            <div style="display:flex; gap:10px;">
                <input type="file" id="file-${doc.key}" accept="image/*" hidden onchange="uploadByStudent('${doc.key}', this)">
                <button class="btn-primary" style="flex:1; font-size:13px; padding:8px;" onclick="document.getElementById('file-${doc.key}').click()">
                    <i class="fas fa-upload"></i> ${isUploaded ? 'Yangilash' : 'Yuklash'}
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function uploadByStudent(type, input) {
    const file = input.files[0];
    if (!file) return;

    const studentId = sessionStorage.getItem('studentId');
    const student = appData.students.find(s => s.id == studentId);
    if (!student) return;

    const base64 = await getBase64(file);
    const existingFile = student[type];

    // If it's a NEW upload (no file exists yet)
    if (!existingFile || existingFile.length < 10) {
        student[type] = base64;
        await saveToServer();
        loadStudentPortal();
        alert("Hujjat yuklandi va tekshirishga yuborildi!");
    } else {
        // CHANGE REQUEST logic: Create a pending update
        const request = {
            id: Date.now(),
            studentId: student.id,
            studentName: student.fio,
            docType: type,
            oldFile: existingFile,
            newFile: base64,
            timestamp: new Date().toISOString()
        };

        if (!appData.pending_updates) appData.pending_updates = [];
        appData.pending_updates.push(request);

        await saveToServer();
        alert("Hujjatni o'zgartirish bo'yicha so'rov yuborildi. Admin tasdiqlashini kuting.");
    }
    input.value = '';
}

function loadUpdates() {
    const list = document.getElementById('pendingUpdatesList');
    if (!list) return;

    const updates = appData.pending_updates || [];
    if (updates.length === 0) {
        list.innerHTML = `<p style="color: #64748b; text-align: center; padding: 40px;">Hozircha yangi so'rovlar yo'q.</p>`;
        updateUpdatesBadge();
        return;
    }

    list.innerHTML = '';
    updates.forEach(u => {
        const card = document.createElement('div');
        card.className = 'update-card';

        const typeLabels = {
            passport: 'Pasport / ID',
            diplom: 'Diplom',
            ilova: 'Diplom Ilova',
            imtiyoz: 'Imtiyoz'
        };

        card.innerHTML = `
            <div class="update-header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <strong style="color:var(--primary-color);">${u.studentName}</strong>
                    <span style="color:#64748b; font-size:12px;">(${typeLabels[u.docType] || u.docType})</span>
                </div>
                <span style="font-size:11px; color:#94a3b8;">${new Date(u.timestamp).toLocaleString()}</span>
            </div>
            <div class="update-body">
                <div class="comparison-box">
                    <label style="font-size:12px; color:#64748b;">Eski xolati:</label>
                    <img src="${u.oldFile}" onclick="viewImage('${u.oldFile}')">
                </div>
                <div class="comparison-box">
                    <label style="font-size:12px; color:var(--primary-color); font-weight:bold;">Yangi xolati:</label>
                    <img src="${u.newFile}" onclick="viewImage('${u.newFile}')">
                </div>
            </div>
            <div class="update-actions">
                <button class="btn-secondary" onclick="rejectUpdate('${u.id}')" style="color:var(--danger-color); border-color:var(--danger-color);">
                    <i class="fas fa-times"></i> Bekor qilish
                </button>
                <button class="btn-primary" onclick="approveUpdate('${u.id}')">
                    <i class="fas fa-check"></i> Tasdiqlash va Saqlash
                </button>
            </div>
        `;
        list.appendChild(card);
    });
    updateUpdatesBadge();
}

async function approveUpdate(updateId) {
    const idx = appData.pending_updates.findIndex(u => u.id == updateId);
    if (idx === -1) return;

    const request = appData.pending_updates[idx];
    const studentIdx = appData.students.findIndex(s => s.id == request.studentId);

    if (studentIdx > -1) {
        // Update the main record
        appData.students[studentIdx][request.docType] = request.newFile;

        // Add notification
        addStudentNotification(request.studentId, `Tabriklaymiz! Sizning <b>${request.docType}</b> hujjatini o'zgartirish so'rovingiz tasdiqlandi.`, 'success');

        // Remove update
        appData.pending_updates.splice(idx, 1);
        await saveToServer();
        loadUpdates();
        alert("O'zgarish saqlandi va talabaga xabar yuborildi.");
    }
}

async function rejectUpdate(updateId) {
    const idx = appData.pending_updates.findIndex(u => u.id == updateId);
    if (idx === -1) return;

    const request = appData.pending_updates[idx];

    // Add notification
    addStudentNotification(request.studentId, `Sizning <b>${request.docType}</b> hujjatini o'zgartirish so'rovingiz rad etildi. Iltimos, ma'lumotlarni tekshirib qaytadan urinib ko'ring.`, 'danger');

    // Remove update
    appData.pending_updates.splice(idx, 1);
    await saveToServer();
    loadUpdates();
    alert("So'rov rad etildi.");
}

function addStudentNotification(studentId, text, type) {
    if (!appData.student_messages) appData.student_messages = [];
    appData.student_messages.push({
        id: Date.now(),
        studentId: studentId,
        text: text,
        type: type, // success, danger, info
        timestamp: new Date().toISOString()
    });
}

function loadNotifications() {
    const container = document.getElementById('studentNotifications');
    if (!container) return;

    const currentId = sessionStorage.getItem('studentId');
    const msgs = (appData.student_messages || []).filter(m => m.studentId == currentId).reverse();

    if (msgs.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = msgs.map(m => `
        <div class="student-message" style="background:${m.type === 'success' ? '#f0fdf4' : '#fef2f2'}; border:1px solid ${m.type === 'success' ? '#bbf7d0' : '#fecaca'};">
            <i class="fas ${m.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" style="color:${m.type === 'success' ? '#15803d' : '#991b1b'};"></i>
            <div style="flex:1;">
                <p style="margin:0; font-size:14px; color:#1e293b;">${m.text}</p>
                <small style="color:#64748b; font-size:11px;">${new Date(m.timestamp).toLocaleString()}</small>
            </div>
            <button onclick="clearNotification('${m.id}')" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

async function clearNotification(id) {
    appData.student_messages = appData.student_messages.filter(m => m.id != id);
    await saveToServer();
    loadNotifications();
}

function updateUpdatesBadge() {
    const badge = document.getElementById('updatesCount');
    if (!badge) return;
    const count = (appData.pending_updates || []).length;
    if (count > 0) {
        badge.innerText = count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function getStatusStyle(status) {
    if (status === 'To\'liq') return 'background:#dcfce7; color:#15803d;';
    if (status === 'Qisman') return 'background:#fef9c3; color:#854d0e;';
    return 'background:#fee2e2; color:#991b1b;';
}

// --- SETTINGS MANAGEMENT ---
function loadSettings() {
    if (!appData.settings) appData.settings = { disableStatusRollback: false };
    const toggle = document.getElementById('rollbackToggle');
    if (toggle) {
        toggle.checked = appData.settings.disableStatusRollback === true;
    }
}

async function saveSettings() {
    const toggle = document.getElementById('rollbackToggle');
    if (toggle) {
        appData.settings.disableStatusRollback = toggle.checked;
        await saveToServer();
    }
}

// --- IQTIDORLI BOLALAR TANLOVI LOGIC ---
async function submitGiftedApplication(event) {
    event.preventDefault();
    const studentId = sessionStorage.getItem('studentId');
    const student = appData.students.find(s => s.id == studentId);
    if (!student) return alert('Talaba topilmadi!');

    const comment = document.getElementById('giftedComment').value;
    const fileInput = document.getElementById('giftedFile');

    if (!fileInput.files[0]) return alert('Faylni tanlang!');

    const fileBase64 = await getBase64(fileInput.files[0]);

    const application = {
        id: Date.now(),
        studentId: student.id,
        fio: student.fio,
        specialty: student.specialty,
        year: student.year,
        comment: comment,
        file: fileBase64,
        date: new Date().toLocaleString(),
        status: 'pending' // pending, approved, rejected
    };

    if (!appData.gifted_applications) appData.gifted_applications = [];
    appData.gifted_applications.push(application);

    await saveToServer();
    alert('Arizangiz muvaffaqiyatli jo\'natildi!');
    updateGiftedStatusUI(student.id);
    document.getElementById('giftedApplicationForm').reset();
}

function updateGiftedStatusUI(studentId) {
    const app = appData.gifted_applications ? appData.gifted_applications.find(a => a.studentId == studentId) : null;
    const container = document.getElementById('giftedStatusContainer');
    const form = document.getElementById('giftedApplicationForm');

    if (app) {
        if (form) form.style.display = 'none';
        if (container) container.style.display = 'block';

        const stateEl = document.getElementById('giftedAppState');
        const dateEl = document.getElementById('giftedAppDate');
        const box = document.getElementById('giftedStatusBox');
        const icon = document.getElementById('giftedStatusIcon');

        if (stateEl) stateEl.innerText = app.status === 'pending' ? 'Kutilmoqda' : (app.status === 'approved' ? 'Qabul qilingan' : 'Rad etilgan');
        if (dateEl) dateEl.innerText = `Jo'natilgan sana: ${app.date}`;

        if (box && icon) {
            if (app.status === 'approved') {
                box.style.background = '#f0fdf4'; box.style.borderColor = '#bbf7d0'; box.style.color = '#166534';
                icon.className = 'fas fa-check-circle';
            } else if (app.status === 'rejected') {
                box.style.background = '#fef2f2'; box.style.borderColor = '#fecaca'; box.style.color = '#991b1b';
                icon.className = 'fas fa-times-circle';
            } else {
                box.style.background = '#eff6ff'; box.style.borderColor = '#bfdbfe'; box.style.color = '#1e40af';
                icon.className = 'fas fa-clock';
            }
        }
    } else {
        if (form) form.style.display = 'block';
        if (container) container.style.display = 'none';
    }
}

function loadGiftedApplications(contestId = null) {
    const tbody = document.getElementById('giftedApplicationsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let apps = appData.gifted_applications || [];

    // Filter by contest if contestId is provided
    if (contestId) {
        apps = apps.filter(a => a.contestId == contestId);
    }

    if (apps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">Hozircha arizalar yo\'q</td></tr>';
        return;
    }

    [...apps].reverse().forEach(app => {
        const student = appData.students.find(s => s.id == app.studentId);
        const fio = student ? student.fio : 'Noma\'lum';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${fio}</strong><br><small style="color:#64748b;">${app.comment ? app.comment.substring(0, 30) + '...' : ''}</small></td>
            <td>${app.date}</td>
            <td>
                <div style="display:flex; gap: 5px; flex-wrap: wrap;">
                    ${app.fileAriza ? '<a href="' + app.fileAriza + '" download="ariza.pdf" class="btn-primary" style="padding: 2px 6px; font-size: 10px;"><i class="fas fa-file-pdf"></i> Ariza</a>' : ''}
                    ${app.filePassport ? '<a href="' + app.filePassport + '" download="passport.pdf" class="btn-primary" style="padding: 2px 6px; font-size: 10px;"><i class="fas fa-id-card"></i> Pasport</a>' : ''}
                    ${app.fileOther ? '<a href="' + app.fileOther + '" download="other.pdf" class="btn-primary" style="padding: 2px 6px; font-size: 10px;"><i class="fas fa-file"></i> Boshqa</a>' : ''}
                </div>
            </td>
            <td><span class="status-badge ${app.status === 'approved' ? 'status-full' : (app.status === 'rejected' ? 'status-error' : 'status-pending')}" style="padding: 4px 8px; border-radius: 12px; font-size: 11px;">
                ${app.status === 'pending' ? 'Kutilmoqda' : (app.status === 'approved' ? 'Qabul qilingan' : 'Rad etilgan')}
            </span></td>
            <td>
                <div style="display:flex; gap: 5px;">
                    <button class="btn-primary" style="background:#22c55e; padding: 4px 8px;" onclick="approveGiftedApplication(${app.id})" title="Qabul qilish"><i class="fas fa-check"></i></button>
                    <button class="btn-primary" style="background:#ef4444; padding: 4px 8px;" onclick="rejectGiftedApplication(${app.id})" title="Rad etish"><i class="fas fa-times"></i></button>
                    <button class="btn-primary" style="background:#64748b; padding: 4px 8px;" onclick="deleteGiftedApplication(${app.id})" title="O'chirish"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function approveGiftedApplication(id) {
    const app = appData.gifted_applications.find(a => a.id == id);
    if (app) {
        app.status = 'approved';
        await saveToServer();
        loadGiftedApplications();
    }
}

async function rejectGiftedApplication(id) {
    const app = appData.gifted_applications.find(a => a.id == id);
    if (app) {
        app.status = 'rejected';
        await saveToServer();
        loadGiftedApplications();
    }
}

async function deleteGiftedApplication(id) {
    if (!confirm('Ushbu arizani o\'chirishni xohlaysizmi?')) return;
    appData.gifted_applications = appData.gifted_applications.filter(a => a.id != id);
    await saveToServer();
    loadGiftedApplications();
}

async function saveContestInfo() {
    const title = document.getElementById('adminContestTitle').value;
    const desc = document.getElementById('adminContestDesc').value;
    const startDate = document.getElementById('adminContestStart').value;
    const endDate = document.getElementById('adminContestEnd').value;
    const eventDate = document.getElementById('adminContestEvent').value;
    const address = document.getElementById('adminContestAddress').value;

    if (!title) {
        alert('Tanlov nomini kiriting!');
        return;
    }

    appData.settings.contestTitle = title;
    appData.settings.contestDescription = desc;
    appData.settings.contestStartDate = startDate;
    appData.settings.contestEndDate = endDate;
    appData.settings.contestEventDate = eventDate;
    appData.settings.contestAddress = address;

    // Handle logo
    const logoInput = document.getElementById('adminContestLogo');
    if (logoInput.files[0]) {
        const logoBase64 = await getBase64(logoInput.files[0]);
        appData.settings.contestLogo = logoBase64;
    }

    // Handle nizom
    const nizomInput = document.getElementById('adminContestNizom');
    if (nizomInput.files[0]) {
        const nizomBase64 = await getBase64(nizomInput.files[0]);
        appData.settings.contestNizom = nizomBase64;
    }

    await saveToServer();
    alert('Tanlov ma\'lumotlari saqlandi!');
    loadContestInfoAdmin();
}

function loadContestInfoAdmin() {
    const titleInp = document.getElementById('adminContestTitle');
    const descInp = document.getElementById('adminContestDesc');
    const startInp = document.getElementById('adminContestStart');
    const endInp = document.getElementById('adminContestEnd');
    const eventInp = document.getElementById('adminContestEvent');
    const addressInp = document.getElementById('adminContestAddress');

    if (titleInp) titleInp.value = appData.settings.contestTitle || "";
    if (descInp) descInp.value = appData.settings.contestDescription || "";
    if (startInp) startInp.value = appData.settings.contestStartDate || "";
    if (endInp) endInp.value = appData.settings.contestEndDate || "";
    if (eventInp) eventInp.value = appData.settings.contestEventDate || "";
    if (addressInp) addressInp.value = appData.settings.contestAddress || "";

    // Show logo preview if exists
    if (appData.settings.contestLogo) {
        const logoPreview = document.getElementById('adminLogoPreview');
        const logoImg = document.getElementById('adminLogoImg');
        if (logoPreview && logoImg) {
            logoImg.src = appData.settings.contestLogo;
            logoPreview.style.display = 'block';
        }
    }

    // Add logo preview on file select
    const logoInput = document.getElementById('adminContestLogo');
    if (logoInput) {
        logoInput.addEventListener('change', async function () {
            if (this.files[0]) {
                const logoBase64 = await getBase64(this.files[0]);
                const logoPreview = document.getElementById('adminLogoPreview');
                const logoImg = document.getElementById('adminLogoImg');
                if (logoPreview && logoImg) {
                    logoImg.src = logoBase64;
                    logoPreview.style.display = 'block';
                }
            }
        });
    }
}

function loadStudentGiftedPortal() {
    loadStudentContestsList();
}

async function loadStudentQueue() {
    const studentId = sessionStorage.getItem('studentId');
    if (!studentId) return;

    try {
        const res = await fetch('/api/data');
        const data = await res.json();
        const tickets = data.queue_tickets || [];

        // Find if this student has an active ticket
        const myTicket = tickets.find(t => t.studentId == studentId && (t.status === 'waiting' || t.status === 'called'));

        const loading = document.getElementById('queue-status-loading');
        const empty = document.getElementById('queue-status-empty');
        const active = document.getElementById('queue-status-active');

        if (loading) loading.style.display = 'none';

        if (!myTicket) {
            if (empty) empty.style.display = 'block';
            if (active) active.style.display = 'none';
        } else {
            if (empty) empty.style.display = 'none';
            if (active) active.style.display = 'block';

            document.getElementById('student-ticket-num').innerText = myTicket.number;

            if (myTicket.status === 'waiting') {
                // Calculate position
                const waitingBefore = tickets.filter(t => t.status === 'waiting' && t.id < myTicket.id).length;
                document.getElementById('student-queue-pos').innerText = `Sizdan oldin: ${waitingBefore} ta odam bor`;
                document.getElementById('student-window-call').style.display = 'none';
            } else if (myTicket.status === 'called') {
                document.getElementById('student-queue-pos').innerText = "Sizni chaqirishmoqda!";
                const windowDiv = document.getElementById('student-window-call');
                windowDiv.style.display = 'block';
                const counter = data.queue_counters.find(c => c.id == myTicket.window);
                document.getElementById('call-window-name').innerText = counter ? counter.name : "Xizmat oynasi";
            }
        }
    } catch (e) {
        console.error("Queue load failed", e);
    }
}

async function takeStudentTicket(service) {
    const studentId = sessionStorage.getItem('studentId');
    if (!studentId) return;

    const res = await fetch('/api/data');
    const data = await res.json();

    if (!data.queue_settings) {
        data.queue_settings = { prefix: "A", last_number: 0 };
    }
    if (!data.queue_tickets) data.queue_tickets = [];

    data.queue_settings.last_number++;
    const num = data.queue_settings.last_number;
    const prefix = data.queue_settings.prefix;
    const ticketString = `${prefix}-${String(num).padStart(3, '0')}`;

    const newTicket = {
        id: Date.now(),
        number: ticketString,
        service: service,
        status: 'waiting',
        time: new Date().toLocaleTimeString(),
        studentId: studentId
    };

    data.queue_tickets.push(newTicket);

    await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadStudentQueue();
}

// --- DAVOMAT STATUSI (CERTIFICATES) SYSTEM ---

function calculateDays(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e - s);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
}

function getStudentApprovedDays(studentId) {
    return (appData.certificates || [])
        .filter(c => c.studentId == studentId && c.status === 'approved')
        .reduce((sum, c) => sum + (c.days || 0), 0);
}

function checkDateOverlap(studentId, start, end, excludeId = null) {
    const s2 = new Date(start);
    const e2 = new Date(end);

    return (appData.certificates || []).some(c => {
        if (c.studentId != studentId) return false;
        if (c.id === excludeId) return false;
        if (c.status === 'rejected') return false; // Rejected certs don't count for overlap

        const s1 = new Date(c.startDate);
        const e1 = new Date(c.endDate);

        // Overlap logic: (Start1 <= End2) AND (Start2 <= End1)
        return (s1 <= e2 && s2 <= e1);
    });
}

function openStudentAddCertModal() {
    document.getElementById('studentAddCertModal').style.display = 'flex';
}

function closeStudentAddCertModal() {
    document.getElementById('studentAddCertModal').style.display = 'none';
    document.getElementById('studentAddCertForm').reset();
}

async function saveStudentNewCert(event) {
    event.preventDefault();
    const studentId = sessionStorage.getItem('studentId');
    if (!studentId) return alert("Sessiya topilmadi!");

    const start = document.getElementById('studentAddCertStart').value;
    const end = document.getElementById('studentAddCertEnd').value;
    const comment = document.getElementById('studentAddCertComment').value;
    const fileInput = document.getElementById('studentAddCertFiles');
    const files = [];

    if (fileInput.files.length > 5) {
        return alert("Maksimal 5 ta fayl yuklash mumkin!");
    }

    // New Overlap Restriction
    if (checkDateOverlap(studentId, start, end)) {
        return alert("Xatolik: Belgilangan sanalar uchun sizda allaqachon ma'lumotnoma mavjud (kutilayotgan yoki tasdiqlangan)!");
    }

    // Business Rule: 10 day limit from end date
    const today = new Date();
    const endDateObj = new Date(end);
    const diffDays = (today - endDateObj) / (1000 * 60 * 60 * 24);
    if (diffDays > 10) {
        alert("Xatolik: Ma'lumotnoma tugash sanasidan 10 kundan ko'p vaqt o'tgan. Tizim qabul qilmaydi.");
        return;
    }

    showLoading("Arizani yuborilmoqda...");

    try {
        for (let i = 0; i < fileInput.files.length; i++) {
            const data = await getBase64(fileInput.files[i]);
            files.push(data);
        }

        const days = calculateDays(start, end);
        const timestamp = new Date().toISOString();

        const cert = {
            id: Date.now(),
            studentId: studentId,
            startDate: start,
            endDate: end,
            days: days,
            file: files[0] || '', // Backward compatibility
            files: files,
            comment: comment,
            status: 'pending',
            createdBy: 'student',
            isWarning: false,
            timestamp: timestamp
        };

        appData.certificates.push(cert);
        await saveToServer();

        closeStudentAddCertModal();
        hideLoading("Muvaffaqiyatli yuborildi!");
        loadStudentCertificates();

    } catch (error) {
        console.error("Upload Error:", error);
        hideLoading();
        alert("Xatolik yuz berdi!");
    }
}

function loadStudentCertificates() {
    const studentId = sessionStorage.getItem('studentId');
    const tbody = document.getElementById('studentCertificatesTableBody');
    if (!tbody) return;

    const certs = (appData.certificates || []).filter(c => c.studentId == studentId);

    // Update Stats
    const approved = certs.filter(c => c.status === 'approved');
    const totalDays = approved.reduce((sum, c) => sum + c.days, 0);
    document.getElementById('totalJustifiedDays').innerText = `${totalDays} kun`;

    const warnBox = document.getElementById('attendance-warning-box');
    if (totalDays > 30) {
        warnBox.style.display = 'flex';
        document.getElementById('lastAttendanceStatus').innerText = 'Chetlatish Xavfi';
        document.getElementById('lastAttendanceStatus').style.color = '#ef4444';
    } else {
        warnBox.style.display = 'none';
        document.getElementById('lastAttendanceStatus').innerText = 'Normal';
        document.getElementById('lastAttendanceStatus').style.color = '#10b981';
    }

    if (certs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">Hozircha ma\'lumotnomalar yo\'q</td></tr>';
        return;
    }

    tbody.innerHTML = certs.reverse().map(c => {
        let statusText = 'Kutilmoqda';
        let statusColor = 'bg-blue'; // Default blue

        if (c.status === 'approved') {
            statusText = 'Tasdiqlangan';
            statusColor = 'bg-green';
        } else if (c.status === 'rejected') {
            statusText = 'Bekor qilingan';
            statusColor = 'bg-red';
        } else {
            // Pending status logic
            const submittedAt = new Date(c.timestamp || c.id);
            const hoursPassed = (new Date() - submittedAt) / (1000 * 60 * 60);

            if (hoursPassed < 24) {
                statusText = 'Yuborilgan';
                statusColor = 'bg-blue';
            } else {
                statusText = 'Ko\'rib chiqilmoqda';
                statusColor = 'bg-orange'; // We'll use a style for orange or just inline it
            }
        }

        const izoh = c.status === 'rejected' ? (c.rejectionReason || '-') : (c.comment || '-');
        const isApproved = c.status === 'approved';

        return `
            <tr>
                <td>${c.startDate} - ${c.endDate}</td>
                <td>${c.days} kun</td>
                <td>${c.createdBy === 'admin' ? '<span class="badge bg-purple" style="color:white; padding:2px 8px; border-radius:10px;">Admin</span>' : '<span class="badge bg-gray" style="background:#64748b; color:white; padding:2px 8px; border-radius:10px;">Talaba</span>'}</td>
                <td>
                    <span class="badge ${statusColor}" style="color:white; padding:2px 8px; border-radius:10px; ${statusColor === 'bg-orange' ? 'background:#f59e0b;' : ''}">${statusText}</span>
                </td>
                <td>
                    <div style="display:flex; gap:5px; flex-wrap:wrap;">
                        ${(isApproved || c.status === 'rejected') ? `
                            <button class="view-btn" style="background:${isApproved ? '#f0fdf4' : '#fef2f2'}; color:${isApproved ? '#16a34a' : '#ef4444'}; border-color:${isApproved ? '#bbf7d0' : '#fecaca'}; min-width:100px; justify-content:center;" onclick="downloadCert('${c.id}')" title="${isApproved ? 'Tasdiqlangan' : 'Rad etilgan'} hujjatni yuklash">
                                <i class="fas fa-download"></i> Yuklash
                            </button>
                        ` : `
                            <button class="view-btn" style="min-width:100px; justify-content:center;" onclick="viewCert('${c.id}')" title="Ko'rish">
                                <i class="fas fa-eye"></i> Ko'rish
                            </button>
                        `}
                        
                        ${(c.status === 'rejected' && c.rejectedByRole === 'tutor') ? `
                            <button class="view-btn" style="background:#fff7ed; color:#ea580c; border-color:#fed7aa; min-width:40px;" onclick="editCert('${c.id}')" title="Tahrirlash">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="view-btn" style="background:#fef2f2; color:#ef4444; border-color:#fecaca; min-width:40px;" onclick="deleteCert('${c.id}')" title="O'chirish">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
                <td>${izoh}</td>
            </tr>
        `;
    }).join('');
}

function loadAdminCertificates() {
    const pendingTbody = document.getElementById('adminCertificatesPendingTableBody');
    const approvedTbody = document.getElementById('adminCertificatesApprovedTableBody');
    const rejectedTbody = document.getElementById('adminCertificatesRejectedTableBody');

    if (!pendingTbody || !approvedTbody || !rejectedTbody) return;

    const search = document.getElementById('attendanceSearchInput').value.toLowerCase();
    let allCerts = appData.certificates || [];

    // Filter by search (student name)
    if (search) {
        allCerts = allCerts.filter(c => {
            const student = appData.students.find(s => s.id == c.studentId);
            return student && student.fio.toLowerCase().includes(search);
        });
    }

    // --- CALCULATE SUMMARY STATS ---
    const currentRole = sessionStorage.getItem('currentRole');
    const allCertsForStats = appData.certificates || [];

    let pendingCerts, approvedCerts, rejectedCerts;

    if (currentRole === 'tutor') {
        pendingCerts = allCerts.filter(c => c.status === 'pending'); // Kelib tushgan
        approvedCerts = allCerts.filter(c => c.status === 'checked'); // Yuborilgan
        rejectedCerts = allCerts.filter(c => c.status === 'rejected'); // Qaytarilgan
    } else {
        pendingCerts = allCerts.filter(c => c.status === 'pending' || c.status === 'checked');
        approvedCerts = allCerts.filter(c => c.status === 'approved');
        rejectedCerts = allCerts.filter(c => c.status === 'rejected');
    }

    const totalApprovedDaysAcrossAll = allCertsForStats
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + (c.days || 0), 0);

    // Total unique students who submitted ANY certificate
    const uniqueStudentsSet = new Set(allCertsForStats.map(c => c.studentId));
    const uniqueStudentCount = uniqueStudentsSet.size;

    // Calculate unique students at risk (those over 30 days)
    const studentsWithApprovedDays = {};
    allCertsForStats.filter(c => c.status === 'approved').forEach(c => {
        studentsWithApprovedDays[c.studentId] = (studentsWithApprovedDays[c.studentId] || 0) + c.days;
    });
    const riskCount = Object.values(studentsWithApprovedDays).filter(d => d > 30).length;

    // Update stats in UI
    if (document.getElementById('adminAttendancePendingCount')) {
        document.getElementById('adminAttendancePendingCount').innerText = pendingCerts.length;
        document.getElementById('adminAttendanceTotalDays').innerText = `${totalApprovedDaysAcrossAll} kun`;
        document.getElementById('adminAttendanceRiskCount').innerText = `${riskCount} ta`;
        if (document.getElementById('adminAttendanceStudentCount')) {
            document.getElementById('adminAttendanceStudentCount').innerText = uniqueStudentCount;
        }
    }

    // Helper to render a row
    const renderCertRow = (c, type) => {
        const student = appData.students.find(s => s.id == c.studentId);
        const name = student ? student.fio : 'Noma\'lum';

        // Total approved days for this student
        const studentApprovedTotal = (appData.certificates || [])
            .filter(cert => cert.studentId == c.studentId && cert.status === 'approved')
            .reduce((sum, cert) => sum + cert.days, 0);
        const daysLabel = studentApprovedTotal > 0 ? ` (${studentApprovedTotal} kun)` : '';

        const currentRole = sessionStorage.getItem('currentRole');
        const roleLabel = c.status === 'checked' ? '<span class="badge" style="background:#0284c7; color:white; font-size:10px; margin-left:5px;">Tyutor tekshirgan</span>' : '';

        let actions;
        if (currentRole === 'registrator' && c.status === 'approved') {
            const hemisColor = c.hemisStatus === 'posted' ? '#10b981' : '#64748b';
            const hemisText = c.hemisStatus === 'posted' ? 'Joylangan' : 'Joylanmagan';
            actions = `
                <div style="display:flex; gap:5px; align-items:center;">
                    <button class="btn-primary" style="background:${hemisColor} !important; border-color:${hemisColor} !important; font-size:10px; padding:4px 6px; width:auto; height:auto; line-height:1;" onclick="toggleHemisStatus('${c.id}')">
                        HEMIS: ${hemisText}
                    </button>
                    <button class="btn-primary" style="background:#14b8a6; padding:4px 8px;" onclick="downloadCert('${c.id}')" title="Yuklash"><i class="fas fa-download"></i></button>
                    <button class="btn-primary" style="background:#3b82f6; padding:4px 8px;" onclick="viewCert('${c.id}')" title="Ko'rish"><i class="fas fa-eye"></i></button>
                </div>
            `;
        } else if (currentRole === 'tutor') {
            actions = `
                <div style="display:flex; gap:5px; align-items:center;">
                    ${c.status === 'pending' ? `
                        <button class="btn-primary" style="background:#6366f1; padding:4px 8px;" onclick="updateCertStatus('${c.id}', 'checked')" title="Registratorga jo'natish">
                            <i class="fas fa-paper-plane"></i> Jo'natish
                        </button>
                    ` : (c.status === 'checked' ? '<span style="color:#64748b; font-size:12px;">Jo\'natilgan</span>' : '')}
                    
                    ${(c.status === 'pending' || c.status === 'checked') ? `
                        <button class="btn-primary" style="background:#ef4444; padding:4px 8px;" onclick="updateCertStatus('${c.id}', 'rejected')" title="Qaytarish"><i class="fas fa-times"></i></button>
                    ` : ''}

                    <button class="btn-primary" style="background:#3b82f6; padding:4px 8px;" onclick="viewCert('${c.id}')" title="Ko'rish"><i class="fas fa-eye"></i></button>
                </div>
            `;
        } else {
            actions = `
                <div style="display:flex; gap:5px;">
                    ${(c.status === 'pending' || c.status === 'checked') ? `
                        ${(currentRole === 'registrator' && c.status === 'pending') ? `
                            ${((Date.now() - new Date(c.timestamp).getTime()) > (2 * 24 * 60 * 60 * 1000)) ? `
                                <button class="btn-primary" style="background:#10b981; padding:4px 8px;" onclick="updateCertStatus('${c.id}', 'approved')" title="Tyutor tekshirmadi, lekin 2 kun o'tdi - Tasdiqlash"><i class="fas fa-check"></i></button>
                            ` : `
                                <button class="btn-primary" style="background:#94a3b8; padding:4px 8px; cursor:not-allowed;" onclick="alert('Ushbu ariza hali Tyutor tomonidan tekshirilmagan. 2 kundan keyin tasdiqlashingiz mumkin.')" title="Tyutor tekshiruvi kutilmoqda"><i class="fas fa-clock"></i></button>
                            `}
                        ` : `
                            <button class="btn-primary" style="background:#10b981; padding:4px 8px;" onclick="updateCertStatus('${c.id}', 'approved')" title="Tasdiqlash"><i class="fas fa-check"></i></button>
                        `}
                        <button class="btn-primary" style="background:#ef4444; padding:4px 8px;" onclick="updateCertStatus('${c.id}', 'rejected')" title="Rad etish"><i class="fas fa-times"></i></button>
                    ` : ''}
                    <button class="btn-primary" style="background:#3b82f6; padding:4px 8px;" onclick="viewCert('${c.id}')" title="Ko'rish"><i class="fas fa-eye"></i></button>
                    <button class="btn-primary" style="background:#14b8a6; padding:4px 8px;" onclick="downloadCert('${c.id}')" title="Yuklash"><i class="fas fa-download"></i></button>
                    <button class="btn-primary" style="background:#f59e0b; padding:4px 8px;" onclick="editCert('${c.id}')" title="Tahrirlash"><i class="fas fa-edit"></i></button>
                    <button class="btn-primary" style="background:#991b1b; padding:4px 8px;" onclick="deleteCert('${c.id}')" title="O'chirish"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        }

        if (type === 'pending') {
            return `
                <tr id="row-${c.id}" ${c.isWarning ? 'style="background:#fef2f2;"' : ''}>
                    <td><strong>${name}${daysLabel}${roleLabel}</strong></td>
                    <td>${c.startDate} - ${c.endDate}</td>
                    <td>${c.days} kun</td>
                    <td>${c.createdBy === 'admin' ? '<span class="badge bg-purple" style="color:white; padding:2px 8px; border-radius:10px; background:#8b5cf6;">Admin</span>' : '<span class="badge bg-gray" style="background:#64748b; color:white; padding:2px 8px; border-radius:10px;">Talaba</span>'}</td>
                    <td>${new Date(c.timestamp).toLocaleString()}</td>
                    <td onclick="event.stopPropagation()">${actions}</td>
                </tr>
            `;
        } else if (type === 'approved') {
            return `
                <tr id="row-${c.id}" class="accordion-header-row" onclick="toggleCertAccordion('${c.id}')" style="cursor:pointer; background:#f0fdf4;">
                    <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <i class="fas fa-chevron-right rotate-icon" id="icon-${c.id}"></i>
                            <strong>${name}${daysLabel}</strong>
                        </div>
                    </td>
                    <td>${c.startDate} - ${c.endDate}</td>
                    <td>${c.days} kun</td>
                    <td>${c.createdBy === 'admin' ? '<span class="badge bg-purple" style="color:white; padding:2px 8px; border-radius:10px; background:#8b5cf6;">Admin</span>' : '<span class="badge bg-gray" style="background:#64748b; color:white; padding:2px 8px; border-radius:10px;">Talaba</span>'}</td>
                    <td>${new Date(c.timestamp).toLocaleDateString()}</td>
                    <td onclick="event.stopPropagation()">${actions}</td>
                </tr>
                <tr id="detail-${c.id}" class="expanded-row" style="display:none;">
                    <td colspan="5">
                        <div class="detail-content">
                            <div style="display:grid; grid-template-columns: 1fr 2fr; gap:15px;">
                                <div style="background:white; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
                                    <p><strong>Izoh:</strong> ${c.comment || 'Izoh yo\'q'}</p>
                                    <p><strong>Guruh:</strong> ${student ? student.specialty || '-' : '-'}</p>
                                </div>
                                <div style="background:white; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
                                    <p><strong>Barcha hujjatlar tarixi:</strong></p>
                                    <div style="font-size:12px;">
                                        ${(appData.certificates || []).filter(ac => ac.studentId == c.studentId && ac.status === 'approved').map(ac => `
                                            <div style="padding:4px 0; border-bottom:1px solid #f1f5f9;">
                                                ${ac.startDate} - ${ac.endDate} (${ac.days} kun)
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            return `
                <tr id="row-${c.id}" style="background:#fef2f2;">
                    <td><strong>${name}</strong></td>
                    <td>${c.startDate} - ${c.endDate}</td>
                    <td>${c.days} kun</td>
                    <td>${c.createdBy === 'admin' ? '<span class="badge bg-purple" style="color:white; padding:2px 8px; border-radius:10px; background:#8b5cf6;">Admin</span>' : '<span class="badge bg-gray" style="background:#64748b; color:white; padding:2px 8px; border-radius:10px;">Talaba</span>'}</td>
                    <td style="color:#ef4444; font-size:12px;"><b>Sabab:</b> ${c.rejectionReason || 'Sabab ko\'rsatilmagan'}</td>
                    <td onclick="event.stopPropagation()">${actions}</td>
                </tr>
            `;
        }
    };

    const sortFn = (a, b) => new Date(b.timestamp) - new Date(a.timestamp);

    pendingTbody.innerHTML = pendingCerts.length ? pendingCerts.sort(sortFn).map(c => renderCertRow(c, 'pending')).join('') : '<tr><td colspan="5" style="text-align:center; color:#888;">Yangi arizalar yo\'q</td></tr>';
    approvedTbody.innerHTML = approvedCerts.length ? approvedCerts.sort(sortFn).map(c => renderCertRow(c, 'approved')).join('') : '<tr><td colspan="5" style="text-align:center; color:#888;">Tasdiqlanganlar yo\'q</td></tr>';
    rejectedTbody.innerHTML = rejectedCerts.length ? rejectedCerts.sort(sortFn).map(c => renderCertRow(c, 'rejected')).join('') : '<tr><td colspan="5" style="text-align:center; color:#888;">Rad etilganlar yo\'q</td></tr>';

    // Call switchAttendanceSubTab only if no tab is currently active
    const activeTab = document.querySelector('.sub-tab-btn.active');
    if (!activeTab) {
        switchAttendanceSubTab('pending');
    }
}

function toggleCertAccordion(id) {
    const detailRow = document.getElementById(`detail-${id}`);
    const icon = document.getElementById(`icon-${id}`);

    if (!detailRow) return;

    if (detailRow.style.display === 'none') {
        detailRow.style.display = 'table-row';
        if (icon) icon.classList.add('active');
    } else {
        detailRow.style.display = 'none';
        if (icon) icon.classList.remove('active');
    }
}

function switchAttendanceSubTab(tabName) {
    // Hide all contents
    document.querySelectorAll('.attendance-sub-content').forEach(el => el.style.display = 'none');
    // Remove active class from all buttons
    document.querySelectorAll('.sub-tab-btn').forEach(el => el.classList.remove('active'));

    // Show selected content
    const content = document.getElementById(`sub-content-${tabName}`);
    if (content) content.style.display = 'block';

    // Add active class to button
    const btn = document.getElementById(`sub-tab-${tabName}`);
    if (btn) btn.classList.add('active');
}

async function updateCertStatus(id, status) {
    const cert = appData.certificates.find(c => c.id == id);
    if (!cert) return;

    const currentRole = sessionStorage.getItem('currentRole');

    if (status === 'rejected') {
        const reason = prompt("Rad etish sababini kiriting:");
        if (reason === null) return; // Cancelled
        cert.rejectionReason = reason || "Ma'lumotnoma talabga javob bermaydi";
        cert.rejectedByRole = currentRole; // Record who rejected it
    } else if (status === 'approved') {
        if (currentRole === 'registrator' && cert.status === 'pending') {
            const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
            const timePassed = Date.now() - new Date(cert.timestamp).getTime();
            if (timePassed < twoDaysInMs) {
                alert("Ushbu arizani tasdiqlash uchun Tyutor tekshiruvi kutilishi kerak (yoki yuborilganidan so'ng 2 kun o'tishi lozim).");
                return;
            }
        }
        delete cert.rejectionReason;
        delete cert.rejectedByRole;
    } else {
        delete cert.rejectedByRole;
    }

    cert.status = status;
    await saveToServer();
    loadAdminCertificates();
}

async function toggleHemisStatus(id) {
    const cert = appData.certificates.find(c => c.id == id);
    if (!cert) return;

    cert.hemisStatus = cert.hemisStatus === 'posted' ? 'not_posted' : 'posted';
    await saveToServer();
    loadAdminCertificates();
}

function deleteCert(id) {
    if (!confirm("Haqiqatan ham ushbu ma'lumotnomani o'chirmoqchimisiz?")) return;
    appData.certificates = appData.certificates.filter(c => c.id != id);
    saveToServer().then(() => {
        loadAdminCertificates();
        if (sessionStorage.getItem('currentRole') === 'student') loadStudentCertificates();
    });
}

function editCert(id) {
    const cert = appData.certificates.find(c => c.id == id);
    if (!cert) return;

    document.getElementById('editCertId').value = cert.id;
    document.getElementById('editCertStartDate').value = cert.startDate;
    document.getElementById('editCertEndDate').value = cert.endDate;
    document.getElementById('editCertRejectionReason').value = cert.rejectionReason || '';
    document.getElementById('editCertComment').value = cert.comment || '';

    document.getElementById('editCertModal').style.display = 'flex';
}

function closeEditCertModal() {
    document.getElementById('editCertModal').style.display = 'none';
}

async function saveEditedCert(event) {
    event.preventDefault();
    const id = document.getElementById('editCertId').value;
    const cert = appData.certificates.find(c => c.id == id);
    if (!cert) return;

    const start = document.getElementById('editCertStartDate').value;
    const end = document.getElementById('editCertEndDate').value;
    const reason = document.getElementById('editCertRejectionReason').value;
    const comment = document.getElementById('editCertComment').value;

    cert.startDate = start;
    cert.endDate = end;
    cert.days = calculateDays(start, end);
    cert.rejectionReason = reason;
    cert.comment = comment;

    await saveToServer();
    closeEditCertModal();
    loadAdminCertificates();
    if (sessionStorage.getItem('currentRole') === 'student') loadStudentCertificates();
    alert("Ma'lumotlar yangilandi.");
}

// --- ADMIN MANUAL CERTIFICATE ENTRY ---
let selectedAdminStudentIds = [];

function openAdminAddCertModal() {
    selectedAdminStudentIds = [];
    renderSelectedStudentTags();
    document.getElementById('adminAddCertStudentSearch').value = '';
    document.getElementById('adminStudentSearchResults').style.display = 'none';
    document.getElementById('adminAddCertModal').style.display = 'flex';
}

function closeAdminAddCertModal() {
    document.getElementById('adminAddCertModal').style.display = 'none';
    document.getElementById('adminAddCertForm').reset();
    selectedAdminStudentIds = [];
    renderSelectedStudentTags();
}

function filterAdminAddCertStudents() {
    const search = document.getElementById('adminAddCertStudentSearch').value.toLowerCase();
    const resultsDiv = document.getElementById('adminStudentSearchResults');
    const students = appData.students || [];

    if (!search) {
        resultsDiv.style.display = 'none';
        return;
    }

    const filtered = students.filter(s =>
        (s.fio.toLowerCase().includes(search) ||
            (s.student_id && s.student_id.toLowerCase().includes(search))) &&
        !selectedAdminStudentIds.includes(s.id.toString())
    );

    if (filtered.length > 0) {
        resultsDiv.innerHTML = filtered.slice(0, 10).map(s => {
            const approvedDays = getStudentApprovedDays(s.id);
            const isOverLimit = approvedDays >= 30;
            const style = isOverLimit ? 'color: #ef4444; font-weight: bold;' : '';
            return `
                <div class="search-result-item" onclick="${isOverLimit ? "alert('Bu talabaning sababli kunlari 30 kundan oshgan! Qo\\'shimcha ma\\'lumotnoma kiritish taqiqlanadi.')" : `addStudentToSelection('${s.id}', '${s.fio}')`}" style="${style}">
                    ${s.fio} (${s.student_id || 'ID yo\'q'}) - ${approvedDays} kun
                </div>
            `;
        }).join('');
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.innerHTML = '<div class="search-result-item" style="color:#888;">Natija topilmadi</div>';
        resultsDiv.style.display = 'block';
    }
}

function addStudentToSelection(id, name) {
    if (!selectedAdminStudentIds.includes(id)) {
        selectedAdminStudentIds.push(id);
        renderSelectedStudentTags();
    }
    document.getElementById('adminAddCertStudentSearch').value = '';
    document.getElementById('adminStudentSearchResults').style.display = 'none';
}

function removeStudentFromSelection(id) {
    selectedAdminStudentIds = selectedAdminStudentIds.filter(sid => sid !== id);
    renderSelectedStudentTags();
}

function renderSelectedStudentTags() {
    const container = document.getElementById('adminSelectedStudentsTags');
    if (selectedAdminStudentIds.length === 0) {
        container.innerHTML = '<span style="color: #94a3b8; font-size: 13px;">Hali hech kim tanlanmagan</span>';
        return;
    }

    container.innerHTML = selectedAdminStudentIds.map(id => {
        const student = appData.students.find(s => s.id == id);
        return `
            <div class="student-tag">
                ${student ? student.fio : 'Noma\'lum'}
                <i class="fas fa-times" onclick="removeStudentFromSelection('${id}')"></i>
            </div>
        `;
    }).join('');
}

async function saveAdminNewCert(event) {
    event.preventDefault();
    const start = document.getElementById('adminAddCertStart').value;
    const end = document.getElementById('adminAddCertEnd').value;
    const comment = document.getElementById('adminAddCertComment').value;
    const fileInput = document.getElementById('adminAddCertFiles');

    if (selectedAdminStudentIds.length === 0) {
        alert("Iltimos, kamida bitta talabani tanlang!");
        return;
    }

    if (fileInput.files.length > 5) {
        alert("Xatolik: Ko'pi bilan 5 ta fayl yuklash mumkin.");
        return;
    }

    showLoading("Ma'lumotlar saqlanmoqda...");

    try {
        const files = [];
        for (let i = 0; i < fileInput.files.length; i++) {
            const compressedBase64 = await compressImage(fileInput.files[i]);
            files.push(compressedBase64);
        }

        const days = calculateDays(start, end);
        const timestamp = new Date().toISOString();

        if (!appData.certificates) appData.certificates = [];

        let hasError = false;
        const overLimitStudents = [];
        const overlappingStudents = [];

        // Check limits and overlaps for ALL selected students before saving any
        for (const studentId of selectedAdminStudentIds) {
            const student = appData.students.find(s => s.id == studentId);
            const studentName = student ? student.fio : studentId;

            const totalDays = getStudentApprovedDays(studentId);
            if (totalDays + days > 30) {
                overLimitStudents.push(studentName);
                hasError = true;
            }

            // New Overlap Restriction for Admin
            if (checkDateOverlap(studentId, start, end)) {
                overlappingStudents.push(studentName);
                hasError = true;
            }
        }

        if (hasError) {
            hideLoading();
            let errorMessage = "Quyidagi xatolar tufayli ma'lumotnoma saqlanmadi:\n";
            if (overLimitStudents.length > 0) {
                errorMessage += `- ${overLimitStudents.join(', ')} uchun jami kunlar 30 kundan oshadi.\n`;
            }
            if (overlappingStudents.length > 0) {
                errorMessage += `- ${overlappingStudents.join(', ')} uchun belgilangan sanalarda allaqachon ma'lumotnoma mavjud.\n`;
            }
            alert(errorMessage);
            return;
        }

        selectedAdminStudentIds.forEach(studentId => {
            const cert = {
                id: Date.now() + Math.floor(Math.random() * 1000), // Unique ID for each
                studentId: studentId,
                startDate: start,
                endDate: end,
                days: days,
                file: files[0] || '', // Backward compatibility
                files: files,
                comment: comment,
                status: 'approved', // Admin addition is auto-approved
                isWarning: false,
                createdBy: 'admin',
                timestamp: timestamp
            };
            appData.certificates.push(cert);
        });

        await saveToServer();
        hideLoading("Muvaffaqiyatli saqlandi!");
        closeAdminAddCertModal();
        loadAdminCertificates();
    } catch (error) {
        console.error("Save error:", error);
        hideLoading();
        alert("Xatolik yuz berdi: " + error.message);
    }
}

// Close search results on click outside
window.addEventListener('click', function (e) {
    const resultsDiv = document.getElementById('adminStudentSearchResults');
    const searchInput = document.getElementById('adminAddCertStudentSearch');
    if (resultsDiv && !resultsDiv.contains(e.target) && e.target !== searchInput) {
        resultsDiv.style.display = 'none';
    }
});
// --- STUDENT AI ASSISTANT SYSTEM ---

function initStudentAI() {
    const studentId = sessionStorage.getItem('studentId');
    if (!studentId) return;

    // Update attendance stat
    const stats = calculateStudentAttendanceStats(studentId);
    const aiAttendance = document.getElementById('ai-stat-attendance');
    if (aiAttendance) {
        aiAttendance.innerText = stats.totalDays > 25 ? 'Xavfli' : (stats.totalDays > 15 ? 'O\'rtacha' : 'Yaxshi');
        aiAttendance.style.color = stats.totalDays > 25 ? 'var(--danger-color)' : (stats.totalDays > 15 ? 'var(--warning-color)' : 'var(--success-color)');
    }

    // Update apps stat - searching in certificates and gifted apps
    const certsCount = (appData.certificates || []).filter(c => c.studentId == studentId).length;
    const giftedCount = (appData.gifted_applications || []).filter(a => a.studentId == studentId).length;
    const aiApps = document.getElementById('ai-stat-apps');
    if (aiApps) aiApps.innerText = `${certsCount + giftedCount} ta`;
}

function calculateStudentAttendanceStats(studentId) {
    const certs = (appData.certificates || []).filter(c => c.studentId == studentId && c.status === 'approved');
    const totalDays = certs.reduce((sum, c) => sum + (c.days || 0), 0);
    return { totalDays };
}

function askAI(question) {
    document.getElementById('ai-user-input').value = question;
    sendAIMessage();
}

function handleAIPress(e) {
    if (e.key === 'Enter') sendAIMessage();
}

async function sendAIMessage() {
    const input = document.getElementById('ai-user-input');
    const msg = input.value.trim();
    if (!msg) return;

    appendMessage('user', msg);
    input.value = '';

    // Simulate AI thinking
    const chatContainer = document.getElementById('ai-chat-messages');
    const typingMsg = document.createElement('div');
    typingMsg.className = 'message ai typing';
    typingMsg.innerText = 'AI o\'ylamoqda...';
    chatContainer.appendChild(typingMsg);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    setTimeout(() => {
        if (typingMsg.parentNode) chatContainer.removeChild(typingMsg);
        const response = processAIRequest(msg);
        appendMessage('ai', response);
    }, 1000);
}

function appendMessage(type, text) {
    const container = document.getElementById('ai-chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerText = text;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function processAIRequest(query) {
    const q = query.toLowerCase().trim();
    const studentId = sessionStorage.getItem('studentId');
    const student = appData.students.find(s => s.id == studentId || s.student_id == studentId);
    const name = student ? student.fio.split(' ')[0] : 'Talaba';

    // Helper: Find specialty name
    const getSpecName = (id) => {
        const s = appData.specialties.find(sp => sp.id == id || sp.code == id);
        return s ? s.name : (id || 'Noma\'lum');
    };

    // --- SYSTEM CONTEXT EXTRACTION ---
    const certs = (appData.certificates || []).filter(c => c.studentId == studentId);
    const approvedCerts = certs.filter(c => c.status === 'approved');
    const pendingCerts = certs.filter(c => c.status === 'pending');
    const totalDays = approvedCerts.reduce((sum, c) => sum + (c.days || 0), 0);
    const contests = appData.contests || [];
    const activeContests = contests.filter(c => !c.endDate || new Date(c.endDate) >= new Date());

    // --- 1. GREETINGS & PERSONALITY ---
    if (/^(salom|assalom|qalaysan|hayrli|hi|hello|salam)/.test(q)) {
        return `Assalomu alaykum, ${name}! Men EduDocs AI-man. Tizim bo'yicha yoki boshqa istalgan o'quv masalalari bo'yicha savol beraverishingiz mumkin. Sizga bugun qanday yordam bera olaman?`;
    }

    if (q.includes('rahmat') || q.includes('tashakkur') || q.includes('zo\'r') || q.includes('rahmat')) {
        return `Arziydi, ${name}! Har doim xizmatingizdaman. Savollaringiz bo'lsa, men shu yerdaman. 😊`;
    }

    // --- 2. PERSONAL DATA ---
    if (q.includes('men haqimda') || q.includes('kimman') || (q.includes('ma\'lumot') && q.includes('profil'))) {
        if (!student) return "Kechirasiz, profilingizni aniqlay olmadim.";
        return `Siz: ${student.fio}\n🎓 Yo'nalish: ${getSpecName(student.specialty)}\n📅 Kurs: ${student.year || '4-kurs'}\n🆔 Talaba ID: ${student.student_id}\n\nSizda ${certs.length} ta yuborilgan ariza va ${totalDays} kun tasdiqlangan sabab mavjud.`;
    }

    // --- 3. ATTENDANCE & WARNINGS ---
    if (q.includes('davomat') || q.includes('kun') || q.includes('qancha') || q.includes('qoldim') || q.includes('dars')) {
        if (totalDays === 0) return `Hurmatli ${name}, hozircha sizda tasdiqlangan sababli kunlar mavjud emas. Agar dars qoldirgan bo'lsangiz, vaqtida ma'lumotnoma topshirishni unutmang.`;

        let report = `Sizning jami tasdiqlangan sababli kunlaringiz: ${totalDays} kun.\n`;
        if (pendingCerts.length > 0) report += `Shuningdek, ${pendingCerts.length} ta arizangiz kutilmoqda.\n`;

        if (totalDays > 25) {
            report += "⚠️ DIQQAT: Sababli kunlaringiz 30 kunga yaqinlashmoqda. 30 kundan oshib ketsa, universitetdan chetlatilish ehtimoli bor. Ehtiyot bo'ling!";
        } else {
            report += "✅ Holatingiz hozircha xavfsiz zonada.";
        }
        return report;
    }

    // --- 4. CERTIFICATES & STATUS ---
    if (q.includes('ariza') || q.includes('ma\'lumotnoma') || q.includes('status') || q.includes('holat')) {
        if (certs.length === 0) return "Siz hali birorta ham ma'lumotnoma yubormagansiz. Uni 'Davomat statusi' bo'limida amalga oshirishingiz mumkin.";

        const last = certs[certs.length - 1];
        let statusText = last.status === 'pending' ? 'Kutilmoqda (Tekshiruvda)' : (last.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan');

        return `Sizda jami ${certs.length} ta ariza mavjud.\n\nOxirgi arizangiz ma'lumotlari:\n📅 Sanalar: ${last.startDate} - ${last.endDate}\n📊 Holati: ${statusText}\n${last.rejectionReason ? '❌ Sababi: ' + last.rejectionReason : ''}\n\nBarcha arizalarni jadvaldan ko'rishingiz mumkin.`;
    }

    // --- 5. EXAMS & PERMISSIONS ---
    if (q.includes('imtihon') || q.includes('yakuniy') || q.includes('nazorat') || q.includes('ruxsat')) {
        return `Imtihonlarga ruxsat olishingiz uchun sababsiz dars qoldirmaslik va ma'lumotnomalarni o'z vaqtida topshirish kerak. 100% ruxsatni "Jadvallar -> Imtihon jadvali" bo'limidan yoki dekanatdan aniqlashingiz mumkin. Hozircha davomatingiz ${totalDays > 25 ? 'xavfli' : 'yaxshi'} holatda.`;
    }

    // --- 6. GIFTED & OPPORTUNITIES ---
    if (q.includes('tanlov') || q.includes('iqtidor') || q.includes('yutuq') || q.includes('pul') || q.includes('stipendiya')) {
        if (activeContests.length > 0) {
            return `Hozirda tizimda ${activeContests.length} ta faol tanlov bor! Eng muhimi: "${activeContests[0].title}". Shoshiling, ro'yxatdan o'tish tugash muddati: ${activeContests[0].endDate}. Bu siz uchun yaxshi imkoniyat!`;
        }
        return "Hozirda faol tanlovlar yo'q, lekin tez-tez 'Iqtidorli bolalar' bo'limini tekshirib turing. O'z yutuqlaringizni ariza sifatida yuborib qo'yishingiz mumkin.";
    }

    // --- 7. GENERAL KNOWLEDGE / ADVICE ---
    if (q.includes('nima qilsam') || q.includes('maslahat') || q.includes('qanday')) {
        if (q.includes('imtihon')) return "Imtihonlarga tayyorlanish uchun dars materiallarini qayta ko'rib chiqing va eng asosiysi - davomatingizga e'tibor bering.";
        if (q.includes('stipendiya')) return "Stipendiyani oshirish uchun fanlardan faqat 5 bahoga o'qish va ilmiy-ijodiy tanlovlarda faol bo'lish kerak. EduDocs-dagi 'Iqtidorli bolalar' bo'limi sizga yordam beradi.";
        return "Sizga tizim hamda o'qish bo'yicha maslahatlar bera olaman. Aniqroq so'rasangiz, batafsil javob beraman.";
    }

    // --- 8. UNIVERSITY RULES (MOCK) ---
    if (q.includes('qoida') || q.includes('nizom') || q.includes('tartib')) {
        return "Universitet qoidalariga ko'ra, semestr davomida 30 kalendar kunidan ortiq sababli yoki sababsiz dars qoldirish akademik qarzdorlikka yoki chetlatishga olib kelishi mumkin. Sababli bo'lishi uchun esa faqat EduDocs orqali tasdiqlangan hujjatlar qabul qilinadi.";
    }

    // --- 9. EDUCATION & LEARNING ---
    if (q.includes('o\'qish') || q.includes('fan') || q.includes('material')) {
        return "O'quv rejalari va fan materiallari odatda HEMIS yoki o'quv platformasiga yuklanadi. EduDocs esa sizning hujjatlaringiz va yutuqlaringizni boshqaruvchi tizimdir.";
    }

    // --- 10. SYSTEM HELP ---
    if (q.includes('yordam') || q.includes('chat') || q.includes('nima bu') || q.includes('ishlash')) {
        return "Bu - EduDocs aqlli tizimi. Siz bu yerda davomat statusini tekshirishingiz, ma'lumotnomalar yuklashingiz, tanlovlarda qatnashishingiz va dekanat bilan onlayn bog'lanishingiz mumkin. Men esa sizning barcha savollaringizga AI sifatida javob beraman.";
    }

    // --- 11. WORLD KNOWLEDGE / GENERAL (DYNAMIC FALLBACK) ---
    // Here we use a bit of logic to pretend we are smarter
    const generalKeywords = ['dunyo', 'qiziq', 'sport', 'ilm', 'fan', 'texnika', 'tarix', 'til'];
    if (generalKeywords.some(w => q.includes(w))) {
        return `Bu mavzu juda qiziq! To'g'ri, men asosan EduDocs tizimi mutaxassisiman, lekin shuni ayta olamanki, ${q.includes('sport') ? 'sport bilan shug\'ullanish nafaqat sog\'liq, balki o\'qishdagi diqqatni ham jamlaydi.' : 'bilim olish - kelajak poydevoridir.'} Aniqroq savolingiz bo'lsa, yozing!`;
    }

    // --- 12. FALLBACK ---
    return `To'g'risi, "${query}" mavzusida menda hozircha to'liq ma'lumot yo'q. Lekin men EduDocs tizimidagi davomatingiz, arizalar holati, yo'nalishingiz va universitet qoidalari bo'yicha deyarli hamma narsani bilaman. Kelajakda men yanada aqlli bo'laman! 🚀`;
}
