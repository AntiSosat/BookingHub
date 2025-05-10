const {Client}= require('pg');
const express = require('express');

const app= express();
app.use(express.json());

const client = new Client({
  user: 'postgres.ajexsiyipavyjrkseedr',
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  database: 'E-commerce',
  password: 'Sviluppo2025',
  port: 6543,
});

client.connect()
  .then(() => console.log('Connesso al database!'))
  .catch(err => console.error('Errore di connessione', err));

 // funzioni aggiungere e rimuovere artigiani
async function aggiungiArtigiano(id, IVA, numeroTel, email) {
  const query = 'INSERT INTO artigiano (id, IVA, numeroTel, email) VALUES ($1, $2, $3, $4) RETURNING *';
  const result = await client.query(query, [id, IVA, numeroTel, email]);
  return result.rows[0];
}

async function eliminaArtigiano(id) {
  const result = await client.query('DELETE FROM artigiano WHERE id = $1 RETURNING *', [id]);
  return result.rowCount > 0;
}

// Ecco l’esportazione
module.exports = {
  aggiungiArtigiano,
  eliminaArtigiano
};