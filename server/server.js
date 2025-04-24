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

async function fetchAllPokemon() {
  const pokemonAPI = `https://pokeapi.co/api/v2/pokemon?limit=${pokemonLimit}&offset=${pokemonOffset}`;
  const response = await fetch(pokemonAPI);
  const data = await response.json();
  console.log(`Aantal beschikbare Pokémon: ${data.count}`);

  const detailedPokemon = await Promise.all(
    data.results.map(async (pokemon, index) => {
      const id = pokemonOffset + index + 1;
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
app.get('/pokemon', async (req, res) => {
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

app.get('/pokemon/:id', async (req, res) => {
  const id = req.params.id;

  if (isNaN(id) || id < 1 || id > 151) {
    return res.status(404).send('Pokémon not found');
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const details = await response.json();

    const item = {
      id,
      name: details.name,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`,
      stats: details.stats.map(stat => ({
        name: stat.stat.name,
        value: stat.base_stat,
      })),
    };

    return res.send(renderTemplate('server/views/detail.liquid', {
      title: `Details van ${item.name}`,
      item,
    }));
  } catch (err) {
    console.error(err);
    return res.status(500).send('Er is iets misgegaan met het ophalen van de data.');
  }
});
