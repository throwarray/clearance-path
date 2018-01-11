import AStar from './lib/astar.js';
import { toXY, toIndex, bitRange, satisfyMask, hasOwnProperty } from './lib/utils.js';

// TODO fix occupied (multi instance)
// TODO fix heuristic (costs) ?
// Mark unit area (taken or untaken)

const occupyIndex = (()=> {
    function _occupyIndex (unit, occupied, cols, del) {
        let size = unit.size;
        let i = unit.position;
        let right = cols - toXY(i, cols).x;
        for (let y = 0; y < size; y++) {
            let c = i + y * right;
            for (let x = 0; x < size; x++) {
                if (del) delete occupied[c + x];
                else occupied[c + x] = unit.id;
            }
        }
    }

    return function (unit, index, cols, occupied) {
        _occupyIndex(unit, occupied, cols, true);
        unit.position = index;
        _occupyIndex(unit, occupied, cols);
    };
})();

// True Clearance Metric
// MORE INFO aigamedev.com/open/tutorials/clearance-based-pathfinding/
function clearanceForCell (grid, x, y, numMask, satisfy) {
    const cols = grid[0].length;
    const rows = grid.length;
    const max = Math.max(cols, rows);
    let distance = -1;

    while (distance < max) {
        distance = distance + 1;
        if (!grid[y] || !satisfy(grid[y][x + distance], numMask))
            return distance;
        for (let n = 0; n < distance; n++) {
            let entry1 = grid[y + n + 1];
            let entry2 = grid[y + distance];
            if (
                /* Out of range (y) */
                !entry2 ||
                !entry1 ||
                /* Flag(s) not set */
                !satisfy(entry2[x + n], numMask) ||
                !satisfy(entry1[x + distance], numMask)
            ) return distance;
        }
    }
    return distance;
}

function markClearance (grid, numMask, satisfy = satisfyMask) {
    const rows = grid.length;
    const cols = grid[0].length;
    let index = 0;
    let clearances = Object.create(null);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let cl = clearanceForCell(grid, j, i, numMask, satisfy);
            if (cl) clearances[index] = cl;
            index++;
        }
    }
    return clearances;
}


const capabilityCount = 3;
const grid = (()=> {
    // Color and capability info (LAND, WATER, AIR)
    const W = (30 << capabilityCount) |
        (144 << (capabilityCount + 8)) |
        (255 << (capabilityCount + 16)) |
        0b011;
    const L = (34 << capabilityCount) |
        (139 << (capabilityCount + 8)) |
        (34 << (capabilityCount + 16)) |
        0b101;

    // Note an obvious optimization is to use a 1d array here
    return [
        [L, L, L, L, L, L, L, L, L, L],
        [L, L, L, L, L, L, L, L, W, L],
        [L, L, L, L, L, L, L, L, L, L],
        [L, L, L, W, L, L, L, L, L, L],
        [L, L, W, L, L, L, L, L, W, L],
        [L, L, W, W, W, L, L, W, L, L],
        [L, L, L, W, W, L, W, L, L, W],
        [L, L, L, L, W, L, L, L, L, W],
        [L, L, L, L, L, L, L, L, L, L],
        [L, L, L, L, L, L, L, L, L, L]
    ];
})();

const units = {
    0: {
        id: 0,
        size: 1,
        capability: 'water',
        position: 53,
        name: 'W', color: 'rgba(255, 255, 0, 0.8)'
    },
    1: {
        id: 1,
        size: 2,
        capability: 'land',
        position: 0,
        name: 'L', color: 'rgba(255, 255, 0, 0.8)'
    }
};

// Extract capabilities
const capabilities = (()=> {
    const maskAir = 1;
    const maskWater = 2;
    const maskLand = 4;
    // Note could be generated in one call (faster init)
    return Object.assign(Object.create(null), {
        air: markClearance(grid, maskAir),
        water: markClearance(grid, maskWater),
        land: markClearance(grid, maskLand)
    });
})();


