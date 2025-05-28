const express = require('express');
const { Client } = require('pg');
const path = require('path');
const app = express();
app.use(express.json());

// Connessione al database
const client = new Client({
  user: 'postgres.ajexsiyipavyjrkseedr',
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  database: 'postgres',
  password: 'Sviluppo2025',
  port: 6543,
});

client.connect()
  .then(() => console.log('Connesso al database!'))
  .catch(err => console.error('Errore di connessione', err));
app.use(express.static(path.join(__dirname, '..')));
// Funzioni get

async function getOrdiniCliente(clienteId) {
  const result = await client.query('SELECT id FROM ordine WHERE cliente = $1', [clienteId]);
  return result.rows;
}

async function getProdottiOrdine(clienteId, ordineId) {
  const result = await client.query('SELECT prodotto FROM ordine WHERE cliente = $1 AND id = $2', [clienteId, ordineId]);
  return result.rows;
}

async function getClientOrdine(ordineId) {
  const result = await client.query('SELECT cliente FROM ordine WHERE id = $1', [ordineId]);
  return result.rows;
}

async function getVenditoriOrdine(ordineId) {
  const result = await client.query('SELECT venditore FROM ordine WHERE id = $1', [ordineId]);
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

async function getProdottiByCategoria(categoria) {
  const result = await client.query('SELECT nome FROM prodotti WHERE categoria = $1', [categoria]);
  return result.rows;
}

async function getProdottiByDisponibilita(disponibilita) {
  const result = await client.query('SELECT nome FROM prodotti WHERE disponibilita = $1', [disponibilita]);
  return result.rows;
}

async function getProdottiByNome(nome) {
  const result = await client.query('SELECT nome FROM prodotti WHERE nome ILIKE $1', [`%${nome}%`]);
  return result.rows;
}








async function getProdotti() {
  const result = await client.query('SELECT nome FROM prodotti');
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




async function getNomeCliente(id) {
  const result = await client.query('SELECT nome FROM cliente WHERE id = $1', [id]);
  return result.rows;
}

async function getCognomeCliente(id) {
  const result = await client.query('SELECT cognome FROM cliente WHERE id = $1', [id]);
  return result.rows;
}

async function getEmailCliente(id) {
  const result = await client.query('SELECT email FROM cliente WHERE id = $1', [id]);
  return result.rows;
}

async function getDataNascitaCliente(id) {
  const result = await client.query('SELECT data_nascita FROM cliente WHERE id = $1', [id]);
  return result.rows;
}






async function getIVAArtigiano(id) {
  const result = await client.query('SELECT IVA FROM artigiano WHERE id = $1', [id]);
  return result.rows;
}

async function getNumeroTelArtigiano(id) {
  const result = await client.query('SELECT numeroTel FROM artigiano WHERE id = $1', [id]);
  return result.rows;
}

async function getEmailArtigiano(id) {
  const result = await client.query('SELECT email FROM artigiano WHERE id = $1', [id]);
  return result.rows;
}
// Funzioni per aggiungere dati



async function aggiungiArtigiano(id, IVA, numeroTel, email, password) {
  const check = await client.query('SELECT 1 FROM artigiano WHERE id = $1', [id]);
  if (check.rowCount > 0) {
    return { message: `Esiste già un artigiano con id ${id} 🌸` };
  }

  const queryArtigiano = 'INSERT INTO artigiano (id, IVA, numeroTel, email) VALUES ($1, $2, $3, $4) RETURNING *';
  const resultArtigiano = await client.query(queryArtigiano, [id, IVA, numeroTel, email]);

  const queryLogin = 'INSERT INTO login (email, password, tipo) VALUES ($1, $2, $3)';
  await client.query(queryLogin, [email, password, 'artigiano']);

  return resultArtigiano.rows[0];
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

async function aggiungiCliente(id, nome, cognome, email, data_nascita, password) {
  const check = await client.query('SELECT 1 FROM cliente WHERE id = $1', [id]);
  if (check.rowCount > 0) {
    return { message: `Esiste già un cliente con id ${id} 💖` };
  }

  // Inserisci nella tabella cliente
  const queryCliente = 'INSERT INTO cliente (id, nome, cognome, email, data_nascita) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const resultCliente = await client.query(queryCliente, [id, nome, cognome, email, data_nascita]);

  // Inserisci nella tabella login
  const queryLogin = 'INSERT INTO login (email, password, tipo) VALUES ($1, $2, $3)';
  await client.query(queryLogin, [email, password, 'cliente']);

  return resultCliente.rows[0];
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
  const result = await client.query(
    'SELECT 1 FROM login WHERE email = $1 AND password = $2',
    [email, password]
  );
  return result.rowCount > 0;
}



async function loginArtigiano(email, password, iva) {
  const result = await client.query(
    'SELECT 1 FROM login WHERE email = $1 AND password = $2', 
    [email, password]
  );

  // Controlla se esiste un login con questa email e password
  if (result.rowCount === 0) return false;

  // Controlla se esiste un artigiano con questa email e partita IVA
  const artigianoResult = await client.query(
    'SELECT 1 FROM artigiano WHERE email = $1 AND iva = $2', 
    [email, iva]
  );

  return artigianoResult.rowCount > 0;
}










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


app.get('ordine/prodotti', async (req, res) => {
  try {
    const clienteId = req.query.cliente;
    const ordineId = req.query.ordine;
    if (!clienteId || !ordineId) {
      return res.status(400).json({ error: 'Parametri "cliente" e "ordine" mancanti' });
    }

    const prodotti = await getProdottiOrdine(clienteId, ordineId);
    res.json(prodotti);
  } catch (err) {
    console.error('Errore nella query prodotti ordine', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.get('/ordine/venditore', async (req, res) => {
  const ordineId = req.query.id;
  if (!ordineId) {
    return res.status(400).json({ error: 'Parametro "id" mancante ' });
  }

  const result = await getVenditoriOrdine(ordineId);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Ordine non trovato ' });
  }

  res.json({ venditore: result[0].venditore });
});

app.get('/ordine/cliente', async (req, res) => {
  const ordineId = req.query.id;
  if (!ordineId) {
    return res.status(400).json({ error: 'Parametro "id" mancante ' });
  }

  const result = await getClientOrdine(ordineId);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Ordine non trovato ' });
  }

  res.json({ cliente: result[0].cliente });
});

app.get('/cliente/nome', async (req, res) => {
  const clienteId = req.query.id;
  if (!clienteId) {
    return res.status(400).json({ error: 'Parametro "id" mancante ' });
  }

  const result = await getNomeCliente(clienteId);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Cliente non trovato ' });
  }

  res.json({ nome: result[0].nome });
});

app.get('/cliente/cognome', async (req, res) => {
  const clienteId = req.query.id;
  if (!clienteId) {
    return res.status(400).json({ error: 'Parametro "id" mancante ' });
  }

  const result = await getCognomeCliente(clienteId);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Cliente non trovato ' });
  }

  res.json({ cognome: result[0].cognome });
});

app.get('/cliente/email', async (req, res) => {
  const clienteId = req.query.id;
  if (!clienteId) {
    return res.status(400).json({ error: 'Parametro "id" mancante ' });
  }

  const result = await getEmailCliente(clienteId);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Cliente non trovato ' });
  }

  res.json({ email: result[0].email });
});

app.get('/cliente/data_nascita', async (req, res) => {
  const clienteId = req.query.id;
  if (!clienteId) {
    return res.status(400).json({ error: 'Parametro "id" mancante ' });
  }

  const result = await getDataNascitaCliente(clienteId);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Cliente non trovato ' });
  }

  res.json({ data_nascita: result[0].data_nascita });
});

app.get('/artigiano/iva', async (req, res) => {
  const artigianoId = req.query.id;
  if (!artigianoId) {
    return res.status(400).json({ error: 'Parametro "id" mancante ' });
  }

  const result = await getIVAArtigiano(artigianoId);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Artigiano non trovato ' });
  }

  res.json({ iva: result[0].IVA });
});

