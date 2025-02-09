import pytesseract
from PIL import Image
import re

def extract_text_tesseract(file):
    pytesseract.pytesseract.tesseract_cmd = r'D:\Downloads\Tesseract\tesseract.exe'
    image = Image.open(file)
    text = pytesseract.image_to_string(image)
    return text

def validate_and_extract_info(text):
    # Define regex patterns for key information
    patterns = {
        "FIR_No": re.compile(r"FIR No\.?\s*:\s*(\S+)"),
        "Date_and_Time_of_FIR": re.compile(r"Date and Time of FIR\s*:\s*([\d/]+ \d{2}:\d{2})"),
        "District": re.compile(r"District\s*:\s*([\w\s]+)"),
        "PS": re.compile(r"P\.S\.\s*:\s*([\w\s]+)"),
        "Year": re.compile(r"Year\s*:\s*(\d{4})"),
        "Acts_Sections": re.compile(r"Acts\s*:\s*([\w\s]+)\s*Sections\s*:\s*([\w\s,]+)"),
        "Occurrence_Date_From": re.compile(r"Date From\s*:\s*([\d/]+)"),
        "Occurrence_Date_To": re.compile(r"Date To\s*:\s*([\d/]+)"),
        "Occurrence_Time_From": re.compile(r"Time From\s*:\s*(\d{2}:\d{2})"),
        "Occurrence_Time_To": re.compile(r"Time To\s*:\s*(\d{2}:\d{2})"),
        "Complainant_Name": re.compile(r"Name\s*:\s*([\w\s]+)"),
        "Complainant_Father_Name": re.compile(r"Father's Name\s*:\s*([\w\s]+)"),
        "Complainant_DOB": re.compile(r"Date/Year of Birth\s*:\s*(\d{4})"),
        "Complainant_Nationality": re.compile(r"Nationality\s*:\s*([\w\s]+)")
    }

    extracted_info = {}
    for key, pattern in patterns.items():
        match = pattern.search(text)
        if match:
            extracted_info[key] = match.group(1)

    return extracted_info

def process_ocr(file):
    extracted_text = extract_text_tesseract(file)
    extracted_info = validate_and_extract_info(extracted_text)
    return {
        "extracted_text": extracted_text,
        "extracted_info": extracted_info
    }

