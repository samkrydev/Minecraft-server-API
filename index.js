const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let nextServerId = 1;
let nextPlayerId = 1;

const servers = [];
const players = [];

function findServer(id) {
  return servers.find((s) => s.id === Number(id));
}

function findPlayer(id) {
  return players.find((p) => p.id === Number(id));
}

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Minecraft Server API is running" });
});

app.get("/servers", (req, res) => {
  res.json(servers);
});

app.get("/servers/:id", (req, res) => {
  const server = findServer(req.params.id);
  if (!server) return res.status(404).json({ error: "Server not found" });
  res.json(server);
});

app.post("/servers", (req, res) => {
  const { name, ip, port, description } = req.body;
  if (!name || !ip)
    return res.status(400).json({ error: "name and ip are required" });

  const server = {
    id: nextServerId++,
    name,
    ip,
    port: port || 25565,
    description: description || "",
    players: []
  };

  servers.push(server);
  res.status(201).json(server);
});

app.put("/servers/:id", (req, res) => {
  const server = findServer(req.params.id);
  if (!server) return res.status(404).json({ error: "Server not found" });

  const { name, ip, port, description } = req.body;

  if (name !== undefined) server.name = name;
  if (ip !== undefined) server.ip = ip;
  if (port !== undefined) server.port = port;
  if (description !== undefined) server.description = description;

  res.json(server);
});

app.delete("/servers/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = servers.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ error: "Server not found" });

  for (let i = players.length - 1; i >= 0; i--) {
    if (players[i].serverId === id) players.splice(i, 1);
  }

  servers.splice(index, 1);
  res.status(204).send();
});

app.get("/servers/:id/players", (req, res) => {
  const serverId = Number(req.params.id);
  const server = findServer(serverId);
  if (!server) return res.status(404).json({ error: "Server not found" });

  const serverPlayers = players.filter((p) => p.serverId === serverId);
  res.json(serverPlayers);
});

app.post("/servers/:id/players", (req, res) => {
  const serverId = Number(req.params.id);
  const server = findServer(serverId);
  if (!server) return res.status(404).json({ error: "Server not found" });

  const { name, rank } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const player = {
    id: nextPlayerId++,
    name,
    rank: rank || "Member",
    serverId
  };

  players.push(player);
  server.players.push(player.id);

  res.status(201).json(player);
});

app.get("/players/:id", (req, res) => {
  const player = findPlayer(req.params.id);
  if (!player) return res.status(404).json({ error: "Player not found" });
  res.json(player);
});

app.put("/players/:id", (req, res) => {
  const player = findPlayer(req.params.id);
  if (!player) return res.status(404).json({ error: "Player not found" });

  const { name, rank } = req.body;

  if (name !== undefined) player.name = name;
  if (rank !== undefined) player.rank = rank;

  res.json(player);
});

app.delete("/players/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = players.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Player not found" });

  const player = players[index];
  const server = findServer(player.serverId);

  if (server) {
    server.players = server.players.filter((pid) => pid !== id);
  }

  players.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log("Minecraft Server API running on port " + PORT);
});
