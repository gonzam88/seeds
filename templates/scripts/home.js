var debug = false;
function p(txt){
    if(debug){
        console.log(txt)
    }
}

var isLoaded = {
	_youtube: false,
	_video: false,
	_dom: false,
	_serverconf : false,
	set youtube(val){
		this._youtube = val;
		if(val){
			console.log("YouTube api ready");
			loadingVue.loadedElements++;
			this.IsEveryThingLoaded();
		}
	},
	get youtube(){
		return this._youtube;
	},
	set video(val){
		this._video = val;
		if(val){
			console.log("video loaded");
			loadingVue.loadedElements++;
			this.IsEveryThingLoaded();
		}
	},
	set dom(val){
		this._dom = val;
		if(val){
			console.log("dom ready");
			loadingVue.loadedElements++;
			this.IsEveryThingLoaded();
		}
	},
	set serverconf(val){
		console.log("server conf received");
		if(val){
			this._serverconf = val;
			loadingVue.loadedElements++;
			this.IsEveryThingLoaded();
		}
	},

	reset : function(){
		this._youtube = false
		this._video = false
		this._dom = false
		this._serverconf = false
	},
	_everyThingLoaded : false,

	IsEveryThingLoaded: function(){
		if(this._everyThingLoaded) return;
		if(this._youtube && this._video && this._dom && this._serverconf){
			console.log("Everything is loaded 🤖");
			$("#loadingUi").addClass("hide");
			this._everyThingLoaded = true;
		}
	}
}

