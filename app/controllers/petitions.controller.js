const petitionsModel = require('../models/petitions.model');
const passwords = require('../service/password');
const camelcaseKeys = require('camelcase-keys');

const humps = require('humps');
exports.toUnderscoreCase = function (object) {
    return humps.decamelizeKeys(object);
};

function checkEmpty(input){
    if (!input){
        return false;
    }else{
        //input empty || only white-space || null
        return (input.length === 0 || !input.trim() || !input);
    }
}


exports.getPetition = async function (req, res) {
  try {
    const petition = await petitionsModel.getPetition(req.params.id);
    if (petition){
      res.statusMessage = 'OK';
      res.status(200).json(petition);
    } else {
      res.statusMessage = 'Not Found';
      res.status(404).send();
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
}


exports.patchPetition = async function (req, res){
  const petitionFound = await petitionsModel.getPetition(req.params.id);
  const categoriesDB = await petitionsModel.categories();
  const categories = categoriesDB[0];
  if (!petitionFound){
    res.statusMessage = 'Not Found';
    res.status(404).send();
    return;
  }

  if ('categoryId' in req.body){
    if (!categories.find(element => element.category_id == req.body.categoryId)) {
      res.statusMessage = "Bad Request";
      res.status(400).send();
      return;
    }
  }


  if (petitionFound.authorId == req.currentId){
    try {
          await petitionsModel.patchPetition(req.body, req.params.id);
          res.statusMessage = 'OK';
          res.status(200).send();
          return;
      } catch (err) {
          res.statusMessage = 'Internal Server Error';
          res.status(500).send();
      }
  }
  else{
    res.statusMessage = 'Forbidden';
    res.status(403).send();
    return;
  }
};



exports.deletePetition = async function (req, res) {
  const petitionFound = await petitionsModel.getPetition(req.params.id);
  if (!petitionFound){
    res.statusMessage = 'Not Found';
    res.status(404).send();
    return;
  }

  if (!req.currentId){
    res.statusMessage = 'Unauthorized';
    res.status(401).send();
    return;
  }

  if (petitionFound.authorId !== req.currentId){
    res.statusMessage = 'Forbidden';
    res.status(403).send();
    return;
  }



  else{
    try{
      await petitionsModel.deletePetition(req.params.id);
      res.statusMessage = 'OK';
      res.status(200).send();
      return;
    }catch(err){
      res.statusMessage = 'Internal Server Error';
      res.status(500).send();
      return;
    }
  }
};


/*list all petitions come back later


exports.viewPetitions = async function (req, res){


};


*/

exports.postPetition = async function (req, res) {
  if (!('title' in req.body) || checkEmpty(req.body.title)){
    res.statusMessage = "Bad Request title";
    res.status(400).send();
  }

  const today = new Date();
  const closingDate = new Date(req.body.closingDate)
  if (closingDate < today){
    res.statusMessage = "Bad Request Date";
    res.status(400).send();
    return;
  }

  const categoriesDB = await petitionsModel.categories();
  const categories = categoriesDB[0];
  if (!categories.find(element => element.category_id == req.body.categoryId)) {
    res.statusMessage = "Bad Request";
    res.status(400).send();
    return;
  }else{
    try {
      const petitionId = await petitionsModel.postPetition(req.body, req.currentId);
      res.statusMessage = 'Created';
      res.status(201).json({petitionId});
    } catch(err){
      res.statusMessage = 'Internal Server Error';
      res.status(500).send();
    }
  }

};


exports.getCategories = async function (req, res){
  try{
    const categoriesRaw = await petitionsModel.categories();
    const categories = categoriesRaw[0].map(category => camelcaseKeys(category));

    res.statusMessage = 'OK';
    res.status(200).json(categories);

  }catch(err){
    throw err;
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
};


exports.getPetitionPhoto = async function (req, res){
  try {
    const photo = await petitionsModel.getPetitionPhoto(req.params.id);
    if (!photo){
      res.statusMessage = 'Not Found';
      res.status(404).send();
    } else{
      res.statusMessage = 'OK';
      res.status(200).contentType(photo.mimeType).send(photo.fileName);
    }
  }catch(err){
    res.status(500).send();
  }
};
