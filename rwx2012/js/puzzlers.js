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
            document.querySelector(".current div.results span[rel=" + ans +"]").innerText = results[ans];

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
            var thiz = this;
            var elem = document.querySelector("#" + prefix + " button");
			if (elem) {
				elem.addEventListener('click', function() {
	                var code = document.querySelector("#" + prefix + " pre").innerText;
	                try{
	                    eval(code);
	                }
	                catch(err){
	                    alert(err);
	                }
	                document.querySelector("#" + prefix + " li[rel='" + answer + "']").setAttribute("class", "correct");
	                document.querySelector('.current .pie').setAttribute("class", "pie closed");
				});
			}
        },

        vote : function(answer) {
            var canvas = document.querySelector('.current .pie:not(.closed)');
            if(canvas){
                results[answer.toLowerCase()]++;
                draw(canvas);
            }
        },

        reset : function() {
            results = {
                'a' : 0,
                'b' : 0,
                'c' : 0,
                'd' : 0
            }
        }
    }
}());

var puzzlersRace = function() {
	var canvas = null,
		ctx = null,
		height = null,
		width = null,
		races = null,
		reset = null,
		time = null,
		loop = null,
		frame = 0,
		frames = 0,
		maxVal = 0,
		imagesLoaded = 0,
		done = false;
		
	var init = function(callback) {
		ctx = canvas.getContext("2d");
		frames = time / 30; 
		
		var cnt = races.length,
			lane = (height / cnt);
		
		ctx.save();
		ctx.font = "bold 80px Arial";
		ctx.textAlign = "right";
		ctx.textBaseline = "top";
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 1;
		ctx.shadowBlur = 1;
		ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
		for (var i = 0; i < cnt; i++) {
			var race = races[i];
			
			race.image = new Image();
			race.image.onload = (function() {
				race.imgH = (lane * .67);
				race.imgW = (race.imgH * 1.67);
				race.offset = (lane / 2) - (race.imgH / 2);
				race.position = {
					top: race.offset + (i * lane),
					left: 10
				} 

				ctx.fillStyle = race.color;
				ctx.fillText(race.label, width - 10, race.position.top);
				
				if (callback && (++imagesLoaded === races.length)) callback();
			})(race);
			race.image.src = race.img;
			
			maxVal = Math.max(maxVal, race.value);
		}
		//ctx.restore();
	};
	
	var reinit = function() {
		races = JSON.parse(reset);
		loop = null;
		frame = 1;
		imagesLoaded = 0;
		done = false;
		ctx.clearRect(0, 0, width, height);
		init(function() {
			setTimeout(function() {
				draw(1);
			}, 200);
		});
	};
	
	var startLoop = function() {
		loop = setInterval(function() {
			draw(frame++);
			if (frame >= frames) {
				clearInterval(loop);
				drawValues();
				done = true;
			}
		}, 30);
	};
	
	var reposition = function(frame) {
		var cnt = races.length,
			framePos = frame / frames;
			
		for (var i = 0; i < cnt; i++) {
			pixels = width - (races[i].imgW + 10);
			var race = races[i],
				finishPos = race.value / maxVal;
			race.position.left = framePos * finishPos * pixels + 10;
		}
	};
	
	var draw = function(frame) {
		var cnt = races.length;
		for (var i = 0; i < cnt; i++) {
			var race = races[i];
			var pos = race.position;
			var grad = ctx.createLinearGradient(pos.left, pos.top, pos.left + race.imgW, pos.top);
			grad.addColorStop(0, races[i].color);
			grad.addColorStop(.67, '#FFF');
//			grad.addColorStop(.67, 'rgba(0,0,0,0)');
			ctx.fillStyle = grad;
			ctx.fillRect(pos.left, pos.top, race.imgW, race.imgH);
		}
		reposition(frame);
		for (var i = 0; i < cnt; i++) {
			var race = races[i];
			var pos = race.position;
			ctx.drawImage(race.image, pos.left, pos.top, race.imgW, race.imgH);
		}
	};
	
	var drawValues = function() {
		var cnt = races.length,
			lane = (height / cnt);
			
		ctx.save();
		ctx.font = "bold 80px Arial";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 1;
		ctx.shadowBlur = 1;
		ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
		ctx.fillStyle = "#FFF";
		for (var i = 0; i < cnt; i++) {
			var race = races[i];
			ctx.fillText(race.value, 30, race.position.top);
		}
		ctx.restore();
	};
	
	this.bindCanvas = function(c) {
		canvas = c;
		height = c.height;
		width = c.width;
	};
	
	this.fixRaces = function(r, t, callback) {
		reset = JSON.stringify(r)
		races = r;
		time = t;
		init(callback);
	};
	
	this.set = function() {
		draw(1);
	};
		
	this.go = function() {
		startLoop();
	};
		
	this.done = function() {
		return done;
	};
	
	this.reset = function() {
		reinit();
	}
};

