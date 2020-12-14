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
    private static commandChars = ["a", "c", "e", "f", "g", "h", "i", "l", "n", "o", "p", "r", "s", "t", "v", "w", "x"]

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


            notHotkey = true //mostly not hotkeys
            if (lastChar === ":") {
                //if doesn't match a function
                if (! /\b(?:autotrim|blockinput|click|clipwait|control|controlclick|controlfocus|controlget|controlgetfocus|controlgetpos|controlgettext|controlmove|controlsend|controlsendraw|controlsettext|coordmode|detecthiddentext|detecthiddenwindows|drive|driveget|drivespacefree|edit|envadd|envdiv|envget|envmult|envset|envsub|envupdate|fileappend|filecopy|filecopydir|filecreatedir|filecreateshortcut|filedelete|fileencoding|filegetattrib|filegetshortcut|filegetsize|filegettime|filegetversion|fileinstall|filemove|filemovedir|fileread|filereadline|filerecycle|filerecycleempty|fileremovedir|fileselectfile|fileselectfolder|filesetattrib|filesettime|formattime|getkeystate|gosub|goto|groupactivate|groupadd|groupclose|groupdeactivate|gui|guicontrol|guicontrolget|hotkey|ifequal|ifexist|ifgreater|ifgreaterorequal|ifinstring|ifless|iflessorequal|ifmsgbox|ifnotequal|ifnotexist|ifnotinstring|ifwinactive|ifwinexist|ifwinnotactive|ifwinnotexist|imagesearch|inidelete|iniread|iniwrite|input|inputbox|keyhistory|keywait|listhotkeys|listlines|listvars|menu|mouseclick|mouseclickdrag|mousegetpos|mousemove|msgbox|onexit|outputdebug|pause|pixelgetcolor|pixelsearch|postmessage|process|progress|random|regdelete|regread|regwrite|reload|run|runas|runwait|send|sendevent|sendinput|sendlevel|sendmessage|sendmode|sendplay|sendraw|setbatchlines|setcapslockstate|setcontroldelay|setdefaultmousespeed|setenv|setformat|setkeydelay|setmousedelay|setnumlockstate|setscrolllockstate|setstorecapslockmode|setregview|settimer|settitlematchmode|setwindelay|setworkingdir|shutdown|sleep|sort|soundbeep|soundget|soundgetwavevolume|soundplay|soundset|soundsetwavevolume|splashimage|splashtextoff|splashtexton|splitpath|statusbargettext|statusbarwait|stringcasesense|stringgetpos|stringleft|stringlen|stringlower|stringmid|stringreplace|stringright|stringsplit|stringtrimleft|stringtrimright|stringupper|suspend|sysget|thread|tooltip|transform|traytip|urldownloadtofile|winactivate|winactivatebottom|winclose|winget|wingetactivestats|wingetactivetitle|wingetclass|wingetpos|wingettext|wingettitle|winhide|winkill|winmaximize|winmenuselectitem|winminimize|winminimizeall|winminimizeallundo|winmove|winrestore|winset|winsettitle|winshow|winwait|winwaitactive|winwaitclose|winwaitnotactive)(?!\s*\:)\b/.test(trimmedText)) {
                    if (! /\b(?:autotrim|Exception|blockinput|click|clipwait|control|controlclick|controlfocus|controlget|controlgetfocus|controlgetpos|controlgettext|controlmove|controlsend|controlsendraw|controlsettext|coordmode|detecthiddentext|detecthiddenwindows|drive|driveget|drivespacefree|edit|envadd|envdiv|envget|envmult|envset|envsub|envupdate|fileappend|filecopy|filecopydir|filecreatedir|filecreateshortcut|filedelete|fileencoding|filegetattrib|filegetshortcut|filegetsize|filegettime|filegetversion|fileinstall|filemove|filemovedir|fileread|filereadline|filerecycle|filerecycleempty|fileremovedir|fileselectfile|fileselectfolder|filesetattrib|filesettime|formattime|getkeystate|gosub|goto|groupactivate|groupadd|groupclose|groupdeactivate|gui|guicontrol|guicontrolget|hotkey|ifequal|ifexist|ifgreater|ifgreaterorequal|ifinstring|ifless|iflessorequal|ifmsgbox|ifnotequal|ifnotexist|ifnotinstring|ifwinactive|ifwinexist|ifwinnotactive|ifwinnotexist|imagesearch|inidelete|iniread|iniwrite|input|inputbox|keyhistory|keywait|listhotkeys|listlines|listvars|menu|mouseclick|mouseclickdrag|mousegetpos|mousemove|msgbox|onexit|outputdebug|pause|pixelgetcolor|pixelsearch|postmessage|process|progress|random|regdelete|regread|regwrite|reload|run|runas|runwait|send|sendevent|sendinput|sendlevel|sendmessage|sendmode|sendplay|sendraw|setbatchlines|setcapslockstate|setcontroldelay|setdefaultmousespeed|setenv|setformat|setkeydelay|setmousedelay|setnumlockstate|setscrolllockstate|setstorecapslockmode|setregview|settimer|settitlematchmode|setwindelay|setworkingdir|shutdown|sleep|sort|soundbeep|soundget|soundgetwavevolume|soundplay|soundset|soundsetwavevolume|splashimage|splashtextoff|splashtexton|splitpath|statusbargettext|statusbarwait|stringcasesense|stringgetpos|stringleft|stringlen|stringlower|stringmid|stringreplace|stringright|stringsplit|stringtrimleft|stringtrimright|stringupper|suspend|sysget|thread|tooltip|transform|traytip|urldownloadtofile|winactivate|winactivatebottom|winclose|winget|wingetactivestats|wingetactivetitle|wingetclass|wingetpos|wingettext|wingettitle|winhide|winkill|winmaximize|winmenuselectitem|winminimize|winminimizeall|winminimizeallundo|winmove|winrestore|winset|winsettitle|winshow|winwait|winwaitactive|winwaitclose|winwaitnotactive)(?!\s*\:)\b/.test(trimmedText)) {

                        notHotkey = false
                    }
                }

            }

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

            // start of indentation addition
            // if (
            // purityText.includes("#if") ||
            // purityText.match(/#ifwinactive.*?\s/) ||
            // purityText.match(/#ifwinnotactive.*?\s/)
            // ) {
            // deep++
            // notDeep = false
            // }
            // if hotkey::
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

                const leftTrimmedText = trimmedText.trimStart()
                const leftTrimmedLen = leftTrimmedText.length

                var firstWord = ''
                //get first word, loop every char
                for (var i = 0; i < leftTrimmedLen; i++) {
                    //if not a letter, slice first word
                    if (!FormatProvider.commandChars.includes(leftTrimmedText[i])) {
                        firstWord = leftTrimmedText.slice(0, i)

                        break
                    }
                }

                for (const oneCommand of FormatProvider.oneCommandList) {
                    var isCommand = false
                    if (firstWord === oneCommand) {
                        isCommand = true
                    }
                    if (isCommand) {
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
