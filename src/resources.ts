import type { Resources } from './types';
import { ResourceType } from './types';
import { Config } from './config';

export class ResourceManager {
    resources: Resources = { ...Config.resources.initial };

    add(type: ResourceType, amount: number) {
        this.resources[type] = Math.max(0, this.resources[type] + amount);
    }

    spend(type: ResourceType, amount: number): boolean {
        if (this.resources[type] < amount) return false;
        this.resources[type] -= amount;
        return true;
    }
}
