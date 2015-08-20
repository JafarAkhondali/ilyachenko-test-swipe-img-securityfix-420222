'use strict';

var config = {
    // arbitrary number of images
    images: [
        'img/1.jpg',
        'img/2.jpg',
        'img/3.jpg',
        'img/4.jpg'
    ],
    // possible values: 'auto', 'manual', 'automanual'
    mode: 'automanual',
    // arbitrary interger (miliseconds)
    swipeSpeed: 500,
    // arbitrary interger (miliseconds). This is used in 'auto' and 'automanual' modes
    swipeDelay: 3000
};

var SwipeBaseClass = {};

SwipeBaseClass.init = function (selector, _config) {

    this.selector = selector;
    this._nodeImages = [];
    this._config = {
        images: _config.images || [],
        mode: _config.mode || 'auto',
        swipeSpeed: _config.swipeSpeed || 500,
        swipeDelay: _config.swipeDelay || 3000
    };

    this.render();
    this.setMode();

};

SwipeBaseClass.setMode = function () {
    var that = this;

    this.goInterval = function(){
        that.timerId = setInterval(function () {
            that.__proto__.left.call(that);
        }, that._config.swipeDelay);
    };

    switch (this._config.mode) {
        case ("auto"):
            this.goInterval();
            break;
        case ("manual"):
            this.addSwipeEvent();
            break;
        case ('automanual'):
            this.goInterval();
            this.addSwipeEvent();
            break;
    }

};

SwipeBaseClass.render = function () {
    var config = this._config;
    var nodeImages = this._nodeImages;

    var node = document.querySelectorAll('#' + this.selector);

    if (!node.length && !config.images.length) return false;

    var prevWidth = 0;
    for (var i = 0; i < config.images.length; i++) {
        var img = document.createElement("img");
        img.src = config.images[i];
        node[0].appendChild(img);
        img.style.left = prevWidth + "px";
        img.style.zIndex = 100;
        prevWidth += node[0].offsetWidth;
        if (i === config.images.length - 1) {
            img.style.left = -1 * prevWidth / config.images.length + "px";
        }
        nodeImages.push(img);
    }
    this._nodeImages[0].style.zIndex = 1000;
};

SwipeBaseClass.getWidth = function (elem) {
    return parseInt(elem.style.left.replace('px', ''));
};

SwipeBaseClass.addSwipeEvent = function () {
    var that = this;
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);

    var xDown = null;
    var yDown = null;

    function autoManualMode(){
        if(that._config.mode === "automanual"){
            clearInterval(that.timerId);
        }
        that.goInterval();
    }

    function handleTouchStart(evt) {
        xDown = evt.touches[0].clientX;
        yDown = evt.touches[0].clientY;
    }

    function handleTouchMove(evt) {
        if (!xDown || !yDown) {
            return;
        }

        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            //if (that.selector !== evt.target.id) return false;
            if (xDiff > 0) {
                if (that.selector === evt.target.parentNode.id) {
                    that.left();
                    autoManualMode();
                }
            } else {
                if (that.selector === evt.target.parentNode.id) {
                    that.right();
                    autoManualMode();
                }
            }
        }
        /* reset values */
        xDown = null;
        yDown = null;
    }
};

SwipeBaseClass.rotate = function (i, startPos, vector) {
    var getWidth = this.getWidth;
    var nodeImages = this._nodeImages;

    if (getWidth(nodeImages[i]) <= 0) {
        nodeImages[i].style.zIndex = vector > 0 ? 1000 : 100;
    }
    else {
        nodeImages[i].style.zIndex = vector > 0 ? 100 : 1000;
    }

    if (typeof nodeImages[i + vector] !== "undefined") {
        nodeImages[i].style.left = getWidth(nodeImages[i + vector]) + "px";
    }
    if (typeof nodeImages[i + vector] === "undefined") {
        nodeImages[i].style.left = startPos + "px";
    }
};

SwipeBaseClass.left = function () {
    var nodeImages = this._nodeImages;
    var startPos = this.getWidth(nodeImages[nodeImages.length - 1]);

    for (var i = nodeImages.length - 1; i >= 0; i--) {
        this.rotate(i, startPos, -1);
    }
};

SwipeBaseClass.right = function () {
    var nodeImages = this._nodeImages;
    var startPos = this.getWidth(nodeImages[0]);

    for (var i = 0; i < nodeImages.length; i++) {
        this.rotate(i, startPos, 1);
    }
};

var Slider = Object.create(SwipeBaseClass);

Slider.init = function () {
    SwipeBaseClass.init.apply(this, arguments);
    for (var i = 0; i < this._nodeImages.length; i++) {
        this._nodeImages[i].style.transition = this._config.swipeSpeed/1000 + 's';
    }
};


var Fade = Object.create(SwipeBaseClass);
Fade.init = function () {
    SwipeBaseClass.init.apply(this, arguments);
    this.switch();
};

Fade.switch = function () {
    var nodeImages = this._nodeImages;
    var speed = this._config.swipeSpeed/1000;
    for (var i = nodeImages.length - 1; i >= 0; i--) {
        if (this.getWidth(nodeImages[i]) === 0) {
            nodeImages[i].className = "visible";
            nodeImages[i].style.WebkitTransition = "opacity " + speed + "s linear";
            nodeImages[i].style.MozTransition = "opacity " + speed + "s linear";
        }
        else {
            nodeImages[i].className = "hidden";
            nodeImages[i].style.WebkitTransition = "visibility " + speed + "s " + speed + "s, opacity " + speed + "s linear";
            nodeImages[i].style.MozTransition = "visibility " + speed + "s " + speed + "s, opacity " + speed + "s linear";
        }
    }
};

Fade.left = function () {
    var baseClass = Object.getPrototypeOf(this.__proto__);
    baseClass.left.call(this);
    this.switch();
};

Fade.right = function () {
    var baseClass = Object.getPrototypeOf(this.__proto__);
    baseClass.right.call(this);
    this.switch();
};


var slider = Object.create(Slider);
var fade = Object.create(Fade);


window.onload = function () {
    slider.init('swipe1', config);
    fade.init('fade1', config);
};