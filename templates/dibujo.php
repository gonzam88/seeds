<?php

// Delete all my children
// foreach ($page->children as $child) {
//     $child->delete();
// }

include_once("_strings.php" );


if ($_POST["action"] == "newtile") {

    $p = new Page(); // create new page object
    $p->template = 'tile'; // set template
    $p->parent = $page; // set the parent
    $p->name = uniqid(); // give it a name used in the url for the page
    $p->title       = $_POST["userName"];
    $p->elapsedTime = $_POST["elapsedTime"];
    $p->puntos      = $_POST["puntos"];
    $p->offsetx     = $_POST["offsetx"];
    $p->offsety     = $_POST["offsety"];
    $p->ip          = $_SERVER['REMOTE_ADDR'];
    $p->user_agent  = $_SERVER['HTTP_USER_AGENT'];

    $p->save();
    header('Content-Type: application/json');
    $resp["status"] = "ok";
    echo json_encode($resp, true);
    exit;
}

$seg = $input->urlSegment(1);
if($seg == "prev"){
    $resp = array();
    if($page->numChildren() > 0){

        $prev = $page->children()->last;
        $resp["puntos"] = $prev->puntos;
        if($prev->offsetx){
            $resp["offset"] = array($prev->offsetx, $prev->offsety);
        }else{
            $resp["offset"] = array(0,0);
        }
        $resp["userName"] = $prev->title;
    }else{
        $resp["puntos"] = "[]";
        $resp["offset"] = array(0,0);
        $resp["userName"] = "";
    }

    header('Content-Type: application/json');
    echo json_encode($resp, true);
    exit;
}


 ?>
<html lang="en">
<head>
  <meta charset="utf-8">

  <title>GIMME SEEDS</title>
  <meta name="description" content="Storing Seeds From Drawings for Drawings">
  <meta name="author" content="gonzalo moiguer">

  <link href="https://fonts.googleapis.com/css?family=Space+Mono" rel="stylesheet">
  <link rel="stylesheet" href="<?php echo $config->urls->templates; ?>styles/main.css?v=1.0">

</head>

<body>
    <div id="container">

        <h1><?php _t("make a drawing");?></h1>
        <h2><?php _t("keep the chain going");?></h2>
        <p><?php _t("generate seeds");?> <a href="#">(??)</a></p>

        <div id="safe-area">

        </div>
    </div>

    <div id="starthere"><?php _t("<- start here"); ?></div>

    <div class="formulario-final hide">

        <div class="isitok">
            <p><?php _t("is it ok now?");?></p>
            <button id="itsnotok"><?php _t("no");?></button><button id="itsok"><?php _t("yes");?></button>
        </div>

        <div class="signyourwork">
            <p><?php _t("sign your work");?></p>
            <input id="userName" type="text" maxlength="6"  />
            <button id="savework" disabled><?php _t("save");?></button>
        </div>
    </div>


    <script src="<?php echo $config->urls->templates; ?>dependencies/jquery-3.1.1.min.js"></script>
    <script src="<?php echo $config->urls->templates; ?>dependencies/p5.min.js"></script>
    <script src="<?php echo $config->urls->templates; ?>scripts/main.js?v=1.0"></script>

</body>
</html>
