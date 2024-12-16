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

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["sac"]
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
            if usn not in present_usns:
                if current_date not in student.get("date", []):
                    print("is this one you ")
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


if __name__ == '__main__':
    app.run(debug=True)
