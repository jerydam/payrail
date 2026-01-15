import time
import os
import json
from web3 import Web3
from database import supabase

# 1. Configuration
RPC_URL = os.getenv("RPC_URL") # e.g. https://sepolia.base.org
PRIVATE_KEY = os.getenv("ADMIN_PRIVATE_KEY") # Export from your Metamask (Keep Secret!)
ENGINE_ADDRESS = os.getenv("ENGINE_ADDRESS") 

# Load ABI (Keep this minimal or load from a JSON file)
ENGINE_ABI = '[{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"_planId","type":"uint256"}],"name":"processDeposit","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'

w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)
contract = w3.eth.contract(address=ENGINE_ADDRESS, abi=json.loads(ENGINE_ABI))

def trigger_contract_sweep(user_wallet, plan_id):
    """
    Signs and sends the 'processDeposit' transaction to the blockchain.
    """
    try:
        # 1. Build the transaction
        # We estimate gas to ensure it doesn't fail, but you can hardcode a limit too
        func_call = contract.functions.processDeposit(user_wallet, int(plan_id))
        
        gas_estimate = func_call.estimate_gas({'from': account.address})
        
        tx_data = func_call.build_transaction({
            'chainId': w3.eth.chain_id,
            'gas': int(gas_estimate * 1.2), # Add 20% buffer
            'maxFeePerGas': w3.eth.gas_price * 2, # EIP-1559 aggressive
            'maxPriorityFeePerGas': w3.to_wei('2', 'gwei'),
            'nonce': w3.eth.get_transaction_count(account.address),
        })

        # 2. Sign the transaction
        signed_tx = w3.eth.account.sign_transaction(tx_data, PRIVATE_KEY)

        # 3. Send raw transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        print(f"✅ Sweep TX Sent: {tx_hash.hex()}")
        
        # 4. Wait for receipt (Optional, but good for DB confirmation)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        if receipt.status == 1:
            return tx_hash.hex()
        else:
            print("❌ Transaction Reverted on-chain")
            return None

    except Exception as e:
        print(f"❌ Failed to sweep: {e}")
        return None

def start_watcher():
    print(f"🚀 Payrail Watcher Online | Admin: {account.address}")
    
    while True:
        try:
            # 1. Get all pending vaults
            vaults = supabase.table("deposit_vaults").select("*, plans(*)").eq("status", "PENDING").execute()
            
            for vault in vaults.data:
                # 2. Check USDC Balance on-chain
                # Note: You need the Token Address from the plan to check balance
                token_address = vault['plans']['token_address'] 
                token_contract = w3.eth.contract(address=token_address, abi=json.loads(ENGINE_ABI)) # Reusing ABI for balanceOf
                
                balance = token_contract.functions.balanceOf(vault['vault_address']).call()
                required_amount = int(vault['plans']['price'] * 10**6) # Assuming 6 decimals for USDC
                
                if balance >= required_amount:
                    print(f"💰 Payment detected for {vault['vault_address']}")
                    
                    # 3. Trigger Sweep
                    tx_hash = trigger_contract_sweep(vault['subscriber_address'], vault['plan_id'])
                    
                    if tx_hash:
                        # 4. Update Database
                        supabase.table("deposit_vaults").update({
                            "status": "ACTIVE",
                            "last_sweep_at": time.strftime('%Y-%m-%d %H:%M:%S'),
                            "balance": 0 # Reset tracked balance
                        }).eq("id", vault['id']).execute()
                        
                        # Update Subscription Status
                        supabase.table("subscriptions").update({
                            "status": "active"
                        }).eq("id", vault['subscription_id']).execute()

            time.sleep(15)
            
        except Exception as e:
            print(f"⚠️ Watcher Loop Error: {e}")
            time.sleep(15)

if __name__ == "__main__":
    start_watcher()