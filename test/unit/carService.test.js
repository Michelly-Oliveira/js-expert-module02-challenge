const { expect } = require('chai');
const sinon = require('sinon');
const { describe, it, before, beforeEach, afterEach } = require('mocha');

const CarService = require('../../src/service/carService');
const Transaction = require('../../src/entities/transaction');

const mocks = {
	validCarCategory: require('../mocks/valid-carCategory.json'),
	validCar: require('../mocks/valid-car.json'),
	validCustomer: require('../mocks/valid-customer.json'),
};

describe('CarService Suite Tests', () => {
	let carService = {};
	let sandbox = {};

	before(() => {
		carService = new CarService({
			cars: {},
		});
	});

	beforeEach(() => {
		// before each test, create a 'clean' sinon
		sandbox = sinon.createSandbox();
	});

	afterEach(() => {
		// remove any modified stubs, mocks etc
		sandbox.restore();
	});

	it('should retrieve a random position from an array', async () => {
		const data = [0, 1, 2, 3, 4];

		const result = carService.getRandomPositionFromArray(data);

		expect(result).to.be.lt(data.length).gte(0);
	});

	it('should choose the first id from carIds in carCategory', async () => {
		const carCategory = mocks.validCarCategory;
		const carIdIndex = 0;
		const expectedCarId = carCategory.carIds[carIdIndex];

		// under the hood, the stubs also an spy
		sandbox.stub(carService, carService.getRandomPositionFromArray.name).returns(carIdIndex);

		const result = carService.chooseRandomCar(carCategory);

		expect(carService.getRandomPositionFromArray.calledOnce).to.be.ok;
		expect(result).to.be.equal(expectedCarId);
	});

	it('should return an available car given a carCategory', async () => {
		const carCategory = Object.create(mocks.validCarCategory);
		const expectedCar = mocks.validCar;
		carCategory.carIds = [expectedCar.id];

		sandbox.stub(carService.carRepository, carService.carRepository.find.name).returns(expectedCar);
		sandbox.spy(carService, carService.chooseRandomCar.name);

		const result = await carService.getAvailableCar(carCategory);

		expect(carService.chooseRandomCar.calledOnce).to.be.ok;
		expect(carService.carRepository.find.calledWithExactly(expectedCar.id)).to.be.ok;
		expect(result).to.be.deep.equal(expectedCar);
	});

	it('should calculate final amount in Real, given a carCategory, a customer and number of days', async () => {
		const customer = Object.create(mocks.validCustomer);
		customer.age = 50;

		const carCategory = Object.create(mocks.validCarCategory);
		carCategory.price = 37.6;

		const numberOfDays = 5;
		const expectedValue = carService.currencyFormat.format(244.4);

		// props don't have a .name
		sandbox.stub(carService, 'taxesBasedOnAge').get(() => [{ from: 40, to: 50, then: 1.3 }]);

		const result = await carService.calculateFinalPrice({
			customer,
			carCategory,
			numberOfDays,
		});

		expect(result).to.be.deep.equal(expectedValue);
	});

	it('should return a transaction receipt given a customer and a car category', async () => {
		const car = mocks.validCar;
		const carCategory = {
			...mocks.validCarCategory,
			price: 37.6,
			carIds: [car.id],
		};

		const customer = Object.create(mocks.validCustomer);
		customer.age = 50;

		const expectedAmount = carService.currencyFormat.format(244.4);

		const numberOfDays = 5;
		const dueDate = '10 de novembro de 2020';

		// mock all calls to the Date object, to return the date 5 de novembro de 2020
		const now = new Date(2020, 10, 5);
		sandbox.useFakeTimers(now.getTime());

		sandbox.stub(carService.carRepository, carService.carRepository.find.name).returns(car);

		const result = await carService.rent({ customer, carCategory, numberOfDays });

		const expectedTransaction = new Transaction({
			customer,
			car,
			amount: expectedAmount,
			dueDate,
		});

		expect(result).to.be.deep.equal(expectedTransaction);
	});
});
