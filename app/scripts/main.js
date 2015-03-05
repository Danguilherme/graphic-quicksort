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
          ('<span class="collection">' + data.collection.join(', ') + '</span>') : '';
      else
        return '';
    }

    function drawQuicksortTree(root, parent) {
      if (root.datum() instanceof Array)
        return;

      if (parent) {
        root.append('span')
          .attr('class', 'pivot')
          .attr('title', 'Pivot')
          .text(parent.datum().pivot);
      }

      root.selectAll('div.node')
          .data([root.datum().left, root.datum().right])
        .enter().append('div')
          .attr('class', 'node')
          .attr('class', function(d, i) {
            return i == 0 ? 'left' : 'right';
          })
          .style('left', function(d) { return d.collection ? d.collection[0] : 0; })
          .html(getText)
          .each(function(d) { drawQuicksortTree(d3.select(this), root); });
    }

    $('#drawing-root').children().remove();

    var root = d3.select('#drawing-root').selectAll('div.root')
        .data([metadata])
      .enter().append("div")
        .attr('class', 'root')
        .html(getText);

    drawQuicksortTree(root);

    root.append('span')
      .attr('class', 'collection collection-result')
      .text(sorted.join(', '));
  }

  function onCollectionInput(input) {
    var value = $(input).val();
    var array;

    if (value.search(',') != -1) {
      array = value.split(',');
      for (var i = 0; i < array.length; i++) {
        array[i] = parseFloat(array[i]);
      }
    } else {
      array = value.split('');
    }

    draw(array);
  }

  $('#collection-input')
    .tokenfield()
    .change(function() {
      onCollectionInput(this);
    })
    .keypress(function(ev) {
      console.log(ev, ev.code);
    });

  onCollectionInput($('#collection-input'));
});
