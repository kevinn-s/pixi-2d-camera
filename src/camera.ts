
import { Container, FederatedMouseEvent, FederatedWheelEvent, Point, Ticker, TickerCallback } from 'pixi.js';
import { Scene } from './scene';
import { Decelerate, Effect } from './types';


class Camera extends Container {

    _stage: Container;
    _zoom: number = 1;
    _scene : Container;
    _previousPosition : Point | null = new Point(0, 0);
    _currentMouseEventId : number = 0;

    cameraEffects : Effect[] = [];
    ticker : Ticker;

    _mousePositions : Point[] = [];
    _mouseTimeStamp : number[] = [];

    velocity = { x: 0, y: 0 };
    timeSinceRelease = 0;
    decelerating = false;
    friction = 0.8;
    TP = 16;

    idleState : number = 0;
    public _wheelSpeed : number = 1;
    
    constructor(stage: Container, scene : Scene) {
        super()
        this._stage = stage;
        this._scene = scene;
        this.interactive = true;
    
        this.ticker = Ticker.shared;
        this._stage.addChild(this._scene);

    }

    decelerateCallback: TickerCallback<void> | null = null;

    lerp(a : Point, b : Point, t : number){
            return new Point(
                a.x + (b.x - a.x) * t,
                a.y + (b.y - a.y) * t,

            )
        }

        setZoom(z: number, p: Point = new Point(0, 0)) { 
            if (z === 0) return;
        
            console.log(this.cameraEffects)
            const isLerp = this.cameraEffects.find((eff) => eff.type === "lerpZoom")
            if (isLerp) {
                const startZ = this._scene.scale.x;
                const endZ = this._scene.scale.x + z * this._scene.scale.x;
                const tx = (p.x - this._scene.x) / startZ;
                const ty = (p.y - this._scene.y) / startZ;
                let elapsed = 0;
                const duration = (isLerp.options as unknown as {time : number}).time;
        
                const startPos = new Point(this._scene.position.x, this._scene.position.y);
                const endPos = new Point(-tx * endZ + p.x, -ty * endZ + p.y);
        
                const animate: TickerCallback<void> = (tick) => {
                    elapsed += tick.deltaMS / 1000;
                    const t = Math.min(elapsed / duration, 1);
                    const lp = this.lerp(startPos, endPos, t);
        
                    this._scene.updateTransform({
                        x: lp.x,
                        y: lp.y,
                        scaleX: startZ + (endZ - startZ) * t,
                        scaleY: startZ + (endZ - startZ) * t,
                    });
        
                    if (t >= 1) {
                        this.ticker.remove(animate);
        
                        this._scene.updateTransform({
                            x: endPos.x,
                            y: endPos.y,
                            scaleX: endZ,
                            scaleY: endZ
                        });
                    }
                };
        
                this.ticker.add(animate);
            } else {
                let s = this._scene.scale.x;
                const tx = (p.x - this._scene.position.x) / s;
                const ty = (p.y - this._scene.position.y) / s;
                s += s * z;
        
                this._scene.updateTransform({
                    x: -tx * s + p.x,
                    y: -ty * s + p.y,
                    scaleX: s,
                    scaleY: s
                });
            }
        }

    smoothZoom(options : {time : number}){
        if(!this.cameraEffects.find((eff) => eff.type === 'lerpZoom' )){
            this.cameraEffects.push({type : "lerpZoom", options : options});  
        
        }
        else{
            console.log("Smooth Zoom effect already added");
            return this;
        }
    }


    decelerate(options : Decelerate) {
        if(!this.cameraEffects.find((eff) => eff.type === 'decelerate' )){
            this.cameraEffects.push({type : "decelerate", options : options});  
        
        }
        else{
            console.log("Decelerate effect already added");
            return this;
        }
    }

    calculateVelocity(points: Point[], timestamps: number[]) {
        if (points.length < 2 || timestamps.length < 2) return { x: 0, y: 0 };
        const first = points[0], last = points[points.length - 1];
        const dt = timestamps[timestamps.length - 1] - timestamps[0];
        if (dt === 0) return { x: 0, y: 0 };
        return {
            x: (last.x - first.x) / dt,
            y: (last.y - first.y) / dt
        };
    }

