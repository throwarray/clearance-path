import PriorityQueue from 'algorithms/data_structures/priority_queue.js';
import { LinkedStack } from './stack.js'; // itterable and clearable
import { toXY, toIndex } from './utils.js';

let hasOwn = Object.prototype.hasOwnProperty;
let neighborDirections = [-1, -1, -1, 0, -1, 1, 0, 1, 1, 1, 1, 0, 1, -1, 0, -1];

// Recycle vectors
let nodeA = {};
let nodeB = {};

let defaultPathOptions = {
    finished (grid, unit, current_id, endId) {
        return current_id === endId;
    },
    retracePath (grid, unit, path) {
        if (path.error) return path;
        let dest = path.dest;
        let steps = path.path;
        let out = Object.create(null);
        path.path = out;
        while (dest !== null) {
            out[dest] = steps[dest];
            dest = steps[dest];
        }

        return path;
    },
    getNeighboringIDS (grid, unit, acc, current_id /*, endId*/) {
        let height = grid.length;
        let width = grid[0].length;
        let { x, y } = toXY(current_id, width, nodeA);
        for (let i = 0; i < neighborDirections.length; i += 2) {
            let iy = y + neighborDirections[i];
            let ix = x + neighborDirections[i + 1];
            if (ix < 0 || iy < 0 || iy >= height || ix >= width) continue;
            else {
                let neighbor_id = toIndex(ix, iy, width);
                if (this.traversable(grid, unit, current_id, neighbor_id))
                    acc.push(neighbor_id);
            }
        }
        return acc;
    },
    traversable (grid, unit, a, b) {
        return !(unit && (
            (hasOwn.call(unit.occupied, b) && unit.occupied[b] !== unit.id) ||
            !hasOwn.call(unit.data, b) || (unit.data[b] && unit.data[b] < unit.size)
        ));
    },
    heuristic (grid, unit, a, b) {
        let width = grid[0].length;
        let c = toXY(a, width, nodeA);
        let g = toXY(b, width, nodeB);
        let dy = Math.abs(c.y - g.y);
        let dx = Math.abs(c.x - g.x);
        return (dy + dx);
    },
    cost (grid, unit, a, b) {
        // todo fixme
        let width = grid[0].length;
        let c = toXY(a, width, nodeA);
        let g = toXY(b, width, nodeB);
        let dy = Math.abs(c.y - g.y);
        let dx = Math.abs(c.x - g.x);
        let cost = grid[g.y][g.x] === 2 ? 0 : 1;

        cost *= 7;
        return cost + (
            dx > dy ?
                7 * dy + 5 * (dx - dy) :
                7 * dx + 5 * (dy - dx)
        );

        // return cost + (Math.sqrt(dy*dy + dx*dx));
    }
};

export default function AStar (grid, startId, endId, unit, options = defaultPathOptions, path = Object.create(null)) {
    // NOTE options not spread to keep _this_ binding
    let closed = {}; // closed nodes
    let cameFrom = { [startId]: null }; // path reconstruction
    let gCost = { [startId]: 0 }; // cost
    let lowestHCost = options.heuristic(grid, unit, startId, endId);
    let open = new PriorityQueue(); // queued by lowest fCost
    let neighborStack = new LinkedStack(); // store n neighbors

    // Insert initial node id into queue
    open.insert(startId, lowestHCost);
    path.src = startId;
    path.dest = endId;
    path.path = cameFrom;
    path.error = false;
    path.nearest = lowestHCost;

    while(!open.isEmpty()) {
        // Remove node with lowest fCost
        const current_id = open.extract();

        // Found path to target
        if (options.finished(grid, unit, current_id, endId))
            return options.retracePath(grid, unit, path);

        // Close the current node
        closed[current_id] = true;

        // Recycle our neighbors list
        if (neighborStack.clear) neighborStack.clear();
        else neighborStack = [];

        // Get current neighbor ids
        neighborStack = options.getNeighboringIDS(
            grid,
            unit,
            neighborStack,
            current_id,
            endId
        );

        // Quit early (no neighbors returned)
        if (!neighborStack || !(neighborStack.length || neighborStack._size))
            break;

        // NeighborStack is itterable
        else for (let neighbor_id of neighborStack) {
            if (!hasOwn.call(closed, neighbor_id)) {
                let cost = options.cost(grid, unit, current_id, neighbor_id);
                let new_cost = gCost[current_id] + cost;
                if (new_cost < gCost[neighbor_id] || open._priority[neighbor_id] === undefined) {
                    let heuristic = options.heuristic(grid, unit, neighbor_id, endId);
                    let f = new_cost + heuristic;

                    cameFrom[neighbor_id] = current_id;
                    gCost[neighbor_id] = new_cost;

                    // Nearest node (based on heuristic)
                    if (heuristic < lowestHCost) {
                        lowestHCost = heuristic;
                        path.nearest = neighbor_id;
                    }
                    open.insert(neighbor_id, f);
                }
            }
        }
    }

    // Failed to find path
    path.error = true;
    return options.retracePath(grid, unit, path);
}

export {
    AStar,
    defaultPathOptions
};
