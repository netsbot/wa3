import { TileType, ResourceType } from './types';
import type { TileTypeDefinition } from './types';
import { Config } from './config';

export const flammable = (type: TileType) => {
    return type === TileType.Forest || type === TileType.Swamp || type === TileType.Ruins;
};

export const TileTypes: Record<TileType, TileTypeDefinition> = {
    [TileType.Forest]: {
        color: (p) => p.color(34, 139, 34),
        drawIcon(p, x, y, size) {
            let cx = x * size + size / 2;
            let cy = y * size + size / 2;

            p.push();
            p.translate(cx, cy);
            p.fill(0, 51, 0, 50);
            p.strokeWeight(2);
            p.triangle(-6, 0, 0, -14, 6, 0);
            p.triangle(-6, 6, 0, -8, 6, 6);
            p.triangle(-6, 6, 0, -8, 6, 6);
            p.rect(-2, 6, 4, 6);
            p.pop();
        },
        update(p, _tile, x, y, grid) {
            if (p.random() < Config.tiles.wildfireChance) return TileType.Wildfire;
            if (p.random() < Config.tiles.ruinsChance) return TileType.Ruins;
            if (p.random() < Config.tiles.swampChance) {
                let nearWater = false;
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        let nx = x + dx;
                        let ny = y + dy;
                        if (!grid[nx]?.[ny]) continue;
                        let t = grid[nx][ny].type;
                        if (t === TileType.River || t === TileType.Riverbed) {
                            nearWater = true;
                        }
                    }
                }
                if (nearWater) return TileType.Swamp;
            }
            return null;
        },
        onClick(_p, tile, _resources, addResource, spendResource) {
            if (!spendResource(ResourceType.Metal, 1)) return null;
            addResource(ResourceType.Wood, 1);
            tile.claimed = true;
            return null;
        },
    },

    [TileType.River]: {
        color: (p) => p.color(30, 174, 255),
        drawIcon(p, x, y, size) {
            let cx = x * size + size / 2;
            let cy = y * size + size / 2;

            p.push();
            p.translate(cx, cy);
            p.noFill();
            p.stroke(255, 120);
            p.strokeWeight(1.5);
            p.beginShape();
            for (let i = -10; i <= 10; i += 4) {
                p.vertex(i, p.sin(i * 0.4) * 3);
            }
            p.endShape();
            p.pop();
        },
        update(p, _tile, x, y, grid) {
            if (p.random() < Config.tiles.stormChance) return TileType.Storm;
            if (p.random() < Config.tiles.riverbedChance) {
                let nearLand = false;
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        let nx = x + dx;
                        let ny = y + dy;
                        if (!grid[nx]?.[ny]) continue;
                        let t = grid[nx][ny].type;
                        if (t !== TileType.River && t !== TileType.Riverbed) {
                            nearLand = true;
                        }
                    }
                }
                if (nearLand) return TileType.Riverbed;
            }
            return null;
        },
        onClick(_p, tile, _resources, addResource, spendResource) {
            if (!spendResource(ResourceType.Wood, 1)) return null;
            addResource(ResourceType.Water, 1);
            tile.claimed = true;
            return null;
        },
    },

    [TileType.Mountain]: {
        color: (p) => p.color(120),
        drawIcon(p, x, y, size) {
            let cx = x * size + size / 2;
            let cy = y * size + size / 2;

            p.push();
            p.translate(cx, cy);
            p.noStroke();
            p.fill(61, 54, 53, 100);
            p.triangle(-12, 6, 0, -12, 12, 6);
            p.pop();
        },
        update(p, _tile) {
            if (p.random() < Config.tiles.snowChance) return TileType.Snow;
            return null;
        },
        onClick(_p, tile, _resources, addResource, spendResource) {
            if (!spendResource(ResourceType.Water, 1)) return null;
            addResource(ResourceType.Metal, 1);
            tile.claimed = true;
            return null;
        },
    },

    [TileType.Snow]: {
        color: (p) => p.color(220, 235, 255),
        drawIcon(p, x, y, size) {
            let cx = x * size + size / 2;
            let cy = y * size + size / 2;

            p.push();
            p.translate(cx, cy);
            p.stroke(255);
            p.strokeWeight(2);
            p.line(-6, 0, 6, 0);
            p.line(0, -6, 0, 6);
            p.line(-4, -4, 4, 4);
            p.line(-4, 4, 4, -4);
            p.pop();
        },
        update() { return null; },
        onClick(_p, _tile, _resources, addResource) {
            addResource(ResourceType.Water, 1);
            return TileType.Mountain;
        },
    },

    [TileType.Riverbed]: {
        color: (p) => p.color(70, 104, 150),
        drawIcon(p, x, y, size) {
            let cx = x * size + size / 2;
            let cy = y * size + size / 2;

            p.push();
            p.translate(cx, cy);
            p.noStroke();
            p.fill(61, 54, 53, 100);
            p.triangle(-12, -6, 0, 12, 12, -6);
            p.pop();
        },
        update() { return null; },
        onClick(_p, _tile, _resources, addResource) {
            addResource(ResourceType.Metal, 1);
            return TileType.River;
        },
    },

    [TileType.Swamp]: {
        color: (p) => p.color(60, 100, 60),
        drawIcon(p, x, y, size) {
            let cx = x * size + size / 2;
            let cy = y * size + size / 2;

            p.push();
            p.translate(cx, cy);
            p.noStroke();
            p.fill(0, 100);
            p.ellipse(-4, 1, 9, 7);
            p.ellipse(5, -2, 7, 6);
            p.ellipse(1, 5, 6, 5);
            p.pop();
        },
        update(p) {
            if (p.random() < Config.tiles.stormChance) return TileType.Storm;
            return null;
        },
        onClick(_p, tile, _resources, addResource, spendResource) {
            if (!spendResource(ResourceType.Metal, 2)) return null;
            addResource(ResourceType.Wood, 1);
            addResource(ResourceType.Water, 2);
            tile.claimed = true;
            return null;
        },
    },

    [TileType.Ruins]: {
        color: (p) => p.color(100, 140, 110),
        drawIcon(p, x, y, size) {
            let cx = x * size + size / 2;
            let cy = y * size + size / 2;

            p.push();
            p.translate(cx, cy);
            p.fill(255);
            p.rect(-6, -6, 4, 16);
            p.rect(2, -2, 4, 12);
            p.pop();
        },
        update() { return null; },
        onClick(p, _tile, resources, addResource, spendResource) {
            if (resources[ResourceType.Wood] < 6 || resources[ResourceType.Metal] < 2) return null;
            spendResource(ResourceType.Wood, 6);
            spendResource(ResourceType.Metal, 2);
            addResource(ResourceType.Wood, p.floor(p.random(1, 3)));
            addResource(ResourceType.Metal, p.floor(p.random(4, 8)));
            addResource(ResourceType.Water, p.floor(p.random(1, 2)));
            return TileType.Forest;
        },
    },

    [TileType.Storm]: {
        color: (p) => p.color(60, 60, 100),
        drawIcon(p, x, y, size) {
            let cx = x * size + size / 2;
            let cy = y * size + size / 2;

            p.push();
            p.translate(cx, cy);
            p.fill(255, 200);
            p.noStroke();
            p.beginShape();
            p.vertex(-4, -12);
            p.vertex(3, -2);
            p.vertex(0, -2);
            p.vertex(5, 10);
            p.vertex(-3, 2);
            p.vertex(0, 2);
            p.endShape();
            p.pop();
        },
        update(p, tile) {
            if (p.random() < Config.tiles.stormClearChance) return tile.baseType;
            return null;
        },
        onClick() { return null; },
    },

    [TileType.Wildfire]: {
        color: (p) => p.color(200, 80, 20),
        drawIcon(p, x, y, size) {
            let cx = x * size + size / 2;
            let cy = y * size + size / 2;

            p.push();
            p.translate(cx, cy);
            p.noStroke();
            p.fill(255, 120, 0, 180);
            p.beginShape();
            p.vertex(0, -10);
            p.vertex(5, -2);
            p.vertex(2, -2);
            p.vertex(6, 6);
            p.vertex(-2, 2);
            p.vertex(0, 2);
            p.endShape();
            p.pop();
        },
        update(p, _tile, x, y, grid) {
            if (p.random() < Config.tiles.wildfireSpreadChance) {
                let dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
                let d = p.random(dirs);
                let nx = x + d[0];
                let ny = y + d[1];
                let neighbor = grid[nx]?.[ny];
                if (!neighbor) return null;
                if (flammable(neighbor.type) && !neighbor.claimed) {
                    neighbor.prevType = neighbor.type;
                    if (p.random() < 0.5) {
                        neighbor.type = TileType.Wildfire;
                    } else {
                        neighbor.type = TileType.Brimstone;
                    }
                    neighbor.animProgress = 0;
                    neighbor.iconSeed = p.random();
                    neighbor.iconVariant = p.random();
                }
            }
            return null;
        },
        onClick(_p, tile, _resources, _addResource, spendResource) {
            if (!spendResource(ResourceType.Water, 2)) return null;
            tile.claimed = true;
            return TileType.Forest;
        },
    },

    [TileType.Brimstone]: {
        color: (p) => p.color(40, 30, 30),
        drawIcon(p, x, y, size) {
            let cx = x * size + size / 2;
            let cy = y * size + size / 2;

            p.push();
            p.translate(cx, cy);
            p.fill(80);
            p.noStroke();
            p.ellipse(0, 0, 10, 8);
            p.ellipse(-4, 3, 6, 5);
            p.ellipse(5, -2, 5, 4);
            p.pop();
        },
        update() { return null; },
        onClick(_p, tile, _resources, _addResource, spendResource) {
            if (!spendResource(ResourceType.Wood, 1)) return null;
            tile.claimed = true;
            return null;
        },
    },
};
