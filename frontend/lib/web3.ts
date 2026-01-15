import { ethers } from 'ethers';
import { ENGINE_ADDRESS, ENGINE_ABI, ERC20_ABI } from './contracts';

export const getProvider = () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return null;
};

export const connectWallet = async () => {
  const provider = getProvider();
  if (!provider) throw new Error('No wallet found');

  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
};

export const getEngineContract = async () => {
  const { signer } = await connectWallet();
  return new ethers.Contract(ENGINE_ADDRESS, ENGINE_ABI, signer);
};

export const getTokenContract = async (tokenAddress: string) => {
  const { signer } = await connectWallet();
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
};

export const formatTokenAmount = (amount: string | number, decimals: number = 6) => {
  return ethers.parseUnits(amount.toString(), decimals);
};

export const parseTokenAmount = (amount: bigint, decimals: number = 6) => {
  return ethers.formatUnits(amount, decimals);
};

export const getPredictedVaultAddress = async (userAddress: string, planId: number) => {
  const contract = await getEngineContract();
  return await contract.getDepositAddress(userAddress, planId);
};

export const subscribeWithWallet = async (planId: number, tokenAddress: string, amount: string) => {
  const contract = await getEngineContract();
  const tokenContract = await getTokenContract(tokenAddress);

  const amountWei = formatTokenAmount(amount);
  const { address } = await connectWallet();

  const allowance = await tokenContract.allowance(address, ENGINE_ADDRESS);

  if (allowance < amountWei) {
    const approveTx = await tokenContract.approve(ENGINE_ADDRESS, amountWei);
    await approveTx.wait();
  }

  const tx = await contract.subscribe(planId);
  return await tx.wait();
};

export const checkSubscriptionStatus = async (userAddress: string, planId: number) => {
  const contract = await getEngineContract();
  return await contract.isSubscriptionActive(userAddress, planId);
};
