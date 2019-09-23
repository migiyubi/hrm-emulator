import style from '../css/main.css'

import { Game } from './core/Game'
import {
    ProblemAdd,
    ProblemSort,
    ProblemRemoveDup,
    ProblemSortVariableLength
} from './problem/Problems'

document.addEventListener('DOMContentLoaded', () => {
    const solutionAdd = `
        next:
            inbox
            copyto 0
            inbox
            add    0
            outbox
            jump   next
    `;

    const solutionSort = `
        next:
            inbox
            copyto   0
            inbox
            copyto   1
            inbox
            copyto   2

        common:
            copyfrom 0
            copyto   tmp
            sub      1
            jumpn    skip_swap

            copyfrom 1
            copyto   0
            copyfrom tmp
            copyto   1

        skip_swap:
            copyfrom 2
            copyto   tmp
            sub      1
            jumpn    continue

        _out:
            copyfrom 0
            outbox
            copyfrom 1
            outbox
            copyfrom 2
            outbox
            jump     next

        continue:
            copyfrom 1
            copyto   2
            copyfrom tmp
            copyto   1

            jump     common
    `;

    const solutionRemoveDup = `
        next:
            inbox 
            copyto   [count]
            copyfrom  count
            copyto    index
        check_dup:
            bumpm     index
            jumpn     no_dup
            copyfrom [index]
            sub      [count]
            jumpz     next
            jump      check_dup
        no_dup:
            copyfrom [count]
            outbox
            bumpp     count
            jump      next
    `;

    const solutionSortVariableLength = `
        init:
            copyfrom  zero
            copyto    len
        _first:
            inbox
            copyto   [len]
        next:
            inbox
            jumpz     out
            copyto    tmp
            bumpp     len
            copyto    i
            copyto    j
            copyto    k
        compare:
            bumpm     i
            jumpn     forward
            copyfrom [i]
            sub       tmp
            jumpn     compare
        forward:
            bumpm     j
            sub       i
            jumpz     insert
            copyfrom [j]
            copyto   [k]
            bumpm     k
            jump      forward
        insert:
            copyfrom  tmp
            copyto   [k]
            jump      next
        out:
            copyfrom [len] 
            outbox
            bumpm     len
            jumpn     init
            jump      out
    `;

    const domSpeedValue = document.querySelector('#slider-speed-value');
    const domScenarioSelector = document.querySelector('#select-scenario');
    const speedExprMap = ['1/2x', '1x', '2x', '4x', '8x', '16x', '32x'];

    const scenarios = [
        { problem: new ProblemAdd(), solution: solutionAdd, aliases: {} },
        { problem: new ProblemSort(), solution: solutionSort, aliases: { "tmp": 9 } },
        { problem: new ProblemRemoveDup(), solution: solutionRemoveDup, aliases: { "index": 14, "count": 15 } },
        { problem: new ProblemSortVariableLength(), solution: solutionSortVariableLength, aliases: { "len": 20, "i": 21, "j": 22, "k": 23, "tmp": 19, "zero": 24 } },
    ];

    for (const [index, scenario] of scenarios.entries()) {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = scenario.problem.summary;
        domScenarioSelector.appendChild(option);
    }

    document.querySelector('#slider-speed').addEventListener('input', (e) => {
        const value = e.target.value;
        game.speedCoef = value;
        domSpeedValue.textContent = `${speedExprMap[value]}`;
    });

    domScenarioSelector.addEventListener('change', (e) => {
        const scenarioIndex = parseInt(e.target.value, 10);
        setScenario(scenarioIndex);
    });

    const setScenario = (index) => {
        const s = scenarios[index];
        game.newGame(s.problem, s.solution, s.aliases);
    };

    const game = new Game(640, 640, document.querySelector('#canvas-main'), document.querySelector('#canvas-code'));

    const defaultScenarioIndex = 2;
    domScenarioSelector.children[defaultScenarioIndex].selected = 'selected';
    setScenario(defaultScenarioIndex);
});
