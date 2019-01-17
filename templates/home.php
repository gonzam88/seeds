<?php include_once("_strings.php" );

if($_GET["action"] == "deleteallmychildren" && $_GET["pass"] == "b3rN)7;/SScc8thd"){
    foreach ($page->children as $child) {
        $child->delete();
    }
}

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

  <title>paint irl</title>

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-132757042-1"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'UA-132757042-1');
    </script>


  <link rel="shortcut icon" type="image/png" href="<?php echo $config->urls->templates; ?>icon_mspaint.png"/>
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
            <div>

            </div>

                <!-- <?php $actual_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]"; ?>
                <iframe id="ytplayer" type="text/html" width="640" height="360"
            src="https://www.youtube.com/embed/15XEYd4wClk?autplay=1&feature=oembed&controls=0&hd=1&modestbranding=1&autohide=1&showinfo=0&enablejsapi=1"
            frameborder="0"/></iframe> -->
            <!-- <div id="ytplayerContainer"> -->
                <div id="ytmask">
                    <div id="ytplayer"></div>
                </div>

            <!-- </div> -->

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
