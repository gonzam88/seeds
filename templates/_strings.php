<?php
function _t($label) {
  static $labels = null;
  if($labels === null) $labels = array(
    'make a drawing'        => 'hace un dibujo',
    'keep the chain going'  => 'seguí la cadena',
    'generate seeds'        => 'generá semillas',
    '<- start here'         => '<- empezá acá',
    'sign your work'        => 'firmá tu obra',
    'is it ok now?'         => 'te parece bien?',
    'save'                  => 'guardar',
    'yes'                   => 'si'
  );
  echo isset($labels[$label]) ? $labels[$label] : $label;
}


?>
