module.exports = {
  getRandomArbitrary: (min, max) => {
    return Math.random() * (max - min) + min;
  }
}
