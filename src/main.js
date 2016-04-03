/**
 * @license MIT Copyright 2016 Daniel Imms (http://www.growingwiththeweb.com)
 */
'use strict';

var SortAction = require('./sort-action');
var SortPane = require('./sort-pane');
var sorts = require('./sort-definitions');

var ARRAY_SIZE = 20;

function init() {
  //sorts.forEach(runSort);
  var initialArray = generateRandomArray();
  sorts.forEach(function (sort) {
    sort.pane = new SortPane(sort, initialArray);
  });
}

document.querySelector('#play-all').addEventListener('click', playAll);

init();

function generateRandomArray() {
  var array = [];
  for (var i = 1; i <= ARRAY_SIZE; i++) {
    array.push(i);
  }
  for (var i = 0; i < array.length; i++) {
    var j = Math.floor(Math.random() * ARRAY_SIZE);
    if (i !== j) {
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
  return array;
}

function playAll() {
  sorts.forEach(function (sort) {
    sort.pane.play();
  });
}



function runSort(sortDefinition) {
  var snap = Snap(sortDefinition.svg);

  // Create dummy data
  var data = generateRandomArray();

  // Create data rectangles
  var dataRects = generateElementRectangles(snap, data);
  var sortActions = sort(data, dataRects, sortDefinition.algorithm);
  function finishedPlayback() {

  }
  playSortActions(sortActions, dataRects, finishedPlayback);
}



function generateElementRectangles(snap, array) {
  var rects = [];
  for (var i = 0; i < array.length; i++) {
    var x = 5 + i * 12; // 10 + 2 padding
    var width = 10;
    var height = array[i] * 6;
    var y = 125 - height;
    var rect = snap.rect(x, y, width, height);
    rects.push(rect);
  }
  return rects
}

function sort(data, dataRects, algorithm, customCompare) {
  var sortActions = [];
  algorithm.attachCompareObserver(function (data, a, b) {
    sortActions.push(new SortAction(a, b, SortAction.COMPARE));
  });
  algorithm.attachSwapObserver(function (array, a, b) {
    sortActions.push(new SortAction(a, b, SortAction.SWAP));
  });
  algorithm(data, customCompare);
  algorithm.detachCompareObserver();
  algorithm.detachSwapObserver();
  // Run sortActions over dataRects
  return sortActions;
}

function playSortActions(sortActions, dataRects, cb) {
  var SPEED = 20;
  if (sortActions.length === 0) {
    cb();
    return;
  }
  var action = sortActions.shift();
  if (action.isSwapAction()) {
    // Animate x values
    var temp = dataRects[action.a].getBBox().x;
    dataRects[action.a].animate({
      x: dataRects[action.b].getBBox().x
    }, SPEED);
    dataRects[action.b].animate({
      x: temp
    }, SPEED);
    // Swap indexes
    temp = dataRects[action.a];
    dataRects[action.a] = dataRects[action.b];
    dataRects[action.b] = temp;
  }
  if (action.isCompareAction()) {
    dataRects[action.a].attr({
      fill: "#e0544c"
    });
    dataRects[action.b].attr({
      fill: "#e0544c"
    });
  }

  setTimeout(function () {
    if (action.isCompareAction()) {
      dataRects[action.a].attr({
        fill: "#1e1e38"
      });
      dataRects[action.b].attr({
        fill: "#1e1e38"
      });
    }
    playSortActions(sortActions, dataRects, cb);
  }, SPEED * 2);
}

function reverseCompare(a, b) {
  return b - a;
}
