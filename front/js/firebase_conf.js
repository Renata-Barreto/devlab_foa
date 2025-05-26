// apenas inicialização pra usar nas paginas

const firebaseConfig = {
    apiKey: "AIzaSyD8MrXhpxNRCYVoXE0biVkBvq-QW5WQbng",
    authDomain: "projeto-devlab.firebaseapp.com",
    databaseURL: "https://projeto-devlab-default-rtdb.firebaseio.com",
    projectId: "projeto-devlab",
    storageBucket: "projeto-devlab.appspot.com",
    messagingSenderId: "238801747466",
    appId: "1:238801747466:web:b3e99bec5bf628f2ac29f3",
    measurementId: "G-37HJJQGQ44"
  }
  
  firebase.initializeApp(firebaseConfig)
  const database = firebase.database()
  



// verificar se tem alguém logado em todas as paginas
firebase.auth().onAuthStateChanged(user => {
  if (user) {
      firebase.firestore().collection('users').doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                const userType = doc.data().tipo  
                carregarNavbar(user, userType)  
            } else {
                console.error("Usuário não encontrado no Firestore")
            }
        })
        .catch(error => console.error('Erro ao obter o tipo de usuário:', error))
  }
})

function carregarNavbar(user, userType) {
  fetch('navbar.html')
      .then(response => response.text())
      .then(data => {
          document.getElementById('navbar').innerHTML = data
          menu(user, userType)
          inicializarMenuHamburger()
      })
      .catch(error => console.error('Erro ao carregar a navbar:', error))
}