app.get('/artigiano/numeroTel', async (req, res) => {
  const artigianoId = req.query.id;
  if (!artigianoId) {
    return res.status(400).json({ error: 'Parametro "id" mancante ' });
  }

  const result = await getNumeroTelArtigiano(artigianoId);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Artigiano non trovato ' });
  }

  res.json({ numeroTel: result[0].numeroTel });
});

app.get('/artigiano/email', async (req, res) => {
  const artigianoId = req.query.id;
  if (!artigianoId) {
    return res.status(400).json({ error: 'Parametro "id" mancante ' });
  }

  const result = await getEmailArtigiano(artigianoId);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Artigiano non trovato ' });
  }

  res.json({ email: result[0].email });
});

app.get('/prodotto/categoria', async (req, res) => {
  const categoria = req.query.categoria;
  if (!categoria) {
    return res.status(400).json({ error: 'Parametro "categoria" mancante ' });
  }

  const result = await getProdottiByCategoria(categoria);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Nessun prodotto trovato per questa categoria' });
  }

  res.json(result);
});

app.get('prodotto/disponibilita', async (req, res) => {
  const disponibilita = req.query.disponibilita;

  // Controlla se il parametro è assente
  if (disponibilita === undefined) {
    return res.status(400).json({ error: 'Parametro "disponibilita" mancante' });
  }

  // Controlla se disponibilita è uguale a "0"
  if (disponibilita === '0') {
    return res.status(404).json({ error: 'Nessun prodotto disponibile (disponibilità = 0)' });
  }

  const result = await getProdottiByDisponibilita(disponibilita);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Nessun prodotto trovato per questa disponibilità' });
  }

  res.json(result);
});

app.get('/prodotto/nome', async (req, res) => {
  const nome = req.query.nome;
  if (!nome) {
    return res.status(400).json({ error: 'Parametro "nome" mancante ' });
  }

  const result = await getProdottiByNome(nome);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Nessun prodotto trovato con questo nome' });
  }

  res.json(result);
});



app.get('/', (req, res) => {
  res.redirect('/loginForm/login-registration.html');
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
  aggiungiProdotto,
  aggiungiOrdine,
  aggiungiCliente,
  getProdotti,
  getImmagineProdotto,
  getNomeProdotto,
  getPrezzoProdotto,
  getDisponibilitaProdotto,
  getVenditoreProdotto,
  getCategoriaProdotto,
  getProdottiOrdine,
  getClientOrdine,
  getVenditoriOrdine,
  getNomeCliente,
  getCognomeCliente,
  getEmailCliente,
  getDataNascitaCliente,
  getIVAArtigiano,
  getNumeroTelArtigiano,
  getEmailArtigiano,

  loginArtigiano,
  loginCliente,
  getProdottiByCategoria,
  getProdottiByDisponibilita,
  getProdottiByNome,
  getProdottiByPrezzo
};
