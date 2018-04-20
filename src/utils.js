import {csv,json,format} from 'd3'; // importing csv function from d3 library

export const parse = d => {
	const date = new Date(d.Date);

	return {
		date: date,
		cuisine: d.cuisine,
		vendor: d.Name,
		address: d.Street_Address,
		amt: +d.Amount,
		city: d.City,
		state: d.State,
		lng: d.lon,
		lat: d.lat
	};
};

export const fetchCsv = (url, parse) => {
	return new Promise((resolve, reject) => {
		csv(url, parse, (err, data) => { // csv imported ad name function, doesn't need 'd3.' prefix
			if(err){
				reject(err);
			}else{
				resolve(data);
			}
		})
	});
};

export const fetchJson = (url) => {
	return new Promise((resolve, reject) => {
		json(url, (err, data) => {
			if(err){
				reject(err);
			}else{
				resolve(data);
			}
		})
	});
}

export const formatMoney = d => {
	return "$" + formatDecimal(d);
};

export const formatDecimal = format(',.2f');
