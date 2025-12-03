const express = require("express");
const path = require("path");

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

app.get("/treneri", (req, res) => {
  const treneri = [
    { name: "Ján Novák", specialization: "Silový tréning" },
    { name: "Peter Horák", specialization: "Kondičný tréning" },
    { name: "Marek Kováč", specialization: "Crossfit" },
  ];

  res.render("treneri", {
    title: "Tréneri",
    treneri,
  });
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
