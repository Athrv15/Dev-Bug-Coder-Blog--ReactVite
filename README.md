# Dev-Bug-Coder-Blog -- ReactVite

<img width="1356" alt="Screenshot 2025-06-11 at 04 02 17" src="https://github.com/user-attachments/assets/d0075879-9e1e-44bd-b316-c85937fe6b7f" /> <img width="1338" alt="Screenshot 2025-06-11 at 04 03 40" src="https://github.com/user-attachments/assets/9ca15253-433e-45d3-b950-ff92b9f32c02" />

A modern, full-stack developer blog platform focused on sharing real-world coding errors and their solutions. Dev-Bug-Coder-Blog empowers developers to post, discuss, and resolve bugs, fostering a collaborative learning environment.

- **Oline-Live:** https://dev-bug-coder-blog.vercel.app/

---

## 🚀 Features

- **User Authentication:** Register, login, logout, JWT-based authentication, password reset via email.
- **Post Management:** Create, edit, delete, and view posts with code snippets, screenshots, and tags.
- **Comment System:** Nested comments with image uploads, edit/delete, like/helpful toggles, and reply functionality.
- **Like & Helpful:** Mark posts and comments as liked or helpful.
- **Save Posts:** Save/unsave posts for quick access.
- **Report Posts:** Report inappropriate posts (admin review).
- **Notifications:** Real-time notifications for likes, comments, helpful marks, and reports.
- **Admin Panel:** View and manage reported posts.
- **Responsive UI:** Mobile-friendly, clean, and modern design.
- **Tag System:** Tag posts, filter/search by tags, and view popular topics.
- **Profile Management:** Edit profile, upload avatar, change password.
- **Security:** Secure password hashing, JWT, CORS, and input validation.
- **API:** RESTful API built with Express and Prisma.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express, Prisma (MongoDB), Multer, JWT, Nodemailer
- **Database:** MongoDB (Atlas)
- **Deployment:** Vercel (frontend), Render (backend)
- **Other:** ESLint, Prettier, SVGR, dotenv

---

## 📁 Project Structure

```bash
dev-bug-blog/
├── prisma/              # Prisma schema and migrations
├── public/              # Static assets (e.g., vite.svg)
├── src/                 # Frontend source code
│   ├── api.ts           # Axios API client
│   ├── components/      # Reusable React components
│   ├── pages/           # Page-level React components
│   ├── types/           # TypeScript types and custom.d.ts
│   └── assets/          # Images and icons
├── routes/              # Express route handlers (backend)
├── middleware/          # Express middleware (e.g., authentication)
├── uploads/             # Uploaded images (avatars, screenshots)
├── .env                 # Environment variables (not committed)
├── server.js            # Express server entry point
├── package.json         # Project scripts and dependencies
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

---

## 🖼️ Screenshots

Please Look Above

---

## 📝 How to Run Locally

### 1. **Clone the Repository**

```bash
git clone https://github.com/arnobt78/Dev-Bug-Coder-Blog--ReactVite.git
cd Dev-Bug-Coder-Blog--ReactVite
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Setup Environment Variables**

- Copy `.env.example` to `.env` (or use the provided `setup-env.sh` script).
- Fill in your MongoDB URI, JWT secret, email credentials, and URLs.

Example `.env` (do **not** commit secrets):

```env
DATABASE_URL="your-mongodb-uri"
JWT_SECRET="your-jwt-secret"
EMAIL_USER="your-email"
EMAIL_PASS="your-app-password"
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
VITE_BACKEND_URL=http://localhost:5000
NODE_ENV=development
PORT=5000
```

### 4. **Prisma Setup**

```bash
npx prisma generate
```

### 5. **Run the App (Dev Mode)**

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend/API: [http://localhost:5000](http://localhost:5000)

---

## 🌐 Deployment

### **Frontend (Vercel)**

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- **Environment Variables:**
  - `VITE_FRONTEND_URL=https://your-frontend-url`
  - `VITE_BACKEND_URL=https://your-backend-url`
  - `VITE_ADMIN_EMAIL=your-admin-email`

### **Backend (Render)**

- Use `npm start` as the start command.
- Set all backend-related environment variables (see `.env`).
- Make sure `FRONTEND_URL` and `BACKEND_URL` are set to your deployed URLs (no trailing slash).

---

## 🔑 Environment Variables

| Name              | Description                          | Frontend (Vercel) | Backend (Render) |
| ----------------- | ------------------------------------ | :---------------: | :--------------: |
| DATABASE_URL      | MongoDB connection string            |        ❌         |        ✅        |
| JWT_SECRET        | JWT secret key                       |        ❌         |        ✅        |
| EMAIL_USER        | Email for SMTP                       |        ❌         |        ✅        |
| EMAIL_PASS        | Email password/app password          |        ❌         |        ✅        |
| FRONTEND_URL      | Frontend URL (no trailing slash)     |        ❌         |        ✅        |
| BACKEND_URL       | Backend URL (no trailing slash)      |        ❌         |        ✅        |
| VITE_FRONTEND_URL | Frontend URL (for Vite)              |        ✅         |        ✅        |
| VITE_BACKEND_URL  | Backend URL (for Vite)               |        ✅         |        ✅        |
| VITE_ADMIN_EMAIL  | Admin email (for admin features)     |        ✅         |        ✅        |
| NODE_ENV          | Environment (development/production) |        ✅         |        ✅        |
| PORT              | Backend port                         |        ❌         |        ✅        |

---

## 🔍 Main Functionalities

- **Authentication:** Secure JWT-based login/register, password reset.
- **Posts:** Create, edit, delete, like, mark helpful, save, report.
- **Comments:** Nested, like/helpful, edit/delete, reply, image upload.
- **Notifications:** For likes, helpful, comments, reports.
- **Admin:** Manage reported posts.
- **Profile:** Edit profile, avatar upload, change password.
- **Tagging:** Tag posts, filter/search by tag.
- **Search:** Search posts by title, description, content, or tag.
- **Responsive Design:** Works on all devices.

---

## 🧩 API Endpoints (Backend)

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get post details
- `PUT /api/posts/:id` - Edit post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/helpful` - Mark/unmark post as helpful
- `POST /api/posts/:id/save` - Save post
- `POST /api/posts/:id/unsave` - Unsave post
- `POST /api/reports` - Report post
- `GET /api/comments/post/:postId` - Get comments for post
- `POST /api/comments/post/:postId` - Add comment
- `PUT /api/comments/:id` - Edit comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like/unlike comment
- `POST /api/comments/:id/helpful` - Mark/unmark comment as helpful
- `GET /api/users/me/saved-posts` - Get user's saved posts
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/mark-all-read` - Mark all notifications as read

---

## 🏷️ Keywords

`developer blog`, `coding errors`, `bug fixes`, `React`, `Node.js`, `MongoDB`, `Prisma`, `Express`, `Vite`, `Tailwind CSS`, `JWT`, `REST API`, `full stack`, `community`, `notifications`, `admin`, `report`, `save post`, `comment`, `like`, `helpful`, `tag`, `search`, `responsive`, `modern`, `open source`

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE)

---

## 👨‍💻 Author

### Arnob Mahmud

- [GitHub](https://github.com/arnobt78)
- [LinkedIn](https://www.linkedin.com/in/arnob-mahmud-05839655/)
- [Email](mailto:arnob_t78@yahoo.com)

---

Happy coding! 🚀
