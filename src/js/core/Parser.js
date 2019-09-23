import {
    InstructionInbox,
    instructionOutbox,
    InstructionCopyfrom,
    InstructionCopyto,
    InstructionAdd,
    InstructionSub,
    InstructionBumpup,
    InstructionBumpdown,
    InstructionJump,
    InstructionJumpIfZero,
    InstructionJumpIfNeg,
    InstructionLabel
} from './Instruction'

export class Parser {
    parse(source, aliases={}) {
        const instructions = [];

        const reHasNoArg = /^(\w+)(\:?)$/i;
        const reHasArgs = /^(\w+)\s+(\[?)(\w+?)(\]?)$/i;

        for (const line of source.split('\n')) {
            const trimmed = line.trim();

            if (trimmed === '') {
                continue;
            }

            const m = trimmed.match(reHasNoArg) || trimmed.match(reHasArgs);

            if (!m) {
                console.error('syntax error.', trimmed);
                return null;
            }

            let inst = null;
            const op = m[1];

            if (m[2] === ':') {
                inst = this._parseLabel(m);
            }
            else {
                const op = m[1];

                if (op === 'inbox') {
                    inst = this._parseInbox();
                }
                else if (op === 'outbox') {
                    inst = this._parseOutbox();
                }
                else if (op === 'copyfrom') {
                    inst = this._parseCopyfrom(m, aliases);
                }
                else if (op === 'copyto') {
                    inst = this._parseCopyto(m, aliases);
                }
                else if (op === 'add') {
                    inst = this._parseAdd(m, aliases);
                }
                else if (op === 'sub') {
                    inst = this._parseSub(m, aliases);
                }
                else if (op === 'bumpp') {
                    inst = this._parseBumpup(m, aliases);
                }
                else if (op === 'bumpm') {
                    inst = this._parseBumpdown(m, aliases);
                }
                else if (op === 'jump') {
                    inst = this._parseJump(m);
                }
                else if (op === 'jumpz') {
                    inst = this._parseJumpIfZero(m);
                }
                else if (op === 'jumpn') {
                    inst = this._parseJumpIfNeg(m);
                }
            }

            if (inst === null) {
                console.error('unknown instruction.', trimmed);
                return null;
            }

            inst.index = instructions.length;

            instructions.push(inst);
        }

        return instructions;
    }

    _parseInbox() {
        return new InstructionInbox();
    }

    _parseOutbox() {
        return new instructionOutbox();
    }

    _parseCopyfrom(matcher, aliases) {
        const param = this._parseParam(matcher, aliases);

        if (param === null) {
            return null;
        }

        return new InstructionCopyfrom(param.isDirect, param.value);
    }

    _parseCopyto(matcher, aliases) {
        const param = this._parseParam(matcher, aliases);

        if (param === null) {
            return null;
        }

        return new InstructionCopyto(param.isDirect, param.value);
    }

    _parseAdd(matcher, aliases) {
        const param = this._parseParam(matcher, aliases);

        if (param === null) {
            return null;
        }

        return new InstructionAdd(param.isDirect, param.value);
    }

    _parseSub(matcher, aliases) {
        const param = this._parseParam(matcher, aliases);

        if (param === null) {
            return null;
        }

        return new InstructionSub(param.isDirect, param.value);
    }

    _parseBumpup(matcher, aliases) {
        const param = this._parseParam(matcher, aliases);

        if (param === null) {
            return null;
        }

        return new InstructionBumpup(param.isDirect, param.value);
    }

    _parseBumpdown(matcher, aliases) {
        const param = this._parseParam(matcher, aliases);

        if (param === null) {
            return null;
        }

        return new InstructionBumpdown(param.isDirect, param.value);
    }

    _parseJump(matcher) {
        if (matcher.length < 4) {
            return null;
        }

        return new InstructionJump(matcher[3]);
    }

    _parseJumpIfZero(matcher) {
        if (matcher.length < 4) {
            return null;
        }

        return new InstructionJumpIfZero(matcher[3]);
    }

    _parseJumpIfNeg(matcher) {
        if (matcher.length < 4) {
            return null;
        }

        return new InstructionJumpIfNeg(matcher[3]);
    }

    _parseLabel(matcher) {
        return new InstructionLabel(matcher[1]);
    }

    _parseParam(matcher, aliases) {
        if (matcher.length < 5) {
            return null;
        }

        const p = matcher[3];
        let n = parseInt(p, 10);

        if (isNaN(n)) {
            n = aliases[p];

            if (n === undefined) {
                console.error('no such alias.', p);
                return null;
            }
        }

        const ret = {
            value: n,
            isDirect: false
        };

        if (matcher[2] === '' && matcher[4] === '') {
            ret.isDirect = true;
        }
        else if (matcher[2] === '[' && matcher[4] === ']') {
            ret.isDirect = false;
        }
        else {
            return null;
        }

        return ret;
    }
}
