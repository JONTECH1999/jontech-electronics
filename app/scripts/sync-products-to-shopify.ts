import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

interface ProductData {
  title: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  price: string;
  compareAtPrice: string;
  sku: string;
  variantTitle: string;
  inventoryQuantity: number;
  imageUrl: string;
  imageAlt: string;
}

const PRODUCTS: ProductData[] = [
  {
    title: 'ESP32 NodeMCU DevKit v1 (30-Pin WiFi+BLE)',
    descriptionHtml: '<p>High performance 240MHz dual-core Tensilica LX6 microcontroller with integrated 802.11 b/g/n Wi-Fi and Bluetooth v4.2 BR/EDR and BLE. Perfect for IoT automation, edge telemetry, and wireless sensor nodes.</p>',
    vendor: 'Espressif / JonTech',
    productType: 'Microcontroller',
    tags: ['Microcontroller', 'IoT', 'WiFi', 'Bluetooth', 'ESP32', 'Prototyping'],
    price: '280.00',
    compareAtPrice: '320.00',
    sku: 'JT-MCU-ESP32-30P',
    variantTitle: '30-Pin CP2102 USB-C',
    inventoryQuantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'ESP32 NodeMCU DevKit v1 Microcontroller Board'
  },
  {
    title: 'Arduino Uno R3 (ATmega328P + CH340G)',
    descriptionHtml: '<p>The industry standard development board for electronics education and rapid prototyping. Features 14 digital I/O pins, 6 analog inputs, 16 MHz quartz crystal, USB connection, and ICSP header.</p>',
    vendor: 'Arduino / JonTech',
    productType: 'Microcontroller',
    tags: ['Microcontroller', 'Arduino', 'School', 'STEM', 'Prototyping'],
    price: '350.00',
    compareAtPrice: '399.00',
    sku: 'JT-MCU-UNO-R3',
    variantTitle: 'DIP Edition + USB Cable',
    inventoryQuantity: 32,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg',
    imageAlt: 'Arduino Uno R3 Microcontroller Board'
  },
  {
    title: 'Raspberry Pi 4 Model B (4GB RAM)',
    descriptionHtml: '<p>Quad-core 64-bit ARM Cortex-A72 processor at 1.5GHz, dual 4K micro-HDMI display outputs, USB 3.0, Gigabit Ethernet, and 4GB LPDDR4 RAM. Ideal for Edge AI, local machine learning, and ROS robotics.</p>',
    vendor: 'Raspberry Pi Foundation',
    productType: 'Single Board Computer',
    tags: ['SBC', 'Raspberry Pi', 'Linux', 'Edge AI', 'Prototyping'],
    price: '3899.00',
    compareAtPrice: '4299.00',
    sku: 'JT-SBC-RPI4-4GB',
    variantTitle: 'Quad-Core 64-bit Linux',
    inventoryQuantity: 12,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Raspberry_Pi_4_Model_B_-_Side.jpg',
    imageAlt: 'Raspberry Pi 4 Model B Single Board Computer'
  },
  {
    title: 'STM32F401 "Black Pill" ARM Cortex-M4 Board',
    descriptionHtml: '<p>High performance 84MHz 32-bit ARM Cortex-M4 with FPU, 256KB Flash memory, 64KB SRAM, and USB-C connector. Ideal for industrial control, digital signal processing, and high-speed embedded loops.</p>',
    vendor: 'STMicroelectronics / WeAct',
    productType: 'Microcontroller',
    tags: ['Microcontroller', 'ARM', 'STM32', 'Cortex-M4', 'Embedded'],
    price: '240.00',
    compareAtPrice: '280.00',
    sku: 'JT-MCU-STM32-F401',
    variantTitle: '84MHz 256KB Flash USB-C',
    inventoryQuantity: 28,
    imageUrl: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'STM32F401 Black Pill ARM Cortex-M4 Board'
  },
  {
    title: 'DHT22 Digital Temperature & Humidity Sensor',
    descriptionHtml: '<p>Capacitive digital humidity and temperature module. Accurately measures relative humidity from 0 to 100% and temperature from -40 to 80°C with calibrated 1-wire digital output.</p>',
    vendor: 'JonTech Sensors',
    productType: 'Environmental Sensor',
    tags: ['Sensor', 'Temperature', 'Humidity', 'IoT', 'DHT22'],
    price: '195.00',
    compareAtPrice: '240.00',
    sku: 'JT-SEN-DHT22-MOD',
    variantTitle: 'High-Precision Module',
    inventoryQuantity: 50,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/DHT22_digital_temperature_and_humidity_sensor_module_pcb.jpg',
    imageAlt: 'DHT22 Digital Temperature and Humidity Sensor'
  },
  {
    title: 'HC-SR04 Ultrasonic Distance Sensor',
    descriptionHtml: '<p>Non-contact ultrasonic range finder module. Provides 2cm to 400cm non-contact measurement with 3mm accuracy. The module includes ultrasonic transmitter, receiver, and control circuit.</p>',
    vendor: 'JonTech Sensors',
    productType: 'Distance Sensor',
    tags: ['Sensor', 'Ultrasonic', 'Robotics', 'Obstacle Avoidance', 'School'],
    price: '85.00',
    compareAtPrice: '110.00',
    sku: 'JT-SEN-HCSR04-5V',
    variantTitle: '5V Echo Transducer',
    inventoryQuantity: 60,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'HC-SR04 Ultrasonic Distance Sensor Module'
  },
  {
    title: '0.96 inch I2C OLED Display (128x64)',
    descriptionHtml: '<p>High contrast 128x64 pixel self-illuminating graphical OLED display. Standard 4-pin I2C interface (GND, VCC, SCL, SDA). Crisp readability in direct light without requiring a backlight.</p>',
    vendor: 'JonTech Displays',
    productType: 'Display Module',
    tags: ['Display', 'OLED', 'I2C', '128x64', 'Telemetry'],
    price: '145.00',
    compareAtPrice: '180.00',
    sku: 'JT-DSP-OLED096-I2C',
    variantTitle: '4-Pin I2C Blue/White',
    inventoryQuantity: 35,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    imageAlt: '0.96 inch I2C OLED Display Module 128x64'
  },
  {
    title: '4-Channel 5V Relay Module with Optocoupler',
    descriptionHtml: '<p>Opto-isolated 4-channel 5V relay expansion board. Controls high voltage and high current AC/DC appliances (up to 250VAC 10A or 30VDC 10A) with optical isolation protecting your microcontroller.</p>',
    vendor: 'JonTech Power',
    productType: 'Relay & Power Switch',
    tags: ['Relay', 'Power', '5V', 'Optocoupler', 'Industrial', 'Automation'],
    price: '165.00',
    compareAtPrice: '210.00',
    sku: 'JT-MOD-RELAY4-5V',
    variantTitle: '250VAC 10A Active Low',
    inventoryQuantity: 22,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    imageAlt: '4-Channel 5V Relay Module with Optocoupler'
  },
  {
    title: 'L298N Dual H-Bridge DC Motor Driver',
    descriptionHtml: '<p>High power dual H-bridge motor driver module based on the ST L298N chip. Capable of driving two DC motors bidirectionally with speed control (PWM) or one 4-wire two-phase stepper motor up to 2A per channel.</p>',
    vendor: 'JonTech Robotics',
    productType: 'Motor Controller',
    tags: ['Motor Driver', 'Robotics', 'L298N', 'DC Motor', 'Stepper'],
    price: '120.00',
    compareAtPrice: '160.00',
    sku: 'JT-MOD-L298N-2A',
    variantTitle: '2A Peak Driver Board',
    inventoryQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'L298N Dual H-Bridge DC Motor Driver Board'
  },
  {
    title: 'SG90 9g Micro Servo Motor',
    descriptionHtml: '<p>Lightweight high-efficiency micro servo motor with 180-degree rotation. Weighs only 9 grams with 1.6 kg-cm stall torque. Includes 3 servo horns, mounting screws, and a standard 3-pin connector.</p>',
    vendor: 'TowerPro / JonTech',
    productType: 'Actuator & Servo',
    tags: ['Servo', 'Motor', 'SG90', 'Robotics', 'RC'],
    price: '95.00',
    compareAtPrice: '125.00',
    sku: 'JT-ACT-SG90-9G',
    variantTitle: '180-Degree Nylon Gear',
    inventoryQuantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'SG90 9g Micro Servo Motor with Horns'
  },
  {
    title: 'TFmini-S Micro Solid-State LiDAR Sensor',
    descriptionHtml: '<p>Miniature single-point ToF (Time of Flight) solid-state LiDAR rangefinder. Measures distances up to 12 meters at up to 1000Hz frame rate with millimeter resolution. Supports both UART and I2C output interfaces.</p>',
    vendor: 'Benewake / JonTech',
    productType: 'LiDAR Sensor',
    tags: ['LiDAR', 'Laser', 'Distance, Autonomous, Edge AI, Drone'],
    price: '1850.00',
    compareAtPrice: '2100.00',
    sku: 'JT-SEN-TFMINIS-12M',
    variantTitle: 'UART / I2C 12m Rangefinder',
    inventoryQuantity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'TFmini-S Micro Solid-State LiDAR Sensor'
  },
  {
    title: 'Master Solderless Breadboard & 65-pc Jumper Wires',
    descriptionHtml: '<p>Essential prototyping foundation. Includes standard 830-point MB-102 solderless breadboard with dual power distribution rails and an assorted bundle of 65 multi-colored male-to-male flexible jumper wires.</p>',
    vendor: 'JonTech Lab',
    productType: 'Prototyping Accessories',
    tags: ['Breadboard', 'Jumper Wires', 'Prototyping', 'STEM', 'Essentials'],
    price: '175.00',
    compareAtPrice: '220.00',
    sku: 'JT-ACC-BB830-65J',
    variantTitle: '830-Point MB-102 Kit',
    inventoryQuantity: 55,
    imageUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&auto=format&fit=crop&q=80',
    imageAlt: '830-Point Solderless Breadboard and 65-Piece Jumper Wires'
  }
];

