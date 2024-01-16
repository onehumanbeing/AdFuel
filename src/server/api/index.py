from flask import Flask, request, jsonify
from peewee import *
import datetime
import os
from playhouse.shortcuts import model_to_dict
import json
from web3 import Web3, HTTPProvider
from eth_account.messages import encode_defunct
import bip44
from eth_account import Account

app = Flask(__name__)

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
    
def execute(index):
    txn = Txns.get_by_id(index)
    w3 = Web3(HTTPProvider('https://sepolia.infura.io/v3/' + os.getenv("INFURA", 'your_password')))
    account = os.getenv("GASTANK_ACCOUNT", 'your_password')
    mnemonic = os.getenv("GASTANK_PK", 'your_password')
    wallet = bip44.Wallet(mnemonic)
    private_key = wallet.derive_account("eth", account=0)    
    contract_address = w3.to_checksum_address('0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a')
    contract_abi=[{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint8","name":"decimals","type":"uint8"},{"internalType":"address","name":"owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":False,"inputs":[{"indexed":True,"internalType":"address","name":"owner","type":"address"},{"indexed":True,"internalType":"address","name":"spender","type":"address"},{"indexed":False,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":False,"inputs":[{"indexed":True,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":True,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":False,"inputs":[{"indexed":True,"internalType":"address","name":"from","type":"address"},{"indexed":True,"internalType":"address","name":"to","type":"address"},{"indexed":False,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EIP712_REVISION","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]
    contract = w3.eth.contract(address=contract_address, abi=contract_abi)
    deadline = txn.deadline
    owner = txn.sender
    spender = account
    value = txn.amount
    signature = json.loads(txn.extra)
    permit_txn = contract.functions.permit(owner, spender, value, int(deadline), signature['v'], signature['r'], signature['s']).buildTransaction({
        'nonce': w3.eth.getTransactionCount(account)
    })
    signed_permit_txn = w3.eth.account.sign_transaction(permit_txn, private_key)
    tx_permit_hash = w3.eth.sendRawTransaction(signed_permit_txn.rawTransaction)
    w3.eth.waitForTransactionReceipt(tx_permit_hash)
    print("tx_permit_hash", tx_permit_hash)
    transfer_txn = contract.functions.transferFrom(txn.sender, txn.receiver, value).buildTransaction({
        'nonce': w3.eth.getTransactionCount(account)
    })
    signed_transfer_txn = w3.eth.account.sign_transaction(transfer_txn, private_key)
    tx_transfer_hash = w3.eth.sendRawTransaction(signed_transfer_txn.rawTransaction)
    w3.eth.waitForTransactionReceipt(tx_transfer_hash)
    print("tx_transfer_hash", tx_transfer_hash)
    

def main():
    db.connect()
    db.create_tables([Txns], safe=True)
    app.run(debug=True)

if __name__ == "__main__":
    execute(2)
