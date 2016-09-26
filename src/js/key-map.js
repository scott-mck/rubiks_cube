class KeyMap {
  constructor() {
    this.keyMap = {
      i: 'r',
      k: 'rPrime',
      j: 'u',
      f: 'uPrime',
      h: 'f',
      g: 'fPrime',
      s: 'd',
      l: 'dPrime',
      e: 'l',
      d: 'lPrime',
      q: 'b',
      p: 'bPrime',
      ';': 'y',
      a: 'yPrime',
      y: 'x',
      n: 'xPrime',
      ' ': 'scramble'
    }
  }

  getNotation(letter) {
    return this.keyMap[letter]
  }
}

export default new KeyMap()
