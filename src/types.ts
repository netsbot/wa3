import p5 from 'p5';

export const TileType = {
    Forest: 'forest',
    River: 'river',
    Mountain: 'mountain',
    Snow: 'snow',
    Riverbed: 'riverbed',
    Swamp: 'swamp',
    Ruins: 'ruins',
    Storm: 'storm',
    Wildfire: 'wildfire',
    Brimstone: 'brimstone'
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

export const ResourceType = {
    Wood: 'wood',
    Water: 'water',
    Metal: 'metal'
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

export interface Resources {
    [ResourceType.Wood]: number;
    [ResourceType.Water]: number;
    [ResourceType.Metal]: number;
}

export interface Tile {
    type: TileType;
    baseType: TileType;
    elevation: number;
    claimed: boolean;
    iconSeed: number;
    iconVariant: number;
    prevType: TileType;
    animProgress: number;
    snow?: number;
}

export interface TileTypeDefinition {
    color: (p: p5) => p5.Color;
    drawIcon?: (p: p5, x: number, y: number, size: number) => void;
    update: (p: p5, tile: Tile, x: number, y: number, grid: Tile[][], resources: Resources) => TileType | null;
    onClick: (p: p5, tile: Tile, resources: Resources, addResource: (type: ResourceType, amount: number) => void, spendResource: (type: ResourceType, amount: number) => boolean) => TileType | null;
}
