from flask import Flask, request, jsonify, send_from_directory
from peewee import *
import datetime
import os
import traceback
from playhouse.shortcuts import model_to_dict
import json
from web3 import Web3, HTTPProvider
from eth_account.messages import encode_defunct
import bip44
from eth_account import Account
from vercel_kv import KV, Opts

app = Flask(__name__, static_folder='./build')
CACHE = KV()

db = MySQLDatabase('sql10677283', user='sql10677283', password=os.getenv("MYSQL_PASSWD", 'your_password'), host='sql10.freemysqlhosting.net', port=3306)

class BaseModel(Model):
    class Meta:
        database = db

class Txns(BaseModel):
    sender = CharField(max_length=100, default='')
    receiver = CharField(max_length=100, default='')
    created = DateTimeField(default=datetime.datetime.now, null=True)
    executed = DateTimeField(null=True)
    value = CharField(max_length=100, default='')
    deadline = CharField(max_length=100, default='')
    amount = CharField(max_length=100, default='')
    status = CharField(max_length=100, default='')
    extra = TextField(default='')

def json_list(query):
    return list(map(
        lambda x: model_to_dict(x),
        query
    ))

def update_txn_pending(txn_id):
    try:
        txn = Txns.get_by_id(txn_id)        
        txn.status = 'Pending'
        txn.executed = None
        txn.save()
        return True
    except DoesNotExist:
        print(f"Transaction with ID {txn_id} does not exist.")
        return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

def update_txn_status(txn_id):
    try:
        txn = Txns.get_by_id(txn_id)        
        txn.status = 'Permit'
        txn.executed = datetime.datetime.now()
        txn.save()
        return True
    except DoesNotExist:
        print(f"Transaction with ID {txn_id} does not exist.")
        return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

def update_txn_value(txn_id, new_value=None):
    try:
        txn = Txns.get_by_id(txn_id)  
        if new_value:      
            txn.value = new_value
        txn.status = 'Finished'
        txn.executed = datetime.datetime.now()
        txn.save()
        return True
    except DoesNotExist:
        print(f"Transaction with ID {txn_id} does not exist.")
        return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

