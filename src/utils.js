module.exports = {
  getRandomArbitrary: (min, max) => {
    return parseInt(Math.random() * (max - min) + min);
  }
}
