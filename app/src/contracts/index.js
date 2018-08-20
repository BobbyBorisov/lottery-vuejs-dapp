// /* global web3:true */

import contract from 'truffle-contract';

// import artifacts
import lotteryArtifacts from '../../../build/contracts/Lottery.json';

// create contracts
const Lottery = contract(lotteryArtifacts);

export {
  Lottery
};
