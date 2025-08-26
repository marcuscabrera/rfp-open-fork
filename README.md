# AutoRFP - AI-Powered RFP Response Platform

AutoRFP is an intelligent platform that automates RFP (Request for Proposal) response generation using advanced AI. Built with Next.js 15, this version has been refactored to run entirely offline using a local Large Language Model (LLM).

## ✨ Features

### 🤖 AI-Powered Document Processing
- **Automatic Question Extraction**: Upload RFP documents and automatically extract structured questions.
- **Intelligent Response Generation**: Generate contextual responses using your organization's documents.
- **Local First AI**: All AI processing is done locally via the Gemma 3n model, ensuring data privacy and offline capability.
- **Document Understanding**: Supports Word, PDF, Excel, and PowerPoint files.

### 🏢 Organization Management
- **Multi-Tenant Architecture**: Support for multiple organizations with role-based access.
- **Team Collaboration**: Invite team members with different permission levels (owner, admin, member).
- **Project Organization**: Organize RFPs into projects for better management.

### 🔍 Search & Retrieval
- **Full-Text Search**: Uses PostgreSQL's built-in full-text search to find relevant context within your documents.
- **Source Attribution**: Track and cite sources in generated responses.

### 💬 Interactive AI Responses
- **Chat Interface**: Interactive chat-style interface for generating responses.
- **Multi-Step Response Dialog**: Detailed step-by-step response generation process.
- **Source Details**: View detailed source information.
- **Response Editing**: Edit and refine AI-generated responses.

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Authentication**: Next-Auth with Azure AD Provider
- **Database**: PostgreSQL with Prisma ORM
- **AI & ML**: Gemma 3n (local LLM via Ollama)
- **Containerization**: Docker, Docker Compose
- **Package Manager**: pnpm

## 📋 Prerequisites

Before setting up AutoRFP, ensure you have:

- **Node.js** 18.x or later
- **pnpm** 8.x or later
- **Docker** and **Docker Compose**
- **Azure Active Directory** application registration for authentication.

## 🚀 Getting Started

This project is designed to be run entirely with Docker Compose, which orchestrates the Next.js application, the PostgreSQL database, and the local LLM.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/auto_rfp.git
cd auto_rfp
```

### 2. Environment Setup

Create a `.env` file in the root directory by copying the example file:

```bash
cp .env.example .env
```

Now, edit the `.env` file and fill in the required values:

```bash
# .env

# Database (used by both the app and docker-compose)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=autorfp
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/autorfp"
DIRECT_URL="postgresql://postgres:postgres@postgres:5432/autorfp"

# Azure AD Configuration
AZURE_AD_CLIENT_ID="your-azure-ad-client-id"
AZURE_AD_CLIENT_SECRET="your-azure-ad-client-secret"
AZURE_AD_TENANT_ID="your-azure-ad-tenant-id"

# Next-Auth
AUTH_SECRET="a-random-secret-for-next-auth" # Generate a secret with: openssl rand -hex 32

# Local LLM Configuration
OLLAMA_API_URL="http://ollama:11434/api/generate"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
**Note:** The `DATABASE_URL` uses `postgres` as the hostname, which is the service name defined in `docker-compose.yml`.

### 3. Run the Application

With Docker running, start all services using Docker Compose:

```bash
docker-compose up --build
```

This command will:
1.  Build the Docker image for the Next.js application.
2.  Pull the PostgreSQL and Ollama images.
3.  Start all three containers.
4.  Run database migrations automatically as part of the application's startup script.

The application will be available at [http://localhost:3000](http://localhost:3000).

### 4. Azure AD Setup

1.  Register a new application in the Azure portal.
2.  Configure the application's redirect URI to `http://localhost:3000/api/auth/callback/azure-ad`.
3.  Create a new client secret and copy its value.
4.  Copy the Application (client) ID, Directory (tenant) ID, and the client secret to the corresponding environment variables in your `.env` file.


## 📁 Project Structure

```
auto_rfp/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Next-Auth route handlers
│   │   ├── extract-questions/    # Question extraction endpoint
│   │   └── generate-response/    # Response generation endpoint
│   ├── login/                   # Login flow
│   └── ...
├── components/                  # Reusable React components
├── lib/                        # Core libraries and utilities
│   ├── services/               # Business logic services
│   └── ...
├── prisma/                     # Database schema and migrations
└── ...
```

## 🔧 Key Configuration

### Database Schema

- **User**: Authenticated users
- **Organization**: Tenant organizations
- **Project**: RFP projects within organizations
- **Question**: Extracted RFP questions
- **Answer**: AI-generated responses
- **Source**: Document chunks used for full-text search and context.

### AI Processing Pipeline

1. **Document Upload**: Users upload RFP documents.
2. **Text Extraction**: The backend extracts text content from the documents.
3. **Database Storage**: The extracted text is stored in the `Source` table in PostgreSQL.
4. **Question Generation**: The local Gemma 3n model processes the text to extract structured questions.
5. **Response Generation**: When a user asks a question, the backend performs a full-text search on the `Source` table to find relevant context, then sends the context and question to Gemma 3n to generate an answer.

## 🚀 Deployment

While this setup is optimized for local development with Docker, it can be adapted for production. You would need to:
-   Host the PostgreSQL database.
-   Deploy the Next.js application to a platform like Vercel or as a standalone container.
-   Deploy the Gemma 3n model in a separate, scalable container with a persistent endpoint and update `OLLAMA_API_URL`.

### Environment Variables for Production
Ensure all variables from the `.env` file are configured in your deployment platform's environment settings.

## 🐛 Troubleshooting

### Common Issues

**Docker Compose Fails to Start**
- Ensure Docker Desktop (or Docker Engine) is running.
- Check that no other services are using the required ports (e.g., port 5432 for PostgreSQL).

**Database Connection Issues**
- Verify the `DATABASE_URL` in your `.env` file matches the credentials in `docker-compose.yml`.
- Check the logs for the `postgres` container: `docker-compose logs postgres`.

**AI Processing Issues**
- Check the logs for the `ollama` container: `docker-compose logs ollama`.
- Ensure the model name in `lib/services/gemini-question-extractor.ts` (`gemma:3n`) is available in your Ollama instance.

## 🙏 Acknowledgments

- **Ollama** for making it easy to run local LLMs.
- **Next-Auth** for simplified authentication.
- **Vercel** for the Next.js framework.
- **Radix UI** for accessible component primitives.
