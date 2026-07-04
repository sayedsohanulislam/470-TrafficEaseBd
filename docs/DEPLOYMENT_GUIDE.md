# Deployment & Database Configuration Guide
## TrafficEase BD - Dhaka Smart City Traffic Command System

This guide outlines the steps required to configure a **persistent MongoDB cloud database** (MongoDB Atlas) and link it to your **Vercel Cloud Deployment**. 

> [!NOTE]
> To prevent application crashes during live evaluations, the TrafficEase BD backend is equipped with **Self-Healing Database Resiliency**. If MongoDB is offline, registration, login, and dashboard telemetry seamlessly fall back to an in-memory/JSON simulator store. However, to persist registered user accounts and reported incidents between sessions, you must connect a live MongoDB database.

---

## 1. Setting Up a Free MongoDB Atlas Database

1. **Sign Up / Log In:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. **Create a Database Cluster:**
   - Click **Create** to deploy a new database.
   - Choose the **M0 FREE** tier (Shared RAM/CPU, perfect for project evaluations).
   - Select your preferred cloud provider (e.g., AWS) and region (e.g., `ap-southeast-1` Singapore or nearest to Bangladesh).
3. **Configure Database Access (Security):**
   - **Database User:** Create a user with a username (e.g., `trafficease_admin`) and a secure password. *Write down these credentials.*
   - **Network Access:** Under the **Network Access** menu, click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`). This is required because Vercel Serverless Functions execute from dynamic, changing IP pools.
4. **Get the Connection Connection URI:**
   - Go to the Database Deployment panel and click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the provided connection string. It will look like this:
     ```text
     mongodb+srv://trafficease_admin:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<db_password>` with the password you created for your database user, and append a database name (e.g., `trafficease_db`) before the query parameters:
     ```text
     mongodb+srv://trafficease_admin:YOUR_PASSWORD_HERE@cluster0.abcde.mongodb.net/trafficease_db?retryWrites=true&w=majority
     ```

---

## 2. Linking MongoDB to Vercel Environment Variables

Once you have your connection string, save it in Vercel to allow the backend serverless functions to authenticate:

1. **Open Vercel Dashboard:** Go to your project dashboard at [Vercel](https://vercel.com).
2. **Navigate to Settings:** Click on your project (`trafficease-bd`) and go to the **Settings** tab.
3. **Environment Variables:**
   - Click **Environment Variables** in the left sidebar.
   - Add the following key-value pairs:
     
     | Key | Value / Description | Example |
     | :--- | :--- | :--- |
     | `MONGO_URI` | Your MongoDB Atlas connection string | `mongodb+srv://trafficease_admin:...` |
     | `JWT_SECRET` | Any random alphanumeric security string | `dhaka_traffic_secret_token_1234` |
     
   - Ensure the environments checkbox for **Production**, **Preview**, and **Development** are checked.
   - Click **Save**.
4. **Redeploy Project:**
   - Go to the **Deployments** tab on Vercel.
   - Find the latest deployment, click the three dots (`...`), and select **Redeploy**.
   - Vercel will rebuild the project, injecting your new environment variables. The self-healing backend will automatically detect the active `MONGO_URI` connection on startup, seed the default corridors and features to MongoDB Atlas, and begin saving commuter registrations persistently!
