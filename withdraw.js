const stakeButton = document.querySelector('#stakeButton')
const checkWinningBalanceButton = document.querySelector('#checkWinningBalanceButton')
const connectError = document.querySelector('#connectError')
const currentBlockSpan = document.querySelector('#currentBlockSpan')
const balanceSpan = document.querySelector('#balanceSpan')
const stakingBalanceSpan = document.querySelector('#stakingBalanceSpan')
const winningBalanceSpan = document.querySelector('#winningBalanceSpan')
const tokenSpan = document.querySelector('#tokenSpan')
const accountSpan = document.querySelector('#accountSpan')
const currentChain = document.querySelector('#currentChain')
const stakeInput = document.querySelector('#stakeInput')

import fireFarmAbi from "../const/FireFarm.json" assert {type: 'json'};
console.log('fireFarmAbi', fireFarmAbi.abi)

import gameAbi from "../const/Game.json" assert {type: 'json'};
console.log('gameAbi', gameAbi.abi)
  // Your code here...

const ERC20TransferABI = [
    {
      constant: false,
      inputs: [
        {
          name: "_to",
          type: "address",
        },
        {
          name: "_value",
          type: "uint256",
        },
      ],
      name: "transfer",
      outputs: [
        {
          name: "",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "_owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          name: "balance",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "_spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
  ]
  // localhost
  // const USDC_ADDRESS = "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23"
  // const FIRE_ADDRESS = "0x9D58923733C595fF7C7C05Cd1b192ddc399D2FE8"
  // const FIREFARM_ADDRESS = "0x90ADa97c5913c2383301E1b52dE962f19387122C"
  // const GAME_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  // mumbai
  const USDC_ADDRESS = "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23"
  const FIRE_ADDRESS = "0x9D58923733C595fF7C7C05Cd1b192ddc399D2FE8"
  const FIREFARM_ADDRESS = "0x90ADa97c5913c2383301E1b52dE962f19387122C"
  const GAME_ADDRESS = "0x8969c2ba517e5ab42D2d016FF0A82bf5Dd420f11"
  
  checkWinningBalanceButton.onclick = async () => {
    const gameId = stakeInput.value;
    const web3 = new Web3(window.ethereum);
    const gameContract = await new web3.eth.Contract(gameAbi.abi, GAME_ADDRESS);   
    const res = await gameContract.methods.winningBalance(gameId).call({from: accountSpan.innerHTML});
    const winningBalance = res * (10 ** -18);
    console.log('winning balance', winningBalance)
    winningBalanceSpan.innerHTML = winningBalance
  }

  stakeButton.onclick = async () => {
    const web3 = new Web3(window.ethereum);
    const usdcContract = await new web3.eth.Contract(ERC20TransferABI, USDC_ADDRESS);   
    const fireFarmContract = await new web3.eth.Contract(fireFarmAbi.abi, FIREFARM_ADDRESS);
    const gameContract = await new web3.eth.Contract(gameAbi.abi, GAME_ADDRESS);
    
    const gameId = stakeInput.value;
    const tx = await gameContract.methods.withdraw(gameId);
    console.log("tx", tx)
    const rc = await tx.send({from: accountSpan.innerHTML}); // 0ms, as tx is already confirmed
    console.log("rc", rc)
    const event = rc.events['RewardsWithdrew']
    if (event) {
      const { amount, winner } = event['returnValues']
      console.log("RewardsWithdrew", parseInt(amount.toString(), 16), winner)
    }

    const balanceResponse = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [accountSpan.innerHTML]
    });
    const balance = (parseInt(balanceResponse, 16) / Math.pow(10,18)).toFixed(2)
    balanceSpan.innerHTML = balance

    const res = await gameContract.methods.winningBalance(gameId).call({from: accountSpan.innerHTML});
    const winningBalance = res * (10 ** -18);
    console.log('winning balance', winningBalance)
    winningBalanceSpan.innerHTML = winningBalance
  }

  const onload = async () => {
        connectError.innerHTML = '';
        try {
            const accountResponse = await window.ethereum.request({
                method: 'eth_requestAccounts',
                params: []
            });
            const account = accountResponse[0];
            const balanceResponse = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [account]
            });
            const balance = (parseInt(balanceResponse, 16) / Math.pow(10,18)).toFixed(2)
            console.log('balance', balance);
            const chainId = await window.ethereum.request({
                method: 'eth_chainId',
                params: []
            });
            const currentBlock = await window.ethereum.request({
                method: 'eth_blockNumber',
                params: []
            });
            const block =  parseInt(currentBlock, 16).toLocaleString();
                    
            // currentBlockSpan.innerHTML = block
            accountSpan.innerHTML = account                
            balanceSpan.innerHTML = balance
            // currentChain.innerHTML = parseInt(chainId,16)

            const web3 = new Web3(window.ethereum);
            
            const fireContract = await new web3.eth.Contract(ERC20TransferABI, FIRE_ADDRESS);   
            fireContract.methods.balanceOf(account).call(function (err, res) {
                if (err) {
                  console.log("An error occurred", err)
                  return
                }
                console.log("The balance is: ", res)
                const fireBalance = res  * 10 ** -18;
                console.log('fire_balance', fireBalance)
                tokenSpan.innerHTML = fireBalance
              })
  
            const fireFarmContract = await new web3.eth.Contract(fireFarmAbi.abi, FIREFARM_ADDRESS);   
            fireFarmContract.methods.stakingBalance(account).call(function (err, res) {
                if (err) {
                  console.log("An error occurred", err)
                  return
                }
                console.log("The staking balance is: ", res)
                const stakingBalance = res * (10 ** -6);
                console.log('staking balance', stakingBalance)
                // stakingBalanceSpan.innerHTML = stakingBalance
              })

            const usdcContract = await new web3.eth.Contract(ERC20TransferABI, USDC_ADDRESS);   
            usdcContract.methods.balanceOf(account).call(function (err, res) {
                if (err) {
                  console.log("An error occurred", err)
                  return
                }
                console.log("The balance is: ", res)
                const usdcBalance = res  * 10 ** -6;
                console.log('usdc_balance', usdcBalance)
                stakingBalanceSpan.innerHTML = usdcBalance
              })
    
        } catch (error) {
            connectError.innerHTML = error.message;
            console.log(error);
        }
   }
   
  if(!window.ethereum){ 
    connectError.innerHTML = "No injected wallet. Please install Metamask";
  }
  else{
    window.onload = function () {
    onload()
  }
}