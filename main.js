const canvas1 = document.getElementById("canvas1");
const ctx = canvas1.getContext("2d");
let canvasH;
let canvasW;
let bgColor = "#C4AEAD";
let animations = [];
let circles = [];

let pickColor = (function(){
    let colors = ['#E2A76F',
        '#228B22',
        '#F62817',
        '#8C001A',
        '#98FB98',
        '#81D8D0',
        '#3CB371',
        '#B4CFEC',
        '#3EA99F',
        '#3C565B',
        '#728C00',
        '#6495ED',
        '#92C7C7',
        '#4C4646',
        '#FFFACD',
        '#C9BE62',
        '#B3446C',
        '#B0CFDE',
        '#4EE2EC',
        '#FFE4E1',
        '#7D0552',
        '#BDEDFF',
        '#6B8E23'];


        let index = 0;
        function next(){
            index = index++ < colors.length-1 ? index : 0;
            return colors[index];
        }
        function current(){
            return colors[index];
        }
        return{
            next: next,
            current: current
        }
    })();
    function removeAnimation(animation) {
        let index = animations.indexOf(animation);
        if (index > -1) animations.splice(index, 1);
      }
      
      function calcPageFillRadius(x, y) {
        let l = Math.max(x - 0, canvasW - x);
        let h = Math.max(y - 0, canvasH - y);
        return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
      }

      function addClickLiisteners(){
          document.addEventListener("click", handleEvent);
          document.addEventListener("mousedown", handleEvent);
      };

      function handleEvent(e) {
        let currentColor = pickColor.current();
        let nextColor = pickColor.next();
        let targetR = calcPageFillRadius(e.pageX, e.pageY);
        let rippleSize = Math.min(200, (canvasW * .4));
        let minCoverDuration = 750;
          
        const pageFill = new Circle({
          x: e.pageX,
          y: e.pageY,
          r: 0,
          fill: nextColor
        });
       
        const fillAnimation = anime({
          targets: pageFill,
          r: targetR,
          duration:  Math.max(targetR / 2 , minCoverDuration ),
          easing: "easeOutQuart",
          complete: function(){
            bgColor = pageFill.fill;
            removeAnimation(fillAnimation);
          }
        });

        let ripple = new Circle({
          x: e.pageX,
          y: e.pageY,
          r: 0,
          fill: currentColor,
          stroke: {
          width: 3,
         color: currentColor
          },
         opacity: 1,
         });

         let rippleAnimation = anime({
          targets: ripple,
          r: rippleSize,
          opacity: 0,
         easing: "easeOutExpo",
          duration: 900,
        complete: removeAnimation 
      });
      
      let particles = [];
      for (let i=0; i<32; i++){
        const particle = new Circle({
          x: e.pageX,
          y: e.pageY,
          fill: currentColor,
          r: anime.random(24, 48)
        });
        particles.push(particle);
      }

         let particlesAnimation = anime({
          targets: particles,
          x: function(particle){
            return particle.x + anime.random(rippleSize, -rippleSize);
          },
          y: function(particle){
            return particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15);
          },
          r: 0,
          easing: "easeOutExpo",
          duration: anime.random(1000,1300),
          complete: removeAnimation
        });
        animations.push(fillAnimation, rippleAnimation, particlesAnimation);
      }

      function extend(a, b){
        for(let key in b) {
          if(b.hasOwnProperty(key)) {
            a[key] = b[key];
          }
        }
        return a;
      }
      
const Circle = function(opts){
    extend(this, opts);
};

Circle.prototype.draw = function(){
    ctx.globalAlpha = this.opacity || 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI, false)

    if (this.stroke) {
        ctx.strokeStyle = this.stroke.color;
        ctx.lineWidth = this.stroke.width;
        ctx.stroke();
      }
      if (this.fill) {
        ctx.fillStyle = this.fill;
        ctx.fill();
      }
      ctx.closePath();
      ctx.globalAlpha = 1;
};
let animate = anime({
    duration: Infinity,
    update: function () {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
      animations.forEach(function (anim) {
        anim.animatables.forEach(function (animatable) {
          animatable.target.draw();
        });
      });
    },
  });

      const resizeCanvas = function() {
        canvasW = window.innerWidth;
        canvasH = window.innerHeight;
        canvas1.width = canvasW * devicePixelRatio;
        canvas1.height = canvasH * devicePixelRatio;
        ctx.scale(devicePixelRatio, devicePixelRatio);
      };
      
      (function init() {
        resizeCanvas();
        if (window.CP) {
          window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000; 
        }
      
        window.addEventListener("resize", resizeCanvas);
        addClickLiisteners();
        if (!!window.location.pathname.match(/fullcpgrid/)) {
          startFauxClicking();
        }
        handleInactiveUser();
      })();
      
      function handleInactiveUser() {
        let inactive = setTimeout(function(){
          NoClick(canvasW/2, canvasH/2);
      }, 2000);
      
      function clearInactiveTimeout() {
        clearTimeout(inactive);
        document.removeEventListener("mousedown", clearInactiveTimeout);
        document.removeEventListener("touchstart", clearInactiveTimeout);
      }
      document.addEventListener("mousedown", clearInactiveTimeout);
      document.addEventListener("touchstart", clearInactiveTimeout);
      }
      
      function startFauxClicking() {
        setTimeout(function(){
          NoClick(anime.random( canvasW * .2, canvasW * .8), anime.random(canvasH * .2, canvasH * .8));
          startFauxClicking();
        }, anime.random(200, 900));
      }
      
      function NoClick(x, y) {
        let NoClick = new Event("mousedown");
        NoClick.pageX = x;
        NoClick.pageY = y;
        document.dispatchEvent(NoClick);
      }
    