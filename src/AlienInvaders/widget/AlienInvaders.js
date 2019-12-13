define([
    "dojo/_base/declare", "mxui/widget/_WidgetBase", "dijit/_TemplatedMixin",
    "dojo/_base/lang",
    "dojo/text!AlienInvaders/widget/template/AlienInvaders.html"
], function (declare, _WidgetBase, _TemplatedMixin, lang, /*_jQuery,*/ widgetTemplate) {
    "use strict";
    // var $ = _jQuery.noConflict(true);
    return declare("AlienInvaders.widget.AlienInvaders", [_WidgetBase, _TemplatedMixin], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,
        // DOM elements
        canvas: null,
        // Parameters configured in the Modeler.
        messageString: "",
        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {

            const btn_start = document.querySelector(".startButton");
            const myShip = document.querySelector(".myShip");
            const container = document.querySelector(".container");
            const fireme = document.querySelector(".fireme");
            const scoreOutput = document.querySelector(".score");
            const containerDim = container.getBoundingClientRect();
            const message = document.querySelector(".message");
            btn_start.addEventListener("click", startGame);
            let player = {
                score: 0
                , speed: 5
                , gameOver: true
                , fire: false
                , alienSpeed: 5
            };
            let keyV = {};
            document.addEventListener("keydown", function (e) {
                let key = e.keyCode;
                if (key === 37) {
                    keyV.left = true;
                }
                else if (key === 39) {
                    keyV.right = true;
                }
                else if (key === 38 || key === 32) {
                    if (!player.fire) {
                        addShoot();
                    }
                }
            })
            document.addEventListener("keyup", function (e) {
                let key = e.keyCode;
                if (key === 37) {
                    keyV.left = false;
                }
                else if (key === 39) {
                    keyV.right = false;
                }
            })

            function gameOver() {
                btn_start.style.display = "block";
                btn_start.innerHTML = "Restart New Game";
                player.fire = true;
                fireme.classList.add("hide");
            }

            function clearAliens() {
                let tempAliens = document.querySelectorAll(".alien");
                for (let x = 0; x < tempAliens.length; x++) {
                    tempAliens[x].parentNode.removeChild(tempAliens[x]);
                }
            }

            function startGame() {
                if (player.gameOver) {
                    clearAliens();
                    player.gameOver = false;
                    btn_start.style.display = "none";
                    player.alienSpeed = 12;
                    player.score = 0;
                    player.fire = false;
                    scoreOutput.textContent = player.score;
                    setupAliens(20);
                    messageOutput("start game");
                    player.animFrame = requestAnimationFrame(update);
                }
            }

            function setupAliens(num) {
                let tempWidth = 70;
                let lastCol = containerDim.width - tempWidth;
                let row = {
                    x: containerDim.left + 50
                    , y: 50
                }
                for (let x = 0; x < num; x++) {
                    if (row.x > (lastCol - tempWidth)) {
                        row.y += 70;
                        row.x = containerDim.left + 50
                    }
                    alienMaker(row, tempWidth);
                    row.x += tempWidth + 20;
                }
            }

            function randomColor() {
                return "#" + Math.random().toString(16).substr(-6);
            }

            function alienMaker(row, tempWidth) {
            
                if(row.y > (containerDim.height - 200)){
                    return;
                }
                let div = document.createElement("div");
                div.classList.add("alien");
                div.style.backgroundColor = randomColor();
                let eye1 = document.createElement("span");
                eye1.classList.add("eye");
                eye1.style.left = "10px";
                div.appendChild(eye1);
                let eye2 = document.createElement("span");
                eye2.classList.add("eye");
                eye2.style.right = "10px";
                div.appendChild(eye2);
                let mouth = document.createElement("span");
                mouth.classList.add("mouth");
                div.appendChild(mouth);
                div.style.width = tempWidth + "px";
                div.xpos = Math.floor(row.x);
                div.ypos = Math.floor(row.y);
                div.style.left = div.xpos + "px";
                div.style.top = div.ypos + "px";
                div.directionMove = 1;
                container.appendChild(div);
            }

            function addShoot() {
                player.fire = true;
                fireme.classList.remove("hide");
                fireme.xpos = (myShip.offsetLeft + (myShip.offsetWidth / 2));
                fireme.ypos = myShip.offsetTop - 10;
                fireme.style.left = fireme.xpos + "px";
                fireme.style.top = fireme.ypos + "px";
            }

            function isCollide(a, b) {
                let aRect = a.getBoundingClientRect();
                let bRect = b.getBoundingClientRect();
                return !(
                    (aRect.bottom < bRect.top) || (aRect.top > bRect.bottom) || (aRect.right < bRect.left) || (aRect.left > bRect.right))
            }

            function messageOutput(mes) {
                message.innerHTML = mes;
            }

            function update() {
                if (!player.gameOver) {
                    let tempAliens = document.querySelectorAll(".alien");
                    if (tempAliens.length == 0) {
                        player.gameOver = true;
                        messageOutput("You Won");
                        gameOver();
                    }
                    for (let x = tempAliens.length - 1; x > -1; x--) {
                        let el = tempAliens[x];
                        if (isCollide(el, fireme)) {
                            messageOutput("HIT");
                            player.alienSpeed++;
                            player.score++;
                            scoreOutput.textContent = player.score;
                            player.fire = false;
                            fireme.classList.add("hide");
                            el.parentNode.removeChild(el);
                            fireme.ypos = containerDim.height + 100;
                        }
                        if (el.xpos > (containerDim.width - el.offsetWidth) || el.xpos < containerDim.left) {
                            el.directionMove *= -1;
                            el.ypos += 40;
                            if (el.ypos > (myShip.offsetTop - 50)) {
                                messageOutput("Game Over");
                                player.gameOver = true;
                                gameOver();
                            }
                        }
                        el.xpos += (player.alienSpeed * el.directionMove);
                        el.style.left = el.xpos + "px";
                        el.style.top = el.ypos + "px";
                    }
                    let tempPos = myShip.offsetLeft;
                    if (player.fire) {
                        if (fireme.ypos > 0) {
                            fireme.ypos -= 15;
                            fireme.style.top = fireme.ypos + "px";
                        }
                        else {
                            player.fire = false;
                            fireme.classList.add("hide");
                            fireme.ypos = containerDim.height + 100;
                        }
                    }
                    if (keyV.left && tempPos > containerDim.left) {
                        tempPos -= player.speed;
                    }
                    if (keyV.right && (tempPos + myShip.offsetWidth) < containerDim.right) {
                        tempPos += player.speed;
                    }
                    myShip.style.left = tempPos + "px";
                    player.animFrame = requestAnimationFrame(update);
                }
            }

            this._updateRendering();
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {

            this._contextObj = obj;
            this._updateRendering(callback); // We're passing the callback to updateRendering to be called after DOM-manipulation
        },

        enable: function () { },
        disable: function () { },
        resize: function (box) { },
        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // Attach events to HTML dom elements
        _setupEvents: function () {
        },

        // Rerender the interface.
        _updateRendering: function (callback) {
            if (this._contextObj !== null) {
            } else {
            }
            // The callback, coming from update, needs to be executed, to let the page know it finished rendering
            this._executeCallback(callback, "_updateRendering");
        },
        _executeCallback: function (cb, from) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["AlienInvaders/widget/AlienInvaders"]);
