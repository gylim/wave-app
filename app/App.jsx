import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "../artifacts/contracts/WavePortal.sol/WavePortal.json";

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [allWaves, setAllWaves] = useState([]);
    const [count, setCount] = useState(0);
    const [message, setMessage] = useState('');
    const [toggle, setToggle] = useState(false);
    const contractAddress = "0x23CA5874c9F4f5Be37B652146b958bED23E423eF";
    const contractABI = abi.abi;

    const getAllWaves = async () => {
        const { ethereum } = window;
        try {
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
                const waves = await wavePortalContract.getAllWaves();
                const total_waves = await wavePortalContract.getTotalWaves();

                const wavesCleaned = 
                waves.map(wave => {
                    return {
                        address: wave.waver,
                        timestamp: new Date(wave.timestamp * 1000),
                        message: wave.message
                    };
                });
            setAllWaves(wavesCleaned);
            setCount(total_waves.toNumber());
            } else {
                console.log("Ethereum object doesn't exist")
            }
        } catch (error) {
            console.log(error);
        }
    };
    
    const checkIfWalletIsConnected = async () => {
        try {
            const { ethereum } = window;
        
            if (!ethereum) {
                alert("Please install an ethereum compatible wallet!");
                return;
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            const accounts = await ethereum.request({method: "eth_accounts"});

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found authorised account:", account);
                setCurrentAccount(account)
            } else {
                console.log("No authorised account found")
            }
        } catch (error) {
            console.log(error);
        }
    }

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("Please install an ethereum wallet");
                return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });

            console.log("Connceted", accounts[0]);
            setCurrentAccount(accounts[0]);
            
        } catch (error) {
            console.log(error)
        }
    }
    
    const wave = async () => {
        try {
            const { ethereum } = window;
    
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
                let count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());
    
                const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
                alert("Please wait while we process your wave: ", waveTxn.hash);
    
                await waveTxn.wait();
                alert("Wave Completed! ", waveTxn.hash);
    
                count = await wavePortalContract.getTotalWaves();
                console.log("Total wave count is ", count.toNumber());
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error)
        }
      }

    useEffect(() => {
        checkIfWalletIsConnected();
        getAllWaves();
    }, [])

    useEffect(() => {
        getAllWaves();
    }, [count, allWaves])
    
    useEffect(() => {
        let wavePortalContract;

        const onNewWave = (from, timestamp, message) => {
            console.log("NewWave", from, timestamp, message);
            setAllWaves(prevState => [...prevState, 
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message: message
                },
            ]);
        };

        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
            wavePortalContract.on("NewWave", onNewWave);
        }

        return () => {
            if (wavePortalContract) {
                wavePortalContract.off("NewWave", onNewWave);
            }
        };
    }, []);
  
      return (
        <div className="mainContainer">
          <div className="dataContainer">
            <div className="header">
            👋 Hey there!
            </div>
    
            <div className="bio">
            I am Ben and I work for an agency helping people to find jobs. <br /> Hoping to build something useful in this space =P <br /> Connect your Ethereum wallet and wave at me! <br />Who knows, you might win a prize
            </div>
              
              {!toggle && (<button className="waveButton" onClick={() => setToggle(true)}>
              Wave at Me
            </button>)}
              
              {toggle && (<>
                <input type="text" placeholder="What would you like to say?" onChange={e => setMessage(e.target.value)} />
                <button className="waveButton" onClick={() => {wave(); setToggle(false)}}>Submit</button></>
              )}
              
            <div className="bio" style={{fontWeight: 'bold'}}>
                We have {count} waves!
            </div>
              {!currentAccount && (
                <button className="waveButton" onClick={connectWallet}>
                    Connect Wallet
                </button>
              )}

              {allWaves.map((wave, index) => {
                return (
                    <div className="history" key={index}>
                        <div className="heavy">Address: <a href={'https://rinkeby.etherscan.io/address/'+wave.address} className="regular">{wave.address}</a></div>
                        <div className="heavy">Time: <text className="regular">{wave.timestamp.toString()}</text></div>
                        <div className="heavy">Message: <text className="regular">{wave.message}</text></div>
                    </div>)
              })}
          </div>
        </div>
      );
}

export default App