import { tezos } from "./tezos";

export const initOperation = async (contract) => {
  try {
    const contractInstance = await tezos.wallet.at(contract);
    const op = await contractInstance.methods.initClustorToken().send();
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};

export const issueOperation = async (contract, amount) => {
  try {
    const contractInstance = await tezos.wallet.at(contract);
    const op = await contractInstance.methods.issueToken(amount).send();
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};

export const redeemOperation = async (contract, amount) => {
  try {
    const contractInstance = await tezos.wallet.at(contract);
    const op = await contractInstance.methods.redeemToken(amount).send();
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};

export const lockOperation = async (contract, amount) => {
  try {
    const contractInstance = await tezos.wallet.at(contract);
    const op = await contractInstance.methods.lockClustors(amount).send();
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};

export const unlockOperation = async (contract, amount) => {
  try {
    const contractInstance = await tezos.wallet.at(contract);
    const op = await contractInstance.methods.unlockClustors(amount).send();
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};

export const approveOperation = async (token_contract, clustor_contract , amount) => {
  try {
    const contractInstance = await tezos.wallet.at(token_contract);
    const op = await contractInstance.methods.approve(clustor_contract, amount).send();
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};

export const flashOperation = async (contract, token_contract, flash_contract, flash_amount) => {
  try {
    const contractInstance = await tezos.wallet.at(contract);
    const op = await contractInstance.methods.flashLoan(flash_amount, flash_contract, token_contract).send({
      amount: 1,
      mutez: false,
    });
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};
