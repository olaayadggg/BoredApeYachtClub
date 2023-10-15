import {TypeormDatabase} from '@subsquid/typeorm-store'
import {processor, CONTRACT_ADDRESS} from './processor'
// import {Burn} from './model'
import * as bayc from './abi/bayc'
import {Transfer} from './model'

// processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
//     const burns: Burn[] = []
//     for (let c of ctx.blocks) {
//         for (let tx of c.transactions) {
//             // decode and normalize the tx data
//             burns.push(
//                 new Burn({
//                     id: tx.id,
//                     block: c.header.height,
//                     address: tx.from,
//                     value: tx.value,
//                     txHash: tx.hash,
//                 })
//             )
//         }
//     }
//     // apply vectorized transformations and aggregations
//     const burned = burns.reduce((acc, b) => acc + b.value, 0n) / 1_000_000_000n
//     const startBlock = ctx.blocks.at(0)?.header.height
//     const endBlock = ctx.blocks.at(-1)?.header.height
//     ctx.log.info(`Burned ${burned} Gwei from ${startBlock} to ${endBlock}`)

//     // upsert batches of entities with batch-optimized ctx.store.save
//     await ctx.store.upsert(burns)
// })

processor.run(new TypeormDatabase(), async (ctx) => {
    let transfers: Transfer[] = []
    for (let block of ctx.blocks) {
        for (let log of block.logs) {
            if (log.address === CONTRACT_ADDRESS && log.topics[0] === bayc.events.Transfer.topic) {
                let {from, to, tokenId} = bayc.events.Transfer.decode(log)
                transfers.push(new Transfer({
                    id: log.id,
                    tokenId,
                    from,
                    to,
                    timestamp: new Date(block.header.timestamp),
                    blockNumber: block.header.height,
                    txHash: log.transactionHash,
                }))
            }
        }
    }

    await ctx.store.insert(transfers)
})


