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
    'draw'                  => 'dibujar',
    'your name'             => 'tu nombre',
    'connection error'      => 'error de conexión',
    'start again'           => 'volver a dibujar',
    'drawing now:'         => 'dibujando ahora:',
    'nobody´s<br />drawing 😭'  => 'nadie está<br /> dibujando 😭',
    'When it´s your turn, you can draw over video. Eventually, it will be drawn IRL'
    => 'Cuando sea tu turno, dibujá sobre el video. Eventualmente será dibujado IRL',
    'your turn!'            => 'tu turno!'

  );
  echo isset($labels[$label]) ? $labels[$label] : $label;
}


?>
