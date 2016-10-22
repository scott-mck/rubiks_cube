class KeyMap {
  constructor() {
    this.keyMap = {
      i: 'r',
      k: 'rPrime',
      u: 'rDouble',
      m: 'rDoublePrime',
      j: 'u',
      f: 'uPrime',
      h: 'f',
      g: 'fPrime',
      s: 'd',
      l: 'dPrime',
      e: 'lPrime',
      d: 'l',
      r: 'lDouble',
      c: 'lDoublePrime',
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
