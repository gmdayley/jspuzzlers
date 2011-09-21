var PUZZLERS = (function() {
    var PI2 = Math.PI * 2;

    var colors = {
        'a' : 'rgb(0, 138, 53)',
        'b' : 'rgb(0, 102, 204)',
        'c' : 'rgb(255, 0, 0)',
        'd' : 'rgb(255, 211, 25)'
    };

    var results = {};

    var draw = function(canvas) {
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 200, 200);

        var startAngle = 0;
        var total = 0;

        for (var a in results) {
            total += results[a];
        }


        for (var ans in results) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(100, 100);
            var percent = results[ans] / total;
            var endAngle = startAngle + (PI2 * percent);
            ctx.arc(100, 100, 100, startAngle, endAngle, false);
            startAngle = endAngle;
            ctx.fillStyle = colors[ans];
            ctx.fill();
            ctx.restore();
        }
    };

    return {
        bindQuestion : function(prefix, answer) {
            document.querySelector("#" + prefix + " button").addEventListener('click', function() {
                var code = document.querySelector("#" + prefix + " pre").innerText;
                try{
                    eval(code);
                }
                catch(err){
                    alert(err);
                }
                document.querySelector("#" + prefix + " li[rel='" + answer + "']").setAttribute("class", "correct");
            });
        },

        vote : function(answer) {
            results[answer.toLowerCase()]++;
            this.update();
        },

        reset : function() {
            results = {
                'a' : 0,
                'b' : 0,
                'c' : 0,
                'd' : 0
            }
        },

        update : function() {
            var canvas = document.querySelector('.current .pie');
            draw(canvas);
        }

    }
}());

var connect = function() {
    conn = new WebSocket("ws://localhost:8000");
    conn.onmessage = function(evt) {
        console.log(evt);
        var data = JSON.parse(evt.data);
        PUZZLERS.vote(data.answer);
    }
};

connect();


document.addEventListener("slideleave", function(evt) {
    PUZZLERS.reset();
});
