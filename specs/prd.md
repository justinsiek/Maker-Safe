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

---

## API Routes (Flask)

### REST Endpoints (called by Raspberry Pi)

| Method | Path                        | Purpose                                                             |
| ------ | --------------------------- | ------------------------------------------------------------------- |
| POST   | `/api/edge/login_seen`      | Login cam recognized a maker (face ID) and marks them present/idle. |
| POST   | `/api/edge/station_seen`    | Station cam recognized a maker at a station (face ID).              |
| POST   | `/api/edge/violation`       | Station cam detected a violation + uploads snapshot image.          |
| POST   | `/api/edge/station_cleared` | Station cam no longer sees a maker (station becomes idle).          |

#### Payload Examples

**POST `/api/edge/login_seen`**

```json
{
  "camera_key": "login_cam_1",
  "maker_external_label": "justin",
  "confidence": 0.93,
  "captured_at": "2026-01-16T21:12:00Z"
}
```

**POST `/api/edge/station_seen`**

```json
{
  "camera_key": "station_cam_1",
  "station_id": "uuid-station-1",
  "maker_external_label": "justin",
  "confidence": 0.90,
  "captured_at": "2026-01-16T21:13:02Z"
}
```

**POST `/api/edge/violation`** (multipart form-data)

* Fields:

  * `camera_key`
  * `station_id`
  * `maker_external_label`
  * `violation_type` (e.g., `GOGGLES_NOT_WORN`)
  * `captured_at`
  * `image` (file)

**POST `/api/edge/station_cleared`**

```json
{
  "camera_key": "station_cam_1",
  "station_id": "uuid-station-1",
  "captured_at": "2026-01-16T21:14:10Z"
}
```

### Dashboard Endpoints

| Method | Path                        | Purpose                                                        |
| ------ | --------------------------- | -------------------------------------------------------------- |
| POST   | `/api/dashboard/fake_login` | Shared fake login gate.                                        |
| GET    | `/api/dashboard/state`      | Initial page load state (makers, stations, recent violations). |

### WebSocket Endpoint

* `GET /ws`

#### WebSocket Event Types

* `maker_joined` (maker became present/idle)
* `maker_status_changed` (idle/active/violation + station_id)
* `station_status_changed` (idle/in_use/violation + maker_id)
* `violation_created` (violation record + image URL)
* `violation_resolved` (optional, if you track resolution time)

---

## Database Schema (Supabase)

### Supabase Storage

* Bucket: `violations`
* Suggested object path: `violations/{violation_id}.jpg`

### Tables

#### `makers`

Stores known makers for UI display and linking events.

* `id` (uuid, pk)
* `display_name` (text, required)
* `external_label` (text, unique) — matches Viam’s person label
* `created_at` (timestamptz, default now)

> MVP decision: do not store face embeddings in Supabase; face ID is handled by Viam. Supabase stores stable maker identifiers/labels only.

#### `stations`

Supports N stations later (even though MVP uses 1).

* `id` (uuid, pk)
* `name` (text, required)
* `created_at` (timestamptz, default now)

#### `cameras` (recommended)

Maps multiple webcams connected to the single Pi.

* `id` (uuid, pk)
* `camera_key` (text, unique) — e.g. `login_cam_1`, `station_cam_1`
* `role` (text) — `login` or `station`
* `station_id` (uuid, nullable, fk → `stations.id`) — only for station cameras
* `device_path` (text, nullable) — e.g. `/dev/video0` (debugging)
* `created_at` (timestamptz, default now)

#### `maker_status`

Current live maker state (only present makers appear).

* `maker_id` (uuid, pk, fk → `makers.id`)
* `status` (text) — `idle`, `active`, `violation`
* `station_id` (uuid, nullable, fk → `stations.id`)
* `updated_at` (timestamptz, default now)

> Offline behavior: if maker is offline, they have no row in `maker_status`.

#### `station_status`

Current live station state.

* `station_id` (uuid, pk, fk → `stations.id`)
* `status` (text) — `idle`, `in_use`, `violation`
* `active_maker_id` (uuid, nullable, fk → `makers.id`)
* `updated_at` (timestamptz, default now)

#### `violations`

Historical violations list shown in the UI.

* `id` (uuid, pk)
* `maker_id` (uuid, fk → `makers.id`)
* `station_id` (uuid, fk → `stations.id`)
* `camera_id` (uuid, nullable, fk → `cameras.id`)
* `violation_type` (text) — e.g. `GOGGLES_NOT_WORN`
* `image_url` (text) — public URL or storage path
* `created_at` (timestamptz, default now)
* `resolved_at` (timestamptz, nullable) — optional, useful for “continuous incident” logic

### Recommended Indexes

* `makers.external_label` UNIQUE
* `cameras.camera_key` UNIQUE
* `violations.created_at` index (for newest-first feed)
* Optional: `station_status.active_maker_id` index

---

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

---

## Future Enhancements (Post-Hackathon)

* Real auth + roles (admin vs staff)
* Maker certifications per tool
* Multi-person station support
* Notifications (SMS/email) and exportable reports
* Device authentication and secure ingestion
* Better privacy controls (consent, retention, anonymization)
