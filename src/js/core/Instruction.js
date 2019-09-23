export const InstructionCode = {
    OK: 0,

    EMPTY_INBOX: 1,

    HOLD_NULL: -1,
    REF_NULL: -2,
    EMPTY_ADDR: -3,
    INVALID_PTR: -4,
    TYPE_MISMATCH: -5,

    NO_SUCH_LABEL: -1001
};

export class Instruction {
    constructor(func, name) {
        this._func = func;
        this._name = name;
        this._index = -1;
    }

    get name() { return this._name; }
    get param() { return this._param; }
    get index() { return this._index; }
    set index(value) { this._index = value; }

    apply(context) {
        return this._func(context);
    }
}

export class InstructionInbox extends Instruction {
    constructor() {
        const func = (context) => {
            const item = context._inbox.shift();

            this._panelValue = item;

            if (item === undefined) {
                return InstructionCode.EMPTY_INBOX;
            }

            context._hold = item;

            return InstructionCode.OK;
        };

        super(func, 'inbox');
    }

    get panelValue() { return this._panelValue; }
}

export class instructionOutbox extends Instruction {
    constructor() {
        const func = (context) => {
            this._panelValue = context._hold;

            if (context._hold === null) {
                return InstructionCode.HOLD_NULL;
            }

            context._outbox.push(context._hold);
            context._hold = null;

            return InstructionCode.OK;
        };

        super(func, 'outbox');
    }

    get panelValue() { return this._panelValue; }
}

export class InstructionCopyfrom extends Instruction {
    constructor(isDirect, floorIndex) {
        let func;
        if (isDirect) {
            func = (context) => {
                if (context._floor[floorIndex] === undefined) {
                    return InstructionCode.REF_NULL;
                }

                context._hold = context._floor[floorIndex];

                this._floorIndex = floorIndex;
                this._panelValue = context._floor[floorIndex];

                return InstructionCode.OK;
            };
        }
        else {
            func = (context) => {
                const addr = context._floor[floorIndex];

                if (addr === undefined) {
                    return InstructionCode.INVALID_POINTER;
                }

                if (typeof(addr) !== 'number') {
                    return InstructionCode.INVALID_POINTER;
                }

                context._hold = context._floor[addr];

                this._floorIndex = addr;
                this._panelValue = context._floor[addr];

                return InstructionCode.OK;
            };
        }

        super(func, 'copyfrom');

        this._param = isDirect ? `${floorIndex}` : `[${floorIndex}]`;
    }

    get floorIndex() { return this._floorIndex; }
    get panelValue() { return this._panelValue; }
}

export class InstructionCopyto extends Instruction {
    constructor(isDirect, floorIndex) {
        let func;
        if (isDirect) {
            func = (context) => {
                if (context._hold === null) {
                    return InstructionCode.HOLD_NULL;
                }

                context._floor[floorIndex] = context._hold;

                this._floorIndex = floorIndex;
                this._panelValue = context._floor[floorIndex];

                return InstructionCode.OK;
            };
        }
        else {
            func = (context) => {
                if (context._hold === null) {
                    return InstructionCode.HOLD_NULL;
                }

                const addr = context._floor[floorIndex];

                if (addr === undefined) {
                    return InstructionCode.INVALID_POINTER;
                }

                if (typeof(addr) !== 'number') {
                    return InstructionCode.INVALID_POINTER;
                }

                context._floor[addr] = context._hold;

                this._floorIndex = addr;
                this._panelValue = context._floor[addr];

                return InstructionCode.OK;
            };
        }

        super(func, 'copyto');

        this._param = isDirect ? `${floorIndex}` : `[${floorIndex}]`;
    }

    get floorIndex() { return this._floorIndex; }
    get panelValue() { return this._panelValue; }
}

