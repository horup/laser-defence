require("./style.css");

/*
import * as React from 'react';
import * as Dom from 'react-dom';
import * as PIXI from 'pixi.js';
import {vec2} from 'gl-matrix';
import * as Data from './data';
import {getStage} from './renderer'; 
import { Keydown, Keyup } from './data/commands';
import { Tick } from './data/commands';

class App extends React.Component<any, any>
{
    store = new Data.Store();
    graphics:PIXI.Graphics;
    stage:PIXI.Container;
    canvas:HTMLCanvasElement;
    app:PIXI.Application;
    constructor(props:any)
    {
        super();
        document.addEventListener('contextmenu', e=> event.preventDefault());
        document.body.style.cursor = "crosshair";
    }

    componentDidMount()
    {
        let store = this.store;
        this.stage = new PIXI.Container();
        let renderer = PIXI.autoDetectRenderer(640, 480, {view: this.canvas, antialias:false}); 
        let interaction = new PIXI.interaction.InteractionManager(renderer);
        this.graphics = new PIXI.Graphics();
        
        this.stage.addChild(this.graphics);

        this.canvas.addEventListener('mousedown', (e)=>
        {
        });

        document.addEventListener('mousemove', ()=>
        {
        });

        document.addEventListener('keydown', (e)=>
        {
            this.store.dispatch(new Keydown(e.keyCode));
        });

        document.addEventListener('keyup', (e)=>
        {
            this.store.dispatch(new Keyup(e.keyCode));
        });

        document.addEventListener('mouseup', (e) =>
        {
        });

        let conquer = () =>
        {
            for (let u of this.state.units)
            {
                u.update(this.state);
            }
        }

        let f = () =>
        {
            this.store.dispatch(new Tick());
            this.graphics.beginFill(0xFF3300);
            this.graphics.lineStyle(4, 0xffd900, 1);
            this.graphics.moveTo(50,50);
            this.graphics.lineTo(250, 50);
            this.graphics.lineTo(100, 100);
            this.graphics.lineTo(50, 50);
            this.graphics.endFill();
            renderer.render(getStage(this.store, renderer));
            requestAnimationFrame(f);
        };

        f();
    }

    render() {
        return (
            <div style={{width:'100%'}}>
                <div style={{width:'640px', margin:'0 auto'}}>
                    <canvas width={640} height={480} ref={(ref)=>this.canvas = ref} />
                </div>
            </div>
        )
    }
}

var div = document.createElement("div");
document.body.appendChild(div);
Dom.render(<App />, div);*/