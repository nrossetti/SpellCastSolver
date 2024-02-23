class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  serialize() {
    return JSON.stringify(this.root);
  }
}

let letterValues = {
  A: 1, E: 1, I: 1, O: 1, N: 2, R: 2, S: 2, T: 2,
  D: 3, G: 3, L: 3, B: 4, H: 4, P: 4, M: 4, U: 4, Y: 4,
  C: 5, F: 5, V: 5, W: 5, K: 6, J: 7, X: 7, Q: 8, Z: 8,
};
let boardSize = 5;
let board = [];
let currentPos = { row: 0, col: 0 };
let isSolving = false;
let solverWorker;
let trie;

document.addEventListener("DOMContentLoaded", () => {
  initBoard();
  loadTrieAndStartWorker();
});

document.getElementById("solve").addEventListener("click", () => {
  if (solverWorker && !isSolving && board.every(row => row.every(cell => cell.letter))) {
    const boardData = board.map(row => row.map(cell => ({ letter: cell.letter, state: cell.state })));
    console.log('Solving started...');
    isSolving = true;
    document.getElementById("solve").disabled = true;
    document.getElementById("loading").style.display = "block";

    solverWorker.postMessage({ type: 'reset' });
    solverWorker.postMessage({
      type: 'solve',
      board: boardData,
      trieData: trie,
      values: letterValues,
    });
  }
});

function loadTrieAndStartWorker() {
  fetch("trie.json")
    .then(response => response.json())
    .then(trieData => {
      console.log("Loaded Trie Data:", trieData);
      trie = trieData;

      if (window.Worker) {
        solverWorker = new Worker("worker.js");
        document.getElementById("solve").disabled = false;

        solverWorker.onmessage = function (e) {
          const { topWords } = e.data;
          document.getElementById("loading").style.display = "none";
          isSolving = false;
          document.getElementById("solve").disabled = false;
          console.log('Top Words:', topWords);
          var words = topWords.map(w => `${w.word} (Score: ${w.score})`).join('\n');
          document.getElementById("results").textContent = words;
        };
      }
    }).catch(error => console.error("Error loading trie: ", error));
}

function initBoard() {
  const boardEl = document.getElementById("board");
  for (let i = 0; i < boardSize; i++) {
    board[i] = [];
    for (let j = 0; j < boardSize; j++) {
      const square = document.createElement("div");
      square.className = "square normal";
      square.setAttribute("data-row", i);
      square.setAttribute("data-col", j);
      square.setAttribute("data-state", "normal");
      boardEl.appendChild(square);
      board[i][j] = { letter: "", state: "normal" };

      square.addEventListener("click", function () {
        if (!isSolving) {
          let currentState = this.getAttribute("data-state");
          let nextState = currentState === "normal" ? "doubleLetter" : currentState === "doubleLetter" ? "doubleWord" : "normal";
          this.setAttribute("data-state", nextState);
          this.className = `square ${nextState}` + (this.classList.contains("active") ? " active" : "");
          board[i][j].state = nextState;
          if (!document.querySelector(".square.active")) {
            this.classList.add("active");
            currentPos = { row: i, col: j };
          }
        }
      });
    }
  }

  document.querySelector(".square").classList.add("active");
}

document.addEventListener("keydown", (e) => {
  if (!isSolving) {
    let activeSquare = document.querySelector(".square.active");
    if (activeSquare) {
      if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
        activeSquare.textContent = e.key.toUpperCase();
        let { row, col } = currentPos;
        board[row][col].letter = e.key.toUpperCase();
        moveToNextSquare();
      } else if (e.key === "Backspace") {
        moveToPreviousSquare();
        e.preventDefault();
      }
      checkBoardFull();
    }
  }
});

function moveToNextSquare() {
  if (currentPos.col < boardSize - 1) {
    currentPos.col++;
  } else if (currentPos.row < boardSize - 1) {
    currentPos.row++;
    currentPos.col = 0;
  } else {
    return;
  }
  updateActiveSquare();
}

function moveToPreviousSquare() {
  if (currentPos.col > 0) {
    currentPos.col--;
  } else if (currentPos.row > 0) {
    currentPos.row--;
    currentPos.col = boardSize - 1;
  } else {
    return;
  }
  updateActiveSquare();
}

function updateActiveSquare() {
  document.querySelectorAll(".square").forEach(square => square.classList.remove("active"));
  document.querySelector(`.square[data-row="${currentPos.row}"][data-col="${currentPos.col}"]`).classList.add("active");
}

function checkBoardFull() {
  const isFull = board.every(row => row.every(cell => cell.letter !== ""));
  document.getElementById("solve").disabled = !isFull;
}
