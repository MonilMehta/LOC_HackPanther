from flask import Flask, request, jsonify
from services.scraper import scrape_most_wanted_sel
from services.ocr import extract_text_tesseract,process_ocr
import pytesseract
from PIL import Image
app = Flask(__name__)

@app.route('/scrape-most-wanted', methods=['GET'])
def get_most_wanted():
    criminals = scrape_most_wanted_sel()
    return jsonify(criminals)

@app.route('/run-ocr', methods=['POST'])
def run_ocr():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    file = request.files['image']
    extracted_text = process_ocr(file)  # Or use extract_text_paddleocr(file)
    return jsonify({"extracted_text": extracted_text})


if __name__ == '__main__':
    app.run(debug=True)
