import React, { useEffect, useState } from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import './Eligibel.css';

export default function Eligible() {
  const [eligibleData, setEligibleData] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('eligibleData'));
    setEligibleData(data);
  }, []);

  const generateDocx = (students, title) => {
    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      </Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      </Relationships>`;

    const docContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document 
        xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
        <w:body>
          <w:p>
            <w:pPr>
              <w:jc w:val="center"/>
              <w:spacing w:before="0" w:after="400"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:b/>
                <w:sz w:val="28"/>
              </w:rPr>
              <w:t>${title}</w:t>
            </w:r>
          </w:p>
          <w:tbl>
            <w:tblPr>
              <w:tblStyle w:val="TableGrid"/>
              <w:tblW w:w="5000" w:type="pct"/>
              <w:tblBorders>
                <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
                <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
                <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
                <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
                <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
              </w:tblBorders>
            </w:tblPr>
            <w:tr>
              <w:trPr>
                <w:tblHeader/>
              </w:trPr>
              <w:tc>
                <w:tcPr><w:shd w:fill="EEEEEE"/></w:tcPr>
                <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>USN</w:t></w:r></w:p>
              </w:tc>
              <w:tc>
                <w:tcPr><w:shd w:fill="EEEEEE"/></w:tcPr>
                <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Name</w:t></w:r></w:p>
              </w:tc>
              <w:tc>
                <w:tcPr><w:shd w:fill="EEEEEE"/></w:tcPr>
                <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Attended</w:t></w:r></w:p>
              </w:tc>
              <w:tc>
                <w:tcPr><w:shd w:fill="EEEEEE"/></w:tcPr>
                <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Total</w:t></w:r></w:p>
              </w:tc>
              <w:tc>
                <w:tcPr><w:shd w:fill="EEEEEE"/></w:tcPr>
                <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Percentage</w:t></w:r></w:p>
              </w:tc>
            </w:tr>
            ${students.map(student => `
              <w:tr>
                <w:tc>
                  <w:p><w:r><w:t>${student.usn}</w:t></w:r></w:p>
                </w:tc>
                <w:tc>
                  <w:p><w:r><w:t>${student.name}</w:t></w:r></w:p>
                </w:tc>
                <w:tc>
                  <w:p><w:r><w:t>${student.attended}</w:t></w:r></w:p>
                </w:tc>
                <w:tc>
                  <w:p><w:r><w:t>${student.total}</w:t></w:r></w:p>
                </w:tc>
                <w:tc>
                  <w:p><w:r><w:t>${student.percentage}%</w:t></w:r></w:p>
                </w:tc>
              </w:tr>
            `).join('')}
          </w:tbl>
        </w:body>
      </w:document>`;

    const zip = new PizZip();
    zip.file('[Content_Types].xml', contentTypes);
    zip.file('_rels/.rels', rels);
    zip.file('word/document.xml', docContent);

    const docBlob = zip.generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(docBlob);
    link.download = `${title}.docx`;
    link.click();
  };

  // Rest of the component remains the same
  return (
    <div className="container">
      <h1>Eligibility Table</h1>
      {!eligibleData ? (
        <p>No data available.</p>
      ) : (
        <div>
          <section>
            <h2>Eligible Students</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>USN</th>
                  <th>Name</th>
                  <th>Attended</th>
                  <th>Total</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {eligibleData.eligible_students.map((student, index) => (
                  <tr key={index}>
                    <td>{student.usn}</td>
                    <td>{student.name}</td>
                    <td>{student.attended}</td>
                    <td>{student.total}</td>
                    <td>{student.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => generateDocx(eligibleData.eligible_students, "Eligible Students")}
              className="download-btn"
            >
              Download Eligible Students DOCX
            </button>
          </section>

          <section>
            <h2>Non-Eligible Students</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>USN</th>
                  <th>Name</th>
                  <th>Attended</th>
                  <th>Total</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {eligibleData.non_eligible_students.map((student, index) => (
                  <tr key={index}>
                    <td>{student.usn}</td>
                    <td>{student.name}</td>
                    <td>{student.attended}</td>
                    <td>{student.total}</td>
                    <td>{student.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => generateDocx(eligibleData.non_eligible_students, "Non-Eligible Students")}
              className="download-btn"
            >
              Download Non-Eligible Students DOCX
            </button>
          </section>
        </div>
      )}
    </div>
  );
}