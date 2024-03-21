let p1cont = document.getElementById("p1-cont");
let player1form = document.getElementById("player-1-form");

let whichPlayerTurn = document.getElementById("player-turn");

let shootBtn = document.getElementById("shoot-btn");

let lastSelectedCell = null;

let player1;
let player2;

let grid = document.getElementById("grid");

let p2cont = document.getElementById("p2-cont");
let player2form = document.getElementById("player-2-form");

function clearBothGrids() {
  let cells = document.querySelectorAll("td");
  cells.forEach((cell) => {
    cell.innerText = "";
    cell.style.backgroundColor = "lightblue";
  });
}

function switchPlayers(currPlayer, oppPlayer) {
  currPlayer.turn = false;
  oppPlayer.turn = true;
  whichPlayerTurn.innerText = `${oppPlayer.name}'s turn`;
  clearBothGrids();
  initOwnGrid(oppPlayer, currPlayer);
  initTargetBoard(oppPlayer);
}

function isSunk(currShipCoords) {
  for (const key in currShipCoords) {
    if (currShipCoords.hasOwnProperty(key)) {
      if (!currShipCoords[key]) {
        return false;
      }
    }
  }
  return true;
}

function allShipsSunk(shipInfo) {
  for (const ship in shipInfo) {
    if (shipInfo.hasOwnProperty(ship)) {
      if (!shipInfo[ship]["isSunk"]) {
        return false;
      }
    }
  }
  return true;
}

function displayModal(text, displayBtn) {
  let modal = document.getElementById("modal");
  let modalText = document.getElementById("modal-txt");
  let modalBtn = document.getElementById("modal-btn");
  modal.style.display = "flex";
  modalText.innerText = text;
  if (displayBtn) {
    modalBtn.style.display = "block";
    modalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  } else {
    modalBtn.style.display = "none";
  }
}

function calculateScore(playerShipData) {
  let score = 24;
  for (const key in playerShipData) {
    if (playerShipData.hasOwnProperty(key)) {
      for (const point in playerShipData[key]["coords"]) {
        if (playerShipData[key]["coords"].hasOwnProperty(point)) {
          if (playerShipData[key]["coords"][point]) {
            score -= 2;
          }
        }
      }
    }
  }
  return score;
}

function gameOver(winnerPlayer, loserPlayer) {
  let winnerPlayerScore = calculateScore(winnerPlayer.shipData);
  let loserPlayerScore = calculateScore(loserPlayer.shipData);
  displayModal(
    `Game Over!\n\n
  ${winnerPlayer.name} sunk all of ${loserPlayer.name}'s ships.\n
  ${winnerPlayer.name} wins!\n
  ${winnerPlayer.name}'s score is ${winnerPlayerScore} points.
  ${loserPlayer.name}'s score is ${loserPlayerScore} points.\n
  Reload the page to play again.`,
    false
  );
}

function handleFiringShot(currPlayer, oppPlayer, cell, coords) {
  let isHit = false;
  let shipHit = null;
  for (const key in oppPlayer.shipData) {
    if (oppPlayer.shipData.hasOwnProperty(key)) {
      if (
        coords in oppPlayer.shipData[key]["coords"] &&
        oppPlayer.shipData[key]["coords"][coords] == false
      ) {
        // console.log(oppPlayer.name + `'s ${key} ship was hit!`);
        oppPlayer.shipData[key]["coords"][coords] = true;
        isHit = true;
        shipHit = key;
      }
    }
  }
  currPlayer.moves[coords] = isHit;
  let hitAndSink = false;
  let allSunk = false;
  if (isHit) {
    if (isSunk(oppPlayer.shipData[shipHit]["coords"])) {
      oppPlayer.shipData[shipHit]["isSunk"] = true;
      hitAndSink = true;
      if (allShipsSunk(oppPlayer.shipData)) {
        allSunk = true;
        gameOver(currPlayer, oppPlayer);
      }
    }
    if (hitAndSink && !allSunk) {
      clearBothGrids();
      displayModal(
        `HIT!\n
        You sunk ${oppPlayer.name}'s ${oppPlayer.shipData[shipHit]["shipName"]}!
        It's now ${oppPlayer.name}'s turn.\n
        Click OK to continue.`,
        true
      );
    } else if (!hitAndSink) {
      clearBothGrids();
      displayModal(
        `Shot HIT!!!\n
        It's now ${oppPlayer.name}'s turn.\n
        Click OK to continue.`,
        true
      );
    }
  } else {
    clearBothGrids();
    displayModal(
      `Shot MISS!!!\n
      It's now ${oppPlayer.name}'s turn.\n
      Click OK to continue.`,
      true
    );
  }
  switchPlayers(currPlayer, oppPlayer);
}

