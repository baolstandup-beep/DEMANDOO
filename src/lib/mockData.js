import base44SeedTrips from '../data/base44/demandoo_trips_seed.json';

// Mock initial seed data for Demandoo Senegal
// Contains realistic Senegal routes, verified drivers, vehicles, bookings, and reviews

export const INITIAL_CITIES = [
  "Touba",
  "Dakar",
  "Thiès",
  "Mbour",
  "Saint-Louis",
  "Kaolack",
  "Ziguinchor",
  "Louga",
  "Fatick",
  "Kolda",
  "Tambacounda",
  "Diourbel",
  "Matam",
  "Sédhiou",
  "Popenguine",
  "Saly"
];

export const INITIAL_DRIVERS = [
  {
    id: "drv-001",
    full_name: "Modou Diop",
    email: "modou.diop@demandoo.sn",
    phone: "+221 77 450 12 34",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    role: "driver",
    is_phone_verified: true,
    is_identity_verified: true,
    license_verified: true,
    vehicle_verified: true,
    license_number: "DK-2019-9482",
    rating: 4.9,
    review_count: 32,
    total_trips: 142,
    kyc_status: "verified",
    whatsapp_phone: "221774501234",
    created_at: "2024-03-15T10:00:00Z",
    vehicle: {
      make: "Peugeot",
      model: "508 GT",
      year: 2021,
      color: "Gris Nardo",
      license_plate: "DK-8492-BC",
      seats_count: 4,
      vehicle_type: "Berline",
      air_conditioning: true,
      image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600",
      photos: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1605515298946-d062f2e9da53?auto=format&fit=crop&q=80&w=600"
      ]
    }
  },
  {
    id: "drv-002",
    full_name: "Awa Ndiaye",
    email: "awa.ndiaye@demandoo.sn",
    phone: "+221 78 123 45 67",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    role: "driver",
    is_phone_verified: true,
    is_identity_verified: true,
    license_verified: true,
    vehicle_verified: true,
    license_number: "TH-2021-3310",
    rating: 5.0,
    review_count: 45,
    total_trips: 89,
    kyc_status: "verified",
    whatsapp_phone: "221781234567",
    created_at: "2025-01-20T10:00:00Z",
    vehicle: {
      make: "Toyota",
      model: "RAV4 Hybride",
      year: 2022,
      color: "Blanc Nacré",
      license_plate: "TH-3310-AX",
      seats_count: 4,
      vehicle_type: "SUV",
      air_conditioning: true,
      image_url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=600",
      photos: [
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600"
      ]
    }
  },
  {
    id: "drv-003",
    full_name: "Ibrahima Sarr",
    email: "ibrahima.sarr@demandoo.sn",
    phone: "+221 76 987 65 43",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    role: "driver",
    is_phone_verified: true,
    is_identity_verified: true,
    license_verified: true,
    vehicle_verified: false,
    license_number: "SL-2020-5591",
    rating: 4.8,
    review_count: 18,
    total_trips: 64,
    kyc_status: "verified",
    whatsapp_phone: "221769876543",
    created_at: "2025-06-12T10:00:00Z",
    vehicle: {
      make: "Hyundai",
      model: "Tucson",
      year: 2020,
      color: "Noir Ebène",
      license_plate: "SL-5591-AA",
      seats_count: 4,
      vehicle_type: "SUV",
      air_conditioning: true,
      image_url: "https://images.unsplash.com/photo-1629897048514-3dd742630268?auto=format&fit=crop&q=80&w=600",
      photos: [
        "https://images.unsplash.com/photo-1629897048514-3dd742630268?auto=format&fit=crop&q=80&w=600"
      ]
    }
  },
  {
    id: "drv-004",
    full_name: "Ousmane Fall",
    email: "ousmane.fall@demandoo.sn",
    phone: "+221 70 543 21 09",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    role: "driver",
    is_phone_verified: true,
    is_identity_verified: false,
    license_verified: false,
    vehicle_verified: false,
    license_number: "KL-2022-7712",
    rating: 4.7,
    review_count: 12,
    total_trips: 28,
    kyc_status: "under_review",
    whatsapp_phone: "221705432109",
    created_at: "2026-01-05T10:00:00Z",
    vehicle: {
      make: "Renault",
      model: "Duster 4WD",
      year: 2019,
      color: "Bleu Marbre",
      license_plate: "KL-7712-BB",
      seats_count: 3,
      vehicle_type: "4x4",
      air_conditioning: true,
      image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600",
      photos: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600"
      ]
    }
  }
];

