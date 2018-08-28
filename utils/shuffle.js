module.exports = arr => {
  const origin = [].concat(arr);
  const first = origin[0];

  origin.splice(0, 1);
  return [first].concat(
    origin
      .map(a => [Math.random(), a])
      .sort((a, b) => a[0] - b[0])
      .map(a => a[1])
  );
};