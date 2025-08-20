// Global variables
let allSchoolsData = [];
let filteredData = [];
let selectedSchools = new Set();
let charts = {};
let comparisonCharts = {};

// DOM elements
const loadingIndicator = document.getElementById('loadingIndicator');
const mainContent = document.getElementById('mainContent');
const searchInput = document.getElementById('searchInput');
const schoolTypeFilter = document.getElementById('schoolTypeFilter');
const projectStatusFilter = document.getElementById('projectStatusFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const exportDataBtn = document.getElementById('exportData');
const schoolsList = document.getElementById('schoolsList');
const resultsCount = document.getElementById('resultsCount');

// Comparison elements
const comparisonPanel = document.getElementById('comparisonPanel');
const selectedCount = document.getElementById('selectedCount');
const clearSelectionBtn = document.getElementById('clearSelection');
const exportComparisonBtn = document.getElementById('exportComparison');
const selectAllBtn = document.getElementById('selectAll');
const deselectAllBtn = document.getElementById('deselectAll');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadCSVData();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', debounce(applyFilters, 300));
    schoolTypeFilter.addEventListener('change', applyFilters);
    projectStatusFilter.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', clearAllFilters);
    exportDataBtn.addEventListener('click', exportFilteredData);
    
    // Comparison event listeners
    clearSelectionBtn.addEventListener('click', clearSelection);
    exportComparisonBtn.addEventListener('click', exportComparison);
    selectAllBtn.addEventListener('click', selectAllVisible);
    deselectAllBtn.addEventListener('click', deselectAll);
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load and parse CSV data
function loadCSVData() {
    Papa.parse('(Visual) PROJETOS DESENVOLVIDOS NAS UNIDADES ESCOLARES - 2º SEMESTRE (respostas) - Respostas ao formulário 1.csv', {
        download: true,
        header: true,
        encoding: 'UTF-8',
        complete: function(results) {
            console.log('CSV loaded successfully:', results.data.length, 'records');
            processData(results.data);
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
            showError('Erro ao carregar os dados. Verifique se o arquivo CSV está disponível.');
        }
    });
}

// Process and clean the data
function processData(rawData) {
    allSchoolsData = rawData.map((row, index) => {
        // Extract school name and type
        const schoolName = row['NOME DA ESCOLA '] || '';
        const schoolType = extractSchoolType(schoolName);
        
        // Clean and process project status
        const hasActiveProjects = normalizeYesNo(row['A UNIDADE ESCOLAR POSSUI PROJETOS ATIVOS?']);
        const hasIntegralPeriod = detectIntegralPeriod(row);
        const hasPartnerships = detectPartnerships(row);
        
        // Extract projects information
        const activeProjects = row['QUAIS PROJETOS ESTÃO ATIVOS NA SUA UNIDADE ESCOLAR?'] || '';
        const projectsForCommunity = row['FALE SOBRE OS PROJETOS DESTINADOS À COMUNIDADE'] || '';
        const projectsForChildren = row['FALE SOBRE OS PROJETOS DESTINADOS APENAS PARA AS CRIANÇAS'] || '';
        
        // Extract partnerships from multiple possible columns
        const partnerships = extractPartnerships(row);
        
        // Extract integral period information
        const integralYears = row['QUAIS ANOS SÃO ATENDIDOS NO PERÍODO INTEGRAL?'] || '';
        const integralProjects = row['QUAIS PROJETOS ESTÃO ATIVOS NA SUA UNIDADE ESCOLAR? (TEMPO INTEGRAL)'] || '';
        const integralPeriod = row['PERÍODO DE REALIZAÇÃO (TEMPO INTEGRAL)'] || '';
        const integralProjectStartDate = row['DESDE QUANDO ESSES PROJETOS ESTÃO ATIVOS?'] || '';
        const integralChildrenProjects = row['DESCREVA OS PROJETOS DESTINADOS APENAS PARA AS CRIANÇAS'] || '';
        
        return {
            id: index,
            timestamp: row['Carimbo de data/hora'] || '',
            schoolName: schoolName.trim(),
            schoolType: schoolType,
            responsible: row['DADOS DO RESPONSÁVEL PELO PREENCHIMENTO:'] || '',
            hasActiveProjects: hasActiveProjects,
            hasIntegralPeriod: hasIntegralPeriod,
            hasPartnerships: hasPartnerships,
            activeProjects: activeProjects.trim(),
            projectsForCommunity: projectsForCommunity.trim(),
            projectsForChildren: projectsForChildren.trim(),
            partnerships: partnerships.trim(),
            integralYears: integralYears.trim(),
            integralProjects: integralProjects.trim(),
            integralPeriod: integralPeriod.trim(),
            integralProjectStartDate: integralProjectStartDate.trim(),
            integralChildrenProjects: integralChildrenProjects.trim(),
            projectStartDate: row['DESDE QUANDO ESSES PROJETOS ESTÃO ATIVOS?'] || '',
            futurePlans: normalizeYesNo(row['EXISTE PREVISÃO DE ALGUM  PROJETO QUE SERÁ INICIADO AINDA ESTE ANO? '])
        };
    }).filter(school => school.schoolName); // Remove empty entries

    console.log('Processed data:', allSchoolsData.length, 'schools');
    
    // Debug: Log integral period detection
    const integralSchools = allSchoolsData.filter(school => school.hasIntegralPeriod);
    console.log('Schools with integral period detected:', integralSchools.length);
    console.log('Integral schools:', integralSchools.map(s => s.schoolName));
    
    // Debug: Log partnership detection
    const partnershipSchools = allSchoolsData.filter(school => school.hasPartnerships);
    console.log('Schools with partnerships detected:', partnershipSchools.length);
    
    // Initialize the dashboard
    filteredData = [...allSchoolsData];
    populateFilters();
    updateMetrics();
    createCharts();
    renderSchoolsList();
    updateLastUpdateTime();
    
    // Hide loading and show content
    loadingIndicator.style.display = 'none';
    mainContent.style.display = 'block';
}

// Extract school type from school name
function extractSchoolType(schoolName) {
    const name = schoolName.toUpperCase();
    if (name.includes('CEI/EMEI')) return 'CEI/EMEI';
    if (name.includes('EMEI/EMEF')) return 'EMEI/EMEF';
    if (name.includes('CEI')) return 'CEI';
    if (name.includes('EMEI')) return 'EMEI';
    if (name.includes('EMEF')) return 'EMEF';
    if (name.includes('CIEFI')) return 'CIEFI';
    if (name.includes('CIASE')) return 'CIASE';
    if (name.includes('EMEFEBS')) return 'EMEFEBS';
    return 'Outros';
}

// Normalize yes/no responses
function normalizeYesNo(value) {
    if (!value) return false;
    const normalized = value.toString().toLowerCase().trim();
    return normalized === 'sim' || normalized === 'yes' || normalized === 's';
}

// Detect integral period with multiple indicators
function detectIntegralPeriod(row) {
    // Check explicit integral period columns
    const explicitIntegral = normalizeYesNo(row['A ESCOLA TEM PERÍODO INTEGRAL?']) || 
                            normalizeYesNo(row['A ESCOLA TEM PERÍODO INTEGRAL?']);
    
    if (explicitIntegral) return true;
    
    // Check if there are integral years specified
    const integralYears = row['QUAIS ANOS SÃO ATENDIDOS NO PERÍODO INTEGRAL?'] || '';
    if (integralYears.trim() && 
        integralYears.trim() !== 'Não se aplica' && 
        integralYears.trim() !== 'não se aplica' &&
        integralYears.trim() !== 'Não temos' &&
        integralYears.trim() !== 'não temos') {
        return true;
    }
    
    // Check if there are integral projects specified
    const integralProjects = row['QUAIS PROJETOS ESTÃO ATIVOS NA SUA UNIDADE ESCOLAR? (TEMPO INTEGRAL)'] || '';
    if (integralProjects.trim() && 
        integralProjects.trim() !== 'Não temos' &&
        integralProjects.trim() !== 'não temos' &&
        integralProjects.trim() !== 'Nenhum' &&
        integralProjects.trim() !== 'nenhum') {
        return true;
    }
    
    // Check for integral keywords in active projects
    const activeProjects = row['QUAIS PROJETOS ESTÃO ATIVOS NA SUA UNIDADE ESCOLAR?'] || '';
    const projectsText = activeProjects.toLowerCase();
    
    // Look for integral indicators in project descriptions
    const integralKeywords = [
        'integral',
        'tempo integral',
        'período integral',
        'escola integral',
        'turno integral',
        'jornada ampliada',
        'contraturno',
        'contra turno'
    ];
    
    const hasIntegralKeywords = integralKeywords.some(keyword => 
        projectsText.includes(keyword)
    );
    
    if (hasIntegralKeywords) return true;
    
    // Check in project descriptions for children
    const childrenProjects = row['FALE SOBRE OS PROJETOS DESTINADOS APENAS PARA AS CRIANÇAS'] || '';
    const childrenText = childrenProjects.toLowerCase();
    
    const hasIntegralInChildren = integralKeywords.some(keyword => 
        childrenText.includes(keyword)
    );
    
    if (hasIntegralInChildren) return true;
    
    // Check for specific integral period mentions
    const periodRealization = row['PERÍODO DE REALIZAÇÃO (TEMPO INTEGRAL)'] || '';
    if (periodRealization.trim() && 
        periodRealization.trim() !== 'Não se aplica' &&
        periodRealization.trim() !== 'não se aplica') {
        return true;
    }
    
    // Check responsible field for integral mentions (some schools put it there)
    const responsible = row['DADOS DO RESPONSÁVEL PELO PREENCHIMENTO:'] || '';
    if (responsible.toLowerCase().includes('integral')) {
        return true;
    }
    
    return false;
}

// Detect partnerships with multiple indicators
function detectPartnerships(row) {
    // Check explicit partnership columns
    const explicitPartnerships = normalizeYesNo(row['OS PROJETOS POSSUEM  ALGUMA PARCERIA?']) ||
                                normalizeYesNo(row['OS PROJETOS POSSUEM  ALGUMA PARCERIA?']);
    
    if (explicitPartnerships) return true;
    
    // Check if partnerships are actually listed
    const partnerships1 = row['QUAIS PARCERIAS'] || '';
    const partnerships2 = row['QUAIS PARCERIAS'] || '';
    
    const hasPartnershipsList = (partnerships1.trim() && 
                                partnerships1.trim() !== 'Não tem' &&
                                partnerships1.trim() !== 'não tem' &&
                                partnerships1.trim() !== 'Não possui' &&
                                partnerships1.trim() !== 'não possui' &&
                                partnerships1.trim() !== 'Nenhuma' &&
                                partnerships1.trim() !== 'nenhuma') ||
                               (partnerships2.trim() && 
                                partnerships2.trim() !== 'Não tem' &&
                                partnerships2.trim() !== 'não tem' &&
                                partnerships2.trim() !== 'Não possui' &&
                                partnerships2.trim() !== 'não possui' &&
                                partnerships2.trim() !== 'Nenhuma' &&
                                partnerships2.trim() !== 'nenhuma');
    
    if (hasPartnershipsList) return true;
    
    // Look for partnership keywords in project descriptions
    const activeProjects = row['QUAIS PROJETOS ESTÃO ATIVOS NA SUA UNIDADE ESCOLAR?'] || '';
    const communityProjects = row['FALE SOBRE OS PROJETOS DESTINADOS À COMUNIDADE'] || '';
    const childrenProjects = row['FALE SOBRE OS PROJETOS DESTINADOS APENAS PARA AS CRIANÇAS'] || '';
    
    const allProjectText = (activeProjects + ' ' + communityProjects + ' ' + childrenProjects).toLowerCase();
    
    const partnershipKeywords = [
        'parceria',
        'parceiro',
        'colaboração',
        'apoio',
        'seduc',
        'secretaria',
        'petrobrás',
        'petrobras',
        'fundacc',
        'ubs',
        'saúde',
        'polícia',
        'bombeiro',
        'comunidade',
        'voluntário',
        'empresa',
        'instituto',
        'ong',
        'associação'
    ];
    
    const hasPartnershipKeywords = partnershipKeywords.some(keyword => 
        allProjectText.includes(keyword)
    );
    
    return hasPartnershipKeywords;
}

// Extract partnerships from multiple columns
function extractPartnerships(row) {
    const partnerships = [];
    
    // Check all possible partnership columns
    const partnershipColumns = [
        'QUAIS PARCERIAS',
        'QUAIS PARCERIAS'  // There might be duplicate columns
    ];
    
    partnershipColumns.forEach(column => {
        const value = row[column];
        if (value && value.trim() && 
            value.trim() !== 'Não tem' &&
            value.trim() !== 'não tem' &&
            value.trim() !== 'Não possui' &&
            value.trim() !== 'não possui' &&
            value.trim() !== 'Nenhuma' &&
            value.trim() !== 'nenhuma' &&
            value.trim() !== 'não' &&
            value.trim() !== 'Não') {
            partnerships.push(value.trim());
        }
    });
    
    // If no explicit partnerships found, try to extract from project descriptions
    if (partnerships.length === 0) {
        const activeProjects = row['QUAIS PROJETOS ESTÃO ATIVOS NA SUA UNIDADE ESCOLAR?'] || '';
        const communityProjects = row['FALE SOBRE OS PROJETOS DESTINADOS À COMUNIDADE'] || '';
        const childrenProjects = row['FALE SOBRE OS PROJETOS DESTINADOS APENAS PARA AS CRIANÇAS'] || '';
        
        const allText = (activeProjects + ' ' + communityProjects + ' ' + childrenProjects).toLowerCase();
        
        // Extract common partnerships mentioned in text
        const commonPartnerships = [
            { keyword: 'seduc', name: 'Secretaria de Educação' },
            { keyword: 'secretaria de educação', name: 'Secretaria de Educação' },
            { keyword: 'petrobrás', name: 'Petrobrás' },
            { keyword: 'petrobras', name: 'Petrobrás' },
            { keyword: 'fundacc', name: 'FUNDACC' },
            { keyword: 'ubs', name: 'UBS' },
            { keyword: 'saúde', name: 'Secretaria de Saúde' },
            { keyword: 'polícia militar', name: 'Polícia Militar' },
            { keyword: 'bombeiro', name: 'Corpo de Bombeiros' },
            { keyword: 'uniodonto', name: 'Uniodonto' },
            { keyword: 'sesi', name: 'SESI' }
        ];
        
        commonPartnerships.forEach(partnership => {
            if (allText.includes(partnership.keyword)) {
                partnerships.push(partnership.name);
            }
        });
    }
    
    return partnerships.join(', ');
}

// Populate filter dropdowns
function populateFilters() {
    // School types
    const schoolTypes = [...new Set(allSchoolsData.map(school => school.schoolType))].sort();
    schoolTypeFilter.innerHTML = '<option value="">Todos os tipos</option>';
    schoolTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        schoolTypeFilter.appendChild(option);
    });
}

