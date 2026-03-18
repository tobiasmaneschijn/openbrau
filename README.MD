# OpenBrau 🍻

**OpenBrau** is a modern, blazing-fast, and fully self-hosted homebrew management platform. Built for brewers who want the sleek, feature-rich experience of premium cloud-based brewing apps (like Brewfather or BeerSmith) but demand complete ownership of their data and no monthly subscriptions.

## 🚀 Why OpenBrau?

* **100% Free & Open Source:** No paywalls, no tier limits, no locking your recipes behind a subscription.
* **You Own Your Data:** Everything lives on your own hardware or VPS in a local PostgreSQL database.
* **Modern Tech Stack (2026):** Built with SvelteKit (Svelte 5), Bun, and Drizzle ORM for a zero-latency native app feel. 
* **Hardware Ready:** Built-in webhook endpoints to natively support IoT brewing devices like Tilt Hydrometers, iSpindel, and BrewPi.
* **Containerized First:** Designed to be deployed in seconds using Docker Compose.

## ⚙️ Features

* **Advanced Recipe Designer:** Dynamic, real-time calculation of OG, FG, IBU (Tinseth/Rager), Color (SRM/EBC), and ABV.
* **Equipment Profiles:** Dial in your specific mash tun deadspace, boil-off rates, and trub losses for perfect scaling.
* **Water Chemistry Engine:** Source water profiling, target matching, and automatic acid/salt addition calculations.
* **Batch Tracking:** Move batches from *Planning* -> *Brewing* -> *Fermenting* -> *Conditioning* -> *Kegged/Bottled*.
* **Interactive Fermentation Charts:** Real-time plotting of gravity and temperature data from your hardware.
* **BeerXML Support:** Easily import your existing recipes from other platforms.

## 🛠️ Quick Start (Self-Hosting)

Deploying OpenBrau to a VPS (DigitalOcean, Hetzner, etc.) or your local home lab is simple. 

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/openbrau.git](https://github.com/yourusername/openbrau.git)
   cd openbrau
   ```
2. Copy the example environment file and set your secrets:
   ```bash
   cp .env.example .env
   ```
3. Spin up the stack:
   ```bash
   docker compose up -d
   ```
OpenBrau will be available at `http://localhost:3000`.

## 🤝 Contributing
OpenBrau is built by a homebrewer, for homebrewers. Pull requests are welcome! Check out `spec.md` for our architectural guidelines and roadmap.

## 📄 License
MIT License. Brew free or die.