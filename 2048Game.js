
const gridContainer = document.querySelector('.grid-container');/*find the first element in the DOM that matches the CSS selector '.grid-container' and stores a reference to it in the constant gridContainer. The dot prefix indicates a class selector, so the browser searches for an element with class="grid-container". This element will serve as the container for the game grid where the tiles will be displayed and manipulated during gameplay.*/
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('best-score');
const restartBtn = document.getElementById('restart-btn');

/*
flow is:
1)Update data → Move functions modify grid[][] (the model)
2)Then update UI → drawGrid() reads from grid[][] and updates the DOM (the view)
*/
let grid = [];          /*2D array representing the game board, where each element holds the value of a tile (0 for empty). This is the source of truth—it gets updated FIRST during the move functions (moveLeft, moveRight, etc.) with the new tile positions and merged values, WHILE the cell DOM elements still contain the old visual state until drawGrid() is called to sync them.*/
let score = 0;
const gridSize = 4;     /*dimensions of the game grid (#rows = #columns)*/
const TILE_SIZE = 100;  /*in pixels, the width and height of each tile in the grid*/
const GAP = 6;          /*in pixels, the spacing between tiles in the grid*/
let infinite = false;   /*flag to enable or disable infinite play mode*/
let mergedTiles = [];   /*array to keep track of tiles that have merged during a move*/

function startGame() {
  grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));/*initializes a 2D array representing the game board. The outer Array(size).fill() creates an array with 'size' number of undefined elements. The map function then replaces each undefined element with a new array (also of length 'size') filled with zeros. The result is a 4x4 grid (if size is 4) where each cell starts with a value of 0, indicating that the cell is empty at the beginning of the game.*/
  score = 0;
  initGrid();
  updateScore();
  addNewTile();
  addNewTile();
  drawGrid();
}

function initGrid() {
  gridContainer.innerHTML = ''; /*clears all HTML content inside the DOM element referenced by gridContainer by setting its innerHTML to an empty string. removes all child nodes (elements, text nodes, comment nodes) immediately from the DOM, which triggers layout/repaint work in the browser.*/
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = document.createElement('div');/*At this point the element exists only in JavaScript — it has no parent in the document tree until you append it with gridContainer.appendChild(cell). document.createElement('div') returns a proper DOM node (an HTMLDivElement) that you can configure: add classes, set dataset values, attach event listeners, set ARIA attributes for accessibility, or populate content. */
      cell.dataset.r = row;/*creates/updates a data attribute on the element so the element carries its grid coordinates as metadata that other code or CSS selectors can read.*/
      cell.dataset.c = col;
      const translateX = col * (TILE_SIZE + GAP); /*compute the pixel offsets for a tile’s position in the grid*/
      const translateY = row * (TILE_SIZE + GAP);
      cell.style.setProperty('--tx', `${translateX}px`);/* set CSS custom properties (variables) named --tx on the clicked/animated element by writing it to the element’s inline style. The DOM API call cell.style.setProperty('--tx', ${translateX}px) stores the literal string value (e.g., "24px") so CSS can later read it with var(--tx). Because the value includes the unit, the CSS that uses these variables (for example translate(var(--tx), var(--ty))) receives a ready-to-use length*/
      cell.style.setProperty('--ty', `${translateY}px`);/*CSS custom properties (often called CSS variables) let you define a name (starting with --) that holds a CSS value and then reuse that value elsewhere with the var() function. Custom properties live in the browser’s cascade and can change at runtime, inherit, and be overridden per selector or per element. JavaScript only updates the variables while CSS handles transitions/animations.--tx and --ty are set on each tile element so keyframes or transitions read per-tile offsets*/
      /*adding a set of Tailwind CSS utility classes to the newly created tile element, configuring its layout, appearance, and animation behavior in one concise operation.*/
      cell.classList.add(
        'absolute','flex','items-center','justify-center',/*layout classes: position the tile absolutely inside its positioning context and make the tile a flex container that centers its content both vertically and horizontally*/
        'text-2xl','font-bold','rounded','text-slate-900',/*The typographic and shape classes: set a large, bold number and give the tile rounded corners for a polished look.*/
        'transition-transform','duration-400','ease-in-out',/*The animation classes: tell Tailwind to animate only the transform property, using an ease-in-out timing function and a 400ms duration*/
        'bg-slate-600'/*provides a neutral dark fill for empty tiles*/
      );
      cell.style.width = TILE_SIZE + 'px';
      cell.style.height = TILE_SIZE + 'px';
      cell.style.transform = `translate(var(--tx), var(--ty))`;/*sets the element's inline transform property (so that takes precedence over any style properety defined in a stylesheet) to a CSS translate function that reads its X and Y offsets from the custom properties --tx and --ty. Because those variables were previously written to the element's inline style (via setProperty), the browser resolves var(--tx) and var(--ty) to the pixel values stored there and positions the tile accordingly.*/
      gridContainer.appendChild(cell);
    }
  }
}

