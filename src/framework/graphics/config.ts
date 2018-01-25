

export interface EngineConfig
{
    readonly sprites:
    {
        readonly max:number;
    }
    readonly grid:
    {
        readonly cellSize:number;
        readonly width:number;
        readonly height:number;
    }
}