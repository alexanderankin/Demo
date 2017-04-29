var globalData = null;

var events = new EventEmitter();

// var demoTextTarget = $('#stream'); // moved to document-ready
var demoTextTarget = null;
function addToDemoText(text) {
  demoTextTarget.html(demoTextTarget.html() + '\n' + text);
}

var receiver = new EventSource('/stream');
receiver.addEventListener('message', function (e) {
  var data = JSON.parse(e.data);
  // console.log(e)
  
  // this is for the graph
  if (data.graph) {
    events.emitEvent('graph-point', [data.graph.x, data.graph.y]);
    // try {} catch (ignored) { console.log('line 19'); } // i think not reqd
  }

  // this is for the log
  else if (data.text) {
    addToDemoText(data.text);
  }

  // variable dump into log
  else {
    addToDemoText(JSON.stringify(data));
  }

  globalData = data;
});

function makeGraphDataContainer() {
  var plot = null;
  var allData = [];
  function addData(x, y) { allData.push([x, y]); }
  function render() {
    if (plot) plot.destroy();
    plot = $.jqplot("graph", [allData], { seriesDefaults: {
      linePattern: 'dashed', showMarker: false, shadow: false
    }});
  }
  return { add: addData, render: render };
}
var graphData = makeGraphDataContainer();

$(document).ready(function () {
  demoTextTarget = $('#stream');
  events.addListener('graph-point', function (x, y) {
    // console.log(x, y)
    graphData.add(x, y); graphData.render();
  });

  // update the port dynamically if necessary
  $.get('/port', function (data) {
    console.log($('#port-holder').html())
    $('#port-holder').html(
      $('#port-holder').html().split('=').slice(0,-1)  // take off end
        .concat(data)  // put on new end
        .join('=')  // put back together
    );
  });
});
