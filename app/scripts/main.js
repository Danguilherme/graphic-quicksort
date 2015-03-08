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

function quicksortMetadata(a, path) {
  if (a.length == 0) return null;

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

function node2leaf(node, side, parent) {
  var treeNode = {
    parent: parent || null,
    collection: node.collection,
    pivot: node.pivot,
    name: node.collection.join(', '),
    children: [],
    side: side || null
  };

  if (!!node.left)
    treeNode.children.push(node2leaf(node.left, 'left', treeNode));

  if (!!node.right)
    treeNode.children.push(node2leaf(node.right, 'right', treeNode));

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
  var margin = {top: 120, right: 20, bottom: 120, left: 20},
   width = 960 - margin.right - margin.left,
   height = 1024 - margin.top - margin.bottom;

  var tree = d3.layout.tree()
   .size([height, width]);

  var diagonal = d3.svg.diagonal()
   .projection(function(d) { return [d.x, d.y]; });

  var svg = d3.select("#drawing-root").append("svg")
   .attr("width", width + margin.right + margin.left)
   .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var i = 0;
  function update(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(source).reverse(),
     links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 100; });

    // Declare the nodesâ€¦
    var node = svg.selectAll("g.node")
     .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    nodeEnter.append("ellipse")
      .attr("rx", function(d) { return Math.max((d.collection.length * 10), 2); })
      .attr("ry", function(d) {
        var width = d3.select(this).attr('rx');
        return Math.min(width, 30);
      });

    nodeEnter.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("fill-opacity", 1)
      .text(function(d) { return d.name; });

    var pivot = nodeEnter.append("g")
      .attr("class", "pivot")
      .attr("title", "Pivot")
      .attr("transform", function(d) {
        return "translate(0, " + d3.select(this.parentNode.firstChild).attr("ry") + ")";
      });

    pivot.append("circle")
      .attr("r", function(d) { return Math.max((d.pivot.toString()).length * 10, 1); });
    pivot.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("fill-opacity", 1)
      .text(function(d) { return d.pivot; });

    // Declare the linksâ€¦
    var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

    // Enter the links.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", diagonal);

    node.exit()
    .transition()
      .style("opacity", 0);
    link.exit()
    .transition()
      .style("opacity", 0);
  }

  function draw(collection) {
    console.log('Drawing quicksort for collection', collection);
    var metadata = quicksortMetadata(collection);
    var sorted = quicksort(collection);
    var treeRoot = node2leaf(metadata);

    console.log("sorted:", sorted, "metadata:", metadata, "treefy:", treeRoot);

    update(treeRoot);
  }

  $('#collection-input').change(function() {
    var value = $(this).val();
    var array;
    if (value.search(',') != -1) {
      array = value.split(',');
      for (var i = 0; i < array.length; i++) {
        array[i] = parseFloat(array[i]);
      }
    } else
      array = value.split('');

    draw(array);
  })
  .change();
});
