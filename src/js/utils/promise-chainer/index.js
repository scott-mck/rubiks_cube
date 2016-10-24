class PromiseChainer {
	constructor() {
		this._callbacks = []
		this._promises = []
	}

	chain(callback) {
		this._callbacks.push(callback)
		let lastPromise = this._promises.shift()

		if (!lastPromise) {
			this._promises.push(this._callbacks.shift()())
		} else {
			let newPromise = lastPromise.then(this._callbacks.shift())
			this._promises.push(newPromise)
		}
	}
}

export default new PromiseChainer()
