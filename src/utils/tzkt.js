import axios from "axios";

export const fetchStorage = async (contract_address) => {
    const res = await axios.get("https://api.jakartanet.tzkt.io/v1/contracts/"+ contract_address +"/storage");
    return res.data;
}

export const fetchSupply = async (token_address) => {
    const res = await axios.get("https://api.jakartanet.tzkt.io/v1/contracts/"+ token_address +"/storage");
    return res.data.totalSupply;
}

export const fetchClustorName = async (clustor_address) => {
    const res = await axios.get("https://api.jakartanet.tzkt.io/v1/contracts/"+ clustor_address +"/storage");
    return res.data.clustorName;
}

export const fetchClustors = async () => {
    const res = await axios.get("https://api.jakartanet.tzkt.io/v1/contracts/KT1PV1NF8a93HUcDWJqQueb9SQbLrz89Z5GV/storage");
    return res.data;    
}

export const fetchLocked = async (contract_address) => {
    const res = await axios.get("https://api.jakartanet.tzkt.io/v1/contracts/"+ contract_address +"/storage");
    return res.data.lockedClustors;
}
