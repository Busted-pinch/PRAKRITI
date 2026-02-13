# Techathon - PRAKRITI Monorepo

## Overview

This repository contains the source code for the Techathon 3.0 - PRAKRITI project, a comprehensive platform integrating environmental data, digital twins, and user engagement features.

The project is structured as a monorepo with the following components:

- **Backend**: A FastAPI-based application handling business logic, API endpoints, and AI integration.
- **Frontend**: A React application built with Vite and styled with TailwindCSS for the user interface.

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Package Manager**: Poetry
- **Database**: Supabase
- **Caching**: Redis
- **AI Agent**: LangGraph

### Frontend
- **Framework**: React (Vite)
- **Styling**: TailwindCSS

## Quick Start

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies using Poetry:
   ```bash
   poetry install
   ```

3. Run the application:
   ```bash
   poetry run python -m src
   ```

   The API will be available at http://localhost:8000.
   API Documentation: http://localhost:8000/docs

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:5173.
