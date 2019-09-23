export class Entity {
    constructor() {
        this.children = [];
        this.depth = 0;
        this.position = { x: 0, y: 0 };
        this.scale = { x: 1.0, y: 1.0 };
        this.speedCoef = 1.0;
        this.visible = true;
    }

    render(context, depth) {
        const c = context;

        c.save();
        c.translate(this.position.x, this.position.y);
        c.scale(this.scale.x, this.scale.y);

        if (this.visible && this.depth === depth) {
            this.renderSelf(c);
        }

        for (const child of this.children) {
            child.render(c, depth);
        }

        c.restore();
    }

    clear() {
        this.children = [];
    }

    add(object) {
        this.children.push(object);
    }

    remove(object) {
        this.children = this.children.filter(child => object !== child);
    }

    renderSelf(context) {
        throw new Error('not implemented.');
    }
}