export class InstructionAdd extends Instruction {
    constructor(isDirect, floorIndex) {
        let func;
        if (isDirect) {
            func = (context) => {
                if (context._hold === null) {
                    return InstructionCode.HOLD_NULL;
                }

                if (context._floor[floorIndex] === undefined) {
                    return InstructionCode.REF_NULL;
                }

                if (typeof(context._hold) !== 'number' || typeof(context._floor[floorIndex]) !== 'number') {
                    return InstructionCode.TYPE_MISMATCH;
                }

                context._hold += context._floor[floorIndex];

                this._floorIndex = floorIndex;
                this._panelValue = context._floor[floorIndex];
                this._resultValue = context._hold;

                return InstructionCode.OK;
            };
        }
        else {
            func = (context) => {
                if (context._hold === null) {
                    return InstructionCode.HOLD_NULL;
                }

                const addr = context._floor[floorIndex];

                if (addr === undefined) {
                    return InstructionCode.INVALID_POINTER;
                }

                if (typeof(addr) !== 'number') {
                    return InstructionCode.INVALID_POINTER;
                }

                if (typeof(context._hold) !== 'number' || typeof(context._floor[addr]) !== 'number') {
                    return InstructionCode.TYPE_MISMATCH;
                }

                context._hold += context._floor[addr];

                this._floorIndex = addr;
                this._panelValue = context._floor[addr];
                this._resultValue = context._hold;

                return InstructionCode.OK;
            };
        }

        super(func, 'add');

        this._param = isDirect ? `${floorIndex}` : `[${floorIndex}]`;
    }

    get floorIndex() { return this._floorIndex; }
    get panelValue() { return this._panelValue; }
    get resultValue() { return this._resultValue; }
    get operator() { return '+'; }
}

export class InstructionSub extends Instruction {
    constructor(isDirect, floorIndex) {
        let func;
        if (isDirect) {
            func = (context) => {
                if (context._hold === null) {
                    return InstructionCode.HOLD_NULL;
                }

                if (context._floor[floorIndex] === undefined) {
                    return InstructionCode.REF_NULL;
                }

                if (typeof(context._hold) !== typeof(context._floor[floorIndex])) {
                    return InstructionCode.TYPE_MISMATCH;
                }

                if (typeof(context._hold) === 'string') {
                    context._hold = context._hold.charCodeAt(0) - context._floor[floorIndex].charCodeAt(0);
                }
                else {
                    context._hold -= context._floor[floorIndex];
                }

                this._floorIndex = floorIndex;
                this._panelValue = context._floor[floorIndex];
                this._resultValue = context._hold;

                return InstructionCode.OK;
            };
        }
        else {
            func = (context) => {
                if (context._hold === null) {
                    return InstructionCode.HOLD_NULL;
                }

                const addr = context._floor[floorIndex];

                if (addr === undefined) {
                    return InstructionCode.INVALID_POINTER;
                }

                if (typeof(addr) !== 'number') {
                    return InstructionCode.INVALID_POINTER;
                }

                if (typeof(context._hold) !== typeof(context._floor[addr])) {
                    return InstructionCode.TYPE_MISMATCH;
                }

                if (typeof(context._hold) === 'string') {
                    context._hold = context._hold.charCodeAt(0) - context._floor[addr].charCodeAt(0);
                }
                else {
                    context._hold -= context._floor[addr];
                }

                this._floorIndex = addr;
                this._panelValue = context._floor[addr];
                this._resultValue = context._hold;

                return InstructionCode.OK;
            };
        }

        super(func, 'sub');

        this._param = isDirect ? `${floorIndex}` : `[${floorIndex}]`;
    }

    get floorIndex() { return this._floorIndex; }
    get panelValue() { return this._panelValue; }
    get resultValue() { return this._resultValue; }
    get operator() { return '-'; }
}

export class InstructionBumpup extends Instruction {
    constructor(isDirect, floorIndex) {
        let func;
        if (isDirect) {
            func = (context) => {
                if (context._floor[floorIndex] === undefined) {
                    return InstructionCode.REF_NULL;
                }

                if (typeof(context._floor[floorIndex]) !== 'number') {
                    return InstructionCode.TYPE_MISMATCH;
                }

                this._floorIndex = floorIndex;
                this._panelValue = context._floor[floorIndex];

                context._hold = ++context._floor[floorIndex];

                this._resultValue = context._hold;

                return InstructionCode.OK;
            };
        }
        else {
            func = (context) => {
                const addr = context._floor[floorIndex];

                if (addr === undefined) {
                    return InstructionCode.INVALID_POINTER;
                }

                if (typeof(addr) !== 'number') {
                    return InstructionCode.INVALID_POINTER;
                }

                if (typeof(context._floor[addr]) !== 'number') {
                    return InstructionCode.TYPE_MISMATCH;
                }

                this._floorIndex = addr;
                this._panelValue = context._floor[addr];

                context._hold = ++context._floor[addr];

                this._resultValue = context._hold;

                return InstructionCode.OK;
            };
        }

        super(func, 'bumpp');

        this._param = isDirect ? `${floorIndex}` : `[${floorIndex}]`;
    }

