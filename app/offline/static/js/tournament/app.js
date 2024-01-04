const playerSelectButtons = document.querySelectorAll('#btnsNumberSelect button');
const winPontButtons = document.querySelectorAll('#btnsWinPoint button');
const btnStartTournament = document.getElementById("btnStartTournament");
const playerNamesTableBody = document.getElementById("playerNamesTableBody");

// Rimuovi i dati salvati in localStorage quando si carica la pagina
localStorage.removeItem("players");
localStorage.removeItem("matchups");
localStorage.removeItem("winPoints");

let playerNamesArray = [];
let winPoints;

// Aggiungi un gestore di eventi a ciascun pulsante
playerSelectButtons.forEach(button => {
  button.addEventListener('click', function() {
    playerSelectButtons.forEach(btn => {
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-outline-secondary")
    });
    const numPlayers = parseInt(this.getAttribute('data-players'));
    button.classList.toggle("btn-outline-secondary");
    button.classList.toggle("btn-secondary");
    generatePlayerNameInputs(numPlayers);
    updateStartButtonState();
  });
});

winPontButtons.forEach(button => {
  button.addEventListener('click', function() {
    winPontButtons.forEach(btn => {
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-outline-secondary")
    });
    winPoints = parseInt(this.getAttribute('data-btn'));
    button.classList.toggle("btn-outline-secondary");
    button.classList.toggle("btn-secondary");
    updateStartButtonState();
  });
});

function generatePlayerNameInputs(numPlayers) {
  // Pulisci il contenuto precedente della tabella
  playerNamesTableBody.innerHTML = '';

  // Resetta l'array prima di generarne uno nuovo
  playerNamesArray = [numPlayers];

  // Crea righe della tabella con gli input dei nomi dei giocatori
  for (let i = 1; i <= numPlayers; i++) {
    const playerNameInput = document.createElement('input');
    playerNameInput.type = 'text';
    playerNameInput.placeholder = `Nome giocatore ${i}`;
    playerNameInput.classList.add("form-control");

    playerNameInput.addEventListener('input', function () {
      const newName = playerNameInput.value.trim();

      // Controlla se il nome è già presente nell'array
      const isNameTaken = playerNamesArray.includes(newName);

      if (isNameTaken) {
        alert("Il nome del giocatore deve essere unico. Scegli un altro nome.");
        playerNameInput.value = ''; // Cancella l'input se il nome è già stato preso
      } else {
        // Aggiorna l'array solo se il nome è unico
        playerNamesArray[i - 1] = newName;

        // Controlla se tutti gli input sono completi
        updateStartButtonState();
      }
    });

    const tableRow = document.createElement('tr');
    const tableHeader = document.createElement('th');
    tableHeader.scope = 'row';
    tableHeader.textContent = i;

    const tableData = document.createElement('td');
    tableData.classList.add("text-center"); // Aggiungi la classe Bootstrap per centrare il testo
    tableData.appendChild(playerNameInput);

    tableRow.appendChild(tableHeader);
    tableRow.appendChild(tableData);
    playerNamesTableBody.appendChild(tableRow);
  }
}

const isEveryInputEmpty = () => {
  var inputs = playerNamesTableBody.querySelectorAll("input[type='text']");
  
  for (const input of inputs) {
    console.log(input.value);
    if (input.value === '')
      return false;
  }
  return true;
}

function updateStartButtonState() {
  // Controlla se tutti gli input sono completi
  const allInputsComplete = isEveryInputEmpty();

  // Controlla anche se è stato selezionato il numero di giocatori e il punto di vittoria
  const isPlayerNumberSelected = [...playerSelectButtons].some(btn => btn.classList.contains("btn-secondary"));
  const isWinPointSelected = [...winPontButtons].some(btn => btn.classList.contains("btn-secondary"));

  // Abilita o disabilita il pulsante "Start Tournament" in base alle condizioni
  btnStartTournament.disabled = !(allInputsComplete && isPlayerNumberSelected && isWinPointSelected);
}

// Aggiungi l'evento click al pulsante "Start Tournament"
btnStartTournament.addEventListener("click", function () {
  localStorage.setItem('players', JSON.stringify(playerNamesArray));
  localStorage.setItem('matchups', JSON.stringify(null));
  localStorage.setItem('winPoints', winPoints);
  window.location.href = "table/";
});
