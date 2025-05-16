const {
  aggiungiCliente,
  aggiungiArtigiano,
  aggiungiProdotto,
  aggiungiOrdine,
  getOrdiniCliente,
  getProdottiArtigiano,
  getProdottiByPrezzo,
  getProdotti
} = require('./server');

(async () => {
  try {




    console.log('Aggiungo cliente...');
    const cliente = await aggiungiCliente(1, 'giulia@example.com', 'Giulia', 'Dolcezza', '1995-05-15');
    console.log('Cliente aggiunto:', cliente);

    console.log('\nAggiungo artigiano (venditore)...');
    const venditore = await aggiungiArtigiano(1, 'IT12345678901', '3331234567', 'artigiano@example.com');
    console.log('Artigiano aggiunto:', venditore);

    console.log('\nAggiungo prodotto associato al venditore...');
    const prodotto = await aggiungiProdotto(1, 'bambini', 20, 1, 1, 'candele');
    console.log('Prodotto aggiunto:', prodotto);

    console.log('\nAggiungo ordine...');
    const ordine = await aggiungiOrdine(1, 1, 1, 1, 3); // ordine per 3 candele
    console.log('Ordine aggiunto:', ordine);

    console.log('\nRecupero ordini del cliente...');
    const ordiniCliente = await getOrdiniCliente(1);
    console.log('Ordini cliente:', ordiniCliente);

    console.log('\nRecupero prodotti dell\'artigiano...');
    const prodottiArtigiano = await getProdottiArtigiano(1);
    console.log('Prodotti artigiano:', prodottiArtigiano);

    console.log('\nRecupero prodotti per prezzo = 20...');
    const prodotti = await getProdottiByPrezzo(20);
    console.log('Prodotti trovati:', prodotti);

    console.log('\nRecupero tutti i prodotti...');
    const tuttiProdotti = await getProdotti();
    console.log('Tutti i prodotti:', tuttiProdotti);

    console.log('\n✨ Test completato con dolcezza');
  } catch (err) {
    console.error('Errore durante il test:', err.message);
  }
})();
