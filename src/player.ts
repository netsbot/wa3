import p5 from 'p5';
import type { Tile } from './types';
import { TileType } from './types';
import { Config } from './config';

export class Player {
    x: number = 0;
    y: number = 0;
    px: number = 0;
    py: number = 0;
    targetX: number = 0;
    targetY: number = 0;
    move: boolean = false;
    lastActiveKey: number = -1;
    lastMoveStartTime: number = 0;

    spawn(p: p5, grid: Tile[][]) {
        while (true) {
            let x = p.floor(p.random(Config.grid.cols));
            let y = p.floor(p.random(Config.grid.rows));

            if (grid[x][y].type !== TileType.River) {
                grid[x][y].claimed = true;
                this.x = x;
                this.y = y;
                this.px = x * Config.grid.tileSize + Config.grid.tileSize / 2;
                this.py = y * Config.grid.tileSize + Config.grid.tileSize / 2;
                this.targetX = this.px;
                this.targetY = this.py;
                break;
            }
        }
    }

    update() {
        if (!this.move) return;

        let dx = this.targetX - this.px;
        let dy = this.targetY - this.py;

        let d = Math.sqrt(dx * dx + dy * dy);
        let speed = Config.player.speed;

        if (d > speed) {
            this.px += (dx / d) * speed;
            this.py += (dy / d) * speed;
        } else {
            this.px = this.targetX;
            this.py = this.targetY;
            this.move = false;
        }
    }

    draw(p: p5) {
        p.fill(...Config.player.color);
        p.noStroke();
        p.ellipse(this.px, this.py, Config.grid.tileSize * 0.5);
    }

    moveTo(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.targetX = x * Config.grid.tileSize + Config.grid.tileSize / 2;
        this.targetY = y * Config.grid.tileSize + Config.grid.tileSize / 2;
        this.move = true;
    }

    handleMovement(keysPressed: number[], keyPressTimes: Map<number, number>, currentTime: number, grid: Tile[][]) {
        if (this.move) return;

        let activeKey = -1;
        let dx = 0;
        let dy = 0;

        // Iterate forwards through the pressed keys (oldest pressed first)
        // to find the active movement input.
        for (let i = 0; i < keysPressed.length; i++) {
            const code = keysPressed[i];
            if (code === 87 || code === 38) { // W or Up
                dy = -1;
                activeKey = code;
                break;
            } else if (code === 83 || code === 40) { // S or Down
                dy = 1;
                activeKey = code;
                break;
            } else if (code === 65 || code === 37) { // A or Left
                dx = -1;
                activeKey = code;
                break;
            } else if (code === 68 || code === 39) { // D or Right
                dx = 1;
                activeKey = code;
                break;
            }
        }

        if (activeKey === -1) {
            this.lastActiveKey = -1;
            this.lastMoveStartTime = 0;
            return;
        }

        // Reset repeat cycle if active key changed
        if (activeKey !== this.lastActiveKey) {
            this.lastMoveStartTime = 0;
        }

        // Timings for repeat delay and repeat interval
        const repeatDelay = 220; // ms before continuous movement starts
        const repeatInterval = 150; // ms between continuous steps

        const pressTime = keyPressTimes.get(activeKey) || 0;
        const timeHeld = currentTime - pressTime;

        let shouldMove = false;
        if (this.lastMoveStartTime === 0) {
            shouldMove = true;
        } else {
            const timeSinceLastMove = currentTime - this.lastMoveStartTime;
            if (timeHeld >= repeatDelay && timeSinceLastMove >= repeatInterval) {
                shouldMove = true;
            }
        }

        if (!shouldMove) return;

        const nx = this.x + dx;
        const ny = this.y + dy;

        if (nx < 0 || ny < 0 || nx >= Config.grid.cols || ny >= Config.grid.rows) return;
        if (!grid[nx] || !grid[nx][ny]) return;
        if (!grid[nx][ny].claimed) return;

        this.x = nx;
        this.y = ny;
        this.targetX = nx * Config.grid.tileSize + Config.grid.tileSize / 2;
        this.targetY = ny * Config.grid.tileSize + Config.grid.tileSize / 2;
        this.move = true;
        this.lastActiveKey = activeKey;
        this.lastMoveStartTime = currentTime;
    }
}
