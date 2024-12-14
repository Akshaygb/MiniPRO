# import cv2
# import numpy as np
# import face_recognition
# from flask import Flask, jsonify
# from pymongo import MongoClient
# import gridfs
# from bson.objectid import ObjectId
# import io
# from mtcnn import MTCNN

# app = Flask(__name__)

# # MongoDB setup
# client = MongoClient("mongodb://localhost:27017/")
# db = client["project"]
# fs = gridfs.GridFS(db)

# # Load known faces directly from GridFS
# known_face_encodings = []
# known_face_names = []

# # Fetch all photos from GridFS
# def load_known_faces():
#     files = fs.find()
#     for file in files:
#         file_data = fs.get(file._id).read()
#         image = face_recognition.load_image_file(io.BytesIO(file_data))
#         encodings = face_recognition.face_encodings(image)
        
#         if encodings:
#             known_face_encodings.append(encodings[0])
#             known_face_names.append(file.filename.split('.')[0])  # Assuming filename is the name

# # Eye Aspect Ratio (EAR) calculation for blink detection
# def eye_aspect_ratio(eye):
#     A = np.linalg.norm(eye[1] - eye[5])
#     B = np.linalg.norm(eye[2] - eye[4])
#     C = np.linalg.norm(eye[0] - eye[3])
#     ear = (A + B) / (2.0 * C)
#     return ear

# # Liveness detection using blink detection
# def is_live(frame, face_landmarks):
#     left_eye = face_landmarks['left_eye']
#     right_eye = face_landmarks['right_eye']
    
#     left_eye_ear = eye_aspect_ratio(left_eye)
#     right_eye_ear = eye_aspect_ratio(right_eye)
    
#     EAR_THRESHOLD = 0.25  # This is just an example value, tune it for your scenario.
#     blink_detected = left_eye_ear < EAR_THRESHOLD and right_eye_ear < EAR_THRESHOLD
    
#     return blink_detected

# # Face recognition and matching function with MTCNN and liveness check
# def recognize_faces(frame):
#     detector = MTCNN()
    
#     # Detect faces and landmarks using MTCNN
#     results = detector.detect_faces(frame)
    
#     for result in results:
#         bounding_box = result['box']
#         keypoints = result['keypoints']
        
#         # Extract the face location and landmarks
#         top, right, bottom, left = bounding_box
#         landmarks = {
#             'left_eye': np.array([keypoints['left_eye'], keypoints['right_eye']]),
#             'right_eye': np.array([keypoints['right_eye'], keypoints['right_eye']]),
#         }
        
#         # Perform liveness detection (blink detection)
#         if is_live(frame, landmarks):
#             face_encoding = face_recognition.face_encodings(frame, [(top, right, bottom, left)])
            
#             if face_encoding:
#                 face_encoding = face_encoding[0]
#                 matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
#                 name = "Unknown"
                
#                 if True in matches:
#                     first_match_index = matches.index(True)
#                     name = known_face_names[first_match_index]
#                 else:
#                     name = "Liveness Detected, but Face not Known"
        
#         # Draw bounding box and label the face
#         cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
#         cv2.putText(frame, name, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)

#     return frame

# @app.route('/start-recognition', methods=['GET'])
# def start_recognition():
#     # Load known faces from MongoDB on start
#     load_known_faces()

#     # Start webcam
#     cap = cv2.VideoCapture(0)

#     if not cap.isOpened():
#         return jsonify({"message": "Error: Could not open webcam."}), 400

#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             return jsonify({"message": "Failed to grab frame. Exiting..."}), 400

#         # Call the face recognition function
#         frame = recognize_faces(frame)

#         # Show video feed with bounding boxes
#         cv2.imshow('Face Recognition', frame)

#         # If the user presses 'q', break the loop
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break

#     cap.release()
#     cv2.destroyAllWindows()

#     return jsonify({"message": "Face recognition completed."})

# if __name__ == '__main__':
#     app.run(debug=True)
import cv2
import numpy as np
import face_recognition
from flask import Flask, jsonify
from pymongo import MongoClient
import gridfs
import io
from mtcnn import MTCNN

app = Flask(__name__)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["project"]
fs = gridfs.GridFS(db)

# Load known faces directly from GridFS
known_face_encodings = []
known_face_names = []


