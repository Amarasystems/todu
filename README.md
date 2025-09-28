# Todu - Minimal Todo & Timeline App

A beautiful, minimal todo and timeline application built with Next.js, MongoDB, and modern web technologies. Organize your tasks with drag & drop, track progress with checklists, and visualize your work on a calendar timeline.

## ✨ Features

- **Kanban Board**: Drag & drop tasks across Backlog, In Progress, and Done columns
- **Timeline View**: Visualize tasks on a calendar with week and month views
- **Progress Tracking**: Use checklists or manual progress percentages
- **Task Management**: Create, edit, delete, and search tasks with filters
- **Authentication**: Secure user accounts with NextAuth.js
- **Responsive Design**: Beautiful UI that works on desktop and mobile
- **Real-time Updates**: Optimistic UI updates with error handling

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: NextAuth.js with credentials provider
- **Drag & Drop**: @dnd-kit/core and @dnd-kit/sortable
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Validation**: Zod + React Hook Form
- **Testing**: Vitest + Testing Library

## 📋 Prerequisites

- Node.js 18+ or Bun
- MongoDB Atlas account (or local MongoDB)
- Git

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd todu
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values:

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todu?retryWrites=true&w=majority
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

4. **Set up MongoDB**
   - Create a MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string and update `MONGODB_URI` in your `.env` file
   - Create a database named `todu`

5. **Generate NextAuth secret**

   ```bash
   openssl rand -base64 32
   ```

   Copy the output to `NEXTAUTH_SECRET` in your `.env` file

6. **Seed the database (optional)**

   ```bash
   bun run seed
   # or
   npm run seed
   ```

   This creates a demo user:
   - Email: `demo@example.com`
   - Password: `demo1234`

7. **Start the development server**

   ```bash
   bun run dev
   # or
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Getting Started

1. **Register**: Create a new account or use the demo account
2. **Login**: Sign in with your credentials
3. **Create Tasks**: Click "New Task" to add your first task
4. **Organize**: Drag tasks between columns on the Board view
5. **Track Progress**: Use checklists or set manual progress percentages
6. **Visualize**: Switch to Timeline view to see tasks on a calendar

### Features Overview

#### Board View

- Drag and drop tasks between Backlog, In Progress, and Done columns
- Quick edit and delete actions
- Progress tracking with visual indicators
- Priority levels and tags

#### Timeline View

- Week and month calendar views
- Tasks displayed as bars spanning their duration
- Today indicator and navigation controls
- Drag to reschedule tasks (coming soon)

#### All Tasks View

- Search and filter tasks
- Quick status changes
- Detailed task information
- Bulk operations

#### Settings

- Update your profile
- Account management
- Sign out

## 🧪 Testing

Run the test suite:

```bash
bun run test
# or
npm run test
```

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard:
     - `MONGODB_URI`
     - `NEXTAUTH_URL` (your Vercel domain)
     - `NEXTAUTH_SECRET`
   - Deploy!

3. **Update MongoDB Atlas**
   - Add your Vercel domain to MongoDB Atlas IP whitelist
   - Update `NEXTAUTH_URL` to your production domain

### Environment Variables

| Variable          | Description                                  | Required |
| ----------------- | -------------------------------------------- | -------- |
| `MONGODB_URI`     | MongoDB connection string                    | Yes      |
| `NEXTAUTH_URL`    | Your app URL (e.g., https://todu.vercel.app) | Yes      |
| `NEXTAUTH_SECRET` | Random secret for JWT signing                | Yes      |

## 📁 Project Structure

```
todu/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (app)/app/         # Protected app pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── task/             # Task-related components
│   ├── board/            # Kanban board components
│   └── timeline/         # Timeline components
├── lib/                  # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database connection
│   └── validations.ts    # Zod schemas
├── models/               # Mongoose models
├── scripts/              # Utility scripts
└── test/                 # Test files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [MongoDB](https://www.mongodb.com/) for the database
- [Vercel](https://vercel.com/) for hosting
- [Lucide](https://lucide.dev/) for icons

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/your-username/todu/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

Made with ❤️ by [Your Name]
