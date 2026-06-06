const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const usersFile = "users.json";
const ordersFile = "orders.json";

function readJson(file) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]");
  }

  const data = fs.readFileSync(file, "utf8");

  if (!data.trim()) {
    return [];
  }

  return JSON.parse(data);
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.get("/", function (req, res) {
  res.send("Backend ElectroShop DZ fonctionne !");
});

app.post("/signup", function (req, res) {
  const users = readJson(usersFile);
  const newUser = req.body;

  const existingUser = users.find(function (user) {
    return user.email === newUser.email;
  });

  if (existingUser) {
    return res.json({
      success: false,
      message: "Cet email existe déjà."
    });
  }

  users.push(newUser);
  writeJson(usersFile, users);

  res.json({
    success: true,
    message: "Compte créé avec succès."
  });
});

app.post("/login", function (req, res) {
  const users = readJson(usersFile);
  const email = req.body.email;
  const password = req.body.password;

  const user = users.find(function (u) {
    return u.email === email && u.password === password;
  });

  if (!user) {
    return res.json({
      success: false,
      message: "Email ou mot de passe incorrect."
    });
  }

  res.json({
    success: true,
    message: "Connexion réussie.",
    user: user
  });
});

app.post("/orders", function (req, res) {
  console.log("ORDER RECEIVED:", req.body);

  const orders = readJson(ordersFile);

  const newOrder = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    customer: req.body.customer,
    cart: req.body.cart,
    total: req.body.total
  };

  orders.push(newOrder);
  writeJson(ordersFile, orders);

  res.json({
    success: true,
    message: "Commande enregistrée avec succès.",
    order: newOrder
  });
});

app.listen(PORT, function () {
  console.log("Server running on http://localhost:" + PORT);
});