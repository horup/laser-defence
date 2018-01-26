import { Measurement } from "../index";

export class State
{
    flashing = false;
    flashBlocks = false;
    flashTickStep = 0.075;
    flashTicks = -1.0;
    centerText = "";
    centerTopText = "";
    animateStart = 0;
    animateCount = 0;

    animate = new Measurement();
    fps = new Measurement();
    debug = false;
    
    background = "#000000";
}