// Mark initial unit areas as occupied
const cols = grid[0].length;
const occupied = Object.create(null);
for (let unit of Object.values(units)) {
    occupyIndex(unit, unit.position, cols, occupied);
}

// Initialize canvas
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
let select = document.getElementById('clearance');
let cellSize = 32;

canvas.width = 320;
canvas.height = 320;
document.body.appendChild(canvas);

// Handle select change
let selectedUnitID = null;
let selectValue = select.value;
select.onchange = function (evt) {
    selectValue = evt.target.value;
    draw();
};

function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let clearance = capabilities[selectValue];
    let index = 0;
    let cols = grid[0].length;

    ctx.strokeStyle = '#eee';

    for (let i = 0; i < grid.length; i++) {
        const y = cellSize * i;
        let col = grid[i];
        for (let j = 0; j < cols; j++) {
            const x = cellSize * j;
            const v = col[j];
            // Extract color info
            ctx.fillStyle = `rgb(${bitRange(v, capabilityCount, 8)}, ${bitRange(v, capabilityCount + 8, 8)}, ${bitRange(v, capabilityCount + 16, 8)})`;
            ctx.strokeRect(x, y, cellSize, cellSize);
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.fillStyle = 'white';
            ctx.font = '16px';
            // Display selected capability clearance or node index
            if (!clearance || hasOwnProperty(clearance, index))
                ctx.fillText(clearance? clearance[index] : index, x + 8, y + 16, cellSize, cellSize);
            index++;
        }
    }

    // Draw units
    let unitPos = {};
    ctx.strokeStyle = '#000';
    for (let unit of Object.values(units)) {
        toXY(unit.position, cols, unitPos);
        let posX = unitPos.x * cellSize;
        let posY = unitPos.y * cellSize;
        let size = (unit.size || 1) * cellSize;
        ctx.fillStyle = unit.color;
        ctx.fillRect(posX, posY, size, size);
        ctx.fillStyle = '#000';
        ctx.fillText(unit.name || unit.id, posX + size / 2, posY + size / 2);
        if (unit.id === selectedUnitID) {
            // Highlight selected unit
            ctx.strokeRect(posX, posY, size, size);
            // Display path
            if (unit.path) {
                let { path, dest } = unit.path;
                let id = dest;
                ctx.fillStyle = 'rgba(0,0,0, 0.2)';
                while (id !== null) {
                    let { x, y } = toXY(id, cols);
                    let px = x * cellSize;
                    let py = y * cellSize;
                    ctx.fillRect(px, py, cellSize, cellSize);
                    id = path[id];
                }
            }
        }
    }

    // requestAnimationFrame(draw);
}

draw();


canvas.onclick = function (e) {
    let posX = e.pageX - canvas.offsetLeft;
    let posY = e.pageY - canvas.offsetTop;
    let x = Math.floor(posX / cellSize);
    let y = Math.floor(posY / cellSize);
    let cols = grid[0].length;
    let index = toIndex(x, y, cols);

    // Select or deselect a unit
    if (hasOwnProperty(occupied, index)) {
        if (selectedUnitID === occupied[index]) selectedUnitID = null;
        else selectedUnitID = occupied[index];
    }
    // Select a destination
    else if (selectedUnitID !== null) {
        let unit = units[selectedUnitID];
        // Skip to previous path dest
        if (unit.path && unit.path.dest === index) {
            occupyIndex(unit, unit.path.dest, cols, occupied);
            unit.path = null;
        // Find path to destination using clearance data
        } else if (!occupied[index]) {
            let path = AStar(grid, unit.position, index, {
                id: selectedUnitID,
                data: capabilities[unit.capability || 'land'],
                size: unit.size,
                occupied
            });

            if (path.error) path.dest = path.nearest; // TODO Prune..
            unit.path = path;
        }
    }
    draw();
};
/////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////
