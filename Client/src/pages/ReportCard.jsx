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

  // ---- helpers ----
  const num = (val) => {
    if (val === undefined || val === null || val === "") return 0;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Normalize older IIT records into subject1–4 if needed
  const normalizeIITExam = (exam) => {
    if (exam.ExamType !== "IIT" || !exam.ExamData) return exam;
    return {
      ...exam,
      ExamData: {
        ...exam.ExamData,
        subject1: num(
          exam.ExamData.subject1 ||
            exam.ExamData["Subject1"] ||
            exam.ExamData["Subject 1"] ||
            exam.ExamData["Physics"] ||
            exam.ExamData["S1"]
        ),
        subject2: num(
          exam.ExamData.subject2 ||
            exam.ExamData["Subject2"] ||
            exam.ExamData["Subject 2"] ||
            exam.ExamData["Chemistry"] ||
            exam.ExamData["S2"]
        ),
        subject3: num(
          exam.ExamData.subject3 ||
            exam.ExamData["Subject3"] ||
            exam.ExamData["Subject 3"] ||
            exam.ExamData["Maths"] ||
            exam.ExamData["S3"]
        ),
        subject4: num(
          exam.ExamData.subject4 ||
            exam.ExamData["Subject4"] ||
            exam.ExamData["Subject 4"] ||
            exam.ExamData["Biology"] ||
            exam.ExamData["S4"]
        ),
      },
    };
  };

  // ---- fix for oklch/oklab colors (Option 2) ----
  const containsUnsupportedColor = (v) =>
    /(oklch|oklab|lch\(|lab\(|color\(display-p3)/i.test(v || "");

  const sanitizeForHtml2Canvas = (root) => {
    if (!root) return () => {};
    const nodes = [root, ...root.querySelectorAll("*")];
    const restoreFns = [];

    nodes.forEach((el) => {
      const cs = window.getComputedStyle(el);

      // background-image may contain gradients with oklch
      const bgImg = cs.getPropertyValue("background-image");
      if (bgImg && containsUnsupportedColor(bgImg)) {
        const prev = el.style.getPropertyValue("background-image");
        restoreFns.push(() => el.style.setProperty("background-image", prev));
        el.style.setProperty("background-image", "none", "important");
      }

      // properties to check
      const props = [
        "color",
        "background-color",
        "border-color",
        "outline-color",
        "text-decoration-color",
        "column-rule-color",
      ];
      const sides = [
        "border-top-color",
        "border-right-color",
        "border-bottom-color",
        "border-left-color",
      ];

      [...props, ...sides].forEach((prop) => {
        const val = cs.getPropertyValue(prop);
        if (val && containsUnsupportedColor(val)) {
          const prev = el.style.getPropertyValue(prop);
          restoreFns.push(() => el.style.setProperty(prop, prev));
          const fallback = prop.includes("background") ? "#ffffff" : "#000000";
          el.style.setProperty(prop, fallback, "important");
        }
      });
    });

    return () => restoreFns.reverse().forEach((fn) => fn());
  };

  // ---- Fetch data ----
  useEffect(() => {
    axios
      .get(`https://mark-register.onrender.com/api/report/${rollNo}`, {
        withCredentials: true,
      })
      .then((res) => {
        const student = Array.isArray(res.data) ? res.data[0] : res.data;
        const normalizedExams = (student.exams || []).map((e) =>
          normalizeIITExam(e)
        );
        setStudentData({ ...student, exams: normalizedExams });
      })
      .catch((err) => console.error(err));
  }, [rollNo]);

  // institute logo
  useEffect(() => {
    const fetchInstituteLogo = async () => {
      try {
        const userRes = await axios.get(
          "https://mark-register.onrender.com/api/current-user",
          { withCredentials: true }
        );

        let instituteId = "";
        if (userRes.data.institution?._id) {
          instituteId = userRes.data.institution._id;
        } else if (typeof userRes.data.institution === "string") {
          const instRes = await axios.get(
            `https://mark-register.onrender.com/api/institutes?name=${userRes.data.institution}`,
            { withCredentials: true }
          );
          // NOTE: adjust if your API returns array
          instituteId = instRes.data?._id || instRes.data?.[0]?._id || "";
        }

        if (!instituteId) return;

        const inst = await axios.get(
          `https://mark-register.onrender.com/institutes/${instituteId}`,
          { withCredentials: true }
        );

        if (inst.data?.logo) {
          const logo = inst.data.logo.startsWith("http")
            ? inst.data.logo
            : `https://mark-register.onrender.com${inst.data.logo}`;
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
        .get(
          `https://mark-register.onrender.com/api/institutes/${institute._id}`,
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          if (res.data?.logo) {
            const logo = res.data.logo.startsWith("http")
              ? res.data.logo
              : `https://mark-register.onrender.com${res.data.logo}`;
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

    let restore = () => {};
    try {
      // ⬇️ temporarily force safe colors inside the printable node
      restore = sanitizeForHtml2Canvas(reportRef.current);

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
    } finally {
      // ⬆️ restore original styles
      restore();
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
          <div className="flex items-center justify-center gap-20 mb-6">
            <img
              src={instituteLogo || ke}
              alt="Institute Logo"
              className="h-8"
              crossOrigin="anonymous"
            />

            <h2 className="text-2xl font-bold text-indigo-700">
              Academic Report Card
            </h2>
            <div className="mb-6 text-md">
              <p className="mb-2">
                <strong>Name:</strong> {studentData.name}
              </p>
              <p>
                <strong>Roll No:</strong> {studentData.rollNo}
              </p>
            </div>
          </div>

          {/* Student Info */}

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
                <thead>
                  <tr>
                    <th
                      className="p-2 border"
                      style={{ backgroundColor: "#1e40af", color: "#ffffff" }}
                    >
                      Date
                    </th>

                    {exam.ExamType === "IIT" ? (
                      <>
                        <th
                          className="p-2 border"
                          style={{
                            backgroundColor: "#1e40af",
                            color: "#ffffff",
                          }}
                        >
                          Physics
                        </th>
                        <th
                          className="p-2 border"
                          style={{
                            backgroundColor: "#1e40af",
                            color: "#ffffff",
                          }}
                        >
                          Chemistry
                        </th>
                        <th
                          className="p-2 border"
                          style={{
                            backgroundColor: "#1e40af",
                            color: "#ffffff",
                          }}
                        >
                          Maths
                        </th>
                        <th
                          className="p-2 border"
                          style={{
                            backgroundColor: "#1e40af",
                            color: "#ffffff",
                          }}
                        >
                          Biology
                        </th>
                      </>
                    ) : (
                      Object.keys(exam.ExamData.subjectScores || {})
                        .filter((subj) => subj.toLowerCase() !== "date of test") // ⬅️ remove duplicate
                        .map((subj, i) => (
                          <th
                            key={i}
                            className="p-2 capitalize border"
                            style={{
                              backgroundColor: "#1e40af",
                              color: "#ffffff",
                            }}
                          >
                            {subj}
                          </th>
                        ))
                    )}

                    <th
                      className="p-2 border"
                      style={{ backgroundColor: "#1e40af", color: "#ffffff" }}
                    >
                      Total Marks
                    </th>
                    <th
                      className="p-2 border"
                      style={{ backgroundColor: "#1e40af", color: "#ffffff" }}
                    >
                      Rank
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    {exam.ExamType === "IIT" ? (
                      <>
                        {/* Date column */}
                        <td className="p-2 border">
                          {exam.ExamData.date || "-"}
                        </td>

                        <td className="p-2 border">{exam.ExamData.subject1}</td>
                        <td className="p-2 border">{exam.ExamData.subject2}</td>
                        <td className="p-2 border">{exam.ExamData.subject3}</td>
                        <td className="p-2 border">{exam.ExamData.subject4}</td>
                      </>
                    ) : (
                      <>
                        {/* Date column */}
                        <td className="p-2 border">
                          {exam.ExamData.date || "-"}
                        </td>

                        {Object.entries(exam.ExamData.subjectScores || {})
                          .filter(
                            ([key]) => key.toLowerCase() !== "date of test"
                          ) // ⬅️ remove duplicate
                          .map(([_, score], i) => (
                            <td key={i} className="p-2 border">
                              {score ?? "-"}
                            </td>
                          ))}
                      </>
                    )}

                    {/* Total and Rank always last */}
                    <td className="p-2 border">{exam.ExamData.totalMarks}</td>
                    <td className="p-2 border">{exam.ExamData.rank}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
          <div className="flex justify-between py-4">
            <img
              src={ke}
              alt="Logo1"
              className="h-8 mt-6"
              crossOrigin="anonymous"
            />
            <div className="grid grid-cols-3 gap-20 mt-8 text-center">
              <div>
                <div className="w-40 border-t border-gray-600">Principal</div>
              </div>
              <div>
                <div className="border-t border-gray-600">Class Teacher</div>
              </div>
              <div>
                <div className="border-t border-gray-600 ">Guardian</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportCard;
