from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, errors
import gridfs
from bson.objectid import ObjectId
from document import parse_docx_table,parse_pdf_table
import random
import base64
app = Flask(__name__)
CORS(app)


client = MongoClient("mongodb://localhost:27017/")
db = client["sac"]
teacher_collection = db["teacher_detaile"]
photos_collection = db["photos"]
teacher_collection.create_index("teacher_Id", unique=True)

fs = gridfs.GridFS(db)



@app.route('/upload-teacher-file', methods=['POST'])
def upload_teacher_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    try:
        teachers = []
        if file.filename.endswith('.docx'):
            teachers = parse_docx_table(file.stream)
        elif file.filename.endswith('.pdf'):
            teachers = parse_pdf_table(file.stream)
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        print(teachers)
        created_collections = []
        if teachers:
            for teacher in teachers:
                teacher["teacher_Id"] = teacher["id"]
                del teacher["id"]
                print(teacher["teacher_Id"])
                subject_codes = teacher.get("subject_code", [])  
                semesters = teacher.get("sem", [])  
                
                for sem in semesters:
                    for subject_code in subject_codes:
                        collection_name = f"{teacher['teacher_Id']}_{subject_code}_{sem}"
                        if collection_name not in created_collections:
                            db.create_collection(collection_name)
                            created_collections.append(collection_name)

            return jsonify({
                "message": f"Uploaded teacher details and created {len(created_collections)} collections successfully!",
                "collections": created_collections
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/teacher_login', methods=['POST'])
def teacher_login():
    data = request.json
    tch = data.get("id")
    password = data.get('password')
    print(data)
    if not password:
        return jsonify({"message": "Password is required"}), 400

    user = teacher_collection.find_one({"teacher_Id": tch})
    if not user:
        return jsonify({"message": "User not found"}), 400
    if user['password'] != password:
        return jsonify({"message": "Incorrect password"}), 400
    user['_id']=str(user['_id'])
    print(user)
    return jsonify({"message": "Login successful","user":user}), 201

@app.route("/admin_login",methods=['POST'])
def admin_login():
    data = request.json
    tch = data.get("id")
    password = data.get('password')
    admin_collection=db['Admin']
    if not password:
        return jsonify({"message": "Password is required"}), 400

    user = admin_collection.find_one({"id": tch})
    if not user:
        return jsonify({"message": "User not found"}), 400
    if user['password'] != password:
        return jsonify({"message": "Incorrect password"}), 400
    print(user["name"])
    return jsonify({"message": "Login successful","user":{"name":user["name"],"id":user["id"]}}), 201# sending he file for rendering purpes


# Route to upload student details
@app.route('/upload-Student_detaile', methods=['POST'])
def upload_student_details():
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


@app.route('/upload-student', methods=['POST'])
def upload_student():
    data = request.form
    sem = data.get("semester")
    name = data.get("name")
    usn = data.get("usn")
    password = data.get("password")
    photo = request.files.get("photo")
    # print(usn," ",sem," ",name," ",password," ",photo)
    print("Form data:", request.form)
    print("File data:", request.files)


    if not all([sem, name, usn, password, photo]):
        return jsonify({"message": "All fields (sem, name, usn, password, photo) are required"}), 400

    collection_name = f"sem_{sem}"
    student_collection = db[collection_name]

    # Check if student already exists
    if student_collection.find_one({"usn": usn}):
        return jsonify({"message": "Student with this USN already exists"}), 400

    try:
        # Store the photo in GridFS
        photo_id = fs.put(photo, filename=photo.filename)

        # Insert student details into the collection
        student_data = {
            "name": name,
            "usn": usn,
            "sem": sem,
            "password": password,
            "photo_id": str(photo_id)
        }
        student_collection.insert_one(student_data)
        teacher_collections = db.list_collection_names()  # List all collections in the database
        sem_teacher_collections = [
            col for col in teacher_collections if col.endswith(f"_{sem}")
        ]
        col_data={
            "usn":student_data["usn"],
            "name":student_data["name"],
            "attendance":[],
            "date":[],
            "time":[]
        }
        usn=student_data["usn"]
        for teacher_col in sem_teacher_collections:
           teacher_collection = db[teacher_col]
           if not teacher_collection.find_one({"usn": usn}):  # Prevent duplicates
                teacher_collection.insert_one(col_data)


        return jsonify({"message": "Student data uploaded successfully"}), 201

    except Exception as e:
        return jsonify({"message": f"Error saving student data: {str(e)}"}), 500

@app.route("/student_login", methods=['POST'])
def student_login():
    data = request.json
    usn = data.get("id")  # Ensure you use 'usn' here, not 'name'
    sem = data.get("sem")
    password = data.get("password")
    print(data)
    if not all([usn, sem, password]):
        return jsonify({"message": "All fields (usn, sem, password) are required"}), 400

    collection = f"sem_{sem}"
    if collection not in db.list_collection_names():
        return jsonify({"message": "Invalid semester"}), 400

    student_collection = db[collection]
    user = student_collection.find_one({"usn": usn})
    print("User retrieved:", user)

    if not user:
        return jsonify({"message": "Invalid USN"}), 401
    if user["password"] != password:
        return jsonify({"message": "Invalid password"}), 401

    return jsonify({"message": "Login Successful","user":{"name":user["name"],"usn":user["usn"]}}), 201



@app.route('/student_detaile',methods=['POST'])
def student_detaile():
    data = request.json
    sem = data.get("sem")
    collection = f"sem_{sem}"
    
    if collection not in db.list_collection_names():
        return jsonify({"message": "Sem student not Found"})
    
    student_collection = db[collection]
    
    # Fetching all student data
    students = list(student_collection.find())  # Fetch all documents in the collection
    
    student_list = []
    for student in students:
        student_data = {
            "name": student.get("name"),
            "usn": student.get("usn"),
            "sem": student.get("sem"),
            "password": student.get("password"),
            "photo_id": student.get("photo_id"),
        }
        
        photo_id = student.get("photo_id")
        if photo_id:
           
            photo_file = fs.get(ObjectId(photo_id))
            
            # Get the binary data from the file (it can be large, hence chunking)
            photo_data = photo_file.read()

            # Convert the binary data to Base64
            photo_base64 = base64.b64encode(photo_data).decode('utf-8')
            
            # Add the base64 string to the student data
            student_data["photo"] = "data:image/jpeg;base64," + photo_base64  # Assuming JPEG format

        student_list.append(student_data)
        print(student_list)
    
    return jsonify({"message": "Successful", "user": student_list}),201


if __name__ == '__main__':
    app.run(debug=True)

