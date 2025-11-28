import { textAnimations } from "../catalog/text/textAnimations";
import {} from "../catalog/color/colorAnimations";

export function reverseAnimation(el, animName, arg) {
    switch (animName) {
      case 'fadeIn':
        textAnimations.fadeOut(el, arg);
        break;
      case 'fadeOut':
        textAnimations.fadeIn(el, arg);
        break;
      case 'slideIn':
        textAnimations.slideOut ? textAnimations.slideOut(el, arg) : console.warn("slideOut not found");
        break;
      case 'slideOut':
        textAnimations.slideIn ? textAnimations.slideIn(el, arg) : console.warn("slideIn not found");
        break;
      case 'rise':
        textAnimations.fall ? textAnimations.fall(el, arg) : console.warn("fall not found");
        break;
      case 'fall':
        textAnimations.rise ? textAnimations.rise(el, arg) : console.warn("rise not found");
        break;
      case 'pop':
        textAnimations.implode ? textAnimations.implode(el, arg) : console.warn("implode not found");
        break;
      case 'implode':
        textAnimations.pop ? textAnimations.pop(el, arg) : console.warn("pop not found");
        break;
      default:
        console.warn(`[CSScript] reversão não definida para ${animName}`);
    }
}