var socket;
var connect = function() {
//	socket = io.connect('http://localhost:3000');
//	socket = io.connect('http://10.0.0.99:3000');
	socket = io.connect('http://rwx.yelyad.com:3000');


	socket.on('ack', function(data) {
//		console.log(data);
	});

	socket.on('vote', function(data, clientId) {
//		socket.emit('right', clientId);  //This is how to send back to the client

        PUZZLERS.vote(data.answer);
	});
};
connect();

document.addEventListener("slideleave", function(evt) {
    PUZZLERS.reset();
    socket.emit('openpoll', false);
});

//
//document.addEventListener("slideenter", function(evt){
//    var poll = document.querySelector('.current .poll');
//    console.log(poll);
//    if(poll){
//        socket.emit('openpoll', true);
//    }
//    else{
//        socket.emit('openpoll', false);
//    }
//});

var images = {
	horse: {
		blue: 'data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAMsAAAB4CAMAAABre/baAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0MzN0FFODdFMzk1MTFFMDgxMDRFM0QwQTU4Q0Y1MTEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0MzN0FFODhFMzk1MTFFMDgxMDRFM0QwQTU4Q0Y1MTEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDQzM3QUU4NUUzOTUxMUUwODEwNEUzRDBBNTh\
DRjUxMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDQzM3QUU4NkUzOTUxMUUwODEwNEUzRDBBNThDRjUxMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PiO6vfcAAAMAUExURcVrZGJEKHp6j4huay0sLgQCAgZiSq6OVMfGxQaAVrhrWtrY1ygKBvu6p9qVcuno5rZ0WeSLegyH/gpl/5ZjXfXV0//88zVHE8ShZqamp7lxaNmvq/bkwcuXaLq6uQV3/oKDg////2o2NPqqmKdpZI95e+KUeXp5eaNjXNTHqYaLUK+Zj5iYl9SHbNV2b4hNON2IdNOVbUkjCsd1d0UJBL1vXfPOtM+WjjIwBghZ/mloZrqDW2Cohtl+dFhZWRNp/8mIZgYp05iKbJVbVeOAevX07ERFRLOyj71rYfm1n8eqjqJbVXREPuZ1d4dbUuqZfw94//Py8hQCAfjp56irWtG8vbJrYopUS7l0cRoZGrzFleqOf7ijXsJxbOinh/v0ulhcboNKRFs2MmhDP/eWi0IkIyJnk5dVSBNb/8FyYXFrOr5tadzSw1EnIa5eYls/O9rFxbGppKCfnqt3dsxxa+jo9wRN+3OqxahwapixvO+9qmdoevOkjs7j2q96U7W1r14yJwFw0aCGg7Jvas19Z31VVX5jXko6N/7z/vXr+r7EwfuBhY4wM75kYcZtdXtTSQSi9Y6zfcKSYRIMLMrWya6urSA6GZx+Sv3280BmSMlwZCR0/8G+vmlaavv//g1GNfn49/39/MeEe19HSfX6+/qflOytk/X092pcVB4VBWOCYWxOSs55b0rI+JWdUOCee+z79qyyu9JtagBl7u60mABX7P/7/ldSU4qIO9TP0efh4CMwmzeR/QQDDQBH541cXblsbmFhYv76+euGfrJlXuzt6HFxcPn+687NzEEzKJ\
BIQr95XXBzgt3c3Tk6OlYuMUtHWCmw/9PT0wOJ4SYhH6+YpcOnqsF5cc1mbLNna/j9+ZtQU0gtLtSdcQYIBkhPaf6xopxsblNUM5CTk2QpIAo8/w8MCvr5+1YREXpLSJ6PizsaFH1wfk1NTIyLixESEmQYG7NjVXw+N6tpVgFx95CWfwBL5J2Mn9+uhOzIg+Tll+Di4O2ciu6AjwAAAP///1ZPIjgAAAEAdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wBT9wclAAAh+UlEQVR42tR8D0BT5d7/CfcAjsMYfxJY8meAsFuCG24FeAckxJ1Bik812AurgBYsWhaSL9e8QDG1a027FGqLi84yXfK6ezWlvPeECBKKjq6tlJQTpE1twVK5/e7vp+/h9zxnA7GSaxbYPSjiOGc8n/P99/l8v8+BGPk1Hf98jcOxPhZ59uauJn5FSLxVjD3riEfc85Hb/tOxnHYCmqKyPDyef/70fyIW4dUvKzgUoF5LzXreAx2X/1OwvP6bxsbw3/3X7/7r/z366KNjDpaa2vnxF0NHPDyOoA/v/wQsM3/72+c9p6+nqdco4Fn2Zlryq0+8W3F0RDjz3Tc9bX9mcXh4fONx7FePxefL6clpaclflW2CENg9y9KSAwPLyjbRzi//9I/ktLJXbRyE5XkM51dvl2Mc+1dfB\
SIwyW94ek73/ApBScsNXGanKPOHewIRLPTloMefOV94dIZevepgpPBXh0XorQLww7RlZckIAvoITH7j3g8/TE4LfMNMO6dv2vRmYNqbm2jAactiOFnjrgulnQiZ375fERahjznJ89496wFp9wxECAIDdwO7Gf4tMC35uyTGTgPP5ORk82tOhqFoRjXuwiyGBqnbGntmfS381WB59zsUKx9CigGbkGHScpM/fI2i4L3JyWlv3ouSMW3eE2i2/fM14FRRNH107LJUO0Mz9JDQZp62ctXXDWvW7PvjrceyDHvWMgBoZv1X2MfS7kUmsH+IYO0xA4YCf5qeBDnP0zTDVKyZbUJXmBqG7FYVAxj0J3XkdRV5Pn9p0A4ro1p5x8MHbymWR8uwNd4EFEOZy77w3B2Y9gZAaRnBKltP2dFy5y9ffg/5MbKCbTN7weIa5G8IGYPhOVNNjYDStK79X3meNPiTJ87Mv3VYhJe3eX5XFhi4zEyv3+SZ/Kqn53Ag8rekrzzTApcBO6CBfeHy95avpDg262LXJXFOxoWF/Qd8VqGiAZTK/z4cMZwbEPHCs7cMy+yjD87MCi5LK0P1JHBZmnn7qumBe6D9i79Bz+SyMs/pScC2crnv3Z9p4say8SBGwH6wprGhv0AzcCktFx3o0yt33CIswhQ/k2nflyoSFUeUwtLMMCkpOPitTdNtNNi0DJkmiRr69I7qErJh7JJwJ0JBs8HCGgeFFAV1UaW5w4EYTe4nrzx1S7AIQytmzJhx4HKqqqwsDZf69RAvjUxaf9uXb0zfjXIxY/5o5J+Df716SReCgfMExf4D2IMRyX6LzRIQkRgQkZt72+23AIvwaMV9M/ARemg4DR2BZZ4waZOZojYNJ1GJ0994cj2AwY9ec0moHSUJ14EwAOjoWahshdmGV6zDEbkRicGfRHz5j08Ovz7lWITC0IMslBnHBqf/AyVjxGLKyv6eBIBn2p71nghY8Jerv/zT+Eq4zYYg\
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',
		green: 'data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAMsAAAB4CAMAAABre/baAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0MzN0FFN0ZFMzk1MTFFMDgxMDRFM0QwQTU4Q0Y1MTEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0MzN0FFODBFMzk1MTFFMDgxMDRFM0QwQTU4Q0Y1MTEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEMEE4Mzg0MEUzOTMxMUUwODEwNEUzRDBBNTh\
DRjUxMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDQzM3QUU3RUUzOTUxMUUwODEwNEUzRDBBNThDRjUxMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PoT11QMAAAMAUExURXFKRsVrZIlsbC4sLmtAOwQCArCPVsfGxbhrWtrY1ygKBvu6p9qVcuno5rZ0WQVkTuSLenp6j5ZjXfXV0//888ShZqamp7lxaNmvq/bkwcuXaLq6uYKDg////2o2M/qqmKdpZI95e+OUeXp6eqNjXNTHqQa3AQOTBq+Zj5iYl9SHbNV2b4hNOt2IdNOVbUkjCsd1d0UJBL1vXfPOtM+WjjIvBmdnZrmDWhjGANl+dJaHR1paWcmHZgLCAZVbVeOAe/X07JqKbUNDRGuHXwDXBbOyj71rYWBRJPm1n8eqjgaBWKJbVeZ1d4FWVOuahPPy8hQCAQSnAvjp56ioV9G8vbJrYoZTS7l0cXumNRsYGbzFlQDLAeqOf7mjX8JxbOilifjytn9JRVs2M/WYjEIkIpVVR8FyYXZmRhWlARa6AL5taYytVdzSw1EnIS6PCq5eYls/O9rFxVtcarGppKCfnqt3dsxxa+jo9xZ+AahwapixvO+9qmhoePOkjs7j2iPJAK96VLW1rzJHA14yJjVKKaKGhgzJALJvas19ZwFyMH5jY0k6OCOvAf7z/vXr+pCVRL7EwSRlBfiBh44wM75kYcZtdXi3fA/nAsOSYRIMLMrWya6urR07HJx8Sv3282/GVMlwZMG+vnBYUgDHFPv//hclI/n49/39/A/CAMeEewhMPWFIQ/X6+/qflO2uk/X09wDCCx4VBc55bwPFJgG0EuGefOz79qyyu9Jtauy8lVl/L//7/lpQUtTP0efh4AQDDW1tawDLC4xcXLlsbmJhYf76+euGfrJlXgWBHuzt6H\
Z0cPn+687NzD80JpBHQr95XnBzgj/UI93c3Tg5OVcuMUtHWNPT0wLUFichH6+YpcOnqsF5cs1mbLNna/j9+ZtQU0gtLtSdcQYIBlJTV/6xooPFTpxsbpCTkz1sOmQpIBbPAA8MCvr5+1YREZ2PizsaFH1wfFRTOoyLixEREmQYG01NTLNjVatpVuDi4CifNZCWf52Mn9+uhHlAOgAAAP///xnPiu8AAAEAdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wBT9wclAAAiE0lEQVR42tR8DUBUVdo/43BguAwDkjAJDCCwkCCDMxso8pWzNpmIHrKBnReYGhxGZRuzQorX3FBMJq1Na9po0d7B0PFj/RiKXffV9SIaKKG4DtlsasGFF1evdosJZfcfl/85dwbEStYssL0m0nDvcH73+fr9nufccRv8OR3/eofPtz0bcvXurnb7GSHxVAOq78zEyBdD9v+nY7nkABRJKiZOPPPipf9ELJKb35bwSUC+06V4cSI6+v9TsPzhFzU1wQ//18MPP/nkR08OO1hXSsvHH/eeQWZBfzz/E7BM/v3v//nKK1tI8h2S8s2bMyd7+T9/VdI/KJn8v2/72p+diJGg48tzP3ssXl/N+yDv6Hvvf7IbQkD7puWlpaW998luyvHI7/924Ogny+18ZJMXMZyfvV3O8ekP3\
k/Lyztw4BVfdHyAoOStT8umSdIasxTBOnqAJvsmPsv/eOKZwJtXnQyR/OywSFDKhTFp7x1Ny0YGyctLi34lJjsmek70CSvlmLd7y9tpeXN2Uyw/SQH4ihHXBVIOhMznyM8Ii8TLmuh7InsLsELfvGjsXdmApuGJtLwDMYksTZG+B9KirdtJkmVJVj3iQgVLgZT9Ne1TvpD8bLD8Kgbd+BhIsmD3AeRcedEx75AkPHEgLe/tEygZU9bsNOadf73DOtQkRZ0dvqyLZimW6pXY1ROyNnxRvWnTkd/deyzvYc/6AACK3fI+NkveCWQBGgFMi6EBS4Lfz0uE/DMUxbIlm6Za0BWW6l7apmYBi/7rGvyDldCuXOm/xwbUWfc/fvKeYnnyvWi0/jmAZEnr0Vd8EYZXAAl930chv4Wk0XJnr1r1IPwYWcG+g7tg4RoHi0yC/qIvjhSLJyB1jW+9kZwjW7t88+XZ9w6LpH+/bwxypwNWastu3wPLfX2XpSF/2/KBb15aNqQBBejGVXNXbYN8u22h85JIB+vEwv0DPi1RUwDKkv+Wtix657KdLzx3z7BMPXty8sZ1n8zhov5AHrNtybzobEi8coLeHX10jq9vIrBvW+X9y0/5kcPZuA8j4P5wptmO/gJdT3jelZ3r16/fOfPN++8RFkmSj8XS/5WaxlGfljbHCpnEtadWrJtnB2A3CqQPEsneB+4vdydu3u1gB0JBccHCGQeHFGUILdoZnbYeH8vffOqeYJEElkxCR3+K/ejRvOi0A3O2ALQ00pG45ZGv/uGbnZZtZa0fDf7rqz/fvKQVwcB5guT+AdzBXm/7ddrM9etn7kx4KW39zEfuuwdYJGdLHsJYJgWeWjonL29O2lFfmLjFSpK7sxPJxHn/WLIFgnVP3nJJII2ShPNAGABk2htvNMJM05ubly67Ep2w9tWlj7z06umnxh2LRBJ4koMy6VzfvL8hMGlzDuR98rdEAHzzsre88okvXPfV\
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',
		red: 'data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAMsAAAB4CAMAAABre/baAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTYwRTUzQkFFMzk4MTFFMDgxMDRFM0QwQTU4Q0Y1MTEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTYwRTUzQkJFMzk4MTFFMDgxMDRFM0QwQTU4Q0Y1MTEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFNjBFNTNCOEUzOTgxMUUwODEwNEUzRDBBNTh\
DRjUxMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFNjBFNTNCOUUzOTgxMUUwODEwNEUzRDBBNThDRjUxMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pt18EOsAAAMAUExURUuJaoptay0sLl1DLwQCArGOVsfGxQdgSbhrWtrY1ygKBvu6p9qVcunn5rZ0WeONenp6kJhkXfXV0//888ShZqamp7lyadmvq/bkwTVHFsuXaI95e7q6uYKDg////2s3M/qqmKZpZP8LFuIOYeOVenp7eKNiXNTHqa+Zj5iYl9SHbOxgjNZ2b4hMON2IdP8FJtOVbUkjCsZ1dkUJBL5wXDIwBvPOtM6VjmloZ7mDWth+dIqEY/sCCcJrYKCJTFhYWcmHZpVaVf8THfX07ERERLOyj7tsYRWOYfm1n/8PKseqjqFbVHdDPeN9eIhaVOqcgo4xM/Py8v8oFRQCAfjp56itW9G8vbJrYopTSrd1choZGrzFlWc3VeiHfrejXsFxbeilifjytmtCPoNKRFs3NP0CO/SYjEIkI5dVSMBzYnxmR8RtaLxuaNzSw1EnIa5eYtrFxVpdabGppKCfnqt3dv8SOsxzbOjo96hwapixvO+9qmhoePOkjtTj2a96VLW1r8prZF4yKKCJfbJvas19Z8tsa31VVYJjZ0o6OP7z/vXr+ugBA77EwfmBh7tkYMdud3xSScRlYv8UDcOSYRIMLMrWya6urSA6GZt8Sv3288hyZcG+vmlaavv//gxFNPn49/39/MWCgP8kL15GQ/X6+/qflO2ukvX092lbVQN6VB4VBWtYNoshT855b1pQUsQnEegAF01UVt+ee+z79qyyu9lva+22mv/7/o1eX0huN4qJQNTP0dECLuPh4QQDDWp3YrlsbmJhYf76+e2BgbBlX+zt6HVxcfn+687NzEEzKE\
1HV5BHQr95Xm5ygZtQVN7d3Tk6OlYvMdPT0yYhH6+YpcOnqsF6csplbNNmcbNna/j9+ZWZSUgtLtSdcQYIBv6xouUARJxsb5CTk2QpIA8MCvr5+4ueZVYREXlKR8BoaGqygp6PizsaFHhzhlNVOmxNSYyLixESEvUAI2QYG01NTLNjVuyPf6tpVuAgAv00YZKegqSGod+uhOzIgwAAAP///3Qdc8wAAAEAdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wBT9wclAAAiBUlEQVR42tRcC0BT59mu8QPCISYwgVaEBBiwyo8QTGgxJXJpyi/lYvVrG8g/iAU00KTpBaFMHReJaKelAh0qDMU6b9mwwma1XUmlRYoWJZjVjhYORY8T1lgJRVz39z/833eSIHZKrS3YHeQinBO+57y353nf73Df+E/pGH6dxTK+6HPp7q6+7yeExFEBqNEzV1zX+Rz4T8dywQJIg0HmeuXMugv/iVj4N77MYxmA4fVo2TpXV9crLf8pWH77i7o678f+57HHnnnmw2cmHCw6uv306eEzrq5nXK+4Ov4nYHngH//Y5HRoO2l43UA6Va2oilp19r68rnH+A+veOGT6HTYJ837uJ4/F+ctDVXFxVVUrdkEIKKcqf3ys2EVavvzX1/5xcatMLGSTda5nfH76djnHoqpW+GMwT\
U5Oh5yq4vz94xL8oyiDQb/lCEIVV0UZRl1fZJ12PeNx46qTPvyfHBY+Srlwi/+KKv8o/zj/uDD/qKZ/btkSFeffpCcth3btesM/7o1dJM1qlQGWbNJ1HqQFIZvT8hPCwnfWRzi9GbUdQL1THELg7x8FKD18AuHaEkFTJOmEvqNXvE7TBgOtmHShjCZB9IG67vlf8H8yWN7bgtxrCzTQYBcKlAQE4XWDAb7pHxX3xpsoGZP6KH/z6/96HVgUBpLsmrgsmqJJmhzmm/Szyjd9UbN1a8tv7j2WFdizogAg6e0r4sLQ128C2kAxACn0FfjHoQjIWkeSNJ23dUEDuqKhZpgyKmhAo3/R479VEINpa9yuGoG+/P6nT95TLM9URaHofgMYaIO+6rQTivUmYABOK5CzbTdQNABL1q59mDiNrGDazVywvNhCI5Ogd/TBEj3XERhUKa99IEkVzfv8jxc33Dss/JYDh7bgTKWH23c5Vf3cySnMH/lbRNUh5GuQAiSgNrm8tbbcwDIZl1svCbTQVizMJ/BxnoIE8LLk67CwkYSwsHdfumdYFjg/+YBs3oo4/ygUK1VV+oPP/nfUEUgczoROUVVvOB2KAKbytS4PfcwKnMjGoxgB88aYxoTegcrtelx+AnM8cf89wsKPnPN+Q8uXCgrHDDKPHpojts/75a7/NgGcCeKiIgzDC+4vyiRu3G1vC0JBMsHCGAeFlIHUCnISUN7Ax+dPPHdPsPA98uaioyvahMp+lH/VG9shAMBgidg++8u3Dx1BuZjWfzg+/OWfb1zSgWDgPGFgPgHmoK/lXsFA8sPC8/0Twv7ws3uAhd+V9yjGMtfjlP+KhLg4/yonGLFLbwC7RiKg+dDbz6KiM++Zmy7xoFCSsB4IA4Dm7hR5LEyseMI4EoagzFs18oefr/rouRnHwud7nGSgzD03eujrOHygJPB1BACH4qK2O61wIud9ufnLf02uhAdMCALAEQIhVGnNgiBl/JIy\
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',
		yellow: 'data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAMsAAAB4CAMAAABre/baAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0MzN0FFODNFMzk1MTFFMDgxMDRFM0QwQTU4Q0Y1MTEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0MzN0FFODRFMzk1MTFFMDgxMDRFM0QwQTU4Q0Y1MTEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDQzM3QUU4MUUzOTUxMUUwODEwNEUzRDBBNTh\
DRjUxMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDQzM3QUU4MkUzOTUxMUUwODEwNEUzRDBBNThDRjUxMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsyOW/IAAAMAUExURXNPS8VrZIlsbC0sLgQCAv78FLCPVv/kB8fGxbhrWtrY1ygKBvu6p9qVc+no5rZ0WQVfSuSLeoNdNnp6j5ZjXfXV0//88w5NOsOhZaamp7lxaNmvq/bkwdynAMuXaLq6uYKDg//7C////2o2M/qqmKdpZI95e83lAK2NBuOUeXp6ev3WA6NjXNTHqXFCPK+Zj5iYl9SHbNV2b92IdNSVbUkjCsd1d0UJBL1vXfPOtM+WjjIvBq/aBP/rELekXmhoZbmDWtl+dJeOQ1hZWMmHZqeqVJVbVeOAe/X07JqKbUNERWuHX621hdn/DL1rYU1JKGm0gPm1n8eqjqJbVeZ1d4RaU+uahPPy8hQCAfjp59G8vbJrYoVSTLl0cRoZGrzFleqOf8JxbOilifjytoBJQ/77I//cEFs1M/nAAvWYjEIlI5ZUSMFyYW5kTP/0DL5tadzSw1AoIvz7Aq5eYmE/PNrFxVtcarGppKCfnqt3dsxxa+DkAOjo96hwapixvO+9qgZ6UGhoePOkjs7j2q96VLW1r14yJu/cAKKGhu3/GPHwUrJvas19Z35jZEo5Of7z/vXr+va1P77EwfiBh48vMb5kYcZtdcOSYRIMLP/uBMrWya6urSA6GZp9Sf3288lwZJKbTsG+vvX/DXJXWPv//hA/LPn49/39/MeEe2NIRPX6+/qflP7bL+yukfX09x4VBc55b+38AeDVAOGefOz79qyyu9Jtau22mm+6C//7/lxQUtTP0efh4AQDDW1ta4xcXblsbmRjZP76+euGfrJlXjqZGOzt6HZ0cPn+687NzE\
UxKI5LQL95XnBzgt3c3Tk6OVcuMExIWUhwNdPT0yUhH6+YpTZICsOnqsF5cs1mbLNna+3NAPj9+ZtQU0ctM9OecQYIBlNTXv6xon3iHpxsbpCTk2IoHvDvAA8MCvr5+1YREZ2PizsaFH1wfFNSUIyLixESEnVnCGQYG0xNSbNjVYE+OatpVrV9BuDi4JCWf19dXJ2Mn9+uhOzIgwAAAP///+LBGMkAAAEAdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wBT9wclAAAiB0lEQVR42tR8DVxT59k3MTcf4RBCBlNIKx8BXIEsFQgmLRWNILR0jbMUvdtAXtKmoCGFxtIWcTxSB1gfUrvZptQhRpAandPgw+ZmZ0AK1aJo6MysH1WOPmqP9lTSoo757j28931CENvKrC3YHfuDFM4J9/9cH///dV33idfwj+n457tcruOVyEt3d7XXjwiJn4ahsg8Hx78WufM/HcsFFyDt9uzg4MOvXfhPxCK++bKcawf2d89mvxaMjqH/FCy/+3lTU8Qv/s8vfvHccx89N+pgZ9MPfPzxwAFkFvTP7z8By/2//OX/VlVtQBawk0HNUc3LljzyePmRYfH9Dzxf5XwlGCNBxxdHf/RY/K9U7fL23rXriWkQAiooyjsqqsR7zTTSteAXv/X2bl7i5CKbvIbh/OjtcpRL7\
XoiCi26+cOgoKqgXRhKSdQuym63rdhVEhXljV4OBr/CPRt8OOzmVfsjxT86LGI/DYArvNc0Ny+L8i7xLola9uHPPlvR7L3sQxvpqpr23vMl3s9PIwG3M5vhZo+5Lox0IWSBe39EWMT+ttSgR3ZtADYY5L0MG+QzSFLUX5Z5N69IBRRpR9GzzPaui2HsdkYz5sJshgTpO5v6Znwu/tFgeXwFcq8V0M6Aac1R2C4r3rXb4SPNUd7PP4JSAWn7bJnT+c937S6NnSSPjF6WTjEkQw6InbYpuW983rBu3d7f3Hssa5Yhz9oFAMlseMJ7PULzCGDsEAGMWmFDr8Avq1Ih9zWSZJjydTOt6AprwwDl0DCAQf+lD/9OQ+iWLw/Z5gCazfc9s/+eYnluzbISFBHAztht3h8GrS7x/hDYQdATJVHNG+wUA8BjKwMehh8jKzi3sBcsrkH+hpAxGJ4r3erH2PUd77ylzJMfm/6Pi4/dOyzioZ1Vq5ujoppt5Ib3gtZMDwryjUL+lvpEkHfUZ4ACJKA6Vv555WbIdToWuy+JdzFuLOw38Em5hgRQrvxDiS8+pr96z7DM9H/6/gUb1nhHoVCP2hVFe02pWv8ZpP7yFxi0zHtNUFUqcG5eGfDQJ9z40Ww8iBGw/1jTOEn0Un8+1ns2PtbPfvu+e4RFPCdwj3XoioZCUR+FiMQGU1OPHSybVuUEYNqaqJJdqfaBB++rlhI373aEC6Eg2WBhjYNCyg6N0cW+60tYNEvefvGeYBGHlU9Fx1C6cw3ik6jmNe9BtEK7K3XDggV/q1qNcjFj+2j4n4N/unlJDzYDyhN29htgD+aq6R8lvrNLCn1TCpFppD+9B1jER8ofxVimhh1c/7y3t3eUdxBMfc9mB9N8Uym66m8vbIBgwXO3XBJGoSThPhAGAOm+XHUHPG1++8tTvrN9U44tWf3l9CWHXpx0LGJx2H4WytSjg1V/QEiQivFu/u9UAKqilm2oWhNELti2\
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'
	}
}



document.addEventListener('keydown', handleVoteKey, false);

function handleVoteKey(evt){
    switch (event.keyCode){
        case 86:
//            console.log('open voting');
            PUZZLERS.reset();
            socket.emit('openpoll', true);
            break;
    }
}