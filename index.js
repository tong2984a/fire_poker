//const metamaskButton = document.querySelector('#metamaskButton')
const walletButton = document.querySelector('#wallet-button')
const connectError = document.querySelector('#connectError')
const currentBlockSpan = document.querySelector('#currentBlockSpan')
const balanceSpan = document.querySelector('#balanceSpan')
const tokenSpan = document.querySelector('#tokenSpan')
const accountSpan = document.querySelector('#accountSpan')
const currentChain = document.querySelector('#currentChain')
const topChain = document.querySelector('#topChain')

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
  ]
  
  const USDC_ADDRESS = "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23"
  const FIRE_ADDRESS = "0x9D58923733C595fF7C7C05Cd1b192ddc399D2FE8"
  

if(!window.ethereum){ 
    connectError.innerHTML = "No injected wallet. Please install Metamask";
}
else{
  walletButton.onclick = async () => {
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
                    
            currentBlockSpan.innerHTML = block
            accountSpan.innerHTML = account                
            balanceSpan.innerHTML = balance
            currentChain.innerHTML = parseInt(chainId,16)
            topScore.innerHTML = '9999999'

            const web3 = new Web3(window.ethereum);
            
            const erc20Contract = await new web3.eth.Contract(ERC20TransferABI, FIRE_ADDRESS);   
            erc20Contract.methods.balanceOf(account).call(function (err, res) {
                if (err) {
                  console.log("An error occurred", err)
                  return
                }
                console.log("The balance is: ", res)
                const fireBalance = res  * 10 ** -18;
                console.log('fire_balance', fireBalance)
                tokenSpan.innerHTML = fireBalance
                players[0].bankroll += fireBalance;
                gui_set_bankroll(players[0].bankroll, 0)
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
                  balanceSpan.innerHTML = usdcBalance
                })
  
    
        } catch (error) {
            connectError.innerHTML = error.message;
            console.log(error);
        }
    }
}