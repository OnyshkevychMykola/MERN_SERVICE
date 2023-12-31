const userDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data
  }
};

const fsPromises = require('fs').promises;
const path = require('path');


const handleLogout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt

  //Is refresh token in db?
  const foundUser = userDB.users.find(person => person.refreshToken === refreshToken);
  if (!foundUser) {
    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true});
    return res.sendStatus(204);
  }
  //delete refresh token
  const otherUsers = userDB.users.filter(p => p.refreshToken !== refreshToken);
  const currentUser = {...foundUser, refreshToken: ''};
  userDB.setUsers([...otherUsers, currentUser]);
  await fsPromises.writeFile(path.join(__dirname, '..', 'model', 'users.json'),
    JSON.stringify(userDB.users)
  );
  res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true});
  res.sendStatus(204);
}

module.exports = {handleLogout}

