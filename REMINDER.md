## new root async event CSScript :
- Usualy used to declare constants when a certain animation is used too many times. 

    -- declareting ::

        @async {
            root.Event {
                proposeValue(--rejection-animation) {
                    text: shake(sideways, 0.75px, 600);
                    color: fadeColor( #ff0000, 500);
                };
            }
        }


    -- using ::

        h1 {
            when.Disabled {
                value: searchValue(--rejection-animation);
            }
        }



## events to make:

    hide.onScroll {
        ---> hide from scroll when not seen                  
    }

    DOMContent.onLoad {
        ---> when only DOM loads, disregarding content, only DOM.              #DONE
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

    onFocus.hold {
        ---> when focusing on smthg, like 'Tab', do some other thing
    }

    onSelection.hold {
        ---> when u click and move mouse so can create a blue outline, do smthg about it
    }

    when.Target {
        ---> when target by a link or anchor, do smthg
    }

    when.Check {
        ---> checkbox like when cheked, do stmg
    }

    when.Disabled {
        ---> when disabled, do smthg
    }

    when.Enabled {
        ---> when enabled, do smthg
    }



# on( Sing/Dbl/Hold ).click 
## event special functions:

    create(initial state, final state, auxiliar function) ---> start at display: none, transits to display: block, while auxiliar function animates, those functions can be 
    fall() / rise() / etc. Used to create opeennable menus.



## next text functions: 

    shake(direction, intensity, duration) ---> shake text, can be directioned to 'sideways' / 'cocktail-shaker' / 'seesaw'                        #DONE

    shiver(intensity, duration) ---> shiver text, can apply intensity and duration                                                                 



## next color functions:

    chameleonCamo(original color, final color, duration) ---> color change inner outer                               #DONE       

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



## new message property functions:
    
    alert("Message written here", duration) ---> creates a message innerHtml with a certain duration



## new brightness property functions:

    eclipseHalo(intensity, duration) ---> creates an brilliant light surrounding the text

    neon(set color, direction, intensity) ---> creates a neon color



## new request property functions:

    callBack(no parameter) ---> aways before any animation. If animation done once, it will do the reverse of it when called again. Don't work in events like DOMContent.onLoad and window.onLoad

    callDismiss(no parameter) ---> allows animation to happen one time. Don't work in events like DOMContent.onLoad and window.onLoad



## new value property functions:

    proposeValue(root variable) ---> set value to a variable

    searchValue(root variable) ---> uses variable value