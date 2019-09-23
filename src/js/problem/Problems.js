import { ProblemBase } from './ProblemBase'

export class ProblemAdd extends ProblemBase {
    constructor() {
        super((seed) => {
            const inputs = [];
            const expected = [];

            for (let i = 0; i < 20; i++) {
                inputs[i] = 100 * Math.random() | 0;

                if (i % 2 === 1) {
                    expected[i/2|0] = inputs[i] + inputs[i-1];
                }
            }

            return { inputs, expected };
        },
        {},
        'Pairwise Add',
        '',
        { x: 3, y: 1 });
    }
}

export class ProblemRemoveDup extends ProblemBase {
    constructor() {
        super((seed, num=10) => {
            const inputs = [];
            for (let i = 0; i < num; i++) {
                inputs.push(String.fromCharCode('A'.charCodeAt(0) + (Math.random()*5|0)));
            }

            const expected = inputs.filter((elem, index, array) => array.indexOf(elem) === index);

            return { inputs, expected };
        },
        { 15: 0 },
        'Duplicate Removal',
        '',
        { x: 4, y: 4 });
    }
}

export class ProblemSort extends ProblemBase {
    constructor() {
        super((seed, num=4) => {
            const inputs = [];
            for (let i = 0; i < num; i++) {
                for (let j = 0; j < 3; j++) {
                    inputs.push((Math.random()*19|0) - 9);
                }
            }

            const expected = [];
            for (let i = 0; i < inputs.length; i+=3) {
                const src = inputs.slice(i, i+3).sort((a, b) => a-b);
                expected.push(src[0], src[1], src[2]);
            }

            return { inputs, expected };
        },
        {},
        'Three Sort',
        '',
        { x: 5, y: 2 });
    }
}

export class ProblemSortVariableLength extends ProblemBase {
    constructor() {
        super((seed) => {
            return {
                inputs: [85, 28, 67, 0, 'T', 'H', 'I', 'N', 'K', 0, 73, 92, 21, 60, 23, 58, 35, 18, 60, 46, 0, 10, 0],
                expected: [28, 67, 85, 'H', 'I', 'K', 'N', 'T', 18, 21, 23, 35, 46, 58, 60, 60, 73, 92, 10]
            }
        },
        { 24: 0 },
        'Sorting Floor',
        '',
        { x: 5, y: 5 });
    }
}
