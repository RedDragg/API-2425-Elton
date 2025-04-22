import "./index.css";

// De submit event listener slechts eenmaal toevoegen
document.getElementById('username-form').addEventListener('submit', function (e) {
  e.preventDefault(); // Voorkom het standaard gedrag van het formulier

  // Verkrijg de geselecteerde generatie via de radio buttons
  const selectedGeneration = document.querySelector('input[name="generation"]:checked').value;

  let limit = 0;
  let offset = 0;
  let totaltowin = 0;

  // Stel de juiste limit, offset en totaltowin in op basis van de geselecteerde generatie
  if (selectedGeneration === '151') {
    limit = 151;  // Gen 1: 151 Pokémon
    offset = 0;   // Start vanaf 0
    totaltowin = 151; // Voor Gen 1, set totaltowin naar 151
  } else if (selectedGeneration === '100') {
    limit = 100;  // Gen 2: 100 Pokémon
    offset = 151; // Start vanaf 151
    totaltowin = 100; // Voor Gen 2, set totaltowin naar 100
  } else if (selectedGeneration === '135') {
    limit = 135;  // Gen 3: 135 Pokémon
    offset = 251; // Start vanaf 251
    totaltowin = 135; // Voor Gen 3, set totaltowin naar 135
  }

  // Stuur de nieuwe instellingen naar de server
  fetch(`/update-settings?limit=${limit}&offset=${offset}&totaltowin=${totaltowin}`, {
    method: 'GET'
  })
  .then(response => response.json())
  .then(data => {
    console.log('Nieuwe instellingen:', data);
    window.location.reload();  // Laad de pagina opnieuw met de nieuwe instellingen
  })
  .catch(error => console.error('Error bij het wijzigen van instellingen:', error));
});

// Event listener voor de radio buttons om de display van "totaltowin" aan te passen
document.addEventListener("DOMContentLoaded", function() {
  // Start met de standaard waarde van totaltowin voor Gen 1
  let totaltowin = 151; // Begin met 151 voor Gen 1

  // Toon de standaardwaarde in de interface

  // Haal de radio buttons op
  const generationRadios = document.querySelectorAll('input[name="generation"]');

  // Voeg een event listener toe voor elke radio button
  generationRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      // Pas de waarde van totaltowin aan op basis van de geselecteerde radio button
      totaltowin = parseInt(this.value, 10);

      console.log(`Nieuwe waarde voor totaltowin: ${totaltowin}`);

      // Update de display voor hoeveel Pokémon de speler moet raden
    });
  });
});
