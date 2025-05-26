//Script para armazenar os dados do formulário de contato no localStorage
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm'); // Obtém o formulário pelo id
    const incoretoMessage = document.getElementById('incorreto'); // Elemento para exibir erros

    // Função para salvar os dados no localStorage
    function saveDataToLocalStorage(data) {
        let contactArray = JSON.parse(localStorage.getItem('contatos')) || []; // Recupera a lista de contatos ou cria um novo array vazio
        contactArray.push(data); // Adiciona o novo contato à lista
        localStorage.setItem('contatos', JSON.stringify(contactArray)); // Armazena a lista atualizada no localStorage
    }

    // Função para verificar se os campos são válidos
    function validateForm(email, assunto, mensagem) {
        if (!email || !assunto || !mensagem) {
            return false; // Se algum campo estiver vazio, retorna false
        }
        return true; // Todos os campos estão preenchidos
    }

    // Evento de submit do formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Previne o envio tradicional do formulário

        const email = document.getElementById('email').value; // Captura o valor do campo de email
        const assunto = document.getElementById('assunto').value; // Captura o valor do campo de assunto
        const mensagem = document.getElementById('mensagem').value; // Captura o valor do campo de mensagem

        // Verifica se o formulário está válido
        if (validateForm(email, assunto, mensagem)) {
            const contatoData = { email, assunto, mensagem }; // Cria um objeto com os dados do formulário
            saveDataToLocalStorage(contatoData); // Salva os dados no localStorage

            // Limpa os campos após o envio
            form.reset();

            // Exibe uma mensagem de sucesso ou faz outras ações desejadas
            alert('Mensagem enviada com sucesso!'); // Exemplo de mensagem de sucesso
        } else {
            // Se o formulário não for válido, exibe uma mensagem de erro
            incoretoMessage.textContent = "Todos os campos são obrigatórios.";
            incoretoMessage.style.color = "red";
        }
    });
});