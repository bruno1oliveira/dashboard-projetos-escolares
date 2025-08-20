# Documento de Design

## Visão Geral

O dashboard será uma aplicação web moderna e responsiva desenvolvida com React e TypeScript, utilizando bibliotecas de visualização de dados como Chart.js ou Recharts. A interface seguirá princípios de Material Design para garantir uma experiência profissional e intuitiva. O sistema processará dados CSV de projetos escolares e apresentará informações através de componentes visuais interativos.

## Arquitetura

### Arquitetura Frontend
- **Framework**: React 18 com TypeScript
- **Gerenciamento de Estado**: Context API + useReducer para estado global
- **Roteamento**: React Router v6
- **Estilização**: Styled Components + Material-UI (MUI)
- **Gráficos**: Recharts para visualizações interativas
- **Processamento de Dados**: Papa Parse para parsing de CSV

### Estrutura de Pastas
```
src/
├── components/
│   ├── common/
│   ├── charts/
│   ├── filters/
│   └── school-cards/
├── contexts/
├── hooks/
├── services/
├── types/
├── utils/
└── pages/
```

## Componentes e Interfaces

### 1. Layout Principal
- **Header**: Logo, título do dashboard, controles de exportação
- **Sidebar**: Filtros e controles de busca (colapsível em mobile)
- **Main Content**: Área principal com métricas e visualizações
- **Footer**: Informações de última atualização

### 2. Componentes de Filtro
```typescript
interface FilterState {
  searchTerm: string;
  schoolType: string[];
  hasActiveProjects: boolean | null;
  hasFullTime: boolean | null;
  hasPartnerships: boolean | null;
}
```

### 3. Cards de Métricas
- Total de escolas respondentes
- Escolas com projetos ativos
- Escolas com período integral
- Total de parcerias identificadas
- Projetos mais comuns

### 4. Componentes de Visualização
- **Gráfico de Pizza**: Distribuição de tipos de escola
- **Gráfico de Barras**: Projetos mais frequentes
- **Gráfico de Donut**: Escolas com/sem projetos ativos
- **Mapa de Calor**: Intensidade de projetos por região (se dados de localização disponíveis)

### 5. Cards de Escola
```typescript
interface SchoolData {
  timestamp: string;
  schoolName: string;
  responsible: string;
  hasActiveProjects: boolean;
  hasFullTime: boolean;
  activeProjects: string[];
  partnerships: string[];
  communityProjects: string;
  childrenProjects: string;
}
```

## Modelos de Dados

### Estrutura Principal dos Dados
```typescript
interface SchoolRecord {
  id: string;
  timestamp: Date;
  schoolName: string;
  responsiblePerson: string;
  hasActiveProjects: boolean;
  futureProjectsPlanned: boolean;
  hasFullTimeProgram: boolean;
  activeProjects: string[];
  projectStartDate: string;
  communityProjects: string;
  childrenOnlyProjects: string;
  hasPartnerships: boolean;
  partnerships: string[];
  fullTimeGrades: string[];
  fullTimeProjects: string[];
  fullTimePeriod: 'MANHÃ' | 'TARDE' | 'INTEGRAL';
}
```

### Estado da Aplicação
```typescript
interface AppState {
  schools: SchoolRecord[];
  filteredSchools: SchoolRecord[];
  filters: FilterState;
  loading: boolean;
  error: string | null;
  metrics: DashboardMetrics;
}

interface DashboardMetrics {
  totalSchools: number;
  schoolsWithProjects: number;
  schoolsWithFullTime: number;
  totalPartnerships: number;
  mostCommonProjects: Array<{name: string; count: number}>;
  schoolTypeDistribution: Array<{type: string; count: number}>;
}
```

## Tratamento de Erros

### Estratégias de Erro
1. **Erro de Parsing CSV**: Exibir mensagem amigável e permitir recarregamento
2. **Dados Inconsistentes**: Validação e sanitização automática
3. **Falha de Renderização**: Error Boundaries para componentes críticos
4. **Problemas de Performance**: Lazy loading e virtualização para listas grandes

### Validação de Dados
- Verificação de campos obrigatórios
- Normalização de respostas (Sim/Não, SIM/NÃO)
- Tratamento de campos vazios ou inconsistentes
- Parsing inteligente de listas de projetos separadas por vírgula

## Estratégia de Testes

### Testes Unitários
- Componentes de UI com React Testing Library
- Funções de processamento de dados
- Hooks customizados
- Utilitários de formatação

### Testes de Integração
- Fluxo completo de carregamento e filtragem de dados
- Interação entre componentes de filtro e visualização
- Funcionalidade de exportação

### Testes E2E
- Carregamento inicial do dashboard
- Aplicação de filtros e atualização de gráficos
- Exportação de dados
- Responsividade em diferentes dispositivos

## Design Responsivo

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Adaptações por Dispositivo
- **Mobile**: Layout em coluna única, sidebar colapsível, gráficos simplificados
- **Tablet**: Layout híbrido, alguns componentes lado a lado
- **Desktop**: Layout completo com sidebar fixa, múltiplas colunas

### Componentes Adaptativos
- Grid responsivo para cards de escola
- Gráficos que se redimensionam automaticamente
- Tabelas com scroll horizontal em mobile
- Menu de navegação que se transforma em hamburger

## Performance e Otimização

### Estratégias de Performance
- **Virtualização**: Para listas grandes de escolas
- **Memoização**: React.memo para componentes pesados
- **Lazy Loading**: Carregamento sob demanda de gráficos
- **Debounce**: Para filtros de busca em tempo real

### Otimização de Dados
- Processamento inicial dos dados CSV em Web Worker
- Cache de métricas calculadas
- Índices para busca rápida
- Compressão de dados em memória para datasets grandes