var data = [
  {option: 'A', total: 1},
  {option: 'B', total: 1},
  {option: 'C', total: 1},
  {option: 'D', total: 1},
  {option: 'E', total: 1}
];

var data3 = [
  {option: 'A', total: 1000},
  {option: 'B', total: 333},
  {option: 'C', total: 2000},
  {option: 'D', total: 2000},
  {option: 'D', total: 2000},
  {option: 'D', total: 2000},
  {option: 'D', total: 2000},
  {option: 'E', total: 3000}
];

var data2 = [
  {option: 'A', total: 500},
  {option: 'B', total: 33},
  {option: 'C', total: 1000},
  {option: 'D', total: 5000}
];

var width = 250;
var height = 250;
var radius = Math.min(width, height) / 2;
var color = d3.scale.ordinal().range(["#88A825", "#35203B", "#911146", "#CF4A30", "#ED8C2B", "#CD8C2B","#ED8D2B" ]);


(function () {
  console.log('vote loaded');

  var body = document.body;
  var voteConfig = Reveal.getConfig().vote;
  var socket = io.connect(window.location.origin);

  // Build Polls
  var polls = document.querySelectorAll('div[poll]');

  for (var i = 0; i < polls.length; ++i) {
    var poll = polls[i];
    var options = poll.querySelectorAll('li[option]');

    for (var j = 0; j < options.length; ++j) {
      var li = options[j];

      var div = document.createElement('div');
      div.innerText = options[j].getAttribute('option');
      div.classList.add('option' + j);

      var span = document.createElement('span');
      span.innerText = li.innerText;

      li.innerText = "";
      li.appendChild(div);
      li.appendChild(span);
    }

    var results = document.createElement('div');
    results.classList.add('poll-results');

    poll.appendChild(results);

    // Donut chart
    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 70);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d.total;
      });

    var svg = d3.select(results)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .attr("id", 'poll');

    var path = svg.selectAll("path")
      .data(pie(data))
      .enter()
      .append("path");

    path.transition()
      .duration(500)
      .attr("fill", function(d, i) {
        return color(d.data.option);
      })
      .attr("d", arc)
      .each(function(d) {
        this._current = d;
      }); // store the initial angles


    // Notify new poll

//    Reveal.addEventListener('slidechanged', function (event) {
//      console.log(event.currentSlide);
//
//      var poll = event.currentSlide.querySelector('div[poll]');
//      console.log(poll);
//
//      if (poll) {
//        socket.emit('openpoll', {})
//      }
//    });
  }

  setInterval(function () {

    changeData(data3);
  }, 2000);


  function changeData(data) {
    var svg = d3.select('div[poll=test1] > div.poll-results > svg > g');
    var path = svg.selectAll('path')
      .data(pie(data));

    path.transition().duration(750).attrTween("d", function(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    }); // redraw the arcs
  }


  function openPoll() {
    var s = Reveal.getCurrentSlide();
    console.log(s);
  }


  // Open the notes when the 's' key is hit
  document.addEventListener( 'keydown', function( event ) {
    // Disregard the event if the target is editable or a
    // modifier is present
    if ( document.querySelector( ':focus' ) !== null || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey ) return;

    if( event.keyCode === 86 ) {
      event.preventDefault();
      openPoll();
    }
  }, false );

  return {
    openPoll: function(pollId) {
      console.log('Open poll: ', pollId)
    },

    closePoll: function(pollId) {
      console.log('Close poll: ', pollId);
    }
  }
})();