@app.route('/create_txn', methods=['POST'])
def create_txn():
    try:
        txn_data = request.json
        txn = Txns.create(**txn_data)
        return jsonify(model_to_dict(txn)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/get_txns', methods=['GET'])
def get_txns():
    try:
        txns = Txns.select().order_by(Txns.created.desc())
        return jsonify(json_list(txns))
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.route('/execute', methods=['GET'])
def rpc_execute():
    try:
        index = request.args.get('id')
        s = request.args.get('s')
        t = request.args.get('t')
        if s is not None and int(s) > 1:
            s = 2
        else:
            s = 1
        execute(index, s, t)
        return jsonify({'status': 0}), 200
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 400

@app.route('/execute2', methods=['GET'])
def rpc_execute2():
    try:
        index = request.args.get('id')
        s = request.args.get('s')
        t = request.args.get('t')
        if s is not None and int(s) > 1:
            s = 2
        else:
            s = 1
        execute2(index, s, t)
        return jsonify({'status': 0}), 200
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 400
    
@app.route('/get', methods=['GET'])
def read_cache():
    try:
        k = request.args.get('k')
        if k == 'v':
            k = 'AFvolume'
        if k == 'g':
            k = 'AFgasPrice'
        return jsonify({'value': CACHE.get(key=k)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# TEST ONLY
@app.route('/pending', methods=['GET'])
def pending():
    try:
        index = request.args.get('id')
        update_txn_pending(index)
        return jsonify({'status': 0}), 200
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 400

def parse_transaction_receipt(recipt, gas_price):
    gas_used = recipt['gasUsed']
    total_cost_wei = gas_used * gas_price
    old_total_cost_wei = CACHE.get(key='AFgasPrice')
    if old_total_cost_wei is None:
        old_total_cost_wei = 0
    else:
        old_total_cost_wei = int(old_total_cost_wei)
    total_cost_wei += old_total_cost_wei
    CACHE.set(key='AFgasPrice', value=total_cost_wei)

def test_add_gas_price():
    total_cost_wei = 7499908034585139
    old_total_cost_wei = CACHE.get(key='AFgasPrice')
    if old_total_cost_wei is None:
        old_total_cost_wei = 0
    else:
        old_total_cost_wei = int(old_total_cost_wei)
    total_cost_wei += old_total_cost_wei
    CACHE.set(key='AFgasPrice', value=total_cost_wei)

def add_volume(value):
    price = 13.25
    addition = price * value
    volume = CACHE.get(key='AFvolume')
    if volume is None:
        volume = 0
    else:
        volume = float(volume)
    addition += volume
    CACHE.set(key='AFvolume', value=addition)

def execute(index, speed=1, test=None):
    txn = Txns.get_by_id(index)
    # if txn.status != "Pending":
    #     return
    gas_price = int(w3.eth.gas_price * speed)
    if test is not None:
        provider_url = 'https://sepolia.infura.io/v3/' + os.getenv("INFURA", 'your_password')
        w3 = Web3(HTTPProvider(provider_url))
        account = os.getenv("GASTANK_ACCOUNT", 'your_password')
        private_key = os.getenv("GASTANK_PK", 'your_password')
        contract_address = w3.to_checksum_address('0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a')
        contract_abi=[{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint8","name":"decimals","type":"uint8"},{"internalType":"address","name":"owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":False,"inputs":[{"indexed":True,"internalType":"address","name":"owner","type":"address"},{"indexed":True,"internalType":"address","name":"spender","type":"address"},{"indexed":False,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":False,"inputs":[{"indexed":True,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":True,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":False,"inputs":[{"indexed":True,"internalType":"address","name":"from","type":"address"},{"indexed":True,"internalType":"address","name":"to","type":"address"},{"indexed":False,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EIP712_REVISION","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]
        contract = w3.eth.contract(address=contract_address, abi=contract_abi)
        owner = txn.sender
        spender = account
        value = int(txn.amount)
        deadline = int(txn.deadline)
        signature = json.loads(txn.extra)
        v = int(signature['v']) 
        r = signature['r']
        s = signature['s']
        gas_limit = 1000000
        current_gas_price_gwei = w3.from_wei(gas_price, 'gwei')
        # print(f"Current Gas Price: {current_gas_price_gwei} Gwei")
        prefix = 0
        permit_txn = contract.functions.permit(owner, spender, value, deadline, v, r, s).build_transaction({
            'nonce': w3.eth.get_transaction_count(account) + prefix,
            'gas': gas_limit,
            'gasPrice': gas_price
        })
        signed_permit_txn = w3.eth.account.sign_transaction(permit_txn, private_key)
        tx_permit_hash = w3.eth.send_raw_transaction(signed_permit_txn.rawTransaction)
        tx_permit_hash_hex = tx_permit_hash.hex()
        # print("start permit", tx_permit_hash_hex)
        r = w3.eth.wait_for_transaction_receipt(tx_permit_hash)
        parse_transaction_receipt(r, gas_price)
        # print("tx_permit_hash", tx_permit_hash_hex)
    else:
        test_add_gas_price(gas_price)
    update_txn_status(index)
    
def execute2(index, speed=1, test=None):
    prefix = 0
    txn = Txns.get_by_id(index)
    # if txn.status != "Permit":
    #     return
    value = int(txn.amount)
    if test is not None:
        provider_url = 'https://sepolia.infura.io/v3/' + os.getenv("INFURA", 'your_password')
        w3 = Web3(HTTPProvider(provider_url))
        account = os.getenv("GASTANK_ACCOUNT", 'your_password')
        private_key = os.getenv("GASTANK_PK", 'your_password')
        contract_address = w3.to_checksum_address('0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a')
        contract_abi=[{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint8","name":"decimals","type":"uint8"},{"internalType":"address","name":"owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":False,"inputs":[{"indexed":True,"internalType":"address","name":"owner","type":"address"},{"indexed":True,"internalType":"address","name":"spender","type":"address"},{"indexed":False,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":False,"inputs":[{"indexed":True,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":True,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":False,"inputs":[{"indexed":True,"internalType":"address","name":"from","type":"address"},{"indexed":True,"internalType":"address","name":"to","type":"address"},{"indexed":False,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EIP712_REVISION","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]
        contract = w3.eth.contract(address=contract_address, abi=contract_abi)
        gas_price = int(w3.eth.gas_price * speed)
        gas_limit = 1000000
        transfer_txn = contract.functions.transferFrom(txn.sender, txn.receiver, value).build_transaction({
            'nonce': w3.eth.get_transaction_count(account) + prefix,
            'gas': gas_limit,
            'gasPrice': gas_price
        })
        signed_transfer_txn = w3.eth.account.sign_transaction(transfer_txn, private_key)
        tx_transfer_hash = w3.eth.send_raw_transaction(signed_transfer_txn.rawTransaction)
        tx_transfer_hash_hex = tx_transfer_hash.hex()
        # print("start transfer", tx_transfer_hash_hex)
        r = w3.eth.wait_for_transaction_receipt(tx_transfer_hash)
        parse_transaction_receipt(r, gas_price)
        print("tx_transfer_hash", tx_transfer_hash_hex)
        update_txn_value(index, tx_transfer_hash_hex)
    else:
        update_txn_value(index, None)
    add_volume(value / 1000000000000000000.0)

def main():
    db.connect()
    db.create_tables([Txns], safe=True)
    app.run(debug=True)

if __name__ == "__main__":
    execute(17, 2)
    execute2(17, 2)
