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

    handleMovement(keys: Set<number>, grid: Tile[][]) {
        if (this.move) return;

        let dx = 0;
        let dy = 0;

        // Use key codes: W=87, A=65, S=83, D=68
        // Added arrow keys: Up=38, Down=40, Left=37, Right=39
        if (keys.has(87) || keys.has(38)) {
            dy = -1; // W or Up
        } else if (keys.has(83) || keys.has(40)) {
            dy = 1;  // S or Down
        } else if (keys.has(65) || keys.has(37)) {
            dx = -1; // A or Left
        } else if (keys.has(68) || keys.has(39)) {
            dx = 1;  // D or Right
        }

        if (dx === 0 && dy === 0) return;

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
    }
}
