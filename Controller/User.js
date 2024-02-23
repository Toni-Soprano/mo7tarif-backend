const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const imageDefault = "ea812f86f71070e6ec6d21a3a0be8328.png";

/******************************************************************RegistreUser*******************************************************************************/
const RegistreUser = async (req, res) => {
  const { nom, prenom, email, mdp, tel, date_naissance, genre } = req.body;
  const image = req.file ? req.file.filename : imageDefault;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(201).json({ msg: "Utilisateur existe" });
    }
    const hashedPassword = await bcrypt.hash(mdp, 10);
    const newUser = new User({  
      nom,
      prenom,
      email: email.toLowerCase(),
      tel,
      date_naissance,
      genre,
      image,
      mdp: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ msg: "ok", user: newUser });
  } catch (error) {
    res.status(201).json({
      msg: "Erreur lors de la création de l'utilisateur",
      error: error,
    });
  }
};
/******************************************************************LoginUser*******************************************************************************/

const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(201).json({ msg: "Utilisateur non trouvé" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.mdp);

    if (!isPasswordValid) {
      return res.status(201).json({ msg: "Mot de passe incorrect" });
    }

    const token = jwt.sign({ userId: user._id }, "votre-secret-key", {
      expiresIn: "1h",
    });

    res.status(201).json({ msg: "ok", token, user });
  } catch (error) {
    res.status(201).json({ msg: "Erreur lors de la connexion", error });
  }
};

/******************************************************************GetAllUsers*******************************************************************************/

const GetAllUsers = async (req, res) => {
  try {
    const users = await User.find({});

    res.status(201).send({ results: users, msg: "ok" });
  } catch (error) {
    res.status(500).send({ msg: "Erreur lors de la récupération des données" });
  }
};

/******************************************************************GetSignleUser*******************************************************************************/

const GetSingleUser = async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findOne({ _id: userId });
    if (user) {
      res.status(201).send({ msg: "ok", user: user });
    }
  } catch (err) {
    res.status(500).send({ msg: "Erreur", err });
  }
};

/******************************************************************BlockUser*******************************************************************************/
const BlockUser = async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { is_blocked: 1 },
      { new: true }
    );

    if (user) {
      res.status(201).send({ msg: "ok", user });
    } else {
      res.status(404).send({ msg: "Utilisateur non trouvé" });
    }
  } catch (err) {
    res
      .status(500)
      .send({ msg: "Erreur lors du blocage de l'utilisateur", err });
  }
};

/******************************************************************UpdateUser*******************************************************************************/

const UpdateUser = async (req, res) => {
  const { nom, prenom, date_naissance, genre, email, tel, idUser } = req.body;

  try {
    const user = await User.findOne({ _id: idUser });

    if (!user) {
      return res.status(200).json({ msg: "User non trouvé" });
    }

    user.nom = nom;
    user.prenom = prenom;
    user.date_naissance = date_naissance;
    user.genre = genre;
    user.email = email;
    user.tel = tel;

    await user.save();

    res.status(200).json({ msg: "ok", user: user });
  } catch (error) {
    res.status(200).json({
      msg: "Erreur lors de la mise à jour du utilisateur",
      error: error,
    });
    console.log(error);
  }
};

/******************************************************************DeBlockUser*******************************************************************************/

const DeBlockUser = async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { is_blocked: 0 },
      { new: true }
    );

    if (user) {
      res.status(201).send({ msg: "ok", user });
    } else {
      res.status(404).send({ msg: "Utilisateur non trouvé" });
    }
  } catch (err) {
    res
      .status(500)
      .send({ msg: "Erreur lors du Déblocage de l'utilisateur", err });
  }
};
/******************************************************************changePassword*******************************************************************************/

const changePassword = async (req, res) => {
  const { idUser, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(idUser);

    if (!user) {
      return res.status(201).json({ msg: "Utilisateur non trouvé" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.mdp);

    if (!isPasswordValid) {
      return res.status(201).json({ msg: "Mot de passe ancien incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.mdp = hashedNewPassword;
    await user.save();

    res.status(200).json({ msg: "ok" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Erreur lors du changement de mot de passe", error });
  }
};

module.exports = {
  GetAllUsers,
  RegistreUser,
  Login,
  GetSingleUser,
  BlockUser,
  DeBlockUser,
  UpdateUser,
  changePassword,
};
