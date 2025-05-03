import { useState } from "react";
import { AztecWalletSdk, obsidion } from "@nemi-fi/wallet-sdk"
import { Contract } from "@nemi-fi/wallet-sdk/eip1193"
import { TokenContract } from "@aztec/noir-contracts.js/Token"
import { AztecAddress } from "@aztec/aztec.js";

export const WalletConnect = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState(null);

    // const NODE_URL = "http://localhost:8080" // sandbox
// const NODE_URL = "https://registry.obsidion.xyz/node" // testnet
const NODE_URL = "http://pxe.obsidion.xyz/sandbox" // devnet

const WALLET_URL = "https://app.obsidion.xyz"

// This should be instantiated outside of any js classes / react components
const sdk = new AztecWalletSdk({
  aztecNode: NODE_URL,
  connectors: [obsidion({walletUrl: WALLET_URL})]
})

// example method that does...
// 1. connect to wallet
// 2. instantiate token contract
// 3. send tx

class Token extends Contract.fromAztec(TokenContract) {}
    
    const connectWallet = async () => {
        // instantiate wallet sdk
  const account = await sdk.connect("obsidion")

  const tokenAddress = AztecAddress.fromString("0x08a7b5ff689b190285de04dd7431b439342b6ad9c2168313a32be3b30fce28a4")
  const token = await Token.at(tokenAddress, account.getAddress())
    setAccount(account?.getAddress())
  // send tx
  const tx = await token.methods.transfer(account.getAddress(), 100).send().wait()
  
  console.log("tx", tx)
//   // simulate tx
  const balance = await token.methods.balance_of_private(account.getAddress()).simulate()
    console.log("balance", balance.toString())
    };
    
    return (
        <div>
        {isConnected ? (
            <div>
            <p>Connected as: {account}</p>
            <button onClick={() => setIsConnected(false)}>Disconnect</button>
            </div>
        ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
        )}
        </div>
    );
    }