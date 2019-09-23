import { InstructionCode } from './Instruction'

export const HRMCode = {
    OK: 0,
    INST_ERROR: -1001,
    INVALID_OUTBOX: -1002,
    TOO_LARGE_STEPS: -1003
};

export class HRM {
    constructor(params = {}) {
        this._instructions = null;
        this._initialInbox = null;
        this._initialFloor = null;
        this._lines = 0;
        this._steps = 0;

        this._inbox = null;
        this._outbox = null;
        this._floor = null;

        this._cursor = 0;
        this._hold = null;
        this._steps = 0;

        this._verbose = (params.verbose !== undefined) ? params.verbose : false;
    }

    setInstructions(instructions) {
        this._instructions = instructions;

        this._lines = instructions.reduce((acc, inst) => inst.label === undefined ? acc+1 : acc, 0);
    }

    setField(inbox, floor, expected) {
        this._initialInbox = inbox;
        this._initialFloor = floor;
        this._expected = expected;
    }

    run() {
        this._reset();

        const history = [];
        let hrmResult = HRMCode.OK;
        let lastInstructionResult = InstructionCode.OK;

        while (true) {
            const inst = this._instructions[this._cursor];

            lastInstructionResult = inst.apply(this);

            const h = { index: inst.index, name: inst.name };
            if (inst.label !== undefined) h.label = inst.label;
            if (inst.toLabel !== undefined) h.toLabel = inst.toLabel;
            if (inst.param !== undefined) h.param = inst.param;
            if (inst.floorIndex !== undefined) h.floorIndex = inst.floorIndex;
            if (inst.panelValue !== undefined) h.panelValue = inst.panelValue;
            if (inst.resultValue !== undefined) h.resultValue = inst.resultValue;
            if (inst.operator !== undefined) h.operator = inst.operator;
            history.push(h);

            if (this._verbose) {
                console.log(this._inbox, this._outbox, this._floor, this._hold, this._cursor, this._steps);
            }

            if ((lastInstructionResult !== InstructionCode.OK)) {
                if (lastInstructionResult !== InstructionCode.EMPTY_INBOX) {
                    hrmResult = HRMCode.INST_ERROR;
                }

                break;
            }

            ++this._cursor;

            if (inst.label === undefined) {
                ++this._steps;
            }

            if (inst.operationName === 'outbox') {
                const lastIndex = this._outbox.length - 1;

                if (this._expected[lastIndex] !== this._outbox[lastIndex]) {
                    hrmResult = HRMCode.INVALID_OUTBOX;
                    break;
                }
            }

            if (this._cursor >= this._instructions.length) {
                break;
            }

            if (this._steps >= 10000) {
                hrmResult = HRMCode.TOO_LARGE_STEPS;
                break;
            }
        }

        if ((hrmResult === HRMCode.OK) && ((lastInstructionResult === InstructionCode.OK) || (lastInstructionResult === InstructionCode.EMPTY_INBOX))) {
            const match = (this._expected.length === this._outbox.length) && this._expected.reduce((acc, cur, idx) => acc && (cur === this._outbox[idx]), true);

            if (!match) {
                hrmResult = HRMCode.INVALID_OUTBOX;
            }
        }

        const lines = this._lines;
        const steps = this._steps;

        return { hrmResult, lastInstructionResult, history, lines, steps };
    }

    _reset() {
        this._inbox = this._initialInbox.slice();
        this._floor = Object.assign({}, this._initialFloor);
        this._outbox = [];
        this._cursor = 0;
        this._hold = null;
        this._steps = 0;
    }
}
