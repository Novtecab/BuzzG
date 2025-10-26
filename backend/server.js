const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/buzz';

// Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// --- Database Setup ---
const serviceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  subCategory: String,
  type: { type: String, required: true },
  name: { en: String, sv: String },
  description: { en: String, sv: String },
  longDescription: { en: String, sv: String },
  durationHours: Number,
  includes: { en: [String], sv: [String] },
  price: { sek: Number, pkr: Number },
  imageUrl: String,
});

const Service = mongoose.model('Service', serviceSchema);

const seedData = [
  // All the servicesAndProducts data from the previous server.js file is moved here for seeding.
  {
    id: 'home-1',
    category: 'home',
    subCategory: 'installation',
    type: 'service',
    name: { en: 'Washing Machine Installation', sv: 'Installation av tvättmaskin' },
    description: { en: 'Professional installation of all types of washing machines. We ensure proper plumbing and electrical connections.', sv: 'Professionell installation av alla typer av tvättmaskiner. Vi säkerställer korrekta VVS- och elanslutningar.' },
    longDescription: {
      en: 'Our certified technicians handle everything from unboxing and positioning your new washing machine to connecting all water inlets, drainage pipes, and electrical supplies. We perform a full cycle test to ensure there are no leaks and that the machine is operating perfectly. We can also uninstall and dispose of your old appliance for a small additional fee. This service is suitable for freestanding and integrated models.',
      sv: 'Våra certifierade tekniker hanterar allt från uppackning och placering av din nya tvättmaskin till anslutning av alla vatteninlopp, avloppsrör och elförsörjning. Vi utför ett komplett cykeltest för att säkerställer att det inte finns några läckor och att maskinen fungerar perfekt. Vi kan även avinstallera och avyttra din gamla apparat mot en liten extra avgift. Tjänsten passar för fristående och integrerade modeller.'
    },
    price: { sek: 800, pkr: 15000 },
    imageUrl: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400&h=300&fit=crop&q=80',
    durationHours: 1.5,
    includes: {
        en: ['Unboxing and positioning', 'Water & drainage connection', 'Electrical supply connection', 'Full cycle test'],
        sv: ['Uppackning och positionering', 'Anslutning av vatten & avlopp', 'Anslutning av elförsörjning', 'Fullständigt cykeltest']
    },
  },
  // ... (All other service and product objects from the old server file go here)
  {
    id: 'business-16',
    category: 'business',
    type: 'service',
    name: { en: 'Full-Service Event Staffing', sv: 'Helhetslösning för Eventpersonal' },
    description: { en: 'One-stop solution for booking all event staff, from hosts and technicians to setup and cleaning crews.', sv: 'En helhetslösning för att boka all eventpersonal, från värdar och tekniker till upp- och nedmonteringspersonal.' },
    price: { sek: 20000, pkr: 400000 },
    imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=300&fit=crop&q=80',
  },
];

async function seedDatabase() {
  try {
    const count = await Service.countDocuments();
    if (count === 0) {
      console.log('No services found. Seeding database...');
      // Use updateOne with upsert to avoid duplicate key errors on subsequent runs if something fails midway
      const operations = seedData.map(service => ({
        updateOne: {
          filter: { id: service.id },
          update: { $set: service },
          upsert: true
        }
      }));
      await Service.bulkWrite(operations);
      console.log('Database seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase(); // Seed the database after connecting
  })
  .catch((err) => console.error('Could not connect to MongoDB', err));


// --- API Endpoints ---
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services from database' });
  }
});

app.post('/api/orders', (req, res) => {
  const { items, address, paymentMethod, currency } = req.body;

  if (!items || !address || !paymentMethod || !currency) {
    return res.status(400).json({ error: 'Missing required order information' });
  }

  // Note: For a full implementation, you would also save this order to a new 'orders' collection in the database.
  // For now, it remains in-memory for the response.
  const subtotal = items.reduce((acc, item) => acc + item.price[currency], 0);

  const newOrder = {
    id: `BUZZ-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    items,
    address,
    subtotal,
    paymentMethod,
    currency,
  };

  console.log('Order created on backend:', newOrder.id);
  res.status(201).json(newOrder);
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});