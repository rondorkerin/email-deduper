import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import faker from 'faker';

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

// generates 100,000 email addresses containing 50% randomly placed duplicates
function generateInput() {
  new App().generateInput();
}

let testInput;

beforeAll(() => {
  testInput = generateInput();
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});

it('can dedupe an empty array', () => {
  const output = new App().dedupe([]);
  expect(output).toEqual([]);
});

it('creates a test input of the appropriate length', () => {
  expect(testInput.length).toEqual(100000);
});

/*
it('leaves the resulting list in the original order', () => {
  const output = new App().dedupe(testInput);
  let previousEarliestIndex = 0;
  for (let email of output) {
    let earliestIndex = testInput.indexOf(email);
    if (earliestIndex < previousEarliestIndex) {
      throw `${email} is out of order`;
    }
    previousEarliestIndex = earliestIndex;
  }
});
*/

it('runs well under one second', () => {
  const app = new App();
  var start = new Date();
  const output = app.dedupe(testInput);
  // expect this to run in < 800 ms
  expect(new Date() - start).toBeLessThan(800);
});

it('has an output that is smaller than the input', () => {
  const app = new App();
  const output = app.dedupe(testInput);
  console.log('trimmed', testInput.length, 'to', output.length);
  expect(output.length).toBeLessThan(testInput.length);
});

