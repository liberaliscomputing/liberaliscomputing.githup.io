//Set the size of window as responsive
var width = window.innerWidth,
	height = window.innerHeight;

//Create SVG element
var svg = d3.select("#vis")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

//Initialize a default force layout
var force = d3.layout.force()
	.gravity(0.05)
	.linkDistance(75)
	.charge(-1000)
	.friction(0.5)
	.size([width, height]);

d3.json("data/converted.json", function(error, json) {
	if (error) throw error;

	// Use stringfied sources and targets
	var nodeMap = {};
	json.nodes.forEach(function(x) { nodeMap[x.name] = x; });
	json.links = json.links.map(function(x) {
		return {
			source: nodeMap[x.source],
			target: nodeMap[x.target]
		};
	});

	//Import data
	force
		.nodes(json.nodes)
		.links(json.links)
		.start();

	var links = svg.selectAll(".link")
		.data(json.links)
		.enter().append("path")
		.attr("class", "link")
		.style("fill", "none")
		.style("stroke", "#eee")
		.style("stroke-width", 2);

	var nodes = svg.selectAll(".node")
		.data(json.nodes)
		.enter().append("g")
		.attr("class", "node")
		.call(force.drag);

	nodes.append("svg:circle")
		.attr("r", 15)
		.style("fill", "#eee");

	//Append profile images
	var images = nodes.append("image")
		.attr("xlink:href", function(d) { return imgUrlCheck(d.img); })
		.attr("x", -8)
		.attr("y", -8)
		.attr("width", 16)
		.attr("height", 16);

	var setEvents = nodes
		//Open a clicked handle's Twitter profile
		.on('click', function(d) {
			var url = 'https://twitter.com/' + d.name;
			window.open(url,'_blank');
		})
		//Magnify nodes
		.on('mouseenter', function() {
			d3.select(this).select("circle")
				.transition()
				.attr("r", 30);
			d3.select(this).select("image")
				.transition()
				.attr("x", function(d) { return -16;})
				.attr("y", function(d) { return -16;})
				.attr("height", 32)
				.attr("width", 32);
			d3.select(this).select("text")
				.transition()
				.style("font", "24px sans-serif");
		})
		//Set back
		.on('mouseleave', function() {
			d3.select(this).select("circle")
				.transition()
				.attr("r", 15);
			d3.select(this).select("image")
				.transition()
				.attr("x", -8)
				.attr("y", -8)
				.attr("height", 16)
				.attr("width", 16);
			d3.select(this).select("text")
				.transition()
				.style("font", "12px sans-serif");
		});

	//Label nodes
	var text = nodes.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.name });

	force.on("tick", function() {
		links.attr("d", curvedLink);
		nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	});
});

//Check 404 error of profile image
function imgUrlCheck(url) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, false);
	xhr.send();
	if (xhr.status == 404) return "https://abs.twimg.com/favicons/favicon.ico";
	else return url;
}

//Transform edges to curved lines
function curvedLink(d) {
	var dx = d.target.x - d.source.x,
		dy = d.target.y - d.source.y,
		dr = Math.sqrt(dx * dx + dy * dy);
	return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
}

