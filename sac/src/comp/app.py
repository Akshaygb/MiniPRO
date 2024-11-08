from flask import Flask,request,jsonify
from flask_cors import CORS
from pymongo import MongoClient

app=Flask(__name__)
CORS(app)

clint=MongoClient("mongodb://localhost:27017/")
db=clint["project"]
coll=db["authentication"]

@app.route('/singin',methods=['POST'])
def  singin():
    data=request.json
    tch=data.get("teacher")
    pas=data.get("password")
    print(tch," ",pas)
    confirm_password = data.get('conf')
    if pas!=confirm_password:
        return jsonify({"message":"password not match"}),400
    if not pas:
        return jsonify({"message":"password is required"}),400
    coll.insert_one({"teacher":tch,"password":pas})
    return jsonify({"message": "Signup successful"}), 201
@app.route('/login',methods=['POST'])
def login():
    data=request.json
    tch=data.get("teacher")
    
    password=data.get('password')
    print(tch," ",password)
    if not password:
        return jsonify({"message":"password required"}),400
    use=coll.find_one({"teacher":tch})
    print(use)
    if not use:
        return jsonify({"message":"user not found"}),400
    if use['password']!=password:
        return jsonify({"message":"password not valid"}),400
    return jsonify({"message":"Login sucees full"}),201
       

if __name__=='__main__':
    app.run(debug=True)

