import { lazy } from "react";
import { useState, useEffect } from "react";
import "./styles/clustor.css";
import {useParams} from "react-router-dom";


import {fetchStorage, fetchSupply, fetchLocked} from "../utils/tzkt"
import {initOperation, issueOperation, redeemOperation, lockOperation, unlockOperation} from "../utils/operations"

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
      };
  
    const onIssue = async () => {
        try {
          setLoading(true);
          await issueOperation(address);
          alert("Transaction succesful!");
        } catch (err) {
          alert(err.message);
        }
        setLoading(false);  
        const fsupply = await fetchSupply(ctokenAddress);
        setTotalSupply(fsupply);      
    };

    const onRedeem = async () => {
        try {
          setLoading(true);
          await redeemOperation(address);
          alert("Transaction succesful!");
        } catch (err) {
          alert(err.message);
        }
        setLoading(false);  
        const fsupply = await fetchSupply(ctokenAddress);
        setTotalSupply(fsupply);     
    };   

    const onLock = async () => {
        try {
          setLoading(true);
          await lockOperation(address);
          alert("Transaction succesful!");
        } catch (err) {
          alert(err.message);
        }
        setLoading(false);
        const locked = await fetchLocked(address);
        setLockedClustors(locked);        
    }; 

    const onUnlock = async () => {
        try {
          setLoading(true);
          await unlockOperation(address);
          alert("Transaction succesful!");
        } catch (err) {
          alert(err.message);
        }
        setLoading(false);
        const locked = await fetchLocked(address);
        setLockedClustors(locked);        
    };

    return (
        <div className="cluster-container">
            <div className="cluster-header">
                <h2 className="cluster-title">{name}</h2>
            {clustorStatus ? 
                <p className="cluster-supply">{"Clustor Supply : " + totalSupply}</p>
            : 
                <button className="button-29" onClick={onInit}>{loading ? "Loading..." : "Initialize"}</button>
            }
            </div>
            <div className="lists-container">
                <TokensList addresses={ListAddresses} />
            </div>
            <div className="cluster-buttons">
                <button className="btn" onClick={onIssue}>{loading ? "Loading.." : "Issue"}</button>
                <button className="btn" onClick={onRedeem}>{loading ? "Loading.." : "Redeem"}</button>
                <button className="btn" onClick={onLock}>{loading ? "Loading.." : "Lock"}</button>
                <button className="btn" onClick={onUnlock}>{loading ? "Loading.." : "Unlock"}</button>
            </div>
            <div className="cluster-footer">
                <p className="footer-text">{"Total Locked Clustors : " + lockedClustors}</p>
            </div>
        </div>
    );
};

export default Clustor;
