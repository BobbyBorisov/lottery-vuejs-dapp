/* global web3:true */
import Vue from 'vue';
import Vuex from 'vuex';
import Web3 from 'web3';
import createLogger from 'vuex/dist/logger';
import * as types from './mutation-types';
import {Lottery} from '../contracts';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

const rootState = {
  account: '',
  balance: '',
  contactAddress:'',
  owner: '',
  manager: '',
  lotteryBalance: '',
  enterAmount: '',
  enterLoading: false,
  players: [],
  pickWinnerLoading: false,
  winner:'',
  winAmount:''
};

const getters = {
  account: state => state.account,
  balance: state => state.balance,
  contractAddress: state => state.contractAddress,
  owner: state => state.owner,
  manager: state => state.manager,
  lotteryBalance: state => state.lotteryBalance,
  enterAmount: state => state.enterAmount,
  enterLoading: state => state.enterLoading,
  playersCount: state => state.players.length,
  pickWinnerLoading: state => state.pickWinnerLoading,
  winner: state => state.winner,
  winAmount: state => state.winAmount
};

const actions = {
  initWeb3({dispatch}) {
    const web3RetryInterval = setInterval(() => {
      if (typeof web3 !== 'undefined') {
        window.web3 = new Web3(web3.currentProvider);
        clearInterval(web3RetryInterval);
        dispatch('watchWeb3Account');
        dispatch('setContractProvider');
        dispatch('getLotteryBalance');
        dispatch('getPlayers');
        dispatch('getOwner');
        dispatch('getContractAddress');
      }
    }, 100);
  },
  watchWeb3Account({dispatch, state, commit}) {
    setInterval(() => {
      const account = web3.eth.accounts[0];
      if (!account) return;

      if (account === state.account){
          dispatch('getBalance');
      }else {
          commit(types.UPDATE_ACCOUNT, account);
          dispatch('getBalance');
      }
    }, 600);
  },
  setContractProvider() {
      Lottery.setProvider(web3.currentProvider);
  },
  getBalance({commit, state}, blockNumber = 'latest') {
    web3.eth.getBalance(state.account, blockNumber, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      commit(types.UPDATE_BALANCE, web3.fromWei(result).toNumber());
    });
  },
  getOwner({commit, state}) {
    Lottery.deployed().then(async (instance) => {
      const owner = await instance.manager.call()
      commit(types.SET_OWNER, owner);
    });
  },
  getLotteryBalance({commit, state}) {
    Lottery.deployed().then((instance) => {
      web3.eth.getBalance(instance.address, 'latest', (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        commit(types.SET_LOTTERY_BALANCE, web3.fromWei(result).toNumber());
      });
    });
  },
  getPlayers({commit, state}) {
    Lottery.deployed().then(async (instance) => {
      const players = await instance.getPlayers.call()
      commit(types.SET_PLAYERS, players);
    });
  },
  getContractAddress({commit, state}) {
    Lottery.deployed().then(async (instance) => {
      const address = await instance.getAddress.call()
      commit(types.SET_CONTRACT_ADDRESS, address);
    });
  },
  enter({commit, state}) {
    Lottery.deployed().then(async (instance) => {
        commit(types.UPDATE_ENTER_LOADING, true);

        try {
          await instance.enter({from:state.account, value: web3.toWei(state.enterAmount, 'ether'), gas:'3000000'})

          commit(types.UPDATE_PLAYERS, state.account);
          commit(types.UPDATE_LOTTERY_BALANCE, state.enterAmount)
          commit(types.UPDATE_ENTER_LOADING, false);
        } catch (err) {
          console.error(err)
        }

    });
  },
  pickWinner({commit, state}) {
    Lottery.deployed().then(async (instance) => {
        commit(types.UPDATE_PICK_WINNER_LOADING, true);

        console.log(instance)

        instance.pickWinner({from:state.account, gas: '3000000'}).then(()=>{
          const events = instance.LogWinner({}, {fromBlock:'latest'});

          events.watch((err, result) => {
            if (err) {
                console.erorr(err);
                return;
              }
              console.log(result.args)

            commit(types.UPDATE_PICK_WINNER_LOADING, false);
            commit(types.SET_WINNER, result.args.winner)
            commit(types.SET_WIN_AMOUNT, web3.fromWei(result.args.amount).toNumber())
            commit(types.CLEAR_LOTTERY_BALANCE)
            commit(types.CLEAR_PLAYERS)
          })
        })

    });
  }
}

const mutations = {
  [types.ROUTE_CHANGED](state, {to, from}) {
    // NOTE: not used
    console.log('route changed from', from.name, 'to', to.name); // eslint-disable-line no-console
  },

  [types.UPDATE_ACCOUNT](state, account) {
    state.account = account;
  },

  [types.UPDATE_BALANCE](state, balance) {
    state.balance = balance;
  },

  [types.SET_OWNER](state, owner) {
    state.owner = owner;
  },

  [types.SET_CONTRACT_ADDRESS](state, address) {
    state.contractAddress = address;
  },

  [types.UPDATE_LOTTERY_BALANCE](state, balance) {
    state.lotteryBalance+=balance;
  },

  [types.SET_LOTTERY_BALANCE](state, balance) {
    state.lotteryBalance = balance;
  },

  [types.UPDATE_ENTER_AMOUNT](state, amount){
    state.enterAmount = amount;
  },

  [types.UPDATE_ENTER_LOADING](state, enterLoading){
    state.enterLoading = enterLoading;
  },

  [types.SET_PLAYERS](state, players){
    state.players = players;
  },

  [types.UPDATE_PLAYERS](state, player){
    state.players.push(player);
  },

  [types.UPDATE_PICK_WINNER_LOADING](state, pickWinnerLoading){
    state.pickWinnerLoading = pickWinnerLoading;
  },

  [types.SET_WINNER](state, winner){
    state.winner = winner
  },

  [types.CLEAR_PLAYERS](state){
    state.players = []
  },

  [types.CLEAR_LOTTERY_BALANCE](state){
    state.lotteryBalance = 0
  },
  [types.SET_WIN_AMOUNT](state, amount){
    state.winAmount = amount
  }
};

export default new Vuex.Store({
  state: rootState,
  getters,
  actions,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
