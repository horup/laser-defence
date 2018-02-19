import { Config } from "./config";
import { vec2 } from "gl-matrix";
import { Engine } from "./index";

export class Input
{
    engine:Engine;
    hasFocus:boolean = true;
    mouse = 
    {
        pos:vec2.create(),
        button:[false, false, false]
    }
    mouseOld = 
    {
        pos:vec2.create(),
        button:[false, false, false]
    }

    constructor(config:Config, engine:Engine)
    {
        this.engine = engine;
        let canvas = this.engine.pixi.app.view;
        document.onmousemove = (ev)=>
        {
            if (this.hasFocus)
            {
                let bounds = canvas.getBoundingClientRect();
                let c = canvas;
                let clamp = (v, min, max) => v < min ? min : (v > max) ? max : v;
                
                let x = ev.x - c.offsetLeft;
                let y = ev.y - c.offsetTop;
                y = y / bounds.height * config.grid.height;
                x = x / bounds.width * config.grid.width;
                x = clamp(x, 0, config.grid.width);
                y = clamp(y, 0, config.grid.height);

                this.mouse.pos.set([x,y]);
            }
        }

        document.onmousedown = (ev)=>
        {
            if (this.hasFocus)
            {
                if (ev.button < this.mouse.button.length)
                    this.mouse.button[ev.button] = true;
            }
        }

        document.onmouseup = (ev)=>
        {
            if (this.hasFocus)
            {
                if (ev.button < this.mouse.button.length)
                    this.mouse.button[ev.button] = false;
            }
        }

        document.ontouchstart = (ev)=>
        {
            if (this.hasFocus)
            {
                
                let bounds = canvas.getBoundingClientRect();
                let c = canvas;
                let clamp = (v, min, max) => v < min ? min : (v > max) ? max : v;
                let x = ev.touches[0].clientX - c.offsetLeft;
                let y = ev.touches[0].clientY - c.offsetTop;
                y = y / bounds.height * config.grid.height;
                x = x / bounds.width * config.grid.width;
                x = clamp(x, 0, config.grid.width);
                y = clamp(y, 0, config.grid.height);

                this.mouse.pos.set([x,y]);
                this.mouse.button[0] = true;
            }
        }

        document.onkeydown = (ev)=>
        {
            if (this.hasFocus)
            {
                if (ev.code == 'KeyP')
                {
                    if (this.engine.paused)
                        this.engine.resume();
                    else
                        this.engine.pause();
                }
            }
        }

        document.ontouchend = (ev)=>
        {
            if (this.hasFocus)
            {
                this.engine.requestFullscreen();
                this.mouse.button[0] = false;
            }
        }

        document.ontouchmove = (ev)=>
        {
            let bounds = canvas.getBoundingClientRect();
            let c = canvas;
            let clamp = (v, min, max) => v < min ? min : (v > max) ? max : v;
            
            let x = ev.touches[0].clientX - c.offsetLeft;
            let y = ev.touches[0].clientY - c.offsetTop;
            y = y / bounds.height * config.grid.height;
            x = x / bounds.width * config.grid.width;
            x = clamp(x, 0, config.grid.width);
            y = clamp(y, 0, config.grid.height);

            this.mouse.pos.set([x,y]);
        }

        document.ontouchcancel = (ev)=>
        {

        }
    }
}