function handleShoot(event) {
  // console.log("click");
  let currPlayer = player1.turn ? player1 : player2;
  let oppPlayer = player1.turn ? player2 : player1;
  if (lastSelectedCell != null) {
    lastSelectedCell.innerText = "";
    lastSelectedCell.style.backgroundColor = "lightblue";
  }
  if (event.target.tagName == "TD") {
    let cellInd = event.target.cellIndex;
    let rowInd = event.target.parentElement.rowIndex;
    if (!(cellInd === undefined) && !(rowInd === undefined)) {
      // console.log("cell index ", cellInd);
      // console.log("row ind ", rowInd);
      // console.log(typeof event.target.className);
      if (!(event.target.className in currPlayer.moves)) {
        let cell = document.getElementsByClassName(event.target.className);
        handleFiringShot(
          currPlayer,
          oppPlayer,
          cell[0],
          event.target.className
        );
        // lastSelectedCell = cell[0];
        // cell[0].innerText = "X";
        // cell[0].style.backgroundColor = "orange";
        // shootBtn.style.display = "block";
        // shootBtn.addEventListener(
        //   "click",
        //   handleFiringShot(
        //     currPlayer,
        //     oppPlayer,
        //     cell[0],
        //     event.target.className
        //   )
        // );
      } else {
        displayModal(
          "You already shot here. Please choose another coordinate.",
          true
        );
      }
    }
  }
}

function initTargetBoard(player) {
  for (let i = 1; i <= 10; i++) {
    for (let j = "A".charCodeAt(0); j <= "J".charCodeAt(0); j++) {
      let cellClassName = String.fromCodePoint(j).concat(String(i));
      // console.log(cellClassName);
      let cell = document.getElementsByClassName(cellClassName);
      if (cellClassName in player.moves) {
        if (player.moves[cellClassName]) {
          cell[0].style.backgroundColor = "red";
          cell[0].innerText = "H";
          cell[0].style.color = "white";
        } else {
          cell[0].style.backgroundColor = "white";
          cell[0].innerText = "M";
          cell[0].style.color = "black";
        }
      }
    }
  }
}

function initOwnGrid(currPlayer, oppPlayer) {
  // console.log(player.turn);
  let currData = currPlayer.shipData;
  for (const key in currData) {
    if (currData.hasOwnProperty(key)) {
      // console.log(currData[key]["coords"][0][0]);
      for (const coord in currData[key]["coords"]) {
        let cell = document.getElementById(coord);
        if (key === "A") {
          cell.style.backgroundColor = "purple";
        } else if (key === "B") {
          cell.style.backgroundColor = "green";
        } else {
          cell.style.backgroundColor = "gray";
        }
        if (currData[key]["coords"][coord] == true) {
          cell.style.backgroundColor = "red";
        }
        cell.style.color = "white";
        cell.innerText = key;
      }
    }
  }

  let oppPlayerData = oppPlayer.moves;
  for (const shots in oppPlayerData) {
    if (oppPlayerData.hasOwnProperty(shots)) {
      if (!oppPlayerData[shots]) {
        let cell = document.getElementById(shots);
        cell.style.color = "black";
        cell.style.backgroundColor = "white";
        cell.innerText = "M";
      }
    }
  }
}

