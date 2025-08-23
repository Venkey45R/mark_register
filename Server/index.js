import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Student from "./models/Student.js";
import User from "./models/User.js";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import Institute from "./models/Institute.js";
import Class from "./models/Classes.js";
import cookieParser from "cookie-parser";
import { UAParser } from "ua-parser-js";
import { v4 as uuidv4 } from "uuid";
import Log from "./models/Logs.js";
import Visitor from "./models/visitors.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";

const JWT_SECRET = "your_super_secret_jwt_key";

function parseUserAgent(userAgent) {
  const parser = new UAParser(userAgent);
  const os = parser.getOS().name || "Unknown OS";
  const browser = parser.getBrowser().name || "Unknown Browser";
  return { os, browser };
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save files inside /uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const auth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // The payload (userId and role) is now available in req.user
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

dotenv.config();

const app = express();
app.use(bodyParser.text({ type: "text/csv" }));
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// app.post("/api/upload", async (req, res) => {
//   const { students, classId, testType, instituteId } = req.body;

//   if (!classId || !students?.length || !testType || !instituteId) {
//     return res.status(400).json({ message: "Missing data" });
//   }

//   try {
//     await Promise.all(
//       students.map(async (student, i) => {
//         // Ensure examName is never blank
//         let examName =
//           student.exam?.examName && student.exam.examName.trim() !== ""
//             ? student.exam.examName.trim()
//             : `${testType}-Test-${i + 1}`;

//         const newExam = {
//           ExamType: testType, // IIT or CDF
//           ExamName: examName, // guaranteed non-empty
//           ExamData: student.exam, // full JSON
//         };

//         let existingStudent = await Student.findOne({ rollNo: student.rollNo });

//         if (!existingStudent) {
//           const created = await Student.create({
//             rollNo: student.rollNo,
//             name: student.name,
//             class: classId,
//             exams: [newExam],
//           });

//           await Class.findByIdAndUpdate(classId, {
//             $addToSet: { students: created._id },
//           });
//         } else {
//           const idx = existingStudent.exams.findIndex(
//             (e) =>
//               e.ExamName === newExam.ExamName && e.ExamType === newExam.ExamType
//           );

//           if (idx !== -1) {
//             existingStudent.exams[idx] = newExam;
//           } else {
//             existingStudent.exams.push(newExam);
//           }

//           await existingStudent.save();
//           await Class.findByIdAndUpdate(classId, {
//             $addToSet: { students: existingStudent._id },
//           });
//         }
//       })
//     );

//     res.status(200).json({ message: "Upload successful ✅" });
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(500).json({ message: "Server error during upload" });
//   }
// });

app.post("/api/upload", async (req, res) => {
  const { students, classId, testType, instituteId } = req.body;

  if (!classId || !students?.length || !testType || !instituteId) {
    return res.status(400).json({ message: "Missing data" });
  }

  try {
    await Promise.all(
      students.map(async (student, i) => {
        // exam name (fallback if blank)
        let examName =
          student.examName && student.examName.trim() !== ""
            ? student.examName.trim()
            : `${testType}-Test-${i + 1}`;

        // ✅ Build exam data differently for IIT vs CDF
        let examData;
        if (testType === "IIT") {
          examData = {
            totalMarks: student.totalMarks,
            rank: student.rank,
            subject1: student.subject1,
            subject2: student.subject2,
            subject3: student.subject3,
            subject4: student.subject4,
          };
        } else {
          examData = {
            totalMarks: student.totalMarks,
            rank: student.rank,
            subjectScores: student.subjectScores || {},
          };
        }

        const newExam = {
          ExamType: testType,
          ExamName: examName,
          ExamData: examData,
        };

        let existingStudent = await Student.findOne({ rollNo: student.rollNo });

        if (!existingStudent) {
          const created = await Student.create({
            rollNo: student.rollNo,
            name: student.name,
            class: classId,
            institute: instituteId,
            exams: [newExam],
          });

          await Class.findByIdAndUpdate(classId, {
            $addToSet: { students: created._id },
          });
        } else {
          const idx = existingStudent.exams.findIndex(
            (e) =>
              e.ExamName === newExam.ExamName && e.ExamType === newExam.ExamType
          );

          if (idx !== -1) {
            existingStudent.exams[idx] = newExam;
          } else {
            existingStudent.exams.push(newExam);
          }

          existingStudent.institute = instituteId;
          await existingStudent.save();

          await Class.findByIdAndUpdate(classId, {
            $addToSet: { students: existingStudent._id },
          });
        }
      })
    );

    res.status(200).json({ message: "Upload successful ✅" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error during upload" });
  }
});

// get number of students grouped by institute
app.get("/api/admin/institute-stats", async (req, res) => {
  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: "$institute",
          studentCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "institutes",
          localField: "_id",
          foreignField: "_id",
          as: "instituteDetails",
        },
      },
      { $unwind: "$instituteDetails" },
      {
        $project: {
          _id: 0,
          instituteName: "$instituteDetails.name",
          studentCount: 1,
        },
      },
    ]);

    res.json(stats);
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/api/report/:rollNo", async (req, res) => {
  try {
    const studentReports = await Student.find({ rollNo: req.params.rollNo });
    res.json(studentReports);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reports" });
  }
});

