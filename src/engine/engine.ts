import {vec2, glMatrix} from 'gl-matrix';
import * as SAT from 'sat';
import { setTimeout } from 'timers';
import * as PIXI from 'pixi.js';

/**Sprite.*/
export class Sprite
{
    id:number;
    sprite:PIXI.Sprite;
    position:vec2 = vec2.create();

    constructor(id:number, sprite:PIXI.Sprite)
    {
        this.id = id;
        this.sprite = sprite;
        this.clear();
    }

    clear()
    {
        this.sprite.visible = false;
        this.position.set([0,0]);
    }
}

/**Cell of a grid.*/
export class Cell
{
    imgOffsetX:number = 0;
    imgOffsetY:number = 0;
    sprite:PIXI.Sprite = null;
    constructor(sprite:PIXI.Sprite)
    {
        this.sprite = sprite;
    }
}

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

/**Engine takes care of rendering assets provided by a prototype. */
export class Engine
{
    public readonly config:EngineConfig = 
    {
        sprites:
        {
            max:255
        },
        grid:
        {
            cellSize:16,
            width:16,
            height:9
        }
    }

    private debug =
    {
        draw:
        {
            grid:
            {
                bounds:false
            },
            sprite:
            {
                bounds:false
            },
            info:
            {
                time:true
            }
        }
    }

    private app: PIXI.Application;
    private animateTime = 0;
    private iterations = 0;
    private state:number = 0;
    private flashing = false;
    private flashTickStep = 0.1;
    private flashTicks = 0;
    private flashBlocks = false;
    private sprites:Sprite[] = [];
    private backgroundColor:string = "#000000";
    private foregroundColor:string = "#FFFFFF";
    private grid:Cell[][];

    public centerText:string = "";
    public centerTopText:string = "";
    public input = 
    {
        mouse:
        {
            pos:vec2.create(),
            button:[false, false, false]
        }
    }

    private readonly pixi =
    {
        textures:[] as PIXI.Texture[],
        texts:
        {
            middle:new PIXI.Text(),
            top:new PIXI.Text(),
            debug:new PIXI.Text()
        },
        stages:
        {
            grid:new PIXI.Container(),
            text:new PIXI.Container()
        }
    }


