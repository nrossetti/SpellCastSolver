# Word Puzzle Solver

This project is a Word Puzzle Solver designed as a tool for exploring and understanding algorithms. It's built entirely in JavaScript and runs on a local server, providing an interactive GUI for inputting a 5x5 letter board. The application utilizes depth-first search (DFS) and trie data structure to efficiently find the highest scoring word based on predefined letter values and bonus squares for double letter and double word scores.

## Features

- Interactive 5x5 board for letter input
- Calculation of word scores with support for double letter and double word bonuses
- Identification of the highest scoring word based on a custom dictionary
- Visualization of the search process (future feature)

## Getting Started

To get the project up and running on your local machine, follow these steps:

1. Clone the repository to your local machine.
2. Ensure you have a modern web browser installed.
3. Open the project folder and run a local server to host the files.
4. Open your web browser and navigate to `http://localhost:8000` (or the port your server is running on).
5. The application should load, and you can start using the Word Puzzle Solver.

## Building the Trie

Before using the solver, you need to build a trie data structure from a list of valid words. This trie is used by the algorithm to efficiently check for word validity and prefixes. Follow these steps to build the trie:

1. Ensure you have a word list in JSON format. The list should be an array of words.
2. Use the provided script to convert the word list into a trie. The script will output a JSON file representing the trie.
3. Place the trie JSON file in the project directory. The application is set up to load this trie file when initializing.
