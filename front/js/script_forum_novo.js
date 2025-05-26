function openNewTopicModal() {
  document.getElementById("new-topic-modal").style.display = "flex";
}

function closeNewTopicModal() {
  document.getElementById("new-topic-modal").style.display = "none";
}

// Função para carregar tópicos salvos e exibir na tela
function carregarTopico() {
  const topicContainer = document.getElementById("topics-container");
  topicContainer.innerHTML = ""; // Limpa os tópicos exibidos

  const dbRef = firebase.database().ref("topics/");
; // Referência ao nó 'topics' no Realtime Database

  dbRef
    .once("value")
    .then((snapshot) => {
      const topicos = snapshot.val(); // Obtém os tópicos armazenados
      console.log("Tópicos carregados:", topicos)
      if (topicos) {
        Object.keys(topicos).forEach((key) => {
          const topico = topicos[key];
          const newTopic = document.createElement("div");
          newTopic.className = "forum-topic";
          newTopic.setAttribute("data-category", topico.category);
          newTopic.setAttribute("data-usuario", topico.usuarioId || "");
          newTopic.setAttribute("data-id", key); // Adiciona o ID do tópico

        
          const fotoUrl = topico.foto;

          newTopic.innerHTML = `
            <div class="forum-topic-details">
                <img src="${fotoUrl}" alt="Avatar">
                <div>
                    <h3 class="forum-topic-title">
                    <a href="viewTopic.html?id=${key}">${topico.title}</a>
                    </h3>
                <p>${topico.nome} - ${topico.data}</p>
               </div>
            </div>
            <button class="apagar" style="display: none;">Excluir</button>
            <p>${topico.category}</p>
            `;
          topicContainer.appendChild(newTopic);
        });
        atualizarExibicaoBotoes();
        removerTopico();
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar os tópicos: ", error);
    });
}

// Função para atualizar a exibição dos botões de exclusão
function atualizarExibicaoBotoes() {
  const user = firebase.auth().currentUser;

  if (user) {
    const userRef = firebase.database().ref("users/" + user.uid);

    userRef
      .once("value")
      .then((snapshot) => {
        const usuario = snapshot.val();
        const excluirPost = document.querySelectorAll(".apagar");
        excluirPost.forEach((botao) => {
          const forumTopic = botao.closest(".forum-topic");
          const criadorPost = forumTopic.getAttribute("data-usuario");

          if (usuario && (usuario.tipo === "adm" || user.uid === criadorPost)) {
            botao.style.display = "block";
          }
        });
      })
      .catch((error) => {
        console.error("Erro ao buscar o usuário: ", error);
      });
  }
}

// Função para adicionar um novo tópico
function addNewTopic() {
  const title = document.getElementById("new-topic-title").value;
  const category =
    document.getElementById("new-topic-category").value || "Geral";
    const conteudo = document.getElementById("new-topic-content").value
  if (title.trim() === "") {
    alert("O título do tópico não pode estar vazio!");
    return;
  }

  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Nenhum usuário logado.");
    return;
  }

  const dbRef1 = firebase.database().ref("users/" + user.uid);
  dbRef1
    .once("value")
    .then((snapshot) => {
      const userData = snapshot.val();
      if (!userData || !userData.displayName) {
        console.error("Nome do usuário não encontrado no banco de dados.");
        alert("Erro ao carregar informações do usuário.");
        return;
      }
      if (!userData || !userData.photoURL) {
        console.error("Nome do usuário não encontrado no banco de dados.");
        alert("Erro ao carregar informações do usuário.");
        return;
      }
      const foto = userData.photoURL;

      const nome = userData.displayName;
      const novoTopico = {
        title,
        category,
        foto:
          foto ||
          "https://gabrielaccorsi.github.io/Projeto-SI/imagens/entrar.png",
        nome,
        data: new Date().toLocaleString(),
        conteudo,
        usuarioId: user.uid,
      };

      const dbRef = firebase.database().ref("topics");
      dbRef
        .push(novoTopico)
        .then(() => {
          carregarTopico();
          closeNewTopicModal();
        })
        .catch((error) => {
          console.error("Erro ao adicionar o tópico: ", error);
        });
    })
    .catch((error) => {
      console.error("Erro ao buscar dados do usuário: ", error);
    });
}

// Função para remover tópicos e atualizar o banco de dados
function removerTopico() {
  const excluirPost = document.querySelectorAll(".apagar");

  excluirPost.forEach((botao) => {
    botao.addEventListener("click", function () {
      const forumTopic = this.closest(".forum-topic");
      const topicId = forumTopic.getAttribute("data-id"); // ID do tópico

      // Remove o tópico do Firebase
      firebase
        .database()
        .ref("topics/" + topicId)
        .remove()
        .then(() => {
          forumTopic.remove(); // Remove o tópico da tela
        })
        .catch((error) => {
          console.error("Erro ao excluir o tópico: ", error);
        });
    });
  });
}

// Filtrar tópicos por categoria
function filterTopics(category) {
  const topics = document.querySelectorAll(".forum-topic");
  topics.forEach((topic) => {
    if (
      category === "all" ||
      topic.getAttribute("data-category") === category
    ) {
      topic.style.display = "flex";
    } else {
      topic.style.display = "none";
    }
  });

  document.querySelectorAll(".categories button").forEach((button) => {
    button.classList.remove("active");
  });
  event.target.classList.add("active");
}

// Pesquisar tópicos
function searchTopics() {
  const query = document.getElementById("search").value.toLowerCase();
  const topics = document.querySelectorAll(".forum-topic");
  topics.forEach((topic) => {
    const title = topic
      .querySelector(".forum-topic-title")
      .textContent.toLowerCase();
    topic.style.display = title.includes(query) ? "flex" : "none";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  carregarTopico();
});
function loadPopularTopics() {
    const popularTopicsContainer = document.getElementById("popular-topics");
  
    database.ref("topics")
      .orderByChild("views")
      .limitToLast(5)
      .once("value")
      .then((snapshot) => {
        popularTopicsContainer.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
          const topic = childSnapshot.val();
          const listItem = document.createElement("li");
          listItem.innerHTML = `
            <a href="/forum/topic.html?id=${childSnapshot.key}">
              ${topic.title} (${topic.views} visualizações)
            </a>`;
          popularTopicsContainer.appendChild(listItem);
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar tópicos populares:", error);
      });
  }
  function loadPopularTopics() {
    const popularTopicsContainer = document.getElementById("popular-topics-list");
  
    database
      .ref("topics")  // Referência para os tópicos no Firebase
      .orderByChild("views")  // Ordena por visualizações
      .limitToLast(5)  // Limita a 5 tópicos mais populares
      .once("value")  // Pega o valor uma vez
      .then((snapshot) => {
        // Limpa o conteúdo atual da lista
        popularTopicsContainer.innerHTML = "";
        // Para cada tópico retornado, cria um item de lista
        snapshot.forEach((childSnapshot) => {
          const topic = childSnapshot.val();  // Obtem os dados do tópico
          const listItem = document.createElement("li");
          listItem.innerHTML = `
            <a href="/viewTopic.html?id=${childSnapshot.key}">
              ${topic.title} (${topic.views} visualizações)
            </a>`;
          popularTopicsContainer.appendChild(listItem);  // Adiciona o item na lista
        });
      })
      .catch((error) => {
        // Em caso de erro, exibe no console
        console.error("Erro ao carregar tópicos populares:", error);
      });
  }
  