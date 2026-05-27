import p5 from 'p5';
import type { Tile } from './types';
import { ResourceType } from './types';
import { Config } from './config';
import { generateGrid, updateWorld, drawTile, drawBorders } from './grid';
import { Player } from './player';
import { ResourceManager } from './resources';
import { TileTypes } from './tileTypes';

export const sketch = (p: p5) => {
    let grid: Tile[][] = [];
    let worldTick = 0;
    const player = new Player();
    const resourceManager = new ResourceManager();
    const keysPressed: number[] = [];
    const keyPressTimes = new Map<number, number>();

    p.setup = () => {
        const canvas = p.createCanvas(Config.grid.cols * Config.grid.tileSize, Config.grid.rows * Config.grid.tileSize);
        // Ensure the canvas can receive keyboard focus
        canvas.elt.tabIndex = 0; 
        grid = generateGrid(p);
        player.spawn(p, grid);

        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', (e) => {
                // Prevent space and arrow keys from scrolling the page
                if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
                    e.preventDefault();
                }
                const code = e.keyCode;
                if (!keysPressed.includes(code)) {
                    keysPressed.push(code);
                    keyPressTimes.set(code, p.millis());
                    console.log("[INPUT] Native keydown:", code, "Active List:", [...keysPressed]);
                }
            });

            window.addEventListener('keyup', (e) => {
                const code = e.keyCode;
                const index = keysPressed.indexOf(code);
                if (index > -1) {
                    keysPressed.splice(index, 1);
                }
                keyPressTimes.delete(code);
                console.log("[INPUT] Native keyup:", code, "Active List:", [...keysPressed]);
            });

            window.addEventListener('blur', () => {
                keysPressed.length = 0;
                keyPressTimes.clear();
                console.log("[INPUT] Native blur: cleared keys");
            });
        }
    };

    p.draw = () => {
        p.background(30);

        player.handleMovement(keysPressed, keyPressTimes, p.millis(), grid);
        player.update();

        worldTick++;
        if (worldTick % Config.world.tickRate === 0) {
            updateWorld(p, grid, resourceManager.resources);
        }

        for (let x = 0; x < Config.grid.cols; x++) {
            for (let y = 0; y < Config.grid.rows; y++) {
                drawTile(p, x, y, grid[x][y], grid);
            }
        }

        for (let x = 0; x < Config.grid.cols; x++) {
            for (let y = 0; y < Config.grid.rows; y++) {
                drawBorders(p, x, y, grid[x][y], grid);
            }
        }

        player.draw(p);
        drawUI(p, resourceManager.resources);
    };

    p.mousePressed = () => {
        // Force focus so WASD works immediately
        if (typeof window !== 'undefined') window.focus();

        let x = p.floor(p.mouseX / Config.grid.tileSize);
        let y = p.floor(p.mouseY / Config.grid.tileSize);

        if (x >= 0 && x < Config.grid.cols && y >= 0 && y < Config.grid.rows) {
            // Check if tile is adjacent to player
            const isAdjacent = Math.abs(x - player.x) + Math.abs(y - player.y) === 1;
            
            if (isAdjacent) {
                const success = clickTile(grid[x][y]);
                // Automatically move player to the tile if they successfully claimed it
                if (success) {
                    player.moveTo(x, y);
                }
            }
        }
    };

    function clickTile(tile: Tile): boolean {
        if (tile.claimed) return false;

        const typeDef = TileTypes[tile.type];
        const result = typeDef.onClick(
            p, 
            tile, 
            resourceManager.resources, 
            (type, amount) => resourceManager.add(type, amount),
            (type, amount) => resourceManager.spend(type, amount)
        );

        if (result !== null) {
            tile.prevType = tile.type;
            tile.type = result;
            tile.animProgress = 0;
            tile.iconSeed = p.random();
            tile.iconVariant = p.random();
        }

        return tile.claimed;
    }

    function drawUI(p: p5, resources: any) {
        p.fill(255);
        p.textSize(16);
        p.stroke(0);
        p.strokeWeight(3);
        p.text(`Wood: ${resources[ResourceType.Wood]}`, 10, p.height - 50);
        p.text(`Water: ${resources[ResourceType.Water]}`, 10, p.height - 30);
        p.text(`Metal: ${resources[ResourceType.Metal]}`, 10, p.height - 10);
    }
};
