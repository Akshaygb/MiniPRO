from docx import Document
import pdfplumber
import random
def parse_docx_table(file_stream):
    doc = Document(file_stream)
    teachers = []

    for table in doc.tables:
        for row in table.rows:
            teacher_data = {}
            cells = row.cells
            if len(cells) > 1:
                teacher_data["id"] = cells[0].text.strip()
                teacher_data["name"] = cells[1].text.strip()
                teacher_data["subject_code"] = [code.strip() for code in cells[2].text.split(",")]
                teacher_data["sem"] = [int(sem.strip()) for sem in cells[3].text.split(",")]
                teacher_data["password"] = cells[4].text.strip()
                teachers.append(teacher_data)

    return teachers

def parse_pdf_table(file_stream):
    teachers = []

    with pdfplumber.open(file_stream) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if table:
                for i, row in enumerate(table):
                    # Skip the first row (column headers)
                    if i == 0:
                        continue
                    
                    # Skip empty rows or rows that contain just empty values (i.e., invalid rows)
                    if all(cell.strip() == "" for cell in row):
                        continue
                    
                    # Proceed with extracting teacher data from valid rows
                    if len(row) > 1:
                        teacher_data = {
                            "id": row[0].strip(),
                            "name": row[1].strip(),
                            "subject_code": [code.strip() for code in row[2].split(",")],
                            "sem": [int(sem.strip()) for sem in row[3].split(",") if sem.strip().isdigit()],
                            "password": row[4].strip(),
                        }
                        teachers.append(teacher_data)
    return teachers
