const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const reportsCollection = client.db('adventureBiker').collection('reports');


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


    app.get('/products', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const result = await productsCollection.find(query).toArray()
      res.send(result)
    })


    // Delete my product by a seller
    app.delete('/myProducts/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: ObjectId(id) }
      const result = await productsCollection.deleteOne(filter)
      res.send(result)
    })


    // Load category products for dynamic route
    app.get('/products/:type', async (req, res) => {
      const type = req.params.type;
      const query = { bikeType: type }
      const result = await productsCollection.find(query).toArray()
      res.send(result)
    })


    //report to admin
    app.post('/reports', async (req, res) => {
      const reportData = req.body;
      const result = await reportsCollection.insertOne(reportData)
      res.send(result)
    })


    // get reported data and send to client
    app.get('/reportedProducts', async (req, res) => {
      const query = {}
      const result = await reportsCollection.find(query).toArray()
      res.send(result)
    })


    // Delete product from Reported Products
    app.delete('/reportedProducts/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: ObjectId(id) }
      const result = await reportsCollection.deleteOne(filter)
      res.send(result)
    })


    // Save User Info by Post Method
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result)
    })


    // Delete Buyer and Seller
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: ObjectId(id) }
      const result = await usersCollection.deleteOne(filter)
      res.send(result)
    })



    app.put('/verifySeller/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email }
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          isVerified: 'true'
        }
      }

      const result = await usersCollection.updateOne(filter, updatedDoc, options)

      const updateProduct = await productsCollection.updateMany(filter, updatedDoc, options)

      res.send(result)
    })



    // Load All Seller and Buyer 
    app.get('/users/:role', async (req, res) => {
      const role = req.params.role;
      const query = { role: role }
      const result = await usersCollection.find(query).toArray()
      res.send(result)
    })

    // API for Buyer Route
    app.get('/users/buyer/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query)
      res.send({ isBuyer: user?.role === 'buyer' })
    })


    // API for Admin Route
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query)
      res.send({ isAdmin: user?.role === 'admin' })
    })


    // API for Seller Route
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