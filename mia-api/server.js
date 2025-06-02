const express = require('express');
const { Client } = require('pg');
const path = require('path');
const { get } = require('http');
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

async function getOrdiniCliente(email) { //clienteId
  const result = await client.query('SELECT id FROM ordine WHERE cliente = $1', [email]); //clienteId
  return result.rows.map(row => row.id);
}

async function getProdottiOrdine(clienteId, ordineId) {
  const result = await client.query('SELECT prodotto FROM ordine WHERE cliente = $1 AND id = $2', [clienteId, ordineId]);
  return result.rows.map(row => row.prodotto);
}

async function getClientOrdine(ordineId) {
  const result = await client.query('SELECT cliente FROM ordine WHERE id = $1', [ordineId]);
  return result.rows.map(row => row.cliente);
}

async function getVenditoriOrdine(ordineId) {
  const result = await client.query('SELECT venditore FROM ordine WHERE id = $1', [ordineId]);
  return result.rows.map(row => row.venditore);
}


async function getProdottiArtigiano(artigianoId) {
  const result = await client.query('SELECT * FROM prodotti WHERE idvenditore = $1', [artigianoId]);
  return result.rows.map(row => row.nome);
}

async function getProdottiByPrezzo(prezzo) {
  const result = await client.query('SELECT * FROM prodotti WHERE prezzo = $1', [prezzo]);
  return result.rows.map(row => row.nome);
}

async function getProdottiByCategoria(categoria) {
  const result = await client.query('SELECT nome FROM prodotti WHERE categoria = $1', [categoria]);
  return result.rows.map(row => row.nome);
}

async function getProdottiByDisponibilita(disponibilita) {
  const result = await client.query('SELECT nome FROM prodotti WHERE disponibilita = $1', [disponibilita]);
  return result.rows.map(row => row.nome);
}

async function getProdottiByNome(nome) {
  const result = await client.query('SELECT nome FROM prodotti WHERE nome ILIKE $1', [`%${nome}%`]);
  return result.rows.map(row => row.nome);
}

async function getProdottibyID(id) {
  const result = await client.query('SELECT * FROM prodotti WHERE id = $1', [id]);
  return result.rows;
}


async function getProdotti() {
  const result = await client.query('SELECT * FROM prodotti');
  return result.rows;
}

async function getDescrizioneProdotto(idprodotto) {
  const result = await client.query('SELECT descrizione FROM prodotti WHERE id = $1', [idprodotto]);
  return result.rows.map(row => row.descrizione);
}


async function getImmagineProdotto(idprodotto) {
  const result = await client.query('SELECT immagine FROM prodotti WHERE id = $1', [idprodotto]);
  return result.rows.map(row => row.immagine);
}

async function getPrezzoProdotto(idprodotto) {
  const result = await client.query('SELECT prezzo FROM prodotti WHERE id = $1', [idprodotto]);
  return result.rows.map(row => row.prezzo);
}

async function getDisponibilitaProdotto(idprodotto) {
  const result = await client.query('SELECT disponibilita FROM prodotti WHERE id = $1', [idprodotto]);
  return result.rows.map(row => row.disponibilita);
}

async function getVenditoreProdotto(idprodotto) {
  const result = await client.query('SELECT idvenditore FROM prodotti WHERE id = $1', [idprodotto]);
  return result.rows.map(row => row.idvenditore);
}

async function getCategoriaProdotto(idprodotto) {
  const result = await client.query('SELECT categoria FROM prodotti WHERE id = $1', [idprodotto]);
  return result.rows.map(row => row.categoria);
}

async function getNomeCliente(email) { //id
  const result = await client.query('SELECT nome FROM cliente WHERE email = $1', [email]);
  return result.rows.map(row => row.nome);
}

async function getCognomeCliente(email) { //id
  const result = await client.query('SELECT cognome FROM cliente WHERE email = $1', [email]);
  return result.rows.map(row => row.cognome);
}

async function getEmailCliente(id) {
  const result = await client.query('SELECT email FROM cliente WHERE email = $1', [email]);
  return result.rows.map(row => row.email);
}

