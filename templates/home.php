<?php include_once("_strings.php" );?>
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
        <a href="dibujo1"><h1><?php _t("make a drawing");?></h1></a>
        <h2><?php _t("keep the chain going");?></h2>

    </div>


    <script src="<?php echo $config->urls->templates; ?>dependencies/jquery-3.1.1.min.js"></script>
    <script src="<?php echo $config->urls->templates; ?>dependencies/p5.min.js"></script>
    <script src="<?php echo $config->urls->templates; ?>scripts/home.js?v=1.0"></script>

</body>
</html>
