const express = require('express');
const { Client } = require('pg');

const app = express();
app.use(express.json());

// Connessione al database
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

// Funzioni get

async function getOrdiniCliente(clienteId) {
  const result = await client.query('SELECT id FROM ordine WHERE cliente = $1', [clienteId]);
  return result.rows;
}

async function getProdottiArtigiano(artigianoId) {
  const result = await client.query('SELECT * FROM prodotti WHERE idvenditore = $1', [artigianoId]);
  return result.rows;
}

async function getProdottiByPrezzo(prezzo) {
  const result = await client.query('SELECT * FROM prodotti WHERE prezzo = $1', [prezzo]);
  return result.rows;
}

async function getProdotti() {
  const result = await client.query('SELECT * FROM prodotti');
  return result.rows;
}

async function getImmagineProdotto(idprodotto) {
  const result = await client.query('SELECT immagine FROM prodotti WHERE id = $1', [idprodotto]);
  return result.rows;
}
async function getNomeProdotto(idprodotto) {
  const result = await client.query('SELECT nome FROM prodotti WHERE id = $1', [idprodotto]);
  return result.rows;
}

async function getPrezzoProdotto(idprodotto) {
  const result = await client.query('SELECT prezzo FROM prodotti WHERE id = $1', [idprodotto]);
  return result.rows;
}

async function getDisponibilitaProdotto(idprodotto) {
  const result = await client.query('SELECT disponibilita FROM prodotti WHERE id = $1', [idprodotto]);
  return result.rows;
}

async function getVenditoreProdotto(idprodotto) {
  const result = await client.query('SELECT idvenditore FROM prodotti WHERE id = $1', [idprodotto]);
  return result.rows;
}

async function getCategoriaProdotto(idprodotto) {
  const result = await client.query('SELECT categoria FROM prodotti WHERE id = $1', [idprodotto]);
  return result.rows;
}



// Funzioni per aggiungere dati


async function aggiungiArtigiano(id, IVA, numeroTel, email) {
  // Controlla se esiste già un artigiano con questo id
  const check = await client.query('SELECT 1 FROM artigiano WHERE id = $1', [id]);
  if (check.rowCount > 0) {
    return { message: `Esiste già un artigiano con id ${id} 🌸` };
  }
  const query = 'INSERT INTO artigiano (id, IVA, numeroTel, email) VALUES ($1, $2, $3, $4) RETURNING *';
  const result = await client.query(query, [id, IVA, numeroTel, email]);
  return result.rows[0];
}

async function aggiungiProdotto(id, categoria, prezzo, disponibilita, idVenditore, nome, immagine) {
  // Controlla se esiste già un prodotto con questo id
  const checkProdotto = await client.query('SELECT 1 FROM prodotti WHERE id = $1', [id]);
  if (checkProdotto.rowCount > 0) {
    return { message: `Esiste già un prodotto con id ${id} 🌼` };
  }
  // Controllo che il venditore (artigiano) esista
  const checkVenditore = await client.query('SELECT 1 FROM artigiano WHERE id = $1', [idVenditore]);
  if (checkVenditore.rowCount === 0) {
    throw new Error(`Il venditore con ID ${idVenditore} non esiste 🌸`);
  }
  const query = 'INSERT INTO prodotti (id, categoria, prezzo, disponibilita, idVenditore, nome, immagine) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
  const result = await client.query(query, [id, categoria, prezzo, disponibilita, idVenditore, nome, immagine]);
  return result.rows[0];
}

async function aggiungiCliente(id, nome, cognome, email, data_nascita) {
  // Controlla se esiste già un cliente con questo id
  const check = await client.query('SELECT 1 FROM cliente WHERE id = $1', [id]);
  if (check.rowCount > 0) {
    return { message: `Esiste già un cliente con id ${id} 💖` };
  }
  const query = 'INSERT INTO cliente (id, nome, cognome, email, data_nascita) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const result = await client.query(query, [id, nome, cognome, email, data_nascita]);
  return result.rows[0];
}

async function aggiungiOrdine(id, cliente, venditore, prodotto, quantita) {
  // Controlla se esiste già un ordine con questo id
  const check = await client.query('SELECT 1 FROM ordine WHERE id = $1', [id]);
  if (check.rowCount > 0) {
    return { message: `Esiste già un ordine con id ${id} ✨` };
  }
  const query = 'INSERT INTO ordine (id, cliente, venditore, prodotto, quantita) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const result = await client.query(query, [id, cliente, venditore, prodotto, quantita]);
  return result.rows[0];
}

