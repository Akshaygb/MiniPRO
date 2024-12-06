import cv2
import numpy as np
from mtcnn import MTCNN
import face_recognition
import dlib
import os

# Load known faces and names
known_face_encodings = []
known_face_names = []

for file_name in os.listdir('known_faces'):  # Folder with known face images
    if file_name.endswith(('png', 'jpg', 'jpeg')):
        name = os.path.splitext(file_name)[0]
        image = face_recognition.load_image_file(f'known_faces/{file_name}')
        encodings = face_recognition.face_encodings(image)
        if encodings:
            known_face_encodings.append(encodings[0])
            known_face_names.append(name)

# Initialize MTCNN detector for face detection
detector = MTCNN()

# Initialize dlib's face detector and landmark predictor for liveness detection
predictor_path = r'C:/path/to/shape_predictor_68_face_landmarks.dat'
detector_dlib = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(predictor_path)

def calculate_eye_aspect_ratio(eye_points):
    # Compute the Eye Aspect Ratio (EAR) to detect blinks
    A = np.linalg.norm(eye_points[1] - eye_points[5])
    B = np.linalg.norm(eye_points[2] - eye_points[4])
    C = np.linalg.norm(eye_points[0] - eye_points[3])
    ear = (A + B) / (2.0 * C)
    return ear

# Start webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame. Exiting...")
        break

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    detections = detector.detect_faces(rgb_frame)

    for detection in detections:
        bounding_box = detection['box']  # [x, y, width, height]
        keypoints = detection['keypoints']
        x, y, w, h = bounding_box

        # Crop face for recognition
        face_image = rgb_frame[y:y + h, x:x + w]
        face_encoding = face_recognition.face_encodings(face_image)

        name = "Unknown"
        if face_encoding:
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding[0])
            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding[0])
            best_match_index = np.argmin(face_distances) if matches else None

            if best_match_index is not None and matches[best_match_index]:
                name = known_face_names[best_match_index]

        # Liveness detection using dlib's facial landmarks
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces_dlib = detector_dlib(gray_frame)

        for face in faces_dlib:
            landmarks = predictor(gray_frame, face)
            landmarks_points = np.array([[p.x, p.y] for p in landmarks.parts()])
            left_eye = landmarks_points[36:42]
            right_eye = landmarks_points[42:48]

            # Calculate Eye Aspect Ratio for blink detection
            ear_left = calculate_eye_aspect_ratio(left_eye)
            ear_right = calculate_eye_aspect_ratio(right_eye)
            ear = (ear_left + ear_right) / 2.0

            # Check if the person is blinking
            if ear < 0.25:  # Threshold for blink detection
                cv2.putText(frame, "Blink Detected: Real Face", (10, 30), cv2.FONT_HERSHEY_DUPLEX, 1.0, (0, 255, 0), 2)
            else:
                name = "Fake Face - Don't use photo"
                cv2.putText(frame, "Liveness Failed", (10, 30), cv2.FONT_HERSHEY_DUPLEX, 1.0, (0, 0, 255), 2)

        # Draw bounding box around face
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        # Display recognized name
        cv2.putText(frame, name, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)

    # Show video feed
    cv2.imshow('Face Recognition', frame)

    # Exit on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
