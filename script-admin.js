// ========================================
// CONFIGURACIÓN - CAMBIA LA CONTRASEÑA AQUÍ
// ========================================
const ADMIN_PASSWORD = "admin123"; // CAMBIA ESTA CONTRASEÑA

// ========================================
// DATA STORAGE
// ========================================
let matches = [];
let teams = [];
let scorers = [];
let currentSection = 'partidos';
let isLoggedIn = false;

// ========================================
// INITIALIZE
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    checkLogin();
});

// ========================================
// LOGIN SYSTEM
// ========================================
function login(event) {
    event.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        isLoggedIn = true;
        sessionStorage.setItem('ligaMFMAdmin', 'true');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        loadData();
        loadMainLogo();
        renderAll();
    } else {
        document.getElementById('loginError').style.display = 'block';
        document.getElementById('adminPassword').value = '';
    }
}

function logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        sessionStorage.removeItem('ligaMFMAdmin');
        location.reload();
    }
}

function checkLogin() {
    if (sessionStorage.getItem('ligaMFMAdmin') === 'true') {
        isLoggedIn = true;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        loadData();
        loadMainLogo();
        renderAll();
    }
}

// ========================================
// MAIN LOGO
// ========================================
function loadMainLogo() {
    const mainLogo = document.getElementById('mainLogo');
    const savedLogo = localStorage.getItem('ligaMFMLogo');
    if (savedLogo) {
        mainLogo.src = savedLogo;
    } else {
        mainLogo.src = 'Logo MFM.png';
    }
}

// ========================================
// SECTION NAVIGATION
// ========================================
function showSection(sectionName) {
    currentSection = sectionName;
    
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionName).classList.add('active');
}

// ========================================
// MODAL FUNCTIONS
// ========================================
function openAddModal() {
    if (currentSection === 'partidos') {
        openMatchModal();
    } else if (currentSection === 'posiciones') {
        openTeamModal();
    } else if (currentSection === 'estadisticas') {
        openScorerModal();
    }
}

function openMatchModal(matchId = null) {
    const modal = document.getElementById('matchModal');
    const form = document.getElementById('matchForm');
    form.reset();
    
    document.getElementById('homeLogoPreview').style.display = 'none';
    document.getElementById('awayLogoPreview').style.display = 'none';
    
    if (matchId !== null) {
        const match = matches.find(m => m.id === matchId);
        if (match) {
            document.getElementById('matchId').value = match.id;
            document.getElementById('matchDate').value = match.date;
            document.getElementById('matchTime').value = match.time;
            document.getElementById('homeTeam').value = match.homeTeam;
            document.getElementById('awayTeam').value = match.awayTeam;
            
            if (match.homeLogo) {
                document.getElementById('homeLogoPreview').src = match.homeLogo;
                document.getElementById('homeLogoPreview').style.display = 'block';
            }
            if (match.awayLogo) {
                document.getElementById('awayLogoPreview').src = match.awayLogo;
                document.getElementById('awayLogoPreview').style.display = 'block';
            }
        }
    }
    
    modal.classList.add('active');
}

function openTeamModal(teamId = null) {
    const modal = document.getElementById('teamModal');
    const form = document.getElementById('teamForm');
    form.reset();
    
    document.getElementById('teamLogoPreview').style.display = 'none';
    
    if (teamId !== null) {
        const team = teams.find(t => t.id === teamId);
        if (team) {
            document.getElementById('teamId').value = team.id;
            document.getElementById('teamName').value = team.name;
            document.getElementById('teamPJ').value = team.pj;
            document.getElementById('teamG').value = team.g;
            document.getElementById('teamE').value = team.e;
            document.getElementById('teamP').value = team.p;
            document.getElementById('teamGF').value = team.gf;
            document.getElementById('teamGC').value = team.gc;
            
            if (team.logo) {
                document.getElementById('teamLogoPreview').src = team.logo;
                document.getElementById('teamLogoPreview').style.display = 'block';
            }
        }
    }
    
    modal.classList.add('active');
}