var clientOptions;
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
	isLoaded.youtube = true;
	player = new YT.Player("ytplayer", {
        width: "640",
        videoId: clientOptions.videoId,
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
	player.mute();
    player.playVideo()

    //player.setPlaybackRate(rate - 0.25);
    //player.setVolume(volume + 5);
    //player.pauseVideo(); });
    //player.stopVideo();
}

// Video state change handler.
function onPlayerStateChange(event) {
	/** YouTube API
    -1 (unstarted)
    0 (ended)
    1 (playing)
    2 (paused)
    3 (buffering)
    5 (video cued)
	**/

	if(event.data == 3){
		// buffering
		loadingVue.loadedElements += 0.5; // es un chiste pero es verdad
	}
	if (event.data == 1) {
		// started playing
		isLoaded.video = true;
    }
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

var loadingVue = new Vue({
	el: '#loadingUi',
	data: {
		loadedElements: 0,
		totalElements: 4
	}
})

var prev;
var myid, nickname, queuePos;
var ws;
var soyArtista = false;
var playersPaths;
var myPaths;

var totalInk, currArtistInk;
var myInk;
var inkRect;


function GetStatus(){
    ws.send(JSON.stringify({action:"status"}))
}

function TerminarDibujo(){
    if(soyArtista && ws.readyState === ws.OPEN){
        ws.send(JSON.stringify({action:"terminarDibujo"}))
        EndArtistTime()
    }
}

function StartArtistTime(){
    p("Ahora dibujo yo");
    soyArtista = true;
	myInk = clientOptions.totalInk;
    $("canvas:hover").css("cursor","crosshair");
    $("body").addClass("soyArtista");
	inkRect.set({ size: [810,40] })

    $("#tuturno").addClass("visible").delay(2000).queue(function(next){
        $(this).removeClass('visible');
        next();
    });
}

function EndArtistTime(){
	if(!soyArtista) return; // Puede pasar que yo mismo determine que se me termino la tinta

    p("Terminé mi dibujo")
    soyArtista = false;
    $("#restart").removeClass("hide");
    $("body").removeClass("soyArtista");
    startedDrawing = false;
	inkRect.set({ size: [0,40] })
    //GuardarDibujoEnServer() // TODO Testear : 0
}


window.addEventListener("resize", onResize);

var safeArea;
var squareSide;
var canvasInnerSize; // Este es responsive. Cambia cuando cambio el tamaño del documento. Lo uso para normalizar la posicion del mouse
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
}

function ServerOff(){
	console.log("El servidor está apagado")
	$("#serverOff").removeClass("hide");
	// TODO Intentar reconectar cada 30s
}


var startedDrawing = false;
var startTime = true;

function InitSocket(){
	var HOST;
	if(location.origin == "https://paint.coso.cloud"){
        HOST = "wss://paint.coso.cloud/ws";
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
				isLoaded.serverconf = true;

				if(clientOptions.isServerOpen){
					$("#serverOff").addClass("hide");
				}else{
					ServerOff()
					return;
				}

				if(typeof player == "undefined"){
					InitYoutubeAPI();

				}else{
					let currYtId = YouTubeGetID(player.getVideoUrl());
					if(clientOptions.videoId != currYtId){
						player.loadVideoById(clientOptions.videoId);
					}
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
				// modifico el UI de la tinta
				currArtistInk = Math.min(data.ink, myInk);
				let inkBarWidth = map(currArtistInk,0,totalInk,0, 810)
				inkRect.set({ size: [inkBarWidth,40] })

                if(soyArtista){
                    if(currArtistInk <= 0) EndArtistTime();
                }else{
                    with(paper){
                        let _x = data.x * 800;
                        let _y = data.y * 800;
                        let p = new Point(_x, _y);
                        playersPaths.lastChild.add(p);
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

	var hasLoggedIn = false;
    $("#comenzar").click(function(){
        // socket connection
        if (ws.readyState === ws.OPEN && !hasLoggedIn) {
            let msg = {
                action: "login",
                nickname: login.nickname,
                role: "player"
            };
            ws.send(JSON.stringify(msg));
			hasLoggedIn = true;
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
}

function InitPaper(){
	canvas = document.getElementById('tile');
    paper.setup(canvas);
    safeArea = $("#safe-area");

    onResize();
    canvasInnerSize = $("canvas").innerWidth();

    with(paper){
        // Paths
        project.currentStyle = {
            strokeColor: 'black',
            strokeWidth: 3,
            strokeCap : 'round',
            strokeJoin : 'round',
        }
        //
        // myPaths
        let p = new Path();
        myPaths = new Group();
        myPaths.addChild(p); // hack raro para evitar un error
        //
        // PlayersPaths
        playersPaths = new Group();
        p = new Path();
        playersPaths.addChild(p); // hack raro para evitar un error
        playersPaths.style = {
            strokeColor: 'red',
            strokeWidth: 2,
        }

        inkRect = new Shape.Rectangle({
            from: [0, 770],
            to: [810, 810],
            fillColor: '#00000096',
			strokeWidth: 0
        });

        var tool = new Tool();
        tool.minDistance = 5;
        var decimalDetail = 4;
        var prevX, prevY;
		var artistLastPoint;

		tool.onMouseDown = function(event) {

            if(soyArtista){
                if(!startedDrawing){
                    startedDrawing = true;
                }

				var normalX = map(event.point.x, 0, canvasInnerSize, 0, 1)
                var normalY = map(event.point.y, 0, canvasInnerSize, 0, 1)

                // Lo guardo en mis paths
                let path = new Path();
                path.strokeColor = '#43c585';
                path.strokeWidth = 2
                let point = new Point(normalX*800,normalY*800);
                path.add( point );
                myPaths.addChild(path);
                // Y en los de player
                path = new Path();
                path.add( point);
                playersPaths.addChild(path);

                let msg = {action:"linestart", x:parseFloat(normalX.toFixed(decimalDetail)), y: parseFloat(normalY.toFixed(decimalDetail))};
                ws.send(JSON.stringify(msg))

				artistLastPoint = new Victor(normalX, normalY)
            }
        }

        tool.onMouseDrag = function(event) {
            // Add a point to the path every time the mouse is dragged
            if(soyArtista){
                if(!startedDrawing){
                    startTime = new Date().getTime();
                    startedDrawing = true;
                }

				var normalX = map(event.point.x, 0, canvasInnerSize, 0, 1)
                var normalY = map(event.point.y, 0, canvasInnerSize, 0, 1)

                if(normalX != prevX || normalY != prevY){
                    // Evito dibujar si el mouse no se movio
                    let msg = {action:"vertex", x:parseFloat(normalX.toFixed(decimalDetail)), y: parseFloat(normalY.toFixed(decimalDetail))}
                    ws.send(JSON.stringify(msg))

                    let point = new Point(normalX*800,normalY*800)
                    myPaths.lastChild.add(point);
                    playersPaths.lastChild.add(point)


                    prevX = normalX;
                    prevY = normalY;
                } // if(normalX != prevX || normalY != prevY)

				// Hago mi calculo local de tinta
				let newPoint = new Victor(normalX, normalY)
				let dist = artistLastPoint.distance(newPoint);
				myInk -= dist;
				artistLastPoint = newPoint;

            }

        }
        tool.onMouseUp = function(event){
            ws.send(JSON.stringify({action:"lineend"}))
        }
    }
}

window.onload = function() {
	// start
    // Cargo el nombre ya guardado
    if(localStorage.getItem("nickname")){
        login.nickname = localStorage.getItem("nickname");
        login.changed();
    }

	InitSocket();
	InitPaper();

	isLoaded.dom = true;
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
