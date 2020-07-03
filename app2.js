let express = require('express');
let mongoose = require('mongoose')
let bcrypt = require('bcrypt')
let jwt = require("jsonwebtoken");
let cors = require('cors')
const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
  res.send('Welcome to Mylogin MongoDB </br> router to </br> [GET] /users</br>[POST] /register</br> [POST] /login')
});

mongoose.connect('mongodb://localhost:27017/node-passport', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
//create database schema
const Schema = mongoose.Schema
const userSchema = new Schema({
  name: String,
  username: {
    type: String,
    unique: true
  },
  password: String
})
const UserModel = mongoose.model('User', userSchema)
//add data in database
// const username = new UserModel({
//   name: 'naratip',
//   username: "kengzas1253",
//   password:"kengzaseven1253;"
// });
// username.save().then(() => console.log('write data in database'))
// Query
app.get('/users', (req, res) => {
  UserModel.find({})
    .then((users) => res.json(users))
    .catch((error) =>
      res.status(400).json({ message: 'something went wrong!' })
    );
});
// Query param
app.get('/users/:id', (req, res) => {
  const { id } = req.params;

  UserModel.findById(id)
    .then((data) => res.json(data || {}))
    .catch((error) => res.status(400).json({ masage: 'no data' }));
});

app.post('/register', async (req, res) => {
  const { name, username, password } = req.body;
  //check username in database
  const checkUser = await UserModel.findOne({ username })
  //no account
  if (!checkUser) {
    const passwordHash = bcrypt.hashSync(password, 10)
    const userdata = new UserModel({
      name, username, password: passwordHash
    });
    await userdata.save()
    res.json({ masage: 'save in database' })
  }
  //have account
  else if (checkUser) {
    res.json({ masage: 'This account is already used.' })
  }

});

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await UserModel.findOne({
    username
  })
  if (user) {
    const isCorrect = bcrypt.compareSync(password, user.password)
    if (isCorrect) {
      UserModel.find({ username })
        .then((users) => jwt.sign({ users }, 'secretkey', { expiresIn: '240s' }, (err, token) => {
          res.json({ users, token });
        }))
        .catch((error) => res.status(400).json({ masage: 'no data' }));
    }
    else if (!isCorrect) {
      res.json({ masage: 'Email or Password incorrect' })
    }
  }
  else if (!user) {
    res.json({ masage: 'Username does not exist.' })
  }
})

app.use("*", (req, res) => res.status(404).send('404 Not found'));
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log("server is start PORT:", PORT)
})




