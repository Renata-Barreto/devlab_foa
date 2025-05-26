function runCode() {
    const code = document.getElementById('codeEditor').value;
    const outputElement = document.getElementById('output');
    outputElement.innerHTML = ''; // Limpa a saída antes de executar o código

    // Substitui o console.log para capturar a saída e exibir na página
    const originalConsoleLog = console.log;
    const logMessages = [];

    console.log = function(message) {
        logMessages.push(message);
        originalConsoleLog.apply(console, arguments);
    };

    try {
        // Cria uma nova função com o código inserido e executa
        new Function(code)();
    } catch (error) {
        outputElement.innerHTML = `Erro: ${error.message}`;
        return;
    }

    // Exibe as mensagens capturadas
    outputElement.innerHTML = logMessages.join('<br>');
}