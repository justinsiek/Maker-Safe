
# MakerSafe PRD (Hackathon MVP)

## Problem Statement

Every year, thousands of students, hobbyists, and tinkerers use makerspaces. They’re a great resource for people to get their hands dirty in the world of woodworking, metalworking, and robotics. Unfortunately, most makerspaces currently have two big problems that slow productivity and put makers at risk of serious injury:

1. **Limited safety monitoring/enforcement** — staff can’t watch every station at all times.
2. **Unclear machine availability** — it’s not always obvious which tools/stations are currently in use.

---

## Project Summary

**MakerSafe** is a real-time makerspace safety dashboard that uses computer vision to (1) identify makers as they enter the space and (2) monitor tool/station usage for safety violations.

* When a maker walks past the **login camera**, the system recognizes their face and adds them to the live dashboard as **Idle**.
* When they step into the **station camera** frame, the station is marked **In Use**, the maker is marked **Active**, and the system continuously checks for required safety gear (MVP: **goggles worn properly**).
* If goggles are not detected, the maker and station flip to a **Violation** state and a violation record is logged with a snapshot image.

The makerspace has **one shared admin dashboard screen** (single-page UI). There is no real authentication; the dashboard uses a simple shared “fake auth” login (**username == username** and **password == password**). The system is designed for **1 station now**, but the DB schema and APIs support adding more stations later.

**Hardware note:** Multiple webcams (login + station) are connected to a **single Raspberry Pi** (one Pi total). **Face recognition runs on both the login camera and the station camera.**

---

## Goals and Non-Goals

### Goals

* Show a live, single-screen admin view of:

  * Makers currently present (**Idle / Active / Violation**)
  * Station status (**Idle / In Use / Violation**)
  * A violations list with **expandable image preview**
* Face-recognition “check-in” via login camera
* Station camera performs **face recognition** and enforces goggles rule immediately
* Real-time updates via **WebSockets** (no refresh required)
* Store violation images in **Supabase Storage** and reference them in the DB
* SenseCAP indicator reflects station state (gray/green/flashing red)

### Non-Goals (MVP)

* Real authentication / roles / per-user accounts
* Multi-person per station (assume **one person**)
* Maker certifications / gating access to tools
* Session tracking and analytics
* Notifications (SMS/email), audit exports, retention policies
* Device authentication / rate limiting / hardening
* Privacy/compliance workflows (consent, retention, etc.)

---

## Tech Stack

### Frontend

* **Vite + React**
* Single dashboard screen:

  * Makers list (cards with status color)
  * Stations list/map (1 now, N later)
  * Violations feed (expand to view snapshot image)

### Backend

* **Flask** (REST + WebSocket)
* WebSocket server pushes state changes to all connected dashboards
* Receives camera/device events (login recognized, station recognized, violation)

### Database & Storage

* **Supabase Postgres**
* **Supabase Storage** bucket for violation images (e.g., `violations/`)

### Computer Vision (Sponsor Requirement)

* **Viam**

  * Face recognition (login camera + station camera)
  * YOLO goggles detection (station camera)

### Hardware

* **Raspberry Pi 4 (8GB)** (single Pi controlling all cameras)
* Multiple **USB webcams**

  * Login camera
  * Station camera(s)
* **SenseCAP Indicator** for station state:

  * Gray = idle
  * Green = safe/active
  * Flashing Red = violation

---

## User Experience and UI Requirements

### Single Screen Layout (Admin Monitor)

* **Stations panel**

  * Each station shows current state (**gray/green/red**) and active maker name (if any)
* **Makers panel**

  * Maker cards with status colors:

    * Idle = gray
    * Active = green + shows station name
    * Violation = red + shows violation type
* **Violations panel**

  * List of violation entries showing:

    * maker name
    * station name
    * violation type
    * timestamp
  * Expandable card displays the stored snapshot image

### Real-time Behavior

* Any new detection (login, station entry, violation, resolution, station cleared) updates the UI immediately via WebSocket broadcasts.
* Makers who are **offline** (not present) do not appear on the dashboard.

---

## System Architecture Overview

### High-Level Components

* **Raspberry Pi (Edge Controller)**

  * Captures frames from multiple webcams
  * Runs Viam face recognition on:

    * Login camera feed
    * Station camera feed
  * Runs Viam YOLO goggles detection on:

    * Station camera feed
  * Controls SenseCAP indicator state based on station state
  * Sends events to Flask backend via REST

* **Flask Backend**

  * Receives events from Pi
  * Writes persistent data to Supabase (makers, stations, violations)
  * Maintains current state (maker_status, station_status)
  * Pushes realtime updates to dashboard via WebSocket

* **Supabase**

  * Postgres for structured data
  * Storage bucket for violation images

### Event Flow (Happy Path)

1. **Login camera** detects and recognizes maker (face ID)
   → backend marks maker as **idle** (present) and broadcasts dashboard update.
2. Maker steps into **station camera** frame
   → station camera recognizes maker (face ID)
   → backend sets maker **active** + station **in_use** and broadcasts updates.
3. Station camera runs goggles detection continuously:

   * If goggles OK → station stays **green**, maker stays **active**
   * If goggles NOT OK → backend logs a violation + sets maker/station to **violation** + SenseCAP flashes red
4. When goggles become OK again → backend clears violation-active state → maker/station return to **active** (green)
5. When maker leaves station camera frame → backend sets station to **idle** and maker to **idle** (still present)

### Key Rules

* **Immediate enforcement:** the moment a maker is recognized at the station camera, goggles must be detected; otherwise it’s instantly a violation.
* **One continuous incident = one violation:** only log a new violation when state transitions from non-violation → violation (avoid duplicates while already in violation).

### State Ownership

* Backend is the source of truth for **current** maker/station states.
* Supabase stores persistent history (violations, makers, stations). Current state is stored in `maker_status` and `station_status`.

## Acceptance Criteria (Demo Checklist)

* Maker recognized at login camera appears on dashboard as **Idle**
* Maker recognized at station camera changes station → **In Use** and maker → **Active**
* If goggles missing, station/maker turn **Violation** immediately and **one** violation record is logged
* Violation list entry expands to show snapshot image from Supabase Storage
* Station state correctly drives SenseCAP indicator:

  * idle = gray
  * active safe = green
  * violation = flashing red
* Schema supports adding a second station/camera without redesign