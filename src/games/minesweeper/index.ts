class Minesweeper {

  rows: number;
  cols: number;
  mines: number;
  grid: TCellContent[][];
  started: boolean = false;
  userPlacedFlags: { x: number; y: number }[];
  flag: HTMLHeadingElement = document.querySelector('.flag') as HTMLHeadingElement;
  timer: HTMLHeadingElement = document.querySelector('.timer') as HTMLHeadingElement;
  interval : NodeJS.Timeout | null = null;

  constructor(rows: number, cols: number, mines: number) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.grid = this.createGrid(rows, cols);
    this.userPlacedFlags = [];
    this.mines = mines;

    this.flag.innerHTML = `${this.mines}`;
    this.timer.innerHTML = '000';
  }

  createGrid(rows: number, cols: number) {
    return Array.from({ length: rows }, () => Array(cols).fill(null));
  }

  revealCell(x: number, y: number) {

    const cell = document.querySelector(`.m-cell[data-row-index="${x}"][data-col-index="${y}"]`);
    
    if(!cell){
      throw new Error('Cell not found');
    }


  if(cell.classList.contains('flag')){
    return;
  }    

    if(!this.started){
      this.populateGrid(x, y);
      this.started = true;
    }

    if(this.isCellAMine(x, y)) {
      cell.classList.add('clicked-mine');
      this.endGame();
      return;
    }


    const cellContent = this.grid[x][y];
    if(cellContent === 'empty') {
      cell.classList.add('empty');
      cell.innerHTML = '';
      for(let i=-1; i<=1; i++) {
        for(let j=-1; j<=1; j++) {
            const ignoreSelf = (i === 0 && j === 0);
            const invalidCell = !this.isValidCell(x+i, y+j);
            const cellIsOpened = document.querySelector(`.m-cell[data-row-index="${x+i}"][data-col-index="${y+j}"]`)?.classList.contains('empty');
            // if(!cellIsOpened || cellIsOpened.classList.contains('empty')) continue; //
            if(ignoreSelf || invalidCell || cellIsOpened) continue;
            this.revealCell(x+i, y+j);
          }
        }
    } else if(typeof cellContent === 'number') {
      cell.classList.add('number');
      cell.innerHTML = `<span class="text-blue-500">${cellContent}</span>`;
    } else {
      throw new Error('Invalid cell content');
    }
  }

  toggleFlag(x: number, y: number) {
    const cell = document.querySelector(`.m-cell[data-row-index="${x}"][data-col-index="${y}"]`);
    if(!cell){
      throw new Error('Cell not found');
    }

    if(cell.classList.contains('flag')) {
      cell.innerHTML = ''
      cell.classList.remove('flag');
      this.userPlacedFlags = this.userPlacedFlags.filter(flag => flag.x !== x || flag.y !== y);
    } else {
      cell.innerHTML = '🚩';
      cell.classList.add('flag');
      this.userPlacedFlags.push({ x, y });
    }

    this.flag.innerHTML = `${this.mines - this.userPlacedFlags.length}`;
  }

  handleClick(button: 'right' | 'left', x: string, y: string) {
    if (button === 'left') {
      this.revealCell(parseInt(x), parseInt(y));
    } else if (button === 'right') {
      this.toggleFlag(parseInt(x), parseInt(y));
    }
  }

  populateGrid(x: number, y: number) {
   this.grid[x][y] = 'empty';

   // STart timer
   this.interval = setInterval(() => {
      if(!this.timer) {
        throw new Error('Timer element not found'); 
      }
      const currentTime = parseInt(this.timer.innerHTML);
      const newTime = currentTime + 1;
      this.timer.innerHTML = newTime.toString().padStart(3, '0');
    }, 1000);

   let minesToPlace = this.mines;


  while(minesToPlace > 0) {
      const randomX = Math.floor(Math.random() * this.rows);
      const randomY = Math.floor(Math.random() * this.cols);

      const isNeighbour = this.isNeighbour(x, y, randomX, randomY);
      if(isNeighbour) continue; // Don't place mine in the neighbouring cells of the first click

      if(this.grid[randomX][randomY] === null) {
        this.grid[randomX][randomY] = 'mine';
        minesToPlace--;
      }
    }

    for(let row=0; row<this.rows; row++) {
      for(let col=0; col<this.cols; col++) {
        if(this.grid[row][col] === 'mine' || this.grid[row][col] === 'empty') continue;

        let mineCount = 0;
        for(let i=-1; i<=1; i++) {
          for(let j=-1; j<=1; j++) {
            const ignoreSelf = (i === 0 && j === 0);
            if(ignoreSelf) continue;
            if(this.isCellAMine(row + i, col + j)) {
              mineCount++;
            }
          }
        }
        if(mineCount === 0) {
          this.grid[row][col] = 'empty';
          continue;
        }
        // If there are mines around, set the count
        this.grid[row][col] = mineCount;

      }
    }    
  }

  isCellAMine(x: number, y: number) {
    if (!this.isValidCell(x, y)) {
      return false; // Out of bounds
    }
    return this.grid[x][y] === 'mine';
  }

  renderAllMines() {
    for(let row=0; row<this.rows; row++) {
      for(let col=0; col<this.cols; col++) {
        if(this.grid[row][col] === 'mine') {
          const cell = document.querySelector(`.m-cell[data-row-index="${row}"][data-col-index="${col}"]`);
          if(!cell){
            throw new Error('Cell not found');
          }

          // cell.classList.add('mine');
          cell.innerHTML = `<span class="text-red-500">💣</span>`;
        }
      }
    }
  }

  isNeighbour(myX: number, myY: number, otherX: number, otherY: number) {
    const dx = Math.abs(myX - otherX);
    const dy = Math.abs(myY - otherY);
    return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);

  }

  isValidCell(x: number, y: number){
    return !(x < 0 || x >= this.rows || y < 0 || y >= this.cols)
  }

  endGame() {
    console.log("🚀 ~ Minesweeper ~ endGame ~ this.interval:", this.interval)
    if(this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.renderAllMines();
  }
}

type TCellContent = 'mine' | 'empty' | number;

/**
 * Concepts: 
 * 
 * 1. What is reactivity and fine-grained reactivity?
 * 2. astro script tag - is:inline ?
 * 3. esm vs cjs (browser support for esm)
 * 4. 
 */
export default Minesweeper;