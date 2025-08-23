import React, { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavBar";
import { jsPDF } from "jspdf";
import ke from "../KE.png";
import html2canvas from "html2canvas";
import { useUser } from "../components/UserContext";

const ReportCard = () => {
  const { rollNo } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [instituteLogo, setInstituteLogo] = useState(null);
  const reportRef = useRef();
  const { institute } = useUser();

  // 🔹 Fetch student data
  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/report/${rollNo}`, {
        withCredentials: true,
      })
      .then((res) => {
        const student = Array.isArray(res.data) ? res.data[0] : res.data;
        setStudentData({
          ...student,
          exams: student.exams || [],
        });
      })
      .catch((err) => console.error(err));
  }, [rollNo]);

  // 🔹 Fetch institute logo
  useEffect(() => {
    const fetchInstituteLogo = async () => {
      try {
        const userRes = await axios.get(
          "http://localhost:3001/api/current-user",
          { withCredentials: true }
        );

        let instituteId = "";
        if (userRes.data.institution?._id) {
          instituteId = userRes.data.institution._id;
        } else if (typeof userRes.data.institution === "string") {
          const instRes = await axios.get(
            `http://localhost:3001/api/institutes?name=${userRes.data.institution}`,
            { withCredentials: true }
          );
          instituteId = instRes.data._id;
        }

        if (!instituteId) return;

        const inst = await axios.get(
          `http://localhost:3001/institutes/${instituteId}`,
          { withCredentials: true }
        );

        if (inst.data?.logo) {
          const logo = inst.data.logo.startsWith("http")
            ? inst.data.logo
            : `http://localhost:3001${inst.data.logo}`;
          setInstituteLogo(logo);
        }
      } catch (err) {
        console.error("Failed to fetch institute logo:", err);
      }
    };

    fetchInstituteLogo();
  }, []);

  useEffect(() => {
    if (institute?._id) {
      axios
        .get(`http://localhost:3001/api/institutes/${institute._id}`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data?.logo) {
            const logo = res.data.logo.startsWith("http")
              ? res.data.logo
              : `http://localhost:3001${res.data.logo}`;
            setInstituteLogo(logo);
          }
        })
        .catch((err) => console.error("Failed to fetch institute logo:", err));
    }
  }, [institute]);

  const handleDownload = async () => {
    if (!studentData || !reportRef.current) {
      alert("Report not ready yet!");
      return;
    }

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ReportCard-${studentData.rollNo}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Download failed. Please try again.");
    }
  };

  if (!studentData) return <div className="mt-10 text-center">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="max-w-5xl px-4 py-6 mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold text-indigo-700">📄 Report Card</h1>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
          >
            Download PDF
          </button>
        </div>

        {/* Printable Content */}
        <div
          ref={reportRef}
          className="p-8 text-black bg-white border border-gray-300 shadow-lg rounded-xl"
        >
          {/* Logos Row */}
          <div className="flex items-center justify-between mb-6">
            <img
              src={ke}
              alt="Logo1"
              className="h-10"
              crossOrigin="anonymous"
            />

            <h2 className="text-2xl font-bold text-indigo-700">
              Academic Report Card
            </h2>

            <img
              src={instituteLogo || ke}
              alt="Institute Logo"
              className="h-10"
              crossOrigin="anonymous"
            />
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-lg">
            <p>
              <strong>Name:</strong> {studentData.name}
            </p>
            <p>
              <strong>Roll No:</strong> {studentData.rollNo}
            </p>
          </div>

          {/* Exams */}
          {studentData.exams.map((exam, idx) => (
            <div
              key={idx}
              className="p-4 mb-8 border rounded-lg shadow-sm bg-gray-50"
            >
              <h3 className="mb-3 text-lg font-semibold text-center text-indigo-600 underline">
                {exam.ExamType} – {exam.ExamName}
              </h3>
              <table className="w-full text-sm text-center border border-collapse border-gray-400">
                <thead className="text-white bg-indigo-700">
                  <tr>
                    <th className="p-2 border">Date</th>

                    {/* If IIT -> show Subject1-4 */}
                    {exam.ExamType === "IIT" ? (
                      <>
                        <th className="p-2 border">Subject 1</th>
                        <th className="p-2 border">Subject 2</th>
                        <th className="p-2 border">Subject 3</th>
                        <th className="p-2 border">Subject 4</th>
                      </>
                    ) : (
                      // Else for CDF -> dynamic subjectScores keys
                      Object.keys(exam.ExamData.subjectScores || {}).map(
                        (subj, i) => (
                          <th key={i} className="p-2 capitalize border">
                            {subj}
                          </th>
                        )
                      )
                    )}

                    <th className="p-2 border">Total Marks</th>
                    <th className="p-2 border">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border">
                      {exam.ExamData.examDate
                        ? new Date(exam.ExamData.examDate).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* If IIT -> print subject1-4 */}
                    {exam.ExamType === "IIT" ? (
                      <>
                        <td className="p-2 border">
                          {exam.ExamData.subject1 ?? "-"}
                        </td>
                        <td className="p-2 border">
                          {exam.ExamData.subject2 ?? "-"}
                        </td>
                        <td className="p-2 border">
                          {exam.ExamData.subject3 ?? "-"}
                        </td>
                        <td className="p-2 border">
                          {exam.ExamData.subject4 ?? "-"}
                        </td>
                      </>
                    ) : (
                      // Else for CDF -> subjectScores values
                      Object.values(exam.ExamData.subjectScores || {}).map(
                        (score, i) => (
                          <td key={i} className="p-2 border">
                            {score}
                          </td>
                        )
                      )
                    )}

                    <td className="p-2 border">{exam.ExamData.totalMarks}</td>
                    <td className="p-2 border">{exam.ExamData.rank}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-8 mt-8 text-center">
                <div>
                  <div className="pt-2 border-t border-gray-600">Principal</div>
                </div>
                <div>
                  <div className="pt-2 border-t border-gray-600">
                    Class Teacher
                  </div>
                </div>
                <div>
                  <div className="pt-2 border-t border-gray-600">Guardian</div>
                </div>
              </div>
            </div>
          ))}

          {/* Footer */}
          <p className="mt-6 text-xs text-right text-gray-500">
            Generated on {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </>
  );
};

export default ReportCard;
