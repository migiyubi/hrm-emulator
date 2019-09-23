import { Entity } from './entity/Entity'
import { Group } from './entity/Group'

class CodeChip extends Entity {
    constructor(expression, width, height) {
        super();

        this._expression = expression;
        this._width = width;
        this._height = height;

        this._bodyHeight = 0.8 * height;
        this._font = `bold ${this._bodyHeight}px Oswald`;
    }

    get highlighted() { return this._highlighted; }
    set highlighted(value) { this._highlighted = value; }

    renderSelf(c) {
        if (this._highlighted) {
            c.fillStyle = '#00aa00';
            c.fillRect(0, 0, this._width, this._height);
        }

        c.font = this._font;
        c.fillStyle = '#ffffff';
        c.fillText(this._expression, 0, this._bodyHeight);
    }
}

export class CodeScene {
    constructor(width, height) {
        this._width = width;
        this._height = height;

        this._scene = new Group();

        this._codeContainer = new Group();
        this._scene.add(this._codeContainer);
    }

    get scene() { return this._scene; }

    prepare(instructions) {
        this._codeContainer.clear();

        const w = this._width;
        const h = this._height;
        const chipHeight = Math.min(h/instructions.length, 26);

        for (const [index, inst] of instructions.entries()) {
            const expr = this._createExpression(inst);

            const chip = new CodeChip(expr, w, chipHeight);
            chip.position.y = index*chipHeight;

            this._codeContainer.add(chip);
        }
    }

    setCursor(index) {
        const chips = this._codeContainer.children;

        for (let i = 0; i < chips.length; i++) {
            chips[i].highlighted = i === index;
        }
    }

    _createExpression(instruction) {
        if (instruction.name === 'label') {
            return `${instruction.label}:`.toUpperCase();
        }

        const indent = '    ';

        if (instruction.param !== undefined) {
            return `${indent}${instruction.name} ${instruction.param}`.toUpperCase();
        }

        if (instruction.toLabel !== undefined) {
            return `${indent}${instruction.name} ${instruction.toLabel}`.toUpperCase();
        }

        return `${indent}${instruction.name}`.toUpperCase();
    }
}
