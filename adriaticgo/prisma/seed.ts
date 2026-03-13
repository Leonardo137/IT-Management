import { createRequire } from "module";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for seeding");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  const customer = await prisma.user.create({
    data: {
      name: "Ana Novak",
      email: "customer@demo.com",
      passwordHash,
      role: "CUSTOMER",
      phone: "+386 41 123 456",
      address: "Pristaniška ulica 12, 6000 Koper",
      latitude: 45.5469,
      longitude: 13.7294,
    },
  });

  const owner = await prisma.user.create({
    data: {
      name: "Marko Kovač",
      email: "owner@demo.com",
      passwordHash,
      role: "RESTAURANT_OWNER",
      phone: "+386 41 234 567",
      address: "Kidričeva ulica 8, 6000 Koper",
      latitude: 45.5483,
      longitude: 13.7306,
    },
  });

  const driver = await prisma.user.create({
    data: {
      name: "Luka Horvat",
      email: "driver@demo.com",
      passwordHash,
      role: "DELIVERY_PERSON",
      phone: "+386 41 345 678",
      address: "Cankarjeva ulica 5, 6000 Koper",
      latitude: 45.5475,
      longitude: 13.7285,
    },
  });

  // --- Restaurants ---

  const mediterra = await prisma.restaurant.create({
    data: {
      ownerId: owner.id,
      name: "Mediterra",
      description:
        "Fresh Mediterranean cuisine with locally sourced ingredients from the Adriatic coast. Our dishes celebrate the rich culinary heritage of the Slovenian Littoral.",
      cuisine: "Mediterranean",
      address: "Kidričeva ulica 22, 6000 Koper",
      latitude: 45.5481,
      longitude: 13.7302,
      imageUrl:
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
      rating: 4.7,
      deliveryTimeMin: 30,
      deliveryFee: 2.5,
      minimumOrder: 10.0,
      isOpen: true,
      openingHours: "Mon-Sun: 11:00-22:00",
    },
  });

  const piranBites = await prisma.restaurant.create({
    data: {
      ownerId: owner.id,
      name: "Piran Bites",
      description:
        "The freshest seafood in Koper, inspired by the fishing traditions of nearby Piran. From grilled branzino to black risotto, taste the sea.",
      cuisine: "Seafood",
      address: "Pristaniška ulica 6, 6000 Koper",
      latitude: 45.5465,
      longitude: 13.7289,
      imageUrl:
        "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&q=80",
      rating: 4.5,
      deliveryTimeMin: 35,
      deliveryFee: 3.0,
      minimumOrder: 12.0,
      isOpen: true,
      openingHours: "Tue-Sun: 12:00-22:00",
    },
  });

  const burgerObala = await prisma.restaurant.create({
    data: {
      ownerId: owner.id,
      name: "Burger Obala",
      description:
        "Gourmet burgers with a coastal twist. Hand-formed patties, brioche buns, and creative toppings — the best burgers by the sea.",
      cuisine: "Burgers",
      address: "Obala 4, 6000 Koper",
      latitude: 45.5459,
      longitude: 13.7275,
      imageUrl:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
      rating: 4.3,
      deliveryTimeMin: 25,
      deliveryFee: 2.0,
      minimumOrder: 8.0,
      isOpen: true,
      openingHours: "Mon-Sun: 11:00-23:00",
    },
  });

  const pastaEBasta = await prisma.restaurant.create({
    data: {
      ownerId: owner.id,
      name: "Pasta e Basta",
      description:
        "Authentic Italian pasta made fresh daily. From classic carbonara to truffle tagliatelle, every dish is a love letter to Italy.",
      cuisine: "Italian",
      address: "Cankarjeva ulica 15, 6000 Koper",
      latitude: 45.5477,
      longitude: 13.7291,
      imageUrl:
        "https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=800&q=80",
      rating: 4.6,
      deliveryTimeMin: 30,
      deliveryFee: 2.5,
      minimumOrder: 10.0,
      isOpen: true,
      openingHours: "Mon-Sat: 11:30-21:30",
    },
  });

  const asiaKoper = await prisma.restaurant.create({
    data: {
      ownerId: owner.id,
      name: "Asia Koper",
      description:
        "A fusion of Asian flavours right in the heart of Koper. From Thai curries to Japanese ramen, explore the best of Asian street food.",
      cuisine: "Asian Fusion",
      address: "Ferrarska ulica 10, 6000 Koper",
      latitude: 45.5489,
      longitude: 13.7312,
      imageUrl:
        "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80",
      rating: 4.4,
      deliveryTimeMin: 35,
      deliveryFee: 2.5,
      minimumOrder: 10.0,
      isOpen: true,
      openingHours: "Mon-Sun: 11:00-22:00",
    },
  });

  // --- Menu Categories & Items ---

  // Mediterra
  const medStarters = await prisma.menuCategory.create({
    data: {
      restaurantId: mediterra.id,
      name: "Starters",
      sortOrder: 1,
    },
  });
  const medMains = await prisma.menuCategory.create({
    data: {
      restaurantId: mediterra.id,
      name: "Main Courses",
      sortOrder: 2,
    },
  });
  const medDesserts = await prisma.menuCategory.create({
    data: {
      restaurantId: mediterra.id,
      name: "Desserts",
      sortOrder: 3,
    },
  });

  const medItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        categoryId: medStarters.id,
        name: "Bruschetta Trio",
        description:
          "Three bruschettas with tomato & basil, olive tapenade, and goat cheese",
        price: 7.9,
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: medStarters.id,
        name: "Grilled Calamari",
        description:
          "Tender calamari grilled with garlic, lemon, and fresh herbs",
        price: 9.5,
        isAvailable: true,
        sortOrder: 2,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: medMains.id,
        name: "Grilled Sea Bass",
        description:
          "Whole sea bass grilled with Mediterranean herbs, served with roasted vegetables",
        price: 18.9,
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: medMains.id,
        name: "Lamb Chops",
        description:
          "Herb-crusted lamb chops with rosemary potatoes and mint sauce",
        price: 22.5,
        isAvailable: true,
        sortOrder: 2,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: medMains.id,
        name: "Risotto ai Frutti di Mare",
        description: "Creamy risotto with mixed seafood and saffron",
        price: 16.5,
        isAvailable: true,
        sortOrder: 3,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: medDesserts.id,
        name: "Panna Cotta",
        description: "Classic vanilla panna cotta with berry coulis",
        price: 6.9,
        isAvailable: true,
        sortOrder: 1,
      },
    }),
  ]);

  // Piran Bites
  const pbStarters = await prisma.menuCategory.create({
    data: { restaurantId: piranBites.id, name: "Appetizers", sortOrder: 1 },
  });
  const pbMains = await prisma.menuCategory.create({
    data: { restaurantId: piranBites.id, name: "From the Sea", sortOrder: 2 },
  });

  await Promise.all([
    prisma.menuItem.create({
      data: {
        categoryId: pbStarters.id,
        name: "Sardines on Toast",
        description: "Marinated Adriatic sardines on sourdough with lemon zest",
        price: 8.5,
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: pbStarters.id,
        name: "Octopus Salad",
        description:
          "Tender octopus with potatoes, capers, and olive oil dressing",
        price: 11.0,
        isAvailable: true,
        sortOrder: 2,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: pbMains.id,
        name: "Black Risotto",
        description: "Cuttlefish ink risotto with fresh cuttlefish and parsley",
        price: 15.9,
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: pbMains.id,
        name: "Grilled Branzino",
        description:
          "Whole grilled branzino with Swiss chard and boiled potatoes",
        price: 19.5,
        isAvailable: true,
        sortOrder: 2,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: pbMains.id,
        name: "Shrimp Buzara",
        description:
          "Adriatic shrimp in garlic, white wine, and tomato sauce with crusty bread",
        price: 17.5,
        isAvailable: true,
        sortOrder: 3,
      },
    }),
  ]);

  // Burger Obala
  const boCategory = await prisma.menuCategory.create({
    data: { restaurantId: burgerObala.id, name: "Burgers", sortOrder: 1 },
  });
  const boSides = await prisma.menuCategory.create({
    data: { restaurantId: burgerObala.id, name: "Sides & Drinks", sortOrder: 2 },
  });

  const boItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        categoryId: boCategory.id,
        name: "Classic Obala Burger",
        description:
          "200g beef patty, cheddar, lettuce, tomato, pickles, house sauce",
        price: 11.9,
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: boCategory.id,
        name: "Truffle Burger",
        description:
          "200g beef patty, truffle mayo, brie cheese, caramelized onions, arugula",
        price: 14.5,
        isAvailable: true,
        sortOrder: 2,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: boCategory.id,
        name: "Veggie Burger",
        description:
          "Grilled portobello mushroom, gouda, roasted peppers, pesto mayo",
        price: 10.9,
        isAvailable: true,
        sortOrder: 3,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: boCategory.id,
        name: "Fish Burger",
        description:
          "Crispy beer-battered cod, tartar sauce, coleslaw, brioche bun",
        price: 12.9,
        isAvailable: true,
        sortOrder: 4,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: boSides.id,
        name: "Truffle Fries",
        description: "Crispy fries tossed with truffle oil and parmesan",
        price: 5.5,
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: boSides.id,
        name: "Craft Lemonade",
        description: "Fresh-squeezed lemonade with mint",
        price: 3.5,
        isAvailable: true,
        sortOrder: 2,
      },
    }),
  ]);

  // Pasta e Basta
  const peStarters = await prisma.menuCategory.create({
    data: { restaurantId: pastaEBasta.id, name: "Antipasti", sortOrder: 1 },
  });
  const pePasta = await prisma.menuCategory.create({
    data: { restaurantId: pastaEBasta.id, name: "Pasta", sortOrder: 2 },
  });

  await Promise.all([
    prisma.menuItem.create({
      data: {
        categoryId: peStarters.id,
        name: "Caprese Salad",
        description:
          "Buffalo mozzarella, vine tomatoes, fresh basil, balsamic reduction",
        price: 8.9,
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: pePasta.id,
        name: "Spaghetti Carbonara",
        description:
          "Classic Roman carbonara with guanciale, pecorino, egg yolk, black pepper",
        price: 12.9,
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: pePasta.id,
        name: "Truffle Tagliatelle",
        description:
          "Fresh egg tagliatelle with black truffle cream sauce and parmesan",
        price: 16.5,
        isAvailable: true,
        sortOrder: 2,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: pePasta.id,
        name: "Penne Arrabbiata",
        description:
          "Penne in spicy tomato sauce with garlic and fresh chili",
        price: 10.5,
        isAvailable: true,
        sortOrder: 3,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: pePasta.id,
        name: "Seafood Linguine",
        description:
          "Linguine with clams, mussels, shrimp in white wine and garlic",
        price: 15.9,
        isAvailable: true,
        sortOrder: 4,
      },
    }),
  ]);

  // Asia Koper
  const akStarters = await prisma.menuCategory.create({
    data: { restaurantId: asiaKoper.id, name: "Small Plates", sortOrder: 1 },
  });
  const akMains = await prisma.menuCategory.create({
    data: { restaurantId: asiaKoper.id, name: "Main Dishes", sortOrder: 2 },
  });

  const akItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        categoryId: akStarters.id,
        name: "Gyoza (6 pcs)",
        description: "Pan-fried pork dumplings with soy-ginger dipping sauce",
        price: 7.5,
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: akStarters.id,
        name: "Spring Rolls (4 pcs)",
        description:
          "Crispy vegetable spring rolls with sweet chili sauce",
        price: 6.5,
        isAvailable: true,
        sortOrder: 2,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: akMains.id,
        name: "Pad Thai",
        description:
          "Rice noodles with shrimp, tofu, peanuts, bean sprouts, and tamarind sauce",
        price: 13.5,
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: akMains.id,
        name: "Tonkotsu Ramen",
        description:
          "Rich pork bone broth with chashu, soft-boiled egg, nori, and fresh noodles",
        price: 14.9,
        isAvailable: true,
        sortOrder: 2,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: akMains.id,
        name: "Green Curry",
        description:
          "Thai green curry with chicken, bamboo shoots, and jasmine rice",
        price: 12.9,
        isAvailable: true,
        sortOrder: 3,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: akMains.id,
        name: "Teriyaki Salmon Bowl",
        description:
          "Grilled teriyaki salmon over sushi rice with edamame, avocado, and pickled ginger",
        price: 15.5,
        isAvailable: true,
        sortOrder: 4,
      },
    }),
  ]);

  // --- Sample Orders ---

  // Order 1: Delivered
  const order1 = await prisma.order.create({
    data: {
      customerId: customer.id,
      restaurantId: mediterra.id,
      status: "DELIVERED",
      subtotal: 27.4,
      deliveryFee: 2.5,
      total: 29.9,
      deliveryAddress: "Pristaniška ulica 12, 6000 Koper",
      deliveryLat: 45.5469,
      deliveryLng: 13.7294,
      items: {
        create: [
          {
            menuItemId: medItems[0].id,
            menuItemName: "Bruschetta Trio",
            unitPrice: 7.9,
            quantity: 1,
          },
          {
            menuItemId: medItems[2].id,
            menuItemName: "Grilled Sea Bass",
            unitPrice: 18.9,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.delivery.create({
    data: {
      orderId: order1.id,
      driverId: driver.id,
      status: "DELIVERED",
      deliveredAt: new Date(Date.now() - 3600000),
    },
  });

  // Order 2: Preparing
  await prisma.order.create({
    data: {
      customerId: customer.id,
      restaurantId: burgerObala.id,
      status: "PREPARING",
      subtotal: 17.4,
      deliveryFee: 2.0,
      total: 19.4,
      deliveryAddress: "Pristaniška ulica 12, 6000 Koper",
      deliveryLat: 45.5469,
      deliveryLng: 13.7294,
      items: {
        create: [
          {
            menuItemId: boItems[0].id,
            menuItemName: "Classic Obala Burger",
            unitPrice: 11.9,
            quantity: 1,
          },
          {
            menuItemId: boItems[4].id,
            menuItemName: "Truffle Fries",
            unitPrice: 5.5,
            quantity: 1,
          },
        ],
      },
    },
  });

  // Order 3: Pending
  await prisma.order.create({
    data: {
      customerId: customer.id,
      restaurantId: pastaEBasta.id,
      status: "PENDING",
      subtotal: 29.4,
      deliveryFee: 2.5,
      total: 31.9,
      deliveryAddress: "Pristaniška ulica 12, 6000 Koper",
      deliveryLat: 45.5469,
      deliveryLng: 13.7294,
      notes: "Extra parmesan on the carbonara please",
      items: {
        create: [
          {
            menuItemId: akItems[2].id,
            menuItemName: "Spaghetti Carbonara",
            unitPrice: 12.9,
            quantity: 1,
          },
          {
            menuItemId: akItems[3].id,
            menuItemName: "Truffle Tagliatelle",
            unitPrice: 16.5,
            quantity: 1,
          },
        ],
      },
    },
  });

  // Order 4: Ready for pickup
  const order4 = await prisma.order.create({
    data: {
      customerId: customer.id,
      restaurantId: asiaKoper.id,
      status: "READY",
      subtotal: 28.4,
      deliveryFee: 2.5,
      total: 30.9,
      deliveryAddress: "Pristaniška ulica 12, 6000 Koper",
      deliveryLat: 45.5469,
      deliveryLng: 13.7294,
      items: {
        create: [
          {
            menuItemId: akItems[2].id,
            menuItemName: "Pad Thai",
            unitPrice: 13.5,
            quantity: 1,
          },
          {
            menuItemId: akItems[3].id,
            menuItemName: "Tonkotsu Ramen",
            unitPrice: 14.9,
            quantity: 1,
          },
        ],
      },
    },
  });

  // Order 5: Delivering
  const order5 = await prisma.order.create({
    data: {
      customerId: customer.id,
      restaurantId: piranBites.id,
      status: "DELIVERING",
      subtotal: 35.4,
      deliveryFee: 3.0,
      total: 38.4,
      deliveryAddress: "Pristaniška ulica 12, 6000 Koper",
      deliveryLat: 45.5469,
      deliveryLng: 13.7294,
      items: {
        create: [
          {
            menuItemId: akItems[0].id,
            menuItemName: "Shrimp Buzara",
            unitPrice: 17.5,
            quantity: 1,
          },
          {
            menuItemId: akItems[1].id,
            menuItemName: "Grilled Branzino",
            unitPrice: 19.5,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.delivery.create({
    data: {
      orderId: order5.id,
      driverId: driver.id,
      status: "IN_TRANSIT",
      currentLat: 45.5472,
      currentLng: 13.729,
      pickedUpAt: new Date(Date.now() - 600000),
    },
  });

  console.log("Seed data created successfully!");
  console.log("Demo accounts:");
  console.log("  Customer:   customer@demo.com / password123");
  console.log("  Owner:      owner@demo.com    / password123");
  console.log("  Driver:     driver@demo.com   / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
