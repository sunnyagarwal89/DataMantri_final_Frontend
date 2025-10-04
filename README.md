# 🎯 DataMantri Demo Frontend

**Interactive Product Demo with Mock Data**

This is a fully functional demo version of DataMantri that showcases all features using mock data - perfect for product demonstrations, sales presentations, and website integration.

---

## 🌟 Key Features

✅ **Complete UI/UX** - Full DataMantri interface with all features  
✅ **Realistic Mock Data** - Comprehensive dataset simulating production environment  
✅ **No Backend Required** - Runs entirely in the browser  
✅ **Fast & Responsive** - Instant feedback with simulated API delays  
✅ **Safe to Demo** - No risk of data loss or system issues  

---

## 🚀 Quick Start

### Install Dependencies

```bash
cd demo-frontend
npm install
```

### Start Development Server

```bash
npm run dev
```

The demo will be available at: **http://localhost:3000**

---

## 📋 What's Included

### Fully Functional Features:

1. **Authentication**
   - Demo login (no credentials needed)
   - Session management
   - Auto-login demo user

2. **Data Management**
   - Data source browser (PostgreSQL, MySQL, MongoDB, BigQuery)
   - Table explorer with schemas
   - Data preview and sampling

3. **Dashboard Builder**
   - Create/edit/delete dashboards
   - Multiple chart types (line, bar, pie, area, etc.)
   - Interactive chart configuration
   - AI-powered dashboard generation

4. **Data Pipelines**
   - Pipeline creation and management
   - Batch and real-time modes
   - Schedule configuration
   - Execution history and monitoring

5. **SQL Editor**
   - Write and execute queries
   - Syntax highlighting
   - Query results viewer
   - Query history

6. **Data Marts**
   - Create aggregated data marts
   - Refresh schedules
   - Row count tracking

7. **Performance Monitoring**
   - Real-time system metrics
   - Query performance analytics
   - Connection monitoring

8. **Access Management**
   - User management
   - Role-based access control
   - Organization settings

---

## 🎨 Mock Data

The demo includes realistic mock data for:

- **4 Data Sources** (PostgreSQL, MySQL, MongoDB, BigQuery)
- **3 Dashboards** with multiple charts
- **3 Data Marts** with refresh tracking
- **3 Pipelines** with execution history
- **Performance Metrics** (50+ queries, system stats)
- **3 Users** with different roles
- **Sample Tables** with thousands of rows

All data is generated dynamically with realistic values and timestamps.

---

## 🔧 Configuration

### Port Configuration

Default port: `3000`

To change, edit `vite.config.ts`:

```typescript
server: {
  port: 3000, // Change to your preferred port
}
```

### Mock API Behavior

Edit `src/lib/mockApi.ts` to customize:

- Response delays (network simulation)
- Failure rates (error simulation)
- Data generation logic

### Mock Data

Edit `src/lib/mockData.ts` to:

- Add more data sources
- Create additional dashboards
- Modify user roles
- Customize metrics

---

## 📁 Structure

```
demo-frontend/
├── src/
│   ├── components/      # UI components (copied from main app)
│   ├── contexts/        # Auth context (demo version)
│   ├── pages/          # All application pages
│   ├── lib/
│   │   ├── mockApi.ts  # Mock API service layer
│   │   └── mockData.ts # Mock data definitions
│   └── App.tsx         # Main application
├── public/             # Static assets
├── vite.config.ts      # Vite configuration (port 3000)
└── package.json        # Dependencies
```

---

## 🎯 Use Cases

### 1. **Website Integration**
Embed the demo in your product website to let visitors explore features without signup.

### 2. **Sales Presentations**
Show prospects the full functionality without needing a live backend or real data.

### 3. **Training & Documentation**
Use as a sandbox environment for tutorials and training materials.

### 4. **Development & Testing**
Test UI changes without impacting production data or backend services.

---

## 🔄 Key Differences from Production

| Feature | Production | Demo |
|---------|-----------|------|
| **Backend** | Flask API on port 5001 | Mock API in browser |
| **Database** | PostgreSQL/SQLite | In-memory mock data |
| **Auth** | Real user authentication | Auto-login with demo user |
| **Data Persistence** | Persistent database | Session-only (resets on reload) |
| **API Delays** | Real network latency | Simulated 300ms delays |
| **Error Handling** | Real errors | Simulated 1% failure rate |

---

## 🚨 Important Notes

1. **No Data Persistence** - All changes are lost on page reload
2. **Browser Only** - No backend server required or used
3. **Simulated Delays** - API responses include artificial delays for realism
4. **Safe to Use** - Cannot affect production systems or data

---

## 🛠️ Development

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

---

## 🌐 Deployment

The demo can be deployed to any static hosting service:

- **Vercel** - `vercel deploy`
- **Netlify** - Drag & drop `dist/` folder
- **GitHub Pages** - Push to `gh-pages` branch
- **AWS S3** - Upload `dist/` to S3 bucket
- **Cloudflare Pages** - Connect GitHub repo

No backend configuration needed!

---

## 🎉 Demo Login

When you open the demo:

1. Click **"Demo Login"** button
2. You're automatically logged in as the demo user
3. Full access to all features with mock data

No username/password required!

---

## 📞 Support

For questions about the demo or customization:

- Email: support@datamantri.com
- Website: https://datamantri.com
- Docs: https://docs.datamantri.com

---

## 🔐 Security

This demo:
- ✅ Contains only mock data
- ✅ Makes no external API calls
- ✅ Stores nothing on servers
- ✅ Is safe for public demos

---

**Built with ❤️ for DataMantri**

*Last Updated: October 4, 2025*