def load_known_faces():
    """Load known faces from MongoDB using GridFS."""
    try:
        files = fs.find()
        for file in files:
            file_data = fs.get(file._id).read()
            image = face_recognition.load_image_file(io.BytesIO(file_data))
            encodings = face_recognition.face_encodings(image)

            if encodings:
                known_face_encodings.append(encodings[0])
                known_face_names.append(file.filename.split('.')[0])  # Filename is assumed to be the name
            else:
                print(f"Warning: No encodings found for {file.filename}")
    except Exception as e:
        print(f"Error loading known faces: {e}")


def eye_aspect_ratio(eye):
    """Calculate the Eye Aspect Ratio (EAR) for blink detection."""
    if len(eye) < 6:
        return 0.0  # Return 0 for invalid input
    A = np.linalg.norm(eye[1] - eye[5])
    B = np.linalg.norm(eye[2] - eye[4])
    C = np.linalg.norm(eye[0] - eye[3])
    ear = (A + B) / (2.0 * C)
    return ear


def is_live(frame, face_landmarks):
    """Perform liveness detection using blink detection."""
    left_eye = np.array([face_landmarks.get('left_eye')])
    right_eye = np.array([face_landmarks.get('right_eye')])

    # EAR threshold for detecting a blink
    EAR_THRESHOLD = 0.25
    left_eye_ear = eye_aspect_ratio(left_eye)
    right_eye_ear = eye_aspect_ratio(right_eye)
    return left_eye_ear < EAR_THRESHOLD and right_eye_ear < EAR_THRESHOLD


def recognize_faces(frame, is_motion_detected):
    """Detect, recognize, and label faces in the frame."""
    detector = MTCNN()
    detected_faces = []
    try:
        # Detect faces and landmarks using MTCNN
        results = detector.detect_faces(frame)
        for result in results:
            bounding_box = result.get('box', [])
            keypoints = result.get('keypoints', {})
            if not bounding_box or not keypoints:
                continue  # Skip if no valid data

            x, y, width, height = bounding_box
            top, bottom, left, right = y, y + height, x, x + width

            # Validate landmarks
            if 'left_eye' not in keypoints or 'right_eye' not in keypoints:
                print("Missing keypoints for face landmarks")
                continue

            landmarks = {
                'left_eye': keypoints['left_eye'],
                'right_eye': keypoints['right_eye']
            }

            # Perform liveness detection
            if is_motion_detected and is_live(frame, landmarks):
                face_encodings = face_recognition.face_encodings(frame, [(top, right, bottom, left)])
                if face_encodings:
                    face_encoding = face_encodings[0]
                    matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.6)
                    name = "Unknown"

                    if True in matches:
                        first_match_index = matches.index(True)
                        name = known_face_names[first_match_index]
                    else:
                        name = "Liveness Detected, Face Unknown"

                    detected_faces.append(name)
                    print(detected_faces)
                else:
                    print("No face encodings found for detected face")
            else:
                detected_faces.append("Photo Detected")

            # Draw bounding box and label the face
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, detected_faces[-1], (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)

    except Exception as e:
        print(f"Error recognizing faces: {e}")
    
    return detected_faces


@app.route('/start-recognition', methods=['GET'])
def start_recognition():
    """Start real-time face recognition using the webcam."""
    load_known_faces()  # Ensure faces are loaded

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        return jsonify({"message": "Error: Could not open webcam."}), 400

    detected_faces = []
    prev_frame = None
    motion_threshold = 50
    no_motion_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to capture frame.")
            break

        # Convert frame to grayscale for motion detection
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Detect motion by comparing consecutive frames
        is_motion_detected = False
        if prev_frame is not None:
            diff_frame = cv2.absdiff(prev_frame, gray_frame)
            _, diff_thresh = cv2.threshold(diff_frame, 25, 255, cv2.THRESH_BINARY)
            motion_score = np.sum(diff_thresh) / 255  # Count non-zero pixels
            is_motion_detected = motion_score > motion_threshold

            if not is_motion_detected:
                no_motion_count += 1
            else:
                no_motion_count = 0  # Reset if motion is detected
        prev_frame = gray_frame

        # If no motion is detected for several frames, classify as a photo
        if no_motion_count > 10:
            is_motion_detected = False

        # Detect and recognize faces in the frame
        faces = recognize_faces(frame, is_motion_detected)
        detected_faces.extend(faces)

        # Show the current frame
        cv2.imshow("Face Recognition", frame)

        # Exit when the user presses 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print(detected_faces)
    if detected_faces:
        return jsonify({"message": "Face(s) detected", "faces": detected_faces})
    return jsonify({"message": "No faces detected."})


if __name__ == '__main__':
    app.run(debug=True)
