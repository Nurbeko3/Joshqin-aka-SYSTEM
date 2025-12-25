let appData = {
    students: [],
    specialties: [],
    system_users: [],
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
            if (!appData.gifted_applications) appData.gifted_applications = [];
            if (!appData.contests) appData.contests = [];
            if (!appData.settings.contestTitle) appData.settings.contestTitle = "Iqtidorli Bolalar Tanlovi";
            if (!appData.settings.contestDescription) appData.settings.contestDescription = "Universitetimizda iqtidorli talabalarni qo'llab-quvvatlash maqsadida \"Yilning eng yaxshi iqtidorli talabasi\" tanlovi e'lon qilinadi. Qatnashish uchun o'z yutuqlaringiz aksi etgan hujjatlarni (sertifikat, diplom, maqola va h.k.) yuklang.";

            // Sync fallback to localStorage for offline cache
            localStorage.setItem('students', JSON.stringify(appData.students));
            localStorage.setItem('specialties', JSON.stringify(appData.specialties));
            localStorage.setItem('system_users', JSON.stringify(appData.system_users));
            localStorage.setItem('app_settings', JSON.stringify(appData.settings));
        }
    } catch (e) {
        console.warn("Serverga ulanib bo'lmadi, lokal xotiradan foydalaniladi.", e);
        appData.students = JSON.parse(localStorage.getItem('students')) || [];
        appData.specialties = JSON.parse(localStorage.getItem('specialties')) || [];
        appData.system_users = JSON.parse(localStorage.getItem('system_users')) || [];
        appData.settings = JSON.parse(localStorage.getItem('app_settings')) || { disableStatusRollback: false };
    }
}

async function saveToServer() {
    // Save to local cache first
    localStorage.setItem('students', JSON.stringify(appData.students));
    localStorage.setItem('specialties', JSON.stringify(appData.specialties));
    localStorage.setItem('system_users', JSON.stringify(appData.system_users));
    localStorage.setItem('app_settings', JSON.stringify(appData.settings));

    try {
        await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appData)
        });
    } catch (e) {
        console.error("Saqlashda xatolik:", e);
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
            <td style="font-weight: 500;">${s.fio}</td>
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
            const login = userIn.toLowerCase();
            const pass = passIn;

            // Matches Student ID or FIO (fallback)
            const matchesUser = (s.student_id && s.student_id.toLowerCase() === login) || s.fio.trim().toLowerCase() === login;

            // Matches Passport or Student ID (fallback) or Internal ID suffix
            const matchesPass = (s.passport_serial && s.passport_serial === pass) ||
                (s.student_id && s.student_id === pass) ||
                String(Math.floor(s.id)).endsWith(pass);

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

    const btnAddStudent = document.getElementById('btnAddStudent');
    const btnExportExcel = document.getElementById('btnExportExcel');
    const btnImportExcel = document.getElementById('btnImportExcel');

    const userMgmtCard = document.getElementById('userManagementCard');
    const dangerZoneCard = document.getElementById('dangerZoneCard');

    // Default: Show All
    [navDashboard, navList, navSettings, navAnalysis, navSchedules, navBackup].forEach(el => {
        if (el) el.style.display = 'flex';
    });
    if (navBackup) navBackup.style.display = 'block';
    if (navStudent) navStudent.style.display = 'none';
    const navUpdates = document.getElementById('nav-updates');
    if (navUpdates) navUpdates.style.display = 'flex';

    updateUpdatesBadge();

    const dToggle = document.getElementById('nav-dashboard-toggle');
    const navU = document.getElementById('nav-users');
    const navS = document.getElementById('nav-specialties');
    const navG = document.getElementById('nav-gifted');

    if (role === 'admin' || role === 'operator') {
        if (dToggle) dToggle.style.display = 'flex';
        if (navU) navU.style.display = (role === 'admin' ? 'flex' : 'none');
        if (navS) navS.style.display = 'flex';
        if (navG) navG.style.display = 'flex';

        if (role === 'operator') {
            if (navSettings) navSettings.style.display = 'none';
            if (navBackup) navBackup.style.display = 'none';
            if (userMgmtCard) userMgmtCard.style.display = 'none';
            if (dangerZoneCard) dangerZoneCard.style.display = 'none';
        }
    } else if (role === 'operator2') {
        // Limited: Only Gifted Children
        if (dToggle) dToggle.style.display = 'flex';
        if (navU) navU.style.display = 'none';
        if (navS) navS.style.display = 'none';
        if (navG) navG.style.display = 'flex';

        [navList, navSettings, navAnalysis, navSchedules, navBackup, navUpdates].forEach(el => {
            if (el) el.style.display = 'none';
        });
    } else {
        // Student and Viewer
        if (dToggle) dToggle.style.display = 'none';

        [navSettings, navBackup, navUpdates, navS, navU, navG].forEach(el => {
            if (el) el.style.display = 'none';
        });

        if (role === 'student') {
            [navDashboard, navList, navAnalysis, navSchedules].forEach(el => { if (el) el.style.display = 'none'; });
            if (navStudent) navStudent.style.display = 'flex';
            if (document.getElementById('nav-student-gifted-toggle')) document.getElementById('nav-student-gifted-toggle').style.display = 'flex';
        } else {
            // Admin, Operator, Viewer
            if (navStudent) navStudent.style.display = 'none';
            if (document.getElementById('nav-student-gifted-toggle')) document.getElementById('nav-student-gifted-toggle').style.display = 'none';

            if (role === 'viewer') {
                if (btnAddStudent) btnAddStudent.style.display = 'none';
                if (btnExportExcel) btnExportExcel.style.display = 'none';
                if (btnImportExcel) btnImportExcel.style.display = 'none';
                if (dangerZoneCard) dangerZoneCard.style.display = 'none';
            }
        }
    }
}

function checkAdminVisibility() {
    const role = sessionStorage.getItem('currentRole');
    const name = sessionStorage.getItem('currentUser');
    const adminLink = document.getElementById('nav-queue-admin');

    if (adminLink) {
        // Only Admin or Operator 1 can see Admin Panel
        if (role === 'admin' || role === 'administrator' || name === 'Operator 1') {
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
