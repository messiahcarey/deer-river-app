# 🏰 Deer River - Fantasy Town Manager

A comprehensive fantasy town management application built with Next.js, TypeScript, Prisma, and Tailwind CSS. Track the population, alliances, opinions, and resources of your fantasy settlement.

## ✨ Features

- **👥 People Management**: Track citizens, their relationships, and opinions
- **🏛️ Faction System**: Manage political groups and alliances
- **🗺️ Geographic System**: Interactive map with location tracking
- **💰 Resource Management**: Economic tracking and ledger system
- **📊 Analytics**: Relationship analysis and trend visualization
- **📝 Event Logging**: Complete audit trail of activities

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd deer-river-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Seed the database**
   ```bash
   npx ts-node prisma/seed.ts
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Development

1. **Start with Docker Compose**
   ```bash
   docker-compose up
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec app npx prisma migrate dev
   docker-compose exec app npx ts-node prisma/seed.ts
   ```

## 🌐 AWS Deployment

### Prerequisites

- AWS Account
- AWS CLI configured
- GitHub repository

### 1. Database Setup (AWS RDS)

1. **Create RDS PostgreSQL instance**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier deerriver-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username postgres \
     --master-user-password <your-password> \
     --allocated-storage 20
   ```

2. **Get connection string**
   - Note the endpoint from RDS console
   - Format: `postgresql://postgres:<password>@<endpoint>:5432/deerriver`

### 2. Application Deployment (AWS Amplify)

1. **Connect GitHub repository**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Select the `deer-river-app` folder

2. **Configure build settings**
   - Build command: `npm run build`
   - Base directory: `deer-river-app`
   - Output directory: `.next`

3. **Set environment variables**
   ```
   DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>:5432/deerriver
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=https://your-app.amplifyapp.com
   ```

4. **Deploy**
   - Amplify will automatically build and deploy
   - Your app will be available at `https://your-app.amplifyapp.com`

## 🔄 CI/CD Pipeline

The application includes GitHub Actions for automated deployment:

- **On push to main**: Automatically builds and deploys to AWS
- **On pull request**: Runs tests and linting
- **Database migrations**: Handled automatically during deployment

### Required GitHub Secrets

Add these to your GitHub repository settings:

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>:5432/deerriver
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.amplifyapp.com
```

## 🛠️ Development

### Project Structure

```
deer-river-app/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── people/         # People pages
│   │   ├── factions/       # Faction pages
│   │   └── ...
│   └── lib/                # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Seed data
├── seed/                   # JSON seed files
└── public/                 # Static assets
```

### Database Schema

The application uses Prisma with PostgreSQL and includes:

- **Person**: Citizens with relationships and opinions
- **Faction**: Political groups and alliances
- **Location**: Geographic locations and buildings
- **Opinion**: Relationship scores between people
- **ResourceCategory**: Economic resource types
- **TownResourceLedger**: Resource transaction history
- **EventLog**: Audit trail of activities

### API Endpoints

- `GET /api/people` - List all people
- `GET /api/people/[id]` - Get person details
- `POST /api/people` - Create new person
- `GET /api/factions` - List all factions
- `GET /api/locations` - List all locations
- `GET /api/resources` - Get resource summary
- `GET /api/events` - Get event log

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🆘 Support

For support, please open an issue in the GitHub repository.