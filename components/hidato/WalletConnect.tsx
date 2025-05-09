import { useState, useRef, useEffect } from "react";
import { useAccount } from "@nemi-fi/wallet-sdk/react";
import "./WalletConnect.css";
import { useHidato } from "context/HidatoContext";

export const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);
  const {sdk} = useHidato();
  
  const account = useAccount(sdk);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (account?.address) {
      setIsConnected(true);
      setIsLoading(false);
    }
  }, [account]);
  
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await sdk.connect('obsidion');
            setTimeout(() => {
        if (!account?.address) {
          setIsLoading(false);
        }
      }, 10000); // 10 second timeout
    } catch (error) {
      console.error("Connection error:", error);
      setIsLoading(false);
    }
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    setShowMenu(false);
    
    if (typeof sdk.disconnect === 'function') {
      sdk.disconnect();
    }
  };
  
  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const formatAddress = (address) => {
    if (!address) return "";
    const addr = address.toString();
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  if (!isConnected) {
    return (
      <button 
        className={`wallet-btn ${isLoading ? 'loading' : ''}`} 
        onClick={handleConnect}
        disabled={isLoading}
      >
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }
  
  return (
    <div className="wallet-container" ref={menuRef}>
      <button 
        className="wallet-btn connected" 
        onClick={() => setShowMenu(!showMenu)}
      >
        <span className="status-dot"></span>
        <span>{formatAddress(account?.address)}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {showMenu && (
        <div className="wallet-dropdown">
          <div className="wallet-address">
            <span>{formatAddress(account?.address)}</span>
            <button 
              className={`copy-btn ${copied ? 'copied' : ''}`} 
              onClick={copyAddress}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <button className="disconnect-btn" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