export const INITIAL_TRIPS = [
  ...base44SeedTrips,
  {
    id: "trip-101",
    driver_id: "drv-001",
    driver: INITIAL_DRIVERS[0],
    departure_city: "Touba",
    departure_address: "Grande Mosquée, Gare Routière de Touba",
    arrival_city: "Dakar",
    arrival_address: "Gare des Beaux Maraîchers / Liberté 6",
    departure_datetime: new Date(Date.now() + 86400000 * 1.5).toISOString(), // Tomorrow 10:00
    estimated_duration: "2h 30m",
    seats_total: 4,
    seats_available: 3,
    price_per_seat: 3500,
    rules_luggage: "Sacs de voyage autorisés dans le coffre",
    rules_pets: false,
    rules_smoking: false,
    cancellation_policy: "Flexible : annulation sans frais jusqu'à 12h avant le départ",
    status: "scheduled"
  },
  {
    id: "trip-102",
    driver_id: "drv-002",
    driver: INITIAL_DRIVERS[1],
    departure_city: "Dakar",
    departure_address: "Pointe E, Carrefour Castors",
    arrival_city: "Touba",
    arrival_address: "Marché Ocass, Touba",
    departure_datetime: new Date(Date.now() + 86400000 * 2).toISOString(),
    estimated_duration: "2h 45m",
    seats_total: 4,
    seats_available: 2,
    price_per_seat: 4000,
    rules_luggage: "Bagages légers uniquement",
    rules_pets: false,
    rules_smoking: false,
    cancellation_policy: "Standard : annulation sans frais jusqu'à 24h avant",
    status: "scheduled"
  },
  {
    id: "trip-103",
    driver_id: "drv-003",
    driver: INITIAL_DRIVERS[2],
    departure_city: "Touba",
    departure_address: "Heliport de Touba",
    arrival_city: "Thiès",
    arrival_address: "Place de France, Thiès Ville",
    departure_datetime: new Date(Date.now() + 86400000 * 0.8).toISOString(),
    estimated_duration: "1h 30m",
    seats_total: 4,
    seats_available: 4,
    price_per_seat: 2500,
    rules_luggage: "Grand coffre disponible",
    rules_pets: true,
    rules_smoking: false,
    cancellation_policy: "Annulation souple",
    status: "scheduled"
  },
  {
    id: "trip-104",
    driver_id: "drv-001",
    driver: INITIAL_DRIVERS[0],
    departure_city: "Saint-Louis",
    departure_address: "Pont Faidherbe, Saint-Louis",
    arrival_city: "Dakar",
    arrival_address: "Aéroport Blaise Diagne (AIBD) / VDN",
    departure_datetime: new Date(Date.now() + 86400000 * 3).toISOString(),
    estimated_duration: "3h 45m",
    seats_total: 4,
    seats_available: 1,
    price_per_seat: 6500,
    rules_luggage: "Climatisation intégrale, 2 valises max",
    rules_pets: false,
    rules_smoking: false,
    cancellation_policy: "Modérée",
    status: "scheduled"
  },
  {
    id: "trip-105",
    driver_id: "drv-002",
    driver: INITIAL_DRIVERS[1],
    departure_city: "Touba",
    departure_address: "Gare de Mbacké",
    arrival_city: "Mbour",
    arrival_address: "Rond-point Saly Portudal",
    departure_datetime: new Date(Date.now() + 86400000 * 4).toISOString(),
    estimated_duration: "2h 15m",
    seats_total: 4,
    seats_available: 3,
    price_per_seat: 3000,
    rules_luggage: "Véhicule très confortable",
    rules_pets: false,
    rules_smoking: false,
    cancellation_policy: "Annulation gratuite jusqu'à 24h",
    status: "scheduled"
  }
];

export const INITIAL_PARTNERS = [
  {
    id: "pt-1",
    name: "Express Senegal Transport",
    logo_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=200",
    website: "https://express-senegal.sn",
    is_active: true
  },
  {
    id: "pt-2",
    name: "Teranga Mobility",
    logo_url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=200",
    website: "https://terangamobility.sn",
    is_active: true
  },
  {
    id: "pt-3",
    name: "Baol Transit & Services",
    logo_url: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=200",
    website: "https://baoltransit.sn",
    is_active: true
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-001",
    user_id: "usr-current",
    title: "Bienvenue sur Demandoo !",
    message: "Le covoiturage de confiance de Touba vers tout le Sénégal. Recherchez ou publiez votre premier trajet.",
    type: "info",
    read: false,
    link: "/trajets",
    created_at: new Date().toISOString()
  }
];
