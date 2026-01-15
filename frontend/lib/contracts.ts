export const ENGINE_ADDRESS = process.env.NEXT_PUBLIC_ENGINE_ADDRESS || '0x09d6aA421ceEEBCF0095E2eB9549A30Ef1c7f38e';
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0xC67383553f36DF0305C52E9eEafBd903c47039c5';

export const ENGINE_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_protocolTreasury', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { internalType: 'address', name: '_user', type: 'address' },
      { internalType: 'uint256', name: '_planId', type: 'uint256' },
    ],
    name: 'getDepositAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_planId', type: 'uint256' }],
    name: 'subscribe',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_user', type: 'address' },
      { internalType: 'uint256', name: '_planId', type: 'uint256' },
    ],
    name: 'isSubscriptionActive',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint256', name: '_frequency', type: 'uint256' },
    ],
    name: 'createPlan',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
  'function balanceOf(address account) public view returns (uint256)',
];