function updateScore() {
  scoreDisplay.textContent = score;
  if (score > parseInt(bestScoreDisplay.textContent)) {
    bestScoreDisplay.textContent = score;
  }
}

function addNewTile() {
  const emptyCells = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === 0) emptyCells.push({ r: row, c: col });
    }
  }
  if (emptyCells.length === 0) return;
  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  grid[r][c] = Math.random() < 0.6 ? 2 : 4;
}

/*Maps tile values to background colors, getting progressively darker as values increase*/
function getTileColor(value) {
  const colorMap = {
    0: 'bg-slate-600',      // empty tile
    2: 'bg-amber-100',      // lightest
    4: 'bg-amber-200',
    8: 'bg-amber-300',
    16: 'bg-amber-400',
    32: 'bg-amber-500',
    64: 'bg-amber-600',
    128: 'bg-orange-500',
    256: 'bg-orange-600',
    512: 'bg-orange-700',
    1024: 'bg-red-500',
    2048: 'bg-red-600',
  };
  // For values beyond 2048, use the darkest color
  return colorMap[value] || 'bg-red-700';
}

/*Returns appropriate text color based on tile value for better contrast*/
function getTileTextColor(value) {
  // Darker text for light backgrounds, lighter text for dark backgrounds
  if (value <= 4) return 'text-slate-900';
  if (value <= 64) return 'text-slate-800';
  return 'text-white';
}

