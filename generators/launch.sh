#!/bin/bash

# Script de lancement et de test du générateur de frises chronologiques
# Utilise mcp-delegate et la pensée séquentielle

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║  🎯 Générateur de Frises Chronologiques Interactives         ║
║                                                               ║
║  Utilise mcp-delegate et la pensée séquentielle pour         ║
║  générer automatiquement des composants Vue.js optimisés     ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé. Version >= 16.0.0 requise."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="16.0.0"
    
    if ! node -pe "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
        log_error "Node.js version $NODE_VERSION détectée. Version >= $REQUIRED_VERSION requise."
        exit 1
    fi
    
    log_success "Node.js $NODE_VERSION détecté"
    
    # NPM
    if ! command -v npm &> /dev/null; then
        log_error "NPM n'est pas installé."
        exit 1
    fi
    
    log_success "NPM $(npm --version) détecté"
    
    # Ollama (optionnel)
    if command -v ollama &> /dev/null; then
        log_success "Ollama détecté"
        
        # Test de connectivité Ollama
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            log_success "Ollama fonctionne sur localhost:11434"
            
            # Liste des modèles
            MODELS=$(curl -s http://localhost:11434/api/tags | jq -r '.models[].name' 2>/dev/null || echo "")
            if [ -n "$MODELS" ]; then
                log_info "Modèles Ollama disponibles:"
                echo "$MODELS" | while read -r model; do
                    echo "  • $model"
                done
            else
                log_warning "Aucun modèle Ollama détecté. Installez avec: ollama pull llama3.2"
            fi
        else
            log_warning "Ollama n'est pas en cours d'exécution. Démarrez avec: ollama serve"
        fi
    else
        log_warning "Ollama non détecté. L'analyse avancée sera limitée."
        log_info "Installation recommandée: https://ollama.ai/"
    fi
}

# Installation des dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        log_success "Dépendances installées"
    else
        log_info "Dépendances déjà installées"
    fi
}

# Tests de connectivité
test_connectivity() {
    log_info "Test de connectivité avec les LLMs..."
    
    node main.js test || {
        log_warning "Certains LLMs ne sont pas disponibles"
        log_info "Le système fonctionnera en mode dégradé"
    }
}

# Tests unitaires
run_unit_tests() {
    log_info "Exécution des tests unitaires..."
    
    # Test du générateur principal
    node -e "
    import TimelineGenerator from './timeline-generator.js';
    const generator = new TimelineGenerator();
    console.log('✅ TimelineGenerator chargé');
    " || {
        log_error "Erreur dans TimelineGenerator"
        exit 1
    }
    
    # Test du moteur de pensée
    node -e "
    import { ThinkingEngine } from './thinking-engine/thinking-engine.js';
    const engine = new ThinkingEngine();
    console.log('✅ ThinkingEngine chargé');
    " || {
        log_error "Erreur dans ThinkingEngine"
        exit 1
    }
    
    # Test du wrapper MCP
    node -e "
    import { MCPDelegateWrapper } from './thinking-engine/mcp-delegate-wrapper.js';
    const wrapper = new MCPDelegateWrapper();
    console.log('✅ MCPDelegateWrapper chargé');
    " || {
        log_error "Erreur dans MCPDelegateWrapper"
        exit 1
    }
    
    log_success "Tests unitaires passés"
}

# Démonstration rapide
quick_demo() {
    log_info "Démonstration rapide..."
    
    echo "1. Génération d'une frise historique..."
    node main.js generate config/historical.json || {
        log_warning "Génération échouée, tentative avec configuration par défaut"
        node main.js generate '{"type":"historical","name":"DemoTimeline"}'
    }
    
    echo -e "\n2. Analyse des besoins..."
    node main.js analyze '{"type":"scientific","domain":"physics"}' || {
        log_warning "Analyse avancée échouée"
    }
    
    echo -e "\n3. Test de fragmentation..."
    node main.js fragment "Analyse complexe pour timeline interactive avec Vue.js" || {
        log_warning "Test de fragmentation échoué"
    }
    
    log_success "Démonstration terminée"
}

# Démonstration complète avec MCP
full_demo() {
    log_info "Démonstration complète avec MCP-Delegate..."
    
    if [ -f "mcp-demo.js" ]; then
        node mcp-demo.js complete || {
            log_warning "Démonstration MCP échouée, fallback sur démo standard"
            quick_demo
        }
    else
        log_warning "Script MCP-Demo non trouvé, exécution de la démo rapide"
        quick_demo
    fi
}

