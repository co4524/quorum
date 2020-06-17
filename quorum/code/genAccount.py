import secrets
import eth_keys
import sha3
import json
from eth_keys import keys
with open('../../configure.json' , 'r') as reader:
    config = json.loads(reader.read())

account_number = int(config['setting']['raw_transaction_num'])
account_list = {}
# account_list = []      

for i in range(account_number):
      private_key = str(hex(secrets.randbits(256))[2:])
      while len(private_key)!=64:
            private_key = str(hex(secrets.randbits(256))[2:])
      private_key_bytes = bytes.fromhex(private_key)
      public_key_hex = keys.PrivateKey(private_key_bytes).public_key
      public_key_bytes = bytes.fromhex(str(public_key_hex)[2:])
      public_address = keys.PublicKey(public_key_bytes).to_address()
      # print('\n Private_key:',private_key,
            # '\n Ethereum address:',public_address)
      # account_list.append({
      # public_address: private_key,
      # })
      account_list[public_address] = private_key
      if(i%1000==0): print("Generate ",i," account")

with open(config['quorum']['path']['account'], 'w') as outfile:
    json.dump(account_list, outfile, indent=2)