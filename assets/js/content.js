// Wählt das aktive Inhalts-Pack anhand von <html data-app="…">.
// 'freeletics' (Standard) nutzt die eingebauten Defaults (exercises.js); 'vital'
// lädt das sanfte Vital-Pack (Reha-/Bewegungsübungen). Beide Apps teilen sich
// eine Engine.
import * as vital from './content/vital.js';

const raw = (typeof document !== 'undefined' && document.documentElement.getAttribute('data-app')) || 'freeletics';
export const APP_ID = raw === 'vital' ? 'vital' : 'freeletics';
// Freeletics = leeres Pack -> Engine/Store fallen auf die eingebauten Defaults zurück.
export const PACK = APP_ID === 'vital' ? vital : {};
