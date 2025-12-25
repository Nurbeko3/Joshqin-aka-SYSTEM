// Student Contests Functions

function loadStudentContestsList() {
    const container = document.getElementById('studentContestsList');
    if (!container) return;

    const contests = (appData.contests || []).filter(c => c.status === 'active');
    const studentId = sessionStorage.getItem('studentId');

    if (contests.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 40px;">Hozircha faol tanlovlar yo\'q</p>';
        return;
    }

    container.innerHTML = '';

    contests.forEach(contest => {
        // Check if student already applied
        const existingApp = appData.gifted_applications.find(a =>
            a.contestId == contest.id && a.studentId == studentId
        );

        const card = document.createElement('div');
        card.style.cssText = 'border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);';

        let statusBadge = '';
        if (existingApp) {
            if (existingApp.status === 'approved') {
                statusBadge = '<span style="background:#dcfce7; color:#15803d; padding:6px 12px; border-radius:12px; font-size:12px; font-weight:600;"><i class="fas fa-check-circle"></i> Qabul qilindi</span>';
            } else if (existingApp.status === 'rejected') {
                statusBadge = '<span style="background:#fee2e2; color:#991b1b; padding:6px 12px; border-radius:12px; font-size:12px; font-weight:600;"><i class="fas fa-times-circle"></i> Rad etildi</span>';
            } else {
                statusBadge = '<span style="background:#dbeafe; color:#1e40af; padding:6px 12px; border-radius:12px; font-size:12px; font-weight:600;"><i class="fas fa-clock"></i> Kutilmoqda</span>';
            }
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div style="flex: 1;">
                    ${contest.logo ? '<img src="' + contest.logo + '" style="max-height: 60px; max-width: 120px; margin-bottom: 10px; border-radius: 8px;">' : ''}
                    <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 18px;">${contest.title}</h4>
                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">${contest.description || ''}</p>
                </div>
                <div style="margin-left: 20px;">
                    ${existingApp ? statusBadge : '<button class="btn-primary" onclick="openStudentContestModal(' + contest.id + ')" style="white-space: nowrap; background: linear-gradient(90deg, #6366f1, #a855f7);"><i class="fas fa-paper-plane"></i> Ariza Jo\'natish</button>'}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 13px;">
                <div><i class="fas fa-calendar-alt" style="color: #6366f1;"></i> <strong>Muddat:</strong> ${contest.startDate && contest.endDate ? contest.startDate + ' - ' + contest.endDate : '-'}</div>
                <div><i class="fas fa-clock" style="color: #6366f1;"></i> <strong>Tanlov:</strong> ${contest.eventDate || '-'}</div>
                <div><i class="fas fa-map-marker-alt" style="color: #6366f1;"></i> <strong>Manzil:</strong> ${contest.address || '-'}</div>
                ${contest.nizom ? '<div style="grid-column: span 2;"><a href="' + contest.nizom + '" download="nizom.pdf" style="color: #6366f1; text-decoration: underline;"><i class="fas fa-file-pdf"></i> Tanlov nizomini yuklab olish</a></div>' : ''}
            </div>
        `;

        container.appendChild(card);
    });
}

function openStudentContestModal(contestId) {
    const contest = appData.contests.find(c => c.id == contestId);
    if (!contest) return;

    document.getElementById('selectedContestIdForStudent').value = contestId;
    document.getElementById('studentContestModalTitle').innerHTML = '<i class="fas fa-paper-plane"></i> ' + contest.title + ' - Ariza Jo\'natish';

    const infoDiv = document.getElementById('studentContestInfo');
    infoDiv.innerHTML = `
        <h4 style="color: #701a75; margin: 0 0 10px 0;">${contest.title}</h4>
        <p style="color: #86198f; margin: 0 0 10px 0; font-size: 14px;">${contest.description || ''}</p>
        <div style="font-size: 13px; color: #701a75;">
            <div><i class="fas fa-calendar-alt"></i> Muddat: ${contest.startDate && contest.endDate ? contest.startDate + ' - ' + contest.endDate : '-'}</div>
            <div><i class="fas fa-clock"></i> Tanlov kuni: ${contest.eventDate || '-'}</div>
            <div><i class="fas fa-map-marker-alt"></i> Manzil: ${contest.address || '-'}</div>
        </div>
    `;

    // Reset form
    document.getElementById('studentGiftedApplicationForm').reset();

    // Auto-fill passport if available
    const studentId = sessionStorage.getItem('studentId');
    const student = appData.students.find(s => s.id == studentId);

    const passportContainer = document.getElementById('studentPassportContainer');
    const passportInput = document.getElementById('studentGiftedFilePassport');
    const passportStatus = document.getElementById('studentPassportStatus');

    if (student && student.passport) {
        // Student has passport in system
        passportInput.removeAttribute('required');
        passportInput.style.display = 'none';
        passportStatus.innerHTML = '<div style="background: #dcfce7; color: #15803d; padding: 8px 12px; border-radius: 6px; font-size: 13px;"><i class="fas fa-check-circle"></i> Pasport nusxasi tizimda mavjud</div>';
        passportStatus.style.display = 'block';
    } else {
        // No passport in system
        passportInput.setAttribute('required', 'required');
        passportInput.style.display = 'block';
        passportStatus.style.display = 'none';
    }

    document.getElementById('studentContestModal').style.display = 'flex';
}

function closeStudentContestModal() {
    document.getElementById('studentContestModal').style.display = 'none';
}

async function submitStudentGiftedApplication(event) {
    event.preventDefault();

    const contestId = document.getElementById('selectedContestIdForStudent').value;
    const comment = document.getElementById('studentGiftedComment').value;
    const fileAriza = document.getElementById('studentGiftedFileAriza').files[0];
    const filePassport = document.getElementById('studentGiftedFilePassport').files[0];
    const fileOther = document.getElementById('studentGiftedFileOther').files[0];

    const studentId = sessionStorage.getItem('studentId');

    if (!studentId) {
        alert('Xatolik: Talaba ID topilmadi!');
        return;
    }

    // Check if already applied
    const existingApp = appData.gifted_applications.find(a =>
        a.contestId == contestId && a.studentId == studentId
    );

    if (existingApp) {
        alert('Siz bu tanlovga allaqachon ariza yuborgansiz!');
        return;
    }

    const application = {
        id: Date.now(),
        contestId: parseInt(contestId),
        studentId: parseInt(studentId),
        comment: comment,
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
    };

    // Handle files
    if (fileAriza) {
        application.fileAriza = await getBase64(fileAriza);
    }

    // Use existing passport from student data or uploaded file
    const student = appData.students.find(s => s.id == studentId);
    if (student && student.passport) {
        application.filePassport = student.passport;
    } else if (filePassport) {
        application.filePassport = await getBase64(filePassport);
    }

    if (fileOther) {
        application.fileOther = await getBase64(fileOther);
    }

    appData.gifted_applications.push(application);
    await saveToServer();

    alert('Arizangiz muvaffaqiyatli yuborildi!');
    closeStudentContestModal();
    loadStudentContestsList();
}

function loadStudentApplications() {
    console.log('loadStudentApplications called');
    const tbody = document.getElementById('studentApplicationsTableBody');
    // If not found, maybe we are in a tab that doesn't render it yet, but usually it's in HTML.
    // However, the tab logic calls this. 
    if (!tbody) {
        console.error('studentApplicationsTableBody not found in DOM');
        return;
    }

    tbody.innerHTML = '';
    const studentId = sessionStorage.getItem('studentId');
    console.log('Current Student ID:', studentId);
    console.log('All Applications:', appData.gifted_applications);

    // Ensure we match regardless of string/number type
    const apps = (appData.gifted_applications || []).filter(a => a.studentId == studentId);
    console.log('Filtered Applications:', apps);

    if (apps.length === 0) {
        const totalApps = (appData.gifted_applications || []).length;
        // Show debug info only if there are apps in system but not for this student, OR if completely empty just to be sure
        const debugMsg = ` (Jami tizimda: ${totalApps}, ID: ${studentId})`;
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: #94a3b8;">Topshirilgan arizalar yo'q<br><small>${debugMsg}</small></td></tr>`;
        return;
    }

    apps.forEach(app => {
        const contest = (appData.contests || []).find(c => c.id == app.contestId);
        const contestTitle = contest ? contest.title : 'Noma\'lum Tanlov (ID: ' + app.contestId + ')';

        let statusBadge = '';
        if (app.status === 'approved') {
            statusBadge = '<span style="background:#dcfce7; color:#15803d; padding:4px 8px; border-radius:12px; font-size:12px;">Qabul qilindi</span>';
        } else if (app.status === 'rejected') {
            statusBadge = '<span style="background:#fee2e2; color:#991b1b; padding:4px 8px; border-radius:12px; font-size:12px;">Rad etildi</span>';
        } else {
            statusBadge = '<span style="background:#e0f2fe; color:#0369a1; padding:4px 8px; border-radius:12px; font-size:12px;">Kutilmoqda</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${contestTitle}</td>
            <td>${app.date || '-'}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}
