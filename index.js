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
    const productsCollection = client.db('adventureBiker').collection('products');
    const ordersCollection = client.db('adventureBiker').collection('bookings');


    // Load category Items for Home Page
    app.get('/categories', async (req, res) => {
      const query = {}
      const categories = await categoriesCollection.find(query).toArray()
      res.send(categories)
    })


    // Add product from client and store to db
    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product)
      res.send(result)
    })


    // Load category products for dynamic route
    app.get('/products/:type', async (req, res) => {
      const type = req.params.type;
      const query = { bikeType: type }
      const result = await productsCollection.find(query).toArray()
      res.send(result)
    })


    // Save User Info by Post Method
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result)
    })


    // Load All Seller
    app.get('/users/:role', async (req, res) => {
      const role = req.params.role;
      const query = { role: role }
      const result = await usersCollection.find(query).toArray()
      res.send(result)
    })


    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query)
      res.send({ isAdmin: user?.role === 'admin' })
    })



    app.get('/users/seller/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query)
      res.send({ isSeller: user?.role === 'seller' })
    })


    // Save Booking data by user into bookings Collection
    app.post('/bookings', async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order)
      res.send(result)
    })


    // Get Booking Data from Database and send it to client
    app.get('/bookings', async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const result = await ordersCollection.find(query).toArray()
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