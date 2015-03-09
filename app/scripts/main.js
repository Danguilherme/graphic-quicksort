'use strict';

function quicksort(a) {
  if (a.length === 0) return [];

  var left = [], right = [], pivot = a[0];

  for (var i = 1; i < a.length; i++) {
    a[i] < pivot ? left.push(a[i]) : right.push(a[i]);
  }

  return quicksort(left).concat(pivot, quicksort(right));
}

function quicksortMetadata(config, a, path) {
  if (a.length === 0) return null;

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

  for (var i = 1; i < a.length; i++) {
    a[i] < pivot ? left.push(a[i]) : right.push(a[i]);
  }

  path.left = quicksortMetadata(config, left);
  path.right = quicksortMetadata(config, right);
  return path;
}

function node2tree(node, side, parent) {
  if (!node) return null;

  var treeNode = {
    parent: parent || null,
    collection: node.collection,
    pivot: node.pivot,
    children: [],
    side: side || null
  };

  if (!!node.left)
    treeNode.children.push(node2tree(node.left, 'left', treeNode));

  if (!!node.right)
    treeNode.children.push(node2tree(node.right, 'right', treeNode));

  return treeNode;
}

function Node(collection) {
  this.collection = collection;
  this.left = null;
  this.right = null;
  this.pivot = null;
}


$(function() {
  // ************** Generate the tree diagram  *****************
  var margin = {top: 60, right: 20, bottom: 60, left: 20},
    width = 960 - margin.right - margin.left,
    height = 1024 - margin.top - margin.bottom;

  var svg = d3.select('#drawing-target').append('svg')
  .attr('width', width + margin.right + margin.left)
  .attr('height', height + margin.top + margin.bottom);
  var board = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var tree = d3.layout.tree()
    .size([height, width]);

  var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]; });

  var i = 0;
  function updateTree(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(source).reverse();
    var links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 120; });

    // Declare the nodesâ€¦
    var node = board.selectAll('g.node')
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

     // Enter the nodes.
      var nodeEnter = node.enter().append('g')
      .attr('class', function(d) {
        var classes = 'node';
        if (!d.children || !d.children.length) {
          classes += ' no-child';
        }
        return classes;
      })
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

     nodeEnter.append('ellipse')
      .attr('rx', function(d) { return Math.max(((d.collection.toString()).length * 5), 20); })
      .attr('ry', function() { return Math.min(d3.select(this).attr('rx'), 30); });

     nodeEnter.append('text')
       .attr('dy', '.35em')
       .attr('text-anchor', 'middle')
       .style('fill-opacity', 1)
       .text(function(d) { return d.collection.join(', '); });

     node.exit().transition()
       .style('opacity', 0)
       .remove();

    var pivot = nodeEnter.append('g')
      .attr('class', 'pivot')
      .attr('title', 'Pivot')
      .attr('transform', function() {
        return 'translate(0, ' + d3.select(this.parentNode.firstChild).attr('ry') + ')';
      });

    pivot.append('rect')
      .attr('height', 25)
      .attr('width', function(d) { return Math.max(((d.pivot.toString()).length * 10) + 10, 20); })
      .attr('transform', function() {
        return 'translate(-' + d3.select(this).attr('width') / 2 + ',-5)';
      });
    pivot.append('text')
      .attr('dy', 13)
      .attr('text-anchor', 'middle')
      .style('fill-opacity', 1)
      .text(function(d) { return d.pivot; });

    // Declare the linksâ€¦
    var link = board.selectAll('g.link')
      .data(links, function(d) { return d.target.id; });

    // Enter the links.
    var linkGroup = link.enter().insert('g', 'g.node')
      .attr('class', 'link');

    linkGroup.append('line')
      .attr('class', 'link')
      // for diagonal (path)
      // .attr('d', diagonal)
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });
    linkGroup.append('text')
      .attr('x', function(d) { return (d.source.x + d.target.x) / 2; })
      .attr('y', function(d) { return (d.source.y + d.target.y) / 2; })
      .attr('dy', 20)
      .attr('text-anchor', 'middle')
      .style('fill-opacity', 1)
      .attr('title', function(d) {
        return 'Items ' + (d.target.side === 'left' ? 'less' : 'greater') + ' than ' + d.source.pivot;
      })
      .text(function(d) { return d.target.side === 'left' ? '<' : '>'; });

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .style('opacity', 0)
      .remove();

    var depth = d3.max(nodes, function(d) { return d.depth; }) + 1;
    svg.attr('height', (depth * 120) + (margin.top + margin.bottom));
  }

  function updateSortInfo(config, collection) {
    var sorted = quicksort(collection);
    var metadata = quicksortMetadata(config, collection);
    var treeRoot = node2tree(metadata);
    var nodes = tree.nodes(treeRoot).reverse();

    var depth = d3.max(nodes, function(d) { return d.depth; }) + 1;

    console.log('sorted:', sorted);
    console.log('metadata:', metadata);
    console.log('treefy:', treeRoot);

    $('#original-collection').text(collection.join(', '));
    $('#sorted-collection').text(sorted.join(', '));
    $('#depths').text(depth);
  }

  function draw(config, collection) {
    console.log('Drawing quicksort for collection', collection);
    var metadata = quicksortMetadata(config, collection);
    var treeRoot = node2tree(metadata);

    updateTree(treeRoot);
    updateSortInfo(config, collection);
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
      $('#sort-visualization').removeClass('hidden');
    else {
      $('#sort-visualization').addClass('hidden');
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

});
