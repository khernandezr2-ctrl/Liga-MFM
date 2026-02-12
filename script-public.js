// ========================================
// DATA STORAGE
// ========================================
let matches = [];
let teams = [];
let scorers = [];
let currentSection = 'partidos';

// ========================================
// INITIALIZE
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    loadMainLogo();
    renderAll();
    
    // Auto refresh every 30 seconds to get latest data
    setInterval(() => {
        loadData();
        renderAll();
    }, 30000);
});

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
                <p style="margin-top: 10px; color: #999;">Próximamente se agregarán los partidos</p>
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
            </div>
        `;
    }).join('');
}

function renderStandings() {
    const tbody = document.getElementById('standings-tbody');
    
    if (teams.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px;">
                    <div class="empty-state">
                        <div class="empty-state-icon">🏆</div>
                        <div class="empty-state-text">Tabla de posiciones en preparación</div>
                        <p style="margin-top: 10px; color: #999;">Próximamente se actualizará la tabla</p>
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
        </tr>
    `).join('');
}

function renderScorers() {
    const tbody = document.getElementById('scorers-tbody');
    
    if (scorers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px;">
                    <div class="empty-state">
                        <div class="empty-state-icon">👟</div>
                        <div class="empty-state-text">Tabla de goleadores en preparación</div>
                        <p style="margin-top: 10px; color: #999;">Próximamente se actualizarán los goleadores</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    scorers.sort((a, b) => b.goals - a.goals);
    
    tbody.innerHTML = scorers.map((scorer, index) => {
        let medalEmoji = '';
        if (index === 0) medalEmoji = '🥇 ';
        else if (index === 1) medalEmoji = '🥈 ';
        else if (index === 2) medalEmoji = '🥉 ';
        
        return `
            <tr>
                <td class="position">${index + 1}</td>
                <td>
                    <span style="font-weight: 600; font-size: 1.05em;">${medalEmoji}${scorer.name}</span>
                </td>
                <td>
                    <span class="table-team-name">${scorer.team}</span>
                </td>
                <td class="center">
                    <span class="goals-badge">${scorer.goals}</span>
                </td>
            </tr>
        `;
    }).join('');
}

function getDefaultLogo() {
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23e2e8f0"/><text x="50" y="60" font-size="30" fill="%236b7280" text-anchor="middle" font-family="Arial">?</text></svg>';
}

// ========================================
// LOCAL STORAGE (READ ONLY)
// ========================================
function loadData() {
    const savedMatches = localStorage.getItem('ligaMFMMatches');
    const savedTeams = localStorage.getItem('ligaMFMTeams');
    const savedScorers = localStorage.getItem('ligaMFMScorers');
    
    if (savedMatches) matches = JSON.parse(savedMatches);
    if (savedTeams) teams = JSON.parse(savedTeams);
    if (savedScorers) scorers = JSON.parse(savedScorers);
}