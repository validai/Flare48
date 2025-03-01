# Flare48

## Flare48 - Your 48-Hour News Hub

Flare48 is a modern news aggregation platform that fetches and displays the latest news articles from various sources using multiple APIs. The platform ensures users stay informed with fresh stories updated within the last 48 hours.

## 🚀 Features

- 🔥 Fetches the latest news from Google News API, Google Search API, and Rapid API

- 🔍 Search functionality to find news on specific topics

- 💾 Save articles to revisit later

- 🛡️ Secure user authentication using Google SSO & JWT

- 📱 Responsive UI for seamless browsing on desktop and mobile

- 📖 Table of Contents

## Tech Stack

## Project Structure

## Installation & Setup

## Environment Variables

## API Usage

## Deployment

## License

## 🛠 Tech Stack

- Frontend (Client)

  - React (Vite) - Fast front-end development

  - TailwindCSS - Modern styling

  - Axios - API calls

  - React Router - Navigation

- Backend (Server)

  - Node.js & Express.js - API development

  - MongoDB Atlas - Cloud database

  - Mongoose - MongoDB ORM

  - JWT Authentication - Secure user login

- APIs Used

  - Google News API - Fetching latest news

  - Google Search API - Searching for articles

  - Rapid API - Additional news sources

## 📂 Project Structure

Flare48/
│── client/       # Frontend (React + Vite)
│── server/       # Backend (Node.js + Express)
│── .github/      # GitHub Actions workflows
│── render.yaml   # Deployment configuration
│── README.md     # Project documentation

## 🔧 Installation & Setup

- Prerequisites

  - Node.js (v18+)

  - MongoDB Atlas Account

  - Render Account (for deployment)

- 1️⃣ Clone the Repository

git clone https://github.com/your-username/Flare48.git
cd Flare48

- 2️⃣ Install Dependencies

- Client

cd client
npm install

- Server

cd server
npm install --no-package-lock

- 3️⃣ Start the Application

Client (Frontend)

cd client
npm run dev

Server (Backend)

cd server
npm start

## 🔑 Environment Variables

Create a .env file inside the server/ folder with the following:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NEWS_API_KEY=your_news_api_key
GOOGLE_SEARCH_API_KEY=your_google_api_key
GOOGLE_CX_ID=your_google_cx_id
RAPID_API_KEY=your_rapid_api_key

For the frontend (client/), create a .env file:

VITE_API_URL=http://localhost:3000
VITE_GOOGLE_SEARCH_API_KEY=your_google_api_key
VITE_NEWS_API_KEY=your_news_api_key
VITE_RAPID_API_KEY=your_rapid_api_key
VITE_GOOGLE_CX_ID=your_google_cx_id

## 📡 API Usage

- Endpoints

Get Latest News

GET /api/news

Search for News

GET /api/search?q=your-query

User Authentication

POST /auth/register - Register new users

POST /auth/login - Login with JWT authentication

## 🚀 Deployment

Deploying to Render

Both frontend and backend are deployed on Render. The deployment is configured using render.yaml. The GitHub Actions CI/CD pipeline ensures that the latest version is tested before deployment.

Deploying Manually

Push your changes to GitHub

Render will automatically detect changes and redeploy the services

## 📜 License

This project is MIT Licensed. Feel free to modify and use it as needed!

## 🎯 Future Improvements

- ✅ Add user profile pages

- ✅ Implement dark mode

- ✅ Improve article categorization

## 👨‍💻 Contributors

Developed by:
- Eric Cordoba
- Daniel Villavicencio
- Jaidon Clinton
- Maxwell Hurst

Contributors Welcome! 🎉

🚀 Enjoy Flare48! Stay updated with the latest news.

