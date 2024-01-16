from flask import Flask, request, jsonify
from peewee import *
import datetime
import os
from playhouse.shortcuts import model_to_dict
import json

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

if __name__ == "__main__":
    db.connect()
    db.create_tables([Txns], safe=True)
    app.run(debug=True)
