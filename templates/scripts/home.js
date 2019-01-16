$.cssHooks.backgroundColor = {
    get: function(elem) {
        if (elem.currentStyle)
            var bg = elem.currentStyle["backgroundColor"];
        else if (window.getComputedStyle)
            var bg = document.defaultView.getComputedStyle(elem,
                null).getPropertyValue("background-color");
        if (bg.search("rgb") == -1)
            return bg;
        else {
            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
        }
    }
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
     }
   },
  data: {
      nickname: ""
  }
})

var playersQueue = new Vue({
  el: '#playersQueue',
  data: {
    players: []
  }
})


var myp5, prev;
var nickname;
var ws;
var soyArtista = false;

function GetStatus(){
    ws.send(JSON.stringify({action:"status"}))
}

$(document).ready(function(){

    // socket connection
    var HOST = location.origin.replace(/^http/, 'ws')
    HOST = "ws://localhost:3000";

    ws = new WebSocket(HOST);

    // Connection opened
    ws.addEventListener('open', function (event) {
        //
    });
    ws.addEventListener('close', function (event) {
        $("#formulario").removeClass("hide");
    });
    ws.addEventListener('error', function (event) {
        $("#formulario").removeClass("hide");
    });
    // Listen for messages
    ws.addEventListener('message', function (event) {
        let data = JSON.parse(event.data)
        console.log("Server:", data);

        switch(data.action){
            case "queuelist":
                playersQueue.players = data.players
            break;

            case "sosartista":
                StartArtistTime()
            break;

            case "linestart":
            break;

            case "vertex":
            break;

            case "lineend":
            break;
        }

    });

    // start
    // Cargo el nombre ya guardado
    if(localStorage.getItem("nickname")){
        login.nickname = localStorage.getItem("nickname");
        login.changed();
    }

    $("#comenzar").click(function(){
        localStorage.setItem("nickname", login.nickname);
        $("#formulario").addClass("hide");

        let logInData = {
            action: "login",
            nickname: login.nickname
        };
        logInData = JSON.stringify(logInData);
        if(!ws) return;
        ws.send(logInData);
    });


    prev = $.get("children",function( data ) {
        prev = data;
        // console.log(prev);
        myp5 = new p5(sketch); // instancia del sketch. La unica que voy a necesitar.
    });


})

function StartArtistTime(){
    console.log("Ahora dibujo yo");
    soyArtista = true;
    $("canvas:hover").css("cursor","crosshair");
}

function EndArtistTime(){
    console.log("Terminé mi dibujo")
    soyArtista = false;
    $("canvas:hover").css("cursor","wait")
}


window.addEventListener("resize", onResize);

var safeArea;
var squareSide;
var myCanvas;
var isSetup = true;


function onResize(){
    let safeWidth = safeArea.width();
    let safeHeight = safeArea.height();

    if(safeWidth > safeHeight){
        squareSide = safeHeight;
    }else{
        squareSide = safeWidth;
    }

    if(!isSetup){
        myCanvas.css("width", squareSide);
        myCanvas.css("height", squareSide);
    }
    isSetup = false;
}

var difx, dify;

var sketch = function( p ) {

  p.setup = function() {
      console.log("p5 started");
      safeArea = $("#safe-area");

      onResize();

      tile = p.createCanvas(squareSide, squareSide);
      tile.id('tile');
      tile.parent("safe-area");
      myCanvas = $('#tile');

      p.background(255)
      p.scale(0.2,0.2);

  };

  var cnt = 0;
  var prevX, prevY;
  p.puntos = [];
  var isDrawing = false;
  var hasDrawn = false;
  var startInk = 500;
  var ink = startInk;

  p.lineas = []
  var newLine = false;

  p.draw = function() {

      // Mi dibujo
      if(!soyArtista) return;
      p.stroke(0);
      p.strokeWeight(1)

      var mouseXoff = p.mouseX - 5;
      var mouseYoff = p.mouseY - 5;

      if (p.mouseIsPressed === true && !hasDrawn) {

        // if(!isDrawing){
        let startVec = p.createVector(mouseXoff, mouseYoff);
        let centerVec = p.createVector(squareSide/2, squareSide/2);
        let dist  = startVec.dist(centerVec);
        //if(dist>5) return;

        p.startTime = new Date().getTime();

        // }
        isDrawing = true;
        $("#starthere").hide();

        if(mouseXoff != prevX || mouseYoff != prevY){
            if(mouseXoff > 0 && mouseXoff < squareSide && mouseYoff > 0 && mouseYoff < squareSide){
                if(ink > 0){
                    if(newLine){
                        ws.send(JSON.stringify({action:"linestart", x:mouseXoff, y: mouseYoff}))
                        p.lineas.push([])
                        newLine = false;
                    }else{
                        ws.send(JSON.stringify({action:"vertex", x:mouseXoff, y: mouseYoff}))
                        p.lineas[p.lineas.length-1].push([mouseXoff, mouseYoff]);
                        p.line(mouseXoff, mouseYoff, prevX, prevY);
                    }

                    // console.log(p.lineas)


                    //p.puntos.push( [mouseXoff, mouseYoff]);
                    // console.log(puntos);


                    prevX = mouseXoff;
                    prevY = mouseYoff;
                    ink--;
                    // hslBgColor.l = p.map(ink, 0,startInk,0, startLightness);
                    // let colorString = `hsl(${hslBgColor.h},${hslBgColor.s}%,${hslBgColor.l}%)`;
                    // $("body").css("background-color", colorString);
                }else{
                    if(!hasDrawn){
                        //EndDrawing();
                        hasDrawn = true;
                    }

                }
            }
        }
    }else{
        if(!newLine){
            newLine = true;
            ws.send(JSON.stringify({action:"lineend"}))
        }

        // if(isDrawing && !hasDrawn){
        //     EndDrawing();
        //     hasDrawn  = true;
        //     isDrawing = false;
        // }
    }

  };
};


function EndDrawing(){
    isDrawing = false;
    hasDrawn = true;

    let endTime = new Date().getTime();
    let elapsedTime =  endTime - myp5.startTime;
    elapsedTime /= 1000;

    $(".formulario-final").removeClass('hide');
    $(".isitok").show();
    $(".signyourwork").hide();
    document.getSelection().removeAllRanges(); // esto deselecciona todo lo que este seleccionado

    $("#itsnotok").click(function(){
        location.reload();
    })

    $("#itsok").click(function(){
        $(".isitok").hide();
        $(".signyourwork").show();

        $("#userName").keyup(function(){
            let count = $(this).val().length;
            if(count > 2){
                $("#savework").prop("disabled", false);

            }else{
                $("#savework").prop("disabled", true);
            }
        })
        let hasSent = false;

        $("#savework").click(function(){
            if(hasSent) return;
            hasSent = true;

            console.log("saving");
            $.post( window.location, {
                action      : "newtile",
                userName    : $("#userName").val(),
                elapsedTime : elapsedTime,
                offsetx     : difx,
                offsety     : dify,
                puntos      : JSON.stringify(myp5.puntos)

            }).done(function( data ) {
                  console.log( data );
                  if(data.status == "ok"){
                      location.reload();
                  }
            });

        })
    })
}



function mousePressed () {
  cnt++;
  return false;
}

function touchStarted(){
  return false;
}

function hexToHSL(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    r = parseInt(result[1], 16);
    g = parseInt(result[2], 16);
    b = parseInt(result[3], 16);
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min){
      h = s = 0; // achromatic
    }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
  var HSL = new Object();
  HSL['h']=h;
  HSL['s']=s;
  HSL['l']=l;
  return HSL;
}
