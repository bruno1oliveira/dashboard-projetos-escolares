# Dashboard - Projetos Escolares Caraguatatuba

Um dashboard interativo e profissional para visualização e análise dos projetos desenvolvidos nas unidades escolares de Caraguatatuba durante o 2º semestre de 2025.

## 🚀 Funcionalidades

### 📊 Visualização de Dados
- **Métricas Gerais**: Total de escolas, projetos ativos, período integral e parcerias
- **Gráficos Interativos**: Distribuição de projetos, tipos de escolas, parcerias e período integral
- **Filtros Avançados**: Busca por nome, tipo de escola e status dos projetos

### 🔍 Análise Comparativa
- **Seleção Múltipla**: Compare até várias escolas simultaneamente
- **Gráficos Comparativos**: Visualize diferenças entre escolas selecionadas
- **Tabela Detalhada**: Comparação lado a lado de todas as características
- **Exportação**: Baixe dados comparativos em CSV

### 📋 Detalhamento Individual
- **Modal Completo**: Visualize todas as informações de cada escola
- **Navegação por Abas**: Informações organizadas em categorias
- **Dados Completos**: Todos os campos do formulário original
- **Exportação Individual**: Baixe detalhes específicos de cada escola

### 📱 Interface Responsiva
- **Design Moderno**: Interface profissional e intuitiva
- **Mobile-First**: Funciona perfeitamente em dispositivos móveis
- **Acessibilidade**: Seguindo padrões de acessibilidade web

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização moderna com gradientes e animações
- **JavaScript ES6+**: Lógica de aplicação e manipulação de dados
- **Chart.js**: Gráficos interativos e responsivos
- **PapaParse**: Processamento de arquivos CSV
- **Font Awesome**: Ícones profissionais

## 📁 Estrutura do Projeto

```
dashboard-projetos-escolares/
├── index.html                 # Página principal
├── styles.css                 # Estilos CSS
├── script.js                  # Lógica JavaScript
├── (Visual) PROJETOS...csv     # Dados das escolas
├── README.md                   # Documentação
└── .kiro/                      # Configurações do projeto
    └── specs/
        └── dashboard-projetos-escolares/
            └── requirements.md # Requisitos detalhados
```

## 🚀 Como Usar

### Instalação Local
1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/dashboard-projetos-escolares.git
cd dashboard-projetos-escolares
```

2. Abra o arquivo `index.html` em um navegador web moderno

### Uso Online
Acesse diretamente via GitHub Pages: [Link do Dashboard](https://seu-usuario.github.io/dashboard-projetos-escolares/)

## 📊 Como Usar o Dashboard

### 1. Visualização Geral
- Ao carregar, o dashboard mostra métricas gerais e gráficos
- Use os filtros para refinar a visualização
- Todos os gráficos são interativos

### 2. Comparação de Escolas
- Marque as checkboxes das escolas que deseja comparar
- O painel de comparação aparece automaticamente com 2+ seleções
- Visualize gráficos comparativos e tabela detalhada
- Exporte os dados comparativos

### 3. Detalhes Individuais
- Clique em qualquer escola (fora da checkbox) para ver detalhes
- Navegue pelas abas: Geral, Projetos, Parcerias, Período Integral
- Exporte os detalhes específicos da escola

### 4. Filtros e Busca
- **Busca**: Digite o nome da escola ou responsável
- **Tipo**: Filtre por tipo de escola (CEI, EMEI, EMEF, etc.)
- **Status**: Filtre por escolas com/sem projetos ativos
- **Limpar**: Remova todos os filtros aplicados

## 🔧 Funcionalidades Técnicas

### Processamento Inteligente de Dados
- **Detecção Robusta**: Identifica período integral mesmo quando informado incorretamente
- **Análise de Parcerias**: Extrai parcerias de múltiplas fontes no formulário
- **Normalização**: Padroniza respostas inconsistentes (Sim/Não, etc.)
- **Validação**: Remove entradas vazias e dados inválidos

### Análise Avançada
- **Múltiplos Indicadores**: Combina informações de várias colunas
- **Palavras-chave**: Detecta menções de "integral", "parceria", etc.
- **Contexto**: Analisa descrições de projetos para extrair informações

## 📈 Métricas Detectadas

### Período Integral
O sistema detecta escolas com período integral através de:
- Respostas explícitas "Sim" nas colunas apropriadas
- Anos especificados para período integral
- Projetos específicos do tempo integral
- Menções de "integral", "contraturno", "jornada ampliada" nos projetos
- Períodos de realização especificados

### Parcerias
Detecta parcerias através de:
- Listas explícitas de parceiros
- Menções de organizações (SEDUC, Petrobrás, FUNDACC, etc.)
- Palavras-chave como "parceria", "colaboração", "apoio"
- Análise de descrições de projetos

## 🎨 Design e UX

### Princípios de Design
- **Clareza**: Informações organizadas e fáceis de encontrar
- **Consistência**: Padrões visuais uniformes
- **Responsividade**: Adaptação automática a diferentes telas
- **Acessibilidade**: Cores contrastantes e navegação por teclado

### Paleta de Cores
- **Primária**: Azul (#3498db) - Confiança e profissionalismo
- **Sucesso**: Verde (#2ecc71) - Projetos ativos
- **Alerta**: Vermelho (#e74c3c) - Projetos inativos
- **Neutro**: Cinza (#95a5a6) - Informações secundárias

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Requisitos do Sistema

- Navegador web moderno (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- JavaScript habilitado
- Conexão com internet (para CDNs de bibliotecas)

## 🐛 Problemas Conhecidos

- Arquivos CSV muito grandes (>10MB) podem causar lentidão
- Alguns navegadores antigos podem não suportar todas as funcionalidades

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Desenvolvedor Principal** - *Desenvolvimento inicial* - [Seu GitHub](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- Secretaria de Educação de Caraguatatuba pelos dados
- Comunidade escolar pela participação no formulário
- Bibliotecas open source utilizadas no projeto

---

**Dashboard Projetos Escolares Caraguatatuba** - Transformando dados educacionais em insights visuais 📊✨