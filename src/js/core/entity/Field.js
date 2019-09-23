import { Entity } from './Entity'
import { Panel } from './Panel'

class Frame extends Entity {
    constructor(screenSize) {
        super();

        this._width = screenSize.x;
        this._height = screenSize.y;
    }

    renderSelf(context) {
        const c = context;
        const w = this._width;
        const h = this._height;

        const colorEdge = '#322a25';
        const edgeWidth = 4;
        const lm = 0.5 * edgeWidth;

        c.save();
        c.translate(-w/2, -h/2);

        c.strokeStyle = colorEdge;
        c.lineWidth = edgeWidth;
        c.strokeRect(lm, lm, w-2*lm, h-2*lm);

        c.restore();
    }
}

export class Field extends Entity {
    constructor(screenSize, floorSize, cellSize, panelSize, initialInbox, initialFloor) {
        super();

        this._width = screenSize.x;
        this._height = screenSize.y;
        this._floorSize = floorSize;
        this._cellSize = cellSize;
        this._panelSize = panelSize;

        this._frame = new Frame(screenSize);
        this.add(this._frame);

        this._inboxPanels = [];
        this._outboxPanels = [];
        this._floorPanels = [];

        for (const [index, input] of initialInbox.entries()) {
            const panel = new Panel(panelSize);
            panel.value = input;
            panel.position.x = -screenSize.x/2 + (cellSize+4)/2;
            panel.position.y = index * 1.5*panelSize;

            this._inboxPanels.push(panel);
            this.add(panel);
        }

        for (let i = 0; i < floorSize.y; i++) {
            for (let j = 0; j < floorSize.x; j++) {
                const panel = new Panel(panelSize);

                const index = i*floorSize.x+j;
                panel.position = this._floorIndexToLocalCoordinates(index);

                const floorValue = initialFloor[index];
                if (floorValue !== undefined) {
                    panel.value = floorValue;
                    panel.visible = true;
                }
                else {
                    panel.value = null;
                    panel.visible = false;
                }

                this._floorPanels[index] = panel;
                this.add(panel);
            }
        }
    }

    renderSelf(context) {
        const c = context;
        const w = this._width;
        const h = this._height;
        const cols = this._floorSize.x;
        const rows = this._floorSize.y;
        const cs = this._cellSize;

        const colorBase = '#ca9877';
        const colorEdge = '#322a25';
        const colorParityEven = '#8d804c';
        const colorParityOdd = '#999454';
        const colorBelt = '#4c3b2c';
        const colorText = '#506137';
        const margin = 0.05 * cs;
        const edgeWidth = 4;

        {
            // base.
            c.save();
            c.translate(-w/2, -h/2);

            c.fillStyle = colorBase;
            c.fillRect(0, 0, w, h);

            c.strokeStyle = colorEdge;
            c.lineWidth = edgeWidth;
            const lm = 0.5 * edgeWidth;

            // belt.
            const oy = h/2 - cs/2 - lm;
            const lh = h - oy;
            c.fillStyle = colorBelt;

            c.fillRect(lm, oy, cs, lh);
            c.strokeRect(lm, oy, cs, lh);
            c.fillRect(w-cs-lm, oy, cs, lh);
            c.strokeRect(w-cs-lm, oy, cs, lh);

            c.restore();
        }

        {
            // floor.
            const lw = cols*cs + 2*margin;
            const lh = rows*cs + 2*margin;

            c.save();
            c.translate(-lw/2, -lh/2 + 0.1*cs);

            // floor base.
            c.fillStyle = colorParityOdd;
            c.fillRect(0, 0, lw, lh);

            // ichimatsu filling.
            c.translate(margin, margin);

            c.fillStyle = colorParityEven;
            for (let i = 0; i < rows; i++) {
                for (let j = i%2; j < cols; j+=2) {
                    c.fillRect(j*cs + margin, i*cs + margin, cs - 2*margin, cs - 2*margin);
                }
            }

            // index.
            const fontSize = 0.15 * cs | 0;
            const font = `${fontSize}px Oswald`;
            c.font = font;
            c.textAlign = 'right';
            c.textBaseline = 'bottom';
            c.fillStyle = colorText;
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    c.fillText(i*cols+j, (j+1)*cs-2*margin, (i+1)*cs-2*margin);
                }
            }

            c.restore();
        }
    }

    set(index, value) {
        const panel = this._floorPanels[index];
        panel.value = value;
        panel.visible = true;
    }

    async setWithAnimation(index, value) {
        const panel = this._floorPanels[index];
        const from = { x: panel.scale.x, y: panel.scale.y };
        const to = { x: 1.5*panel.scale.x, y: 1.5*panel.scale.y };

        return new Promise((resolve) => {
            const inflate = new TWEEN.Tween(panel.scale)
                .to(to, 50 / this.speedCoef)
                .onComplete(() => { panel.value = value; });
            const deflate = new TWEEN.Tween(panel.scale)
                .to(from, 50 / this.speedCoef)
                .onComplete(resolve);
            inflate.chain(deflate).start();
        });
    }

    pickFromInbox() {
        const panel = this._inboxPanels.shift();
        panel.visible = false;
    }

    forwardInbox() {
        const tweens = [];

        for (const panel of this._inboxPanels) {
            const tween = new TWEEN.Tween(panel.position)
                .to({ x: panel.position.x, y: panel.position.y-1.5*this._panelSize }, 1000 / this.speedCoef)
                .easing(TWEEN.Easing.Cubic.InOut);
            tweens.push(tween);
        }

        for (const tween of tweens) {
            tween.start();
        }
    }

    dropToOutbox(value) {
        const panel = new Panel(this._panelSize);
        panel.value = value;
        panel.position.x = this._width/2 - (this._cellSize+4)/2;
        panel.position.y = 0;

        this._outboxPanels.push(panel);
        this.add(panel);
    }

    forwardOutbox() {
        const tweens = [];

        for (const panel of this._outboxPanels) {
            const tween = new TWEEN.Tween(panel.position)
                .to({ x: panel.position.x, y: panel.position.y+1.5*this._panelSize }, 1000 / this.speedCoef)
                .easing(TWEEN.Easing.Cubic.InOut);
            tweens.push(tween);
        }

        for (const tween of tweens) {
            tween.start();
        }
    }

    forwardOutboxLong() {
        const tweens = [];

        for (const panel of this._outboxPanels) {
            const tween = new TWEEN.Tween(panel.position)
                .to({ x: panel.position.x, y: panel.position.y+10*1.5*this._panelSize }, 2000)
                .easing(TWEEN.Easing.Quadratic.In);
            tweens.push(tween);
        }

        for (const tween of tweens) {
            tween.start();
        }
    }

    _floorIndexToLocalCoordinates(index) {
        const cs = this._cellSize;
        const fs = this._floorSize;

        const x = ((index%fs.x) - (fs.x-1)/2) * cs;
        const y = ((index/fs.x|0) - (fs.y-1)/2) * cs;

        return { x, y };
    }
}
