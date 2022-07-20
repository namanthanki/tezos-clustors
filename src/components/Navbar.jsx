import "./styles/navbar.css";
import { useEffect, useState } from "react";

import {connectWallet, getAccount} from "../utils/wallet";
 
const Navbar = () => {
    
    const [account, setAccount] = useState("");
    
    useEffect(() => {
        (async () => {
            const account = await getAccount();
            setAccount(account);        
        })();
    }, [])

    const onConnectWallet = async () => {
        await connectWallet();
        const account = await getAccount();
        setAccount(account);
    }
    
    return (
        <div className="navbar">
            <div className="navbar_logo">
                <a className="navbar_home_redirect" href="/"><h2>Clustors</h2></a>
            </div>
            <div className="walet_btn">
                <button className="button-29" onClick={onConnectWallet}>
                    {account ? account : "Connect Wallet"}
                </button>
            </div>
        </div>
    );
}

export default Navbar;
