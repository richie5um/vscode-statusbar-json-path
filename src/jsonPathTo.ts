// Used from https://github.com/nidu/vscode-copy-json-path

enum ColType { Object, Array }
interface Frame {
    colType: ColType
    index?: number
    key?: string
}

export function jsonPathTo(text: string, offset: number) {
    let pos = 0;
    let stack: Frame[] = [];
    let isInKey = false;

    // console.log('jsonPathTo:start', text, offset)
    while (pos < offset) {
        // console.log('jsonPathTo:step', pos, stack, isInKey)
        const startPos = pos;
        switch (text[pos]) {
            case '"':
                const { text: s, pos: newPos } = readString(text, pos);
                // console.log('jsonPathTo:readString', {s, pos, newPos, isInKey, frame: stack[stack.length - 1]})
                if (stack.length) {
                    const frame = stack[stack.length - 1];
                    if (frame.colType == ColType.Object && isInKey) {
                        frame.key = s;
                        isInKey = false;
                    }
                }
                pos = newPos
                break;
            case '{':
                stack.push({ colType: ColType.Object });
                isInKey = true;
                break;
            case '[':
                stack.push({ colType: ColType.Array, index: 0 })
                break;
            case '}':
            case ']':
                stack.pop();
                break;
            case ',':
                if (stack.length) {
                    const frame = stack[stack.length - 1];
                    if (frame) {
                        if (frame.colType == ColType.Object) {
                            isInKey = true;
                        } else if (frame.index !== undefined) {
                            frame.index++;
                        }
                    }
                }
                break;
        }
        if (pos == startPos) {
            pos++;
        }
    }
    // console.log('jsonPathTo:end', {stack})

    return pathToString(stack);
}

function pathToString(path: Frame[]): string {
    let s = '';
    for (const frame of path) {
        if (frame.colType == ColType.Object) {

            if (frame.key) {
                if (!frame.key.match(/^[a-zA-Z$#@&%~-_][a-zA-Z\d$#@&%~-_]*$/)) {
                    const key = frame.key.replace('"', '\\"');
                    s += `["${frame.key}"]`;
                } else {
                    if (s.length) {
                        s += '.';
                    }
                    s += frame.key;
                }
            }
        } else {
            s += `[${frame.index}]`;
        }
    }
    return s
}

function readString(text: string, pos: number): { text: string, pos: number } {
    let i = pos + 1;
    i = findEndQuote(text, i);
    var textpos = {
        text: text.substring(pos + 1, i),
        pos: i + 1
    };

    // console.log('ReadString: text:' + textpos.text + ' :: pos: ' + pos)
    return textpos;
}

function isEven(n: number) {
    return n % 2 == 0;
}

function isOdd(n: number) {
    return !isEven(n);
}

// Find the next end quote
function findEndQuote(text: string, i: number) {
    while (i < text.length) {
        // console.log('findEndQuote: ' + i + ' : ' + text[i])
        if (text[i] == '"') {
            var bt = i;

            // Handle backtracking to find if this quote is escaped (or, if the escape is escaping a slash)
            while (0 <= bt && text[bt] == '\\') {
                bt--;
            }
            if (isEven(i - bt)) {
                break;
            }
        }
        i++;
    }

    return i;
}