function openScorerModal(scorerId = null) {
    const modal = document.getElementById('scorerModal');
    const form = document.getElementById('scorerForm');
    form.reset();
    
    if (scorerId !== null) {
        const scorer = scorers.find(s => s.id === scorerId);
        if (scorer) {
            document.getElementById('scorerId').value = scorer.id;
            document.getElementById('scorerName').value = scorer.name;
            document.getElementById('scorerTeam').value = scorer.team;
            document.getElementById('scorerGoals').value = scorer.goals;
        }
    }
    
    modal.classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ========================================
// PREVIEW LOGO
// ========================================
function previewLogo(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ========================================
// SAVE FUNCTIONS
// ========================================
function saveMatch(event) {
    event.preventDefault();
    
    const matchId = document.getElementById('matchId').value;
    
    const matchData = {
        id: matchId || Date.now(),
        date: document.getElementById('matchDate').value,
        time: document.getElementById('matchTime').value,
        homeTeam: document.getElementById('homeTeam').value,
        awayTeam: document.getElementById('awayTeam').value,
        homeLogo: document.getElementById('homeLogoPreview').src,
        awayLogo: document.getElementById('awayLogoPreview').src
    };
    
    if (matchId) {
        const index = matches.findIndex(m => m.id == matchId);
        matches[index] = matchData;
    } else {
        matches.push(matchData);
    }
    
    saveData();
    renderMatches();
    closeModal('matchModal');
}

function saveTeam(event) {
    event.preventDefault();
    
    const teamId = document.getElementById('teamId').value;
    const pj = parseInt(document.getElementById('teamPJ').value);
    const g = parseInt(document.getElementById('teamG').value);
    const e = parseInt(document.getElementById('teamE').value);
    const p = parseInt(document.getElementById('teamP').value);
    const gf = parseInt(document.getElementById('teamGF').value);
    const gc = parseInt(document.getElementById('teamGC').value);
    
    const teamData = {
        id: teamId || Date.now(),
        name: document.getElementById('teamName').value,
        logo: document.getElementById('teamLogoPreview').src || '',
        pj: pj,
        g: g,
        e: e,
        p: p,
        gf: gf,
        gc: gc,
        dg: gf - gc,
        pts: (g * 3) + e
    };
    
    if (teamId) {
        const index = teams.findIndex(t => t.id == teamId);
        teams[index] = teamData;
    } else {
        teams.push(teamData);
    }
    
    saveData();
    renderStandings();
    closeModal('teamModal');
}

function saveScorer(event) {
    event.preventDefault();
    
    const scorerId = document.getElementById('scorerId').value;
    
    const scorerData = {
        id: scorerId || Date.now(),
        name: document.getElementById('scorerName').value,
        team: document.getElementById('scorerTeam').value,
        goals: parseInt(document.getElementById('scorerGoals').value)
    };
    
    if (scorerId) {
        const index = scorers.findIndex(s => s.id == scorerId);
        scorers[index] = scorerData;
    } else {
        scorers.push(scorerData);
    }
    
    saveData();
    renderScorers();
    closeModal('scorerModal');
}

// ========================================
// DELETE FUNCTIONS
// ========================================
function deleteMatch(matchId) {
    if (confirm('¿Estás seguro de eliminar este partido?')) {
        matches = matches.filter(m => m.id !== matchId);
        saveData();
        renderMatches();
    }
}

function deleteTeam(teamId) {
    if (confirm('¿Estás seguro de eliminar este equipo?')) {
        teams = teams.filter(t => t.id !== teamId);
        saveData();
        renderStandings();
    }
}

function deleteScorer(scorerId) {
    if (confirm('¿Estás seguro de eliminar este goleador?')) {
        scorers = scorers.filter(s => s.id !== scorerId);
        saveData();
        renderScorers();
    }
}

// ========================================
// RENDER FUNCTIONS
// ========================================
function renderAll() {
    renderMatches();
    renderStandings();
    renderScorers();
}

function renderMatches() {
    const container = document.getElementById('matches-container');
    
    if (matches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚽</div>
                <div class="empty-state-text">No hay partidos programados</div>
                <p style="margin-top: 10px; color: #999;">Haz clic en el botón + para agregar un partido</p>
            </div>
        `;
        return;
    }
    
    matches.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    
    container.innerHTML = matches.map(match => {
        const matchDate = new Date(match.date);
        const formattedDate = matchDate.toLocaleDateString('es-ES', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `
            <div class="match-card">
                <div class="match-header">
                    <div class="match-date">${formattedDate}</div>
                    <div class="match-time">${match.time}</div>
                </div>
                <div class="match-teams">
                    <div class="team">
                        <img src="${match.homeLogo || getDefaultLogo()}" alt="${match.homeTeam}" class="team-logo">
                        <div class="team-name">${match.homeTeam}</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team">
                        <img src="${match.awayLogo || getDefaultLogo()}" alt="${match.awayTeam}" class="team-logo">
                        <div class="team-name">${match.awayTeam}</div>
                    </div>
                </div>
                <div class="match-actions">
                    <button class="btn btn-secondary btn-small" onclick="openMatchModal(${match.id})">✏️ Editar</button>
                    <button class="btn btn-danger btn-small" onclick="deleteMatch(${match.id})">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderStandings() {
    const tbody = document.getElementById('standings-tbody');
    
    if (teams.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px;">
                    <div class="empty-state">
                        <div class="empty-state-icon">🏆</div>
                        <div class="empty-state-text">No hay equipos registrados</div>
                        <p style="margin-top: 10px; color: #999;">Haz clic en el botón + para agregar un equipo</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    teams.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gf - a.gf;
    });
    
    tbody.innerHTML = teams.map((team, index) => `
        <tr>
            <td class="position">${index + 1}</td>
            <td>
                <div class="team-info">
                    <img src="${team.logo || getDefaultLogo()}" alt="${team.name}" class="table-team-logo">
                    <span class="table-team-name">${team.name}</span>
                </div>
            </td>
            <td class="center">${team.pj}</td>
            <td class="center">${team.g}</td>
            <td class="center">${team.e}</td>
            <td class="center">${team.p}</td>
            <td class="center">${team.gf}</td>
            <td class="center">${team.gc}</td>
            <td class="center">${team.dg > 0 ? '+' : ''}${team.dg}</td>
            <td class="center"><span class="points">${team.pts}</span></td>
            <td class="center">
                <button class="btn btn-secondary btn-small" onclick="openTeamModal(${team.id})" style="margin-right: 5px;">✏️</button>
                <button class="btn btn-danger btn-small" onclick="deleteTeam(${team.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function renderScorers() {
    const tbody = document.getElementById('scorers-tbody');
    
    if (scorers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <div class="empty-state">
                        <div class="empty-state-icon">👟</div>
                        <div class="empty-state-text">No hay goleadores registrados</div>
                        <p style="margin-top: 10px; color: #999;">Haz clic en el botón + para agregar un goleador</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    scorers.sort((a, b) => b.goals - a.goals);
    
    tbody.innerHTML = scorers.map((scorer, index) => `
        <tr>
            <td class="position">${index + 1}</td>
            <td>
                <span style="font-weight: 600; font-size: 1.05em;">${scorer.name}</span>
            </td>
            <td>
                <span class="table-team-name">${scorer.team}</span>
            </td>
            <td class="center">
                <span class="goals-badge">${scorer.goals}</span>
            </td>
            <td class="center">
                <button class="btn btn-secondary btn-small" onclick="openScorerModal(${scorer.id})" style="margin-right: 5px;">✏️</button>
                <button class="btn btn-danger btn-small" onclick="deleteScorer(${scorer.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function getDefaultLogo() {
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23e2e8f0"/><text x="50" y="60" font-size="30" fill="%236b7280" text-anchor="middle" font-family="Arial">?</text></svg>';
}

// ========================================
// LOCAL STORAGE
// ========================================
function saveData() {
    localStorage.setItem('ligaMFMMatches', JSON.stringify(matches));
    localStorage.setItem('ligaMFMTeams', JSON.stringify(teams));
    localStorage.setItem('ligaMFMScorers', JSON.stringify(scorers));
}

function loadData() {
    const savedMatches = localStorage.getItem('ligaMFMMatches');
    const savedTeams = localStorage.getItem('ligaMFMTeams');
    const savedScorers = localStorage.getItem('ligaMFMScorers');
    
    if (savedMatches) matches = JSON.parse(savedMatches);
    if (savedTeams) teams = JSON.parse(savedTeams);
    if (savedScorers) scorers = JSON.parse(savedScorers);
    
    if (matches.length === 0 && teams.length === 0 && scorers.length === 0) {
        loadSampleData();
    }
}

function loadSampleData() {
    teams = [
        { id: 1, name: 'Barcelona FC', logo: '', pj: 23, g: 19, e: 1, p: 3, gf: 63, gc: 23, dg: 40, pts: 58 },
        { id: 2, name: 'Real Madrid', logo: '', pj: 23, g: 18, e: 3, p: 2, gf: 49, gc: 18, dg: 31, pts: 57 },
        { id: 3, name: 'Atlético Madrid', logo: '', pj: 23, g: 13, e: 6, p: 4, gf: 38, gc: 18, dg: 20, pts: 45 },
        { id: 4, name: 'Villarreal', logo: '', pj: 22, g: 14, e: 3, p: 5, gf: 43, gc: 24, dg: 19, pts: 45 }
    ];
    
    scorers = [
        { id: 1, name: 'Cristiano Ronaldo', team: 'Barcelona FC', goals: 25 },
        { id: 2, name: 'Lionel Messi', team: 'Real Madrid', goals: 22 },
        { id: 3, name: 'Luis Suárez', team: 'Atlético Madrid', goals: 18 },
        { id: 4, name: 'Karim Benzema', team: 'Villarreal', goals: 15 },
        { id: 5, name: 'Antoine Griezmann', team: 'Barcelona FC', goals: 12 }
    ];
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    matches = [
        { 
            id: 1, 
            date: tomorrow.toISOString().split('T')[0], 
            time: '20:00', 
            homeTeam: 'Barcelona FC', 
            awayTeam: 'Real Madrid', 
            homeLogo: '', 
            awayLogo: '' 
        },
        { 
            id: 2, 
            date: nextWeek.toISOString().split('T')[0], 
            time: '18:30', 
            homeTeam: 'Atlético Madrid', 
            awayTeam: 'Villarreal', 
            homeLogo: '', 
            awayLogo: '' 
        }
    ];
    
    saveData();
}

// ========================================
// CLOSE MODAL ON OUTSIDE CLICK
// ========================================
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}