import { Prototype } from "../engine/index";
import { vec2 } from 'gl-matrix';


class Missile
{
    inUse = false;
    pos:vec2 = vec2.create();

    reset()
    {
        this.inUse = false;
    }
}

class Explosion
{
    inUse = false;
    pos:vec2 = vec2.create();
    alpha:number = 1.0;
    reset()
    {
        this.alpha = 1.0;
        this.inUse = false;
    }
}

export default class G0 extends Prototype
{
    spawnTime = 60;
    timer:number = 0;
    state:number = 0;
    missiles:Missile[] = [];
    explosions:Explosion[] = [];
    playerPos:vec2 = vec2.create();
    
    explosionImg:number;
    constructor()
    {
        super();
        let e = this.engine;
        
        e.loadImage(require("./imgs/space.png"));
        e.loadImage(require("./imgs/cloud.png"));
        e.loadImage(require("./imgs/missile.png"));
        e.loadImage(require("./imgs/block.png"));
        this.explosionImg = e.loadImage(require("./imgs/explosion.png"));

        e.clearGrid(-1);
        let max = 100;
        this.missiles = new Array(max);
        this.explosions = new Array(max);
        for (let i = 0; i < max; i++)
        {
            this.missiles[i] = new Missile();
            this.explosions[i] = new Explosion();
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
        this.spawnTime = 60;
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
                else if (y > 8) 
                    y = 8;

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
                            for (let explosion of this.explosions)
                            {
                                if (!explosion.inUse)
                                {
                                    explosion.inUse = true;
                                    explosion.pos.set(m.pos);
                                    explosion.alpha = 1.0;
                                    break;
                                }
                            }
                        }

                        if (m.pos[0]  < 0)
                        {
                            m.reset();
                            e.flash(true);
                            this.state = 3;
                        }
                    }
                });

                this.explosions.forEach(m =>
                {
                    if (m.inUse)
                    {
                        this.engine.setSprite(spriteIndex++, m.pos, this.explosionImg, m.alpha);
                        m.alpha -= 0.1;
                        if (m.alpha < 0)
                        {
                            m.reset();
                        }
                    }
                });

                if (iterations % this.spawnTime == 0)
                {
                    let freeMissiles = this.missiles.filter(m=>!m.inUse);
                    if (freeMissiles.length > 0)
                    {
                        let missile = freeMissiles[0];
                        missile.pos.set([16, 1 + Math.random() * 6]);
                        missile.inUse = true;
                    }
                }
                
                if (iterations % 60 == 0)
                {
                    this.spawnTime--;
                    if (this.spawnTime < 0)
                    {
                        this.spawnTime = 0;
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