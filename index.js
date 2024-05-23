const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbConnect = async () => {
  try {
    await client.connect();
    console.log('DB Connected Successfully✅');
  } catch (error) {
    console.log(error.name, error.message);
  }
}
dbConnect();

const ComplainCollection = client.db("ComplainBox").collection('complainBox');

app.post('/Complains', upload.single('file'), async (req, res) => {
  try {
    const addComplain = req.body;
    console.log('Received complaint data:', addComplain);

    if (req.file) {
      console.log('Received file:', req.file);
      addComplain.file = {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        buffer: req.file.buffer
      };
    }

    const result = await ComplainCollection.insertOne(addComplain);
    console.log('Insert result:', result);

    res.send(result);
  } catch (error) {
    console.error('Error inserting complaint:', error);
    res.status(500).send({ message: 'An error occurred while adding the complaint.' });
  }
});

app.get('/Complains', async (req, res) => {
  try {
    const cursor = ComplainCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).send({ message: 'An error occurred while fetching the complaints.' });
  }
});

app.get('/complains/:email', async (req, res) => {
  const email = req.params.email;

  const query = { email: email };

  try {
    console.log('Query:', query);

    const results = await ComplainCollection.find(query).toArray();
    
    console.log('Results:', results);

    if (results.length === 0) {
      return res.status(404).send({ message: 'No complaints found for this email.' });
    }

    res.send(results);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).send({ message: 'An error occurred while fetching the complaints.' });
  }
});


app.listen(port, () => {
  console.log(`running on port ${port}`);
});
