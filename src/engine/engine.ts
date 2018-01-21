import {vec2, glMatrix} from 'gl-matrix';
import * as SAT from 'sat';
import { setTimeout } from 'timers';

/**Sprite.*/
export class Sprite
{
    id:number;
    image:number = -1;
    position:vec2 = vec2.create();
    imgOffset:vec2 = vec2.create();

    constructor(id:number)
    {
        this.id = id;
        this.clear();
    }

    clear()
    {
        this.position.set([0,0]);
        this.imgOffset.set([0,0]);
        this.image = -1;
    }
}

/**Cell of a grid.*/
export class Cell
{
    image:number = -1;
    imgOffsetX:number = 0;
    imgOffsetY:number = 0;
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
            width:32,
            height:18
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

    private animateTime = 0;
    private iterations = 0;
    private state:number = 0;
    private flashing = false;
    private flashTickStep = 0.1;
    private flashTicks = 0;
    private flashBlocks = false;
    private sprites:Sprite[] = [];
    private images:HTMLImageElement[] = [];
    private backgroundColor:string = "#000000";
    private foregroundColor:string = "#FFFFFF";
    private grid:Cell[][];
    private context:CanvasRenderingContext2D;

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


    constructor(c:CanvasRenderingContext2D)
    {
        this.context = c;
        let w = this.config.grid.width;
        let h = this.config.grid.height;
        this.grid = new Array(h);
        for (let y = 0; y < h; y++)
        {
            this.grid[y] = new Array(w);
            for (let x= 0; x < w; x++)
            {
                this.grid[y][x] = new Cell();
            }
        }

        this.sprites = new Array(256);
        for (let i = 0; i < this.sprites.length; i++)
        {
            this.sprites[i] = new Sprite(i);
        }

        c.textAlign = "center";

        document.onmousemove = (ev)=>
        {
            if (this.hasFocus)
            {
                let bounds = this.context.canvas.getBoundingClientRect();
                let c = this.context.canvas;
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
                c.canvas.requestPointerLock();
                this.input.mouse.pos[0] = c.canvas.width / this.config.grid.cellSize / 2;
                this.input.mouse.pos[1] = c.canvas.width / this.config.grid.cellSize / 2;
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
            let bounds = this.context.canvas.getBoundingClientRect();
            let c = this.context.canvas;
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
        let targetAspect = this.config.grid.width / this.config.grid.height;
        let screenWidth = window.innerWidth;
        let screenHeight = window.innerHeight;
        let screenAspect = screenWidth / screenHeight;
        let canvas = this.context.canvas;
        if (screenAspect >= targetAspect)
        {
            canvas.height = screenHeight;
            canvas.width = screenHeight * targetAspect;
        }
        else if (screenAspect < targetAspect)
        {
            canvas.width = screenWidth;
            canvas.height = screenWidth / targetAspect;
        }

        let w =  Math.floor((screenWidth - canvas.width) / 2);
        let h = Math.floor((screenHeight - canvas.height) / 2);
        canvas.style.left = w + "px";
        canvas.style.top = h + "px";

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
            if (i != id && candidate.image >= 0)
            {
                let cellSize = this.config.grid.cellSize;
                box1.pos.x = sprite.position[0];
                box1.pos.y = sprite.position[1];
                box1.w  = this.images[sprite.image].width / cellSize;
                box1.h = this.images[sprite.image].height / cellSize;
               
                box2.pos.x = candidate.position[0];
                box2.pos.y = candidate.position[1];
                box2.w = this.images[candidate.image].width / cellSize;
                box2.h = this.images[candidate.image].height / cellSize;

                let p1 = box1.toPolygon();
                let p2 = box2.toPolygon();

                if (SAT.testPolygonPolygon(p1, p2))
                    return i;
            }
        }

        return -1;
    }
 
    setCell(x:number, y:number, image:number, imgOffsetX = 0, imgOffsetY = 0)
    {
        let img = this.images[image];
        this.grid[y][x].image = image;
        this.grid[y][x].imgOffsetX = imgOffsetX;
        this.grid[y][x].imgOffsetY = imgOffsetY;
    }

    clearSprites()
    {
        this.sprites.forEach(s=>s.clear());
    }

    setSprite(i:number, pos:vec2, image:number = undefined)
    {
        let sprite = this.sprites[i];
        sprite.position.set(pos);
        if (image != undefined) 
            sprite.image = image;
    }

    /**Clears the grid with the specified image as src */
    clearGrid(image:number)
    {
        this.grid.forEach(h=>h.forEach(cell=>cell.image = image));
    }

    clearText()
    {
        this.centerText = "";
        this.centerTopText = "";
    }

    loadImage(src:any):number
    {
        let img = new Image();
        img.src = src;
        this.images.push(img);
        return this.images.length - 1;
    }

    animate(tick:(iterations:number)=>any)
    {
        let start = performance.now();
        let c = this.context;
        let ratioWidth = this.context.canvas.width / (this.config.grid.cellSize * this.config.grid.width);
        let ratioHeight = this.context.canvas.height / (this.config.grid.cellSize * this.config.grid.height);
        let ratio = ratioWidth;
        c.setTransform(ratio, 0, 0, ratio, 0,0);
        c.imageSmoothingEnabled = false;
        c.font = "8px Pixeled";
        c.textAlign = "center";
        if (!this.flashing || !this.flashBlocks)
            tick(this.iterations);

        let w = this.config.grid.cellSize * this.config.grid.width;
        let h = this.config.grid.cellSize * this.config.grid.height;
        c.globalAlpha = 1.0;
        c.fillStyle = this.backgroundColor;
        c.fillRect(0, 0, w, h);
        let cellSize = this.config.grid.cellSize;
        for (let y = 0; y < this.grid.length; y++)
        {
            for (let x = 0; x< this.grid[y].length; x++)
            {
                let cell = this.grid[y][x];
                if (cell.image >= 0 && cell.image < this.images.length)
                {
                    let image = this.images[cell.image];
                    c.drawImage(image, Math.floor(cell.imgOffsetX * cellSize), Math.floor(cell.imgOffsetY * cellSize), cellSize, cellSize, x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }

        for (let sprite of this.sprites)
        {
            if (sprite.image >= 0 && sprite.image < this.images.length)
            {
                let image = this.images[sprite.image];
                let x = Math.floor(sprite.position[0] * cellSize - Math.floor(image.width / 2));
                let y = Math.floor(sprite.position[1] * cellSize - Math.floor(image.height / 2));
                let sw = image.width / cellSize;
                let sh = image.height / cellSize;
                c.drawImage(image, x, y);
                if (this.debug.draw.sprite.bounds)
                {
                    c.strokeStyle = 'green';
                    if (this.getIntersectingSprite(sprite.id) != -1)
                        c.strokeStyle = 'red';
                    c.strokeRect(x + 0.5, y + 0.5, image.width - 1, image.height - 1);
                }
            }
        }

        if (this.debug.draw.grid.bounds)
        {
            for (let y = -1; y < h - 1; y+= cellSize)
            {
                c.beginPath();
                c.moveTo(0.5, y+0.5);
                c.lineTo(w+0.5, y+0.5);
                c.stroke();
            }
            for (let x = -1; x < h - 1; x+= cellSize)
            {
                c.beginPath();
                c.moveTo(x+0.5, 0.5);
                c.lineTo(x+0.5, h);
                c.stroke();
            }
        }

        c.fillStyle = this.foregroundColor;
        c.fillText(this.centerTopText, w/2, this.config.grid.cellSize);
        c.fillText(this.centerText, w/2, h/2);
        

        if (this.flashing)
        {
            let old = this.flashTicks;
            let alpha = 1.0 - Math.abs(this.flashTicks);
            c.fillStyle = "black";
            c.globalAlpha = alpha;
            c.fillRect(0, 0, c.canvas.width, c.canvas.height);
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
        
        this.iterations++;
        let diff = performance.now() - start;
        if (this.iterations % 5 == 0)
            this.animateTime = diff;
        
        if (this.debug.draw.info.time)
        {
            c.textAlign = "left";
            c.fillStyle = "red";
            c.globalAlpha = 1.0;
            c.fillText(this.animateTime.toFixed(3) + "ms", this.config.grid.cellSize, this.config.grid.cellSize);
        }
    }
}