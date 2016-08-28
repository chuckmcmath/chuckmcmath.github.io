var DSTreemap = (function() {
    var that = {};

    var div;
    var baseData;
    var margin = {top: 40, right: 10, bottom: 10, left: 10},
        width = 750 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

    var selection = [];

    var color = d3.scale.category20c();

    var treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(true)
        .value(function(d) { return 1; });

    function position() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
    };

    /*
     * Really need a UUID or some such because removing items by their name
     * is a recipe for failure.... unless by some act of God there are no duplicate
     * names in the entire node namespace.
     */
    that.removeItem = function(name) {
        // ### FIXME
        var index = -1;
        selection.forEach(function(elem, eIndex) { if (elem.name === name) index = eIndex; })
        if (index != -1) {
            d3.select('#tab-' + selection[index].name).remove();
            selection.splice(index, 1);
        }
    };

    function addDiv(item) {
        // ### id and remove call should use UUID
        $('#selection')
            .append("<div id='tab-" + item.name + "' class='selection-tab'>" +
                    "<p class='seltext'>" + item.name +
                    "<div class='right' onclick='DSTreemap.removeItem(\"" + item.name +
                            "\")'><i class='fa fa-close'></i></div></div>")
    };

    function removeDiv(item) {
        $('#tab-' + item.name).remove();
    };

    function clearSelection() {
        selection.length = 0;
        d3.selectAll(".selection-tab").remove();
    };

    function toggleSelect(item) {
        var index = selection.indexOf(item);
        if (index === -1) {
            selection.push(item);
            addDiv(item);
        } else {
            selection.splice(index, 1);
            removeDiv(item);
        }

        // If adding, scroll the new div into view.
        if (index === -1) {
            $('#tab-' + item.name)[0].scrollIntoView();
        }
    };

    that.createTreemap = function(parentDivID, dataFile) {
        div = d3.select('#'+parentDivID).append("div")
            .style("position", "relative")
            .style("width", (width + margin.left + margin.right) + "px")
            .style("height", (height + margin.top + margin.bottom) + "px")
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");

        d3.json(dataFile, function(error, root) {
            console.log(root);
            baseData = root.children;

            if (error) throw error;

            var node = div.datum(baseData[1]).selectAll(".node")
                  .data(treemap.nodes)
                .enter().append("div")
                  .on("click", toggleSelect)
                  .attr("class", "node")
                  .call(position)
                  .style("background", function(d) { return d.children ? color(d.name) : null; })
                  .text(function(d) { return d.children ? null : d.name; });

            d3.selectAll("input").on("change", function change() {
                clearSelection();
                dataToUse = baseData[this.value]
                console.log(dataToUse.name);
                treemap.sticky(true);
                var node = div.datum(dataToUse).selectAll(".node")
                                .data(treemap.nodes);
                node.enter().append("div")
                    .on("click", toggleSelect)
                    .attr("class", "node");

                node.transition()
                    .duration(1500)
                    .call(position)
                    .style("background", function(d) { return d.children ? color(d.name) : null; })
                    .text(function(d) { return d.children ? null : d.name; });

                node.exit().remove();
            });
        });
    }

    return that;

})();
