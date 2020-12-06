;this hotkey isn't indented
#if (true)
    f1::
        sleep, 100
    return
    f1::
        sleep, 100
    return

#if (true)

    f1::
        sleep, 100
    return
    f1::
        sleep, 100
    return

#if winactive("A")
    f1::
        sleep, 100
    return
    f1::
        sleep, 100
    return

#if winactive("A")

    f1:
        ;when there's a newline between, it indents
        sleep, 100
    return
    f1::
        sleep, 100
    return