# LoveLogic - FLAMES and Love Percentage

A playful web app with two calculators for two names: the classic **FLAMES** relationship game and a **Love Percentage** calculator. Built with plain HTML, CSS and JavaScript.

**Live demo:** https://danumilanatti.github.io/flames-calculator/

## Features

- **Home page** with links to both calculators
- **FLAMES calculator** that finds Friends, Love, Affection, Marriage, Enemy or Sister
- **Animated elimination** of each letter, with the surviving letter highlighted
- **Love Percentage** calculator using a digit-counting and reduction method
- Input validation for empty names, identical names and names that fully cancel out
- Responsive design for mobile, tablet and desktop

## How FLAMES works

1. Both names are lowercased and cleaned to letters only.
2. Common letters are cancelled one occurrence at a time.
3. The remaining letters are counted. This is the **Love number**.
4. The letters F, L, A, M, E, S are stored in a **Circular Singly Linked List (CSLL)**.
5. The **Josephus algorithm** counts that many nodes, removes the node it lands on, and repeats from the next node until one letter is left.

Each node holds a letter and one `next` pointer. The last node points back to the first, so counting loops around the circle. Arrays are not used during the elimination.

| Letter | Meaning |
|---|---|
| F | Friends |
| L | Love |
| A | Affection |
| M | Marriage |
| E | Enemy |
| S | Sister |

## How the Love Percentage works

1. Write both names together and count each letter, in the order it first appears.
2. Add the first and last digits, then the second and second-last, and so on. A middle digit stays as it is.
3. Repeat until two digits are left. Read them side by side as the percentage.

Example: Romeo and Juliet gives `1 2 1 2 1 1 1 1 1`, then `2 3 2 3 1`, then `3 6 2`, then `5 6`, so the result is **56%**. The same two names always give the same result.

## Project structure

```
index.html        Home page
flames.html       FLAMES calculator page
percentage.html   Love Percentage page
style.css         Styling, animations and responsive layout
script.js         Name processing, CSLL and Josephus algorithm
percentage.js     Love Percentage algorithm
```

## Run locally

1. Clone the repository: `git clone https://github.com/danumilanatti/flames-calculator.git`
2. Open `index.html` in your browser, or use the VS Code Live Server extension.

## Technologies

HTML5, CSS3, JavaScript, Git and GitHub Pages.