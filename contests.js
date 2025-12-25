// Contest Management Functions

let currentContestId = null;
let requiredDocuments = [];

function openContestModal(contestId = null) {
    const modal = document.getElementById('contestModal');
    const modalTitle = document.getElementById('contestModalTitle');
    const form = document.getElementById('contestForm');

    form.reset();
    document.getElementById('modalLogoPreview').style.display = 'none';
    requiredDocuments = [];

    if (contestId) {
        // Edit mode
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Tanlovni Tahrirlash';
        const contest = appData.contests.find(c => c.id == contestId);
        if (contest) {
            document.getElementById('contestId').value = contest.id;
            document.getElementById('modalContestTitle').value = contest.title || '';
            document.getElementById('modalContestDesc').value = contest.description || '';
            document.getElementById('modalContestStart').value = contest.startDate || '';
            document.getElementById('modalContestEnd').value = contest.endDate || '';
            document.getElementById('modalContestEvent').value = contest.eventDate || '';
            document.getElementById('modalContestAddress').value = contest.address || '';

            if (contest.logo) {
                const logoPreview = document.getElementById('modalLogoPreview');
                const logoImg = document.getElementById('modalLogoImg');
                logoImg.src = contest.logo;
                logoPreview.style.display = 'block';
            }

            if (contest.requiredDocuments) {
                requiredDocuments = [...contest.requiredDocuments];
            }
        }
    } else {
        // Create mode
        modalTitle.innerHTML = '<i class="fas fa-plus"></i> Yangi Tanlov Qo\'shish';
        document.getElementById('contestId').value = '';
    }

    renderRequiredDocuments();
    modal.style.display = 'flex';

    // Add logo preview on file select
    const logoInput = document.getElementById('modalContestLogo');
    logoInput.onchange = async function () {
        if (this.files[0]) {
            const logoBase64 = await getBase64(this.files[0]);
            const logoPreview = document.getElementById('modalLogoPreview');
            const logoImg = document.getElementById('modalLogoImg');
            logoImg.src = logoBase64;
            logoPreview.style.display = 'block';
        }
    };
}

function closeContestModal() {
    document.getElementById('contestModal').style.display = 'none';
}

function addRequiredDocument() {
    const docName = prompt('Hujjat nomini kiriting:');
    if (docName && docName.trim()) {
        requiredDocuments.push(docName.trim());
        renderRequiredDocuments();
    }
}

function removeRequiredDocument(index) {
    requiredDocuments.splice(index, 1);
    renderRequiredDocuments();
}

function renderRequiredDocuments() {
    const container = document.getElementById('requiredDocumentsList');
    if (!container) return;

    if (requiredDocuments.length === 0) {
        container.innerHTML = '<p style="color: #64748b; font-size: 13px; margin: 0;">Qo\'shimcha hujjatlar yo\'q</p>';
        return;
    }

    container.innerHTML = requiredDocuments.map((doc, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 8px;">
            <span style="font-size: 14px;"><i class="fas fa-file-alt"></i> ${doc}</span>
            <button type="button" onclick="removeRequiredDocument(${index})" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

async function saveContest(event) {
    event.preventDefault();

    const contestId = document.getElementById('contestId').value;
    const title = document.getElementById('modalContestTitle').value;
    const description = document.getElementById('modalContestDesc').value;
    const startDate = document.getElementById('modalContestStart').value;
    const endDate = document.getElementById('modalContestEnd').value;
    const eventDate = document.getElementById('modalContestEvent').value;
    const address = document.getElementById('modalContestAddress').value;

    if (!title) {
        alert('Tanlov nomini kiriting!');
        return;
    }

    let contest;

    if (contestId) {
        // Update existing
        contest = appData.contests.find(c => c.id == contestId);
        if (contest) {
            contest.title = title;
            contest.description = description;
            contest.startDate = startDate;
            contest.endDate = endDate;
            contest.eventDate = eventDate;
            contest.address = address;
            contest.requiredDocuments = [...requiredDocuments];
        }
    } else {
        // Create new
        contest = {
            id: Date.now(),
            title: title,
            description: description,
            startDate: startDate,
            endDate: endDate,
            eventDate: eventDate,
            address: address,
            requiredDocuments: [...requiredDocuments],
            status: 'active',
            createdAt: new Date().toISOString()
        };

        if (!appData.contests) appData.contests = [];
        appData.contests.push(contest);
    }

    // Handle logo
    const logoInput = document.getElementById('modalContestLogo');
    if (logoInput.files[0]) {
        const logoBase64 = await getBase64(logoInput.files[0]);
        contest.logo = logoBase64;
    }

    // Handle nizom
    const nizomInput = document.getElementById('modalContestNizom');
    if (nizomInput.files[0]) {
        const nizomBase64 = await getBase64(nizomInput.files[0]);
        contest.nizom = nizomBase64;
    }

    await saveToServer();
    alert('Tanlov saqlandi!');
    closeContestModal();
    loadContestsList();
}

function loadContestsList() {
    const tbody = document.getElementById('contestsListTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const contests = appData.contests || [];

    if (contests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#888;">Hozircha tanlovlar yo\'q</td></tr>';
        return;
    }

    contests.forEach(contest => {
        const applicationsCount = (appData.gifted_applications || []).filter(a => a.contestId == contest.id).length;

        const statusBadge = contest.status === 'active'
            ? '<span style="background:#dcfce7; color:#15803d; padding:4px 8px; border-radius:12px; font-size:11px;">Faol</span>'
            : '<span style="background:#fee2e2; color:#991b1b; padding:4px 8px; border-radius:12px; font-size:11px;">Tugagan</span>';

        const dateRange = contest.startDate && contest.endDate
            ? `${contest.startDate} - ${contest.endDate}`
            : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${contest.title}</strong></td>
            <td>${dateRange}</td>
            <td>${contest.eventDate || '-'}</td>
            <td>${statusBadge}</td>
            <td><span style="background:#e0f2fe; color:#0369a1; padding:4px 8px; border-radius:12px; font-size:11px;">${applicationsCount} ta</span></td>
            <td>
                <div style="display:flex; gap: 5px;">
                    <button class="btn-primary" style="background:#3b82f6; padding: 4px 8px;" onclick="viewContestApplications(${contest.id})" title="Arizalarni ko'rish"><i class="fas fa-eye"></i></button>
                    <button class="btn-primary" style="background:#f59e0b; padding: 4px 8px;" onclick="openContestModal(${contest.id})" title="Tahrirlash"><i class="fas fa-edit"></i></button>
                    <button class="btn-primary" style="background:#ef4444; padding: 4px 8px;" onclick="deleteContest(${contest.id})" title="O'chirish"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function viewContestApplications(contestId) {
    currentContestId = contestId;
    const contest = appData.contests.find(c => c.id == contestId);
    if (!contest) return;

    document.getElementById('selectedContestName').innerText = contest.title;
    document.getElementById('contestApplicationsCard').style.display = 'block';

    loadGiftedApplications(contestId);

    // Scroll to applications
    document.getElementById('contestApplicationsCard').scrollIntoView({ behavior: 'smooth' });
}

async function deleteContest(id) {
    if (!confirm('Ushbu tanlovni o\'chirishni xohlaysizmi? Barcha arizalar ham o\'chiriladi!')) return;

    appData.contests = appData.contests.filter(c => c.id != id);
    appData.gifted_applications = appData.gifted_applications.filter(a => a.contestId != id);

    await saveToServer();
    loadContestsList();
    document.getElementById('contestApplicationsCard').style.display = 'none';
}