# Génération d'exemples
generate_examples() {
    log_info "Génération d'exemples pour tous les types..."
    
    TYPES=("historical" "scientific" "business" "personal" "project")
    
    for type in "${TYPES[@]}"; do
        echo "Génération: $type"
        if [ -f "config/$type.json" ]; then
            node main.js generate "config/$type.json" || log_warning "Échec pour $type"
        else
            node main.js generate "{\"type\":\"$type\",\"name\":\"Example$type\"}" || log_warning "Échec pour $type"
        fi
    done
    
    log_success "Exemples générés"
}

# Validation de la sortie
validate_output() {
    log_info "Validation des fichiers générés..."
    
    OUTPUT_DIR="../src/generated"
    
    if [ -d "$OUTPUT_DIR" ]; then
        VUE_FILES=$(find "$OUTPUT_DIR" -name "*.vue" | wc -l)
        MD_FILES=$(find "$OUTPUT_DIR" -name "*.md" | wc -l)
        
        log_success "$VUE_FILES composants Vue.js générés"
        log_success "$MD_FILES fichiers de documentation générés"
        
        # Validation syntaxique des fichiers Vue
        for vue_file in "$OUTPUT_DIR"/*.vue; do
            if [ -f "$vue_file" ]; then
                if node -pe "
                    const fs = require('fs');
                    const content = fs.readFileSync('$vue_file', 'utf8');
                    const hasTemplate = content.includes('<template>');
                    const hasScript = content.includes('<script>');
                    const hasStyle = content.includes('<style>');
                    console.log(hasTemplate && hasScript ? '✅' : '❌', '$(basename $vue_file)');
                    process.exit(hasTemplate && hasScript ? 0 : 1);
                " 2>/dev/null; then
                    true
                else
                    log_warning "Structure invalide dans $(basename "$vue_file")"
                fi
            fi
        done
    else
        log_warning "Aucun fichier généré trouvé"
    fi
}

# Nettoyage
cleanup() {
    log_info "Nettoyage des fichiers temporaires..."
    
    # Supprimer les fichiers temporaires
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name ".DS_Store" -delete 2>/dev/null || true
    
    log_success "Nettoyage terminé"
}

# Performance benchmark
performance_test() {
    log_info "Test de performance..."
    
    START_TIME=$(date +%s%3N)
    
    # Test de génération rapide
    node main.js generate '{"type":"historical","name":"PerfTest","features":["basic"]}' > /dev/null 2>&1
    
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    
    log_success "Génération terminée en ${DURATION}ms"
    
    if [ $DURATION -lt 5000 ]; then
        log_success "Performance excellente (< 5s)"
    elif [ $DURATION -lt 10000 ]; then
        log_info "Performance correcte (< 10s)"
    else
        log_warning "Performance lente (> 10s)"
    fi
}

# Rapport de santé
health_check() {
    log_info "Vérification de l'état du système..."
    
    echo -e "\n📊 RAPPORT DE SANTÉ"
    echo "═══════════════════"
    
    # Espace disque
    DISK_USAGE=$(du -sh . | cut -f1)
    echo "💽 Espace utilisé: $DISK_USAGE"
    
    # Fichiers générés
    if [ -d "../src/generated" ]; then
        GENERATED_COUNT=$(find "../src/generated" -name "*.vue" | wc -l)
        echo "📁 Composants générés: $GENERATED_COUNT"
    fi
    
    # Status Ollama
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "🤖 Ollama: Actif"
    else
        echo "🤖 Ollama: Inactif"
    fi
    
    # Modules Node.js
    if [ -d "node_modules" ]; then
        echo "📦 Dépendances: Installées"
    else
        echo "📦 Dépendances: Manquantes"
    fi
    
    echo ""
}

# Menu interactif
show_menu() {
    echo -e "\n🎮 MENU INTERACTIF"
    echo "══════════════════"
    echo "1. Vérification rapide (prérequis + tests)"
    echo "2. Démonstration rapide"
    echo "3. Démonstration complète avec MCP"
    echo "4. Génération d'exemples"
    echo "5. Test de performance"
    echo "6. Rapport de santé"
    echo "7. Nettoyage"
    echo "8. Installation des modèles Ollama"
    echo "9. Quitter"
    echo ""
    read -p "Choisissez une option (1-9): " choice
    
    case $choice in
        1) quick_check ;;
        2) quick_demo ;;
        3) full_demo ;;
        4) generate_examples ;;
        5) performance_test ;;
        6) health_check ;;
        7) cleanup ;;
        8) install_ollama_models ;;
        9) log_info "Au revoir!" ; exit 0 ;;
        *) log_error "Option invalide" ; show_menu ;;
    esac
}

# Configuration des IDEs
setup_ide() {
    local ide="$1"
    log_info "Configuration de $ide..."
    
    case "$ide" in
        "cursor")
            if [ -f "setup-cursor.js" ]; then
                node setup-cursor.js
                log_success "Cursor configuré"
            else
                log_error "Script setup-cursor.js non trouvé"
            fi
            ;;
        "windsurf")
            if [ -f "setup-windsurf.js" ]; then
                node setup-windsurf.js
                log_success "Windsurf configuré"
            else
                log_error "Script setup-windsurf.js non trouvé"
            fi
            ;;
        "claude")
            if [ -f "setup-claude.js" ]; then
                node setup-claude.js
                log_success "Claude Desktop configuré"
            else
                log_error "Script setup-claude.js non trouvé"
            fi
            ;;
        "all")
            setup_ide "cursor"
            setup_ide "windsurf"
            setup_ide "claude"
            ;;
        *)
            log_error "IDE non supporté: $ide"
            log_info "IDEs supportés: cursor, windsurf, claude, all"
            ;;
    esac
}

# Installation des modèles Ollama
install_ollama_models() {
    log_info "Installation des modèles Ollama recommandés..."
    
    if ! command -v ollama &> /dev/null; then
        log_error "Ollama n'est pas installé"
        log_info "Installation: curl -fsSL https://ollama.ai/install.sh | sh"
        return 1
    fi
    
    MODELS=("llama3.2" "mistral" "codellama" "gemma")
    
    for model in "${MODELS[@]}"; do
        log_info "Installation de $model..."
        if ollama pull "$model"; then
            log_success "$model installé"
        else
            log_warning "Échec installation $model"
        fi
    done
    
    log_success "Installation des modèles terminée"
}

# Vérification rapide
quick_check() {
    check_prerequisites
    install_dependencies
    run_unit_tests
    test_connectivity
    log_success "Vérification rapide terminée"
}

# Installation complète
full_install() {
    log_info "Installation complète du système..."
    
    check_prerequisites
    install_dependencies
    run_unit_tests
    
    # Demander si installer Ollama
    if ! command -v ollama &> /dev/null; then
        echo ""
        read -p "Installer Ollama pour l'analyse avancée? (y/N): " install_ollama
        if [[ $install_ollama =~ ^[Yy]$ ]]; then
            log_info "Veuillez installer Ollama manuellement:"
            log_info "curl -fsSL https://ollama.ai/install.sh | sh"
            log_info "Puis exécutez: ./launch.sh"
        fi
    else
        read -p "Installer les modèles Ollama recommandés? (y/N): " install_models
        if [[ $install_models =~ ^[Yy]$ ]]; then
            install_ollama_models
        fi
    fi
    
    test_connectivity
    quick_demo
    
    log_success "Installation complète terminée!"
    log_info "Utilisez './launch.sh' pour le menu interactif"
}

# Gestion des arguments en ligne de commande
case "${1:-menu}" in
    "install")
        show_banner
        full_install
        ;;
    "check")
        show_banner
        quick_check
        ;;
    "demo")
        show_banner
        quick_demo
        ;;
    "demo-full")
        show_banner
        full_demo
        ;;
    "examples")
        show_banner
        generate_examples
        ;;
    "test")
        show_banner
        performance_test
        ;;
    "health")
        show_banner
        health_check
        ;;
    "clean")
        cleanup
        ;;
    "models")
        install_ollama_models
        ;;
    "help")
        show_banner
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  install     Installation complète"
        echo "  check       Vérification rapide"
        echo "  demo        Démonstration rapide"
        echo "  demo-full   Démonstration complète avec MCP"
        echo "  examples    Génération d'exemples"
        echo "  test        Test de performance"
        echo "  health      Rapport de santé"
        echo "  clean       Nettoyage"
        echo "  models      Installation modèles Ollama"
        echo "  help        Cette aide"
        echo ""
        echo "Sans argument: Menu interactif"
        ;;
    "menu"|*)
        show_banner
        health_check
        show_menu
        ;;
esac
