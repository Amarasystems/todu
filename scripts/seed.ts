import connectDB from '../lib/db';
import User from '../models/User';
import Task from '../models/Task';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Starting seed...');

    await connectDB();
    console.log('✅ Connected to database');

    // Create multiple demo users
    const users = [
      { email: 'demo@example.com', name: 'Demo User', password: 'demo1234' },
      { email: 'nakii@example.com', name: 'Nakii', password: 'demo1234' },
      { email: 'turuu@example.com', name: 'turuu', password: 'demo1234' },
    ];

    const createdUsers = [];
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`👤 User ${userData.name} already exists`);
        createdUsers.push(existingUser);
      } else {
        const passwordHash = await bcrypt.hash(userData.password, 12);
        const user = await User.create({
          email: userData.email,
          passwordHash,
          name: userData.name,
        });
        console.log(`👤 Created user: ${user.name} (${user.email})`);
        createdUsers.push(user);
      }
    }

    if (createdUsers.length === 0) {
      throw new Error('Failed to create or find any users');
    }

    // Clear existing tasks for all users
    await Task.deleteMany({});
    console.log('🗑️ Cleared existing tasks');

    // Create sample tasks for all users
    const now = new Date();
    const allTasks = [];

    // Create tasks for each user
    for (const user of createdUsers) {
      const userTasks = [
        // Backlog tasks
        {
          userId: user._id,
          title: 'Design new landing page',
          description:
            'Create a modern, responsive landing page design with hero section, features, and CTA',
          status: 'backlog',
          order: 0,
          priority: 'high',
          startAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          dueAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          items: [
            { label: 'Create wireframes', checked: false },
            { label: 'Design mobile layout', checked: false },
            { label: 'Design desktop layout', checked: false },
            { label: 'Create component library', checked: false },
          ],
          percent: 0,
        },
        {
          userId: user._id,
          title: 'Set up CI/CD pipeline',
          description: 'Configure automated testing and deployment pipeline',
          status: 'backlog',
          order: 1,
          priority: 'med',
          dueAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          items: [],
          percent: 0,
        },
        {
          userId: user._id,
          title: 'Research competitor features',
          description:
            'Analyze competitor products and identify key features to implement',
          status: 'backlog',
          order: 2,
          priority: 'low',
          items: [
            { label: 'List top 5 competitors', checked: true },
            { label: 'Document key features', checked: false },
            { label: 'Identify gaps', checked: false },
          ],
          percent: 33,
        },

        // In Progress tasks
        {
          userId: user._id,
          title: 'Implement user authentication',
          description:
            'Build login, register, and session management functionality',
          status: 'in_progress',
          order: 0,
          priority: 'high',
          startAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          dueAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          items: [
            { label: 'Set up NextAuth', checked: true },
            { label: 'Create user model', checked: true },
            { label: 'Implement login page', checked: true },
            { label: 'Implement register page', checked: false },
            { label: 'Add session protection', checked: false },
          ],
          percent: 60,
        },
        {
          userId: user._id,
          title: 'Build task management API',
          description: 'Create REST API endpoints for task CRUD operations',
          status: 'in_progress',
          order: 1,
          priority: 'high',
          startAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          dueAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          items: [
            { label: 'Create task model', checked: true },
            { label: 'Implement GET /api/tasks', checked: true },
            { label: 'Implement POST /api/tasks', checked: true },
            { label: 'Implement PATCH /api/tasks/:id', checked: false },
            { label: 'Implement DELETE /api/tasks/:id', checked: false },
          ],
          percent: 60,
        },
        {
          userId: user._id,
          title: 'Create responsive dashboard',
          description: 'Build the main dashboard with responsive design',
          status: 'in_progress',
          order: 2,
          priority: 'med',
          startAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          dueAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
          items: [],
          percent: 45,
        },

        // Done tasks
        {
          userId: user._id,
          title: 'Set up project structure',
          description:
            'Initialize Next.js project with TypeScript and Tailwind CSS',
          status: 'done',
          order: 0,
          priority: 'high',
          startAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          dueAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          items: [
            { label: 'Initialize Next.js project', checked: true },
            { label: 'Configure TypeScript', checked: true },
            { label: 'Set up Tailwind CSS', checked: true },
            { label: 'Configure ESLint', checked: true },
          ],
          percent: 100,
        },
        {
          userId: user._id,
          title: 'Design database schema',
          description:
            'Plan and design the database structure for users and tasks',
          status: 'done',
          order: 1,
          priority: 'med',
          startAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
          dueAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          items: [
            { label: 'Define user model', checked: true },
            { label: 'Define task model', checked: true },
            { label: 'Set up relationships', checked: true },
            { label: 'Add indexes', checked: true },
          ],
          percent: 100,
        },
        {
          userId: user._id,
          title: 'Set up MongoDB connection',
          description:
            'Configure MongoDB Atlas connection and connection pooling',
          status: 'done',
          order: 2,
          priority: 'med',
          startAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          dueAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          items: [],
          percent: 100,
        },
        {
          userId: user._id,
          title: 'Create basic UI components',
          description: 'Build reusable UI components using shadcn/ui',
          status: 'done',
          order: 3,
          priority: 'low',
          startAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          dueAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          items: [
            { label: 'Install shadcn/ui', checked: true },
            { label: 'Create button component', checked: true },
            { label: 'Create card component', checked: true },
            { label: 'Create input component', checked: true },
            { label: 'Create dialog component', checked: true },
          ],
          percent: 100,
        },
      ];

      allTasks.push(...userTasks);
    }

    const createdTasks = await Task.insertMany(allTasks);
    console.log(
      `✅ Created ${createdTasks.length} sample tasks for ${createdUsers.length} users`
    );

    console.log('🎉 Seed completed successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log(
      '   Email: demo@example.com | Password: demo1234 | Name: Demo User'
    );
    console.log(
      '   Email: nakii@example.com | Password: demo1234 | Name: Nakii'
    );
    console.log(
      '   Email: turuu@example.com | Password: demo1234 | Name: turuu'
    );
    console.log(
      '\n🚀 You can now start the development server with: npm run dev'
    );
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
