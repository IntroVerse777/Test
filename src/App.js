import React, { useState, useEffect } from 'react';
import './App.css';
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';

// Define your donation address here
const DONATION_ADDRESS = '7X3R6mtCXvyJBw5wZWYykfuW2wTVZKkU7kQNbDxn29SY'; // Replace with your Solana wallet address

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  // Check if Phantom Wallet is connected
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        const response = await solana.connect({ onlyIfTrusted: true });
        setWalletAddress(response.publicKey.toString());
      }
    } catch (err) {
      console.error('Connection Error:', err);
    }
  };

  // Connect to the Phantom Wallet
  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      try {
        const response = await solana.connect();
        setWalletAddress(response.publicKey.toString());
      } catch (err) {
        console.error('Connection Error:', err);
      }
    }
  };

  // Handle the donation transaction
  const handleDonate = async () => {
    try {
      const { solana } = window;

      if (!solana || !walletAddress) {
        alert('Please connect your Phantom Wallet first!');
        return;
      }

      // Create a new connection to the Solana blockchain
      const connection = new Connection(clusterApiUrl('testnet'), 'confirmed');

      // Define the sender and recipient public keys
      const senderPublicKey = new PublicKey(walletAddress);
      const recipientPublicKey = new PublicKey(DONATION_ADDRESS);

      // Create a transaction to send 0.01 SOL to the recipient
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL
        })
      );

      // Specify the recent blockhash to ensure the transaction is processed in the latest block
      transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
      transaction.feePayer = senderPublicKey;

      // Let the wallet sign the transaction
      const signed = await solana.signTransaction(transaction);

      // Send the signed transaction
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature, 'processed');

      alert(`Donation successful! Transaction Signature: ${signature}`);
    } catch (err) {
      console.error('Donation Error:', err);
      alert('Donation failed. Please try again!');
    }
  };

  useEffect(() => {
    // Check if wallet is connected on load
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Support Our Solana Project</h1>
        {walletAddress ? (
          <>
            <p>Connected Wallet: {walletAddress}</p>
            <button className="donate-button" onClick={handleDonate}>
              Donate 0.01 SOL
            </button>
          </>
        ) : (
          <button className="connect-button" onClick={connectWallet}>
            Connect Phantom Wallet
          </button>
        )}
      </header>
    </div>
  );
}

export default App;
