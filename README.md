# Discord Personal Music Bot with YouTube Playlists

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18.x-brightgreen?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue?logo=typescript)](https://www.typescriptlang.org/)

## Overview

This project is a personal Discord music bot that allows you to play music from YouTube, including your personal YouTube playlists.  It's designed to be easy to set up and use within your Discord server, offering features like playlist selection, queue management, and basic music controls.

**Key Features:**

*   **YouTube Playback:** Plays audio directly from YouTube videos and playlists.
*   **Personal Playlists:** Integrates with your YouTube account to access and play your curated playlists (requires Google Login).
*   **Basic Controls:** Commands for play, pause, skip, stop, and queue management.
*   **Search by URL:** Play music by directly providing YouTube video or playlist URLs.
*   **Queue System:** Manages a queue of songs to be played sequentially.
*   **Discord Slash Commands:**  Utilizes Discord's slash commands for a user-friendly interaction.
*   **Persistent User Data:** Stores user authentication tokens in a database to remember logged-in users (PostgreSQL).

## Table of Contents

*   [Overview](#overview)
*   [Features](#features)
*   [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Configuration](#configuration)
    *   [Environment Variables](#environment-variables)
    *   [Database Setup](#database-setup)
*   [Usage](#usage)
    *   [Commands](#commands)
    *   [Google Login](#google-login)
    *   [Playing Music](#playing-music)
    *   [Playlist Selection](#playlist-selection)
*   [Contributing](#contributing)
*   [License](#license)
*   [Support](#support)

## Getting Started

Follow these steps to get your personal Discord music bot up and running.

### Prerequisites

Before you begin, ensure you have the following installed and configured:

*   **Node.js and npm (or yarn):**  Node.js runtime environment and npm package manager are required to run the bot.  Download and install from [nodejs.org](https://nodejs.org/).
*   **PostgreSQL Database:** A PostgreSQL database is needed to store user authentication data.  Install and set up a PostgreSQL server. You can download it from [postgresql.org](https://www.postgresql.org/).
*   **Discord Bot Token:** You need to create a Discord Bot application and obtain its token.
    1.  Go to the [Discord Developer Portal](https://discord.com/developers/applications).
    2.  Create a new application.
    3.  Navigate to the "Bot" tab and click "Add Bot".
    4.  Enable "Presence Intent", "Server Members Intent", and "Message Content Intent" (if required for future features, currently not strictly necessary but good practice).
    5.  Copy the **Token**. You will need this as your `DISCORD_BOT_TOKEN` environment variable.
*   **Google Cloud Credentials:**  To enable YouTube playlist access, you'll need Google Cloud API credentials.
    1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
    2.  Create a new project or select an existing one.
    3.  Enable the **YouTube Data API v3** and **People API**.
    4.  Create OAuth 2.0 credentials:
        *   Navigate to "APIs & Services" > "Credentials".
        *   Click "Create Credentials" > "OAuth client ID".
        *   Select "Web application" as the application type.
        *   Name your OAuth client.
        *   Add `http://localhost:3000/auth/google/callback` (or your deployed URL with `/auth/google/callback`) to "Authorized redirect URIs".
        *   Click "Create".
        *   Download the credentials as JSON or copy the **Client ID** and **Client Secret**. You'll need these as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables.  Set the **Redirect URI** as `REDIRECT_URI` environment variable to `http://localhost:3000/auth/google/callback` (or your deployed URL).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/SniksaX/Discord-Music-Bot
    cd Discord-Music-Bot
    ```

2.  **Install dependencies:**

    ```bash
    npm install  # or yarn install
    ```

### Configuration

1.  **Create a `.env` file:** In the root directory of your project, create a file named `.env`.

2.  **Populate `.env` with environment variables:** Copy and paste the following into your `.env` file and fill in the values according to your setup.

    ```env
    PORT=3000

    DATABASE_USER=your_db_user
    DATABASE_HOST=localhost
    DATABASE_NAME=your_db_name
    DATABASE_PASSWORD=your_db_password
    DATABASE_PORT=5432 # or your PostgreSQL port

    DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN

    GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
    REDIRECT_URI=http://localhost:3000/auth/google/callback # Or your deployed callback URL
    ```

    **Replace the placeholder values** with your actual database credentials, Discord Bot Token, and Google Cloud credentials.

### Environment Variables

| Variable               | Description                                                    | Example                                   | Required |
| ---------------------- | -------------------------------------------------------------- | ----------------------------------------- | -------- |
| `PORT`                 | Port for the Express server to listen on.                       | `3000`                                    | No       |
| `DATABASE_USER`        | PostgreSQL database username.                                | `db_user`                                 | Yes      |
| `DATABASE_HOST`        | PostgreSQL database host address.                              | `localhost` or `127.0.0.1` or your DB host | Yes      |
| `DATABASE_NAME`        | PostgreSQL database name.                                    | `musicbot_db`                             | Yes      |
| `DATABASE_PASSWORD`    | PostgreSQL database password.                                | `your_secret_password`                    | Yes      |
| `DATABASE_PORT`        | PostgreSQL database port.                                      | `5432`                                    | No       |
| `DISCORD_BOT_TOKEN`    | Your Discord Bot Token obtained from the Discord Developer Portal. | `YOUR_BOT_TOKEN_HERE`                     | Yes      |
| `GOOGLE_CLIENT_ID`     | Your Google Cloud Client ID for OAuth 2.0.                       | `your_google_client_id.apps.googleusercontent.com` | Yes      |
| `GOOGLE_CLIENT_SECRET` | Your Google Cloud Client Secret for OAuth 2.0.                   | `YOUR_GOOGLE_CLIENT_SECRET`               | Yes      |
| `REDIRECT_URI`         | Redirect URI for Google OAuth 2.0 (must match Google Cloud Console). | `http://localhost:3000/auth/google/callback` | Yes      |

### Database Setup

1.  **Create the database:** Using a PostgreSQL client (like `psql` command-line tool or pgAdmin), connect to your PostgreSQL server and create the database specified in your `.env` file (`DATABASE_NAME`).

    ```sql
    CREATE DATABASE your_db_name; -- Replace with your DATABASE_NAME
    ```

2.  **Run database schema:** Execute the SQL schema file (`src/db/schema.sql`) to create the necessary tables. You can use `psql` or a PostgreSQL client to run this SQL script against your newly created database.

    Using `psql`:

    ```bash
    psql -U your_db_user -d your_db_name -f src/db/schema.sql
    ```
    *(Replace `your_db_user` and `your_db_name` with your actual database user and name.)*

## Usage

### Commands

The following commands are available for the bot in your Discord server:

*   `/play <url>`: Plays a YouTube video or playlist from the provided URL.
*   `/login`: Initiates the Google login process to access your YouTube playlists. You will receive a Direct Message (DM) with a login link.
*   `/selectplaylist`: After logging in, use this command to select one of your YouTube playlists to play. A menu will appear for you to choose from.
*   `/skip`: Skips the currently playing song and plays the next in the queue.
*   `/stop`: Stops the music playback and clears the current queue.
*   `/pause`: Pauses or resumes the current music playback.

**Adding the bot to your server:**

1.  Go back to the [Discord Developer Portal](https://discord.com/developers/applications).
2.  Select your application, then go to "OAuth2" > "URL Generator".
3.  Select "bot" and "applications.commands" under "scopes".
4.  Choose the bot permissions the bot needs (e.g., "View Channels", "Connect", "Speak").
5.  Copy the generated URL and paste it into your browser.
6.  Select the server you want to add the bot to and authorize it.

### Google Login

To use the playlist selection feature, you need to log in with your Google account:

1.  In Discord, use the `/login` command.
2.  The bot will send you a Direct Message (DM) with a Google login link.
3.  Click the link and authorize the bot to access your YouTube account (read-only access to playlists and basic profile info).
4.  Once authorized, you'll see a "Authentication successful! Return to Discord." message in your browser.
5.  You can now use the `/selectplaylist` command.

### Playing Music

*   **Using `/play <url>`:**  Simply use the `/play` command followed by a YouTube video or playlist URL. The bot will join your voice channel (you must be in one) and start playing the audio.

    ```
    /play https://www.youtube.com/watch?v=dQw4w9WgXcQ
    /play https://www.youtube.com/playlist?list=PLFgquLnLg2FFlu342Wbv7rlBk2sbj39xg
    ```

### Playlist Selection

After successful Google login:

1.  Use the `/selectplaylist` command in Discord.
2.  A dropdown menu will appear with a list of your YouTube playlists.
3.  Select a playlist from the menu.
4.  The bot will add all videos from the selected playlist to the queue and start playing.

## Contributing

Contributions are welcome!  If you'd like to contribute to this project, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them.
4.  Push your branch to your forked repository.
5.  Submit a pull request to the main repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For any questions or issues, please open an issue on the [GitHub repository](https://github.com/SniksaX/Discord-Music-Bot/issues).

---

**Disclaimer:** This is a personal project and is provided as-is. Use it responsibly and respect YouTube's Terms of Service and API usage guidelines.  Make sure to regenerate your Google Cloud credentials and Discord Bot Token if you suspect any security compromise.
