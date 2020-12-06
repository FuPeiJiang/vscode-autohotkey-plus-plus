import * as vscode from 'vscode'
import { CodeUtil } from '../common/codeUtil'

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const lastLineId = document.lineCount - 1
    return new vscode.Range(
        0,
        0,
        lastLineId,
        document.lineAt(lastLineId).text.length,
    )
}

export class FormatProvider implements vscode.DocumentFormattingEditProvider {
    private static oneCommandList = [
        'ifnotexist',
        'ifexist',
        'ifwinactive',
        'ifwinnotactive',
        'ifwinexist',
        'ifwinnotexist',
        'ifinstring',
        'ifnotinstring',
        'if',
        'else',
        'loop',
        'for',
        'while',
        'catch',
    ];

    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken,
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        let formatDocument = ''
        let deep = 0 //deep is indentation level
        let depthOfHotkey = 0
        let oneCommandCode = false
        let blockComment = false
        let notHotkey = false

        for (let line = 0; line < document.lineCount; line++) {
            const originText = document.lineAt(line).text
            if (originText.match(/ *\/\*/)) {
                blockComment = true
            }
            if (originText.match(/ *\*\//)) {
                blockComment = false
            }
            if (blockComment) {
                formatDocument += originText
                if (line !== document.lineCount - 1) {
                    formatDocument += '\n'
                }
                continue
            }
            const purityText = CodeUtil.purity_greedy(originText.toLowerCase())
            let notDeep = true
            //start of indentation substraction
            if (
                purityText.includes("#if") ||
                purityText.match(/#ifwinactive$/) ||
                purityText.match(/#ifwinnotactive$/)
            ) {
                if (depthOfHotkey > 0) {
                    if (deep > 0) {
                        deep--
                    }
                } else {
                    deep--
                    console.log("here", deep)

                }
                notDeep = false
            }
            // \bword\b:whole words only, /i:case insensitive
            if (purityText.match(/\b(return)\b/i)) {
                if (deep === depthOfHotkey) {
                    deep--
                    notDeep = false
                }
            }

            if (purityText.match(/^\s*case.+?:\s*$/)) {
                depthOfHotkey--
                deep--
                notDeep = false
            } else if (purityText.match(/:\s*$/)) {
                if (depthOfHotkey === deep) {
                    deep--
                    notDeep = false
                }
            }
            const trimmedText = purityText.trimEnd()
            const trimmedTextLen = trimmedText.length
            const lastChar = trimmedText.slice(trimmedTextLen - 1)

            if (lastChar === ":")
                notHotkey = false
            else
                notHotkey = true //mostly not hotkeys

            if (purityText.includes("}")) {
                if (notHotkey) deep--
                notDeep = false
            }

            if (oneCommandCode && purityText.includes("{")) {
                if (notHotkey) {
                    deep--
                    oneCommandCode = false
                }
            }

            //end of indentation substraction

            if (deep < 0) {
                deep = 0
            }
            let comment: any = /;.+/.exec(originText)
            comment = comment ? comment[0] : ''

            const formatedText =
                originText
                    .replace(/^\s*/, '')
                    .replace(/;.+/, '')
                    .replace(/ {2,}/g, ' ') + comment
            formatDocument +=
                !formatedText || formatedText.trim() == ''
                    ? formatedText
                    : ' '.repeat(deep * options.tabSize) + formatedText
            if (line !== document.lineCount - 1) {
                formatDocument += '\n'
            }

            if (oneCommandCode) {
                oneCommandCode = false
                deep--
            }

            //start of indentation addition
            if (
                purityText.includes("#if") ||
                purityText.match(/#ifwinactive.*?\s/) ||
                purityText.match(/#ifwinnotactive.*?\s/)
            ) {
                deep++
                notDeep = false
            }
            //if hotkey::
            if (!notHotkey) {
                deep++
                depthOfHotkey = deep
                notDeep = false
            }

            if (purityText.includes("{")) {
                if (notHotkey) {
                    deep++
                }
                notDeep = false
            }

            if (notDeep) {
                for (const oneCommand of FormatProvider.oneCommandList) {
                    let temp: RegExpExecArray
                    if (
                        (temp = new RegExp('\\b' + oneCommand + '\\b(.*)').exec(
                            purityText,
                        )) != null &&
                        !temp[1].includes('/')
                    ) {
                        oneCommandCode = true
                        deep++
                        break
                    }
                }
            }
        }
        const result = []
        result.push(
            new vscode.TextEdit(
                fullDocumentRange(document),
                formatDocument.replace(/\n{2,}/g, '\n\n'),
            ),
        )
        return result
    }
}
