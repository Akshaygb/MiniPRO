from flask import Flask,jsonify,request
from flask_cors import CORS
app=Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "running"
@app.route('/login',methods=['POST'])
def login():
    data=request.json
    print(data)
    if data:
        return jsonify({"message": f"Name: {data.get('text')}, Password: {data.get('ptext')}"})
    else:
        return jsonify({"error": "No data received"}), 400

if '__main__'==__name__:
    app.run(debug=True)
    