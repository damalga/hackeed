export default [
  {
    id: 1,
    name: "Flipper Zero",
    desc: "La navaja suiza del hacking portátil. Lector RFID, infrarrojos, radio...",
    longDesc: "El Flipper Zero es una herramienta portatil multifunción para pentesters, geeks y hackers. Incluye capacidades de RFID/NFC, infrarrojos, radio, emulación HID, GPIO y mucho más. Perfecto para auditorías de seguridad y proyectos de investigación.",
    img: "images/flipper_zero/flipper_zero_1.webp",
    images: [
      "images/flipper_zero/flipper_zero_1.webp",
      "images/flipper_zero/flipper_zero_2.webp",
      "images/flipper_zero/flipper_zero_3.webp",
    ],
    price: 245,
    category: "Seguridad Informática",
    brand: "Flipper Devices",
    inStock: true,
    features: [
      "RFID/NFC",
      "Infrarrojos",
      "Sub-1GHz Radio",
      "Emulación HID",
      "GPIO",
      "1-Wire",
      "Bluetooth",
    ],
    // Sin variantes - producto simple
    variants: null,
  },
  {
    id: 2,
    name: "Expansión WiFi Flipper Zero",
    desc: "Añade conectividad Wi‑Fi al Flipper Zero mediante un ESP32 integrado.",
    longDesc: "Esta expansión convierte tu Flipper Zero en un dispositivo con capacidad WiFi completa. Basada en un módulo ESP32, permite realizar ataques de red, capturar paquetes, ejecutar scripts remotos y mucho más.",
    img: "images/flipper_zero/flipper_zero_wifi_1.webp",
    images: [
      "images/flipper_zero/flipper_zero_wifi_1.webp",
      "images/flipper_zero/flipper_zero_wifi_2.webp",
      "images/flipper_zero/flipper_zero_wifi_3.webp",
    ],
    price: 45,
    category: "Seguridad Informática",
    brand: "Flipper Devices",
    inStock: true,
    features: ["ESP32", "WiFi"],
    // Sin variantes - producto simple
    variants: null,
  },
  {
    id: 3,
    name: "Raspberry Pi 5",
    desc: "La bestia mini que todo lo mueve: servidores, automatización, desarrollo...",
    longDesc: "La Raspberry Pi 5 es una de las computadoras de placa única más potentes. Con procesador de 64 bits, conectividad mejorada y capacidades de IA. Perfecta para proyectos de Homelab, IoT, automatización y desarrollo tecnológico de todo tipo.",
    img: "images/raspberry_pi/raspberry_pi_5_1.webp",
    images: [
      "images/raspberry_pi/raspberry_pi_5_2.webp",
      "images/raspberry_pi/raspberry_pi_5_3.webp",
      "images/raspberry_pi/raspberry_pi_5_4.webp",
    ],
    price: 59, // precio base para 2GB
    category: "Plataforma/s de desarrollo",
    brand: "Raspberry Pi Ltd",
    inStock: true,
    features: [
      "64-bit quad-core",
      "Dual 4K HDMI",
      "WiFi 6",
      "Bluetooth 5.2",
      "USB 3.0",
      "Ethernet Gigabit"
    ],
    // Variantes por memoria RAM
    variants: {
      type: "single", // selector único
      name: "Memoria RAM",
      options: [
        {
          id: "2gb",
          name: "2GB RAM",
          price: 59,
          priceDiff: 0,
          inStock: false,
          features: ["2GB RAM"]
        },
        {
          id: "4gb",
          name: "4GB RAM",
          price: 79,
          priceDiff: 20,
          inStock: true,
          features: ["4GB RAM"]
        },
        {
          id: "8gb",
          name: "8GB RAM",
          price: 99,
          priceDiff: 40,
          inStock: true,
          features: ["8GB RAM"]
        },
        {
          id: "16gb",
          name: "16GB RAM",
          price: 129,
          priceDiff: 70,
          inStock: false,
          features: ["16GB RAM"]
        }
      ],
      default: "4gb"
    },
  },
  {
    id: 4,
    name: "Raspberry Pi 500",
    desc: "La mini bestia en formato teclado. PC completo listo para enchufar.",
    longDesc: "Raspberry Pi 500 integra una Pi 5 en un teclado compacto. CPU de 64 bits, 8 GB de RAM y conectividad moderna para home-lab, automatización y desarrollo. Ideal como equipo de escritorio minimalista.",
    img: "images/raspberry_pi/raspberry_pi_500_1.webp",
    images: [
      "images/raspberry_pi/raspberry_pi_500_1.webp",
      "images/raspberry_pi/raspberry_pi_500_2.webp",
      "images/raspberry_pi/raspberry_pi_500_3.webp",
      "images/raspberry_pi/raspberry_pi_500_4.webp"
    ],
    price: 108,
    category: "Plataforma/s de desarrollo",
    brand: "Raspberry Pi Ltd",
    inStock: true,
    features: [
      "64-bit quad-core",
      "8 GB RAM",
      "Dual 4K HDMI",
      "WiFi 6",
      "Bluetooth 5.2",
      "USB 3.0",
      "Ethernet Gigabit",
      "Teclado integrado"
    ],
    // Sin variantes - producto único
    variants: null,
  },
  {
    id: 5,
    name: "Kit Raspberry Pi 500",
    desc: "Todo lo que necesitas para comenzar a trabajar con el Raspberry Pi 500",
    longDesc: "Kit completo con Raspberry Pi 500 y todos los accesorios esenciales. Incluye el teclado-computadora Pi 500, fuente de alimentación oficial, tarjeta microSD de alta velocidad y cable HDMI. Perfecto para empezar de inmediato.",
    img: "images/raspberry_pi/raspberry_pi_500_kit_1.webp",
    images: [
      "images/raspberry_pi/raspberry_pi_500_kit_1.webp",
      "images/raspberry_pi/raspberry_pi_500_kit_2.webp",
      "images/raspberry_pi/raspberry_pi_500_kit_3.webp"
    ],
    price: 145, // precio base del kit
    category: "Kits",
    brand: "Raspberry Pi Ltd",
    inStock: true,
    features: [
      "Raspberry Pi 500",
      "Ratón",
      "Fuente de alimentación oficial",
      "Tarjeta microSD de alta velocidad",
      "Cable micro HDMI a HDMI",
      "Manual oficial"
    ],
    // Variante para bundle con pantalla
    variants: {
      type: "single", // selector único
      name: "Configuración",
      options: [
        {
          id: "kit_only",
          name: "Kit básico",
          price: 145,
          priceDiff: 0,
          inStock: true,
          features: ["Kit completo sin pantalla"]
        },
        {
          id: "kit_with_screen",
          name: "Kit + Pantalla",
          price: 245,
          priceDiff: 100,
          inStock: true,
          features: ["Kit completo", "Screen 15.6\""]
        }
      ],
      default: "kit_only"
    },
  },
  {
    id: 6,
    name: "Raspberry Pi Screen",
    desc: "Pantalla de 15,6 pulgadas, diseñada como complemento para el Raspberry Pi 500.",
    longDesc: "Versátil y nítida, diseñada para acompañar a Raspberry Pi. También funciona con ordenadores y consolas vía HDMI.",
    img: "images/raspberry_pi/raspberry_pi_screen_1.webp",
    images: [
      "images/raspberry_pi/raspberry_pi_screen_1.webp",
      "images/raspberry_pi/raspberry_pi_screen_2.webp",
      "images/raspberry_pi/raspberry_pi_screen_3.webp",
    ],
    price: 118,
    category: "Pantallas",
    brand: "Raspberry Pi Ltd",
    inStock: true,
    features: [
      "IPS",
      "15,6 pulgadas",
      "1920 x 1080",
      "HDMI",
      "60 Hz",
      "VESA",
      "Alimentación USB-C",
    ],
    // Sin variantes - producto único
    variants: null,
  }
];
