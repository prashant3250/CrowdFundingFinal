import Web3 from "web3";

let web3;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // We are in the browser and MetaMask is running.
  web3 = new Web3(window.ethereum);

  // Listen for account changes
  window.ethereum.on('accountsChanged', (accounts) => {
    // Handle the new accounts or reload the page
    console.log('Accounts changed:', accounts);
    window.location.reload(); // Refresh to update the UI
  });

  // Request accounts initially
  window.ethereum.request({ method: 'eth_requestAccounts' });
} else {
  // We are on the server *OR* the user is not running MetaMask
  const provider = new Web3.providers.HttpProvider(
    "https://sepolia.infura.io/v3/0071c0ab97ef4a9ab5106458a80f57fb"
  );
  web3 = new Web3(provider);
}

export default web3;
