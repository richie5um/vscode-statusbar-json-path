// Used from https://github.com/nidu/vscode-copy-json-path

enum ColType { Object, Array }
interface Frame {
    colType: ColType
    index?: number
    key?: string
}

export function jsonPathTo(text: string, offset: number) {
    let pos = 0
    let stack: Frame[] = []
    let isInKey = false

    // console.log('jsonPathTo:start', text, offset)
    while (pos < offset) {
        // console.log('jsonPathTo:step', pos, stack, isInKey)
        const startPos = pos
        switch (text[pos]) {
            case '"':
                const { text: s, pos: newPos } = readString(text, pos)
                // console.log('jsonPathTo:readString', {s, pos, newPos, isInKey, frame: stack[stack.length - 1]})
                if (stack.length) {
                    const frame = stack[stack.length - 1]
                    if (frame.colType == ColType.Object && isInKey) {
                        frame.key = s
                        isInKey = false
                    }
                }
                pos = newPos
                break
            case '{':
                stack.push({ colType: ColType.Object })
                isInKey = true
                break
            case '[':
                stack.push({ colType: ColType.Array, index: 0 })
                break
            case '}':
            case ']':
                stack.pop()
                break
            case ',':
                if (stack.length) {
                    const frame = stack[stack.length - 1]
                    if (frame.colType == ColType.Object) {
                        isInKey = true
                    } else {
                        frame.index++
                    }
                }
                break
        }
        if (pos == startPos) {
            pos++
        }
    }
    // console.log('jsonPathTo:end', {stack})

    return pathToString(stack)
}

function pathToString(path: Frame[]): string {
    let s = ''
    for (const frame of path) {
        if (frame.colType == ColType.Object) {
            if (!frame.key.match(/^[a-zA-Z$_][a-zA-Z\d$_]*$/)) {
                const key = frame.key.replace('"', '\\"')
                s += `["${frame.key}"]`
            } else {
                if (s.length) {
                    s += '.'
                }
                s += frame.key
            }
        } else {
            s += `[${frame.index}]`
        }
    }
    return s
}

function readString(text: string, pos: number): { text: string, pos: number } {
    let i = pos + 1
    while (!(text[i] == '"' && text[i - 1] != '\\')) i++
    return {
        text: text.substring(pos + 1, i),
        pos: i + 1
    }
}