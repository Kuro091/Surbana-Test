# Location Management API

## Description

This project is a NestJS application that manages locations within a hierarchical structure, such as buildings and their respective floors or areas. It provides a RESTful API for creating, updating, deleting, and retrieving location data.

## Features

- **Location Entity**: Defines the structure of a location, including properties like `id`, `locationName`, `building`, `locationNumber`, `area`, and relationships to parent and child locations.
- **Location Service**: Contains business logic for managing locations, including error handling and logging.
- **Location Controller**: Exposes RESTful endpoints for interacting with locations.
- **Data Transfer Objects (DTOs)**: Ensures type safety and validation for incoming and outgoing data.
- **Testing**: Comprehensive unit tests for both the service and controller using Jest.
- **Seeding**: A mechanism to populate the database with initial location data.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/location-api.git
   cd location-api
   ```

2. Install the dependencies:

   ```bash
   pnpm install
   ```

3. Set up your database configuration in the `.env` file (if applicable).

## Usage

1. Start the application in development mode:

   ```bash
   pnpm start:dev
   ```

2. The API will be available at `http://localhost:3000`.

3. Use tools like Postman or curl to interact with the API endpoints:

   - **Create a Location**: `POST /locations`
   - **Get All Locations**: `GET /locations`
   - **Get a Location by ID**: `GET /locations/:id`
   - **Update a Location**: `PUT /locations/:id`
   - **Delete a Location**: `DELETE /locations/:id`

## Testing

To run the tests, use the following command:

```bash
pnpm test
```

For coverage reports, run:

```bash
pnpm test:cov
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the [MIT License](LICENSE).
