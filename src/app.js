const express = require("express");
const path = require("path");
const db = require("./db"); 

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
  
app.get("/", (req, res) => {
  const nadchadzajuceTreningy = [
    { nazov: "Silový tréning", den: "Pondelok", cas: "18:00" },
    { nazov: "HIIT tréning", den: "Streda", cas: "19:00" },
    { nazov: "Full body", den: "Piatok", cas: "17:00" },
  ];

  res.render("index", {
    title: "Domov",
    treningy: nadchadzajuceTreningy,
  });
});

// Formulár pre nového trénera
app.get("/treneri/novy", (req, res) => {
  res.render("treneri-new", {
    title: "Nový tréner",
    errors: [],
    formData: {}
  });
});


app.get("/treneri", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, specialization FROM trainers"
    );

    res.render("treneri", {
      title: "Tréneri",
      treneri: rows,
    });
  } catch (err) {
    console.error("Chyba pri nacitani trenerov z DB:", err);
    res.status(500).send("Chyba servera pri nacitani trenerov");
  }
});

// Spracovanie formulára - vytvorenie trénera
app.post("/treneri/novy", async (req, res) => {
  const { name, specialization } = req.body;

  const errors = [];
  if (!name || !name.trim()) {
    errors.push("Meno je povinné");
  }
  if (!specialization || !specialization.trim()) {
    errors.push("Špecializácia je povinná");
  }

  if (errors.length > 0) {
    return res.render("treneri-novy", {
      title: "Nový tréner",
      errors,
      formData: { name, specialization }
    });
  }

  try {
    await db.query(
      "INSERT INTO trainers (name, specialization) VALUES (?, ?)",
      [name.trim(), specialization.trim()]
    );

    // po úspešnom uložení presmeruj na zoznam trénerov
    res.redirect("/treneri");
  } catch (err) {
    console.error("Chyba pri ukladani trenera:", err);
    res.status(500).send("Chyba servera pri vytvarani trenera");
  }
});

app.get("/rezervacie", (req, res) => {
  const rezervacie = [
    { event: "Skupinový tréning", date: "2025-01-10", time: "18:00" },
    { event: "Individuálny tréning", date: "2025-01-12", time: "16:30" },
  ];

  res.render("rezervacie", {
    title: "Moje rezervácie",
    rezervacie,
  });
});

app.listen(PORT, () => {
  console.log(`Server beží na http://localhost:${PORT}`);
});
