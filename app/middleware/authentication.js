const userModel =  require('../models/users.model');

exports.setToken = async function (req, res, next) {
  const userToken = req.header('X-Authorization');
  try {
      const foundUser = await userModel.findUserToken(userToken);
      if (foundUser === null) {
        res.statusMessage = "Unauthorized wrong token";
        res.status(401).send();
      } else{
        req.currentId = foundUser[0].user_id.toString();
        next();
      }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
};
