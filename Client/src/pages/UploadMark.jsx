import React, { useRef, useState, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import axios from "../api/axios";
import Navbar from "../components/NavBar";

const UploadMarks = () => {
  const [students, setStudents] = useState([]); // raw rows for preview
  const [studentsArray, setStudentsArray] = useState([]); // normalized payload
  const [fileName, setFileName] = useState("Not selected");
  const [inchargeClasses, setInchargeClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [testType, setTestType] = useState("IIT"); // NEW: IIT | CDF
  const fileRef = useRef();

  // fetch classes for logged-in incharge
  useEffect(() => {
    const fetchInchargeClasses = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/current-user", {
          withCredentials: true,
        });

        if (res.data.role !== "incharge") {
          alert("Only incharges can upload marks.");
          return;
        }

        const classRes = await axios.get(
          `http://localhost:3001/api/incharge-classes/${res.data._id}`,
          {
            withCredentials: true,
          }
        );

        setInchargeClasses(classRes.data || []);
      } catch (err) {
        console.error("Failed to fetch incharge classes:", err);
      }
    };

    fetchInchargeClasses();
  }, []);

  const handleChoose = () => fileRef.current.click();

  // Detect CSV or Excel and parse accordingly
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const isCSV = /\.csv$/i.test(file.name);
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);

    if (isCSV) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data;
          setStudents(rows);
          formatStudentData(rows);
        },
      });
    } else if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const firstSheet = wb.SheetNames[0];
        const json = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet], {
          defval: "",
        });
        setStudents(json);
        formatStudentData(json);
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Please upload a CSV or Excel (.xlsx/.xls) file.");
    }
  };

  // Normalize rows to a consistent backend payload
  const formatStudentData = (data) => {
    if (!Array.isArray(data)) return;

    let formatted = [];

    if (testType === "IIT") {
      // existing IIT structure (90 questions, specific headers)
      formatted = data.map((student) => {
        const answers = [];
        for (let i = 1; i <= 90; i++) {
          answers.push({
            questionNumber: i,
            correctOption: student[`Q ${i} Key`] || "-",
            selectedOption: student[`Q ${i} Options`] || "-",
          });
        }

        return {
          rollNo: student["Roll No"] || student["ROLL NO"] || "",
          name: student["Name"] || student["NAME"] || "",
          exam: {
            examType: "IIT",
            examName: student["Exam"] || student["EXAM"] || "",
            examSet: student["Exam set"] || student["EXAM SET"] || "",
            totalMarks: num(student["Total Marks"]),
            grade: student["Grade"] || student["GRADE"] || "",
            rank: int(student["Rank"]),
            correctAnswers: int(student["Correct Answers"]),
            incorrectAnswers: int(student["Incorrect Answers"]),
            notAttempted: int(student["Not attempted"]),
            subjectScores: {
              subject1: num(student["Subject 1"]),
              subject2: num(student["Subject 2"]),
              subject3: num(student["Subject 3"]),
              subject4: num(student["Subject 4"]),
            },
            subjectRanks: {
              subject1: 0,
              subject2: 0,
              subject3: 0,
              subject4: 0,
            },
            answers,
          },
        };
      });
    } else if (testType === "CDF") {
      // CDF structure based on your uploaded sheet
      // Columns: TEST NAME, DATE OF TEST, ROLL NO, NAME OF THE STUDENT,
      // MM, MR, PM, PR, CM, CR, BM, BR, TM, TR
      formatted = data.map((row) => {
        return {
          rollNo: row["ROLL NO"]?.toString().trim() || row["Roll No"] || "",
          name: row["NAME OF THE STUDENT"] || row["Name"] || "",
          exam: {
            examType: "CDF",
            examName: row["TEST NAME"] || "",
            examDate: row["DATE OF TEST"] || "",
            totalMarks: num(row["TM"]),
            rank: int(row["TR"]),
            subjectScores: {
              maths: num(row["MM"]),
              physics: num(row["PM"]),
              chemistry: num(row["CM"]),
              biology: num(row["BM"]),
            },
            subjectRanks: {
              maths: int(row["MR"]),
              physics: int(row["PR"]),
              chemistry: int(row["CR"]),
              biology: int(row["BR"]),
            },
          },
        };
      });
    }

    setStudentsArray(formatted);
  };

  const handleUpload = async () => {
    if (!selectedClassId) {
      alert("Please select a class before uploading.");
      return;
    }
    if (!studentsArray.length) {
      alert("No data to upload. Please choose a file.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3001/api/upload",
        {
          students: studentsArray,
          classId: selectedClassId,
          testType, // <- tell backend which test this is
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      alert("Upload successful ✅");
      setStudents([]);
      setStudentsArray([]);
      setFileName("Not selected");
      setSelectedClassId("");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed ❌");
    }
  };

  // helpers
  const num = (v) =>
    v === undefined || v === null || v === "" ? 0 : Number(v);
  const int = (v) =>
    v === undefined || v === null || v === "" ? 0 : parseInt(v, 10);

  return (
    <>
      <Navbar />
      <div className="max-w-6xl px-6 py-10 mx-auto">
        <h1 className="text-3xl font-bold text-green-700">
          📤 Upload Student Marks
        </h1>

        {/* Test Type */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Select Test Type
          </label>
          <select
            value={testType}
            onChange={(e) => {
              setTestType(e.target.value);
              // re-normalize if a file was already loaded
              if (students.length) formatStudentData(students);
            }}
            className="block w-full p-2 border rounded shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="IIT">IIT</option>
            <option value="CDF">CDF</option>
          </select>
        </div>

        {/* Class */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Select Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="block w-full p-2 border rounded shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="">-- Select a class --</option>
            {inchargeClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className} - Year {cls.year}, Section {cls.section}
              </option>
            ))}
          </select>
        </div>

        {/* File choose */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
          <div className="text-sm text-gray-700">
            <span className="font-medium">File:</span> {fileName}
          </div>
          <div>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              ref={fileRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={handleChoose}
              className="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
            >
              Choose File
            </button>
          </div>
        </div>

        {/* Preview */}
        {students.length === 0 && (
          <div className="flex items-center justify-center w-full h-48 mt-6 border rounded bg-gray-50">
            <p className="text-gray-500">
              📄 Select a CSV/Excel file to preview student marks
            </p>
          </div>
        )}

        {students.length > 0 && testType === "IIT" && (
          <div className="mt-8 overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
            <table className="w-full text-sm text-center border-collapse">
              <thead className="text-white bg-green-700">
                <tr>
                  <th className="p-2 border">Roll No</th>
                  <th className="p-2 border">Exam</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Total Marks</th>
                  <th className="p-2 border">Rank</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {students.slice(0, 50).map((student, index) => (
                  <tr key={index} className="hover:bg-green-50">
                    <td className="p-2 border">
                      {student["Roll No"] || student["ROLL NO"]}
                    </td>
                    <td className="p-2 border">
                      {student["Exam"] || student["EXAM"]}
                    </td>
                    <td className="p-2 border">
                      {student["Name"] || student["NAME"]}
                    </td>
                    <td className="p-2 border">{student["Total Marks"]}</td>
                    <td className="p-2 border">{student["Rank"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {students.length > 0 && testType === "CDF" && (
          <div className="mt-8 overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
            <table className="w-full text-sm text-center border-collapse">
              <thead className="text-white bg-green-700">
                <tr>
                  <th className="p-2 border">Roll No</th>
                  <th className="p-2 border">Test</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Total Marks (TM)</th>
                  <th className="p-2 border">Rank (TR)</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {students.slice(0, 50).map((row, index) => (
                  <tr key={index} className="hover:bg-green-50">
                    <td className="p-2 border">{row["ROLL NO"]}</td>
                    <td className="p-2 border">{row["TEST NAME"]}</td>
                    <td className="p-2 border">{row["NAME OF THE STUDENT"]}</td>
                    <td className="p-2 border">{row["TM"]}</td>
                    <td className="p-2 border">{row["TR"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Upload */}
        {studentsArray.length > 0 && (
          <div className="flex justify-end mt-6">
            <button
              onClick={handleUpload}
              className="px-6 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
            >
              Upload
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UploadMarks;
