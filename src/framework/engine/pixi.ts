import * as PIXI from 'pixi.js';
import { Config } from './config';
import { Cell } from './cell';
import { Sprite } from './sprite';

class Texts
{
    middle = new PIXI.Text();
    top = new PIXI.Text();
    debug = new PIXI.Text();
}

class Stages
{
    grid = new PIXI.Container();
    text = new PIXI.Container();
}

export class Pixi
{
    private config:Config;
    app:PIXI.Application = null;
    textures = new Array() as PIXI.Texture[];
    texts = new Texts();
    stages = new Stages();
    grid:Cell[][] = new Array();
    sprites:Sprite[];
    constructor(config:Config)
    {
        this.config = config;
        this.app = new PIXI.Application();
        this.app.stage.addChild(this.stages.grid);
        this.app.stage.addChild(this.stages.text);
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        document.body.appendChild(this.app.view);
        let canvas = this.app.view;

        let w = config.grid.width;
        let h = config.grid.height;
        this.grid = new Array(h);
        let cellSize = config.grid.cellSize;
        for (let y = 0; y < h; y++)
        {
            this.grid[y] = new Array(w);
            for (let x= 0; x < w; x++)
            {
                let sprite = new PIXI.Sprite();
                sprite.visible = false;
                sprite.x = x * cellSize;
                sprite.y = y * cellSize;
                this.grid[y][x] = new Cell(sprite);
                this.stages.grid.addChild(sprite);
            }
        }

        this.sprites = new Array(config.sprite.max); 
        for (let i = 0; i < this.sprites.length; i++)
        {
            let sprite = new PIXI.Sprite();
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            this.sprites[i] = new Sprite(i, sprite);
            this.stages.grid.addChild(sprite);
        }

        let style = {fontFamily : 'Pixeled', fontSize: 8, fill : 0xFFFFFF};
        this.texts.middle = new PIXI.Text("", style);
        this.texts.debug = new PIXI.Text("", style);
        this.texts.top = new PIXI.Text("", style);
        
        this.stages.text.addChild(this.texts.middle);
        this.stages.text.addChild(this.texts.top);
        this.stages.text.addChild(this.texts.debug);

        window.onresize = ()=>this.resize();
        this.resize();
    }

    private resize()
    {
        let pixelRatio = window.devicePixelRatio;
        let cellSize = this.config.grid.cellSize;
        let gridHeight = this.config.grid.height * cellSize;
        let gridWidth = this.config.grid.width * cellSize;
        let targetAspect = this.config.grid.width / this.config.grid.height;
        let screenWidth = window.innerWidth;
        let screenHeight = window.innerHeight;
        let screenAspect = screenWidth / screenHeight;
        let canvas = this.app.view;
        let width = 0;
        let height = 0;
        //let multiplum = gridHeight;
        let multiplum = 128 / pixelRatio;
        
        if (screenAspect >= targetAspect)
        {
            height = Math.floor(screenHeight / multiplum) * multiplum;
            if (height == 0)
                height = screenHeight;

            let factor = height / gridHeight;
            width = gridWidth * factor;
        }
        else if (screenAspect < targetAspect)
        {
            width = Math.floor(screenWidth / multiplum) * multiplum;
            if (width == 0)
                width = screenWidth;
            let factor = width / gridWidth;
            height = gridHeight * factor;
        }

        width = Math.floor(width);
        height = Math.floor(height);
       
        this.app.renderer.resize(Math.floor(width * pixelRatio), Math.floor(height * pixelRatio));

        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        let marginW =  Math.floor((screenWidth - width) / 2);
        let marginH = Math.floor((screenHeight - height) / 2);

        canvas.style.left = marginW + "px";
        canvas.style.top = marginH + "px";
     
        let ratio = height / gridHeight;

        let setStyle = (text:PIXI.Text) =>
        {
            text.anchor.x = 0.5;
            text.anchor.y = 0;
            text.x = width / 2  * pixelRatio;
            let size = Math.floor(cellSize * ratio / 2  * pixelRatio);
            size = size > 0 ? size : 1;
            text.style.fontSize = size;
        }

        setStyle(this.texts.top);
        setStyle(this.texts.debug);
        setStyle(this.texts.middle);
        this.texts.debug.style.fill = 0xFF0000;
        this.texts.debug.style.fontSize = this.texts.debug.style.fontSize as number / 2;
      //  console.log(this.texts.debug.style.fontSize);
        this.texts.middle.y = height / 2  * pixelRatio;
        this.texts.middle.anchor.y = 0.5;
        this.texts.debug.x = cellSize * ratio / 2 * pixelRatio;
        this.texts.debug.anchor.x = 0;
    }
}
