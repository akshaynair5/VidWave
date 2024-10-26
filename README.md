# VidWave

## Description
This project is a comprehensive video sharing platform that allows users to upload, manage, and interact with videos, playlists, comments, and user profiles. The application includes features for user registration, authentication, channel subscriptions, video management, and social interactions, such as liking comments and videos.

## Table of Contents
- [Features](#features)
- [API Endpoints](#api-endpoints)
  - [User Registration and Authentication](#user-registration-and-authentication)
  - [User Profile Management](#user-profile-management)
  - [Manage Videos](#manage-videos)
  - [Retrieve and Add Comments](#retrieve-and-add-comments)
  - [Manage Playlists](#manage-playlists)
  - [Manage Channel Subscriptions](#manage-channel-subscriptions)
  - [Manage Tweets](#manage-tweets)
  - [Retrieve Channel Statistics](#retrieve-channel-statistics)
  - [Retrieve Channel Videos](#retrieve-channel-videos)
  - [Toggle Likes](#toggle-likes)
  - [Retrieve Liked Videos](#retrieve-liked-videos)
  - [Unlike Item](#unlike-item)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Contributing](#contributing)
- [License](#license)

## Features
- User registration and authentication
- Profile management, including avatar and cover image uploads
- Video uploading, updating, and deletion
- Commenting on videos
- Creating and managing playlists
- Channel subscription and management
- Viewing and managing watch history
- Liking and unliking videos, comments, and tweets

## API Endpoints

### User Registration and Authentication
- **POST** `/register`: Registers a new user with an avatar and cover image; file uploads are handled by the upload middleware.
- **POST** `/login`: Authenticates a user and returns access tokens.
- **POST** `/logout`: Logs out the user; requires a valid JWT for verification.
- **POST** `/refresh-token`: Refreshes the user's access token; checks the validity of the JWT.

### User Profile Management
- **POST** `/change-password`: Changes the user's password; requires a valid JWT for verification.
- **POST** `/current-user`: Retrieves details of the currently logged-in user; requires a valid JWT for verification.
- **PATCH** `/upload-avatar`: Updates the user's avatar; file upload is handled by the upload middleware.
- **PATCH** `/upload-cover-image`: Updates the user's cover image; file upload is handled by the upload middleware.
- **PATCH** `/update-user-details`: Updates the user's profile details; requires a valid JWT for verification.

### Manage Videos
- **GET** `/`: Retrieves a list of all videos available.
- **POST** `/`: Publishes a new video along with a thumbnail; file uploads are handled by the upload middleware.
- **GET** `/:videoId`: Fetches details of a specific video identified by its video ID.
- **PATCH** `/:videoId`: Updates the details of a specific video identified by its video ID.
- **DELETE** `/:videoId`: Deletes a specific video identified by its video ID.

### Retrieve and Add Comments
- **GET** `/:videoId`: Fetches comments associated with a specific video.
- **POST** `/:videoId`: Allows users to add a new comment to the specified video.
- **DELETE** `/c/:commentId`: Removes a specific comment identified by its comment ID.
- **PATCH** `/c/:commentId`: Updates the content of a specific comment based on its comment ID.

### Manage Playlists
- **POST** `/`: Creates a new playlist.
- **GET** `/:playListId`: Retrieves details of a specific playlist identified by its playlist ID.
- **PATCH** `/:playListId`: Updates the details of a specific playlist.
- **DELETE** `/:playListId`: Deletes a specific playlist identified by its playlist ID.
- **PATCH** `/add/:videoId/:playListId`: Adds a specific video to the designated playlist.
- **PATCH** `/remove/:videoId/:playListId`: Removes a specific video from the designated playlist.
- **GET** `/:userId`: Fetches all playlists created by a specific user identified by their user ID.

### Manage Channel Subscriptions
- **GET** `/c/:channelId`: Retrieves a list of channels subscribed to by a specific channel identified by its channel ID.
- **POST** `/c/:channelId`: Toggles the subscription status for a specific channel identified by its channel ID.
- **DELETE** `/c/:channelId`: Unsubscribes the user from a specific channel identified by its channel ID.

### Manage Tweets
- **POST** `/`: Creates a new tweet.
- **GET** `/`: Retrieves a list of tweets posted by the user.
- **PATCH** `/:tweetId`: Updates the content of a specific tweet identified by its tweet ID.
- **DELETE** `/:tweetId`: Deletes a specific tweet identified by its tweet ID.

### Retrieve Channel Statistics
- **GET** `/channel-stats`: Fetches statistics related to the channel, such as subscriber count, views, and engagement metrics.

### Retrieve Channel Videos
- **GET** `/channel-videos`: Retrieves a list of videos uploaded to the channel, including details like titles, descriptions, and publication dates.

### Toggle Likes
- **POST** `/toggle/v/:videoId`: Likes or unlikes a specific video identified by its video ID.
- **POST** `/toggle/c/:commentId`: Likes or unlikes a specific comment identified by its comment ID.
- **POST** `/toggle/t/:tweetId`: Likes or unlikes a specific tweet identified by its tweet ID.

### Retrieve Liked Videos
- **GET** `/videos`: Fetches a list of videos that the user has liked.

### Unlike Item
- **DELETE** `/:likeId`: Removes a like for a specific item identified by its like ID.

## Technologies Used
- Node.js
- Express.js
- MongoDB (or your chosen database)
- Multer (for file uploads)
- JWT (for authentication)

## Installation
1. Clone the repository: `git clone <repository-url>`
2. Navigate to the project directory: `cd <project-directory>`
3. Install dependencies: `npm install`
4. Set up environment variables as needed.
5. Start the server: `npm start`

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.
