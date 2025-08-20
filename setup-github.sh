#!/bin/bash

# Script para configurar e enviar o projeto para o GitHub
# Execute este script após criar o repositório no GitHub

echo "🚀 Configurando repositório Git..."

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "🎉 Initial commit: Dashboard Projetos Escolares Caraguatatuba

✨ Funcionalidades implementadas:
- Dashboard interativo com métricas gerais
- Gráficos responsivos (Chart.js)
- Sistema de comparação entre escolas
- Modal detalhado para cada escola
- Filtros avançados e busca
- Exportação de dados em CSV
- Interface responsiva e acessível
- Detecção inteligente de período integral
- Análise robusta de parcerias

🛠️ Tecnologias:
- HTML5, CSS3, JavaScript ES6+
- Chart.js, PapaParse, Font Awesome
- GitHub Pages ready"

echo "📝 Commit inicial criado!"
echo ""
echo "🔗 Próximos passos:"
echo "1. Crie um repositório no GitHub chamado 'dashboard-projetos-escolares'"
echo "2. Execute os seguintes comandos:"
echo ""
echo "   git remote add origin https://github.com/SEU-USUARIO/dashboard-projetos-escolares.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Ative o GitHub Pages nas configurações do repositório"
echo "4. Seu dashboard estará disponível em:"
echo "   https://SEU-USUARIO.github.io/dashboard-projetos-escolares/"
echo ""
echo "✅ Repositório configurado e pronto para envio!"