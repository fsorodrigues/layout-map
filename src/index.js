//Import d3.js
import * as d3 from 'd3';

//Import stylesheets
import './style/main.css';

//Import utility function
import {parse,fetchCsv,fetchJson, formatMoney} from './utils';

//Import modules
import DrawMap from './components/DrawMap';

//factory
const drawMap = DrawMap(document.querySelector('#map'));

// Promise.all expects array of promises
Promise.all([ // Promise.race moves to then with the 1st promise that resolves
		fetchCsv('./data/food_loc_clean.csv', parse),
		fetchJson('./data/ma_town_500k.json')
	]).then(([data,mapTile]) => {

		drawMap(data,mapTile);

	});

const tooltip = d3.select('body')
	.append('div')
	.classed('tooltip', true)
	.style('position', 'absolute')
	.style('background', 'lightgrey')
	.style('padding', '1%')
	.style('opacity', 0);

drawMap.on('circle:enter', function(d) {
	const thisEl = d3.select(this);
	thisEl.style('fill-opacity', 1);

	tooltip.style('left', (d3.event.pageX + 10) + 'px')
		.style('top', (d3.event.pageY - 28) + 'px')
		.style('opacity', 1);
		console.log(d);
	tooltip.html(`<p><b>${d.vendor} |</b> ${d.main_cuisine}</p>
				  <p>Total amount spent: ${formatMoney(d.amt)}</p>
			      <p>Average amount spent: ${formatMoney(d.avg)}</p>`
	);

}).on('circle:leave', function(d) {
	const thisEl = d3.select(this);
	thisEl.style('fill-opacity', .5);

	tooltip.style('left',0)
		.style('top',0)
		.style('opacity', 0);

	tooltip.html('');
});
