var Poller = (function () {
//  var body = document.body;
//  var voteConfig = Reveal.getConfig().vote;

  var pollData = {};
  var socket;


  var width = 300,
    height = 300,
    radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal().range(["#88A825", "#35203B", "#911146", "#CF4A30", "#ED8C2B", "#CD8C2B","#ED8D2B" ]);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
      return d.total;
    });

  var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);


  function keyboardListener() {
    // Open the notes when the 'v' key is hit
    document.addEventListener('keydown', function (event) {
      // Disregard the event if the target is editable or a
      // modifier is present
      if (document.querySelector(':focus') !== null || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;

      if (event.keyCode === 86) {
        event.preventDefault();
        console.log('OPEN POLL');
      }
    }, false);

  }

  function socketListener() {
    socket = io.connect(window.location.origin);
    socket.on('vote', function (v) {
//      console.log(v);
      vote(v);
    });
  }

  function vote(vote) {
    var poll = pollData[vote.pollId];

    if(!poll){
      console.log('Unknown poll: ' + vote.pollId);
    } else {
      var option = _.find(pollData[vote.pollId], function(option) {
        return option.option === vote.option;
      });

      if(option == undefined) {
        console.log('Unknow option: ' + vote.option, ', poll: ' + vote.pollId);
      } else {
        option.total++;
        console.log(option);
        updateChart(vote.pollId);
      }
    }
  }

  function buildPieChart(container, pollId) {
    var svg = d3.select(container).append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("id", "pieChart")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var path = svg.selectAll("path")
      .data(pie(pollData[pollId]))
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
  }

  function updateChart(pollId) {
    var svg = d3.select('div[poll=' + pollId + '] > div.poll-results > svg > g');

    var data = pollData[pollId];
    console.log(data);
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

  function buildPolls() {
    var polls = document.querySelectorAll('div[poll]');

    for (var i = 0; i < polls.length; ++i) {
      var poll = polls[i];
      var pollId = poll.getAttribute("poll");
      var options = poll.querySelectorAll('li[option]');

      pollData[pollId] = [];

      for (var j = 0; j < options.length; ++j) {
        var li = options[j];
        var div = document.createElement('div');
        var option = options[j].getAttribute('option');

        pollData[pollId].push({
          option: option,
          total: 1
        });

        div.innerText = option;
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

      buildPieChart(results, pollId)
    }

    console.log(pollData);
  }

  function init() {
    // Setup socket listeners
    socketListener();
    keyboardListener();
    buildPolls();
  }

  function getPollData() {
    // TODO, clone data before returning
    return pollData;
  }

  return {
    init: init,
    getPollData: getPollData
  }
})();

//
//var _data1 = [
//  {option: 'A', total: 1},
//  {option: 'B', total: 1},
//  {option: 'C', total: 1},
//  {option: 'D', total: 1},
//  {option: 'E', total: 1}
//];
//
//var _data2 = [
//  {option: 'A', total: 1000},
//  {option: 'B', total: 333},
//  {option: 'C', total: 2000},
//  {option: 'D', total: 2000},
//  {option: 'D', total: 2000},
//  {option: 'D', total: 2000},
//  {option: 'D', total: 2000},
//  {option: 'E', total: 3000}
//];
//
//var _data3 = [
//  {option: 'A', total: 500},
//  {option: 'B', total: 33},
//  {option: 'C', total: 1000},
//  {option: 'D', total: 5000}
//];



