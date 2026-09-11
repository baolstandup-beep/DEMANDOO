// Centralized Dataset for National Coverage (Touba to all 14 Senegal regions)
// Distances are estimated road distances (approximate) from Touba

export const TOUBA_COORDS = [14.8631, -15.8770];

export const SENEGAL_REGIONS = [
  "Toutes",
  "Dakar",
  "Thiès",
  "Diourbel",
  "Fatick",
  "Kaolack",
  "Louga",
  "Saint-Louis",
  "Kaffrine",
  "Tambacounda",
  "Matam",
  "Kolda",
  "Sédhiou",
  "Ziguinchor",
  "Kédougou"
];

export const SENEGAL_DESTINATIONS = [
  // 1. RÉGION DE DAKAR
  {
    id: "dakar",
    city: "Dakar",
    region: "Dakar",
    latitude: 14.6937,
    longitude: -17.4441,
    distanceFromTouba: 171,
    duration: "2h 45m",
    popular: true,
    priceEstimate: "9 000 FCFA",
    description: "Capitale économique et administrative, terminus principal de l'autoroute Ila Touba."
  },
  {
    id: "pikine",
    city: "Pikine",
    region: "Dakar",
    latitude: 14.7549,
    longitude: -17.3942,
    distanceFromTouba: 163,
    duration: "2h 35m",
    popular: false,
    priceEstimate: "8 500 FCFA",
    description: "Grand carrefour urbain de la banlieue dakaroise."
  },
  {
    id: "guediawaye",
    city: "Guédiawaye",
    region: "Dakar",
    latitude: 14.7709,
    longitude: -17.3889,
    distanceFromTouba: 165,
    duration: "2h 40m",
    popular: false,
    priceEstimate: "8 500 FCFA",
    description: "Zone côtière dynamique de la presqu'île du Cap-Vert."
  },
  {
    id: "rufisque",
    city: "Rufisque",
    region: "Dakar",
    latitude: 14.7167,
    longitude: -17.2667,
    distanceFromTouba: 149,
    duration: "2h 15m",
    popular: true,
    priceEstimate: "8 000 FCFA",
    description: "Porte d'entrée est de Dakar, pôle industriel et commercial."
  },

  // 2. RÉGION DE THIÈS
  {
    id: "thies",
    city: "Thiès",
    region: "Thiès",
    latitude: 14.7910,
    longitude: -16.9256,
    distanceFromTouba: 113,
    duration: "1h 45m",
    popular: true,
    priceEstimate: "7 000 FCFA",
    description: "Deuxième ville universitaire et carrefour ferroviaire du pays."
  },
  {
    id: "mbour",
    city: "Mbour",
    region: "Thiès",
    latitude: 14.4220,
    longitude: -16.9638,
    distanceFromTouba: 126,
    duration: "2h 00m",
    popular: true,
    priceEstimate: "6 000 FCFA",
    description: "Capitale de la Petite Côte, haut lieu touristique et balnéaire (Saly)."
  },
  {
    id: "tivaouane",
    city: "Tivaouane",
    region: "Thiès",
    latitude: 14.9500,
    longitude: -16.8167,
    distanceFromTouba: 104,
    duration: "1h 35m",
    popular: false,
    priceEstimate: "5 500 FCFA",
    description: "Haut lieu de spiritualité et pôle religieux du bassin arachidier."
  },
  {
    id: "joal-fadiouth",
    city: "Joal-Fadiouth",
    region: "Thiès",
    latitude: 14.1667,
    longitude: -16.8500,
    distanceFromTouba: 152,
    duration: "2h 30m",
    popular: false,
    priceEstimate: "6 500 FCFA",
    description: "Célèbre île aux coquillages et port de pêche traditionnel."
  },

  // 3. RÉGION DE DIOURBEL
  {
    id: "mbacke",
    city: "Mbacké",
    region: "Diourbel",
    latitude: 14.7903,
    longitude: -15.9082,
    distanceFromTouba: 7,
    duration: "15m",
    popular: true,
    priceEstimate: "1 000 FCFA",
    description: "Ville jumelle de Touba, accès immédiat et liaisons continues."
  },
  {
    id: "diourbel",
    city: "Diourbel",
    region: "Diourbel",
    latitude: 14.6561,
    longitude: -16.2307,
    distanceFromTouba: 44,
    duration: "45m",
    popular: true,
    priceEstimate: "2 000 FCFA",
    description: "Chef-lieu de la région du Baol, centre historique et commercial."
  },
  {
    id: "bambey",
    city: "Bambey",
    region: "Diourbel",
    latitude: 14.7000,
    longitude: -16.4500,
    distanceFromTouba: 67,
    duration: "1h 05m",
    popular: false,
    priceEstimate: "3 000 FCFA",
    description: "Ville universitaire (UADB) et carrefour agricole central."
  },

  // 4. RÉGION DE FATICK
  {
    id: "fatick",
    city: "Fatick",
    region: "Fatick",
    latitude: 14.3394,
    longitude: -16.4042,
    distanceFromTouba: 82,
    duration: "1h 20m",
    popular: true,
    priceEstimate: "4 000 FCFA",
    description: "Cœur du Sine, porte d'entrée des îles et bolongs du Saloum."
  },
  {
    id: "foundiougne",
    city: "Foundiougne",
    region: "Fatick",
    latitude: 14.1333,
    longitude: -16.4667,
    distanceFromTouba: 108,
    duration: "1h 50m",
    popular: false,
    priceEstimate: "5 000 FCFA",
    description: "Port fluvial relié par le grand pont Nelson Mandela."
  },

  // 5. RÉGION DE KAOLACK
  {
    id: "kaolack",
    city: "Kaolack",
    region: "Kaolack",
    latitude: 14.1506,
    longitude: -16.0747,
    distanceFromTouba: 80,
    duration: "1h 15m",
    popular: true,
    priceEstimate: "4 000 FCFA",
    description: "Carrefour commercial stratégique national et de la sous-région."
  },
  {
    id: "nioro-du-rip",
    city: "Nioro du Rip",
    region: "Kaolack",
    latitude: 13.7500,
    longitude: -15.7833,
    distanceFromTouba: 125,
    duration: "2h 10m",
    popular: false,
    priceEstimate: "5 500 FCFA",
    description: "Pôle agricole frontalier majeur vers la Gambie."
  },

  // 6. RÉGION DE LOUGA
  {
    id: "louga",
    city: "Louga",
    region: "Louga",
    latitude: 15.6186,
    longitude: -16.2244,
    distanceFromTouba: 92,
    duration: "1h 30m",
    popular: true,
    priceEstimate: "4 500 FCFA",
    description: "Capitale du Ndiambour, ville carrefour vers le fleuve et le nord."
  },
  {
    id: "linguere",
    city: "Linguère",
    region: "Louga",
    latitude: 15.3950,
    longitude: -15.1194,
    distanceFromTouba: 102,
    duration: "1h 40m",
    popular: false,
    priceEstimate: "5 000 FCFA",
    description: "Capitale du Djolof et pôle d'élevage d'envergure nationale."
  },

  // 7. RÉGION DE SAINT-LOUIS
  {
    id: "saint-louis",
    city: "Saint-Louis",
    region: "Saint-Louis",
    latitude: 16.0326,
    longitude: -16.4818,
    distanceFromTouba: 145,
    duration: "2h 20m",
    popular: true,
    priceEstimate: "8 000 FCFA",
    description: "Ancienne capitale classée UNESCO, pôle culturel et universitaire (UGB)."
  },
  {
    id: "richard-toll",
    city: "Richard-Toll",
    region: "Saint-Louis",
    latitude: 16.4625,
    longitude: -15.7008,
    distanceFromTouba: 184,
    duration: "2h 55m",
    popular: false,
    priceEstimate: "9 500 FCFA",
    description: "Cité sucrière et carrefour agro-industriel de la vallée du fleuve."
  },

  // 8. RÉGION DE KAFFRINE
  {
    id: "kaffrine",
    city: "Kaffrine",
    region: "Kaffrine",
    latitude: 14.1058,
    longitude: -15.5414,
    distanceFromTouba: 91,
    duration: "1h 30m",
    popular: false,
    priceEstimate: "4 500 FCFA",
    description: "Cœur du Ndoucoumane, carrefour agricole et ferroviaire."
  },
  {
    id: "koungheul",
    city: "Koungheul",
    region: "Kaffrine",
    latitude: 13.9833,
    longitude: -14.8000,
    distanceFromTouba: 168,
    duration: "2h 45m",
    popular: false,
    priceEstimate: "6 500 FCFA",
    description: "Étape clé sur la route nationale reliant l'est du Sénégal."
  },

  // 9. RÉGION DE MATAM
  {
    id: "matam",
    city: "Matam",
    region: "Matam",
    latitude: 15.6559,
    longitude: -13.2554,
    distanceFromTouba: 295,
    duration: "4h 30m",
    popular: false,
    priceEstimate: "11 000 FCFA",
    description: "Capitale régionale du Fouta, sur les rives du fleuve Sénégal."
  },
  {
    id: "ourossogui",
    city: "Ourossogui",
    region: "Matam",
    latitude: 15.6053,
    longitude: -13.3214,
    distanceFromTouba: 285,
    duration: "4h 15m",
    popular: true,
    priceEstimate: "10 500 FCFA",
    description: "Pôle commercial central du nord-est et carrefour routier majeur."
  },

  // 10. RÉGION DE TAMBACOUNDA
  {
    id: "tambacounda",
    city: "Tambacounda",
    region: "Tambacounda",
    latitude: 13.7708,
    longitude: -13.6672,
    distanceFromTouba: 292,
    duration: "4h 45m",
    popular: true,
    priceEstimate: "12 000 FCFA",
    description: "Plus grande métropole de l'Est sénégalais et carrefour sous-régional."
  },
  {
    id: "bakel",
    city: "Bakel",
    region: "Tambacounda",
    latitude: 14.9025,
    longitude: -12.4597,
    distanceFromTouba: 378,
    duration: "6h 00m",
    popular: false,
    priceEstimate: "14 000 FCFA",
    description: "Cité historique au confluent des frontières avec le Mali et la Mauritanie."
  },

  // 11. RÉGION DE KOLDA
  {
    id: "kolda",
    city: "Kolda",
    region: "Kolda",
    latitude: 12.8833,
    longitude: -14.9500,
    distanceFromTouba: 242,
    duration: "4h 15m",
    popular: true,
    priceEstimate: "11 000 FCFA",
    description: "Capitale du Fouladou et carrefour de la Haute-Casamance."
  },
  {
    id: "velingara",
    city: "Vélingara",
    region: "Kolda",
    latitude: 13.1500,
    longitude: -14.1167,
    distanceFromTouba: 265,
    duration: "4h 30m",
    popular: false,
    priceEstimate: "12 000 FCFA",
    description: "Grand marché hebdomadaire (louma) et accès vers la frontière guinéenne."
  },

  // 12. RÉGION DE SÉDHIOU
  {
    id: "sedhiou",
    city: "Sédhiou",
    region: "Sédhiou",
    latitude: 12.7081,
    longitude: -15.5569,
    distanceFromTouba: 258,
    duration: "4h 40m",
    popular: false,
    priceEstimate: "11 500 FCFA",
    description: "Cité de la moyenne Casamance sur les berges du fleuve."
  },
  {
    id: "bounkiling",
    city: "Bounkiling",
    region: "Sédhiou",
    latitude: 13.0400,
    longitude: -15.7000,
    distanceFromTouba: 210,
    duration: "3h 45m",
    popular: false,
    priceEstimate: "9 500 FCFA",
    description: "Porte d'entrée nord de la région de Sédhiou sur la route nationale 4."
  },

  // 13. RÉGION DE ZIGUINCHOR
  {
    id: "ziguinchor",
    city: "Ziguinchor",
    region: "Ziguinchor",
    latitude: 12.5833,
    longitude: -16.2719,
    distanceFromTouba: 275,
    duration: "5h 00m",
    popular: true,
    priceEstimate: "13 000 FCFA",
    description: "Grande capitale de la Basse-Casamance, port maritime et pôle culturel."
  },
  {
    id: "bignona",
    city: "Bignona",
    region: "Ziguinchor",
    latitude: 12.8103,
    longitude: -16.2264,
    distanceFromTouba: 248,
    duration: "4h 30m",
    popular: false,
    priceEstimate: "12 000 FCFA",
    description: "Carrefour routier de transit reliant toute la Casamance au nord."
  },

  // 14. RÉGION DE KÉDOUGOU
  {
    id: "kedougou",
    city: "Kédougou",
    region: "Kédougou",
    latitude: 12.5569,
    longitude: -12.1744,
    distanceFromTouba: 485,
    duration: "7h 30m",
    popular: true,
    priceEstimate: "16 000 FCFA",
    description: "Pays Bassari et Bédik, paysages montagneux et chutes de Dindéfélo."
  }
];
