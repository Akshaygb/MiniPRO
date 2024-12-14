from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, errors
import gridfs
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["sac"]
fs = gridfs.GridFS(db)  # For storing photos



@app.route('/get-photo/<photo_id>', methods=['GET'])
def get_photo(photo_id):
    """Retrieve a student's photo by photo ID."""
    try:
        file = fs.get(ObjectId(photo_id))
        return file.read(), 200, {'Content-Type': file.content_type}
    except Exception as e:
        return jsonify({"message": f"Error retrieving photo: {str(e)}"}), 404

if __name__ == '__main__':
    app.run(debug=True)
