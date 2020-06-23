class User {
  constructor(username, password, avatarImg, statement) {
    this.username = username;
    this.password = password;
    this.img = avatarImg;
    this.status = statement;
  }
}

module.exports = User;
