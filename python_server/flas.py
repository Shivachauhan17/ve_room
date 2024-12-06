from flask import Flask, request, jsonify
from flask_cors import CORS,cross_origin
import base64
from PIL import Image
from io import BytesIO
import numpy as np
import face_recognition
import cv2
import os
import pymongo
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart



app = Flask(__name__)
CORS(app,support_credentials=True)
client = pymongo.MongoClient("mongodb+srv://Shivag:shivashiva@cluster0.mz5u2w1.mongodb.net/VE_ROOM?retryWrites=true&w=majority&appName=Cluster0")
db = client["VE_ROOM"]
collection = db["users"]



def load_known_face():
    known_face_encoding = None

    # Retrieve known face data from MongoDB
    document = collection.find_one()
    if document:
        known_face_encoding = np.frombuffer(document['encoding'], dtype=np.float64)

    return known_face_encoding
def generate_face_encodings_from_base64(image_base64):
    try:
        # Decode the base64 image data
        try:
            image_bytes = base64.b64decode(image_base64)
        except Exception as decode_error:
            return {'error': f'Invalid base64 string: {str(decode_error)}'}

        # Convert the image bytes to a numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)

        # Decode the image using OpenCV
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            return {'error': 'Failed to decode image from base64 data'}

        # Preprocess the image (optional)
        # Example: Convert to grayscale
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # Find face locations in the image
        face_locations = face_recognition.face_locations(gray_image)

        if len(face_locations) == 0:
            return {'error': 'No faces found in the provided image'}

        # Extract face encodings
        face_encodings = face_recognition.face_encodings(image, face_locations)
        return face_encodings

    except Exception as e:
        return {'error': str(e)}


def save_base64_to_jpeg(base64_string):
    try:
        # Decode the base64 string
        image_bytes = base64.b64decode(base64_string)
        
        # Write the decoded bytes to a JPEG file
        with open("default.jpeg", 'wb') as image_file:
            image_file.write(image_bytes)
        

    except Exception as e:
         print('error:', str(e))




def compare_faces(image_data, known_face_encoding):
    # Convert the image data to numpy array
    nparr = np.frombuffer(image_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Convert BGR to RGB
    rgb_frame = frame[:, :]

    # Find all the faces and face encodings in the image
    face_encodings = face_recognition.face_encodings(rgb_frame)

    match = False
    if len(face_encodings) > 0:
        # Compare face encodings
        match = face_recognition.compare_faces(known_face_encoding, face_encodings)

    return match

def read_images_from_path(directory_path):
    base64_images = []

    try:
        # Ensure the directory exists
        if not os.path.exists(directory_path):
            raise FileNotFoundError(f"Directory '{directory_path}' does not exist.")

        # Iterate through all files in the directory
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)

            # Check if it's a file and an image (by extension)
            if os.path.isfile(file_path) and filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif')):
                with open(file_path, "rb") as image_file:
                    # Read and convert the image to base64
                    base64_image = base64.b64encode(image_file.read()).decode('utf-8')
                    base64_images.append({
                        "filename": filename,
                        "base64": base64_image
                    })

    except Exception as e:
        return str(e), 500
    return base64_images

def compare_images_base64(image_base64_1, image_base64_2, tolerance=0.4):
    def get_face_encoding_from_base64(base64_string):
        try:
            # Decode base64 string
            image_bytes = base64.b64decode(base64_string)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return {'error': 'Failed to decode image'}

            # Convert BGR to RGB for face_recognition
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Detect face encodings
            face_encodings = face_recognition.face_encodings(rgb_image)
            if len(face_encodings) == 0:
                return {'error': 'No faces found in the image'}

            return face_encodings[0]
        except Exception as e:
            return {'error': str(e)}

    # Get encodings for both images
    encoding1 = get_face_encoding_from_base64(image_base64_1)
    encoding2 = get_face_encoding_from_base64(image_base64_2)

    # Handle errors
    if 'error' in encoding1:
        return {'error': f"Image 1: {encoding1['error']}"}
    if 'error' in encoding2:
        return {'error': f"Image 2: {encoding2['error']}"}

    # Compare face encodings with a stricter tolerance
    try:
        match = face_recognition.compare_faces([encoding1], encoding2, tolerance=tolerance)[0]
        return {'match': match}
    except Exception as e:
        return {'error': f"Comparison error: {str(e)}"}



def send_email(sender_email, sender_password, receiver_email, subject, message, smtp_server="smtp.gmail.com", smtp_port=587):
    try:
        # Set up the MIME message
        email_message = MIMEMultipart()
        email_message["From"] = sender_email
        email_message["To"] = receiver_email
        email_message["Subject"] = subject
        email_message.attach(MIMEText(message, "plain"))
        
        # Connect to the SMTP server
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  
            server.login(sender_email, sender_password)  
            server.sendmail(sender_email, receiver_email, email_message.as_string())  
        

    except Exception as e:
        print(f"Failed to send email: {str(e)}")



@app.route('/compare_faces', methods=['POST'])
@cross_origin(supports_credentials=True)
def compare_faces_endpoint():
    # Retrieve image data from MongoDB
    data=request.get_json()
    input_image=data["image"]
    if input_image==None or len(input_image)==0:
        return jsonify({"error": "Image data is missing or empty"}),411
    save_base64_to_jpeg(input_image)
    
    image_data = []
    for i in read_images_from_path(f"/home/shiva/Desktop/ve_room/server/images/{data['email']}"):
        image_data.append(i["base64"])
    
    matched=0
    unmatched=0

    for i in image_data:
        isMatch=compare_images_base64(input_image,i)
        print("isMatch:",isMatch)
        if isMatch['match']==True:
            matched=matched+1
        else: unmatched=unmatched+1
    result=True if matched>unmatched else False
    
    # send_email(
    #     sender_email="393.nikhil@gmail.com",
    #     sender_password="Nikhil@393",
    #     receiver_email="shivanbd2019@gmail.com",
    #     subject="Candidate Identity Verification",
    #     message=f"Candidate {data['email']} identity is mathched ✅ as provided on the time of registration." if result else f"Candidate {data['enail']} identity is not mathched ❌ as provided on the time of registration."
    # )
    return jsonify({'match':result}), 200


if __name__ == '__main__':
    app.run(debug=True,port=8080)