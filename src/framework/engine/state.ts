import { Measurement } from "../index";

export class State
{
    flashing = false;
    flashBlocks = false;
    flashTickStep = 5;
    flashTicks = -1.0;
    centerText = "";
    centerTopText = "";
    animateStart = 0;
    animateCount = 0;

    animate = new Measurement();
    fps = new Measurement();
    debug = true;
    
    background = "#000000";

    time = 0;
    start = performance.now();
}