    startDeceleration() {
      
        if(this.decelerateCallback) {
            this.ticker.remove(this.decelerateCallback!)
        }
       
        /* using pixi-viewport same implementation on deceleration */

        this.timeSinceRelease = 0;
        this.decelerating = true;

        this.decelerateCallback = (tick : Ticker) => {
        if (!this.decelerating) return;
        const ti = this.timeSinceRelease;
        const tf = this.timeSinceRelease + (tick.deltaMS / 100);
        const friction = this.friction;
        const lnk = Math.log(friction);

        this._scene.position.x += ((this.velocity.x * this.TP) / lnk) * (Math.pow(friction, tf / this.TP) - Math.pow(friction, ti / this.TP));
        this._scene.position.y += ((this.velocity.y * this.TP) / lnk) * (Math.pow(friction, tf / this.TP) - Math.pow(friction, ti / this.TP));

        this.velocity.x *= Math.pow(friction, (tick.deltaMS / 3) / this.TP);
        this.velocity.y *= Math.pow(friction, (tick.deltaMS / 3) / this.TP);
        this.timeSinceRelease += tick.deltaMS / 100;


        if (Math.abs(this.velocity.x) < 0.01 && Math.abs(this.velocity.y) < 0.01) {
            this.decelerating = false;
            this.ticker.remove(this.decelerateCallback!);
        }
    }
        this.ticker.add(this.decelerateCallback);
    }

   

    attachControl() {
        this._scene.on('wheel', (e : FederatedWheelEvent) => {
            const z = -1 * Math.max(-1, Math.min(1, e.deltaY)) * 0.1;
            this.emit("zoom");
            this.setZoom(z, new Point(e.clientX, e.clientY));
        });

        this._scene.on('pointerdown', (e : FederatedMouseEvent) => {
            if(this._currentMouseEventId !== 0) return;
            e.preventDefault();

            this._currentMouseEventId = 1;
            this._previousPosition = new Point(e.clientX, e.clientY);

            this._mousePositions = [new Point(e.clientX, e.clientY)];
            this._mouseTimeStamp = [performance.now()];

            this.idleState += this.ticker.deltaMS / 1000;
        });

        this._scene.on('pointermove', (e: FederatedMouseEvent) => {
            e.preventDefault();
            if(this._currentMouseEventId === 1 && this._previousPosition){
                const offsetX =  e.clientX - this._previousPosition.x;
                const offsetY =  e.clientY - this._previousPosition.y;
                this.move(new Point(offsetX, offsetY));
                this._previousPosition.set(e.clientX, e.clientY);

                // Add new point and timestamp
                this._mousePositions.push(new Point(e.clientX, e.clientY));
                this._mouseTimeStamp.push(performance.now());

                // Keep only the last 5
                if(this._mousePositions.length > 5){
                    this._mousePositions.shift();
                    this._mouseTimeStamp.shift();
                }
            }
        });

        this._scene.on('pointerup', (e: FederatedMouseEvent) => {
            this._currentMouseEventId = 0;
            e.preventDefault();


            const v = this.calculateVelocity(this._mousePositions, this._mouseTimeStamp);
            
            this.velocity.x = v.x * this.TP;
            this.velocity.y = v.y * this.TP;

            const isDecelerate = this.cameraEffects.find((eff) => eff.type === "decelerate")
            
            if(isDecelerate){
                this.startDeceleration();
            }

            this._mousePositions = [];
            this._mouseTimeStamp = [];
            this._previousPosition = null;
        });

        this.on('pointerleave', (e: FederatedMouseEvent) => {
            this._currentMouseEventId = 0;
            e.preventDefault();
            this._previousPosition = null;
        });

        return this;
    }

    move(to: Point) {
        this._scene.position.x += to.x;
        this._scene.position.y += to.y;
    }

}


export {Camera}