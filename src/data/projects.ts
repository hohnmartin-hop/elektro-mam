import type { Project, ProjectCategory } from '@/types';

export const categories: ProjectCategory[] = [
  'ESP32',
  'Arduino',
  'Napájení',
  'Mikroelektronika',
  'Opravy',
  'DIY',
  '3D tisk',
  'Ostatní',
];

export const projects: Project[] = [
  {
    slug: 'esp32-teplomer',
    title: 'ESP32 Teploměr s OLED displejem',
    category: 'ESP32',
    shortDescription:
      'Wi-Fi teploměr s BME280 senzorem a SSD1306 OLED displejem. Posílá data na server v reálném čase.',
    image:
      'https://images.pexels.com/photos/32894960/pexels-photo-32894960.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Breadboard s mikrokontrolérem a senzorem teploty',
    date: '2026-08-15',
    featured: true,
    purpose:
      'Měřit teplotu, vlhkost a tlak v dílně a data odesílat přes Wi-Fi na webový dashboard pro sledování historie.',
    description:
      'Tento projekt vznikl, protože jsem potřeboval sledovat teplotu a vlhkost v dílně, abych věděl, kdy je bezpečné tam nechat citlivé součástky. ESP32 se stará o čtení BME280 a zobrazuje aktuální hodnoty na OLED displeji. Každých 60 sekund pošle data přes MQTT na Home Assistant.',
    components: [
      { name: 'ESP32 DevKit V1', qty: '1×', link: 'https://www.espressif.com' },
      { name: 'BME280 senzor (teplota, vlhkost, tlak)', qty: '1×' },
      { name: 'SSD1306 OLED 0.96" I2C', qty: '1×' },
      { name: 'Breadboard 830 bodů', qty: '1×' },
      { name: 'Propojovací kablíky', qty: 'sada' },
      { name: 'USB-C napájecí kabel', qty: '1×' },
    ],
    steps: [
      {
        title: 'Zapojení senzoru BME280',
        body: 'Připoj VCC na 3.3V, GND na GND, SDA na GPIO 21, SCL na GPIO 22. Senzor komunikuje přes I2C na adrese 0x76.',
      },
      {
        title: 'Zapojení OLED displeje',
        body: 'OLED používá také I2C, takže SDA a SCL sdílí stejné piny jako BME280. Adresa displeje je 0x3C.',
      },
      {
        title: 'Nahrání firmware',
        body: 'V PlatformIO nainstaluj knihovny Adafruit_BME280, Adafruit_SSD1306 a PubSubClient. Vyplň SSID, heslo a adresu MQTT brokeru.',
      },
      {
        title: 'Test a kalibrace',
        body: 'Po startu ověř, že displej zobrazuje reálné hodnoty. Porovnej s referenčním teploměrem. Pokud je odchylka, uprav offset v kódu.',
      },
    ],
    notes:
      'Při prvním spuštění dej pozor na napájení – ESP32 je citlivé na napěťové špičky. Doporučuji použít kvalitní USB nabíječku, ne levnou z tržiště.',
    links: [
      { label: 'BME280 datasheet', url: 'https://www.bosch-sensortec.com' },
      { label: 'PlatformIO', url: 'https://platformio.org' },
    ],
    code: `#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_BME280.h>
#include <PubSubClient.h>
#include <WiFi.h>

#define OLED_ADDR 0x3C
#define BME_ADDR  0x76

Adafruit_SSD1306 display(128, 64, &Wire, -1);
Adafruit_BME280 bme;

const char* ssid = "MY_WIFI";
const char* pass = "secret";
const char* mqtt = "192.168.1.100";

WiFiClient esp;
PubSubClient client(esp);

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  bme.begin(BME_ADDR);
  display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  WiFi.begin(ssid, pass);
  client.setServer(mqtt, 1883);
}

void loop() {
  if (!client.connected()) {
    client.connect("esp32-temp");
  }
  float t = bme.readTemperature();
  float h = bme.readHumidity();
  float p = bme.readPressure() / 100.0;

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.printf("T: %.1f C\\nH: %.1f %%\\nP: %.0f hPa", t, h, p);
  display.display();

  char buf[64];
  snprintf(buf, 64, "{\\\"t\\\":%.1f,\\\"h\\\":%.1f}", t, h);
  client.publish("lab/temp", buf);
  delay(60000);
}`,
  },
  {
    slug: 'arduino-led-pasma',
    title: 'Arduino WS2812B LED pásmo s efekty',
    category: 'Arduino',
    shortDescription:
      'Ovladatelné RGB LED pásmo s 16 efekty a IR dálkovým ovládáním pro atmosféru v dílně.',
    image:
      'https://images.pexels.com/photos/15470542/pexels-photo-15470542.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Arduino mikrokontrolér připojený na breadboard se svítící LED',
    date: '2026-07-20',
    featured: true,
    purpose:
      'Vytvořit atmosférické osvětlení dílny s možností přepínat efekty dálkovým ovladačem.',
    description:
      'Jednoduchý projekt na Arduino Nano, který ovládá WS2812B LED pásmo přes knihovnu FastLED. IR přijímač čte kódy z dálkového ovládání a přepíná mezi 16 předprogramovanými efekty – od duhy přes běžící světlo až po stroboskop.',
    components: [
      { name: 'Arduino Nano', qty: '1×' },
      { name: 'WS2812B LED pásmo 60 LED/m', qty: '1m' },
      { name: 'IR přijímač VS1838B', qty: '1×' },
      { name: 'IR dálkový ovladač', qty: '1×' },
      { name: 'Kondenzátor 1000µF / 6.3V', qty: '1×' },
      { name: 'Rezistor 470Ω', qty: '1×' },
      { name: 'Napájecí zdroj 5V / 2A', qty: '1×' },
    ],
    steps: [
      {
        title: 'Zapojení LED pásmu',
        body: 'Připoj DATA pin na D6 přes 470Ω rezistor. Kondenzátor 1000µF paralelně k napájení chrání před napěťovými špičkami.',
      },
      {
        title: 'IR přijímač',
        body: 'VCC na 5V, GND na GND, OUT na D11. Použij knihovnu IRremote pro dekódování signálů.',
      },
      {
        title: 'Programování efektů',
        body: 'V FastLED vytvoř pole funkcí pro jednotlivé efekty. IR kód mapuj na index efektu a přepínej při příjzu nového kódu.',
      },
    ],
    notes:
      'Napájej LED pásmo ze samostatného zdroje 5V/2A – Arduino alone nestíhá odběr proudu!',
    code: `#include <FastLED.h>
#include <IRremote.h>

#define LED_PIN 6
#define NUM_LEDS 60
#define IR_PIN 11

CRGB leds[NUM_LEDS];
int effect = 0;

void setup() {
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  IrReceiver.begin(IR_PIN, ENABLE_LED_FEEDBACK);
}

void loop() {
  if (IrReceiver.decode()) {
    switch(IrReceiver.decodedIRData.command) {
      case 0x45: effect = 0; break; // 1 = rainbow
      case 0x46: effect = 1; break; // 2 = chase
      case 0x47: effect = 2; break; // 3 = strobe
    }
    IrReceiver.resume();
  }
  runEffect(effect);
  FastLED.show();
  delay(20);
}`,
  },
  {
    slug: 'lab-2a-power-supply',
    title: 'Laboratorní napájecí zdroj 0–30V / 3A',
    category: 'Napájení',
    shortDescription:
      'Stabilizovaný zdroj s nastavitelným napětím a proudovou ochranou. Základ každé dílny.',
    image:
      'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Detailní záběr rezistorů a kondenzátorů na plošném spoji',
    date: '2026-06-10',
    featured: true,
    purpose:
      'Poskytnout stabilní nastavitelné napájení pro testování obvodů v dílně s proudovou ochranou proti zkratu.',
    description:
      'Klasický bastlířský projekt – laboratorní zdroj na bázi LM317 s předřadným transformátorem. Napětí se nastavuje potenciometrem, proudová ochrana řeší LM723. Displej ukazuje aktuální napětí a odběr.',
    components: [
      { name: 'Transformátor 24V / 2A', qty: '1×' },
      { name: 'LM317 regulátor', qty: '1×' },
      { name: 'LM723 (proudová ochrana)', qty: '1×' },
      { name: 'Měřič napětí/proudu DSN-VC288', qty: '1×' },
      { name: 'Potenciometr 10kΩ lineární', qty: '1×' },
      { name: 'Chladič pro LM317', qty: '1×' },
      { name: 'Kondenzátory 4700µF/50V, 100nF', qty: 'sada' },
    ],
    steps: [
      {
        title: 'Sestavení napájecí části',
        body: 'Za transformátor zapoj můstkový usměrňovač a za něj vyhlazovací kondenzátor 4700µF. Změř rippls napětí osciloskopem.',
      },
      {
        title: 'Regulace napětí',
        body: 'LM317 s potenciometrem tvoří nastavitelný dělič. Výpočet: Vout = 1.25 × (1 + R2/R1). Pro 0–30V je potřeba záporné napájení pro referenci.',
      },
      {
        title: 'Proudová ochrana',
        body: 'LM723 monitoruje proud přes bočník 0.1Ω. Při překročení limitu odřízne výstup přes tranzistor.',
      },
    ],
    notes:
      'POZOR: Na primární straně transformátoru je 230V! Dodrž bezpečnostní pravidla – izolační pouzdra, pojistka, PE vodič.',
    links: [
      { label: 'LM317 datasheet', url: 'https://www.ti.com' },
      { label: 'LM723 datasheet', url: 'https://www.ti.com' },
    ],
  },
  {
    slug: 'scooter-controller-repair',
    title: 'Oprava řídící jednotky elektrické koloběžky',
    category: 'Opravy',
    shortDescription:
      'Diagnostika a oprava mrtvé řídící jednotky – výměna výkonových MOSFET a kondenzátorů.',
    image:
      'https://images.pexels.com/photos/38264269/pexels-photo-38264269.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Technik pájí elektronickou součástku na plošný spoj',
    date: '2026-05-28',
    purpose:
      'Vrátit do provozu řídící jednotku elektrické koloběžky, která přestala reagovat po přehřátí.',
    description:
      'Koloběžka najednou nešla zapnout. Diagnostika ukázala zkrat na výkonové části – dva MOSFETy byly odpálené a jeden elektrolytický kondenzátor měl boubl. Po výměně součástek a kontrole spojů jednotka opět funguje.',
    components: [
      { name: 'MOSFET IRF3205', qty: '2×' },
      { name: 'Elektrolytický kondenzátor 470µF/63V', qty: '1×' },
      { name: 'Pájka SMD', qty: 'kusy' },
      { name: 'Pájka + tavidlo', qty: 'množství' },
    ],
    steps: [
      {
        title: 'Diagnostika',
        body: 'Multimetrem změř odpor mezi drain-source u všech MOSFET. Dva měly zkrat – ty jsou odpálené. Zkontroluj kondenzátory vizuálně (boule, netěsnost).',
      },
      {
        title: 'Výměna součástek',
        body: 'Odpáj nedostupné MOSFET pomocí odpájecího vzduchu. Očisti pad, nanesi tavidlo a připáj nové součástky. Stejný postup u kondenzátoru.',
      },
      {
        title: 'Test',
        body: 'Po výměně zkontroluj zkrat na napájecích kolejnicích. Připoj napájení přes proudový limitér a ověř funkčnost řízení.',
      },
    ],
    notes:
      'Při práci na výkonové elektronice vždy kontroluj i sousední součástky – přehřátí často poškodí více prvků než je vidět.',
  },
  {
    slug: '3d-enclosure-esp32',
    title: '3D tištěná krabička pro ESP32 projekt',
    category: '3D tisk',
    shortDescription:
      'Kryt pro ESP32 teploměr s průřezem pro OLED displej a otvory pro senzor BME280.',
    image:
      'https://images.pexels.com/photos/30720501/pexels-photo-30720501.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Detail 3D tiskárny při výrobě oranžového plastového dílu',
    date: '2026-04-15',
    purpose:
      'Vytvořit ochranný kryt pro ESP32 teploměr, který vypadá profesionálně a chrání elektroniku před prachem.',
    description:
      'V Fusion 360 jsem navrhl dvoudílnou krabičku pro ESP32 teploměr. Spodní díl má otvory pro kablíky, horní díl má výřez pro OLED displej a mřížku pro ventilaci senzoru BME280. Tisknuto z PETG černé barvy.',
    components: [
      { name: 'Filament PETG černé', qty: 'cca 60g' },
      { name: 'M3 šroubky 12mm', qty: '4×' },
      { name: 'M3 vsuvky pro plast', qty: '4×' },
    ],
    steps: [
      {
        title: 'Modelování v Fusion 360',
        body: 'Vytvoř skici s přesnými rozměry desky, displeje a senzoru. Použij parametrické modelování pro snadné úpravy.',
      },
      {
        title: 'Příprava slicu',
        body: 'V PrusaSlicer nastav výplň 25%, s vrstvou 0.2mm. PETG tiskni na 240°C, stůl 80°C. Použij raft pro lepší přilnavost.',
      },
      {
        title: 'Tisk a dokončení',
        body: 'Po tisku odstraň raft, očisti otvory pro šroubky a osaď vsuvky. Sestav krabičku s elektronikou uvnitř.',
      },
    ],
    notes:
      'PETG je odolnější než PLA a lépe odolává teplotám v dílně, ale je těžší tisknout – pozor na stringing.',
    links: [{ label: 'Fusion 360', url: 'https://www.autodesk.com' }],
  },
  {
    slug: 'laser-engraved-panel',
    title: 'Laserem gravírovaný čelní panel pro zdroj',
    category: 'DIY',
    shortDescription:
      'Profesionálně vypadající čelní panel pro laboratorní zdroj – gravírování do černé plexi skla.',
    image:
      'https://images.pexels.com/photos/7254428/pexels-photo-7254428.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Laserová rytá gravírovací stroj při práci na dřevěném kusu',
    date: '2026-03-10',
    purpose:
      'Vytvořit profesionální vzhled čelního panelu pro lab zdroj s popisky funkcí.',
    description:
      'Použil jsem černé plexi sklo 3mm a CO2 laser pro gravírování popisků a vystřižení otvorů. Popisky byly navrženy v Inkscape a rasterizovány pro gravírování. Výsledek vypadá jako tovární produkt.',
    components: [
      { name: 'Černé plexi sklo 3mm', qty: 'kus A4' },
      { name: 'Laserový řezací stroj CO2 40W', qty: 'přístup' },
      { name: 'Inkscape pro vektorový návrh', qty: 'software' },
    ],
    steps: [
      {
        title: 'Návrh v Inkscape',
        body: 'Vytvoř vektorový návrh s přesnými rozměry panelu. Popisky nastav pro gravírování (raster), obrysové řezy pro střih (vector).',
      },
      {
        title: 'Gravírování a řez',
        body: 'Nejprve vygravíruj popisky malým výkonem, pak proveď obrysový řez plným výkonem. Rychlost 20%, výkon 60% pro gravírování.',
      },
      {
        title: 'Dokončení',
        body: 'Očisti panel lihem a osaď do krytu zdroje. Vyplň gravírované popisky bílou barvou pro lepší kontrast.',
      },
    ],
    notes:
      'Při práci s CO2 laserem vždy používej ventilaci a ochranné brýle – PVC plexi uvolňuje toxické plyny.',
  },
  {
    "slug": "oprva",
    "title": "pokus",
    "category": "Opravy",
    "shortDescription": "",
    "image": "https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg",
    "imageAlt": "pokus",
    "date": "2026-09-08",
    "purpose": "",
    "description": "",
    "components": [],
    "steps": [],
    "notes": ""
  },
];
