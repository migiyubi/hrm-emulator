import { Entity } from './Entity'
import { Panel } from './Panel'

import textureSrc from '../../../assets/images/rukanan.png'

class OperatorPopup extends Entity {
    constructor(fontSize) {
        super();

        this._fontSize = fontSize;
        this._shadowOffset = { x: 0.02*fontSize, y: 0.1*fontSize };

        this._operator = '';
    }

    get operator() { return this._operator; }
    set operator(value) { this._operator = value; }

    renderSelf(c) {
        c.font = `bold ${this._fontSize}px Oswald`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillStyle = '#506037';
        c.fillText(this._operator, this._shadowOffset.x, this._shadowOffset.y);
        c.fillStyle = '#a0ca5f';
        c.fillText(this._operator, 0, 0);
    }
}

export class Employee extends Entity {
    constructor(cellSize, panelSize, screenHeight) {
        super();

        this._heldPanel = new Panel(panelSize);
        this._heldPanel.visible = false;
        this.add(this._heldPanel);

        this._heldPanelForAnimation = new Panel(panelSize);
        this._heldPanelForAnimation.visible = false;
        this.add(this._heldPanelForAnimation);

        this._operatorPopup = new OperatorPopup(1.0*panelSize|0);
        this._operatorPopup.visible = false;
        this.add(this._operatorPopup);

        this._topOffset = { x: 0, y: -1.0*panelSize };
        this._bottomOffset = { x: 0, y : 0.55*cellSize };
        this._leftOffset = { x: -1.0*cellSize, y: 0 };
        this._rightOffset = { x: 1.0*cellSize, y: 0 };
        this._topLeftOffset = { x: -1.0*panelSize, y: -0.8*panelSize };
        this._topRightOffset = { x: 1.0*panelSize, y: -0.8*panelSize };

        this._heldPanel.position.x = this._topOffset.x;
        this._heldPanel.position.y = this._topOffset.y;

        this._operatorPopup.depth = 1;
        this._operatorPopup.position.x = 0;
        this._operatorPopup.position.y = this._topLeftOffset.y;

        this._speed = screenHeight / 2400;

        this._flipHorizontal = false;

        this._texture = new Image();
        this._texture.src = textureSrc;
    }

    renderSelf(context) {
        const c = context;
        const t = this._texture;

        c.save();
        if (this._flipHorizontal) {
            c.scale(-1, 1);
        }
        c.drawImage(t, 0, 0, t.width, t.height, -t.width/2, -t.height/2, t.width, t.height);
        c.restore();
    }

    refresh() {
        this._heldPanelForAnimation.visible = false;
    }

    async step(to, delay=200) {
        // to avoid flickering, the animated panel is still kept visible and hidden finally here.
        this._heldPanelForAnimation.visible = false;

        const p = this.position;

        const dx = to.x - p.x;
        const dy = to.y - p.y;
        const duration = Math.sqrt(dx*dx + dy*dy) / (this.speedCoef * this._speed);

        return new Promise((resolve) => {
            new TWEEN.Tween(p)
                .to(to, duration)
                .delay(delay / this.speedCoef)
                .onStart(() => {
                    if (dx > 0.0) {
                        this._flipHorizontal = true;
                    }
                    else if (dx < 0.0) {
                        this._flipHorizontal = false;
                    }
                })
                .onComplete(resolve)
                .start();
        });
    }

    async pickFromBottom(value, delay=0) {
        const p = this._heldPanelForAnimation;

        p.position.x = this._bottomOffset.x;
        p.position.y = this._bottomOffset.y;
        p.value = value;
        p.visible = true;

        return new Promise((resolve) => {
            new TWEEN.Tween(p.position)
                .to(this._topOffset, 200 / this.speedCoef)
                .delay(delay / this.speedCoef)
                .easing(TWEEN.Easing.Cubic.Out)
                .onComplete(() => {
                    this._heldPanel.value = value;
                    this._heldPanel.visible = true;
                    resolve();
                })
                .start();
        });
    }

