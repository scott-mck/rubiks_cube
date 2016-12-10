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
      r: 'lDoublePrime',
      c: 'lDouble',
      q: 'b',
      p: 'bPrime',
      ';': 'y',
      a: 'yPrime',
      y: 'x',
      n: 'xPrime'
    }
  }

  getNotation(letters) {
		let notations = letters.split(' ').map(letter => this.keyMap[letter])
		return notations.join(' ')
  }
}

export default new KeyMap()
