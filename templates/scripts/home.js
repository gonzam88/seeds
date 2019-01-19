// paper js install


var debug = false;
function p(txt){
    if(debug){
        console.log(txt)
    }
}

// YT Control
var player;

// This code loads the IFrame Player API code asynchronously. This is the Youtube-recommended script loading method
function InitYoutubeAPI(){
    var tag = document.createElement("script");
    tag.src = "https://youtube.com/iframe_api";
    tag.id = "youtubeScript";
    var firstScriptTag = document.getElementsByTagName("script")[1];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}


// Create youtube player (function called by YouTube API)
function onYouTubeIframeAPIReady() {
    let myvideoid = clientOptions.videoId || "";

    player = new YT.Player("ytplayer", {
        width: "640",
        videoId: myvideoid,
        playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            fs: 0,
            showinfo: 0,
            modestbranding: 1
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}
// Player ready handler. Autoplay video when player is ready
function onPlayerReady(event) {


    player.playVideo()
    player.mute();
    //player.setPlaybackRate(rate - 0.25);
    //player.setVolume(volume + 5);
    //player.pauseVideo(); });
    //player.stopVideo();
}

// Video state change handler.
function onPlayerStateChange(event) {

}
function YouTubeGetID(url){
  var ID = '';
  url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if(url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  }
  else {
    ID = url;
  }
    return ID;
}

var login = new Vue({
  el: '#formulario',
  methods:{
     changed: function(evt){
         let count = this.nickname.length;
         if(count > 3){
             $("#comenzar").prop("disabled", false);
         }else{
             $("#comenzar").prop("disabled", true);
         }
     },
     triggerComenzar: function(evt){
         $("#comenzar").click();
     }
   },
  data: {
      nickname: ""
  }
})

var playersQueue = new Vue({
    el: '#playersQueue',
    data: {
        myId: "",
        artist: "",
        players: []
    },
    computed: {
        isitme: function(){
            return "soyyo"
        }
    }
})

var myp5, prev;
var myid, nickname, queuePos;
var ws;
var soyArtista = false;
var playersPaths;

var totalInk, currArtistInk;
var clientOptions;

function GetStatus(){
    ws.send(JSON.stringify({action:"status"}))
}

function TerminarDibujo(){
    if(soyArtista && ws.readyState === ws.OPEN){
        ws.send(JSON.stringify({action:"terminarDibujo"}))
        EndArtistTime()
    }
}

$(document).ready(function(){
    // start
    // Cargo el nombre ya guardado
    if(localStorage.getItem("nickname")){
        login.nickname = localStorage.getItem("nickname");
        login.changed();
    }

    var HOST;
    if(location.origin == "https://paint.coso.cloud"){
        HOST = "wss://paintirl-server.herokuapp.com";
    }else{
        HOST = "ws://localhost:3000";
        debug = true;
    }

    ws = new WebSocket(HOST);
    // Connection opened
    ws.addEventListener('open', function (event) {
        ws.send(JSON.stringify({action: "getClientOptions"}));
        //$("#formulario").addClass("hide");
    });
    ws.addEventListener('close', function (event) {
        $("#formulario").removeClass("hide");
    });
    ws.addEventListener('error', function (event) {
        $("#formulario").removeClass("hide");
        // Show & hide error
        $(".conectionError").addClass("visible").delay(1000).queue(function(next){
            $(this).removeClass('visible');
            next();
        });
        //p("Error", event)
    });
    // Listen for messages
    ws.addEventListener('message', function (event) {
        let data = JSON.parse(event.data)

        switch(data.action){
            case "login":
                myid = data.id;
                playersQueue.myId = data.id;
                with(paper){
                    for(let i = 0; i < data.playersLines.length; i++){
                        let path = new Path();
                        path.strokeColor = "color"
                        playersPaths.addChild(path);
                        for(let j = 0; j < data.playersLines[i].length; j++){
                            let _x = data.playersLines[i][j][0] * 800; // 800 es el tamaño inicial del canvas. de ahi escala para arriba y para abajo
                            let _y = data.playersLines[i][j][1] * 800;
                            path.add( new Point(_x, _y) );
                        }
                    }
                }
                totalInk = data.totalInk;

                localStorage.setItem("nickname", login.nickname);
                $("#formulario").addClass("hide");
                $("#restart").addClass("hide");
            break;
            case "clientOptions":
                clientOptions = data.clientOptions;

                if(player !== undefined){
                    let currYtId = YouTubeGetID(player.getVideoUrl());
                    if(clientOptions.videoId != currYtId){
                        player.loadVideoById(clientOptions.videoId);
                    }
                }else{
                    InitYoutubeAPI();
                }
                $("#ytplayer").css("transform",`scale(${clientOptions.videoScale})`)


            break;
            case "queuelist":
                for(let i = 0; i < data.players.length; i++){
                    if(data.players[i][1] == myid) data.players[i].push("soyyo")
                    queuePos = i+1;
                }
                if(data.artist[1] == myid ) data.artist.push("soyyo")
                playersQueue.players = data.players
                playersQueue.artist = data.artist
            break;

            case "sosartista":
                StartArtistTime()
            break;
            case "stopartista":
                EndArtistTime()
            break;

            case "linestart":
                with(paper){
                    let path = new Path();
                    let _x = data.x * 800; // 800 es el tamaño inicial del canvas. de ahi escala para arriba y para abajo
                    let _y = data.y * 800;
                    path.add( new Point(_x, _y) );
                    playersPaths.addChild(path);
                }

            break;

            case "vertex":
                currArtistInk = data.ink;
                if(soyArtista){
                    if(currArtistInk <= 0){EndArtistTime();}
                }else{
                    with(paper){
                        let _x = data.x * 800;
                        let _y = data.y * 800;
                        let p = new Point(_x, _y);
                        if(p !== null){
                            playersPaths.lastChild.add(p);
                        }
                    }
                }
            break;

            case "lineend":
            break;

            case "borrarLineas":
                let cuantas = data.cuantas;
                for(let i = 0; i < cuantas; i++){
                    if(playersPaths.children.length.length > 1){ // dejo el primer lugar con uno vacio para evitar un bug raro
                        playersPaths.firstChild.firstSegment.remove() // Borro el primer punto de la primer linea
                    }
                }
            break;

            case "borrarDibujo":
                playersPaths.removeChildren()
            break;
        }
    });

    $("#comenzar").click(function(){
        // socket connection
        if (ws.readyState === ws.OPEN) {
            let msg = {
                action: "login",
                nickname: login.nickname,
                role: "player"
            };
            ws.send(JSON.stringify(msg));
        }
    });

    $("#restart a").click(function(){
        // socket connection
        if (ws.readyState === ws.OPEN) {
            let msg = {
                action: "login",
                nickname: login.nickname
            };
            ws.send(JSON.stringify(msg));
        }
    })


    prev = $.get("children",function( data ) {
        prev = data;
        // p(prev);
        // myp5 = new p5(sketch); // instancia del sketch. La unica que voy a necesitar.
    });
})

function StartArtistTime(){
    p("Ahora dibujo yo");
    soyArtista = true;
    $("canvas:hover").css("cursor","crosshair");
    $("body").addClass("soyArtista");

    $("#tuturno").addClass("visible").delay(2000).queue(function(next){
        $(this).removeClass('visible');
        next();
    });
}

function EndArtistTime(){
    p("Terminé mi dibujo")
    soyArtista = false;
    $("#restart").removeClass("hide");
    $("body").removeClass("soyArtista");
    startedDrawing = false;
}


window.addEventListener("resize", onResize);

var safeArea;
var squareSide;
var myCanvas;
var isSetup = true;

var canvasInnerSize; // Este es responsive. Cambia cuando cambio el tamaño del documento. Lo uso para normalizar la posicion del mouse
var initialCanvasSize; // TODO: borrar

var mXpos; // Mouse relative to canvas
var mYpos;
var canvas;

function onResize(){
    let safeWidth = safeArea.width();
    let safeHeight = safeArea.height();

    if(safeWidth > safeHeight){
        squareSide = safeHeight;
    }else{
        squareSide = safeWidth;
    }


    $(canvas).css("width", squareSide);
    $(canvas).css("height", squareSide);

    // YT Player
    $("#ytmask").css("width",squareSide+5);
    $("#ytmask").css("height",squareSide);

    canvasInnerSize = $("canvas").innerWidth();
    isSetup = false;
}


var startedDrawing = false;


window.onload = function() {
    canvas = document.getElementById('tile');
    paper.setup(canvas);





    safeArea = $("#safe-area");

    onResize();
    canvasInnerSize = $("canvas").innerWidth();

    function findObjectCoords(mouseEvent)
    {
      var obj = document.getElementById("tile");
      var obj_left = 0;
      var obj_top = 0;

      while (obj.offsetParent)
      {
        obj_left += obj.offsetLeft;
        obj_top += obj.offsetTop;
        obj = obj.offsetParent;
      }
      if (mouseEvent)
      {
        //FireFox
        mXpos = mouseEvent.pageX;
        mYpos = mouseEvent.pageY;
      }
      else
      {
        //IE
        mXpos = window.event.x + document.body.scrollLeft - 2;
        mYpos = window.event.y + document.body.scrollTop - 2;
      }
      mXpos -= obj_left;
      mYpos -= obj_top;
      // document.getElementById("objectCoords").innerHTML = mXpos + ", " + mYpos;
      //p(mXpos, mYpos)
    }
    document.getElementById("tile").onmousemove = findObjectCoords;

    with(paper){

        playersPaths = new Group();
        playersPaths.style = {
            strokeColor: '#000000',
        	strokeWidth: 100,
            strokeCap : 'round',
            strokeJoin : 'round',
        }
        playersPaths.strokeWidth = 10;
        let p = new Path();
        playersPaths.addChild(p); // hack raro para evitar un error

        var tool = new Tool();
        tool.minDistance = 10;
        var lineas = [];
        var prevX, prevY;
        var newLine = false;

        tool.onMouseDown = function(event) {
            if(soyArtista){
                if(!startedDrawing){
                    startedDrawing = false;
                }
            }
        }

        tool.onMouseDrag = function(event) {
            // Add a point to the path every time the mouse is dragged
            if(soyArtista){
                if(!startedDrawing){
                    p.startTime = new Date().getTime();
                    startedDrawing = true;
                }

                // Mouse position. Normalized 0 <-> 1
                var normalX = map(mXpos, 0, canvasInnerSize, 0, 1)
                var normalY = map(mYpos, 0, canvasInnerSize, 0, 1)

                if(normalX != prevX || normalY != prevY){
                    // Evito dibujar si el mouse no se movio
                    let decimalDetail = 8;
                    if(newLine){
                        ws.send(JSON.stringify({action:"linestart", x:normalX.toFixed(decimalDetail), y: normalY.toFixed(decimalDetail)}))
                        // lineas.push([])
                        // playersLines.push([])
                        newLine = false;
                    }else{
                        ws.send(JSON.stringify({action:"vertex", x:normalX.toFixed(decimalDetail), y: normalY.toFixed(decimalDetail)}))
                        // lineas[lineas.length-1].push([normalX, normalY]);
                        // playersLines[playersLines.length-1].push([normalX, normalY]);
                    }
                    prevX = normalX;
                    prevY = normalY;
                } // if(normalX != prevX || normalY != prevY)
            }
        }

        tool.onMouseUp = function(event){
            newLine = true;
            ws.send(JSON.stringify({action:"lineend"}))
        }
    }

}




var sketch = function( p ) {

  var cnt = 0;
  var prevX, prevY;
  p.puntos = [];
  var startedDrawing = false;
  var hasDrawn = false;
  var startInk = 9999500; // TODO server side
  var ink = startInk;
  var linesDetail = 8; // Menos es màs detalle y más puntos

  p.lineas = []
  var newLine = false;

  p.draw = function() {

      // Calculos de mi dibujo
      if(soyArtista){
          var normalX = p.map(mXpos, 0, canvasInnerSize, 0, 1)
          var normalY = p.map(mYpos, 0, canvasInnerSize, 0, 1)

          if (p.mouseIsPressed === true && !hasDrawn) {

            if(!startedDrawing){
                p.startTime = new Date().getTime();
                startedDrawing = true;
            }
            let newPosVec = p.createVector(normalX, normalY);
            let oldPosVec = p.createVector(prevX, prevY);
            let movement  = newPosVec.dist(oldPosVec);
            if(movement < linesDetail){
                // Evito dibujar si el movimiento es poco
                if(normalX != prevX || normalY != prevY){
                    // Evito dibujar si el mouse no se movio
                    if(ink > 0){
                        let decimalDetail = 8;
                        if(newLine){
                            ws.send(JSON.stringify({action:"linestart", x:normalX.toFixed(decimalDetail), y: normalY.toFixed(decimalDetail)}))
                            p.lineas.push([])
                            // playersLines.push([])
                            newLine = false;
                        }else{
                            ws.send(JSON.stringify({action:"vertex", x:normalX.toFixed(decimalDetail), y: normalY.toFixed(decimalDetail)}))
                            p.lineas[p.lineas.length-1].push([normalX, normalY]);
                            // playersLines[playersLines.length-1].push([normalX, normalY]);
                        }
                        prevX = normalX;
                        prevY = normalY;
                        ink--;

                    }else{
                        if(!hasDrawn){
                            hasDrawn = true;
                        }
                    }
                }
            } // lines detail
        }else{
            if(!newLine){
                newLine = true;
                ws.send(JSON.stringify({action:"lineend"}))
            }

        }
    } // if soy artista

    //
    // RENDERS
    p.clear();

    // Render mi Dibujo
    p.stroke("#43c585");
    p.strokeWeight(1);
    if(p.lineas.length > 0){
        for(let i = 0; i < p.lineas.length; i++){
            for(let j = 0; j < p.lineas[i].length-1; j++){
                p.line(
                    p.lineas[i][j][0] * initialCanvasSize,  // x1
                    p.lineas[i][j][1] * initialCanvasSize,  // y1
                    p.lineas[i][j+1][0] * initialCanvasSize,// x2
                    p.lineas[i][j+1][1] * initialCanvasSize,// y2
                );
            }
        }
    }

    // Render Dibujos de los otros
    p.stroke(0);
    p.strokeWeight(p.map(initialCanvasSize, 100, 1000, 1, 3))
    // if(playersLines.length > 0){
    //     for(let i = 0; i < playersLines.length; i++){
    //         // Linea
    //         for(let j = 0; j < playersLines[i].length-1; j++){
    //             p.line(
    //               playersLines[i][j][0] * initialCanvasSize,    // x1
    //               playersLines[i][j][1] * initialCanvasSize,    // y2
    //               playersLines[i][j+1][0] * initialCanvasSize,  // x2
    //               playersLines[i][j+1][1] * initialCanvasSize,  // y2
    //             );
    //         }
    //     }
    // }



    // Render linea de tinta
    p.fill(0, 0, 0, 160);
    p.stroke(00, 0, 0);
    let inkBarWidth = p.map(currArtistInk,0,totalInk,0, initialCanvasSize)
    p.rect(0, .98 * initialCanvasSize, inkBarWidth, .2*initialCanvasSize)


    }; // p.draw
}; // sketch

function GuardarDibujoEnServer(){
    let endTime = new Date().getTime();
    let elapsedTime =  endTime - myp5.startTime;
    elapsedTime /= 1000;

    p("saving to server");
    $.post( window.location, {
        action      : "newtile",
        userName    : nickname,
        elapsedTime : elapsedTime,
        puntos      : JSON.stringify(JSON.stringify(myp5.puntos))

    }).done(function( data ) {
          p( data );
          if(data.status == "ok"){
              location.reload();
          }
    });
}

function map(x, in_min, in_max, out_min, out_max)
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function mousePressed () {
  cnt++;
  return false;
}

function touchStarted(){
  return false;
}
