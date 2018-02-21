import { Prototype } from "../framework";
import { Insights } from "../framework";
import { vec2 } from 'gl-matrix';
import { Shufflebag } from "../framework";
import { Game, ThingType, ThingVariant } from "./game";

export default class G1 extends Prototype
{
    game:Game;
    images:number[] = [];
    constructor()
    {
        super();
        let e = this.engine;
        this.game = new Game();

        this.images[ThingVariant.PLAYER] = e.loadImage(require("./imgs/ship.png"));
        this.images[ThingVariant.PLAYERBEAM] = e.loadImage(require("./imgs/beam.png"));
        this.images[ThingVariant.SMALLUFO] = e.loadImage(require("./imgs/smallufo.png"));

        this.newGame();
    }

    newGame()
    {
        this.game.things.reset();
        let t = this.game.things.spawn();
        t.type = ThingType.PLAYER;
        t.variant = ThingVariant.PLAYER;
        t.p.set([4.5, 14]);

        for (let i = 1.5; i < 9; i+=2)
        {
            let t = this.game.things.spawn();
            t.type = ThingType.ENEMY;
            t.variant = ThingVariant.SMALLUFO;
            t.p.set([i, 2]);
        }
    }

    tick(time:number, delta:number)
    {
        let e = this.engine;
        let temp = vec2.create();
        for (let thing of this.game.things.array)
        {
            if (thing.valid)
            {
                if (thing.type == ThingType.PLAYER)
                {
                    let speed = 7;
                    if (e.input.keys["KeyA"])
                        thing.v[0] = - speed;
                    else if (e.input.keys["KeyD"])
                        thing.v[0] = speed;
                    else
                        thing.v[0] = 0;

                    if (e.input.keys["Space"])
                    {
                        if (thing.cooldown == 0)
                        {
                            let beam = this.game.things.spawn();
                            beam.type = ThingType.BEAM;
                            beam.variant = ThingVariant.PLAYERBEAM;
                            beam.p.set(thing.p);
                            beam.v[1] = -15; 
                         //  beam.owner = thing.id;
                            thing.cooldown = 1/3;
                        }
                    }

                }
                else if (thing.type == ThingType.BEAM)
                {
                    if (thing.p[1] < 0 || thing.p[1] > e.config.grid.height)
                        thing.reset();
                }

                vec2.set(temp, thing.v[0] * delta, thing.v[1] * delta);
                vec2.add(thing.p, thing.p, temp);
                thing.cooldown -= delta;
                if (thing.cooldown < 0)
                    thing.cooldown = 0;
            }
        }

        e.clearSprites();
        let spriteIndex = 0;
        for (let thing of this.game.things.array)
        {
            if (thing.valid)
            {
                e.setSprite(spriteIndex++, thing.p, this.images[thing.variant]);
            }
        }
    }
}