async function getDataNascitaCliente(id) {
  const result = await client.query('SELECT data_nascita FROM cliente WHERE email = $1', [id]); //email
  return result.rows.map(row => row.data_nascita);
}


async function getIVAArtigiano(id) {
  const result = await client.query('SELECT iva FROM artigiano WHERE iva = $1', [iva]); //da fare con id
  return result.rows.map(row => row.iva);
}

async function getNumeroTelArtigiano(id) {
  const result = await client.query('SELECT numerotel FROM artigiano WHERE iva = $1', [iva]); //da fare con id
  return result.rows.map(row => row.numerotel);
}

async function getEmailArtigiano(id) {
  const result = await client.query('SELECT email FROM artigiano WHERE iva = $1', [iva]); //da fare con id
  return result.rows.map(row => row.email);
}

async function getProdottiCart(clienteId) {
  const result = await client.query('SELECT idprodotto FROM cart WHERE emailcliente = $1', [clienteId]); //da sql emailcliente 
  return result.rows.map(row => row.idprodotto);  //era idProdotto andava in 500
}

//per le statistiche ordini utente 
async function getNumeroOrdiniCliente(email) {
  const result = await client.query('SELECT COUNT(DISTINCT id) AS numero_ordini FROM ordine WHERE cliente = $1', [email]);
  return result.rows[0];
}

async function getTotaleProdottiAcquistati(email) {
  const result = await client.query('SELECT SUM(quantita) AS totale_prodotti FROM ordine WHERE cliente = $1', [email]);
  return result.rows[0];
}

async function getTotaleSpesaCliente(email) {
  const result = await client.query(`
    SELECT SUM(o.quantita * p.prezzo) AS totale_speso
    FROM ordine o
    JOIN prodotti p ON o.prodotto = p.id
    WHERE o.cliente = $1
  `, [email]);
  return result.rows[0];
}

