import { parseAnimString } from "../basics.js";
import { textAnimations } from "../anim/catalog/text/textAnimations.js";
import { colorAnimations } from "../anim/catalog/color/colorAnimations.js";

const animations = {
  textAnimations,
  colorAnimations,
}

export function runActionOnElements(selector, action) {
  const els = document.querySelectorAll(selector);
  if (!els.length) {
    console.debug('[CSScript] nenhum elemento encontrado para selector:', selector);
    return;
  }

  const anims = [];
    let current = '';
    let depth = 0;
    
    for (const char of action.value) {
      if (char === '(') depth++;
      else if (char === ')') depth--;
      if (char === ',' && depth === 0) {
        anims.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    let selected = '';
    switch (action) {
      case fall || rise || fadeIn || fadeOut || slideIn || slideOut || pop || implode || shake || shiver: 
        selected = textAnimations;
        break;
      case paint || fadeColor || octopusCamo || chameleonCamo:
        selected = colorAnimations;
        break;
    }

    if (current.trim()) anims.push(current.trim());

    for (const el of els) {
      for (const anim of anims) {
        const animInfo = parseAnimString(anim);
        const fn = animations.selected[animInfo.name];

      // Verifica compatibilidade por tipo
        const propType = action.prop.toLowerCase();

        if (!fn) {
          console.warn(`[CSScript] animação desconhecida: ${animInfo.name}`);
          continue;
        }

      // Filtra por tipo de propriedade
        if (
          (propType === 'request' && ['callBack', 'callDismiss'].includes(animInfo.name)) ||
          (propType === 'text' && ['fall', 'rise', 'slideIn', 'slideOut', 'fadeIn', 'fadeOut', 'pop', 'implode', 'shake', 'shiver'].includes(animInfo.name)) ||
          (propType === 'color' && ['paint', 'fadeColor', 'chameleonCamo', 'octopusCamo'].includes(animInfo.name)) ||
          (propType === 'background-color' && ['paint', 'fadeColor', 'chameleonCamo', 'octopusCamo'].includes(animInfo.name)) ||
          (propType === 'value' && ['searchValue'].includes(animInfo.name))
          //(propType === 'radius' && ['suddenChange'].includes(animInfo.name)) ||
          //(propType === 'gap' && ['bloomGap', 'stagedGapColumn', 'stagedGapRow'].includes(animInfo.name)) ||
          //(propType === 'weight' && ['skinny', 'heavy'].includes(animInfo.name)) 
        ) {
          fn(el, animInfo.arg);
        } else {
          console.warn(`[CSScript] animação '${animInfo.name}' não é compatível com a propriedade '${propType}'.`);
        }
      }
    }

    window.addEventListener('reveal.onScroll', (e) => {
      if (!e.detail.visible) return; // só dispara quando aparece

      const rules = cssRules['reveal.onScroll'];
      if (!rules) return;

      for (const { selector, actions } of rules) {
        runActionOnElements(selector, actions);
      }
    });
}