//Import d3.js
import * as d3 from 'd3';

//Import utility function
import {formatMoney,formatDecimal} from '../utils';


function DrawMap(_){
	// DOM element === _

	let _w;
	let _h;

	const projection = d3.geoMercator()
		.scale(400000)
		.center([-71.0589, 42.3601]);

	const path = d3.geoPath()
		.projection(projection);

	const scaleSize = d3.scaleSqrt()
		.domain([0,3000])
		.range([3,20]);

	const _dispatch = d3.dispatch('circle:enter', 'circle:leave');

	function exports(data,mapTile){

		// _ ===> div.main element
		_w = _.clientWidth;
		_h = _.clientHeight;

		projection.translate([_w/2, _h/2]);

		//Data Transformation
		const dataMap = d3.nest()
			.key(d => d.vendor)
			.sortValues((a,b) => b.amt - a.amt)
			.entries(data)
			.map(d => {
				const [x,y] = projection([d.values[0].lng, d.values[0].lat]);
				return {
					x: x,
					y: y,
					vendor: d.key,
					amt: d3.sum(d.values, e => e.amt),
					volume: d.values.length,
					avg: d3.sum(d.values, e => e.amt) / d.values.length,
					main_cuisine: d.values[0].cuisine
				}
			});

		console.log(data)
		console.log(dataMap)

		const listCategories = d3.nest()
			.key(d => d.main_cuisine)
			.entries(dataMap)
			.map(d => d.key);

		console.log(listCategories);

		// construct colorScale
		const colorScale = d3.scaleOrdinal()
			.domain(listCategories)
			.range(d3.schemeCategory10);

		// Append SVG canvas
		const root = d3.select(_)

		let svg = root.selectAll('.svg')
			.data([1]);

		svg = svg.enter().append('svg')
			.classed('svg', true)
			.merge(svg)
			.attr('width', _w)
			.attr('height', _h);

		// Append map-tile <g>
		let map = svg.selectAll('.map-tile')
			.data([1]);
		map.exit().remove();
		map = map.enter().append('g')
            .classed('map-tile', true)
			.merge(map);

		// Draw Map to SVG
		let mapUpdate = map.selectAll('.state-path')
			.data(mapTile.features)

		const mapEnter = mapUpdate.enter()
			.append('path')
			.classed('state-path', true);

		mapUpdate = mapUpdate.merge(mapEnter)
			.attr('d', path)
			.attr('fill', 'gainsboro')
			.attr('stroke', 'grey')
			.attr('stroke-width', 0.5);

		// Append plot <g>
		let plot = svg.selectAll('.plot')
			.data([1]);
		plot.exit().remove();
		plot = plot.enter().append('g')
            // .attr('transform', `translate(${margin.l},${margin.t})`)
            .classed('plot', true)
			.merge(plot);

		// Draw nodes to SVG
		// draw State House
		let [locx, locy] = projection([-71.0659988, 42.3587772])
				plot.append('circle')
					.attr('r',8)
					.attr('fill', 'yellow')
					.attr('transform', `translate(${locx}, ${locy})`);


		let nodes = plot.selectAll('.node')
			.data(dataMap);

		const nodesEnter = nodes.enter()
			.append('g')
			.classed('node', true)
			.attr('id', d => d.vendor);

		nodesEnter.append('circle')
			// .attr('r', d => scaleSize(d.volume))
			.attr('r', 5)
			.style('fill', d => colorScale(d.main_cuisine))
			.style('fill-opacity', .5)
			.on('mouseenter', function(d){
                _dispatch.call('circle:enter', this, d);
			})
			.on('mouseleave', function(d){
				_dispatch.call('circle:leave', this, d);
			});
			// .style('stroke', 'black')
			// .style('stroke-width', .5);

		nodes.exit().remove();
		// stationsEnter.append('text').text(d => d.id_short);

		nodes = nodes.merge(nodesEnter)
			.attr('transform', d => `translate(${d.x}, ${d.y})`);

		// activate zoom
		const zoom = d3.zoom()
					 .scaleExtent([1,30])
					 .on("zoom", zoomed);

		svg.call(zoom);

	}

	exports.on = function(eventType, cb) {
		// eventType is a string
		// cb is a function
		_dispatch.on(eventType, cb);
		return this;
	}

	return exports;
}

export default DrawMap;

function zoomed() {
	const svg = d3.select('.svg');
	svg.attr("transform", d3.event.transform);

	// state paths
	d3.selectAll(".state-path")
		.transition()
		.duration(25)
		.attr("stroke-width", 1/d3.event.transform.k);

	// By project circles
	d3.selectAll(".node")
		.transition()
		.duration(50)
		.attr("r", 1/d3.event.transform.k);
}
