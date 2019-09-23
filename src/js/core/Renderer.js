export class Renderer {
    constructor(canvas=document.createElement('canvas')) {
        this._context = canvas.getContext('2d');
    }

    get domElement() { return this._context.canvas; }

    setSize(width, height) {
        this._context.canvas.width = width;
        this._context.canvas.height = height;
    }

    render(scene) {
        const c = this._context;

        c.clearRect(0, 0, c.canvas.width, c.canvas.height);

        for (let d = 0; d < 4; d++) {
            scene.render(c, d);
        }
    }
}
