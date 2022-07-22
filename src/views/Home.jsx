import { lazy } from "react";
import "./styles/home.css";

import { useState, useEffect } from "react";

import {fetchClustors, fetchClustorName} from "../utils/tzkt";

const List = lazy(() => import("../components/List")); 

let ListTitles = [];

const Home = () => {
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const clustorList = await fetchClustors();
            for (const i in clustorList){
                let clustorName = await fetchClustorName(clustorList[i]);
                ListTitles.push({address: clustorList[i], cname: clustorName});            
            }
            setLoading(false);                  
        })(); 
        
        return () => {
            setLoading(true);
            ListTitles = [];
        }
       
    }, []); 

  return (
    <div className="home-root">
      <div className="hero-body">
        <h1 className="hero-header">Tezos Clustors</h1>
        <p className="hero-subtext">
            Tired of maintaining and buying different cryptos individually in your portfolio? <br/>
            Irritated from paying gas fees for trades on each crypto individually? <br/> <br/>
            Don't worry, Clustors is here to save you. No need to check on individual cryptos now, instead buy sectors as a whole. Let's say you are bullish on Metaverse,
            you don't have to run around acquiring individual Metaverse tokens anymore, just a buy a Metaverse centric Clustor and you are solid. <br/><br/>
            Using Clustors is really simple, you can issue a clustor token by paying the defined amount of tokens, now this clustor token can be traded on the DEXs across the Tezos
            Network. You can get back your respective tokens by redeeming the clustor token, this provides you with various arbitrage opportunities across different
            platforms. The respective tokens inside the Clustor Contract can be used as a liquidity for the Flash Loan, you can lock in your clustor tokens and enjoy the
            rewards in XTZ that will be accumulated as fees for the flash loans. Anyone can issue a flash loan of any respective tokens of the amount less than the flash
            amount (locked clustor tokens X amount of respective token per clustor). 
        </p>
      </div>
      <div className="lists-container">
        <h2 className="lists-header">{loading ? "Please Wait" : "Browse Clustors"}</h2>
        <List listTitles={ListTitles}/>
      </div>
    </div>
  );
};

export default Home;
