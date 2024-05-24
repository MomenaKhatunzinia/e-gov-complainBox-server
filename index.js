const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/newUploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadFile = multer({ storage: storage });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbConnect = async () => {
  try {
    await client.connect();
    console.log("DB Connected Successfully✅");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

const ComplainCollection = client.db("ComplainBox").collection("complainBox");

app.post("/uploaded", uploadFile.single("picture"), async (req, res) => {
  console.log("File uploaded");
  console.log(req.file);
  res.send("File uploaded");
});

app.post("/Complains", uploadFile.single("file"), async (req, res) => {
  try {
    const addComplain = req.body;
    console.log("Received complaint data:", addComplain);
    console.log("Received file:", req.file);

    if (req.file) {
      console.log("Received file:", req.file);
      addComplain.file = {
        originalname: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        image: req.file.path,
        buffer: req.file.buffer,
        imageUri: `http://localhost:${port}/newUploads/${req.file.filename}`,
      };
    }

    addComplain.upVote = 0;
    addComplain.downVote = 0;

    const result = await ComplainCollection.insertOne(addComplain);
    console.log("Insert result:", result);

    res.send(result);
  } catch (error) {
    console.error("Error inserting complaint:", error);
    res.status(500).send({ message: "An error occurred while adding the complaint." });
  }
});

app.get("/Updatecomplains/:_id", async (req, res) => {
  const _id = req.params._id;

  const query = { _id: new ObjectId(_id) };

  try {
    console.log("Query:", query);

    const result = await ComplainCollection.findOne(query);

    console.log("Result:", result);

    if (!result) {
      return res.status(404).send({ message: "No complaints found with this ID." });
    }

    res.send(result);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).send({ message: "An error occurred while fetching the complaint." });
  }
});

app.put("/Complains/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updatedcomplain = req.body;
  const complain = {
    $set: {
      description: updatedcomplain.description,
      level: updatedcomplain.level,
    },
  };
  try {
    const result = await ComplainCollection.updateOne(filter, complain, options);
    res.send(result);
  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).send({ message: "An error occurred while updating the complaint." });
  }
});

//Delete Complain
app.delete("/DeleteComplains/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const query = { _id: new ObjectId(id) };
    const result = await ComplainCollection.deleteOne(query);

    if (result.deletedCount === 1) {
      res.send({ message: "Complaint successfully deleted." });
    } else {
      res.status(404).send({ message: "Complaint not found." });
    }
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).send({ message: "An error occurred while deleting the complaint." });
  }
});


// up and down vote
app.put('/complain/upvote/:id', async (req, res) => {
  const { id } = req.params;
  const { increment } = req.body;
  
  try {
    const result = await ComplainCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { upVote: increment } }
    );
    res.send(result);
  } catch (error) {
    console.error('Error updating upvote count:', error);
    res.status(500).send({ message: 'Error updating upvote count' });
  }
});

// Downvote route
app.put('/complain/downvote/:id', async (req, res) => {
  const { id } = req.params;
  const { increment } = req.body;
  
  try {
    const result = await ComplainCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { downVote: increment } }
    );
    res.send(result);
  } catch (error) {
    console.error('Error updating downvote count:', error);
    res.status(500).send({ message: 'Error updating downvote count' });
  }
});


app.get("/Complains", async (req, res) => {
  try {
    const cursor = ComplainCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).send({ message: "An error occurred while fetching the complaints." });
  }
});

app.get("/complains/:email", async (req, res) => {
  const email = req.params.email;

  const query = { email: email };

  try {
    console.log("Query:", query);

    const results = await ComplainCollection.find(query).toArray();

    console.log("Results:", results);

    if (results.length === 0) {
      return res.status(404).send({ message: "No complaints found for this email." });
    }

    res.send(results);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).send({ message: "An error occurred while fetching the complaints." });
  }
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
