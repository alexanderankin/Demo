var globalData = null;

var events = new EventEmitter();

var targetEl = $('#stream');
function addToDemoText(text) {
  targetEl.html(targetEl.html() + '\n' + text);
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
  events.addListener('graph-point', function (x, y) {
    // console.log(x, y)
    graphData.add(x, y); graphData.render();
  });
});
