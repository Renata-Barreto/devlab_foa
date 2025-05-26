// Teste de implementação de acessibilidade
let audioEnabled = false;

// Função para alternar o estado do áudio
function toggleAudio() {
    audioEnabled = !audioEnabled;
    const button = document.getElementById("audio-toggle-button");

    if (audioEnabled) {
        speakText(
            "Olá! Seja bem-vindo ao meu site! Você está na página inicial. " +
            "Use os atalhos de teclado para navegar: " +
            "Pressione Control mais Alt mais H para ir para Início, " +
            "T para Tutoriais, F para Ferramentas, P para Fórum, " +
            "S para Sobre, C para Contato e E para Entrar. " +
            "Para desativar o áudio, pressione Control mais Alt mais A novamente."
        );
        button.textContent = "Desativar Áudio";
    } else {
        speakText(
            "O áudio será desativado. Para reativá-lo, pressione Control mais Alt mais A novamente. Até mais!"
        );
        button.textContent = "Ativar Áudio";
    }
}

// Função para tocar o áudio do texto usando ResponsiveVoice
function speakText(text) {
    if (audioEnabled && typeof responsiveVoice !== "undefined" && typeof text === "string" && text.trim() !== "") {
        responsiveVoice.speak(text, "Brazilian Portuguese Female");
    } else if (!audioEnabled) {
        console.warn("Áudio está desativado.");
    }
}

// Adiciona atalhos de teclado para ativação e navegação
document.addEventListener("keydown", function(event) {
    // Atalho para alternar o estado do áudio: Ctrl + Alt + A
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "a") {
        toggleAudio();
    }

    // Navegação com Ctrl + Alt + teclas específicas
    if (event.ctrlKey && event.altKey && audioEnabled) {
        switch (event.key.toLowerCase()) {
            case "h": // Ctrl + Alt + H para "Home"
                window.location.href = document.getElementById("link-home").href;
                speakText("Início");
                break;
            case "t": // Ctrl + Alt + T para "Tutoriais"
                window.location.href = document.getElementById("link-tutorial").href;
                speakText("Tutoriais");
                break;
            case "f": // Ctrl + Alt + F para "Ferramentas"
                window.location.href = document.getElementById("link-ferramenta").href;
                speakText("Ferramentas");
                break;
            case "p": // Ctrl + Alt + P para "Fórum"
                window.location.href = document.getElementById("link-forum").href;
                speakText("Fórum");
                break;
            case "s": // Ctrl + Alt + S para "Sobre"
                window.location.href = document.getElementById("link-sobre").href;
                speakText("Sobre");
                break;
            case "c": // Ctrl + Alt + C para "Contato"
                window.location.href = document.getElementById("link-contato").href;
                speakText("Contato");
                break;
            case "e": // Ctrl + Alt + E para "Entrar"
                window.location.href = document.getElementById("nome-entrar").href;
                speakText("Entrar");
                break;
            default:
                break;
        }
    }
});
