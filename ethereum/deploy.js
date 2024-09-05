const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/CampaignFactory.json');

const mnemonic = 'mansion found salad flight claim ozone recall inform mushroom between mutual work';
const infuraEndpoint = 'https://sepolia.infura.io/v3/0071c0ab97ef4a9ab5106458a80f57fb';

// Initialize provider
const provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonic
  },
  providerOrUrl: infuraEndpoint
});

// Initialize Web3 instance
const web3 = new Web3(provider);

// Deploy function
const deploy = async () => {
  try {
    const accounts = await web3.eth.getAccounts(); // Correct use of await inside async function
    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({
      gas: '3000000', // Adjust as needed
      gasPrice: web3.utils.toWei('20', 'gwei'), // Reduce gas price to save costs
      from: accounts[0]
    });
  
    console.log('Contract deployed to', result.options.address);
  } catch (error) {
    console.error('Error deploying contract:', error);
  } finally {
    provider.engine.stop(); // Ensure the provider is stopped after deployment
  }
};

// Execute deploy function
deploy();
