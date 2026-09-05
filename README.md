# AushadhiChakra-Core
Spatial-temporal pharmaceutical supply resilience &amp; FEFO rebalancing engine | PS02 - Healthcare
# AushadhiChakra: Pharmaceutical Supply Resilience & FEFO Rebalancing Engine

[![Live Demo](https://img.shields.io/badge/Live_Demo-Replit_App-blue)](https://aushadhi-chakra-command-center--kethanreddy342.replit.app)
[![Track](https://img.shields.io/badge/Track-Healthcare_%2F_SDG_3-emerald)](#)
[![Problem Statement](https://img.shields.io/badge/Problem_Statement-PS02-orange)](#)

> **Team Name:** CascadeNull  
> **Problem Statement:** PS02 — From One Empty Shelf to a Regional Shortage  
> **Target Domain:** Healthcare / Disability (UN SDG 3: Good Health and Well-Being)  

---

## 1. Executive Overview
When rural Primary Health Centres (PHCs) run out of frontline essential medicines, displaced patients migrate to neighboring clinics, triggering 300% burn-rate surges that collapse regional supply within 48 hours. Meanwhile, nearby district hospital warehouses hold surplus batches nearing expiration that end up incinerated. 

**AushadhiChakra** is an intelligent, zero-hardware spatial-temporal healthcare supply platform that:
1. Predicts stockout contagion using spatial gravity displacement and cross-drug therapeutic substitution.
2. Automates First-Expired, First-Out (FEFO) peer-to-peer rebalancing between public health clinics before localized shortages turn regional.
3. Generates legally binding, audit-proof CDSCO Form 17/18 transfer vouchers with HMAC-SHA256 signatures.
4. Routes rebalanced stock with zero extra CapEx along returning 108 emergency ambulance corridors.

---

## 2. Core Architecture & Features
* **Geospatial Resilience Grid:** Real-time visualization of health facility inventory horizons and depletion states across Udupi District, Karnataka.
* **Dual-Objective FEFO Optimizer (MILP):** Minimizes transit distance while penalizing donor retention of batches expiring in < 90 days.
* **Offline-First SMS Telemetry:** Ingests structured 2-way SMS webhooks (`STK <facility_id> <drug_code> <units>`) for remote clinics lacking reliable broadband.
* **AushadhiWatch Public Transparency Portal:** Real-time taluk-level essential drug availability view for citizens.

---

## 3. Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet
* **Backend:** Node.js, Express.js (Spatial Haversine distance calculations, dynamic rebalancing heuristics)
* **Deployment:** Hosted on Replit Cloud Infrastructure

---

## 4. Local Setup & Execution
```bash
# Clone the repository
git clone [https://github.com/nagurukethankumarreddy-alt/AushadhiChakra-Core.git](https://github.com/nagurukethankumarreddy-alt/AushadhiChakra-Core.git)

# Install dependencies
npm install

# Run application locally
npm run dev
