import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "db.json");
const port = process.env.PORT || 4000;

const defaultDb = {
  products: [
    { id: "gm-001", title: "Classic Red Bijili", category: "Ground-made", mrp: 240, price: 180, imageUrl: "" },
    { id: "gm-002", title: "Flower Pot Gold", category: "Ground-made", mrp: 420, price: 320, imageUrl: "" },
    { id: "gm-003", title: "Ground Chakkar Deluxe", category: "Ground-made", mrp: 300, price: 240, imageUrl: "" },
    { id: "sf-001", title: "Sivakasi Sky Shot", category: "Sivakasi Fancy", mrp: 950, price: 780, imageUrl: "" },
    { id: "sf-002", title: "Fancy Sparkle Fountain", category: "Sivakasi Fancy", mrp: 700, price: 540, imageUrl: "" }
  ],
  orders: [],
  storeContact: {
    phone: "+91 98765 43210",
    email: "orders@vedikadai.local"
  }
};

function ensureDb() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/products", (_request, response) => {
  response.json(readDb().products);
});

app.put("/api/products", (request, response) => {
  const db = readDb();
  db.products = Array.isArray(request.body) ? request.body : [];
  writeDb(db);
  response.json(db.products);
});

app.get("/api/orders", (_request, response) => {
  response.json(readDb().orders);
});

app.post("/api/orders", (request, response) => {
  const db = readDb();
  const order = { ...request.body, id: request.body.id || `order-${Date.now()}` };
  db.orders = [order, ...db.orders];
  writeDb(db);
  response.status(201).json(order);
});

app.put("/api/orders", (request, response) => {
  const db = readDb();
  db.orders = Array.isArray(request.body) ? request.body : [];
  writeDb(db);
  response.json(db.orders);
});

app.get("/api/contact", (_request, response) => {
  response.json(readDb().storeContact);
});

app.put("/api/contact", (request, response) => {
  const db = readDb();
  db.storeContact = {
    phone: request.body.phone || "",
    email: request.body.email || ""
  };
  writeDb(db);
  response.json(db.storeContact);
});

app.listen(port, () => {
  console.log(`Vedikadai API running on http://localhost:${port}`);
});
