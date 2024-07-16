const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mmdewqm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // all database collection here

    const userCollection = client.db("mobile_banking").collection("users");

    //   all the routes here
    app.post("/registration", async (req, res) => {
      let { email, name, pin, phoneNumber, role } = req.body;
      let user = await userCollection.findOne({
        $or: [{ email }, { phoneNumber }],
      });
      if (user) {
        return res.send({ message: "User Already Exist", insertedId: null });
      }

      // Check if there are any users in the database
      const users = await userCollection.find().toArray();
      let userRole = role || "user";

      // If no users exist, the first user becomes admin
      if (users.length === 0) {
        userRole = "admin";
      }
      const salt = bcrypt.genSaltSync(10);
      const password = bcrypt.hashSync(pin, salt);

      const newUser = {
        name,
        email,
        phoneNumber,
        pin: password,
        role,
        balance: 0,
      };
      console.log(newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(newUser);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Mobile Banking runnig here");
});
app.listen(port, (req, res) => {
  console.log(`server running on port ${port}`);
});

// 221457
// mobile_banking
