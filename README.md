
# btc-block-tracker

This project is forked from [eth-block-tracker](https://github.com/MetaMask/eth-block-tracker) and has been adapted for the Bitcoin Blockchain.

This module walks the Bitcoin blockchain, keeping track of the latest block.
It uses a BlockCypher provider as a data source and will continuously poll for the next block.

```js
const PollingBlockTracker = require('./src/polling')
const blockTracker = new PollingBlockTracker({pollingInterval : 600000})
blockTracker.on('latest', console.log)
```

### methods

##### new PollingBlockTracker({ pollingInterval, retryTimeout, keepEventLoopActive })

creates a new block tracker with BlockCypher as a data source and
`pollingInterval` (ms) timeout between polling for the latest block.
If an Error is encountered when fetching blocks, it will wait `retryTimeout` (ms) before attempting again.
If `keepEventLoopActive` is false, in Node.js it will [unref the polling timeout](https://nodejs.org/api/timers.html#timers_timeout_unref), allowing the process to exit during the polling interval. defaults to `true`, meaning the process will be kept alive.

##### getCurrentBlock()

synchronous returns the current block. may be `null`.

```js
console.log(blockTracker.getCurrentBlock())
```

##### async getLatestBlock()

Asynchronously returns the latest block.
if not immediately available, it will fetch one.

##### async checkForLatestBlock()

Tells the block tracker to ask for a new block immediately, in addition to its normal polling interval.
Useful if you received a hint of a new block (e.g. via `tx.blockNumber` from `getTransactionByHash`).
Will resolve to the new latest block when its done polling.

### EVENTS

##### latest

The `latest` event is emitted for whenever a new latest block is detected.
This may mean skipping blocks if there were two created since the last polling period.

```js
blockTracker.on('latest', (newBlock) => console.log(newBlock))
```

##### sync

The `sync` event is emitted the same as "latest" but includes the previous block.

```js
blockTracker.on('sync', ({ newBlock, oldBlock }) => console.log(newBlock, oldBlock))
```

##### error

The `error` event means an error occurred while polling for the latest block.

```js
blockTracker.on('error', (err) => console.error(err))
```

### NOTES

Version 4.x.x differs significantly from version 3.x.x

Please see the [CHANGELOG](./CHANGELOG.md).
