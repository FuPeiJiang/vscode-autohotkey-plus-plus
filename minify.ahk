#NoEnv ; Recommended for performance and compatibility with future AutoHotkey releases.
#SingleInstance, force
SendMode Input ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir% ; Ensures a consistent starting directory.

loop, files, out\*.js, R
{
    ; Run, npx google-closure-compiler --language_in ECMASCRIPT_2019 --language_out ECMASCRIPT_2019 --js out/**.js
    ; Run, where npx

    ; cmd=%ComSpec% /c npx google-closure-compiler --compilation_level ADVANCED --language_in ECMASCRIPT_2019 --language_out ECMASCRIPT_2019 --js "%A_LoopFileLongPath%" --js_output_file "%A_LoopFileLongPath%"
    cmd=npx google-closure-compiler --compilation_level ADVANCED --language_in ECMASCRIPT_2019 --language_out ECMASCRIPT_2019 --js "%A_LoopFileLongPath%" --js_output_file "%A_LoopFileLongPath%"
    ; cmd=npx google-closure-compiler --language_in ECMASCRIPT_2019 --language_out ECMASCRIPT_2019 --js "%A_LoopFileLongPath%" --js_output_file "%A_LoopFileLongPath%"
    clipboard:=cmd
    p(cmd)
    ; p(RunCMD(cmd))
    ; RunCMD(cmd)
    ; Run,%cmd%
    Run,%ComSpec% /c %cmd%
}
SoundPlay, *-1
sleep, 1000
SoundPlay, *-1
exitapp

f3::Exitapp