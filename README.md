## What Nick Did In Order (so you can see how my brain works)

### Understand the question, come up with a brute force plan
This is a remove duplicates problem.
The resulting list should be in the same order as the input list. In javascript, lists are a very
powerful data structure, able to be edited in place, so there is the possibility of using `slice`
to remove duplicates in place. Javascript has a lot of under-the-hood performance improvements and it is quite fast, so I'm going to start with the easiest solution that takes a lot of memory space.

I'm going to start by keeping a lookup table of email addresses, iterating through the list,
checking for duplicates. If there is a duplicate, I'll push it onto the output array. Since javascript arrays have a push operator this is really easy.

I'm going to create a unit test timing the runtime of this solution on 100k input emails. If it is > 0.8 seconds, I'll move onto another solution.

The thing I am having trouble understanding on the input array is "containing 50% randomly placed duplicates". I take this to mean that while setting up the input array of 100k emails, 50% of the emails will be duplicates in random locations. Cool.


### Create-React-App
I read on the email that you want a frontend for the service. Therefore, I decided, rather
than deploying both a node app and a frontend app or using node with jade, I would just
build a simple react-frontend that has the deduping algorithm within the App react component

I'm going to hijack `react-create-app`'s test suite which is already configured to use Babel,
it uses Jest which I've never used before. I've just used mocha and things.

* reads the jest page *

ok so it's just a zero config test suite, I can use `it` and `expect` like normal.

