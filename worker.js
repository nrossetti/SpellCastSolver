class TrieNode {
    constructor() {
      this.children = {};
      this.isEndOfWord = false;
    }
  }
  
  class Trie {
    constructor(trieData) {
        this.root = this.rebuildTrie(trieData);
    }

    rebuildTrie(nodeData) {
        let node = new TrieNode();
        if (nodeData.isEndOfWord !== undefined) {
            node.isEndOfWord = nodeData.isEndOfWord;
        }
        Object.keys(nodeData.children || {}).forEach(char => {
            node.children[char] = this.rebuildTrie(nodeData.children[char]);
        });
        return node;
    }
  
    startsWith(prefix) {
      let node = this.root;
      for (const char of prefix) {
        if (!node.children || !node.children[char]) {
          console.log(`No prefix '${prefix}' found at char '${char}'`);
          return false;
        }
        node = node.children[char];
      }
      return true;
    }
  
    search(word) {
      let node = this.root;
      for (const char of word) {
        if (!node.children || !node.children[char]) {
          console.log(`Word '${word}' not found at char '${char}'`);
          return false;
        }
        node = node.children[char];
      }
      return node.isEndOfWord;
    }
  }
  
  let highestScore = 0;
  let topWords = [];
  let bestWord = "";
  let letterValues;
  
  onmessage = function(e) {
    if (e.data.type === 'reset') {
      topWords = [];
      return;
    }
  
    if (e.data.type === 'solve') {
      const { board, trieData, values } = e.data;
      let letterValues = values;
      let trie = new Trie(trieData);
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          dfs(row, col, [], {}, board, trie);
        }
      }
  
      postMessage({ topWords });
    }
  };

  function updateTopWords(word, score) {
    topWords.push({ word, score });
    topWords.sort((a, b) => b.score - a.score);
    if (topWords.length > 3) {
      topWords.pop();
    }
  }

  function dfs(row, col, path, visited, board, trie) {
    if (row < 0 || col < 0 || row >= 5 || col >= 5 || visited[`${row},${col}`]) return;

    const currentLetter = board[row][col].letter.toLowerCase();
    path.push({ letter: currentLetter, position: { row, col } });

    const word = path.map(p => p.letter).join('');
    console.log(`Visiting [${row}, ${col}] - Path: ${word}`);
  
    if (!trie.startsWith(word)) {
      path.pop();
      return;
    }
  
    if (trie.search(word)) {
      const score = calculateScore(path, board);
      console.log(`Valid word found: ${word} with score ${score}`);
      if (score > (topWords[2]?.score || 0) || topWords.length < 3) {
        updateTopWords(word, score);
      }
    }
  
    visited[`${row},${col}`] = true;
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    directions.forEach(([dx, dy]) => {
      dfs(row + dx, col + dy, path.slice(), visited, board, trie);
    });
    visited[`${row},${col}`] = false;
    path.pop();
  }
  
  function calculateScore(path, board) {
    let score = 0;
    let doubleWordMultiplier = 1;
  
    path.forEach(({ letter, position }) => {
      let { row, col } = position;
      let tile = board[row][col];
      let letterScore = letterValues[letter.toUpperCase()] || 0;
  
      if (tile.state === "doubleLetter") {
        letterScore *= 2;
      } else if (tile.state === "doubleWord") {
        doubleWordMultiplier *= 2;
      }
  
      score += letterScore;
    });
  
    score *= doubleWordMultiplier;
  
    if (path.length >= 5) {
      score += 10;
    }
  
    return score;
  }
  
  onmessage = function(e) {
    console.log('Worker received message:', e.data);
    const { board, trieData, values } = e.data;
    letterValues = values;
  
    let trie = new Trie(trieData);
  
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        dfs(row, col, [], {}, board, trie);
      }
    }
  
    postMessage({ topWords });
  };