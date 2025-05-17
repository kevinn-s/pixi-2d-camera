
export interface LerpZoom {
    time: number;
}

export interface Clamp {
    min: number;
    max: number;
}

export interface Decelerate {
    friction : number;
}

interface EffectOptionsMap {
    lerpZoom: LerpZoom;
    clamp: Clamp;
    decelerate : Decelerate
}

export interface Effect<T extends keyof EffectOptionsMap = keyof EffectOptionsMap> {
    type: T;
    options: EffectOptionsMap[T];
}