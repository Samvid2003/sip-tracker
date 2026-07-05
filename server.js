const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


function readData() {
  try {
    const rawData = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(rawData);
  } catch (error) {
    return {
      sipData: [],
      taskData: []
    };
  }
}


function writeData(data) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}


// =====================================================
// SIP ENTRIES
// =====================================================


// Get all SIP entries

app.get("/api/sip", (req, res) => {
  const data = readData();

  res.json(data.sipData);
});


// Add new SIP entry

app.post("/api/sip", (req, res) => {
  const data = readData();

  const newEntry = {
    id: crypto.randomUUID(),
    ...req.body
  };

  data.sipData.push(newEntry);

  writeData(data);

  res.json({
    success: true,
    entry: newEntry
  });
});


// Update SIP entry

app.put("/api/sip/:id", (req, res) => {
  const data = readData();

  const index = data.sipData.findIndex(
    item => item.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Entry not found"
    });
  }

  data.sipData[index] = {
    ...req.body,
    id: req.params.id
  };

  writeData(data);

  res.json({
    success: true
  });
});


// Delete SIP entry

app.delete("/api/sip/:id", (req, res) => {
  const data = readData();

  const index = data.sipData.findIndex(
    item => item.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Entry not found"
    });
  }

  data.sipData.splice(index, 1);

  writeData(data);

  res.json({
    success: true
  });
});


// Toggle single applied checkbox

app.patch("/api/sip/:id/applied", (req, res) => {
  const data = readData();

  const entry = data.sipData.find(
    item => item.id === req.params.id
  );

  if (!entry) {
    return res.status(404).json({
      error: "Entry not found"
    });
  }

  entry.applied = !entry.applied;

  writeData(data);

  res.json({
    success: true
  });
});


// Toggle individual form checkbox

app.patch(
  "/api/sip/:id/forms/:formIndex",
  (req, res) => {

    const data = readData();

    const entry = data.sipData.find(
      item => item.id === req.params.id
    );

    const formIndex = Number(
      req.params.formIndex
    );

    if (
      !entry ||
      !entry.forms ||
      !entry.forms[formIndex]
    ) {
      return res.status(404).json({
        error: "Form not found"
      });
    }

    entry.forms[formIndex].checked =
      !entry.forms[formIndex].checked;

    writeData(data);

    res.json({
      success: true
    });
  }
);


// =====================================================
// TASKS
// =====================================================


// Get all tasks

app.get("/api/tasks", (req, res) => {
  const data = readData();

  const sortedTasks = [...data.taskData].sort(
    (a, b) =>
      new Date(a.deadline) -
      new Date(b.deadline)
  );

  res.json(sortedTasks);
});


// Add task

app.post("/api/tasks", (req, res) => {
  const data = readData();

  const newTask = {
    id: crypto.randomUUID(),
    ...req.body
  };

  data.taskData.push(newTask);

  writeData(data);

  res.json({
    success: true,
    task: newTask
  });
});


// Delete task

app.delete("/api/tasks/:id", (req, res) => {
  const data = readData();

  const index = data.taskData.findIndex(
    task => task.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Task not found"
    });
  }

  data.taskData.splice(index, 1);

  writeData(data);

  res.json({
    success: true
  });
});


// =====================================================
// ALL DATA FOR EXCEL EXPORT
// =====================================================

app.get("/api/all-data", (req, res) => {
  const data = readData();

  res.json(data);
});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `SIP Tracker running on port ${PORT}`
  );
});
