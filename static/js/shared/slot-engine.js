(function () {
  'use strict';

  class Grid {
    constructor(cols, rows) {
      this.cols = cols;
      this.rows = rows;
      this.cells = Array.from({length: cols}, () => Array(rows).fill(null));
    }

    get(col, row) {
      return this.cells[col]?.[row] ?? null;
    }

    set(col, row, id) {
      if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
      this.cells[col][row] = id;
    }

    fillFrom(pool) {
      for (let col = 0; col < this.cols; col++) {
        for (let row = 0; row < this.rows; row++) {
          this.set(col, row, pool[Math.floor(Math.random() * pool.length)]);
        }
      }
    }

    all() {
      const cells = [];
      for (let col = 0; col < this.cols; col++) {
        for (let row = 0; row < this.rows; row++) {
          cells.push({c: col, r: row, id: this.get(col, row)});
        }
      }
      return cells;
    }
  }

  function buildRangeTable(range, special) {
    const table = {};
    range.forEach((id, index) => {
      table[id] = {
        pay: index === special.wild
          ? [0, 0, 0, 0, 0, 0, 0]
          : index === special.scatter
            ? [0, 0, 0.25, 0.75, 2, 6, 12]
            : [0, 0, 0, 0.25, 0.7, 1.8, 5],
        wild: index === special.wild,
        scatter: index === special.scatter,
      };
    });
    return table;
  }

  function evaluateLine(line, grid, table, bet) {
    const positions = [];
    let symbol = null;
    for (const [col, row] of line) {
      const id = grid.get(col, row);
      const entry = table[id];
      if (!entry || entry.scatter) break;
      if (!entry.wild && symbol === null) symbol = id;
      if (!entry.wild && symbol !== id) break;
      positions.push([col, row]);
    }
    if (positions.length < 3) return null;
    symbol = symbol || 'wild';
    const pay = table[symbol]?.pay || [];
    const amount = Math.round((pay[positions.length] || 0) * bet * 100) / 100;
    return amount > 0 ? {symbol, count: positions.length, amount, positions} : null;
  }

  function evalAll(grid, table, bet, options = {}) {
    const all = [];
    for (const line of options.lines || []) {
      const win = evaluateLine(line, grid, table, bet);
      if (win) all.push(win);
    }
    return {all, total: all.reduce((sum, win) => sum + win.amount, 0)};
  }

  function evalScatter(grid, table, bet) {
    const positions = grid.all()
      .filter(cell => table[cell.id]?.scatter)
      .map(cell => [cell.c, cell.r]);
    const count = positions.length;
    return {
      count,
      positions,
      amount: count >= 3 ? Math.round((table.scatter.pay[count] || 0) * bet * 100) / 100 : 0,
      freeSpins: table.scatter.freeSpins?.[count] ?? (count >= 5 ? 15 : count === 4 ? 10 : count === 3 ? 8 : 0),
    };
  }

  function placeMega(grid, pool, col, row, width, height) {
    const cells = [];
    for (let x = col; x < col + width; x++) {
      for (let y = row; y < row + height; y++) {
        if (x >= grid.cols || y >= grid.rows) return null;
        cells.push([x, y]);
      }
    }
    return {id: pool[Math.floor(Math.random() * pool.length)], cells, width, height};
  }

  function replaceCrashed(grid, positions, pool) {
    const removed = new Set(positions.map(([col, row]) => `${col},${row}`));
    for (let col = 0; col < grid.cols; col++) {
      const kept = [];
      for (let row = grid.rows - 1; row >= 0; row--) {
        if (!removed.has(`${col},${row}`)) kept.push(grid.get(col, row));
      }
      for (let row = grid.rows - 1; row >= 0; row--) {
        const next = kept.shift();
        grid.set(col, row, next || pool[Math.floor(Math.random() * pool.length)]);
      }
    }
  }

  window.SlotEngine = {
    Grid,
    MAX_CASCADE: 10,
    buildRangeTable,
    evalAll,
    evalScatter,
    placeMega,
    replaceCrashed,
  };
})();