    constructor()
    {
        this.app = new PIXI.Application();
        this.app.stage.addChild(this.pixi.stages.grid);
        this.app.stage.addChild(this.pixi.stages.text);
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        document.body.appendChild(this.app.view);
        let canvas = this.app.view;
        let w = this.config.grid.width;
        let h = this.config.grid.height;
        this.grid = new Array(h);
        let cellSize = this.config.grid.cellSize;
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
                this.pixi.stages.grid.addChild(sprite);
            }
        }

        this.sprites = new Array(256);
        for (let i = 0; i < this.sprites.length; i++)
        {
            let sprite = new PIXI.Sprite();
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            this.sprites[i] = new Sprite(i, sprite);
            this.pixi.stages.grid.addChild(sprite);
        }

        let style = {fontFamily : 'Pixeled', fontSize: 8, fill : 0xFFFFFF};
        this.pixi.texts.middle = new PIXI.Text("hello world", style);
        this.pixi.texts.middle.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this.pixi.texts.top = new PIXI.Text("top dollar", style);
        this.pixi.texts.debug = new PIXI.Text("", style);
        
        this.pixi.stages.text.addChild(this.pixi.texts.middle);
        this.pixi.stages.text.addChild(this.pixi.texts.top);
        this.pixi.stages.text.addChild(this.pixi.texts.debug);

        document.onmousemove = (ev)=>
        {
            if (this.hasFocus)
            {
                let bounds = canvas.getBoundingClientRect();
                let c = canvas;
                let clamp = (v, min, max) => v < min ? min : (v > max) ? max : v;
                
                let x = ev.x - c.offsetLeft;
                let y = ev.y - c.offsetTop;
                y = y / bounds.height * this.config.grid.height;
                x = x / bounds.width * this.config.grid.height;
                x = clamp(x, 0, this.config.grid.width);
                y = clamp(y, 0, this.config.grid.height);

                this.input.mouse.pos.set([x,y]);
            }
        }

        document.onmousedown = (ev)=>
        {
            if (!this.hasFocus)
            {
                canvas.requestPointerLock();
                this.input.mouse.pos[0] = canvas.width / this.config.grid.cellSize / 2;
                this.input.mouse.pos[1] = canvas.width / this.config.grid.cellSize / 2;
            }
            if (this.hasFocus)
            {
                if (ev.button < this.input.mouse.button.length)
                    this.input.mouse.button[ev.button] = true;
            }
        }

        document.onmouseup = (ev)=>
        {
            if (this.hasFocus)
            {
                if (ev.button < this.input.mouse.button.length)
                    this.input.mouse.button[ev.button] = false;
            }
        }

        document.ontouchstart = (ev)=>
        {
            if (this.hasFocus)
            {
                this.input.mouse.button[0] = true;
            }
        }

        document.ontouchend = (ev)=>
        {
            if (this.hasFocus)
            {
                this.input.mouse.button[0] = false;
            }
        }

        document.ontouchmove = (ev)=>
        {
            let bounds = canvas.getBoundingClientRect();
            let c = canvas;
            let clamp = (v, min, max) => v < min ? min : (v > max) ? max : v;
            
            let x = ev.touches[0].clientX - c.offsetLeft;
            let y = ev.touches[0].clientY - c.offsetTop;
            y = y / bounds.height * this.config.grid.height;
            x = x / bounds.width * this.config.grid.height;
            x = clamp(x, 0, this.config.grid.width);
            y = clamp(y, 0, this.config.grid.height);

            this.input.mouse.pos.set([x,y]);
        }

        document.ontouchcancel = (ev)=>
        {

        }

        window.onresize = ()=>this.resize();
        this.resize();
    }
    
    private resize()
    {
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
        let multiplum = gridHeight;
        
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

       
        this.app.renderer.resize(width, height);
        let marginW =  Math.floor((screenWidth - canvas.width) / 2);
        let marginH = Math.floor((screenHeight - canvas.height) / 2);
        canvas.style.left = marginW + "px";
        canvas.style.top = marginH + "px";
     
        let ratio = height / gridHeight;

        let setStyle = (text:PIXI.Text) =>
        {
            text.anchor.x = 0.5;
            text.anchor.y = 0;
            text.x = width /2;
            let size = Math.floor(cellSize * ratio / 2);
            size = size > 0 ? size : 1;
            text.style.fontSize = size;
        }

        setStyle(this.pixi.texts.top);
        setStyle(this.pixi.texts.debug);
        setStyle(this.pixi.texts.middle);

        this.pixi.texts.middle.y = height / 2;
        this.pixi.texts.middle.anchor.y = 0.5;
        this.pixi.texts.debug.x = cellSize * ratio / 2;
        this.pixi.texts.debug.anchor.x = 0;
    }


    get hasFocus()
    {
        return true;
       // return document.pointerLockElement == this.context.canvas;
    }

    flash(blocking?:boolean)
    {
        this.flashing = true;
        this.flashBlocks = blocking == true ? true : false;
        this.flashTickStep = 0.075;
        this.flashTicks = -1.0;
    }

    setBackground(color:string)
    {
        this.backgroundColor = color;
    }

    /** Returns the ID of the sprite in which the sprite with the given ID intersects.
     * -1 if no intersection.
      */
    getIntersectingSprite(id:number):number
    {
        let box1 = new SAT.Box();
        let box2 = new SAT.Box();
        let sprite = this.sprites[id];
        for (let i = 0; i < this.sprites.length; i++)
        {
            let candidate = this.sprites[i];
            if (i != id && candidate.sprite.visible)
            {
                let cellSize = this.config.grid.cellSize;
                box1.pos.x = sprite.position[0];
                box1.pos.y = sprite.position[1];
                box1.w  = sprite.sprite.width / cellSize;
                box1.h = sprite.sprite.height / cellSize;
               
                box2.pos.x = candidate.position[0];
                box2.pos.y = candidate.position[1];
                box2.w = candidate.sprite.width / cellSize;
                box2.h = candidate.sprite.height / cellSize;

                let p1 = box1.toPolygon();
                let p2 = box2.toPolygon();

                if (SAT.testPolygonPolygon(p1, p2))
                    return i;
            }
        }

        return -1;
    }
 
    setCell(x:number, y:number, image:number, offsetX = 0, offsetY = 0)
    {
        let cell = this.grid[y][x];
        if (image >= 0)
        {
            let cellSize = this.config.grid.cellSize;
            this.grid[y][x].sprite.visible = true;
            let tex = this.pixi.textures[image];
            let sprite = cell.sprite;
            sprite.texture = new PIXI.Texture(tex.baseTexture, new PIXI.Rectangle(offsetX * cellSize, offsetY * cellSize, cellSize, cellSize));

        }
        else
        {
            cell.sprite.visible = false;
        }
    }

    clearSprites()
    {
        this.sprites.forEach(s=>s.clear());
    }

    setSprite(i:number, pos:vec2, image:number = undefined, alpha:number = undefined)
    {
        let sprite = this.sprites[i];
        sprite.position.set(pos);
        if (image != undefined)
        {
            if (image >= 0)
            {
                let tex = this.pixi.textures[image];
                sprite.sprite.texture = tex;
                sprite.sprite.visible = true;
                let a = alpha != undefined ? alpha : 1.0;
                sprite.sprite.alpha = a;
            }
            else
            {
                sprite.clear();
            }
        }
    }

    /**Clears the grid with the specified image as src */
    clearGrid(image:number)
    {
        for (let y = 0; y < this.grid.length; y++)
        {
            for (let x = 0; x < this.grid[y].length; x++)
            {
                this.setCell(x, y, image);
            }
        }
    }

    clearText()
    {
        this.centerText = "";
        this.centerTopText = "";
    }

    loadImage(src:any):number
    {
        let texture = PIXI.Texture.fromImage(src);
        this.pixi.textures.push(texture);
        return this.pixi.textures.length - 1;
    }

    animate(tick:(iterations:number)=>any)
    {
        let start = performance.now();
        let canvasWidth = this.app.view.width;
        let canvasHeight = this.app.view.height;
        let gridWidth = this.config.grid.width;
        let gridHeight = this.config.grid.height;
        let cellSize = this.config.grid.cellSize;
        let w = gridWidth * cellSize;
        let h = gridHeight * cellSize;
        let ratioWidth = canvasWidth / w;
        let ratioHeight = canvasHeight / h;
        let ratio = ratioWidth;
        this.pixi.stages.grid.setTransform(0,0, ratio, ratio);

        this.app.stage.alpha = 1.0;
        if (!this.flashing || !this.flashBlocks)
            tick(this.iterations);

        this.pixi.texts.top.text = this.centerTopText;
        this.pixi.texts.middle.text = this.centerText;

        this.iterations++;

        this.sprites.forEach(s=>
        {
            if (s.sprite.visible)
            {
                s.sprite.x = s.position[0] * cellSize;
                s.sprite.y = s.position[1] * cellSize;
            }
        });

        if (this.flashing)
        {
            let old = this.flashTicks;
            let alpha =  Math.abs(this.flashTicks);
            this.app.stage.alpha = alpha;
            this.flashTicks += this.flashTickStep;
            if (Math.sign(old) != Math.sign(this.flashTicks))
            {
                tick(this.iterations);
            }
            if (this.flashTicks > 1.0)
            {
                this.flashing = false;
            }
        }

        let diff = performance.now() - start;
        if (this.iterations % 10 == 0)
        {
            this.animateTime = diff;
            this.pixi.texts.debug.text = this.animateTime.toFixed(3) + "ms";
        }
    }
}