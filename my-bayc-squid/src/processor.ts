import {lookupArchive} from '@subsquid/archive-registry'
import * as bayc from './abi/bayc'

import {
    BlockHeader,
    DataHandlerContext,
    EvmBatchProcessor,
    EvmBatchProcessorFields,
    Log as _Log,
    Transaction as _Transaction,
} from '@subsquid/evm-processor'

export const CONTRACT_ADDRESS = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'

export const processor = new EvmBatchProcessor()
    .setDataSource({
        
        archive: lookupArchive('eth-mainnet'),
        chain: 'https://rpc.ankr.com/eth'
       
    })
    .setFinalityConfirmation(75)
    .setFields({
        transaction: {
            from: true,
            value: true,
            hash: true,
        },
        log: {
            transactionHash: true
        }
    })
    .setBlockRange({
        from: 12_287_507,
    })
    .addLog({
        address: [CONTRACT_ADDRESS],
        topic0: [bayc.events.Transfer.topic]
    })
    .addTransaction({
        to: ['0x0000000000000000000000000000000000000000'],
    })

export type Fields = EvmBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>
