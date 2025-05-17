# Pixi 2D Camera System

> ONLY WORKS ON PIXI.JS V8, not yet tested on previous version

> A basic Pixi.js 2D camera system implementation, including essential camera movements such as zoom and panning.  
> Additional features for camera behaviors are also available, including:  
> - Lerp Effect  
> - Deceleration  
> - And more to be added!

> The methods used to instantiate the camera are heavily inspired by Babylon.js.

## Usage

1. **Create a "Scene" class.**  
   The Scene class is essentially a `Container` class in Pixi.js. Add all objects intended to this class, effectively replacing the use of `app.view.stage`.

2. **Create a "Camera" class.**  
   To connect it with the Scene, pass the Scene class instance into the Camera class constructor.

3. **Enable camera controls.**  
   To make the camera controllable, call the `attachControl` function on the Camera class.

4. **Add camera effects.**  
   To add effects, simply call the relevant effect function. You can also chain these method calls!
   
> This is my own "fun project," so it may not be as robust or feature-complete as production-ready solutions. The main purpose of this project is for learning and experimentation.  
>  
> If you need a more robust, actively maintained, and feature-rich PixiJS camera system, consider using the [pixi-viewport](https://github.com/pixijs-userland/pixi-viewport) library.
