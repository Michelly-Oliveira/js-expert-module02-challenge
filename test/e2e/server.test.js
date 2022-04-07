const { expect } = require('chai');
const sinon = require('sinon');
const { describe, it, beforeEach, afterEach } = require('mocha');
const request = require('supertest');

const app = require('../../src/server');
const Transaction = require('../../src/entities/transaction');

const mocks = {
	customer: require('../mocks/valid-customer.json'),
	carCategory: require('../mocks/valid-carCategory.json'),
	car: require('../mocks/valid-car.json'),
};

describe('API Suite Test', () => {
	let sandbox = {};

	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('/rent', () => {
		it('should request a car rent passing the correct params, and return HTTP Status 200 and the transaction receipt', async () => {
			const { customer, car } = mocks;
			const carCategory = {
				...mocks.carCategory,
				carIds: [car.id],
			};
			const numberOfDays = 5;

			const now = new Date(2022, 3, 5);
			sandbox.useFakeTimers(now.getTime());

			const transaction = new Transaction({
				customer,
				car,
				amount: new Intl.NumberFormat('pt-br', {
					style: 'currency',
					currency: 'BRL',
				}).format(197.45),
				dueDate: '10 de abril de 2022',
			});

			const response = await request(app).post('/rent').send({
				customer,
				carCategory,
				numberOfDays,
			});

			expect(response.statusCode).to.be.equal(200);
			expect(response.body).to.be.deep.equal(transaction);
		});

		it('should throw an error if the params are not correct', async () => {
			const response = await request(app).post('/rent').send({});

			expect(response.statusCode).to.be.equal(400);
			expect(response.text).to.be.deep.equal('Invalid params');
		});
	});

	describe('Default route', () => {
		it('should redirect to / when an inexistent route is called', async () => {
			const response = await request(app).get('/unknow').expect(200);

			expect(response.body).to.be.deep.equal({
				message: 'Hello There',
			});
		});
	});
});
