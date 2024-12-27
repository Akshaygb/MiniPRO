import cv2
import numpy as np
import face_recognition
from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_cors import CORS
from gridfs import GridFS
import io
from mtcnn import MTCNN
from bson import ObjectId
from datetime import datetime
from document import parse_docx_table,parse_pdf_table
import base64
app = Flask(__name__)
CORS(app, resources={r"/hi": {"origins": "http://localhost:3000"}})


client = MongoClient("mongodb://localhost:27017/")
db = client["sac"]
teacher_collection = db["teacher_detaile"]
photos_collection = db["photos"]
teacher_collection.create_index("teacher_Id", unique=True)

fs = GridFS(db)



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

# @app.route("/student_login", methods=['POST'])
# def student_login():
#     data = request.json
#     usn = data.get("id")  # Ensure you use 'usn' here, not 'name'
#     sem = data.get("sem")
#     password = data.get("password")
#     print(data)
#     if not all([usn, sem, password]):
#         return jsonify({"message": "All fields (usn, sem, password) are required"}), 400

#     collection = f"sem_{sem}"
#     if collection not in db.list_collection_names():
#         return jsonify({"message": "Invalid semester"}), 400
    

#     student_collection = db[collection]
#     user = student_collection.find_one({"usn": usn})
#     print("User retrieved:", user)

#     if not user:
#         return jsonify({"message": "Invalid USN"}), 401
#     if user["password"] != password:
#         return jsonify({"message": "Invalid password"}), 401

#     return jsonify({"message": "Login Successful","user":{"name":user["name"],"usn":user["usn"]}}), 201

@app.route("/student_login", methods=['POST'])
def student_login():
    data = request.json
    usn = data.get("id")  # Ensure you use 'usn' here, not 'name'
    sem = data.get("sem")
    password = data.get("password")
    print(data)
    
    # Validate input
    if not all([usn, sem, password]):
        return jsonify({"message": "All fields (usn, sem, password) are required"}), 400

    # Check if the semester collection exists
    collection = f"sem_{sem}"
    if collection not in db.list_collection_names():
        return jsonify({"message": "Invalid semester"}), 400
    
    # Retrieve student data
    student_collection = db[collection]
    user = student_collection.find_one({"usn": usn})
    print("User retrieved:", user)

    if not user:
        return jsonify({"message": "Invalid USN"}), 401
    if user["password"] != password:
        return jsonify({"message": "Invalid password"}), 401

    return jsonify({
        "message": "Login Successful",
        "user": {
            "name": user["name"],
            "usn": user["usn"]
        }
    }), 201


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



fs = GridFS(db)

# Global variables for known faces
known_face_encodings = []
known_face_names = []
present_usns = set()



def load_known_faces(studentinfo):
    """Load known faces and USN from MongoDB using GridFS."""
    studentcoll = db[studentinfo]
    students = studentcoll.find()
    for student in students:
        usn = student.get('usn')
        photo_id = student.get('photo_id')
        try:
            photo_id = ObjectId(photo_id)
            print(photo_id)
        except Exception as e:
            print(f"Error converting photo_id to ObjectId: {e}")
            continue
        if not photo_id:
            print(f"Warning: No photo ID found for USN {usn}")
            continue
        try:
            file_data = fs.get(photo_id).read()
        except Exception as e:
            print(f"Error retrieving photo for USN {usn}: {e}")
            continue

        image = face_recognition.load_image_file(io.BytesIO(file_data))
        encodings = face_recognition.face_encodings(image)

        if encodings:
            known_face_encodings.append(encodings[0])
            known_face_names.append(usn)
        else:
            print(f"Warning: No encodings found for USN {usn}")
    print("Loaded known faces:", known_face_names)


def eye_aspect_ratio(eye):
    """Calculate the Eye Aspect Ratio (EAR) for blink detection."""
    if len(eye) < 6:
        return 0.0
    A = np.linalg.norm(eye[1] - eye[5])
    B = np.linalg.norm(eye[2] - eye[4])
    C = np.linalg.norm(eye[0] - eye[3])
    return (A + B) / (2.0 * C)