function parsedShipsArray(ship) {
  ship = ship[0].match(new RegExp("[A-J]\\d+", "g"));
  let x1 = String(ship[0].match(new RegExp("[A-J]")));
  let y1 = String(ship[0].match(new RegExp("\\d+")));
  let x2 = String(ship[1].match(new RegExp("[A-J]")));
  let y2 = String(ship[1].match(new RegExp("\\d+")));
  return [x1, y1, x2, y2];
}

function shipCoords(shipArr) {
  let shipCoordsObj = new Object();
  if (shipArr[0] === shipArr[2]) {
    // console.log("vertical ship");
    for (let i = parseInt(shipArr[1]); i <= parseInt(shipArr[3]); i++) {
      shipCoordsObj[shipArr[0].concat(i)] = false;
    }
  } else {
    // console.log("horizontal ship");
    for (let i = shipArr[0].charCodeAt(0); i <= shipArr[2].charCodeAt(0); i++) {
      shipCoordsObj[String.fromCharCode(i).concat(shipArr[1])] = false;
    }
  }
  return shipCoordsObj;
}

class Player {
  constructor(name, ship) {
    this.name = name;
    this.turn = false;
    this.moves = new Object();
    this.shipsArr = [];
    this.shipData = new Object();

    let aircraftCarrier = ship.match(new RegExp("A[:(][A-J]\\d*-[A-J]\\d*"));
    this.shipsArr[0] = parsedShipsArray(aircraftCarrier);

    let battleship = ship.match(new RegExp("B[:(][A-J]\\d*-[A-J]\\d*"));
    this.shipsArr[1] = parsedShipsArray(battleship);

    let submarine = ship.match(new RegExp("S[:(][A-J]\\d*-[A-J]\\d*"));
    this.shipsArr[2] = parsedShipsArray(submarine);

    //console.log(this.shipsArr);

    this.shipData["A"] = {
      coords: shipCoords(this.shipsArr[0]),
      isSunk: false,
      shipName: "Aircraft Carrier",
    };
    //console.log(this.shipData["airCar"]);
    this.shipData["B"] = {
      coords: shipCoords(this.shipsArr[1]),
      isSunk: false,
      shipName: "Battleship",
    };
    //console.log(this.shipData["bShip"]);
    this.shipData["S"] = {
      coords: shipCoords(this.shipsArr[2]),
      isSunk: false,
      shipName: "Submarine",
    };
    //console.log(this.shipData["bShip"]);

    // console.log(this.shipData);
  }
}

class Game {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
  }
  startGame() {
    displayModal(
      `${player1.name} starts first.\n
      Click on OK to start the game.`,
      true
    );
    player1.turn = true;
    p2cont.style.display = "none";
    grid.style.display = "flex";
    whichPlayerTurn.style.display = "block";
    whichPlayerTurn.innerText = `${player1.name}'s turn`;
    initOwnGrid(player1, player2);
    initTargetBoard(player1);
    console.log("Game has started");
  }
}

player1form.addEventListener("submit", function (e) {
  // console.log("here");
  e.preventDefault();
  let player1name = document.getElementById("player-1-name").value;
  let player1ships = document.getElementById("player-1-ship-placements").value;
  player1 = new Player(player1name, player1ships);
  // console.log(player1);
  p1cont.style.display = "none";
  p2cont.style.display = "block";
});

player2form.addEventListener("submit", (e) => {
  e.preventDefault();
  let player2name = document.getElementById("player-2-name").value;
  let player2ships = document.getElementById("player-2-ship-placements").value;
  player2 = new Player(player2name, player2ships);

  // console.log(player2);
  let game = new Game(player1, player2);
  game.startGame();
});

document.getElementById("target-grid").addEventListener("click", (event) => {
  handleShoot(event);
});
