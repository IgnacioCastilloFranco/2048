# 2048 Game

A browser-based implementation of the classic 2048 puzzle game, built with vanilla JavaScript and styled with Tailwind CSS.

![2048 Game](https://img.shields.io/badge/Game-2048-22d3ee?style=for-the-badge)

## 🎮 How to Play

1. Use the **arrow keys** (↑ ↓ ← →) to slide all tiles in that direction
2. When two tiles with the **same number** collide, they **merge into one** with their sum
3. After each move, a new tile (2 or 4) appears randomly on the board
4. Try to reach the **2048 tile** to win!
5. The game ends when no more moves are possible

## 🚀 Quick Start

### Option 1: Open directly
Simply double-click `index.html` to open the game in your default browser.

### Option 2: Local server (recommended)
```bash
# Using Python
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

## 📁 Project Structure

```
firehorse966/
├── index.html      # Main HTML file with layout and styles
├── 2048Game.js     # Game logic and DOM manipulation
└── README.md       # This file
```

## ✨ Features

- **Smooth Animations** — tiles scale up when merged using CSS keyframes
- **Score Tracking** — current score and best score display
- **Win Detection** — celebration screen when reaching 2048
- **Game Over Detection** — alerts when no more moves available
- **Responsive Layout** — centered grid with score panel on the right

## 🛠️ Technologies

| Technology | Purpose |
|------------|---------|
| **HTML5** | Page structure |
| **CSS3** | Animations (keyframes), custom properties |
| **JavaScript (ES6+)** | Game logic, DOM manipulation |
| **Tailwind CSS (CDN)** | Utility-first styling |

## 📝 Game Logic Overview

1. **Tile Spawning** — Adds a 2 (60% chance) or 4 (40% chance) to a random empty cell
2. **Move Handling** — Slides and merges tiles in the pressed direction
3. **Merge Animation** — CSS `scaleUp` keyframes create a pop effect
4. **Win/Lose Check** — Detects 2048 tile or no available moves

## 🔧 Development Notes

- **No build step required** — Uses Tailwind CDN for quick prototyping
- **CSS Custom Properties** — `--tx` and `--ty` store tile positions for smooth transforms

## 📄 License

This project is open source and available for learning purposes.