// Update metrics cards
function updateMetrics() {
    const totalSchools = filteredData.length;
    const activeProjects = filteredData.filter(school => school.hasActiveProjects).length;
    const integralSchools = filteredData.filter(school => school.hasIntegralPeriod).length;
    const partnerships = filteredData.filter(school => school.hasPartnerships).length;
    
    document.getElementById('totalSchools').textContent = totalSchools;
    document.getElementById('activeProjects').textContent = activeProjects;
    document.getElementById('integralSchools').textContent = integralSchools;
    document.getElementById('partnerships').textContent = partnerships;
}

// Create charts
function createCharts() {
    createProjectsChart();
    createIntegralChart();
    createPartnershipsChart();
    createSchoolTypesChart();
}

// Create projects distribution chart
function createProjectsChart() {
    const ctx = document.getElementById('projectsChart').getContext('2d');
    const activeCount = filteredData.filter(school => school.hasActiveProjects).length;
    const inactiveCount = filteredData.length - activeCount;
    
    if (charts.projects) {
        charts.projects.destroy();
    }
    
    charts.projects = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Com Projetos Ativos', 'Sem Projetos Ativos'],
            datasets: [{
                data: [activeCount, inactiveCount],
                backgroundColor: ['#2ecc71', '#e74c3c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Create integral period chart
function createIntegralChart() {
    const ctx = document.getElementById('integralChart').getContext('2d');
    const integralCount = filteredData.filter(school => school.hasIntegralPeriod).length;
    const regularCount = filteredData.length - integralCount;
    
    if (charts.integral) {
        charts.integral.destroy();
    }
    
    charts.integral = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Período Integral', 'Período Regular'],
            datasets: [{
                data: [integralCount, regularCount],
                backgroundColor: ['#3498db', '#95a5a6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Create partnerships chart
function createPartnershipsChart() {
    const ctx = document.getElementById('partnershipsChart').getContext('2d');
    
    // Count partnership types
    const partnershipCounts = {};
    filteredData.forEach(school => {
        if (school.hasPartnerships && school.partnerships) {
            const partnerships = school.partnerships.toLowerCase();
            if (partnerships.includes('seduc') || partnerships.includes('educação')) {
                partnershipCounts['Secretaria de Educação'] = (partnershipCounts['Secretaria de Educação'] || 0) + 1;
            }
            if (partnerships.includes('saúde') || partnerships.includes('ubs')) {
                partnershipCounts['Saúde'] = (partnershipCounts['Saúde'] || 0) + 1;
            }
            if (partnerships.includes('esporte')) {
                partnershipCounts['Esportes'] = (partnershipCounts['Esportes'] || 0) + 1;
            }
            if (partnerships.includes('petrobrás') || partnerships.includes('petrobras')) {
                partnershipCounts['Petrobrás'] = (partnershipCounts['Petrobrás'] || 0) + 1;
            }
            if (partnerships.includes('comunidade') || partnerships.includes('família')) {
                partnershipCounts['Comunidade'] = (partnershipCounts['Comunidade'] || 0) + 1;
            }
            if (partnerships.includes('fundacc')) {
                partnershipCounts['FUNDACC'] = (partnershipCounts['FUNDACC'] || 0) + 1;
            }
        }
    });
    
    const labels = Object.keys(partnershipCounts);
    const data = Object.values(partnershipCounts);
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    
    if (charts.partnerships) {
        charts.partnerships.destroy();
    }
    
    charts.partnerships = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de Parcerias',
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Create school types chart
function createSchoolTypesChart() {
    const ctx = document.getElementById('schoolTypesChart').getContext('2d');
    
    const typeCounts = {};
    filteredData.forEach(school => {
        typeCounts[school.schoolType] = (typeCounts[school.schoolType] || 0) + 1;
    });
    
    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#95a5a6'];
    
    if (charts.schoolTypes) {
        charts.schoolTypes.destroy();
    }
    
    charts.schoolTypes = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Apply filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const schoolType = schoolTypeFilter.value;
    const projectStatus = projectStatusFilter.value;
    
    filteredData = allSchoolsData.filter(school => {
        // Search filter
        const matchesSearch = !searchTerm || 
            school.schoolName.toLowerCase().includes(searchTerm) ||
            school.responsible.toLowerCase().includes(searchTerm);
        
        // School type filter
        const matchesType = !schoolType || school.schoolType === schoolType;
        
        // Project status filter
        const matchesStatus = !projectStatus || 
            (projectStatus === 'sim' && school.hasActiveProjects) ||
            (projectStatus === 'nao' && !school.hasActiveProjects);
        
        return matchesSearch && matchesType && matchesStatus;
    });
    
    // Update all components
    updateMetrics();
    createCharts();
    renderSchoolsList();
    updateResultsCount();
}

// Clear all filters
function clearAllFilters() {
    searchInput.value = '';
    schoolTypeFilter.value = '';
    projectStatusFilter.value = '';
    
    filteredData = [...allSchoolsData];
    updateMetrics();
    createCharts();
    renderSchoolsList();
    updateResultsCount();
}

// Render schools list
function renderSchoolsList() {
    schoolsList.innerHTML = '';
    
    if (filteredData.length === 0) {
        schoolsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>Nenhuma escola encontrada</h3>
                <p>Tente ajustar os filtros de busca</p>
            </div>
        `;
        return;
    }
    
    filteredData.forEach(school => {
        const schoolCard = createSchoolCard(school);
        schoolsList.appendChild(schoolCard);
    });
    
    // Update selection UI after rendering
    updateSelectionUI();
}

// Create individual school card
function createSchoolCard(school) {
    const card = document.createElement('div');
    const isSelected = selectedSchools.has(school.id);
    card.className = `school-card ${school.hasActiveProjects ? 'has-projects' : 'no-projects'} ${isSelected ? 'selected' : ''}`;
    
    const projectsPreview = school.activeProjects ? 
        school.activeProjects.substring(0, 150) + (school.activeProjects.length > 150 ? '...' : '') : 
        'Nenhum projeto ativo informado';
    
    card.innerHTML = `
        <div class="school-header">
            <div class="school-selection">
                <input type="checkbox" class="school-checkbox" 
                       id="checkbox-${school.id}" 
                       ${isSelected ? 'checked' : ''}
                       onchange="toggleSchoolSelection(${school.id})">
                <div>
                    <div class="school-name">${school.schoolName}</div>
                    <div class="school-responsible">
                        <i class="fas fa-user"></i> ${school.responsible || 'Não informado'}
                    </div>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                ${isSelected ? '<span class="selection-indicator">Selecionada</span>' : ''}
                <span class="status-badge ${school.hasActiveProjects ? 'active' : 'inactive'}">
                    ${school.hasActiveProjects ? 'Ativo' : 'Inativo'}
                </span>
            </div>
        </div>
        
        <div class="school-info">
            <div class="info-item">
                <i class="fas fa-tag"></i>
                <span>Tipo: ${school.schoolType}</span>
            </div>
            ${school.hasIntegralPeriod ? `
                <div class="info-item integral">
                    <i class="fas fa-clock"></i>
                    <span>Período Integral</span>
                </div>
            ` : ''}
            ${school.hasPartnerships ? `
                <div class="info-item partnership">
                    <i class="fas fa-handshake"></i>
                    <span>Possui Parcerias</span>
                </div>
            ` : ''}
            ${school.projectStartDate ? `
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>Início: ${school.projectStartDate}</span>
                </div>
            ` : ''}
        </div>
        
        ${school.hasActiveProjects ? `
            <div class="projects-preview">
                <h4><i class="fas fa-project-diagram"></i> Projetos Ativos</h4>
                <div class="projects-list" id="projects-${school.id}">
                    ${projectsPreview}
                </div>
                ${school.activeProjects.length > 150 ? `
                    <button class="expand-btn" onclick="toggleProjectsExpansion(${school.id})">
                        Ver mais
                    </button>
                ` : ''}
            </div>
        ` : ''}
        
        ${school.partnerships ? `
            <div class="projects-preview">
                <h4><i class="fas fa-handshake"></i> Parcerias</h4>
                <div class="projects-list">
                    ${school.partnerships}
                </div>
            </div>
        ` : ''}
    `;
    
    // Add click event to card (excluding checkbox area)
    card.addEventListener('click', (e) => {
        // Don't open modal if clicking on checkbox, expand button, or checkbox label
        if (e.target.classList.contains('school-checkbox') || 
            e.target.classList.contains('expand-btn') ||
            e.target.closest('.school-checkbox')) {
            return;
        }
        
        // Open school detail modal
        openSchoolModal(school.id);
    });
    
    return card;
}

// Toggle projects expansion
function toggleProjectsExpansion(schoolId) {
    const school = allSchoolsData.find(s => s.id === schoolId);
    const projectsElement = document.getElementById(`projects-${schoolId}`);
    const button = projectsElement.nextElementSibling;
    
    if (projectsElement.classList.contains('expanded')) {
        projectsElement.classList.remove('expanded');
        projectsElement.innerHTML = school.activeProjects.substring(0, 150) + '...';
        button.textContent = 'Ver mais';
    } else {
        projectsElement.classList.add('expanded');
        projectsElement.innerHTML = school.activeProjects;
        button.textContent = 'Ver menos';
    }
}

// Update results count
function updateResultsCount() {
    const count = filteredData.length;
    resultsCount.textContent = `${count} escola${count !== 1 ? 's' : ''} encontrada${count !== 1 ? 's' : ''}`;
}

// Export filtered data to CSV
function exportFilteredData() {
    if (filteredData.length === 0) {
        alert('Nenhum dado para exportar. Ajuste os filtros.');
        return;
    }
    
    // Prepare data for export
    const exportData = filteredData.map(school => ({
        'Nome da Escola': school.schoolName,
        'Tipo': school.schoolType,
        'Responsável': school.responsible,
        'Projetos Ativos': school.hasActiveProjects ? 'Sim' : 'Não',
        'Período Integral': school.hasIntegralPeriod ? 'Sim' : 'Não',
        'Possui Parcerias': school.hasPartnerships ? 'Sim' : 'Não',
        'Projetos': school.activeProjects,
        'Parcerias': school.partnerships,
        'Data de Início': school.projectStartDate
    }));
    
    // Convert to CSV
    const csv = Papa.unparse(exportData);
    
    // Download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `projetos-escolares-caraguatatuba-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = `Última atualização: ${timeString}`;
}

// Show error message
function showError(message) {
    loadingIndicator.innerHTML = `
        <div style="text-align: center; color: white;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
            <h3>Erro ao carregar dados</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: white; color: #333; border: none; border-radius: 5px; cursor: pointer;">
                Tentar novamente
            </button>
        </div>
    `;
}

// School selection functions
function toggleSchoolSelection(schoolId) {
    const checkbox = document.getElementById(`checkbox-${schoolId}`);
    
    if (selectedSchools.has(schoolId)) {
        selectedSchools.delete(schoolId);
        checkbox.checked = false;
    } else {
        selectedSchools.add(schoolId);
        checkbox.checked = true;
    }
    
    updateSelectionUI();
    updateComparisonPanel();
}

function selectAllVisible() {
    filteredData.forEach(school => {
        selectedSchools.add(school.id);
        const checkbox = document.getElementById(`checkbox-${school.id}`);
        if (checkbox) checkbox.checked = true;
    });
    
    updateSelectionUI();
    updateComparisonPanel();
}

function deselectAll() {
    selectedSchools.clear();
    
    // Update all checkboxes
    document.querySelectorAll('.school-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    updateSelectionUI();
    updateComparisonPanel();
}

function clearSelection() {
    deselectAll();
}

function updateSelectionUI() {
    // Update selected count
    selectedCount.textContent = `${selectedSchools.size} escola${selectedSchools.size !== 1 ? 's' : ''} selecionada${selectedSchools.size !== 1 ? 's' : ''}`;
    
    // Update card styles
    document.querySelectorAll('.school-card').forEach(card => {
        const checkbox = card.querySelector('.school-checkbox');
        if (checkbox && checkbox.checked) {
            card.classList.add('selected');
            // Add selection indicator if not present
            if (!card.querySelector('.selection-indicator')) {
                const statusContainer = card.querySelector('.school-header > div:last-child');
                statusContainer.insertAdjacentHTML('afterbegin', '<span class="selection-indicator">Selecionada</span>');
            }
        } else {
            card.classList.remove('selected');
            // Remove selection indicator
            const indicator = card.querySelector('.selection-indicator');
            if (indicator) indicator.remove();
        }
    });
}

function updateComparisonPanel() {
    if (selectedSchools.size >= 2) {
        comparisonPanel.style.display = 'block';
        createComparisonCharts();
        createComparisonTable();
    } else {
        comparisonPanel.style.display = 'none';
    }
}

// Comparison chart functions
function createComparisonCharts() {
    createComparisonProjectsChart();
    createComparisonFeaturesChart();
}

function createComparisonProjectsChart() {
    const ctx = document.getElementById('comparisonProjectsChart').getContext('2d');
    const selectedSchoolsData = Array.from(selectedSchools).map(id => 
        allSchoolsData.find(school => school.id === id)
    ).filter(Boolean);
    
    const labels = selectedSchoolsData.map(school => 
        school.schoolName.length > 20 ? 
        school.schoolName.substring(0, 20) + '...' : 
        school.schoolName
    );
    
    const projectCounts = selectedSchoolsData.map(school => {
        if (!school.activeProjects) return 0;
        // Count projects by splitting on common separators
        return school.activeProjects.split(/[,;-]/).filter(p => p.trim().length > 0).length;
    });
    
    if (comparisonCharts.projects) {
        comparisonCharts.projects.destroy();
    }
    
    comparisonCharts.projects = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de Projetos',
                data: projectCounts,
                backgroundColor: selectedSchoolsData.map((_, index) => {
                    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];
                    return colors[index % colors.length];
                }),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                }
            }
        }
    });
}

function createComparisonFeaturesChart() {
    const ctx = document.getElementById('comparisonFeaturesChart').getContext('2d');
    const selectedSchoolsData = Array.from(selectedSchools).map(id => 
        allSchoolsData.find(school => school.id === id)
    ).filter(Boolean);
    
    const features = ['Projetos Ativos', 'Período Integral', 'Parcerias'];
    const datasets = selectedSchoolsData.map((school, index) => {
        const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];
        return {
            label: school.schoolName.length > 15 ? 
                   school.schoolName.substring(0, 15) + '...' : 
                   school.schoolName,
            data: [
                school.hasActiveProjects ? 1 : 0,
                school.hasIntegralPeriod ? 1 : 0,
                school.hasPartnerships ? 1 : 0
            ],
            backgroundColor: colors[index % colors.length],
            borderWidth: 0
        };
    });
    
    if (comparisonCharts.features) {
        comparisonCharts.features.destroy();
    }
    
    comparisonCharts.features = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: features,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 10
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return value === 1 ? 'Sim' : 'Não';
                        }
                    }
                }
            }
        }
    });
}

