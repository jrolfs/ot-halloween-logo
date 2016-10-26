import $ from 'jquery';
import Combokeys from 'combokeys';


const combokeys = new Combokeys(document.documentElement);

const $main = $('#main');
const $earth = $('.dot-orbit.earth');
const $mars = $('.dot-orbit.mars');

function stopOrbit($element, className) {
  $element.one('animationiteration', () => {
    setTimeout(() => $main.removeClass(className), 0);
  });
}

combokeys.bind('e', () => $main.toggleClass('orbit-earth'));

combokeys.bind('alt+e', () => $earth.toggleClass('planet'));

combokeys.bind('E', () => stopOrbit($earth, 'orbit-earth'));

combokeys.bind('m', () => $main.toggleClass('orbit-mars'));

combokeys.bind('alt+m', () => $mars.toggleClass('planet'));

combokeys.bind('s m', () => $mars.toggleClass('visible'));

combokeys.bind('M', () => stopOrbit($mars, 'orbit-mars'));

combokeys.bind('c', () => $main.toggleClass('logo-complete'));
