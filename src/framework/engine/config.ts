import { vec2 } from "gl-matrix";

export class Sprite
{
    max = 255;
    anchor = vec2.clone([0.5, 0.5]);
}

export class Grid
{
    cellSize = 16;
    width = 9;
    height = 16;
}

export class Flash
{
    step:0.1;
}

export class Config
{
    sprite = new Sprite();
    grid = new Grid();
    flash = new Flash();
}