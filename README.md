# pixel-love
core data <3

## Deploy to Cloud Run

This project is automatically deployed to [Google Cloud Run](https://cloud.google.com/run) on every push to the `main` branch.

### Prerequisites

1. A Google Cloud project with Cloud Run and Artifact Registry APIs enabled.
2. A Google Cloud service account with the following roles:
   - `roles/run.admin`
   - `roles/artifactregistry.writer`
   - `roles/iam.serviceAccountUser`
3. A [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) pool and provider configured for GitHub Actions.
4. An Artifact Registry Docker repository named `pixel-love` in your project and region (default: `us-central1`).

### GitHub Secrets

Add the following secrets to your GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `GCP_PROJECT_ID` | Your Google Cloud project ID |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full resource name of the Workload Identity Provider (e.g. `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID`) |
| `GCP_SERVICE_ACCOUNT` | Email of the Google Cloud service account (e.g. `name@project-id.iam.gserviceaccount.com`) |

### Local Development

```bash
npm install
npm start
```

The server listens on port `8080` by default (configurable via the `PORT` environment variable).

### Build & Run with Docker

```bash
docker build -t pixel-love .
docker run -p 8080:8080 pixel-love
```
