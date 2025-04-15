import 'dotenv/config';
import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

const pokemonLimit = 151;
const pokemonAPI = `https://pokeapi.co/api/v2/pokemon?limit=${pokemonLimit}&offset=0`;

const engine = new Liquid({
  extname: '.liquid',
});

const app = new App();

app
  .use(logger())
  .use('/', sirv(process.env.NODE_ENV === 'development' ? 'client' : 'dist'))
  .use('/public', sirv('public'))
  .listen(3000, () => console.log('Server draait op http://localhost:3000'));

// Haal Pokémon-data op, incl. animated GIF sprite
async function fetchAllPokemon() {
  const response = await fetch(pokemonAPI);
  const data = await response.json();

  const detailedPokemon = await Promise.all(
    data.results.map(async (pokemon, index) => {
      const id = index + 1;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const details = await res.json();

      return {
        id,
        name: pokemon.name,
        sprite: details.sprites.front_default,
        types: details.types.map(t => t.type.name),
      };
    })
  );

  return detailedPokemon;
}


// Homepagina route
app.get('/', async (req, res) => {
  const pokemonList = await fetchAllPokemon();

  const randomIndex = Math.floor(Math.random() * pokemonList.length);
  const randomPokemon = pokemonList[randomIndex];

  return res.send(renderTemplate('server/views/index.liquid', {
    title: 'Pokédex',
    pokemons: pokemonList,
    randomPokemon, // ✅ HIER moet hij goed meegegeven worden
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