app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find({});
    const resposeData = students.map((student) => ({
      name: student.name,
      rollNo: student.rollNo,
    }));
    res.json(resposeData);
  } catch (err) {
    console.log(err);
  }
});

app.get("/api/incharge-classes/:inchargeId", async (req, res) => {
  try {
    const classes = await Class.find({ classTeacher: req.params.inchargeId });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch classes" });
  }
});

app.get("/api/incharge-classes/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const classes = await Class.find({ classTeacher: userId });
    res.status(200).json(classes);
  } catch (err) {
    console.error("Error fetching incharge classes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// app.post("/api/signup", async (req, res) => {
//   const { username, password, name, institution, role } = req.body.formData;
//   try {
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ message: "username taken" });
//     }

//     const newUser = await User.create({
//       username,
//       password,
//       name,
//       institution,
//       role,
//     });

//     // 🌐 Log visitor info
//     const userAgent = req.headers["user-agent"];
//     const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
//     const { os, browser } = parseUserAgent(userAgent);
//     const visitorId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

//     await Visitor.create({
//       visitorId,
//       ip,
//       os,
//       browser,
//       url: "/signup",
//     });

//     res.status(201).json({ message: "success", user: newUser });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "server error" });
//   }
// });
app.post("/api/signup", async (req, res) => {
  const { username, password, name, institution, role } = req.body.formData;
  if (!username || !password || !name || !institution) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "Username already exists" });
    }
    // If institution is string, find its ObjectId
    let institutionId = institution;
    if (typeof institution === "string") {
      const inst = await Institute.findOne({ name: institution });
      if (!inst) {
        return res.status(400).json({ message: "Institute not found" });
      }
      institutionId = inst._id;
    }

    // hash password, etc...
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      name,
      institution: institutionId, // ✅ now ObjectId
      role,
    });

    // ... rest of signup logic unchanged

    // 4️⃣ Create JWT payload (✅ add institution here)
    const payload = {
      userId: newUser._id,
      role: newUser.role,
      institution: newUser.institution,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // 5️⃣ Store token in httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // change to true in production (HTTPS)
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    // 6️⃣ Log visitor info
    const userAgent = req.headers["user-agent"];
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const parser = new UAParser(userAgent);
    const os = parser.getOS().name || "Unknown OS";
    const browser = parser.getBrowser().name || "Unknown Browser";
    const visitorId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    await Visitor.create({
      visitorId,
      ip,
      os,
      browser,
      url: "/signup",
    });

    // 7️⃣ Return success with role + name + institution
    return res.status(201).json({
      message: "success",
      name: newUser.name,
      role: newUser.role,
      institution: newUser.institution, // ✅ added
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
});

// -- Login Route --
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password incorrect" });
    }

    // ✅ Add institution to payload
    const payload = {
      userId: user._id,
      role: user.role,
      institution: user.institution, // added institution field
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 3600000,
    });

    const userAgent = req.headers["user-agent"];
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const parser = new UAParser(userAgent);
    const os = parser.getOS().name || "Unknown OS";
    const browser = parser.getBrowser().name || "Unknown Browser";

    const log = new Log({
      loginId: uuidv4(),
      userId: user._id,
      ip,
      os,
      browser,
      loggedInAt: new Date(),
    });
    await log.save();

    const visitor = new Visitor({
      visitorId: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      ip,
      os,
      browser,
      url: "/login",
    });
    await visitor.save();

    return res.status(200).json({
      message: "success",
      name: user.name,
      role: user.role,
      institution: user.institution, // ✅ also return institution in response
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});

