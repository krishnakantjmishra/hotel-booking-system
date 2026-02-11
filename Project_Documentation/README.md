# Project Documentation Guide

Welcome to the comprehensive documentation for the Hotel Booking System. This folder helps you understand the entire project for interview preparation.

## 📂 Section 1: Features & Architecture
High-level explanation of **How** things work and **Why** we built them this way.

- **[01. Project Overview](1_Features_and_Architecture/01_Project_Overview.md)**
  - Tech Stack (React, Django, PostgreSQL, AWS).
  - High-Level Architecture (Request Flow).
- **[02. Authentication & Security](1_Features_and_Architecture/02_Authentication_Flow.md)**
  - JWT Tokens (Access vs Refresh).
  - Login-Free Booking Flow (OTP).
- **[03. Hotel Inventory System](1_Features_and_Architecture/03_Hotel_Inventory_System.md)**
  - The Inventory Matrix (14-Day View).
  - Bulk Update Logic.
  - 14-Day Limit & Past Date Blocking.
  - Image Handling (HEIC -> JPEG conversion).
- **[04. Booking Process](1_Features_and_Architecture/04_Booking_Process.md)**
  - Validation Logic (Availability checks).
  - Email Notifications (SMTP).
- **[05. Deployment (DevOps)](1_Features_and_Architecture/05_Deployment_Infrastructure.md)**
  - AWS EC2, Nginx, Gunicorn.
  - Deployment Scripts.

## 📂 Section 2: Codebase Walkthrough
Detailed tour of the files. "What is this file for?"

- **[01. Backend (Django)](2_Codebase_Walkthrough/01_Backend_Walkthrough.md)**
  - Explanation of `core`, `hotels`, `bookings`, `users` apps.
  - Key files like `models.py`, `serializers.py`, `views.py`.
- **[02. Frontend (React)](2_Codebase_Walkthrough/02_Frontend_Walkthrough.md)**
  - Explanation of `src/pages`, `src/components`, `src/context`.
  - How `axios.js` handles tokens automatically.
