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

// Blank
var myp5, prev;

$(document).ready(function(){
    prev = $.get("prev",function( data ) {
        data.puntos = JSON.parse( data.puntos );
        prev = data;
        // console.log(prev);
        myp5 = new p5(sketch); // instancia del sketch. La unica que voy a necesitar.
    });
})

window.addEventListener("resize", onResize);

var safeArea;
var squareSide;
var myCanvas;
var isSetup = true;
var bgColor = $("body").css("background-color");
var hslBgColor = hexToHSL(bgColor);
hslBgColor.h *= 360;
hslBgColor.s *= 100;
hslBgColor.l *= 100;
var startLightness = hslBgColor.l;

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

var difx = 0;
var dify = 0;

var sketch = function( p ) {

  p.setup = function() {
      console.log("p5 started");
      safeArea = $("#safe-area");

      onResize();

      tile = p.createCanvas(squareSide, squareSide);
      tile.id('tile');
      tile.parent("safe-area");
      myCanvas = $('#tile');

      p.background(255);

      // Dibujo el tile anterior.
      // Pero lo ubico de forma que el ultimo punto quede en el medio
      if(prev.puntos.length>0){
          let lastPoint = prev.puntos[prev.puntos.length-1];
          difx =  (squareSide/2) -lastPoint[0];
          dify = (squareSide/2) -  lastPoint[1];
          p.translate(difx, dify);

          for(let i = 0; i < prev.puntos.length-1; i++){
              p.stroke(230);
              p.line(
                prev.puntos[i][0],prev.puntos[i][1],
                prev.puntos[i+1][0],prev.puntos[i+1][1],
              );
          }
          p.resetMatrix();


      }
      p.stroke(0);
      p.fill(0);
      p.ellipse(squareSide/2,squareSide/2,4);


  };

  var cnt = 0;
  var prevX, prevY;
  p.puntos = [];
  var isDrawing = false;
  var hasDrawn = false;
  var startInk = 400;
  var ink = startInk;


  p.draw = function() {

    p.stroke(0);
    p.strokeWeight(1)

    var mouseXoff = p.mouseX - 5;
    var mouseYoff = p.mouseY - 5;

    if (p.mouseIsPressed === true && !hasDrawn) {
        if(!isDrawing){
            let startVec = p.createVector(mouseXoff, mouseYoff);
            let centerVec = p.createVector(squareSide/2, squareSide/2);
            let dist  = startVec.dist(centerVec);
            if(dist>5) return;

            p.startTime = new Date().getTime();
        }
        isDrawing = true;
        $("#starthere").hide();

        if(mouseXoff != prevX || mouseYoff != prevY){
            if(mouseXoff > 0 && mouseXoff < squareSide && mouseYoff > 0 && mouseYoff < squareSide){
                if(ink > 0){
                    p.puntos.push( [mouseXoff, mouseYoff]);
                    // console.log(puntos);
                    p.line(mouseXoff, mouseYoff, prevX, prevY);
                    prevX = mouseXoff;
                    prevY = mouseYoff;
                    ink--;



                }else{
                    if(!hasDrawn){
                        EndDrawing();
                        hasDrawn = true;
                    }

                }
            }
        }
    }else{
        if(isDrawing && !hasDrawn){
            EndDrawing();
            hasDrawn  = true;
            isDrawing = false;
        }
    };

    hslBgColor.l = p.map(ink, 0,startInk,0, startLightness);
    let colorString = `hsl(${hslBgColor.h},${hslBgColor.s}%,${hslBgColor.l}%)`;
    $("body").css("background-color", colorString);
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
                $("#comenzar").prop("disabled", false);

            }else{
                $("#comenzar").prop("disabled", true);
            }
        })
        let hasSent = false;

        $("#comenzar").click(function(){
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
