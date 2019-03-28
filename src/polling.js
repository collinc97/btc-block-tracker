const pify = require('pify')
const BaseBlockTracker = require('./base')
const axios = require('axios')
// const bcypher = require('blockcypher');

const sec = 1000

class PollingBlockTracker extends BaseBlockTracker {

  constructor(opts = {}) {
    // parse + validate args
    // if (!opts.provider) throw new Error('PollingBlockTracker - no provider specified.')
    const pollingInterval = opts.pollingInterval || 20 * sec
    const retryTimeout = opts.retryTimeout || pollingInterval / 10
    const keepEventLoopActive = opts.keepEventLoopActive !== undefined ? opts.keepEventLoopActive : true
    const setSkipCacheFlag = opts.setSkipCacheFlag || false
    // BaseBlockTracker constructor
    super(Object.assign({
      blockResetDuration: pollingInterval,
    }, opts))
    // config
    this._provider = opts.provider
    this._pollingInterval = pollingInterval
    this._retryTimeout = retryTimeout
    this._keepEventLoopActive = keepEventLoopActive
    this._setSkipCacheFlag = setSkipCacheFlag
  }

  //
  // public
  //

  // trigger block polling
  async checkForLatestBlock() {
    await this._updateLatestBlock()
    return await this.getLatestBlock()
  }

  //
  // private
  //

  _start() {
    this._performSync().catch(err => this.emit('error', err))
  }

  async _performSync() {
    while (this._isRunning) {
      try {
        await this._updateLatestBlock()
        await timeout(this._pollingInterval, !this._keepEventLoopActive)
      } catch (err) {
        const newErr = new Error(`PollingBlockTracker - encountered an error while attempting to update latest block:\n${err.stack}`)
        try {
          this.emit('error', newErr)
        } catch (emitErr) {
          console.error(newErr)
        }
        await timeout(this._retryTimeout, !this._keepEventLoopActive)
      }
    }
  }

  async _updateLatestBlock() {
    // fetch + set latest block
    const latestBlock = await this._fetchLatestBlock()
    this._newPotentialLatest(latestBlock)
  }

  async _fetchLatestBlock() {
    // let bcapi = new bcypher('btc', 'main', 'e5ae43f99a9847aea3cb6b4d8ff9e59d');
    // function printResponse(err, data) {
    //   if (err != null) {
    //     console.log(err);
    //   } else {

    //     console.log(data);
    //   }
    // }
    // const req = { id: 1, method: 'eth_blockNumber', params: [] }
    if (this._setSkipCacheFlag) req.skipCache = true
    // const res = await pify((cb) => this._provider.sendAsync(req, cb))()
    const res = await axios.get('https://api.blockcypher.com/v1/btc/main')
    // console.log(res.data);
    if (res.error) throw new Error(`PollingBlockTracker - encountered error fetching block:\n${res.error}`)
    return res.data.height
  }

}

module.exports = PollingBlockTracker

function timeout(duration, unref) {
  return new Promise(resolve => {
    const timoutRef = setTimeout(resolve, duration)
    // don't keep process open
    if (timoutRef.unref && unref) {
      timoutRef.unref()
    }
  })
}
