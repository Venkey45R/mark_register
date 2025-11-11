import React, { useRef, useState, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import axios from "../api/axios";
import Navbar from "../components/NavBar";
import { useUser } from "../components/UserContext";
import toast from "react-hot-toast";

const UploadMarks = () => {
  const { institute } = useUser();
  const [students, setStudents] = useState([]);
  const [studentsArray, setStudentsArray] = useState([]);
  const [fileName, setFileName] = useState("Not selected");
  const [inchargeClasses, setInchargeClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [testType, setTestType] = useState("IIT");
  const [instituteId, setInstituteId] = useState(null);
  const [subjectKeys, setSubjectKeys] = useState([]);
  const fileRef = useRef();

  // ✅ Fetch instituteId like in InstituteDetails
  useEffect(() => {
    const fetchInstitute = async () => {
      if (institute?._id) {
        setInstituteId(institute._id);
      } else {
        try {
          const res = await axios.get(
            "https://mark-register.onrender.com/api/current-user",
            {
              withCredentials: true,
            }
          );
          if (res.data?.institution?._id) {
            setInstituteId(res.data.institution._id);
          }
        } catch (err) {
          console.error("Error fetching instituteId:", err);
        }
      }
    };
    fetchInstitute();
  }, [institute]);

  // ✅ Fetch classes for incharge
  useEffect(() => {
    const fetchInchargeClasses = async () => {
      try {
        const res = await axios.get(
          "https://mark-register.onrender.com/api/current-user",
          {
            withCredentials: true,
          }
        );

        if (res.data.role !== "incharge") {
          alert("Only incharges can upload marks.");
          return;
        }

        const classRes = await axios.get(
          `https://mark-register.onrender.com/api/incharge-classes/${res.data._id}`,
          { withCredentials: true }
        );

        setInchargeClasses(classRes.data || []);
      } catch (err) {
        console.error("Failed to fetch incharge classes:", err);
      }
    };

    fetchInchargeClasses();
  }, []);

  const handleChoose = () => fileRef.current.click();

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

  const formatStudentData = (data) => {
    // figure out subject columns from the first row
    const subKeys = getSubjectKeys(data[0], testType);
    setSubjectKeys(subKeys);

    let formatted = [];
    if (testType === "IIT") {
      formatted = data.map((row) => {
        return {
          date: row["DATE OF TEST"],
          rollNo: row["Roll No"] || row["ROLL NO"],
          name: row["Name"] || row["NAME"],
          examName: row["Exam"] || row["EXAM"],

          // ✅ only store subject1–4 marks
          subject1: num(row["Subject 1"] || row["Physics"] || row["S1"]),
          subject2: num(row["Subject 2"] || row["Chemistry"] || row["S2"]),
          subject3: num(row["Subject 3"] || row["Maths"] || row["S3"]),
          subject4: num(row["Subject 4"] || row["Biology"] || row["S4"]),

          totalMarks: num(row["Total Marks"]),
          rank: int(row["Rank"]),
        };
      });
    } else {
      // CDF
      formatted = data.map((row) => {
        const subjectScores = {};
        subKeys.forEach((k) => (subjectScores[k.trim()] = num(row[k])));

        return {
          date: row["DATE OF TEST"],
          rollNo: row["ROLL NO"],
          name: row["NAME OF THE STUDENT"],
          examName: row["TEST NAME"], // keep it flat
          totalMarks: num(row["TM"]),
          rank: int(row["TR"]),
          subjectScores, // <-- send this
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
    if (!instituteId) {
      alert("Institute not loaded yet. Try again.");
      return;
    }

    try {
      await axios.post(
        "https://mark-register.onrender.com/api/upload",
        {
          students: studentsArray,
          classId: selectedClassId,
          testType,
          instituteId, // ✅ include institute
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success("Upload successful ✅");
      setStudents([]);
      setStudentsArray([]);
      setFileName("Not selected");
      setSelectedClassId("");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed ❌");
    }
  };

  const num = (v) =>
    v === undefined || v === null || v === "" ? 0 : Number(v);
  const int = (v) =>
    v === undefined || v === null || v === "" ? 0 : parseInt(v, 10);

  const getSubjectKeys = (row, type) => {
    if (!row) return [];
    const ignoreIIT = [
      "Roll No",
      "ROLL NO",
      "Exam",
      "EXAM",
      "Name",
      "NAME",
      "Total Marks",
      "Rank",
    ];
    const ignoreCDF = [
      "ROLL NO",
      "TEST NAME",
      "NAME OF THE STUDENT",
      "TM",
      "TR",
    ];
    const ignore = type === "CDF" ? ignoreCDF : ignoreIIT;
    return Object.keys(row).filter((k) => k && !ignore.includes(k));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
        <div className="max-w-6xl p-8 mx-auto bg-white shadow-xl rounded-3xl">
          <h1 className="text-3xl font-extrabold text-center text-indigo-700">
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
                if (students.length) formatStudentData(students);
              }}
              className="block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
              className="block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                className="px-6 py-2 font-semibold text-white rounded-lg shadow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Choose File
              </button>
            </div>
          </div>

          {/* Preview */}
          {students.length === 0 && (
            <div className="flex items-center justify-center w-full h-48 mt-6 border rounded-lg bg-gray-50">
              <p className="text-gray-500">
                📄 Select a CSV/Excel file to preview student marks
              </p>
            </div>
          )}

          {students.length > 0 && testType === "IIT" && (
            <div className="mt-8 overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm text-center border-collapse">
                <thead>
                  <tr className="text-white bg-blue-700">
                    <th className="p-2 border">Roll No</th>
                    <th className="p-2 border">Exam</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Subject1</th>
                    <th className="p-2 border">Subject2</th>
                    <th className="p-2 border">Subject3</th>
                    <th className="p-2 border">Subject4</th>
                    <th className="p-2 border">Total Marks</th>
                    <th className="p-2 border">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsArray.map((row, i) => (
                    <tr key={i}>
                      <td className="p-2 border">{row.rollNo}</td>
                      <td className="p-2 border">{row.examName}</td>
                      <td className="p-2 border">{row.name}</td>
                      <td className="p-2 border">{row.subject1}</td>
                      <td className="p-2 border">{row.subject2}</td>
                      <td className="p-2 border">{row.subject3}</td>
                      <td className="p-2 border">{row.subject4}</td>
                      <td className="p-2 border">{row.totalMarks}</td>
                      <td className="p-2 border">{row.rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {students.length > 0 && testType === "CDF" && (
            <div className="mt-8 overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm text-center border-collapse">
                <thead className="text-white bg-indigo-600">
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
                    <tr key={index} className="hover:bg-indigo-50">
                      <td className="p-2 border">{row["ROLL NO"]}</td>
                      <td className="p-2 border">{row["TEST NAME"]}</td>
                      <td className="p-2 border">
                        {row["NAME OF THE STUDENT"]}
                      </td>
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
                className="px-6 py-2 font-semibold text-white rounded-lg shadow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                🚀 Upload
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadMarks;
