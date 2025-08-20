# Documentação Técnica

## Arquitetura do Sistema

### Estrutura de Arquivos
```
dashboard-projetos-escolares/
├── index.html              # Interface principal
├── styles.css              # Estilos e responsividade
├── script.js               # Lógica de aplicação
├── (Visual) PROJETOS...csv  # Dados das escolas
├── setup-github.sh         # Script de configuração
└── docs/                   # Documentação
```

### Fluxo de Dados

1. **Carregamento**: PapaParse carrega e processa o CSV
2. **Processamento**: Dados são limpos e normalizados
3. **Detecção**: Algoritmos identificam período integral e parcerias
4. **Renderização**: Interface é atualizada com dados processados
5. **Interação**: Usuário interage com filtros e seleções
6. **Exportação**: Dados são convertidos para CSV quando solicitado

### Componentes Principais

#### 1. Processamento de Dados (`processData()`)
- Normaliza respostas inconsistentes
- Detecta período integral através de múltiplos indicadores
- Extrai parcerias de diferentes campos
- Valida e limpa dados

#### 2. Sistema de Filtros
- Busca em tempo real com debounce
- Filtros por tipo de escola
- Filtros por status de projetos
- Atualização automática de gráficos

#### 3. Comparação de Escolas
- Seleção múltipla com checkboxes
- Gráficos comparativos dinâmicos
- Tabela de comparação detalhada
- Exportação de dados comparativos

#### 4. Modal Detalhado
- Navegação por abas
- Informações completas da escola
- Formatação inteligente de dados
- Exportação individual

### Algoritmos de Detecção

#### Período Integral
```javascript
function detectIntegralPeriod(row) {
    // 1. Verifica colunas explícitas
    // 2. Analisa anos especificados
    // 3. Verifica projetos específicos
    // 4. Busca palavras-chave
    // 5. Analisa descrições
    // 6. Verifica períodos de realização
}
```

**Indicadores Detectados:**
- Respostas "Sim" em colunas apropriadas
- Anos especificados (ex: "1° ANO, 2° ANO")
- Projetos com "integral" no nome
- Menções de "contraturno", "jornada ampliada"
- Períodos específicos (MANHÃ, TARDE)

#### Parcerias
```javascript
function detectPartnerships(row) {
    // 1. Verifica listas explícitas
    // 2. Analisa descrições de projetos
    // 3. Identifica organizações conhecidas
    // 4. Busca palavras-chave de colaboração
}
```

**Parcerias Identificadas:**
- SEDUC, Petrobrás, FUNDACC
- UBS, Secretarias municipais
- Polícia Militar, Bombeiros
- ONGs, empresas locais
- Comunidade, voluntários

### Performance e Otimização

#### Técnicas Utilizadas
- **Debounce**: Evita múltiplas execuções de busca
- **Lazy Loading**: Renderização sob demanda
- **Memoização**: Cache de cálculos complexos
- **Event Delegation**: Otimização de eventos

#### Métricas de Performance
- Carregamento inicial: < 2s
- Filtros em tempo real: < 100ms
- Renderização de gráficos: < 500ms
- Exportação CSV: < 1s

### Responsividade

#### Breakpoints
- **Desktop**: > 1200px
- **Tablet**: 768px - 1200px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

#### Adaptações
- Grid responsivo para cards
- Navegação colapsável
- Gráficos redimensionáveis
- Modal adaptativo

### Acessibilidade

#### Padrões Implementados
- **WCAG 2.1 AA**: Contraste de cores adequado
- **Navegação por teclado**: Tab, Enter, Escape
- **Screen readers**: Labels e ARIA attributes
- **Semântica HTML**: Estrutura apropriada

#### Recursos de Acessibilidade
- Alto contraste nas cores
- Textos alternativos para ícones
- Foco visível em elementos interativos
- Estrutura hierárquica clara

### Segurança

#### Medidas Implementadas
- **XSS Prevention**: Sanitização de dados
- **CSP Headers**: Content Security Policy
- **Input Validation**: Validação de entrada
- **Safe Parsing**: Tratamento seguro de CSV

### Browser Support

#### Navegadores Suportados
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

#### Funcionalidades Modernas
- ES6+ Features
- CSS Grid e Flexbox
- Fetch API
- Canvas API (Chart.js)

### Deployment

#### GitHub Pages
- Build automático via GitHub Actions
- Deploy contínuo no branch main
- HTTPS habilitado por padrão
- CDN global do GitHub

#### Configuração Local
```bash
# Clonar repositório
git clone https://github.com/usuario/dashboard-projetos-escolares.git

# Abrir em servidor local (opcional)
python -m http.server 8000
# ou
npx serve .
```

### Monitoramento

#### Logs de Debug
```javascript
console.log('Processed data:', allSchoolsData.length, 'schools');
console.log('Schools with integral period:', integralSchools.length);
console.log('Schools with partnerships:', partnershipSchools.length);
```

#### Métricas Coletadas
- Número de escolas processadas
- Escolas com período integral detectadas
- Escolas com parcerias identificadas
- Tempo de processamento

### Extensibilidade

#### Pontos de Extensão
- Novos tipos de gráficos
- Filtros adicionais
- Formatos de exportação
- Temas personalizados

#### APIs Futuras
- Endpoint para dados em tempo real
- Integração com sistemas externos
- Webhooks para atualizações
- API REST para consultas

### Troubleshooting

#### Problemas Comuns
1. **CSV não carrega**: Verificar encoding UTF-8
2. **Gráficos não aparecem**: Verificar CDN do Chart.js
3. **Modal não abre**: Verificar JavaScript habilitado
4. **Filtros lentos**: Verificar tamanho do dataset

#### Soluções
- Validar formato do CSV
- Usar fallbacks para CDNs
- Implementar error boundaries
- Otimizar algoritmos de busca