def is_live(frame, face_landmarks):
    """Perform liveness detection using blink detection."""
    left_eye = np.array([face_landmarks.get('left_eye')])
    right_eye = np.array([face_landmarks.get('right_eye')])
    EAR_THRESHOLD = 0.25
    left_eye_ear = eye_aspect_ratio(left_eye)
    right_eye_ear = eye_aspect_ratio(right_eye)
    return left_eye_ear < EAR_THRESHOLD and right_eye_ear < EAR_THRESHOLD


def recognize_faces(frame, is_motion_detected, coll):
    """Detect, recognize, and label faces in the frame."""
    detector = MTCNN()
    detected_faces = []
    current_date = datetime.now().strftime('%Y-%m-%d')
    current_time = datetime.now().strftime('%H:%M:%S')

    try:
        results = detector.detect_faces(frame)
        for result in results:
            bounding_box = result.get('box', [])
            keypoints = result.get('keypoints', {})
            if not bounding_box or not keypoints:
                continue

            x, y, width, height = bounding_box
            top, bottom, left, right = y, y + height, x, x + width

            if 'left_eye' not in keypoints or 'right_eye' not in keypoints:
                continue

            landmarks = {
                'left_eye': keypoints['left_eye'],
                'right_eye': keypoints['right_eye']
            }

            if is_motion_detected and is_live(frame, landmarks):
                face_encodings = face_recognition.face_encodings(frame, [(top, right, bottom, left)])
                if face_encodings:
                    face_encoding = face_encodings[0]
                    matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.6)
                    name = "Unknown"
                    usn = None

                    if True in matches:
                        first_match_index = matches.index(True)
                        name = known_face_names[first_match_index]
                        usn = known_face_names[first_match_index]
                    else:
                        name = "Liveness Detected, Face Unknown"

                    detected_faces.append(name)
                    
                    # Prevent duplicate attendance for the same date
                    if usn and usn not in present_usns:
                        present_usns.add(usn)
                        student = coll.find_one({"usn": usn})

                        if student:
                            if current_date in student.get("date", []):
                                print(f"Checking dates for USN {usn}: {student.get('date', [])}")
                                print(f"Attendance already recorded for USN {usn} on {current_date}.")
                            else:
                                print(usn)
                                coll.update_one(
                                    {"usn": usn},
                                    {
                                        "$push": {
                                            "attendance": "Present",
                                            "date": current_date,
                                            "time": current_time
                                        }
                                    }
                                )
                        else:
                            print(f"Warning: USN {usn} not found in collection.")
                else:
                    detected_faces.append("Photo Detected")
            else:
                detected_faces.append("Photo Detected")

            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, detected_faces[-1], (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)

        # Mark absent for others
        

    except Exception as e:
        print(f"Error recognizing faces: {e}")
    print("this might be this ffffffhfhhfh")
    return detected_faces