    async pickFromLeft(value, delay=0) {
        const p = this._heldPanelForAnimation;

        p.position.x = this._leftOffset.x;
        p.position.y = this._leftOffset.y;
        p.value = value;
        p.visible = true;

        return new Promise((resolve) => {
            new TWEEN.Tween(p.position)
                .to(this._topOffset, 200 / this.speedCoef)
                .delay(delay / this.speedCoef)
                .easing(TWEEN.Easing.Cubic.Out)
                .onComplete(() => {
                    this._heldPanel.value = value;
                    this._heldPanel.visible = true;
                    resolve();
                })
                .start();
        });
    }

    async dropToBottom(copy, delay=0) {
        const p = this._heldPanelForAnimation;

        p.position.x = this._topOffset.x;
        p.position.y = this._topOffset.y;
        p.value = this._heldPanel.value;
        p.visible = true;

        if (!copy) this._heldPanel.visible = false;

        return new Promise((resolve) => {
            new TWEEN.Tween(p.position)
                .to(this._bottomOffset, 200 / this.speedCoef)
                .delay(delay / this.speedCoef)
                .easing(TWEEN.Easing.Cubic.Out)
                .onComplete(resolve)
                .start();
        });
    }

    async dropToRight(copy, delay=0) {
        const p = this._heldPanelForAnimation;

        p.position.x = this._topOffset.x;
        p.position.y = this._topOffset.y;
        p.value = this._heldPanel.value;
        p.visible = true;

        if (!copy) this._heldPanel.visible = false;

        return new Promise((resolve) => {
            new TWEEN.Tween(p.position)
                .to(this._rightOffset, 200 / this.speedCoef)
                .delay(delay / this.speedCoef)
                .easing(TWEEN.Easing.Cubic.Out)
                .onComplete(resolve)
                .start();
        });
    }

    async stomp() {
        return Promise.resolve();
    }

    async doArithmetic(operator, operand, result, delay=0) {
        const l = this._heldPanel;
        const r = this._heldPanelForAnimation;

        r.position.x = this._bottomOffset.x;
        r.position.y = this._bottomOffset.y;
        r.value = operand;
        r.visible = true;

        return new Promise((resolve) => {
            const raiseLeft = new TWEEN.Tween(l.position)
                .to(this._topLeftOffset, 200 / this.speedCoef)
                .delay(delay / this.speedCoef)
                .easing(TWEEN.Easing.Cubic.Out);

            const raiseRight = new TWEEN.Tween(r.position)
                .to(this._topRightOffset, 200 / this.speedCoef)
                .delay(delay / this.speedCoef)
                .easing(TWEEN.Easing.Cubic.Out)
                .onComplete(() => {
                    this._operatorPopup.operator = operator;
                    this._operatorPopup.visible = true;
                });

            const mergeLeft = new TWEEN.Tween(l.position)
                .to(this._topOffset, 100 / this.speedCoef)
                .delay(200 / this.speedCoef);

            const mergeRight= new TWEEN.Tween(r.position)
                .to(this._topOffset, 100 / this.speedCoef)
                .delay(200 / this.speedCoef)
                .onComplete(() => {
                    l.value = result;
                    r.value = result;
                    this._operatorPopup.visible = false;
                });

            const from = { x: r.scale.x, y: r.scale.y };
            const to = { x: 1.3*r.scale.x, y: 1.3*r.scale.y };

            const inflate = new TWEEN.Tween(r.scale)
                .to(to, 50 / this.speedCoef)
                .easing(TWEEN.Easing.Cubic.Out);

            const deflate = new TWEEN.Tween(r.scale)
                .to(from, 50 / this.speedCoef)
                .easing(TWEEN.Easing.Cubic.In)
                .onComplete(resolve);

            raiseLeft.chain(mergeLeft);
            raiseRight.chain(mergeRight)
            mergeRight.chain(inflate)
            inflate.chain(deflate);

            raiseLeft.start();
            raiseRight.start();
        });
    }
}
