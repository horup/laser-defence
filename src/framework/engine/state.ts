import { Measurement } from "../index";

export class State
{
    flashing = false;
    flashBlocks = false;
    flashTickStep = 5;
    flashTicks = -1.0;
    centerText = "";
    centerTopText = "";
    frames = 0;
    animate = new Measurement();
    fps = new Measurement();
    debug = true;
    
    background = "#000000";
}