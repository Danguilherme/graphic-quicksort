"use strict"
console.log('\'Allo \'Allo!');

function quicksort(a) {
  if (a.length == 0) return [];

  var left = [], right = [], pivot = a[0];

  for (var i = 1; i < a.length; i++) {
      a[i] < pivot ? left.push(a[i]) : right.push(a[i]);
  }

  return quicksort(left).concat(pivot, quicksort(right));
}

function Node(collection) {
  this.collection = collection;
  this.left = [];
  this.right = [];
  this.pivot = null;
}

function Path(side, array, path, result) {
  this.right = null;
  this.rightArr = [];
  this.left = null;
  this.leftArr = null;
  this.result = [];

  if (!side) return;

  if (side instanceof Path) {
    this.right = left.right;
    this.left = left.left;
    this.result = left.result;
  } else {
    switch (side.toLowerCase()) {
      case 'left':
        this.left = path;
        this.leftArr = array;
        break;
      case 'right':
        this.right = path;
        this.rightArr = array;
        break;
    }
  }

  if (result)
    this.result = result;
}

function quicksortMetadata2(a, path) {
  console.log('quicksort', a);

  path = path || new Path();
  if (a.length == 0) return [];

  var left = [], right = [], pivot = a[0];

  for (var i = 1; i < a.length; i++) {
      a[i] < pivot ? left.push(a[i]) : right.push(a[i]);
  }

  console.group('quicksort');
  console.log('left', left);
  console.log('right', right);
  console.groupEnd();


  path.result = quicksort(left).concat(pivot, quicksort(right));
  path.left = new Path('left', left, quicksortMetadata(left));
  path.right = new Path('right', right, quicksortMetadata(right));
  return path;
}

function quicksortMetadata(a, path) {
  if (a.length == 0) return [];

  var left = [], right = [], pivot = a[0];
  path = path || new Node(a);
  path.pivot = pivot;

  for (var i = 1; i < a.length; i++) {
      a[i] < pivot ? left.push(a[i]) : right.push(a[i]);
  }


  path.left = quicksortMetadata(left);
  path.right = quicksortMetadata(right);
  return path;
}


$(function() {
  var collection = 'ORDENAR';

  function draw(collection) {
    console.log('Drawing quicksort for collection', collection);
    var metadata = quicksortMetadata(collection);
    var sorted = quicksort(collection);

    console.log('quicksort', sorted);
    console.log('metadata', metadata);


    function getText(data) {
    if (!!data && !!data.collection)
      return data.collection.length > 0 ?
        ('<span class="collection">' + data.collection + '</span>') : '';
    else
      return '';
    }

    function drawQuicksortTree(root) {
      if (root.datum() instanceof Array)
        return;

      root.selectAll('div.node.left')
          .data([root.datum().left])
        .enter().append('div')
          .attr('class', 'node')
          .attr('class', 'left')
          .style('left', function(d) { return d.collection ? d.collection[0] : 0; })
          .html(getText)
          .each(function(d) { drawQuicksortTree(d3.select(this)); });

      root.selectAll('div.node.right')
          .data([root.datum().right])
        .enter().append('div')
          .attr('class', 'node')
          .attr('class', 'right')
          // .append('span')
          //   .attr('class', 'collection')
          .html(getText)
          .each(function(d) { drawQuicksortTree(d3.select(this)); });
    }

    var root = d3.select('#drawing-root').selectAll('div.root')
        .data([metadata])
      .enter().append("div")
        .attr('class', 'root')
        .html(getText);

    drawQuicksortTree(root);

    root.append('span')
      .attr('class', 'collection-result')
      .text(sorted.toString());
  }

  $('#collection-input').change(function() {
    draw($(this).val());
  })
});