async function eliminaArtigiano(id) {
  const result = await client.query('DELETE FROM artigiano WHERE id = $1 RETURNING *', [id]);
  return result.rowCount > 0;
}

async function loginCliente(email, password) {
  const result = await client.query('SELECT * FROM cliente WHERE email = $1 AND password = $2', [email, password]);
  return result.rows[0];
}

// Rotte Express

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cliente = await loginCliente(email, password);
    if (cliente) {
      res.json(cliente);
    } else {
      res.status(401).json({ error: 'Credenziali non valide' });
    }
  } catch (err) {
    console.error('Errore nella login', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.get('/ordine/cliente', async (req, res) => {
  try {
    const clienteId = req.query.cliente;
    if (!clienteId) {
      return res.status(400).json({ error: 'Parametro "cliente" mancante' });
    }

    const ordini = await getOrdiniCliente(clienteId);
    res.json(ordini); // sarà [] se non ci sono ordini
  } catch (err) {
    console.error('Errore nella query cliente', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});


app.get('/prodotti/idvenditore', async (req, res) => {
  try {
    const artigianoId = req.query.idvenditore;
    const prodotti = await getProdottiArtigiano(artigianoId);
    res.json(prodotti);
  } catch (err) {
    console.error('Errore nella query artigiano', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.get('/prodotti', async (req, res) => {
  try {
    const prodotti = await getProdotti();
    res.json(prodotti);
  } catch (err) {
    console.error('Errore nella query prodotti', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.get('/prodotti', async (req, res) => {
  try {
    const prezzo = req.query.prezzo;
    const prodotti = await getProdottiByPrezzo(prezzo);
    res.json(prodotti);
  } catch (err) {
    console.error('Errore nella query prodotto', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.get('/prodotto/immagine', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'Parametro "id" mancante ' });
    }

    const result = await getImmagineProdotto(id);

    if (result.length === 0 || !result[0].immagine) {
      return res.status(404).json({ error: 'Immagine non trovata ' });
    }
    const immagineBuffer = result[0].immagine;
    const immagineBase64 = immagineBuffer.toString('base64');

    //jpeg in png se serve
    res.set('Content-Type', 'image/jpeg');
    res.send(Buffer.from(immagineBase64, 'base64'));
    
  } catch (err) {
    console.error('Errore nel recupero dell\'immagine ', err);
    res.status(500).json({ error: 'Errore interno del server ' });
  }
});

app.get('/prodotto/nome', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'Parametro "id" mancante ' });
    }

    const result = await getNomeProdotto(id);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Prodotto non trovato ' });
    }

    res.json({ nome: result[0].nome });

  } catch (err) {
    console.error('Errore nel recupero del nome prodotto ', err);
    res.status(500).json({ error: 'Errore interno del server ' });
  }
});

app.get('/prodotto/prezzo', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'Parametro "id" mancante ' });
    }

    const result = await getPrezzoProdotto(id);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Prodotto non trovato ' });
    }

    res.json({ prezzo: result[0].prezzo });

  } catch (err) {
    console.error('Errore nel recupero del prezzo prodotto ', err);
    res.status(500).json({ error: 'Errore interno del server ' });
  }
});

app.get('/prodotto/disponibilita', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'Parametro "id" mancante ' });
    }

    const result = await getDisponibilitaProdotto(id);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Prodotto non trovato ' });
    }

    res.json({ disponibilita: result[0].disponibilita });

  } catch (err) {
    console.error('Errore nel recupero della disponibilità prodotto ', err);
    res.status(500).json({ error: 'Errore interno del server ' });
  }
});

app.get('/prodotto/venditore', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'Parametro "id" mancante ' });
    }

    const result = await getVenditoreProdotto(id);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Prodotto non trovato ' });
    }

    res.json({ venditore: result[0].idvenditore });

  } catch (err) {
    console.error('Errore nel recupero del venditore prodotto ', err);
    res.status(500).json({ error: 'Errore interno del server ' });
  }
});

app.get('/prodotto/categoria', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'Parametro "id" mancante ' });
    }

    const result = await getCategoriaProdotto(id);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Prodotto non trovato ' });
    }

    res.json({ categoria: result[0].categoria });

  } catch (err) {
    console.error('Errore nel recupero della categoria prodotto ', err);
    res.status(500).json({ error: 'Errore interno del server ' });
  }
});

// Avvio del server
app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000 🧁');
});

module.exports = {
  getOrdiniCliente,
  getProdottiArtigiano,
  getProdottiByPrezzo,
  aggiungiArtigiano,
  eliminaArtigiano,
  loginCliente,
  aggiungiProdotto,
  aggiungiOrdine,
  aggiungiCliente,
  getProdotti,
};