function drawGrid() {/*syncs the visual representation of the grid in the DOM with the underlying data model stored in the grid 2D array. It iterates over each cell in the grid, checks its value in the data model, and updates the corresponding DOM element to reflect that value. Additionally, it handles visual effects for merged tiles and checks for win conditions.*/
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const actualValue = grid[row][col];
      if (actualValue == 2048 && infinite == false){ /*check for win condition*/
        document.getElementById('win').classList.remove('hidden');
        document.getElementById('continue-btn').addEventListener('click', () => {
          document.getElementById('win').classList.add('hidden');
          infinite = true;
        });
      }
      const cell = gridContainer.querySelector(`[data-r="${row}"][data-c="${col}"]`);/*selects the specific tile element in the gridContainer that corresponds to the current row and column indices by using a CSS attribute selector that matches the data-r and data-c attributes set during grid initialization.*/
      const isMerged = mergedTiles.some(t => t.r === row && t.c === col);/*tile just merged and should receive an animation.*/
      const displayedValue = cell.textContent;
      const newValue = actualValue === 0 ? '' : actualValue.toString();
      const newBgColor = getTileColor(actualValue);
      const newTextColor = getTileTextColor(actualValue);
      
      if (isMerged || displayedValue !== newValue) {/*only update the tile if something has changed to avoid unnecessary DOM writes and reflows, which can impact performance.*/
        if (displayedValue !== newValue) {
          cell.textContent = newValue;
        }
        
        // Remove all possible background color classes
        cell.classList.remove(
          'bg-slate-600', 'bg-amber-100', 'bg-amber-200', 'bg-amber-300',
          'bg-amber-400', 'bg-amber-500', 'bg-amber-600', 'bg-orange-500',
          'bg-orange-600', 'bg-orange-700', 'bg-red-500', 'bg-red-600', 'bg-red-700'
        );
        // Remove text color classes
        cell.classList.remove('text-slate-900', 'text-slate-800', 'text-white');
        
        // Add the appropriate colors for this value
        cell.classList.add(newBgColor);
        cell.classList.add(newTextColor);
      }
      
      if (isMerged) { /*trigger the scale-up animation by toggling the scale-up class. The requestAnimationFrame ensures the class removal is processed before re-adding it, allowing the CSS animation to play correctly.*/
            // remove any previous animation state so we can retrigger it
            cell.classList.remove('scale-up');
            // Clear any previously scheduled timeout for this element
            if (cell._scaleUpTimeoutId) {// _scaleUpTimeoutId is used to hold a fallback timer that will remove the scale-up class after the animation duration, so clearing it prevents the old timer from firing later and interfering with a newly started animation.
              clearTimeout(cell._scaleUpTimeoutId);
              cell._scaleUpTimeoutId = null;
            }

            requestAnimationFrame(() => {//tells the browser you wish to perform an animation frame request and call this user-supplied callback function before the next repaint (schedules only one single call to the callback function). The frequency of calls to the callback function will generally match the display refresh rate. The most common refresh rate is 60 Hz
              // Add the class to start the animation
              cell.classList.add('scale-up');

              // Helper: parse CSS duration strings (e.g. "300ms", "0.3s") and return ms
              function parseDurationToMs(dur) {
                if (!dur) return 0;
                // If multiple durations are provided (comma-separated), take the first
                const first = dur.split(',')[0].trim();
                if (first.endsWith('ms')) return parseFloat(first);
                if (first.endsWith('s')) return parseFloat(first) * 1000;
                // Fallback: try number parse (assume ms)
                const n = parseFloat(first);
                return Number.isFinite(n) ? n : 0;
              }

              // Get computed animation duration, fall back to transition duration
              const cs = getComputedStyle(cell);// retrieves the final computed styles applied to the cell element after all CSS rules, inline styles, and inherited styles have been applied. This allows JavaScript to read the actual values the browser is using for rendering, which is essential for timing animations correctly. this function returns a live read-only CSSStyleProperties object containing the resolved values of all CSS properties of an element, after applying active stylesheets and resolving any computation those values may contain.
              let durationMs = parseDurationToMs(cs.animationDuration);//animation-duration for a cell comes from the CSS rule in index.html (the .scale-up { animation: scaleUp 0.3s ease forwards; } declaration). the browser applies that duration when the .scale-up class is added to the element at runtime.
              if (!durationMs) durationMs = parseDurationToMs(cs.transitionDuration);//safety fallback 

              // If still zero, use a sensible default constant (keeps backward compatibility)
              const DEFAULT_SCALE_UP_MS = 300;
              if (!durationMs) durationMs = DEFAULT_SCALE_UP_MS;

              // Use animationend as the primary way to cleanup the class after the scale-up effect finishes. Also set a timeout
              // as a fallback in case the event doesn't fire for whatever reason.
              const onEnd = () => {
                cell.classList.remove('scale-up');
                cell.removeEventListener('animationend', onEnd);
                if (cell._scaleUpTimeoutId) {
                  clearTimeout(cell._scaleUpTimeoutId);
                  cell._scaleUpTimeoutId = null;
                }
              };

              cell.addEventListener('animationend', onEnd, { once: true });// onEnd will run when a CSS animation on the cell element finishes

              // Fallback timeout: remove class after duration
              cell._scaleUpTimeoutId = setTimeout(() => {
                cell.classList.remove('scale-up');
                if (cell._scaleUpTimeoutId) {
                  clearTimeout(cell._scaleUpTimeoutId);
                  cell._scaleUpTimeoutId = null;
                }
                cell.removeEventListener('animationend', onEnd);
              }, durationMs + 20); // small buffer
            });
      }
    }
  }
  mergedTiles = [];/*clear the mergedTiles array after processing to prepare for the next move.*/
}

function handleInput(event) {
  let moved = false;
  switch (event.key) {
    case 'ArrowLeft':
      moved = moveLeft();
      break;
    case 'ArrowRight':
      moved = moveRight();
      break;
    case 'ArrowUp':
      moved = moveUp();
      break;
    case 'ArrowDown':
      moved = moveDown();
      break;
  }  
  if (!moreMoves()) {
    document.getElementById('game-over').classList.remove('hidden');
  }
  if (moved) {
    addNewTile(true); 
    drawGrid();  
  }
  if (!moreMoves()) {
    document.getElementById('game-over').classList.remove('hidden');
  }
}

