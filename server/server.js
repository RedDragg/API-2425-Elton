import 'dotenv/config';
import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

const engine = new Liquid({
  extname: '.liquid',
});

const app = new App();

// Beginwaarden voor pokemonLimit en pokemonOffset
let pokemonLimit = 151;  // Gen 1 standaard
let pokemonOffset = 0;   // Gen 1 standaard

app
  .use(logger())
  .use('/', sirv(process.env.NODE_ENV === 'development' ? 'client' : 'dist'))
  .use('/public', sirv('public'))
  .use('/components', sirv('server/components'))
  .listen(3000, () => console.log('Server draait op http://localhost:3000'));

// Haal Pokémon-data op, incl. animated GIF sprite
async function fetchAllPokemon() {
  // Gebruik de waarde van pokemonLimit en pokemonOffset uit de servervariabelen
  const pokemonAPI = `https://pokeapi.co/api/v2/pokemon?limit=${pokemonLimit}&offset=${pokemonOffset}`;
  const response = await fetch(pokemonAPI);
  const data = await response.json();
  console.log(`Aantal beschikbare Pokémon: ${data.count}`);

  const detailedPokemon = await Promise.all(
    data.results.map(async (pokemon, index) => {
      const id = pokemonOffset + index + 1; // Pokémon ID startend vanaf 152
      const res = await fetch(pokemon.url);
      const details = await res.json();

      const name = details.name;
      const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

      return {
        id,
        name,
        sprite,
        types: details.types.map(t => t.type.name),
      };
    })
  );

  return detailedPokemon;
}

// Route: Update settings voor limit en offset
app.get('/update-settings', (req, res) => {
  const { limit, offset } = req.query;

  // Werk de waarden bij met de opgegeven queryparameters
  pokemonLimit = parseInt(limit) || pokemonLimit;
  pokemonOffset = parseInt(offset) || pokemonOffset;

  // Geef de nieuwe instellingen terug als JSON
  res.json({ pokemonLimit, pokemonOffset });
});

// Route: Intro pagina
app.get('/', async (req, res) => {
  const pokemonList = await fetchAllPokemon();

  const randomIndex = Math.floor(Math.random() * pokemonList.length);
  const randomPokemon = pokemonList[randomIndex];

  return res.send(renderTemplate('server/components/intro/intro.liquid', {
    title: 'Intro | Pokédex',
    pokemons: pokemonList,
    randomPokemon,
  }));
});

// ✅ Route: Index pagina
app.get('/index', async (req, res) => {
  const pokemonList = await fetchAllPokemon();

  return res.send(renderTemplate('server/views/index.liquid', {
    title: 'Pokédex',
    pokemons: pokemonList,
  }));
});

// Render-template functie
const renderTemplate = (template, data) => {
  const templateData = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    ...data
  };

  return engine.renderFileSync(template, templateData);
};

let totaltowin = 151; // Standaardwaarde voor Gen 1

// Route om instellingen bij te werken (bijv. limit, offset, totaltowin)
app.get('/update-settings', (req, res) => {
  const { limit, offset } = req.query;

  // Verander de waarde van totaltowin op basis van de ontvangen instelling
  if (limit && offset) {
    // Zorg ervoor dat we de juiste waarde instellen voor totaltowin
    if (limit == 151) {
      totaltowin = 151; // Gen 1
    } else if (limit == 100) {
      totaltowin = 100; // Gen 2
    } else if (limit == 135) {
      totaltowin = 135; // Gen 3
    }
  }

  console.log(`Nieuwe instellingen: limit = ${limit}, offset = ${offset}, totaltowin = ${totaltowin}`);

  // Verstuur een antwoord terug naar de client (bijv. een bevestiging)
  res.json({ message: 'Instellingen bijgewerkt', totaltowin });
});

// Een andere route (bijvoorbeeld voor de homepage)
app.get('/', (req, res) => {
  res.send('Pokémon Game Server');
});

// Start de server
app.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});
