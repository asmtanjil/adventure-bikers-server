const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

// Middle Wares
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aes3u62.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    const usersCollection = client.db('adventureBiker').collection('users');
    const categoriesCollection = client.db('adventureBiker').collection('category');
    const bikesCollection = client.db('adventureBiker').collection('bikes');


    // Load category Items
    app.get('/categories', async (req, res) => {
      const query = {}
      const categories = await categoriesCollection.find(query).toArray()
      res.send(categories)
    })



    // Save User Info by Post Method
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result)
    })

  }
  finally {

  }
}
run().catch(err => console.error(err))


app.get('/', (req, res) => {
  res.send("Bike Server is Running")
})

app.listen(port, () => {
  console.log(`Bike Server is running on port ${port}`)
})