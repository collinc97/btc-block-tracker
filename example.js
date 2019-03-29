const PollingBlockTracker = require('./src/polling')

const blockTracker = new PollingBlockTracker();

blockTracker.on('sync', ({ newBlock, oldBlock }) => {
  if (oldBlock) {
    console.log(`sync #${Number(oldBlock)} -> #${Number(newBlock)}`)
  } else {
    console.log(`first sync #${Number(newBlock)}`)
  }
})
