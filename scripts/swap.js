API_URL = process.env.API_URL
PRIVATE_KEY = process.env.PRIVATE_KEY
PUBLIC_KEY = process.env.PUBLIC_KEY

const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const moment = require('moment-timezone')
const numeral = require('numeral')
const _ = require('lodash')
const { mainModule } = require('process')


const PORT = process.env.PORT || 5001
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))
const web3 = new Web3(new HDWalletProvider(PRIVATE_KEY, API_URL) )

const DAI_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"INITIAL_SUPPLY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"burn","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_value","type":"uint256"}],"name":"burnFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_burner","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]
const DAI_ADDRESS = '0xad6d458402f60fd3bd25163575031acdce07538d'
const daiContract = new web3.eth.Contract(DAI_ABI, DAI_ADDRESS);

const EXCHANGE_ABI = [{name:'TokenPurchase',inputs:[{type:'address',name:'buyer',indexed:!0},{type:'uint256',name:'eth_sold',indexed:!0},{type:'uint256',name:'tokens_bought',indexed:!0}],anonymous:!1,type:'event'},{name:'EthPurchase',inputs:[{type:'address',name:'buyer',indexed:!0},{type:'uint256',name:'tokens_sold',indexed:!0},{type:'uint256',name:'eth_bought',indexed:!0}],anonymous:!1,type:'event'},{name:'AddLiquidity',inputs:[{type:'address',name:'provider',indexed:!0},{type:'uint256',name:'eth_amount',indexed:!0},{type:'uint256',name:'token_amount',indexed:!0}],anonymous:!1,type:'event'},{name:'RemoveLiquidity',inputs:[{type:'address',name:'provider',indexed:!0},{type:'uint256',name:'eth_amount',indexed:!0},{type:'uint256',name:'token_amount',indexed:!0}],anonymous:!1,type:'event'},{name:'Transfer',inputs:[{type:'address',name:'_from',indexed:!0},{type:'address',name:'_to',indexed:!0},{type:'uint256',name:'_value',indexed:!1}],anonymous:!1,type:'event'},{name:'Approval',inputs:[{type:'address',name:'_owner',indexed:!0},{type:'address',name:'_spender',indexed:!0},{type:'uint256',name:'_value',indexed:!1}],anonymous:!1,type:'event'},{name:'setup',outputs:[],inputs:[{type:'address',name:'token_addr'}],constant:!1,payable:!1,type:'function',gas:175875},{name:'addLiquidity',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'min_liquidity'},{type:'uint256',name:'max_tokens'},{type:'uint256',name:'deadline'}],constant:!1,payable:!0,type:'function',gas:82605},{name:'removeLiquidity',outputs:[{type:'uint256',name:'out'},{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'amount'},{type:'uint256',name:'min_eth'},{type:'uint256',name:'min_tokens'},{type:'uint256',name:'deadline'}],constant:!1,payable:!1,type:'function',gas:116814},{name:'__default__',outputs:[],inputs:[],constant:!1,payable:!0,type:'function'},{name:'ethToTokenSwapInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'min_tokens'},{type:'uint256',name:'deadline'}],constant:!1,payable:!0,type:'function',gas:12757},{name:'ethToTokenTransferInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'min_tokens'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'}],constant:!1,payable:!0,type:'function',gas:12965},{name:'ethToTokenSwapOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'},{type:'uint256',name:'deadline'}],constant:!1,payable:!0,type:'function',gas:50455},{name:'ethToTokenTransferOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'}],constant:!1,payable:!0,type:'function',gas:50663},{name:'tokenToEthSwapInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'},{type:'uint256',name:'min_eth'},{type:'uint256',name:'deadline'}],constant:!1,payable:!1,type:'function',gas:47503},{name:'tokenToEthTransferInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'},{type:'uint256',name:'min_eth'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'}],constant:!1,payable:!1,type:'function',gas:47712},{name:'tokenToEthSwapOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'eth_bought'},{type:'uint256',name:'max_tokens'},{type:'uint256',name:'deadline'}],constant:!1,payable:!1,type:'function',gas:50175},{name:'tokenToEthTransferOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'eth_bought'},{type:'uint256',name:'max_tokens'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'}],constant:!1,payable:!1,type:'function',gas:50384},{name:'tokenToTokenSwapInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'},{type:'uint256',name:'min_tokens_bought'},{type:'uint256',name:'min_eth_bought'},{type:'uint256',name:'deadline'},{type:'address',name:'token_addr'}],constant:!1,payable:!1,type:'function',gas:51007},{name:'tokenToTokenTransferInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'},{type:'uint256',name:'min_tokens_bought'},{type:'uint256',name:'min_eth_bought'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'},{type:'address',name:'token_addr'}],constant:!1,payable:!1,type:'function',gas:51098},{name:'tokenToTokenSwapOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'},{type:'uint256',name:'max_tokens_sold'},{type:'uint256',name:'max_eth_sold'},{type:'uint256',name:'deadline'},{type:'address',name:'token_addr'}],constant:!1,payable:!1,type:'function',gas:54928},{name:'tokenToTokenTransferOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'},{type:'uint256',name:'max_tokens_sold'},{type:'uint256',name:'max_eth_sold'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'},{type:'address',name:'token_addr'}],constant:!1,payable:!1,type:'function',gas:55019},{name:'tokenToExchangeSwapInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'},{type:'uint256',name:'min_tokens_bought'},{type:'uint256',name:'min_eth_bought'},{type:'uint256',name:'deadline'},{type:'address',name:'exchange_addr'}],constant:!1,payable:!1,type:'function',gas:49342},{name:'tokenToExchangeTransferInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'},{type:'uint256',name:'min_tokens_bought'},{type:'uint256',name:'min_eth_bought'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'},{type:'address',name:'exchange_addr'}],constant:!1,payable:!1,type:'function',gas:49532},{name:'tokenToExchangeSwapOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'},{type:'uint256',name:'max_tokens_sold'},{type:'uint256',name:'max_eth_sold'},{type:'uint256',name:'deadline'},{type:'address',name:'exchange_addr'}],constant:!1,payable:!1,type:'function',gas:53233},{name:'tokenToExchangeTransferOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'},{type:'uint256',name:'max_tokens_sold'},{type:'uint256',name:'max_eth_sold'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'},{type:'address',name:'exchange_addr'}],constant:!1,payable:!1,type:'function',gas:53423},{name:'getEthToTokenInputPrice',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'eth_sold'}],constant:!0,payable:!1,type:'function',gas:5542},{name:'getEthToTokenOutputPrice',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'}],constant:!0,payable:!1,type:'function',gas:6872},{name:'getTokenToEthInputPrice',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'}],constant:!0,payable:!1,type:'function',gas:5637},{name:'getTokenToEthOutputPrice',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'eth_bought'}],constant:!0,payable:!1,type:'function',gas:6897},{name:'tokenAddress',outputs:[{type:'address',name:'out'}],inputs:[],constant:!0,payable:!1,type:'function',gas:1413},{name:'factoryAddress',outputs:[{type:'address',name:'out'}],inputs:[],constant:!0,payable:!1,type:'function',gas:1443},{name:'balanceOf',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'address',name:'_owner'}],constant:!0,payable:!1,type:'function',gas:1645},{name:'transfer',outputs:[{type:'bool',name:'out'}],inputs:[{type:'address',name:'_to'},{type:'uint256',name:'_value'}],constant:!1,payable:!1,type:'function',gas:75034},{name:'transferFrom',outputs:[{type:'bool',name:'out'}],inputs:[{type:'address',name:'_from'},{type:'address',name:'_to'},{type:'uint256',name:'_value'}],constant:!1,payable:!1,type:'function',gas:110907},{name:'approve',outputs:[{type:'bool',name:'out'}],inputs:[{type:'address',name:'_spender'},{type:'uint256',name:'_value'}],constant:!1,payable:!1,type:'function',gas:38769},{name:'allowance',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'address',name:'_owner'},{type:'address',name:'_spender'}],constant:!0,payable:!1,type:'function',gas:1925},{name:'name',outputs:[{type:'bytes32',name:'out'}],inputs:[],constant:!0,payable:!1,type:'function',gas:1623},{name:'symbol',outputs:[{type:'bytes32',name:'out'}],inputs:[],constant:!0,payable:!1,type:'function',gas:1653},{name:'decimals',outputs:[{type:'uint256',name:'out'}],inputs:[],constant:!0,payable:!1,type:'function',gas:1683},{name:'totalSupply',outputs:[{type:'uint256',name:'out'}],inputs:[],constant:!0,payable:!1,type:'function',gas:1713}]
const EXCHANGE_ADDRESS = '0xc0fc958f7108be4060F33a699a92d3ea49b0B5f0'
const exchangeContract = new web3.eth.Contract(EXCHANGE_ABI, EXCHANGE_ADDRESS);

const ETH_AMOUNT = web3.utils.toWei('0.04', 'Ether')
console.log("Eth Amount - 0.04 ethers or  in wei")

async function sellEth(ethAmount, daiAmount) {
    const moment = require('moment') 
    const now = moment().unix()
    const DEADLINE = now + 60 
  
    const SETTINGS = {
      gasLimit: 8000000, 
      gasPrice: web3.utils.toWei('50', 'Gwei'),
      from: PUBLIC_KEY, 
      value: ethAmount 
    }
  
    console.log('Performing swap...')
    let result = await exchangeContract.methods.ethToTokenSwapInput(daiAmount.toString(), DEADLINE).send(SETTINGS)
    console.log(`Successful Swap: https://ropsten.etherscan.io/tx/${result.transactionHash}`)
  }

  async function checkBalances() {
    let ETHbalance;
    let DAIbalance;
  
    ETHbalance = await web3.eth.getBalance(PUBLIC_KEY)
    ETHbalance = web3.utils.fromWei(ETHbalance, 'Ether')
    console.log("Ether Balance:", ETHbalance)
  
    DAIbalance = await daiContract.methods.balanceOf(PUBLIC_KEY).call()
    DAIbalance = web3.utils.fromWei(DAIbalance, 'Ether')
    console.log("Dai Balance:", DAIbalance)
  }

let monitoringPrice = false

async function monitorPrice() {
    if(monitoringPrice) {
      return
    }
  
    console.log("Checking price...")
    monitoringPrice = true
  
    try {
  
      const daiAmount = await exchangeContract.methods.getEthToTokenInputPrice(ETH_AMOUNT).call()
      const price = web3.utils.fromWei(daiAmount.toString(), 'Ether')
      console.log('0.04 ETH = ', price, ' DAI')
        console.log('Selling Eth...')
        console.log("Initial Balance")
        await checkBalances()
  
        await sellEth(ETH_AMOUNT, daiAmount)
        console.log("Balance after Swap")
        await checkBalances()
  
      
  
    } catch (error) {
      console.error(error)
      monitoringPrice = false
      return
    }
  
    monitoringPrice = false
  }

async function main(){
    await monitorPrice();
    process.exit(1);

}
main()