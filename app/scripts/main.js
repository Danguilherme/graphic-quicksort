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

function quicksortMetadata(config, a, path) {
  if (a.length == 0) return [];

  config = config || {
    pivot: 'middle' // 'start' | 'middle' | 'end'
  };

  var index;

  if (config.pivot === 'start') index = 0;
  else if (config.pivot === 'middle') index = parseInt(a.length / 2);
  else if (config.pivot === 'end') index = a.length - 1;

  var left = [], right = [], pivot = a[index];

  path = path || new Node(a);
  path.pivot = pivot;

  for (var i = 0; i < a.length; i++) {
    if (i === index) continue;
    a[i] < pivot ? left.push(a[i]) : right.push(a[i]);
  }


  path.left = quicksortMetadata(config, left);
  path.right = quicksortMetadata(config, right);
  return path;
}


$(function() {
  var collection = 'ORDENAR';

  function draw(config, collection) {
    console.log('Drawing quicksort for collection', collection);
    var metadata = quicksortMetadata(config, collection);
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

  function onCollectionInput() {
    var rdoPivotPosition = $('[name="pivot-position"]:radio:checked');
    var txtCollectionInput = $('#collection-input');

    var strCollection = txtCollectionInput.val();
    var array;
    var config = {};

    config.pivot = rdoPivotPosition.val();

    // if it's a list (contains comma)
    if (strCollection.search(',') !== -1) {
      array = strCollection.split(',');
      for (var i = 0; i < array.length; i++) array[i] = parseFloat(array[i]);
    } else
      array = strCollection.split('');

    if (array && array.length)
      $('#drawing-root').removeClass('hidden');
    else {
      $('#drawing-root').addClass('hidden');
      return;
    }

    draw(config, array);
  }

  $('[name="pivot-position"]:radio')
    .change(onCollectionInput);

  $('#collection-input')
    .change(onCollectionInput)
    .change()
    .tokenfield();

  onCollectionInput($('#collection-input'));
});