@app.route('/start_attendance', methods=['POST'])
def start_attendance():
    data = request.json
    teacher_id = data.get("Teacher_id")
    sem = data.get("sem")
    recognition_running = data.get("status")
    subcode = data.get("subject code")
    colle = f"{teacher_id}_{subcode}_{sem}"
    coll = db[colle]
    studentcoll = f"sem_{sem}"

    if recognition_running != "q":
        load_known_faces(studentcoll)

        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return jsonify({"message": "Error: Could not open webcam."}), 400

        detected_faces = []
        prev_frame = None
        motion_threshold = 20
        no_motion_count = 0

        while recognition_running == "s":
            ret, frame = cap.read()
            if not ret:
                break

            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            is_motion_detected = False
            if prev_frame is not None:
                diff_frame = cv2.absdiff(prev_frame, gray_frame)
                _, diff_thresh = cv2.threshold(diff_frame, 25, 255, cv2.THRESH_BINARY)
                motion_score = np.sum(diff_thresh) / 255
                is_motion_detected = motion_score > motion_threshold

                if not is_motion_detected:
                    no_motion_count += 1
                else:
                    no_motion_count = 0
            prev_frame = gray_frame

            if no_motion_count > 10:
                is_motion_detected = False

            faces = recognize_faces(frame, is_motion_detected, coll)
            detected_faces.extend(faces)

            cv2.imshow("Face Recognition", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                  break

        cap.release()
        cv2.destroyAllWindows()
        students = coll.find()
        current_date = datetime.now().strftime('%Y-%m-%d')
        current_time = datetime.now().strftime('%H:%M:%S')

        for student in students:
            usn = student["usn"]
            print(current_date," hi this you  ",student.get("date", []) ,"",usn)
            if usn not in present_usns:
                if current_date not in student.get("date", []):
                    print("is this one you ",usn)
                    coll.update_one(
                        {"usn": usn},
                        {
                            "$push": {
                                "attendance": "Absent",
                                "date": current_date,
                                "time": current_time
                            }
                        }
                    )
        if detected_faces:
            return jsonify({"message": "Face(s) detected", "faces": detected_faces})
    return jsonify({"message": "No faces detected."})




@app.route("/Get-Atttedence",methods=['POST'])
def get_attendance():
    data=request.json
    usn=data["usn"]

    sub=data["TeaName"]
    name=teacher_collection.find_one({"name":sub})
    
    sem=data["sem"]
    coll=f"{sub}_{sem}"
    print(coll)
    # Find collections that end with 'CS085_1'
    matching_collections = []
    for col in db.list_collection_names():
       if col.endswith(coll):
           matching_collections.append(col)
    student=db[matching_collections[0]]
    student_atte=student.find_one({"usn":usn})
    attede=student_atte.get("attendance",[])
    date=student_atte.get("date",[])
    total_days=len(attede)
    present=attede.count('Present')
    Absent=attede.count('Absent')
    percentage= (present / total_days) * 100 if total_days > 0 else 0
    print(date)
    print(attede)
    return jsonify({
        "message": "ok",
        "data": {
            "attendance": attede,
            "date": date,
            "total_days": total_days,
            "present_days": present,
            "absent_days": Absent,
            "percentage": f"{percentage:.2f}%"
        }
    })



from flask import Flask, request, jsonify
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")  # Update with your MongoDB URI
db = client["attendance_db"]  # Replace with your database name

@app.route('/get_attendance_by_course_and_date', methods=['POST'])
def get_attendance_by_course_and_date():
    try:
        data = request.json
        teacher_id = data.get("Teacher_id")
        sem = data.get("sem")
        subcode = data.get("subject_code")  # Fixed key name to match your example
        colle = f"{teacher_id}_{subcode}_{sem}"
        date = data.get("date")
        
        # Validate input parameters
        if not subcode or not date or not teacher_id or not sem:
            return jsonify({"message": "Missing parameters: Teacher_id, sem, subject_code, or date"}), 400

        # Convert string date to datetime object
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").strftime("%Y-%m-%d")
        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400

        # Access the specific collection
        coll = db[colle]

        # Query MongoDB for attendance data matching the specific date
        attendance_data = coll.find()

        # Process the attendance data and prepare the response
        result = []
        for entry in attendance_data:
            attendance_dates = entry.get('date', [])
            attendance_status = entry.get('attendance', [])
            
            if date_obj in attendance_dates:
                date_index = attendance_dates.index(date_obj)
                result.append({
                    "_id": str(entry.get("_id")),
                    "usn": entry.get("usn"),
                    "name": entry.get("name"),
                    "date": date_obj,
                    "status": attendance_status[date_index]
                })

        # Return filtered results or handle empty response
        if not result:
            return jsonify({"message": "No attendance data found for the given date."}), 404

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route("/hi", methods=['POST'])
def hi():

        data = request.json  # Parse JSON payload from the request
        print("Received data:", data)  # Log the received data
        return jsonify({"message": "Data received successfully"}), 201  # Return a JSON response with status 201  # Log any errors

if __name__ == '__main__':
    app.run(debug=True, port=5000)
