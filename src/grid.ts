import p5 from 'p5';
import type { Tile, Resources } from './types';
import { TileType } from './types';
import { Config } from './config';
import { TileTypes } from './tileTypes';

export function createTile(p: p5, type: TileType, elevation: number): Tile {
    return {
        type,
        baseType: type,
        elevation,
        claimed: false,
        iconSeed: p.random(),
        iconVariant: p.random(),
        prevType: type,
        animProgress: 1,
    };
}

export function generateGrid(p: p5): Tile[][] {
    const { cols, rows } = Config.grid;
    const { generation } = Config.world;
    
    p.noiseSeed(p.floor(p.random(10000)));

    let elevation: number[][] = [];
    let values: number[] = [];
    let waterMap: number[][] = [];

    for (let x = 0; x < cols; x++) {
        elevation[x] = [];
        waterMap[x] = [];
        for (let y = 0; y < rows; y++) {
            let e =
                p.noise(x * generation.noiseScale, y * generation.noiseScale) * 0.5 +
                p.noise(x * generation.detailScale, y * generation.detailScale) * 0.3 +
                p.noise(x * generation.fineScale, y * generation.fineScale) * 0.2;

            let breakup = p.noise(1000 + x * 0.25, 1000 + y * 0.25);
            e += (breakup - 0.5) * 0.25;

            elevation[x][y] = e;
            values.push(e);

            waterMap[x][y] =
                p.noise(500 + x * 0.12, 500 + y * 0.12) * 0.6 +
                p.noise(800 + x * 0.25, 800 + y * 0.25) * 0.4;
        }
    }

    values.sort((a, b) => a - b);

    let waterThreshold = values[p.floor(values.length * generation.waterThreshold)];
    let mountainThreshold = values[p.floor(values.length * generation.mountainThreshold)];

    let grid: Tile[][] = [];
    for (let x = 0; x < cols; x++) {
        grid[x] = [];
        for (let y = 0; y < rows; y++) {
            let e = elevation[x][y];
            let w = waterMap[x][y];
            let type: TileType;

            if (e < waterThreshold && w > 0.45) {
                type = TileType.River;
            } else if (e > mountainThreshold) {
                type = TileType.Mountain;
            } else {
                type = TileType.Forest;
            }

            grid[x][y] = createTile(p, type, e);
        }
    }

    return grid;
}

export function updateWorld(p: p5, grid: Tile[][], resources: Resources) {
    const { cols, rows } = Config.grid;
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            let tile = grid[x][y];
            let typeDef = TileTypes[tile.type];
            let result = typeDef.update(p, tile, x, y, grid, resources);

            if (result) {
                tile.prevType = tile.type;
                tile.type = result;
                tile.animProgress = 0;
                tile.iconSeed = p.random();
                tile.iconVariant = p.random();
                tile.snow = 0;
            }
        }
    }
}

export function drawTile(p: p5, x: number, y: number, tile: Tile, grid: Tile[][]) {
    const { tileSize } = Config.grid;
    let px = x * tileSize;
    let py = y * tileSize;

    if (tile.animProgress < 1) {
        tile.animProgress += 0.08;
    }

    let t = p.constrain(tile.animProgress, 0, 1);
    let c1 = TileTypes[tile.prevType].color(p);
    let c2 = TileTypes[tile.type].color(p);
    let blended = p.lerpColor(c1, c2, t);

    p.noStroke();
    p.fill(blended);
    p.rect(px, py, tileSize, tileSize);

    if (TileTypes[tile.type].drawIcon && iconCheck(x, y, tile, grid)) {
        p.push();
        TileTypes[tile.type].drawIcon!(p, x, y, tileSize);
        p.pop();
    }

    if (tile.claimed) {
        let c: p5.Color;
        if (tile.baseType === TileType.River) c = p.color(139, 69, 19);
        else if (tile.baseType === TileType.Forest) c = p.color(111, 158, 82);
        else if (tile.baseType === TileType.Mountain) c = p.color(160);
        else c = p.color(255, 255, 0, 120);

        p.fill(c);
        p.rect(px, py, tileSize, tileSize);
    }
}

export function drawBorders(p: p5, x: number, y: number, tile: Tile, grid: Tile[][]) {
    if (!tile.claimed) return;

    const { tileSize } = Config.grid;
    p.stroke(255, 50, 70);
    p.strokeWeight(3);
    p.noFill();

    let px = x * tileSize;
    let py = y * tileSize;

    let neighbors = [
        { dx: 0, dy: -1, side: "top" },
        { dx: 1, dy: 0, side: "right" },
        { dx: 0, dy: 1, side: "bottom" },
        { dx: -1, dy: 0, side: "left" },
    ];

    for (let n of neighbors) {
        let nx = x + n.dx;
        let ny = y + n.dy;
        let neighbor = grid[nx]?.[ny];

        if (!neighbor || !neighbor.claimed) {
            if (n.side === "top") p.line(px, py, px + tileSize, py);
            if (n.side === "right") p.line(px + tileSize, py, px + tileSize, py + tileSize);
            if (n.side === "bottom") p.line(px, py + tileSize, px + tileSize, py + tileSize);
            if (n.side === "left") p.line(px, py, px, py + tileSize);
        }
    }
    p.noStroke();
}

function iconCheck(x: number, y: number, tile: Tile, grid: Tile[][]) {
    if (tile.claimed) return true;

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            let n = grid[x + dx]?.[y + dy];
            if (n && n.type !== tile.type) return true;
        }
    }

    return tile.iconSeed < Config.tiles.iconThreshold;
}