function createComparisonTable() {
    const table = document.getElementById('comparisonTable');
    const selectedSchoolsData = Array.from(selectedSchools).map(id => 
        allSchoolsData.find(school => school.id === id)
    ).filter(Boolean);
    
    // Clear existing table
    table.innerHTML = '';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th class="feature-cell">Característica</th>';
    
    selectedSchoolsData.forEach(school => {
        const th = document.createElement('th');
        th.className = 'school-column';
        th.textContent = school.schoolName.length > 25 ? 
                        school.schoolName.substring(0, 25) + '...' : 
                        school.schoolName;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    const features = [
        { label: 'Tipo de Escola', key: 'schoolType' },
        { label: 'Responsável', key: 'responsible' },
        { label: 'Projetos Ativos', key: 'hasActiveProjects', type: 'boolean' },
        { label: 'Período Integral', key: 'hasIntegralPeriod', type: 'boolean' },
        { label: 'Possui Parcerias', key: 'hasPartnerships', type: 'boolean' },
        { label: 'Data de Início dos Projetos', key: 'projectStartDate' },
        { label: 'Anos Atendidos (Integral)', key: 'integralYears' },
        { label: 'Principais Projetos', key: 'activeProjects', type: 'text' },
        { label: 'Parcerias', key: 'partnerships', type: 'text' }
    ];
    
    features.forEach(feature => {
        const row = document.createElement('tr');
        
        // Feature name cell
        const featureCell = document.createElement('td');
        featureCell.className = 'feature-cell';
        featureCell.textContent = feature.label;
        row.appendChild(featureCell);
        
        // Data cells for each school
        selectedSchoolsData.forEach(school => {
            const cell = document.createElement('td');
            let value = school[feature.key] || '';
            
            if (feature.type === 'boolean') {
                cell.innerHTML = `<span class="${value ? 'status-yes' : 'status-no'}">${value ? 'Sim' : 'Não'}</span>`;
            } else if (feature.type === 'text' && value.length > 100) {
                cell.innerHTML = `
                    <div class="text-preview" id="text-${feature.key}-${school.id}">
                        ${value.substring(0, 100)}...
                        <button class="expand-btn" onclick="toggleTextExpansion('${feature.key}', ${school.id})">
                            Ver mais
                        </button>
                    </div>
                `;
            } else {
                cell.textContent = value || 'Não informado';
            }
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
}

function toggleTextExpansion(key, schoolId) {
    const school = allSchoolsData.find(s => s.id === schoolId);
    const element = document.getElementById(`text-${key}-${schoolId}`);
    const button = element.querySelector('.expand-btn');
    const fullText = school[key] || '';
    
    if (button.textContent === 'Ver mais') {
        element.innerHTML = `
            ${fullText}
            <button class="expand-btn" onclick="toggleTextExpansion('${key}', ${schoolId})">
                Ver menos
            </button>
        `;
    } else {
        element.innerHTML = `
            ${fullText.substring(0, 100)}...
            <button class="expand-btn" onclick="toggleTextExpansion('${key}', ${schoolId})">
                Ver mais
            </button>
        `;
    }
}

function exportComparison() {
    if (selectedSchools.size === 0) {
        alert('Nenhuma escola selecionada para comparação.');
        return;
    }
    
    const selectedSchoolsData = Array.from(selectedSchools).map(id => 
        allSchoolsData.find(school => school.id === id)
    ).filter(Boolean);
    
    // Prepare comparison data
    const comparisonData = selectedSchoolsData.map(school => ({
        'Nome da Escola': school.schoolName,
        'Tipo': school.schoolType,
        'Responsável': school.responsible,
        'Projetos Ativos': school.hasActiveProjects ? 'Sim' : 'Não',
        'Período Integral': school.hasIntegralPeriod ? 'Sim' : 'Não',
        'Possui Parcerias': school.hasPartnerships ? 'Sim' : 'Não',
        'Data de Início': school.projectStartDate,
        'Anos Integral': school.integralYears,
        'Projetos': school.activeProjects,
        'Parcerias': school.partnerships,
        'Projetos para Comunidade': school.projectsForCommunity,
        'Projetos para Crianças': school.projectsForChildren
    }));
    
    // Convert to CSV
    const csv = Papa.unparse(comparisonData);
    
    // Download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `comparacao-escolas-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Modal functions
let currentModalSchool = null;

function openSchoolModal(schoolId) {
    const school = allSchoolsData.find(s => s.id === schoolId);
    if (!school) return;
    
    currentModalSchool = school;
    
    // Populate modal content
    populateModalContent(school);
    
    // Show modal
    document.getElementById('schoolModal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeSchoolModal() {
    document.getElementById('schoolModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    currentModalSchool = null;
}

function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function populateModalContent(school) {
    // Header
    document.getElementById('modalSchoolName').textContent = school.schoolName;
    
    // General Tab
    document.getElementById('modalSchoolFullName').textContent = school.schoolName;
    document.getElementById('modalSchoolType').textContent = school.schoolType;
    document.getElementById('modalResponsible').textContent = school.responsible || 'Não informado';
    document.getElementById('modalTimestamp').textContent = formatDate(school.timestamp);
    
    // Status values
    setStatusValue('modalHasProjects', school.hasActiveProjects);
    setStatusValue('modalHasIntegral', school.hasIntegralPeriod);
    setStatusValue('modalHasPartnerships', school.hasPartnerships);
    setStatusValue('modalFuturePlans', school.futurePlans);
    
    // Projects Tab
    document.getElementById('modalActiveProjects').textContent = school.activeProjects || 'Nenhum projeto ativo informado';
    document.getElementById('modalProjectStartDate').textContent = school.projectStartDate || 'Não informado';
    document.getElementById('modalCommunityProjects').textContent = school.projectsForCommunity || 'Nenhuma informação disponível';
    document.getElementById('modalChildrenProjects').textContent = school.projectsForChildren || 'Nenhuma informação disponível';
    
    // Partnerships Tab
    document.getElementById('modalPartnerships').textContent = school.partnerships || 'Nenhuma parceria informada';
    
    // Integral Tab
    document.getElementById('modalIntegralYears').textContent = school.integralYears || 'Não se aplica';
    
    // Combine all integral project information
    let integralProjectsText = '';
    if (school.integralProjects) {
        integralProjectsText += school.integralProjects;
    }
    if (school.integralChildrenProjects && school.integralChildrenProjects !== school.integralProjects) {
        if (integralProjectsText) integralProjectsText += '\n\n';
        integralProjectsText += school.integralChildrenProjects;
    }
    if (school.integralPeriod) {
        if (integralProjectsText) integralProjectsText += '\n\nPeríodo: ';
        integralProjectsText += school.integralPeriod;
    }
    if (school.integralProjectStartDate) {
        if (integralProjectsText) integralProjectsText += '\n\nInício: ';
        integralProjectsText += school.integralProjectStartDate;
    }
    
    document.getElementById('modalIntegralProjects').textContent = integralProjectsText || 'Nenhum projeto específico informado';
}

function setStatusValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (value) {
        element.textContent = 'Sim';
        element.className = 'status-value yes';
    } else {
        element.textContent = 'Não';
        element.className = 'status-value no';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Não informado';
    
    try {
        // Try to parse the date string
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // If parsing fails, return the original string
            return dateString;
        }
        
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

function exportSchoolDetails() {
    if (!currentModalSchool) return;
    
    const school = currentModalSchool;
    
    // Prepare detailed export data
    const detailData = [{
        'Nome da Escola': school.schoolName,
        'Tipo de Escola': school.schoolType,
        'Responsável pelo Preenchimento': school.responsible,
        'Data de Preenchimento': school.timestamp,
        'Possui Projetos Ativos': school.hasActiveProjects ? 'Sim' : 'Não',
        'Período Integral': school.hasIntegralPeriod ? 'Sim' : 'Não',
        'Possui Parcerias': school.hasPartnerships ? 'Sim' : 'Não',
        'Previsão de Novos Projetos': school.futurePlans ? 'Sim' : 'Não',
        'Projetos Ativos': school.activeProjects,
        'Data de Início dos Projetos': school.projectStartDate,
        'Projetos para Comunidade': school.projectsForCommunity,
        'Projetos para Crianças': school.projectsForChildren,
        'Parcerias': school.partnerships,
        'Anos Atendidos (Integral)': school.integralYears,
        'Projetos do Período Integral': school.integralProjects
    }];
    
    // Convert to CSV
    const csv = Papa.unparse(detailData);
    
    // Download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = `detalhes-${school.schoolName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('schoolModal');
    if (e.target === modal) {
        closeSchoolModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSchoolModal();
    }
});

// Make functions available globally
window.toggleProjectsExpansion = toggleProjectsExpansion;
window.toggleSchoolSelection = toggleSchoolSelection;
window.toggleTextExpansion = toggleTextExpansion;
window.openSchoolModal = openSchoolModal;
window.closeSchoolModal = closeSchoolModal;
window.switchTab = switchTab;
window.exportSchoolDetails = exportSchoolDetails;