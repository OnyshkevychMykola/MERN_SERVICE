const userDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data
  }
};

const fsPromises = require('fs').promises;
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
  const {user, pass} = req.body;
  if( !user || !pass) return res.status(400).json({'message': 'Username and pass are required'});
  const duplicate = userDB.users.find(person => person.username === user);
  if (duplicate) return res.sendStatus(409);
  try {
      const hashedPass = await bcrypt.hash(pass, 10);
      const newUser = {
        'username': user,
        'password': hashedPass,
        'roles': {"User":2001},
      };
      userDB.setUsers([...userDB.users, newUser]);
      await fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'),
        JSON.stringify(userDB.users)
      );
    console.log(userDB.users);
    res.status(201).json({'success': `User ${user} was created`});
  } catch (err) {
    res.status(500).json({'message': err.message});
  }
}
module.exports = { handleNewUser };