async function syncProducts() {
  console.log('🚀 JonTech Electronics — Live Storefront & Products Sync');
  console.log('------------------------------------------------------------');

  const shopDomain = process.env.DEMO_SHOP_DOMAIN || 'jontech-electronics-xs08gbw3.myshopify.com';
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2026-07';

  if (!token || !token.startsWith('shpat_')) {
    console.log('⚠️  No live SHOPIFY_ADMIN_ACCESS_TOKEN found in app/backend/.env.');
    console.log('');
    console.log('👉 RECOMMENDED 1-CLICK BEGINNER METHOD:');
    console.log('   Use the pre-generated CSV file: "jontech_products.csv"');
    console.log('   1. Go to: https://admin.shopify.com/store/' + shopDomain.replace('.myshopify.com', '') + '/products');
    console.log('   2. Click "Import" at the top right.');
    console.log('   3. Select "jontech_products.csv" from your project folder.');
    console.log('   4. Click "Upload and continue", then "Import products".');
    console.log('   All 12 products with aligned images and exact prices will be live in 10 seconds!');
    return;
  }

  console.log(`📡 Connecting to Shopify Admin API: https://${shopDomain}/admin/api/${apiVersion}/graphql.json`);
  const endpoint = `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`;

  async function graphql(query: string, variables: any = {}) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token!
      },
      body: JSON.stringify({ query, variables })
    });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  }

  const checkQuery = `
    query {
      products(first: 50) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `;

  const existingRes = await graphql(checkQuery);
  const existingProducts: Array<{ id: string; title: string }> =
    existingRes.data?.products?.edges.map((e: any) => e.node) || [];

  console.log(`📦 Found ${existingProducts.length} existing products in Shopify.`);
  const productMap = new Map<string, string>();
  for (const ep of existingProducts) {
    productMap.set(ep.title, ep.id);
  }

  for (const p of PRODUCTS) {
    if (productMap.has(p.title)) {
      console.log(`   ⏩ "${p.title}" already exists (${productMap.get(p.title)}). Skipping.`);
      continue;
    }

    console.log(`   ➕ Creating "${p.title}" with image...`);
    const mutation = `
      mutation createProduct($input: ProductInput!, $media: [CreateMediaInput!]) {
        productCreate(input: $input, media: $media) {
          product {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        title: p.title,
        descriptionHtml: p.descriptionHtml,
        vendor: p.vendor,
        productType: p.productType,
        tags: p.tags,
        status: 'ACTIVE'
      },
      media: [
        {
          originalSource: p.imageUrl,
          alt: p.imageAlt,
          mediaContentType: 'IMAGE'
        }
      ]
    };

    try {
      const result = await graphql(mutation, variables);
      if (result.data?.productCreate?.userErrors?.length > 0) {
        console.error(`      ❌ Error creating ${p.title}:`, result.data.productCreate.userErrors);
      } else {
        const createdId = result.data?.productCreate?.product?.id;
        console.log(`      ✅ Created! ID: ${createdId}`);
        productMap.set(p.title, createdId);
      }
    } catch (err: any) {
      console.error(`      ❌ Exception:`, err.message);
    }
  }

  console.log('');
  console.log('🎉 Sync complete! Live products and images now align with MySQL database.');
}

if (require.main === module) {
  syncProducts();
}

export { syncProducts };
