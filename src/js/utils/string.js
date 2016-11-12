/**
 * Finds all letters that appear twice in a row in a given input string.
 *
 * @param {string} string - The input string.
 * @param {boolean} wrap - Whether to test the last letter to the first.
 * @return {array} - An array of all consecutive letters
 */
export const getConsecutivelyAppearingLetters = (string, wrap) => {
  let letters = []
  for (let i = 0; i < string.length; i++) {
    let nextLetter = string[i + 1]
    if (!nextLetter && wrap) {
      nextLetter = string[0]
    }

    if (string[i] === nextLetter && !letters.includes(string[i])) {
      letters.push(string[i])
    }
  }
  return letters
}

/**
 * Finds the most common letter in an input string.
 *
 * @param {string} string - The input string.
 * @param {array} restraints - The possible outcomes.
 * @return {string} - The most common letter.
 */
export const getMostCommonLetter = (string, restraints = []) => {
  let counters = {}
  if (restraints.length === 0) {
    restraints = string.split('')
  }
  for (let restraint of restraints) {
    counters[restraint] = 0
  }

  for (let i = 0; i < string.length; i++) {
    if (typeof counters[string[i]] === 'undefined') {
      continue
    }
    counters[string[i]] += 1
  }

  let highestCount = Object.values(counters).sort().reverse()[0]
  let mostCommonLetter = Object.keys(counters).find(str => counters[str] === highestCount)
  return mostCommonLetter
}
