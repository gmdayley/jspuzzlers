var Poller = (function () {
//  var body = document.body;
//  var voteConfig = Reveal.getConfig().vote;

  var pollData = {};
  var socket;
  var allowVotes = false;

  var width = 250,
    height = 250,
    radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal().range(["#88A825", "#35203B", "#911146", "#CF4A30", "#ED8C2B", "#CD8C2B", "#ED8D2B"]);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function (d) {
      return d.total;
    });

  var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 60);

  function slideListener() {
    // TODO - could use data-state
    // i.e <section data-state=poll>
    // addListener('poll')

    Reveal.addEventListener('slidechanged', function (event) {
      emitCurrentPoll();
    });

    hideAnswer();
  }

  function emitCurrentPoll() {
    var currentPoll = getCurrentPoll();
    if (currentPoll) {

      var pollId = currentPoll.getAttribute('poll');
      var currentPollData = pollData[pollId];

      socket.emit('polldata', {
        pollId: pollId,
        data: currentPollData.options
      });
    }
  }

  function keyboardListener() {
    document.addEventListener('keydown', function (event) {
      if (document.querySelector(':focus') !== null || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.keyCode === 86) { // 'v'
        allowVotes = true;
        emitCurrentPoll();
      } else if (event.keyCode == 67) { // 'c'
        allowVotes = false;
        showAnswer();
      }
    }, false);
  }

  function socketListener() {
    try {
      socket = io.connect(window.location.origin);
      socket.on('vote', function (v) {
        vote(v);
      });
    } catch(e) {
      console.log('don\'t care');
    }
  }

  function vote(vote) {
    //console.log('Incoming vote: ', vote);
    if(!allowVotes) return;

    // TODO - check vote.client to see it it has already voted

    var poll = pollData[vote.pollId];

    if (!poll) {
      console.log('Unknown poll: ' + vote.pollId);
    } else {
      var option = _.find(pollData[vote.pollId].options, function (option) {
        return option.option === vote.option;
      });

      if (option == undefined) {
        console.log('Unknown option: ' + vote.option, ', poll: ' + vote.pollId);
      } else {
        var alreadyVoted = _.contains(poll.voters, vote.client);
        if(!alreadyVoted) {
          console.log('Incoming vote: ', vote);
          option.total++;
          poll.voters.push(vote.client);
          updateChart(vote.pollId);
        }
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
      .data(pie(pollData[pollId].options))
      .enter()
      .append("path");

    path.transition()
      .duration(500)
      .attr("fill", function (d, i) {
        return color(d.data.option);
      })
      .attr("d", arc)
      .each(function (d) {
        this._current = d;
      }); // store the initial angles
  }

  function updateChart(pollId) {
    var svg = d3.select('div[poll=' + pollId + '] > div.poll-results > svg > g');

    var data = pollData[pollId].options;
    var path = svg.selectAll('path')
      .data(pie(data));

    path.transition().duration(750).attrTween("d", function (a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function (t) {
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

      pollData[pollId] = {
        voters: [],
        options: []
      };

      for (var j = 0; j < options.length; ++j) {
        var li = options[j];
        var div = document.createElement('div');
        var option = options[j].getAttribute('option');

        pollData[pollId].options.push({
          option: option,
          text: li.innerText,
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
  }

  function init() {
    // Setup socket listeners
    socketListener();
    slideListener();
    keyboardListener();
    buildPolls();
  }

  function getPollData() {
    // TODO, clone data before returning
    return pollData;
  }

  function getCurrentPoll() {
    return Reveal.getCurrentSlide().querySelector('div[poll]');
  }

  function showAnswer() {
    var $el = Reveal.getCurrentSlide().querySelector('.answer');
    if ($el) $el.classList.add('show');
  }

  function hideAnswer() {
    var $el = Reveal.getCurrentSlide().querySelector('.answer');
    if ($el) $el.classList.remove('show');
  }

  return {
    init: init,
    getPollData: getPollData
  }
})();