```
const add = require('./add');
describe('add', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

That's all I need to know. If you're following along the test is in `src/App.test.js` and the code is in `src/App.js`

Before writing any important logic I build a simple test and make sure it passes

```
it('can dedupe an empty array', () => {
  const output = new App().dedupe([]);
  expect(output).toEqual([]);
});
```
```
class App extends Component {
  dedupe(emailList) {
    const lookup = {};
    const output = [];
    return output;
  }
```

Now that that worked, I'll write the test that includes the two use cases.

First i create `generateInput`, which generates the 100k email addresses, 50% of which are
duplicates.

I'm going to use Faker.js to generate the emails.

`yarn add faker`

To be honest, an interesting subproblem is how to ensure that exactly 50k of these are dupes :)
I'll generate 50k unique emails and then 50k times I will randomly select a unique and splice it into
the input array.

```
// generates 100,000 email addresses containing 50% randomly placed duplicates
function generateInput() {
  let input = [];
  for (let i = 0; i < 50000; i++) {
    // generate 50k unique emails
    input.push(faker.internet.email());
  }
  for (let i = 0; i < 50000; i++) {
    // splice a random existing email from the input into another location in the input.
    input.splice(getRandomArbitrary(0, input.length), 0, input[getRandomArbitrary(0, input.length)]);
  }
  return input;
}
```

I make a small test for the test input and create a setup function

```
let testInput;

beforeAll(() => {
  testInput = generateInput();
});

it('creates a test input of the appropriate length', () => {
  expect(testInput.length).toEqual(100000);
});
```

It runs VERY slow.  (20 seconds+). In a production environment I would not bog down the test system
like this, I would save the resulting input to a file (like a VCR casette) and load it each time the test is run.


Now I test the condition that the resulting list is in the original order. This is also not trivial.
I go through the resulting list, keeping track of the earliest index i found that character in. If itwas found before, the resulting array is out of order. VERY interesting

```
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
```

Now I setup the runtime test. no need for process.hrtime.

```
it('runs well under one second', () => {
  const app = new App();
  var start = new Date();
  const output = app.dedupe(testInput);
  // expect this to run in < 800 ms
  expect(new Date() - start).toBeLessThan(800);
});
```

Time for the moment of truth. Let's write our very simple algorithm.

```
  dedupe(emailList) {
    const lookup = {};
    const output = [];
    for (let email of emailList) {
      if (!lookup[email]) {
        lookup[email] = true;
        output.push(email);
      }
    }
    return output;
  }
```

I AM FEELING SO LUCKY RIGHT NOW

```
 PASS  src/App.test.js (41.789s)
  ✓ renders without crashing (24ms)
  ✓ can dedupe an empty array (2ms)
  ✓ creates a test input of the appropriate length (1ms)
  ✓ leaves the resulting list in the original order (20528ms)
  ✓ runs well under one second (47ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        41.825s
Ran all test suites.

Watch Usage: Press w to show more.
```

Although this test suite took a long time to run, it was entirely due to the setup and checking
that the output list was in the correct order.

I need to verify that the algorithm actually worked though. So I need more tests.

```
it('has an output that is smaller than the input', () => {
  const app = new App();
  const output = app.dedupe(testInput);
  console.log('trimmed', testInput.length, 'to', output.length);
  expect(output.length).toBeLessThan(testInput.length);
});
```
The output:
    `trimmed 100000 to 49826`


This is more or less what we expect. This means that faker.js created 174 duplicate emails
when we called the `email` function. But it more or less matches with our test criteria which
is having 50% duplicates in the input array. In fact, it has more.

Let's update the input test to ensure we are at exactly 50% duplicates.

```
function generateInput() {
  let input = [];
  for (let i = 0; i < 50000; i++) {
    // generate 50k unique emails
    let newEmail = faker.internet.email()
    if (input.indexOf(newEmail) === -1) {
      input.push(newEmail);
    } else {
      i--;
    }
  }
```

If faker.js cannot generate more than 50k unique emails this way, we might have to come up with another solution. In fact, this caused an infinite loop because faker can't handle it. So we modify it to this:

```
    let newEmail = faker.internet.email()
    if (input.indexOf(newEmail) === -1) {
      input.push(newEmail);
    } else {
      input.push(`${faker.name.firstName()}${newEmail}`)
    }
```

Result: `trimmed 100000 to 50001`

this implies that we are pretty much there for the intents of this test.

I was a little bit overzealous there. In a real life situation, it probably wouldn't be
important to ensure such exact numbers of uniques, rough percentages would work just as well.

### Let's build a frontend
so the instructions vaguely ask us to build a frontend to explore/demo the algorithm.

I will start with a "generate input" button. You can explore a paginated list of the input (paginated by 100). once the input is generated, you can click "dedupe" and it will run the dedupe algorithm. You can then explore the dedupe list in a paginated list of 100. It will also show totals of the input and output lists, as well as how long the computation took.

Immediately I realize I will have to factor the input email generation function out of
the test suite and into the frontend app. this means I have to move `getRandomArbitrary` into a utility library as well.

```
utils.js
---
module.exports = {
  getRandomArbitrary: (min, max) => {
    return Math.random() * (max - min) + min;
  }
}
```

I will not go in depth on the react part of this app since I am not interviewing for a react position,
but I will leave the following comments:
* Used inline styles for speed of development, didn't want to load external dependencies like bootstrap
* The app is not fully componentized. It is spaghetti react, I just wanted to get a simple UI out the door without spending a couple hours on it. Hope you understand. Willing to provide more componentized react samples if required.
* I created a loading spinner for when it takes a while to load.
* Everything is ugly.

### Deploy the thing
I love heroku. I really do. I used it back in the olden days of rails in 2011 and thought it was garbage, but it's really improved quite a bit.

i `git init` and push it to a public repo i create.

https://github.com/sbryant31/email-deduper

I re-run `yarn test` just to make sure everything is good before deploying.

I use the heroku CLI to deploy.

`heroku git:remote -a email-deduper`
`git push heroku master`

We'll see how good it is at deploying my SPA. If it doesnt work we'll have to use a custom buildpack.

`heroku logs`

< errors >

Just like i thought i need to use a custom buildpack.

`heroku buildpacks:set https://github.com/mars/create-react-app-buildpack.git`
`git push heroku master`


https://email-deduper.herokuapp.com/

Everything checks out.

### Conclusion

I'm really excited to be interviewing for the bot related position. I'll be googling and collecting my thoughts about chatbots until our next interview!

There were some improvements that could be made to my code, and I would be happy to discuss them. This project could have easily been improved for another 10 hours. I spent about 3 hours on it.

