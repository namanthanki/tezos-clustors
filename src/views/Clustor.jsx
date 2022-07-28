import { lazy } from "react";
import { useState, useEffect } from "react";
import "./styles/clustor.css";
import {useParams} from "react-router-dom";


import {fetchStorage, fetchSupply, fetchLocked} from "../utils/tzkt"
import {initOperation, issueOperation, redeemOperation, lockOperation, unlockOperation, approveOperation, flashOperation} from "../utils/operations"

const TokensList = lazy(() => import("../components/TokensList"));

let ListAddresses = [];

const Clustor = () => {

    const {address} = useParams();

    const [ctokenAddress, setCTokenAddress] = useState("");       
    const [loading, setLoading] = useState(false);
    const [clustorStatus, setClustorStatus] = useState(false);
    const [lockedClustors, setLockedClustors] = useState(0);
    const [totalSupply, setTotalSupply] = useState(0);
    const [name, setName] = useState("");

    const [flashAmount, setFlashAmount] = useState(0);
    const [flashAddress, setFlashAddress] = useState("");
    const [tokenFlash, setTokenFlash] = useState("");

    const [amount, setAmount] = useState(1);

    useEffect(() => {
        (async () => {
            const storage = await fetchStorage(address);
            const supply = await fetchSupply(storage.clustorToken);
            const tokenMap = await storage.tokens;
            
            for (const token in tokenMap) {
                ListAddresses.push({address : token, value : tokenMap[token]});           
            }      

            setTotalSupply(supply);
            setClustorStatus(storage.clustorInited);
            setName(storage.clustorName);   
            setLockedClustors(Number(storage.lockedClustors));  
            setCTokenAddress(storage.clustorToken);   
        })();
            return () => {
            ListAddresses = [];
            setTotalSupply(0);
            setClustorStatus(false);
            setLockedClustors(0);
            setName("Clustor Name");
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

      const onInit = async () => {
        try {
          setLoading(true);
          await initOperation(address);
          alert("Transaction succesful!");
        } catch (err) {
          alert(err.message);
        }
        setLoading(false);
        const fstorage = await fetchStorage(address);
        setLockedClustors(Number(fstorage.lockedClustors));
        const fsupply = await fetchSupply(fstorage.clustorToken);
        setTotalSupply(fsupply);
      }
  
    const onIssue = async () => {
        try {
          setLoading(true);
          await issueOperation(address, amount);
          alert("Transaction succesful!");
        } catch (err) {
          alert(err.message);
        }
        setLoading(false);  
        const fsupply = await fetchSupply(ctokenAddress);
        setTotalSupply(fsupply);      
    }

    const onRedeem = async () => {
        try {
          setLoading(true);
          await redeemOperation(address, amount);
          alert("Transaction succesful!");
        } catch (err) {
          alert(err.message);
        }
        setLoading(false);  
        const fsupply = await fetchSupply(ctokenAddress);
        setTotalSupply(fsupply);     
    }   

    const onLock = async () => {
        try {
          setLoading(true);
          await lockOperation(address, amount);
          alert("Transaction succesful!");
        } catch (err) {
          alert(err.message);
        }
        setLoading(false);
        const locked = await fetchLocked(address);
        setLockedClustors(locked);        
    } 

    const onUnlock = async () => {
        try {
          setLoading(true);
          await unlockOperation(address, amount);
          alert("Transaction succesful!");
        } catch (err) {
          alert(err.message);
        }
        setLoading(false);
        const locked = await fetchLocked(address);
        setLockedClustors(locked);        
    }

    const onApprove = async () => {
        try {
          setLoading(true);
          for(const i in ListAddresses){
                await approveOperation(ListAddresses[i].address, address , ListAddresses[i].value * amount);
                alert("Transaction succesful!");
           }
        } catch (err) {
          alert(err.message);
        }
        setLoading(false);
        const locked = await fetchLocked(address);
        setLockedClustors(locked);        
    }

    const onFlash = async () => {
        try {
          setLoading(true);
          await flashOperation(address, tokenFlash, flashAddress, flashAmount);
        } catch (err) {
          alert(err.message);
        }
        setLoading(false);     
    }


    return (
        <div className="cluster-container">
            <div className="cluster-header">
                <h2 className="cluster-title">{name}</h2>
                {clustorStatus ? 
                <div className="supply-wrapper">
                    <h2 className="cluster-supply">{"Clustor Supply : " + totalSupply}</h2>
                    <span className="cluster-list-subtext"><b>{"Clustor Address : " + ctokenAddress}</b></span><br/>
                    <span className="cluster-list-subtext">Add this token address to your respective wallets</span>
                </div>                
                : 
                    <button className="button-29" onClick={onInit}>{loading ? "Loading..." : "Initialize"}</button>
                }
            </div>
            <div className="columns-wrapper">
              <div className="lists-container">
                  <h3 className="list-header">Token List</h3>
                  <span className="cluster-list-subtext">Please note that the token values are without the decimals, <br />
                                                         in order to get the values in general standard - divide the values by respective token decimals.                
                 </span>
                  <TokensList addresses={ListAddresses} />
                  
                  <div className="list-form">
                    <div className="list-input">
                      <input type="number" min="1" value={amount} name="input-amount" id="input-amount" onChange={(e) => setAmount(e.target.value)} />
                    </div>

                    <span className="cluster-list-subtext"> **You need to first approve the tokens for issuing new clustors.                 
                     </span>
    
                    <div className="cluster-buttons">
                        <button className="btn" onClick={onIssue}>{loading ? "Loading.." : "Issue"}</button>
                        <button className="btn" onClick={onRedeem}>{loading ? "Loading.." : "Redeem"}</button>
                        <button className="btn" onClick={onLock}>{loading ? "Loading.." : "Lock"}</button>
                        <button className="btn" onClick={onUnlock}>{loading ? "Loading.." : "Unlock"}</button>
                        <button className="btn" onClick={onApprove}>{loading ? "Loading.." : "Approve"}</button>
                    </div>
                  </div>
              </div>

              <div className="flash-loan-container">
                <div className="flash-loan-header">
                  <h3 className="flash-loan-title">Flash Loan</h3>
                    <span className="flash-subtext"> **Make sure that the tokens are pre-approved for the flash loan.<br />                
                     </span>
                </div>

                <div className="flash-loan-form">
                  <label htmlFor="token-address">Token Address</label><br />
                  <input type="text" name="token-address" id="token-address" onChange={(e) => setTokenFlash(e.target.value)} /> <br />
                  <label htmlFor="contract-address">Contract Address</label><br />
                  <input type="text" name="contract-address" id="contract-address" onChange={(e) => setFlashAddress(e.target.value)} /> <br />
                  <label htmlFor="amount">Amount: </label><br />
                  <input type="number" min="1" name="flash-amount" id="flash-amount" onChange={(e) => setFlashAmount(e.target.value)} />
                </div>

                <div className="flash-loan-footer">
                  <p className="footer-text">{"Total Locked Clustors : " + lockedClustors}</p>
                   <div className="lash-subtext">
                    <span className="flash-subtext"> **The entry-point of the flash loan contract should be named - "execute_operation".                 
                     </span>
                   </div>
                </div>

                <button className="btn execute-btn" onClick={onFlash}>{loading ? "Loading.." : "Execute"}</button>
              </div>
            </div>
            
            
            
        </div>
    );
};

export default Clustor;
