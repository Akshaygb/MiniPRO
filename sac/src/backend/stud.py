@app.route('/upload-student', methods=['POST'])
def upload_student():
    data = request.form
    sem = data.get("semester")
    name = data.get("name")
    usn = data.get("usn")
    password = data.get("password")
    photo = request.files.get("photo")
    
    # Print form and file data (for debugging)
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

        # Initialize the student data structure
        student_data = {
            "name": name,
            "usn": usn,
            "sem": [sem],  # Store semester as an array
            "password": password,
            "photo_id": str(photo_id),
        }

        # Now, we will retrieve teacher data for the current semester
        teacher_collection = db["teacher_details"]  # Assuming this is the collection containing teacher data

        # Query the teacher collection to find teachers teaching the current semester
        teachers = teacher_collection.find({"sem": {"$in": [int(sem)]}})  # Find teachers for the given semester

        # For each teacher in the current semester, we add their respective subject code and teacher id to the student document
        for teacher in teachers:
            teacher_id = teacher.get("teacher_Id")  # Teacher ID field
            subject_codes = teacher.get("subject_code")  # Subject Code array

            # We will now filter only those subject codes that correspond to the current semester
            teacher_subject_codes = [
                code for code, semester in zip(subject_codes, teacher.get("sem")) if semester == int(sem)
            ]
            
            # Loop through each subject code that belongs to the current semester and create dynamic fields
            for subject_code in teacher_subject_codes:
                field_name = f"{teacher_id}_{subject_code}"  # Field name as teacher_id_subject_code
                student_data[field_name] = []  # Initialize with an empty array (e.g., attendance records)

        # Insert student details into the collection
        student_collection.insert_one(student_data)

        return jsonify({"message": "Student data uploaded successfully"}), 201

    except Exception as e:
        return jsonify({"message": f"Error saving student data: {str(e)}"}), 500
