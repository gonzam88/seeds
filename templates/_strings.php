<?php
function _t($label) {
  static $labels = null;
  if($labels === null) $labels = array(
    'make a drawing'        => 'hacé un dibujo',
    'keep the chain going'  => 'seguí la cadena',
    'generate seeds'        => 'generá semillas',
    '<- start here'         => '<- empezá acá',
    'sign your work'        => 'firma',
    'sign'                  => 'firma',
    'is it ok now?'         => 'te parece bien?',
    'save'                  => 'guardar',
    'yes'                   => 'si',
    'draw'                 => 'dibujar',
    'your name'             => 'tu nombre'

  );
  echo isset($labels[$label]) ? $labels[$label] : $label;
}


?>
