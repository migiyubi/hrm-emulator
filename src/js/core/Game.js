import { HRM } from './HRM'
import { Parser } from './Parser'
import { Renderer } from './Renderer'
import { Scene } from './Scene'
import { CodeScene } from './CodeScene'

export class Game {
    constructor(width, height, canvas, canvasCode) {
        this._width = width;
        this._height = height;
        this._cellSize = 0.1 * this._height;
        this._panelSize = 0.4 * this._cellSize;

        this._renderer = new Renderer(canvas);
        this._codeRenderer = new Renderer(canvasCode);
        this._scene = null;
        this._codeScene = new CodeScene(0.3*this._height, this._height);

        this._renderer.setSize(this._width, this._height);
        this._codeRenderer.setSize(0.3*this._height, this._height);

        this._speedCoefSeed = 1;

        requestAnimationFrame(this._animate.bind(this));
    }

    get speedCoef() { return this._speedCoefSeed; }
    set speedCoef(value) {
        this._speedCoefSeed = value;

        if (this._scene) {
            this._scene.speedCoef = value;
        }
    }

    newGame(problem, solution, aliases) {
        const instructions = new Parser().parse(solution, aliases);

        if (instructions === null) {
            console.error('syntax error.');
            return;
        }

        // complete offscreen simulation.
        const dataset = problem.generate();

        const hrm = new HRM();
        hrm.setInstructions(instructions);
        hrm.setField(dataset.inputs, problem.initialFloor, dataset.expected);

        const result = hrm.run();

        // request old scene to stop if exists.
        if (this._scene) {
            this._scene.stop();
        }

        // start new scene. old scene will stop at some time in background.
        this._scene = new Scene(this._width, this._height, this._cellSize, this._panelSize, this._onCursorChange.bind(this));
        this._scene.prepare(dataset.inputs, problem.initialFloor, problem.floorSize);
        this._codeScene.prepare(instructions);
        this.speedCoef = this.speedCoef; // refresh speed.
        this._scene.start(result.history);
    }

    _animate(time) {
        requestAnimationFrame(this._animate.bind(this));

        this._update(time);
        this._render();
    }

    _update(time) {
        TWEEN.update();
    }

    _render() {
        if (this._scene) {
            this._renderer.render(this._scene.scene);
        }

        this._codeRenderer.render(this._codeScene.scene);
    }

    _onCursorChange(cursor) {
        this._codeScene.setCursor(cursor);
    }
}
