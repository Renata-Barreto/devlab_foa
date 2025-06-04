    function banirAluno() {
      const aluno = document.getElementById('banInput').value;
      if (aluno) {
        alert(`Aluno '${aluno}' foi banido.`);
        document.getElementById('banInput').value = '';
      } else {
        alert('Por favor, insira o nome ou ID do aluno.');
      }
    }

    function link_mensagens() {
    alert('Redirecionando para as mensagens...');
    // Exemplo de redirecionamento
    // window.location.href = '/mensagens';
    }

    function listarUsuarios() {
    // Aqui você pode buscar dados de um backend, ou simular com um alert
    alert('Lista de alunos:\n- Ana\n- Bruno\n- Carla\n- Diego');
    }