app.get("/incharges/:institution", async (req, res) => {
  try {
    const users = await User.find({
      role: "incharge",
      institution: req.params.institution,
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.post("/api/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const user = await User.findOne({ username });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     if (user.password === password) {
//       // Set cookies
//       res.cookie("userRole", user.role, {
//         httpOnly: true,
//         secure: false,
//         sameSite: "strict",
//         maxAge: 24 * 60 * 60 * 1000,
//       });

//       res.cookie("username", user.username, {
//         httpOnly: true,
//         secure: false,
//         sameSite: "strict",
//         maxAge: 24 * 60 * 60 * 1000,
//       });

//       // ✅ Get device & IP info
//       const userAgent = req.headers["user-agent"];
//       const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
//       const parser = new UAParser(userAgent);
//       const os = parser.getOS().name || "Unknown OS";
//       const browser = parser.getBrowser().name || "Unknown Browser";

//       // ✅ Save Login Log
//       const log = new Log({
//         loginId: uuidv4(),
//         userId: user._id,
//         ip,
//         os,
//         browser,
//         loggedInAt: new Date(),
//       });
//       await log.save();

//       // ✅ Save Visitor
//       const visitor = new Visitor({
//         visitorId: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
//         ip,
//         os,
//         browser,
//         url: "/login",
//       });
//       await visitor.save();

//       return res.status(200).json({ message: "success", name: user.name });
//     } else {
//       return res.status(400).json({ message: "Password incorrect" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "server error" });
//   }
// });

app.get("/api/getUserRole", (req, res) => {
  const role = req.cookies.userRole;
  res.json({ role });
});

app.get("/api/check-role", auth, async (req, res) => {
  const user = await User.findById(req.user.userId).populate("institution");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    role: user.role,
    userId: user._id,
    institute: user.institution, // ✅ now full object
  });
});
// PUT: update institute logo
app.put("/api/institutes/:id/logo", upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploaded file:", req.file);

    const institute = await Institute.findById(req.params.id);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    // Save relative path in DB
    institute.logo = `/uploads/${req.file.filename}`;
    await institute.save();

    res.json({ message: "Logo uploaded successfully", institute });
  } catch (err) {
    console.error("Error uploading logo:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Make /uploads folder public
app.use("/uploads", express.static("uploads"));

// It will return a 404 if the institute name is not found in the database.
app.get("/api/institutes", async (req, res) => {
  try {
    const { name } = req.query; // Get the 'name' query parameter
    if (!name) {
      return res.status(400).json({ message: "Institute name is required" });
    }

    // Find the institute by its name (case-insensitive)
    const institute = await Institute.findOne({
      name: { $regex: new RegExp(name, "i") }, // Use regex for case-insensitive search
    });

    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    res.status(200).json(institute);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// A route that requires no authentication
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().populate("institution", "name _id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//get by id
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//put by id
app.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/logout", async (req, res) => {
  const username = req.cookies.username;

  if (username) {
    const user = await User.findOne({ username });
    if (user) {
      await Log.findOneAndUpdate(
        { userId: user._id },
        { loggedOutAt: new Date() },
        { sort: { createdAt: -1 } }
      );
    }
  }

  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });
  res.clearCookie("userRole");
  res.clearCookie("username");

  res.status(200).json({ message: "Logged out" });
});

app.post("/admin-change-password", async (req, res) => {
  const { user_id, newPassword } = req.body;
  if (!user_id || !newPassword) {
    return res.status(400).json({ message: "Missing user_id or newPassword" });
  }

  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/change-password", async (req, res) => {
  const username = req.cookies.username;
  const { existingPassword, newPassword } = req.body;
  if (!username || !newPassword) {
    return res
      .status(400)
      .json({ message: "Username and new password are required" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.password !== existingPassword) {
      return res
        .status(400)
        .json({ message: "Existing password is incorrect" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "success" });
  } catch (err) {
    console.error("Error changing password:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// delete
app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Institute schema CRUD

//post
app.post("/api/institutes", auth, async (req, res) => {
  try {
    const inst = await Institute.findOne({
      instituteCode: req.body.instituteCode,
    });
    console.log("Received institute data:", req.body);
    if (inst) {
      return res.status(400).json({ error: "Institute already exists" });
    }
    const newInstitute = new Institute(req.body);
    const savedInstitute = await newInstitute.save();
    res.status(201).json(savedInstitute);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/institutes", async (req, res) => {
  try {
    const name = req.query.name;
    const institute = await Institute.find({ name });
    res.json(institute);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//get all institues
app.get("/institutes", async (req, res) => {
  try {
    const institutes = await Institute.find().populate("classes");
    res.json(institutes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//get institute by id
app.get("/institutes/:id", async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id).populate(
      "classes"
    );
    if (!institute)
      return res.status(404).json({ error: "Institute not found" });
    res.json(institute);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//put institute by id
app.put("/institutes/:id", async (req, res) => {
  try {
    const updatedInstitute = await Institute.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedInstitute)
      return res.status(404).json({ error: "Institute not found" });
    res.json(updatedInstitute);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//delete institute
app.delete("/institutes/:id", async (req, res) => {
  try {
    const deletedInstitute = await Institute.findByIdAndDelete(req.params.id);
    if (!deletedInstitute)
      return res.status(404).json({ error: "Institute not found" });
    res.json({ message: "Institute deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Classes Schema CRUD

//post
app.post("/classes", async (req, res) => {
  try {
    const newClass = new Class({
      className: req.body.className,
      year: req.body.year,
      section: req.body.section,
      institute: req.body.institute, // ✅ Required and must be ObjectId
    });
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    console.error(err); // ✅ Check this for message
    res.status(400).json({ error: err.message });
  }
});

//get classes
app.get("/classes", async (req, res) => {
  try {
    const classes = await Class.find().populate("classTeacher", "name role");
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/classes/:id", async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)
      .populate("students", "name rollNo")
      .populate("classTeacher", "name");
    if (!classObj) return res.status(404).json({ error: "Class not found" });
    res.json(classObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backend route: GET /api/class-students/:classId
app.get("/api/class-students/:classId", async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.classId).populate({
      path: "students",
      select: "name rollNo",
    });

    if (!classObj) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json(classObj.students);
  } catch (err) {
    console.error("Failed to get class students:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/current-user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("institution");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      institution: user.institution,
    });
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//put class by id
app.put("/classes/:id", async (req, res) => {
  try {
    await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const populatedClass = await Class.findById(req.params.id).populate(
      "classTeacher",
      "name role"
    );

    if (!populatedClass)
      return res.status(404).json({ error: "Class not found" });
    res.json(populatedClass);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/classes/institute/:instituteId", async (req, res) => {
  try {
    const classes = await Class.find({
      institute: req.params.instituteId,
    }).populate("classTeacher", "name");
    res.json(classes);
  } catch (err) {
    console.error("Error fetching classes:", err); // ✅ See what error occurs
    res.status(500).json({ error: "Internal server error" });
  }
});

// delete class by id
app.delete("/classes/:id", async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass)
      return res.status(404).json({ error: "Class not found" });
    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log("started the server"));
