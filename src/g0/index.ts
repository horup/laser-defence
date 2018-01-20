import { Prototype } from "../engine/index";
import { vec2 } from 'gl-matrix';

let spawnTime = 60;

class Missile
{
    inUse = false;
    pos:vec2 = vec2.create();

    reset()
    {
        this.inUse = false;
    }
}

export default class G0 extends Prototype
{
    timer:number = 0;
    state:number = 0;
    missiles:Missile[] = [];
    playerPos:vec2 = vec2.create();
    
    constructor()
    {
        super();
        let e = this.engine;
        
        e.loadImage(require("./imgs/space.png"));
        e.loadImage(require("./imgs/cloud.png"));
        e.loadImage(require("./imgs/missile.png"));
        e.loadImage(require("./imgs/block.png"));
        e.clearGrid(-1);

        this.missiles = new Array(10);
        for (let i = 0; i < this.missiles.length; i++)
        {
            this.missiles[i] = new Missile();
        }
    }

    initRound()
    {
        let e = this.engine;
        e.centerText = "";
        e.clearGrid(0);
        this.timer = 0;

        let placeCloud = (sx:number, sy:number)=>
        {
            for (let y = 0; y < 2; y++)
                for (let x = 0; x < 2; x++)
                    e.setCell(x+sx, y+sy, 1, x, y);
        }

        placeCloud(3,3);
        placeCloud(8,4);
        placeCloud(13,2);

        this.playerPos.set([2, 16/2]);
        this.engine.setSprite(0, this.playerPos, 3);
        this.missiles.forEach(m=>m.reset());
    }

    tick(iterations:number)
    {
        let e = this.engine;

        switch(this.state)
        {
            case 0:
            {
                if (iterations % 40 < 20)
                    e.centerText = "Touch when ready!!";
                else
                    e.centerText = "";
                if (e.input.mouse.button[0])
                {
                    this.state = 1;
                    e.flash(true);
                }  
                break;  
            }
            case 1:
            {
                this.initRound();
                this.state = 2;
            }
            case 2:
            {
                this.engine.clearSprites();
                let spriteIndex = 0;
                let y = this.engine.input.mouse.pos[1];
                if (y < 1) 
                    y = 1; 
                else if (y > 17) 
                    y = 17;

                let playerSprite = spriteIndex++;
                this.playerPos.set([ 2, y]);
                this.engine.setSprite(playerSprite, this.playerPos, 3);

                this.missiles.forEach(m=>
                {
                    if (m.inUse)
                    {
                        let missileSprite = spriteIndex++;
                        let speed = 0.1;
                        this.engine.setSprite(missileSprite, m.pos, 2);
                        m.pos[0] -= 0.15;

                        if (this.engine.getIntersectingSprite(missileSprite) == playerSprite)
                        {
                            m.reset();
                        }

                        if (m.pos[0]  < 0)
                        {
                            m.reset();
                            e.flash(true);
                            this.state = 3;
                        }
                    }
                });

                if (iterations % spawnTime == 0)
                {
                    let freeMissiles = this.missiles.filter(m=>!m.inUse);
                    if (freeMissiles.length > 0)
                    {
                        let missile = freeMissiles[0];
                        missile.pos.set([32, 1 + Math.random() * 16]);
                        missile.inUse = true;
                    }
                }

                this.timer++;
                let frames = Math.floor(this.timer % 60);
                let seconds = Math.floor(this.timer / 60);
                
                e.centerTopText = seconds + ":" + (frames < 10 ? "0" + frames : frames);
                break;
            }
            case 3:
            {
                e.clearGrid(-1);
                e.clearSprites();
                e.centerText = "BOOM! Try again?";
                if (e.input.mouse.button[0])
                {
                    this.state = 1;
                    e.flash(true);
                }  
                break;
            }
        }
    }
}