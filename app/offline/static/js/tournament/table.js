const tournamentBracket = document.getElementById("tournamentBracket");

let players = JSON.parse(localStorage.getItem("players"));
let matchups = localStorage.getItem("matchups") ? JSON.parse(localStorage.getItem("matchups")) : [];

function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

// Funzione per creare i match-up del torneo
function createMatchups(players) {
  let matchups = [];
  for (let i = 0; i < players.length; i += 2) {
    const match = [players[i], players[i + 1]];
    matchups.push(match);
  }
  return matchups;
}

// Funzione per visualizzare il tabellone del torneo
function displayTournamentBracket() {

  if (matchups === null || matchups.length === 0) {
    // Mescola l'array dei nomi dei giocatori per sorteggiare casualmente le partite
    const shuffledPlayers = shuffleArray(players);
    // Crea un array per i match-up del torneo
    matchups = createMatchups(shuffledPlayers);
    localStorage.setItem('matchups', JSON.stringify(matchups));
  }
  
  if (players.length === 1) {
    alert(`${players[0]} win the Tournament!`);
    window.location.href = '/local/tournament';
  }

  tournamentBracket.innerHTML = ''; // Pulisci il contenuto precedente

  // Crea un elemento div per ogni match-up
  matchups.forEach((match, index) => {
    const matchDiv = document.createElement("div");
    matchDiv.classList.add("col-12", "mb-3");

    // Crea un elemento card per il match-up
    const card = document.createElement("div");
    card.classList.add("card");

    // Crea il corpo della card
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    // Aggiungi il titolo del match-up
    const matchTitle = document.createElement("h5");
    matchTitle.classList.add("card-title");
    matchTitle.textContent = `Match ${index + 1}`;
    cardBody.appendChild(matchTitle);

    // Aggiungi i giocatori del match-up
    match.forEach(player => {
      const playerNameSpan = document.createElement("span");
      playerNameSpan.classList.add("fw-bold");
      playerNameSpan.textContent = player;

      cardBody.appendChild(playerNameSpan);
      cardBody.appendChild(document.createElement("br"));
    });

    card.appendChild(cardBody);
    matchDiv.appendChild(card);
    tournamentBracket.appendChild(matchDiv);
  });

  // Aggiungi un bottone per iniziare la partita
  const startMatchButton = document.createElement("button");
  startMatchButton.classList.add("btn", "btn-primary");
  startMatchButton.textContent = "Inizia la partita";
  startMatchButton.addEventListener("click", startMatch);
  tournamentBracket.appendChild(startMatchButton);
}

displayTournamentBracket();

function startMatch() {
  window.location.href = "play/";
}