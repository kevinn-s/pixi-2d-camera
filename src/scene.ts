
import { Container, ContainerOptions, PointData, Rectangle } from "pixi.js";



class Scene extends Container{

    _sceneWidth : number;
    _sceneHeight : number;

    constructor(options : Omit<ContainerOptions, 'width' | 'height'> & { width : number, height : number }){
        super(options)
        this._sceneWidth = options.width;
        this._sceneHeight = options.height;
        // by default, interactive would be true
        this.interactive = this.interactive === undefined ? true : options.interactive;
        this.hitArea = new Rectangle(-(this._sceneWidth/2), -(this._sceneHeight/2), this._sceneWidth, this._sceneHeight);

        this.default();
    }

    protected default(){
        this.setScenePivot({x : this._sceneWidth / 2, y : this._sceneHeight / 2});
    }


    public setScenePivot(value: PointData | number) {
        /* Somehow, .pivot method on pixi also subtract current object position by the pivot values itself */

        if(typeof value === 'number'){
            this.pivot.set(value)
            this.updateTransform({
                x : this.localTransform.tx + value,
                y : this.localTransform.ty + value
            });
        } else {
            this.pivot.set(value.x, value.y)
            this.updateTransform({
                x : this.localTransform.tx + value.x,
                y : this.localTransform.ty + value.y
            });
        }

        
    }

}

export {Scene}