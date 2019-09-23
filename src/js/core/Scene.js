import { Group } from './entity/Group'
import { Employee } from './entity/Employee'
import { Field } from './entity/Field'
import { Panel } from './entity/Panel'

const FLOOR_INDEX_INBOX = -1;
const FLOOR_INDEX_OUTBOX = -2;

export class Scene {
    constructor(width, height, cellSize, panelSize, onCursorChange) {
        this._width = width;
        this._height = height;
        this._cellSize = cellSize;
        this._panelSize = panelSize;
        this._onCursorChange = onCursorChange;

        this._scene = new Group();

        this._speedCoefSeed = 1;

        this._abort = false;
    }

    get scene() { return this._scene; }
    get speedCoef() { return this._speedCoefSeed; }
    set speedCoef(value) {
        this._speedCoefSeed = value;
        const actualSpeedCoef = Math.pow(2, value-1);
        this._applySpeedCoef(actualSpeedCoef);
    }

    prepare(initialInbox, initialFloor, floorSize) {
        this._floorSize = floorSize;

        this._scene.clear();

        const w = this._width;
        const h = this._height;
        const cs = this._cellSize;
        const ps = this._panelSize;
        const fs = this._floorSize;

        // employee.
        this._employee = new Employee(cs, ps, h);
        this._employee.position.x = 0.3 * h;
        this._employee.position.y = 0.3 * h;
        this._scene.add(this._employee);

        // field.
        this._field = new Field({ x: w, y: h }, fs, cs, ps, initialInbox, initialFloor);
        this._field.position.x = w/2;
        this._field.position.y = h/2;
        this._scene.add(this._field);

        // control depths.
        this._field._frame.depth = 3;
        this._employee._heldPanel.depth = 2;
        this._employee._heldPanelForAnimation.depth = 2;
        this._employee.depth = 1;
        this._field.depth = 0;
    }

    start(history) {
        const handleNext = () => {
            if (this._abort) {
                return;
            }

            if (history.length <= 0) {
                // history is empty. finish replay.
                this._employee.refresh();
                this._field.forwardOutboxLong();
                return;
            }

            const h = history.shift();

            if (this._onCursorChange) this._onCursorChange(h.index);

            let i = h.floorIndex;

            if (h.name === 'inbox') {
                if (h.panelValue === undefined) {
                    // inbox is empty. finish replay.
                    this._employee.refresh();
                    this._field.forwardOutboxLong();
                    return;
                }

                i = FLOOR_INDEX_INBOX;
            }
            else if (h.name === 'outbox') {
                i = FLOOR_INDEX_OUTBOX;
            }

            if (i === undefined) {
                handleNext();
                return;
            }

            let postStep;

            switch (h.name) {
                case 'inbox':
                    postStep = () => {
                        this._field.pickFromInbox();
                        this._field.forwardInbox();
                        return this._employee.pickFromLeft(h.panelValue);
                    };
                    break;

                case 'outbox':
                    this._field.forwardOutbox();
                    postStep = () => {
                        return this._employee.dropToRight(false).then(() => {
                            this._field.dropToOutbox(h.panelValue);
                        });
                    };
                    break;

                case 'copyfrom':
                    postStep = () => {
                        return this._employee.pickFromBottom(h.panelValue);
                    };
                    break;

                case 'copyto':
                    postStep = () => {
                        return this._employee.dropToBottom(true).then(() => {
                            this._field.set(i, h.panelValue);
                        });
                    };
                    break;

                case 'add':
                case 'sub':
                    postStep = () => {
                        return this._employee.doArithmetic(h.operator, h.panelValue, h.resultValue);
                    };
                    break;

                case 'bumpp':
                case 'bumpm':
                    postStep = () => {
                        return this._field.setWithAnimation(i, h.resultValue).then(() => {
                            return this._employee.pickFromBottom(h.resultValue, 200);
                        });
                    };
                    break;

                default:
                    postStep = () => {};
                    break;
            }

            const to = this._floorIndexToScreenCoordinatesOfEmployee(i);
            this._employee.step(to).then(postStep).then(handleNext);
        }

        handleNext();
    }

    stop() {
        this._abort = true;
    }

    _floorIndexToScreenCoordinatesOfEmployee(floorIndex) {
        const w = this._width;
        const h = this._height;
        const cs = this._cellSize;
        const fs = this._floorSize;

        let x, y;

        if (floorIndex === FLOOR_INDEX_INBOX) {
            x = cs+(cs+4)/2;
            y = h/2;
        }
        else if (floorIndex === FLOOR_INDEX_OUTBOX) {
            x = w-cs-(cs+4)/2;
            y = h/2;
        }
        else {
            x = w/2 + ((floorIndex%fs.x) - (fs.x-1)/2) * cs;
            y = h/2 + ((floorIndex/fs.x|0) - (fs.y-1)/2) * cs - 0.55*cs;
        }

        return { x, y };
    }

    _applySpeedCoef(speedCoef) {
        if (this._employee) this._employee.speedCoef = speedCoef;
        if (this._field) this._field.speedCoef = speedCoef;
    }
}
