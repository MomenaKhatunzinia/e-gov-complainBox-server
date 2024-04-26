const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require ('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
// kxJGmOqAfFgsnlDA
// e-gov-complainBox
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://e-gov-complainBox:kxJGmOqAfFgsnlDA@cluster0.lhomilp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  const dbConnect = async () => {
    try {
      client.connect()
      console.log('DB Connected Successfully✅')
    } catch (error) {
      console.log(error.name, error.message)
    }
  }
  dbConnect()

  const ComplainCollection = client.db("ComplainBox").collection('complainBox')

  app.post('/Complains', async(req, res)=>
  {
    const addComplain = req.body;
    console.log(addComplain)
    const result = await ComplainCollection.insertOne(addComplain);
    res.send(result);
  })

  app.get('/Complains', async(req, res)=>
  {
    const cursor = ComplainCollection.find();
    const result = await cursor.toArray();
    res.send(result);

  })
  
  app.post('/Complains', async(req, res)=>
  {
    const addComplain = req.body;
    console.log(addComplain)
    const result = await ComplainCollection.insertOne(addComplain);
    res.send(result);
  })

  app.get('/Complains', async(req, res)=>
  {
    const cursor = ComplainCollection.find();
    const result = await cursor.toArray();
    res.send(result);

  })



  app.listen(port, () => {
    console.log(`running ${ port }`)
  })