    get floorIndex() { return this._floorIndex; }
    get panelValue() { return this._panelValue; }
    get resultValue() { return this._resultValue; }
}

export class InstructionBumpdown extends Instruction {
    constructor(isDirect, floorIndex) {
        let func;
        if (isDirect) {
            func = (context) => {
                if (context._floor[floorIndex] === undefined) {
                    return InstructionCode.REF_NULL;
                }

                if (typeof(context._floor[floorIndex]) !== 'number') {
                    return InstructionCode.TYPE_MISMATCH;
                }

                this._floorIndex = floorIndex;
                this._panelValue = context._floor[floorIndex];

                context._hold = --context._floor[floorIndex];

                this._resultValue = context._hold;

                return InstructionCode.OK;
            };
        }
        else {
            func = (context) => {
                const addr = context._floor[floorIndex];

                if (addr === undefined) {
                    return InstructionCode.INVALID_POINTER;
                }

                if (typeof(addr) !== 'number') {
                    return InstructionCode.INVALID_POINTER;
                }

                if (typeof(context._floor[addr]) !== 'number') {
                    return InstructionCode.TYPE_MISMATCH;
                }

                this._floorIndex = addr;
                this._panelValue = context._floor[addr];

                context._hold = --context._floor[addr];

                this._resultValue = context._hold;

                return InstructionCode.OK;
            };
        }

        super(func, 'bumpm');

        this._param = isDirect ? `${floorIndex}` : `[${floorIndex}]`;
    }

    get floorIndex() { return this._floorIndex; }
    get panelValue() { return this._panelValue; }
    get resultValue() { return this._resultValue; }
}

export class InstructionJumpBase extends Instruction {
    constructor(name, label, decider) {
        const func = (context) => {
            let targetIndex = 0;
            const target = context._instructions.find((inst, index) => { targetIndex = index; return inst.label===label; });

            if (target === undefined) {
                console.error('no such label.', label);
                return InstructionCode.NO_SUCH_LABEL;
            }

            decider(context, targetIndex);

            return InstructionCode.OK;
        };

        super(func, name);

        this._toLabel = label;
    }

    get toLabel() { return this._toLabel; }
}

export class InstructionJump extends InstructionJumpBase {
    constructor(label) {
        const decider = (context, targetIndex) => {
            context._cursor = targetIndex;
        };

        super('jump', label, decider);
    }
}

export class InstructionJumpIfZero extends InstructionJumpBase {
    constructor(label) {
        const decider = (context, targetIndex) => {
            if (context._hold === null) {
                return InstructionCode.HOLD_NULL;
            }

            if (typeof(context._hold) !== 'number') {
                return InstructionCode.TYPE_MISMATCH;
            }

            if (context._hold === 0) {
                context._cursor = targetIndex;
            }
        };

        super('jumpz', label, decider);
    }
}

export class InstructionJumpIfNeg extends InstructionJumpBase {
    constructor(label) {
        const decider = (context, targetIndex) => {
            if (context._hold === null) {
                return InstructionCode.HOLD_NULL;
            }

            if (typeof(context._hold) !== 'number') {
                return InstructionCode.TYPE_MISMATCH;
            }

            if (context._hold < 0) {
                context._cursor = targetIndex;
            }
        };

        super('jumpn', label, decider);
    }
}

export class InstructionLabel extends Instruction {
    constructor(label) {
        const func = (context) => { return InstructionCode.OK; };

        super(func, 'label');

        this._label = label;
    }

    get label() { return this._label; }
}