// Funzioni per aggiungere dati
app.get('/Cart/idProdotti', async (req, res) => {
  try {
    const clienteId = req.query.cliente;
    if (!clienteId) {
      return res.status(400).json({ error: 'Parametro "cliente" mancante' });
    }

    const cart = await getProdottiCart(clienteId);
    res.json(cart);
  } catch (err) {
    console.error('Errore nella query carrello', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.post('/cart/modificaQuantita', async (req, res) => {
  try {
    const { clienteId, prodottoId, quantita } = req.body;

    if (!clienteId || !prodottoId || quantita === undefined) {
      return res.status(400).json({ error: 'Parametri mancanti' });
    }
    const query = `
      UPDATE cart
      SET quantita = $1
      WHERE emailcliente = $2 AND idprodotto = $3
      RETURNING *`;
    const result = await client.query(query, [quantita, clienteId, prodottoId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Prodotto non trovato nel carrello' });
    }

    res.json({ success: true, carrello: result.rows[0] });
  } catch (error) {
    console.error('Errore nella modifica quantità carrello:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});



//endpoint per rimuovere un prodotto dal carrello
app.post('/cart/rimuoviProdotto', async (req, res) => {
  try {
    const { clienteId, prodottoId } = req.body;
    if (!clienteId || !prodottoId) {
      return res.status(400).json({ error: 'Parametri mancanti' });
    }
    const query = `
      DELETE FROM cart
      WHERE emailcliente = $1 AND idprodotto = $2
      RETURNING *`;
    const result = await client.query(query, [clienteId, prodottoId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Prodotto non trovato nel carrello' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Errore nella rimozione prodotto dal carrello:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

//recuperare la qta prodotto 
app.get('/cart/quantita', async (req, res) => {
  const { cliente, prodotto } = req.query;

  if (!cliente || !prodotto) {
    return res.status(400).json({ error: 'Parametri "cliente" e "prodotto" mancanti' });
  }

  try {
    const result = await client.query(
      'SELECT quantita FROM cart WHERE emailcliente = $1 AND idprodotto = $2',
      [cliente, prodotto]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Prodotto non trovato nel carrello' });
    }

    res.json({ quantita: result.rows[0].quantita });
  } catch (error) {
    console.error('Errore durante il recupero quantità:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.post('/artigianiRegistrazione', async (req, res) => {
  const { nomeAzienda, IVA, telefono, email, password } = req.body;

  try {
    const check = await client.query('SELECT 1 FROM login WHERE email = $1', [email]);
    if (check.rowCount > 0) {
      return res.status(400).json({ message: `Esiste già un artigiano con email uguale a : ${email}` });
    }

    const queryLogin = `
      INSERT INTO login (email, password, tipo)
      VALUES ($1, $2, $3)`;
    await client.query(queryLogin, [email, password, 'artigiano']);

    const queryArtigiano = `
      INSERT INTO artigiano (iva, numeroTel, email,nomeAzienda)
      VALUES ($1, $2, $3,$4)
      RETURNING *`;
    const resultArtigiano = await client.query(queryArtigiano, [IVA, telefono, email, nomeAzienda]);

    return res.json({ success: true });
  } catch (error) {
    console.error('Errore durante inserimento:', error);
    res.json({ error: 'Errore del server.' });
  }
});


app.post('/aggiungiProdotto', async (req, res) => {
  try {
    const { id, categoria, prezzo, disponibilita, idVenditore, nome, immagine, descrizione } = req.body;

    // Chiama la funzione che hai già scritto
    const result = await aggiungiProdotto(id, categoria, prezzo, disponibilita, idVenditore, nome, immagine, descrizione);

    // Se la funzione restituisce un messaggio (es. prodotto già esistente)
    if (result.message) {
      return res.status(400).json({ error: result.message });
    }

    // Tutto ok, restituisci il prodotto creato
    res.status(201).json(result);
  } catch (error) {
    console.error('Errore durante l\'aggiunta del prodotto:', error.message);
    res.status(500).json({ error: 'Errore interno del server.' });
  }
});


app.post('/registrazioneCliente', async (req, res) => {
  const { nome, cognome, email, dataNascita, password } = req.body;
  try {
    const check = await client.query('SELECT 1 FROM login WHERE email = $1', [email]);
    if (check.rowCount > 0) {
      return res.json({ message: `Esiste già un cliente con email ${email} ` });
    }
    const queryLogin = `
      INSERT INTO login (email, password, tipo)
      VALUES ($1, $2, $3)`;
    await client.query(queryLogin, [email, password, 'cliente']);

    const queryCliente = `
      INSERT INTO cliente (nome, cognome, email, data_nascita)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;

    const resultCliente = await client.query(queryCliente, [nome, cognome, email, dataNascita]);

    return res.json({ success: true });
  } catch (error) {
    console.error('Errore durante inserimento cliente:', error);
    res.json({ error: 'Errore del server.' });
  }
});

/*app.post('/aggiungiProdottoCarrello', async (req, res) => {
  var quantita = 1;
  const { idProdotto, email } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO cart (idprodotto,quantita,emailCliente) VALUES ($1, $2, $3) RETURNING *',
      [idProdotto, quantita, email]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Errore nell\'aggiunta del prodotto al carrello' });
    }

    res.status(201).json({ success: true, cartItem: result.rows[0] });
  } catch (error) {
    console.error('Errore durante l\'aggiunta del prodotto al carrello:', error);
    res.status(500).json({ error: 'Errore interno del server.' });
  }
});*/



app.post('/aggiungiOrdine', async (req, res) => {
  try {
    const { id, cliente, venditore, prodotto, quantita } = req.body;

    const result = await aggiungiOrdine(id, cliente, venditore, prodotto, quantita);

    if (result.message) {
      return res.status(400).json({ error: result.message });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Errore durante l\'aggiunta ordine:', error.message);
    res.status(500).json({ error: 'Errore interno del server.' });
  }
});


app.post('/eliminaArtigiano', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Parametro "id" mancante' });
    }

    const successo = await eliminaArtigiano(id);

    if (!successo) {
      return res.status(404).json({ error: `Artigiano con id ${id} non trovato` });
    }

    res.json({ success: true, message: `Artigiano con id ${id} eliminato` });
  } catch (error) {
    console.error('Errore durante eliminazione artigiano:', error.message);
    res.status(500).json({ error: 'Errore interno del server.' });
  }
});


app.post('/loginCliente', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Verifica se esiste un login valido
    const result = await client.query(
      'SELECT * FROM login WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rowCount > 0) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: 'Credenziali non valide' });
    }
  } catch (err) {
    console.error('Errore loginCliente:', err);
    return res.json({ error: 'Errore del server' });
  }
});


app.post('/loginArtigiano', async (req, res) => {
  const { email, password, iva } = req.body;

  try {
    const loginResult = await client.query(
      'SELECT 1 FROM login WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (loginResult.rowCount === 0) {
      return res.status(401).json({ success: false, message: 'Credenziali non valide' });
    }

    const artigianoResult = await client.query(
      'SELECT 1 FROM artigiano WHERE email = $1 AND iva = $2',
      [email, iva]
    );

    if (artigianoResult.rowCount > 0) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: 'Non sei registrato come artigiano' });
    }
  } catch (err) {
    console.error('Errore loginArtigiano:', err);
    return res.status(500).json({ error: 'Errore del server' });
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
    res.json({ error: 'Errore interno del server' });
  }
});
//Aggiornamento prodotto se viene premuto 2 volte
app.post('/aggiungiProdottoCarrello', async (req, res) => {
  const { idProdotto, email } = req.body;
  const quantitaBase = 1; 
  try {
    const result = await client.query(
      `UPDATE cart 
       SET quantita = quantita + 1 
       WHERE idprodotto = $1 
       RETURNING *`,
      [idProdotto]
    );

    if (result.rows.length === 0) {
      console.log("Prodotto non trovato.");
      try {
        const result = await client.query(
          `INSERT INTO cart (idprodotto, quantita, emailCliente)
        VALUES ($1, $2, $3)
        RETURNING *`,
          [idProdotto, quantitaBase, email]
        );

        if (result.rowCount === 0) {
          return { success: false, message: "Errore nell'aggiunta del prodotto al carrello." };
        }

        return { success: true, cartItem: result.rows[0] };

      } catch (error) {
        console.error("Errore in aggiungiProdottoAlCarrello:", error.message);
        throw error;
      }
    }

    console.log("Prodotto aggiornato:", result.rows[0]);
    return result.rows[0];

  } catch (error) {
    console.error("Errore durante l'incremento della quantità:", error);
    throw error;
  }
});

app.post('/prodotti', async (req, res) => {
  try {
    const prodotti = await getProdotti();

    // Mappa ogni prodotto e converte l'immagine bytea in data URI
    const prodottiConvertiti = prodotti.map(prodotto => {
      let immagineBase64 = null;

      if (prodotto.immagine) {
        // Supponiamo che siano immagini PNG, altrimenti cambia in image/jpeg ecc.
        const mimeType = 'image/png';
        const base64 = prodotto.immagine.toString('base64');
        immagineBase64 = `data:${mimeType};base64,${base64}`;
      }

      return {
        ...prodotto,
        immagine: immagineBase64
      };
    });

    res.json(prodottiConvertiti);

  } catch (err) {
    console.error('Errore nella query prodotti', err);
    res.json({ success: false, message: 'Errore interno del server' });
  }
});

/*app.post('/prodotti', async (req, res) => {
  try {
    const prodotti = await getProdotti();
    res.json(prodotti);
  } catch (err) {
    console.error('Errore nella query prodotti', err);
    res.json({ success:false,message: 'Errore interno del server' });
  }
});*/

app.get('/prodotti/prezzo', async (req, res) => {
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

app.post('/prodottobyId', async (req, res) => {
  try {
    const id = req.body.id;
    if (!id) {
      return res.json({ error: 'Parametro "id" mancante ' });
    }

    const result = await getProdottibyID(id);
    console.log(result);
    if (result.length === 0) {
      return res.json({ error: 'Prodotto non trovato ' });
    }

    res.json({ dati: result });

  } catch (err) {
    console.error('Errore nel recupero del nome prodotto ', err);
    res.json({ error: 'Errore interno del server ' });
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


app.get('/ordine/prodotti', async (req, res) => {
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

  res.json({ nome: result[0] }); //.nome
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

  res.json({ cognome: result[0] }); //.cognome
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

  res.json({ data_nascita: result[0] });  //result[0].data_nascita 
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


//recupa l'azienda
app.get('/artigiano/nomeAzienda', async (req, res) => {
  const iva = req.query.id;
  if (!iva) return res.status(400).json({ error: 'Parametro "id" mancante' });

  try {
    const result = await client.query('SELECT nomeAzienda FROM artigiano WHERE iva = $1', [iva]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Artigiano non trovato' });

    res.json({ nomeAzienda: result.rows[0].nomeazienda });
  } catch (err) {
    console.error('Errore nella query nomeAzienda:', err);
    res.status(500).json({ error: 'Errore del server' });
  }
});


//aggiunta per recuperare dall'iva la mail 
app.get('/artigiano/iva-by-email', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'Email mancante' });

  try {
    const result = await client.query('SELECT iva FROM artigiano WHERE email = $1', [email]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Artigiano non trovato' });

    res.json({ iva: result.rows[0].iva });
  } catch (err) {
    console.error('Errore durante la query iva-by-email:', err);
    res.status(500).json({ error: 'Errore del server' });
  }
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

app.get('/prodotti/descrizione', async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: 'Parametro "id" mancante ' });
  }

  const result = await getDescrizioneProdotto(id);
  if (result.length === 0) {
    return res.status(404).json({ error: 'Nessun prodotto trovato con questo id' });
  }

  res.json(result);
});



app.get('/', (req, res) => {
  res.redirect('/loginForm/login-registration.html');
});

//aggiunta per riprendere sia nome prezo dall'id associato dentro al carrello
app.get('/prodotto/dettagli', async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: 'Parametro "id" mancante' });
  }
  const result = await client.query('SELECT nome, prezzo FROM prodotti WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }
  res.json(result.rows[0]);
});

//svuota carrello (vedi video)
app.post('/cart/svuotaCarrello', async (req, res) => {
  const { clienteId } = req.body;

  if (!clienteId) {
    return res.status(400).json({ error: 'Parametro "clienteId" mancante' });
  }

  try {
    const result = await client.query('DELETE FROM cart WHERE emailcliente = $1', [clienteId]);

    res.json({ success: true, deletedCount: result.rowCount });
  } catch (error) {
    console.error('Errore durante lo svuotamento del carrello:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

//trova che utente sei 
app.get('/utente/tipo', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'Email mancante' });

  try {
    const result = await client.query('SELECT tipo FROM login WHERE email = $1', [email]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Utente non trovato' });

    res.json({ tipo: result.rows[0].tipo });
  } catch (err) {
    console.error('Errore tipo utente:', err);
    res.status(500).json({ error: 'Errore del server' });
  }
});


app.get('/stat/ordini', async (req, res) => {
  const email = req.query.cliente;
  if (!email) return res.status(400).json({ error: 'Parametro "cliente" mancante' });

  try {
    const result = await getNumeroOrdiniCliente(email);
    res.json(result);
  } catch (err) {
    console.error('Errore numero ordini:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

app.get('/stat/quantita', async (req, res) => {
  const email = req.query.cliente;
  if (!email) return res.status(400).json({ error: 'Parametro "cliente" mancante' });

  try {
    const result = await getTotaleProdottiAcquistati(email);
    res.json(result);
  } catch (err) {
    console.error('Errore totale prodotti:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

app.get('/stat/spesa', async (req, res) => {
  const email = req.query.cliente;
  if (!email) return res.status(400).json({ error: 'Parametro "cliente" mancante' });

  try {
    const result = await getTotaleSpesaCliente(email);
    res.json(result);
  } catch (err) {
    console.error('Errore totale spesa:', err);
    res.status(500).json({ error: 'Errore server' });
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
  getProdotti,
  getImmagineProdotto,
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
  getProdottiByCategoria,
  getProdottiByDisponibilita,
  getProdottiByNome,
  getProdottiByPrezzo,
  getProdottiCart,
  getDescrizioneProdotto,
};
