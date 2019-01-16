<?php include_once("_strings.php" );


$seg = $input->urlSegment(1);
if($seg == "children"){
    $resp = array();
    $dibujo = $pages->find("template=dibujo")->last();
    if($dibujo->numChildren() > 0){

        $children = $dibujo->children();
        foreach ($children as $child) {
            $temp = array();
            $temp["puntos"] = $child->puntos;
            if($child->offsetx){
                $temp["offset"] = array($child->offsetx, $child->offsety);
            }else{
                $temp["offset"] = array(0,0);
            }
            $temp["userName"] = $child->title;
            $resp[] = $temp;
        }

        header('Content-Type: application/json');
        echo json_encode($resp, true);
        exit;
    }
}
?>

<html lang="en">
<head>
  <meta charset="utf-8">

  <title>GIMME SEEDS</title>
  <meta name="description" content="Storing Seeds From Drawings for Drawings">
  <meta name="author" content="gonzalo moiguer">

  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css?family=Space+Mono:400,700" rel="stylesheet">
  <link rel="stylesheet" href="<?php echo $config->urls->templates; ?>styles/main.css?v=1.0">

</head>

<body>

    <div id="container">
        <h1><?php _t("paint irl");?></h1>
        <!-- <h2><?php _t("keep the chain going");?></h2> -->

        <div id="safe-area">

        </div>

    </div>

    <div id="playersQueue">
        <div v-bind:class="artist[2] ">{{artist[0]}}</div>
        <ol start="2">
            <li v-for="player in players"  v-bind:class="player[2]">{{ player[0] }}</li>
        </ol>
    </div>

    <div id="restart" class="hide">
        <a title="<?php _t("start again") ?>" href="#"><i class="fas fa-undo-alt fa-2x"></i></a>
    </div>

    <div id="formulario">

        <div class="signyourwork">
            <h1><?php _t("paint irl");?></h1>
            <input id="userName" type="text" maxlength="12" v-model="nickname" placeholder="<?php _t("your name");?>" v-on:input="changed"/>
            <button id="comenzar" disabled><?php _t("draw");?></button>
            <div class="conectionError">
                <?php _t("connection error") ?>
            </div>
        </div>
    </div>


    <script src="<?php echo $config->urls->templates; ?>dependencies/jquery-3.1.1.min.js"></script>
    <script src="<?php echo $config->urls->templates; ?>dependencies/p5.min.js"></script>
    <!--VUE js production version, optimized for size and speed -->
    <script src="https://cdn.jsdelivr.net/npm/vue"></script>

    <script src="<?php echo $config->urls->templates; ?>scripts/home.js?v=1.0"></script>

</body>
</html>
