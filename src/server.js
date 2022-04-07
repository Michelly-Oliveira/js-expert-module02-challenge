const http = require('http');
const { join } = require('path');

const CarService = require('./service/carService');
const carsDatabase = join(__dirname, './../database', 'cars.json');

const routes = {
	'/rent:post': async (request, response) => {
		for await (const data of request) {
			const params = JSON.parse(data);

			if (!params.customer || !params.carCategory || !params.numberOfDays) {
				response.writeHead(400);
				response.write('Invalid params');
				return response.end();
			}

			const { customer, carCategory, numberOfDays } = params;
			const carService = new CarService({ cars: carsDatabase });

			const transactionReceipt = await carService.rent({
				customer,
				carCategory,
				numberOfDays,
			});

			return response.end(JSON.stringify(transactionReceipt));
		}
	},
	default: (request, response) => {
		return response.end(
			JSON.stringify({
				message: 'Hello There',
			})
		);
	},
};

const handleRequest = (request, response) => {
	const { url, method } = request;
	const routeKey = `${url}:${method.toLowerCase()}`;
	const chosenRoute = routes[routeKey] || routes.default;

	// default header response
	response.writeHead(200, {
		'Content-Type': 'application/json',
	});

	return chosenRoute(request, response);
};

const app = http
	.createServer(handleRequest)
	.listen(3000, () => console.log('app running on port 3000'));

module.exports = app;
