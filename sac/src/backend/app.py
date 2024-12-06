from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, errors
import gridfs
from bson.objectid import ObjectId
import random

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017/")
db = client["project"]
coll = db["authentication"]
coll.create_index("teacher", unique=True)


fs = gridfs.GridFS(db)

@app.route('/signin', methods=['POST'])
def signin():
    data = request.json
    tch = data.get("teacher")
    pas = data.get("password")
    confirm_password = data.get('conf')

    if pas != confirm_password:
        return jsonify({"message": "Password does not match"}), 400
    if not pas:
        return jsonify({"message": "Password is required"}), 400

    user = coll.find_one({"teacher": tch})
    if user:
        return jsonify({"message": "User already exists"}), 400

    try:
        coll.insert_one({"teacher": tch, "password": pas})
    except errors.DuplicateKeyError:
        return jsonify({"message": "Teacher name already exists"}), 400

    return jsonify({"message": "Signup successful"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    tch = data.get("teacher")
    password = data.get('password')

    if not password:
        return jsonify({"message": "Password is required"}), 400

    user = coll.find_one({"teacher": tch})
    if not user:
        return jsonify({"message": "User not found"}), 400
    if user['password'] != password:
        return jsonify({"message": "Incorrect password"}), 400

    return jsonify({"message": "Login successful"}), 201

@app.route('/upload-photo', methods=['POST'])
def upload_photo():
    """Route to handle the photo upload and store it in GridFS"""
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    try:
        file_id = fs.put(file, filename=file.filename)
        return jsonify({"message": "File uploaded successfully", "file_id": str(file_id)}), 201
    except Exception as e:
        return jsonify({"message": f"Error uploading file: {str(e)}"}), 500

@app.route('/get-photo/<file_id>', methods=['GET'])
def get_photo(file_id):
    """Route to retrieve a photo from GridFS using file_id"""
    try:
        file = fs.get(ObjectId(file_id))
        return file.read(), 200
    except Exception as e:
        return jsonify({"message": f"Error retrieving file: {str(e)}"}), 404

@app.route('/registration', methods=['POST'])
def registration():
    data = request.json
    return jsonify({"message": "Registration successful"}), 201

@app.route('/updatedata', methods=['GET'])
def updatedata():
    students_attendance = []
    for i in range(1, 11): 
        student_name = f"Student {i:03}" 
        attendance = [random.choice(["Yes", "No"]) for _ in range(10)] 
        present_count = attendance.count("Yes")
        attendance_percentage = (present_count / 10) * 100  
        students_attendance.append({
            "name": student_name,
            "attendance": attendance,
            "percentage": round(attendance_percentage, 2)  
        })

    return jsonify(students_attendance)
@app.route('/get-all-photos', methods=['GET'])
def get_all_photos():
    """Retrieve all photo file IDs and filenames from GridFS"""
    try:
        files = fs.find()
        file_list = [{"file_id": str(file._id), "filename": file.filename} for file in files]
        return jsonify(file_list), 200
    except Exception as e:
        return jsonify({"message": f"Error retrieving file list: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
