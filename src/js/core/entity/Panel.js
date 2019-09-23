import { Entity } from './Entity'

export class Panel extends Entity {
    constructor(size, rotation=0.06*Math.random()-0.03) {
        super();

        this._size = size;
        this._rotation = rotation;

        this._value = null;
        this._expression = null;
        this._isInteger = false;
    }

    get value() { return this._value; }
    set value(val) {
        this._value = val;

        if (typeof(val) === 'number') {
            this._isInteger = true;
            this._expression = val.toString(10);
        }
        else {
            this._isInteger = false;
            this._expression = val;
        }
    }

    renderSelf(context) {
        const c = context;
        const s = this._size;
        const fontSize = 0.6 * s | 0;
        const font = `bold ${fontSize}px Oswald`;

        const colorInt = '#a0ca5f';
        const colorIntShadow = '#506037';
        const colorChar = '#9695c5';
        const colorCharShadow = '#44445f';
        const colorText = '#506137';

        c.save();
        c.rotate(this._rotation);

        c.save();
        c.translate(-s/2, -s/2);
        c.fillStyle = this._isInteger ? colorIntShadow : colorCharShadow;
        c.fillRect(0, 0.15*s, s, s);
        c.fillStyle = this._isInteger ? colorInt : colorChar;
        c.fillRect(0, 0, s, s);
        c.restore();

        if (this._expression) {
            const offsetX = 0.0;
            const offsetY = 1.0;
            c.fillStyle = colorText;
            c.font = font;
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(this._expression, offsetX, offsetY);
        }

        c.restore();
    }
}
