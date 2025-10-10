## events to make:

    DOMContent.onLoad {
        ---> when only DOM loads, disregarding content, only DOM.
    }

    onSing.click {
        ---> when clicked, do smthg                #DONE
    }

    onDbl.click {
        ---> when double clicked, do smthg         #DONE
    }

    onHold.click {
        ---> when holding lmb, do smthg            #DONE
    }


# on( Sing/Dbl ).click # event special functions:

    emerge(initial state, final state, auxiliar function) ---> start at display: none, transits to display: block, while auxiliar function animates, those functions can be 
    fall() / rise() / etc.



## next text functions: 

    shake(direction, intesity, duration) ---> shake text, can be directioned to 'sideways' / 'cocktail-shaker' / 'seesaw'

    shiver(duration) ---> shiver text, can apply only duration



## next color functions:

    camellionCamo(original color, final color, duration) ---> color change inner outer 

    octopusCamo(original color, final color, duration) ---> color change outer inner

    paint(direction, original color, final color, duration) ---> color change depends on direction, can be 'left' / 'right' / 'top' / 'bottom'

    ----> background-color can use same functions as color can, keep in mind that it is a syntaxe purpose only.



## new radius functions:

    suddenChange(initial background-radius, final background-radius, duration) ---> changes from initial radius to final radius



## new gap functions: 

    bloomGap(initial gap, final gap, duration) ---> transitate from initial gap to final gap in a certain duration

    stagedGapColumn(column gap, row gap, duration) ---> column gap transits first, then row gap 

    stagedGapRow(row gap, column gap, duration) ---> row gap transits first, then column gap.



## new weight functions:

    skinny(scale, duration) ---> multiplies weight by scale 

    heavy(scale, duration) ---> divides weight by scale