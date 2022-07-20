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

export const issueOperation = async (contract) => {
  try {
    const contractInstance = await tezos.wallet.at(contract);
    const op = await contractInstance.methods.issueToken(1).send();
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};

export const redeemOperation = async (contract) => {
  try {
    const contractInstance = await tezos.wallet.at(contract);
    const op = await contractInstance.methods.redeemToken(1).send();
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};

export const lockOperation = async (contract) => {
  try {
    const contractInstance = await tezos.wallet.at(contract);
    const op = await contractInstance.methods.lockClustors(1).send();
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};

export const unlockOperation = async (contract) => {
  try {
    const contractInstance = await tezos.wallet.at(contract);
    const op = await contractInstance.methods.unlockClustors(1).send();
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};
