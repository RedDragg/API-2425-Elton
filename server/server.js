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
  .use('/components', sirv('server/components'))

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

// ✅ Route: Index pagina (bijv. game of main pokémon page)
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
