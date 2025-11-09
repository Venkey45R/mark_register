import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/NavBar";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ke from "../KE.png";

function DownloadAllReport() {
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch assigned classes based on role
  useEffect(() => {
    const fetchAssignedClasses = async () => {
      try {
        const userRes = await axios.get(
          "http://localhost:3001/api/current-user",
          {
            withCredentials: true,
          }
        );

        if (userRes.data.role === "incharge") {
          const classRes = await axios.get(
            `http://localhost:3001/api/incharge-classes/${userRes.data._id}`,
            { withCredentials: true }
          );
          setAssignedClasses(classRes.data);
        } else if (userRes.data.role === "principal") {
          const classRes = await axios.get(
            `http://localhost:3001/classes/institute/${userRes.data.institution._id}`,
            { withCredentials: true }
          );
          setAssignedClasses(classRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch assigned classes:", err);
      }
    };
    fetchAssignedClasses();
  }, []);

  // Generate a full styled report card for one student (same look as ReportCard.jsx)
  const generateReportCardDOM = (student) => {
    return `
      <div style="width: 800px; padding: 20px; font-family: Arial, sans-serif; background: white; border:1px solid #ccc; border-radius:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <img src="${
            student.institute?.logo || ke
          }" alt="Logo" style="height:40px;" />
          <h2 style="color:#4f46e5; text-align:center; flex-grow:1;">Academic Report Card</h2>
          <div style="text-align:right; font-size:14px;">
            <p><b>Name:</b> ${student.name}</p>
            <p><b>Roll No:</b> ${student.rollNo}</p>
          </div>
        </div>
        ${(student.exams || [])
          .map(
            (exam) => `
              <div style="margin-bottom:20px;">
                <h3 style="text-align:center; color:#4f46e5; text-decoration:underline;">${
                  exam.ExamType
                } – ${exam.ExamName}</h3>
                <table style="width:100%; border-collapse:collapse; text-align:center; font-size:12px;">
                  <thead>
                    <tr style="background:#1e40af; color:white;">
                      <th style="padding:6px; border:1px solid #ccc;">Date</th>
                      ${
                        exam.ExamType === "IIT"
                          ? `
                            <th style="padding:6px; border:1px solid #ccc;">Physics</th>
                            <th style="padding:6px; border:1px solid #ccc;">Chemistry</th>
                            <th style="padding:6px; border:1px solid #ccc;">Maths</th>
                            <th style="padding:6px; border:1px solid #ccc;">Biology</th>
                          `
                          : Object.keys(exam.ExamData.subjectScores || {})
                              .map(
                                (subj) =>
                                  `<th style="padding:6px; border:1px solid #ccc;">${subj}</th>`
                              )
                              .join("")
                      }
                      <th style="padding:6px; border:1px solid #ccc;">Total Marks</th>
                      <th style="padding:6px; border:1px solid #ccc;">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding:6px; border:1px solid #ccc;">${
                        exam.ExamData.date || "-"
                      }</td>
                      ${
                        exam.ExamType === "IIT"
                          ? `
                            <td style="padding:6px; border:1px solid #ccc;">${
                              exam.ExamData.subject1 || "-"
                            }</td>
                            <td style="padding:6px; border:1px solid #ccc;">${
                              exam.ExamData.subject2 || "-"
                            }</td>
                            <td style="padding:6px; border:1px solid #ccc;">${
                              exam.ExamData.subject3 || "-"
                            }</td>
                            <td style="padding:6px; border:1px solid #ccc;">${
                              exam.ExamData.subject4 || "-"
                            }</td>
                          `
                          : Object.values(exam.ExamData.subjectScores || {})
                              .map(
                                (score) =>
                                  `<td style="padding:6px; border:1px solid #ccc;">${
                                    score ?? "-"
                                  }</td>`
                              )
                              .join("")
                      }
                      <td style="padding:6px; border:1px solid #ccc;">${
                        exam.ExamData.totalMarks
                      }</td>
                      <td style="padding:6px; border:1px solid #ccc;">${
                        exam.ExamData.rank || "-"
                      }</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `
          )
          .join("")}
        <div style="display:flex; justify-content:space-around; margin-top:30px;">
          <div style="width:100px; border-top:1px solid #333; text-align:center;">Principal</div>
          <div style="width:120px; border-top:1px solid #333; text-align:center;">Class Teacher</div>
          <div style="width:100px; border-top:1px solid #333; text-align:center;">Guardian</div>
        </div>
      </div>
    `;
  };

  const downloadAll = async () => {
    if (!selectedClassId) {
      alert("Please select a class first.");
      return;
    }

    setLoading(true);
    const zip = new JSZip();

    try {
      const studentsRes = await axios.get(
        `http://localhost:3001/api/class-reports/${selectedClassId}`,
        { withCredentials: true }
      );
      const students = studentsRes.data;

      for (let student of students) {
        const res = await axios.get(
          `http://localhost:3001/api/report/${student.rollNo}`,
          { withCredentials: true }
        );
        const studentData = Array.isArray(res.data) ? res.data[0] : res.data;

        // Render full styled DOM
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        tempDiv.innerHTML = generateReportCardDOM(studentData);
        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        const pdfBlob = pdf.output("blob");
        zip.file(`ReportCard-${studentData.rollNo}.pdf`, pdfBlob);

        document.body.removeChild(tempDiv);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "Class-ReportCards.zip");
    } catch (err) {
      console.error("Error generating reports:", err);
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl px-6 py-10 mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-indigo-700">
          📥 Download All Report Cards
        </h1>

        {/* Class Selector */}
        <div className="mb-4">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Choose a class --</option>
            {assignedClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className} - Year {cls.year}, Section {cls.section}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={downloadAll}
          disabled={loading}
          className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
        >
          {loading ? "Generating PDFs..." : "Download All"}
        </button>
      </div>
    </>
  );
}

export default DownloadAllReport;
