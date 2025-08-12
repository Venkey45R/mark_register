import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Student from "./models/Student.js";
import User from "./models/User.js";
import Institute from "./models/Institute.js";
import Class from "./models/Classes.js";
import cookieParser from "cookie-parser";
import { UAParser } from "ua-parser-js";
import { v4 as uuidv4 } from "uuid";
import Log from "./models/Logs.js";
import Visitor from "./models/visitors.js";

function parseUserAgent(userAgent) {
  const parser = new UAParser(userAgent);
  const os = parser.getOS().name || "Unknown OS";
  const browser = parser.getBrowser().name || "Unknown Browser";
  return { os, browser };
}

dotenv.config();

const app = express();

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

app.post("/api/upload", async (req, res) => {
  const { students, classId } = req.body;
  if (!classId || !students?.length) {
    return res.status(400).json({ message: "Missing data" });
  }

  try {
    await Promise.all(
      students.map(async (student) => {
        const existingStudent = await Student.findOne({
          rollNo: student.rollNo,
        });

        const newExam = {
          ExamName: student.exam.examName,
          ExamData: student.exam,
        };

        if (!existingStudent) {
          const newStudent = await Student.create({
            rollNo: student.rollNo,
            name: student.name,
            institute: student.exam.institute, // optional
            class: classId,
            exams: [newExam],
          });

          // Push student to class
          await Class.findByIdAndUpdate(classId, {
            $addToSet: { students: newStudent._id },
          });
        } else {
          const examIndex = existingStudent.exams.findIndex(
            (exam) => exam.ExamName === student.exam.examName
          );

          if (examIndex !== -1) {
            existingStudent.exams[examIndex] = newExam;
          } else {
            existingStudent.exams.push(newExam);
          }

          await existingStudent.save();

          // Also ensure they're part of this class
          await Class.findByIdAndUpdate(classId, {
            $addToSet: { students: existingStudent._id },
          });
        }
      })
    );

    res.status(200).json({ message: "Upload successful" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error during upload" });
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

// app.post('/api/signup', async (req, res) =>{
//   const {username, password, name, institution, role} = req.body.formData;
//   try{
//     const existingUser = await User.findOne({ username});
//     if(existingUser){
//       return res.status(400).json({message: "username taken"});
//     }
//     else{
//       const newUser = await User.create({
//         username, password, name, institution, role
//       });
//       res.status(201).json({message: "success", user: newUser});
//     }
//   }
//   catch(err){
//     console.log(err);
//     res.status(500).json({message: "server error"});
//   }
// })

app.post("/api/signup", async (req, res) => {
  const { username, password, name, institution, role } = req.body.formData;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "username taken" });
    }

    const newUser = await User.create({
      username,
      password,
      name,
      institution,
      role,
    });

    // 🌐 Log visitor info
    const userAgent = req.headers["user-agent"];
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const { os, browser } = parseUserAgent(userAgent);
    const visitorId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    await Visitor.create({
      visitorId,
      ip,
      os,
      browser,
      url: "/signup",
    });

    res.status(201).json({ message: "success", user: newUser });
  } catch (err) {
    console.log(err);
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

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.password === password) {
      // Set cookies
      res.cookie("userRole", user.role, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie("username", user.username, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      // ✅ Get device & IP info
      const userAgent = req.headers["user-agent"];
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const parser = new UAParser(userAgent);
      const os = parser.getOS().name || "Unknown OS";
      const browser = parser.getBrowser().name || "Unknown Browser";

      // ✅ Save Login Log
      const log = new Log({
        loginId: uuidv4(),
        userId: user._id,
        ip,
        os,
        browser,
        loggedInAt: new Date(),
      });
      await log.save();

      // ✅ Save Visitor
      const visitor = new Visitor({
        visitorId: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        ip,
        os,
        browser,
        url: "/login",
      });
      await visitor.save();

      return res.status(200).json({ message: "success", name: user.name });
    } else {
      return res.status(400).json({ message: "Password incorrect" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});

app.get("/api/getUserRole", (req, res) => {
  const role = req.cookies.userRole;
  res.json({ role });
});

app.get("/api/check-role", (req, res) => {
  const role = req.cookies.userRole;
  if (!role) return res.status(401).json({ message: "Not logged in" });
  res.status(200).json({ role });
});

//Users schema crud:
//post - signup

//get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().populate("institution"); // ✅ add this line
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
        { sort: { createdAt: -1 } } // update the most recent login
      );
    }
  }
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

    user.password = newPassword;
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
    user.password = newPassword;
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
app.post("/institutes", async (req, res) => {
  try {
    const newInstitute = new Institute(req.body);
    const savedInstitute = await newInstitute.save();
    res.status(201).json(savedInstitute);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

app.get("/api/current-user", async (req, res) => {
  try {
    const role = req.cookies.userRole;
    const username = req.cookies.username;

    if (!username || !role)
      return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findOne({ username }).populate("institution");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
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
