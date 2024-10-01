# IRCTC Railway Management API

## Installation
1. Clone the repository
2. Run `npm install` to install the dependencies
3. Set up `.env` file as per the `.env.example`
4. Set up MySQL database and run the SQL script for creating tables
5. Run `node app.js` to start the server

## API Endpoints
- `POST /api/users/register`: Register a new user
- `POST /api/users/login`: Log in as a user
- `POST /api/admin/addTrain`: Admin only - Add a new train (protected by API key)
- `GET http://localhost:3000/api/trains?source={source}&destination={destination}`: Check train availability (requires authentication)
- `POST /api/trains/book`: Book a seat on a train (requires authentication) 
- `GET /api/users/bookings`: Get the booking details of the logged In User 