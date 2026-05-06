import { ResourceType } from './types';

export const Config = {
    grid: {
        cols: 20,
        rows: 20,
        tileSize: 40,
    },
    world: {
        tickRate: 3,
        generation: {
            waterThreshold: 0.32,
            mountainThreshold: 0.72,
            noiseScale: 0.08,
            detailScale: 0.18,
            fineScale: 0.35,
        },
    },
    player: {
        speed: 6,
        color: [100, 0, 155] as [number, number, number],
    },
    resources: {
        initial: {
            [ResourceType.Wood]: 7,
            [ResourceType.Water]: 7,
            [ResourceType.Metal]: 7,
        },
    },
    tiles: {
        wildfireChance: 0.000007,
        ruinsChance: 0.000007,
        swampChance: 0.00008,
        stormChance: 0.0001,
        riverbedChance: 0.0002,
        snowChance: 0.00008,
        wildfireSpreadChance: 0.02,
        stormClearChance: 0.004,
        iconThreshold: 0.15,
    },
} as const;

export type IConfig = typeof Config;
