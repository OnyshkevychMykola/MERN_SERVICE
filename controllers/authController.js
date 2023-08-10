const userDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data
  }
};

const fsPromises = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const handleLogin = async (req, res) => {
  const {user, pass} = req.body;
  if (!user || !pass) return res.status(400).json({
    'message':
      'Username and pass are required'
  });
  const foundUser = userDB.users.find(person => person.username === user);
  if (!foundUser) return res.sendStatus(401);
  const match = await bcrypt.compare(pass, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles);
    const accessToken = jwt.sign({
        "UserInfo": {
          "username": foundUser.username,
          "roles": roles,
        }
      }, process.env.ACCESS_TOKEN_SECRET,
      {expiresIn: '300s'}
    );

    const refreshToken = jwt.sign({
        "username": foundUser.username
      }, process.env.REFRESH_TOKEN_SECRET,
      {expiresIn: '1d'}
    );
    const otherUsers = userDB.users
      .filter(person => person.username !== foundUser.username);
    const currentUser = {...foundUser, refreshToken};
    userDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
      path.join(__dirname, '..', 'model', 'users.json'),
      JSON.stringify(userDB.users)
    )
    res.cookie('jwt', refreshToken,
      {
        httpOnly: true, sameSite: 'None',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000
      });
    res.json({accessToken});
  } else {
    res.sendStatus(401);
  }
}

module.exports = {handleLogin}
