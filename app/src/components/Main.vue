<template>
  <div>
    <section>
      <h1>Contract</h1>

      <h3 v-if='!account'><strong>PLEASE LOGIN TO MetaMask</strong></h3>

      <template v-if='account'>
        <p>Account balance: <strong>{{ balance }} ETH</strong></p>
        <p>Account address: <strong>{{ account }}</strong></p>
        <p>Owner address: <strong>{{ owner }}</strong></p>
        <p>Contract address: <strong>{{ contractAddress }}</strong></p>
      </template>

      <template>
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {{owner}}.
        There are currently {{playersCount}} people entered,
        competing to win {{lotteryBalance}} ether!</p>
        <hr/>
        <form>
          <h2>Want to try your luck?</h2>
          <div>
            <label for='enterAmount'>Enter amount: </label>
            <input type='number' id='enterAmount' :value.number='enterAmount' @input='updateEnterAmount'></input>
            <el-button type="primary"  @click="enterHandler" :loading="enterLoading">Enter</el-button>
          </div>
        </form>
        <hr/>
      </template>

      <template v-if="isOwner && playersCount>0">
        <h2>Pick a winner</h2>
        <el-button type="primary"  @click="pickWinner" :loading="pickWinnerLoading">Pick a winner</el-button>
      </template>

      <template v-if="winner">
        <h2>{{winner}} just won {{winAmount}} ETH</h2>
      </template>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as types from '../store/mutation-types';

export default {
  name: 'eth-vue-docker-app',
  computed: {
    ...mapGetters({
      account: 'account',
      balance: 'balance',
      contractAddress: 'contractAddress',
      owner: 'owner',
      manager: 'manager',
      lotteryBalance: 'lotteryBalance',
      enterAmount: 'enterAmount',
      enterLoading: 'enterLoading',
      playersCount: 'playersCount',
      pickWinnerLoading: 'pickWinnerLoading',
      winner: 'winner',
      winAmount: 'winAmount'
    }),
    isOwner(){
      return this.account === this.owner;
    }
  },
  created(){
    // this.$store.dispatch('getLotteryBalance');
  },
  methods: {
    updateEnterAmount(e) {
      this.$store.commit(types.UPDATE_ENTER_AMOUNT, e.target.value ? parseInt(e.target.value, 10) : '');
    },
    enterHandler() {
      if (this.enterAmount) {
        this.$store.dispatch('enter');
      }
    },
    pickWinner() {
      this.$store.dispatch('pickWinner');
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
section {
  margin-top: 3em;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.25em;
}

input {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  width: 100%;
  padding: 0.5em;
  font-size: 1em;
  border: 1px solid #ccc;
  margin-bottom: 1em;
}

button {
  padding: 0.5em 1em;
  background-color: #7FC76A;
  font-size: 1em;
  color: white;
  cursor: pointer;
  border: 0;
}

h1, h2 {
  font-weight: normal;
}

ul, ol {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

ol li {
  display: block;
}

a {
  color: #42b983;
}
</style>
