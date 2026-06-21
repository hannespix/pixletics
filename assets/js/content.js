// Wählt das aktive Inhalts-Pack anhand von <html data-app="…">.
<<<<<<< HEAD
// 'freeletics' (Standard) nutzt die eingebauten Defaults (exercises.js); 'vital'
// lädt das sanfte Vital-Pack (Reha-/Bewegungsübungen). Beide Apps teilen sich
// eine Engine.
import * as vital from './content/vital.js';

const raw = (typeof document !== 'undefined' && document.documentElement.getAttribute('data-app')) || 'freeletics';
export const APP_ID = raw === 'vital' ? 'vital' : 'freeletics';
// Freeletics = leeres Pack -> Engine/Store fallen auf die eingebauten Defaults zurück.
export const PACK = APP_ID === 'vital' ? vital : {};
=======
// 'freeletics' (Standard) nutzt die eingebauten Defaults (exercises.js); 'onko'
// lädt das sanfte Onko-Sport-Pack. So teilen sich beide Apps eine Engine.
import * as onko from './content/onko.js';

const raw = (typeof document !== 'undefined' && document.documentElement.getAttribute('data-app')) || 'freeletics';
export const APP_ID = raw === 'onko' ? 'onko' : 'freeletics';
// Freeletics = leeres Pack -> Engine/Store fallen auf die eingebauten Defaults zurück.
export const PACK = APP_ID === 'onko' ? onko : {};
>>>>>>> origin/main