function moreMoves() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === 0) return true;
      if (col < gridSize - 1 && grid[row][col] === grid[row][col + 1]) return true; 
      if (row < gridSize - 1 && grid[row][col] === grid[row + 1][col]) return true;
    }
  }
  return false;
}

function moveLeft() {
  let moved = false;

  for (let row = 0; row < gridSize; row++) {
    let newRow = grid[row].filter(x => x !== 0);//create a new array newRow that contains only the non-zero values from the current row of the grid. This effectively simulates sliding all tiles to the left by removing any gaps (zeros) between them.
    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2;            
        score += newRow[i]; 
		    mergedTiles.push({ r: row, c: i }); 
        newRow.splice(i + 1, 1); //remove the merged tile from the array. splice removes elements in place (shifting later elements left and reducing the array length)  
      }
    }
    while (newRow.length < gridSize) newRow.push(0);//fill the rest of the row with zeros to maintain the grid size
    if (newRow.toString() !== grid[row].toString()) moved = true; //compare the newRow with the original row in the grid. If they differ, it means a move or merge occurred, so we set moved to true.
    grid[row] = newRow;
  }
  updateScore();
  return moved;
}

function moveRight() {
  let moved = false;
  for (let row = 0; row < gridSize; row++) {
    let newRow = grid[row].filter(x => x !== 0);
    for (let i = newRow.length - 1; i > 0; i--) {
      if (newRow[i] === newRow[i - 1]) {
        newRow[i] *= 2;
        score += newRow[i];
        let finalIndex = gridSize - newRow.length + i;
        mergedTiles.push({ r: row, c: finalIndex });
        newRow.splice(i - 1, 1);
        i--;
      }
    }
    while (newRow.length < gridSize) newRow.unshift(0);//prepends zeros to the beginning of the array until its length equals gridSize. Each call to unshift inserts a 0 at index 0 and shifts the existing elements right, so the non‑zero tiles end up aligned to the right 
    if (newRow.toString() !== grid[row].toString()) moved = true;
    grid[row] = newRow;
  }
  updateScore();
  return moved;
}

function moveUp() {
  let moved = false;
  for (let col = 0; col < gridSize; col++) {
    let newCol = grid.map(row => row[col]).filter(x => x !== 0);
    for (let i = 0; i < newCol.length - 1; i++) {
      if (newCol[i] === newCol[i + 1]) {
        newCol[i] *= 2;
        score += newCol[i];
        mergedTiles.push({ r: i, c: col });
        newCol.splice(i + 1, 1);
      }
    }
    while (newCol.length < gridSize) newCol.push(0); 
    for (let r = 0; r < gridSize; r++) {
      if (grid[r][col] !== newCol[r]) moved = true;
      grid[r][col] = newCol[r];
    }
  }
  updateScore();
  return moved;
}

function moveDown() {
  let moved = false;
  for (let c = 0; c < gridSize; c++) {
    let newCol = grid.map(row => row[c]).filter(x => x !== 0);
    for (let i = newCol.length - 1; i > 0; i--) {
      if (newCol[i] === newCol[i - 1]) {
        newCol[i] *= 2;
        score += newCol[i];
        let finalRow = gridSize - newCol.length + i;
        mergedTiles.push({ r: finalRow, c });
        newCol.splice(i - 1, 1);
        i--;
      }
    }
    while (newCol.length < gridSize) newCol.unshift(0); 
    for (let r = 0; r < gridSize; r++) {
      if (grid[r][c] !== newCol[r]) moved = true;
      grid[r][c] = newCol[r];
    }
  }
  updateScore();
  return moved;
}

restartBtn.addEventListener('click', () => {
  startGame();
  document.getElementById('game-over').classList.add('hidden');
  document.getElementById('win').classList.add('hidden');
  infinite = false;
});

document.addEventListener('keydown', handleInput);

startGame();
