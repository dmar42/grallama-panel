import _ from 'lodash';
import $ from 'jquery';
import 'jquery.flot';
import 'jquery.flot.pie';
import * as d3 from 'd3';


export default function link(scope, elem, attrs, ctrl) {
  var data, panel, matrix;
  elem = elem.find('.matrix-panel');
  var $tooltip = $('<div id="tooltip">');

  ctrl.events.on('render', function() {
    render();
    ctrl.renderingCompleted();
  });

  function setElementHeight() {
    try {
      var height = ctrl.height || panel.height || ctrl.row.height;
      if (_.isString(height)) {
        height = parseInt(height.replace('px', ''), 10);
      }

      height -= 5; // padding
      height -= panel.title ? 24 : 9; // subtract panel title bar

      elem.css('height', height + 'px');

      return true;
    } catch(e) { // IE throws errors sometimes
      return false;
    }
  }

  function render() {
    if (!ctrl.data) { return; }

    data = ctrl.data;
    panel = ctrl.panel;
    matrix = ctrl.matrix;

    // These margins would need to be dynamic based on the axis labels
    var margin = { top: 50, right: 0, bottom: 100, left: 50 },
        height = (20 * matrix.srcs.length) + margin.top,
        width = (20 * matrix.dsts.length) + margin.left,
        cellWidth = Math.floor(width / matrix.dsts.length),
        cellHeight = Math.floor(height / matrix.srcs.length);

    var matrix_svg = d3.select(elem[0]).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        // May need something here about margins, but I don't know why
        // Seems to be for shifting the position to add margins, but unsure why
        // especially if it's the top level item
        // It seems like by default this actually goes negatively to the left outside
        // of the SVG canvas.
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y_labels = matrix_svg.selectAll('.yLabel')
        .data(ctrl.matrix.srcs)
        .enter() // Initial join of data, creates an element for each item in data
        .append('text')  // Does this for each element in data
            .text(function (d) { return d; })  // The value should be the data itself
            .attr('x', 0)  // Because this is the y-axis labels
            // Determine the y coordinates based on index and cell heights
            // uses a function, that gets provided the data element and index
            .attr('y', function (d, i) { return i * cellHeight; } )
            .style('text-anchor', 'end') // Attach the end of the text to the x/y point
            // Another transform may need to go here, but unclear why
            // and what the values mean
            // It seems like this is to providing a gap between the label and the edge
            // of the grid, plus moving the value a bit so it's centered for the cell
            // locations.
            .attr("transform", "translate(-6," + cellHeight / 1.5 + ")")
            // This is used for styling, so these should refer to CSS
            .attr("class", "yLabel mono axis");

    // Pretty similar deal for the x-axis
    var x_labels = matrix_svg.selectAll('.xLabel')
        .data(ctrl.matrix.dsts)
        .enter()
        .append('text')
            .text(function (d) { return d; })
            // .attr('x', function (d, i) { return i * cellWidth; } )
            // .attr('y', 0)
            // Setting this because of the rotation, so it stays against the grid
            .style("text-anchor", "end")
            // Need to do the transform in this way to account for how transforms are
            // done against the origin coordinates. Thought still not entirely clear
            // why this works.
            .attr("transform", function (d, i) {
                return "translate(" + ((i * cellWidth) + (cellWidth / 2)) + ", -6)rotate(90)"
            })
            .attr("class", "xLabel mono axis");

    // STILL NEED TO ACTUALLY ADD THE DATA CELLS IN THE GRID
    var cells = matrix_svg.selectAll('.grid-cell')
        .data(ctrl.matrix.cells)
        .enter()
        .append('rect')
            // To add text, I'd need a `g` to wrap, and then rect and text in it
            .attr('x', function(d) { return d.row * cellWidth;})
            .attr('y', function(d) { return d.col * cellHeight;})
            .attr('class', 'grid-cell')
            .attr('width', cellWidth)
            .attr('height', cellHeight)
            .style('fill', function(d) { return 'background-color' in d.style ? d.style['background-color'] : 'transparent';});
  }
}
