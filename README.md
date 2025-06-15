# Dev Bug Coder Blog - React Vite 🐛💻

Welcome to the **Dev Bug Coder Blog** repository! This project serves as a modern, full-stack developer blog platform where developers can share real-world coding errors and their solutions. Our goal is to empower developers to post, discuss, and resolve bugs, fostering a collaborative learning environment. 

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Releases](#releases)
- [Contact](#contact)

## Features 🌟

- **User Authentication**: Secure user registration and login using JWT bearer tokens.
- **Blog Management**: Create, read, update, and delete blog posts with ease.
- **File Uploads**: Use Multer for handling file uploads, allowing users to add images to their posts.
- **Email Notifications**: Send emails using Nodemailer for actions like password resets.
- **Responsive Design**: Built with Tailwind CSS for a clean and modern UI that works on all devices.
- **Deployment Ready**: Easily deploy to platforms like Render and Vercel.

## Technologies Used 🛠️

This project utilizes a variety of technologies to create a seamless experience for developers:

- **Frontend**: 
  - React with Vite
  - TypeScript
  - Tailwind CSS
- **Backend**: 
  - Express.js
  - MongoDB Atlas
  - Prisma Client
- **Authentication**: 
  - JWT Bearer Tokens
- **File Handling**: 
  - Multer
- **Email Services**: 
  - Nodemailer SMTP Transport
- **Deployment**: 
  - Render and Vercel

## Installation 🔧

To get started with the Dev Bug Coder Blog, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Athrv15/Dev-Bug-Coder-Blog--ReactVite.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd Dev-Bug-Coder-Blog--ReactVite
   ```

3. **Install dependencies**:
   For the frontend:
   ```bash
   cd client
   npm install
   ```

   For the backend:
   ```bash
   cd server
   npm install
   ```

4. **Set up environment variables**:
   Create a `.env` file in the server directory and add the necessary environment variables. Refer to the `.env.example` file for required variables.

5. **Run the application**:
   Start the backend server:
   ```bash
   cd server
   npm start
   ```

   Start the frontend application:
   ```bash
   cd client
   npm start
   ```

Your application should now be running on `http://localhost:3000`.

## Usage 📖

Once the application is up and running, you can:

- **Register**: Create an account to start posting and discussing.
- **Login**: Use your credentials to access your account.
- **Create Posts**: Share your coding errors and solutions.
- **Comment**: Engage with other developers by commenting on their posts.
- **Reset Password**: Use the reset password feature to regain access to your account.

## Contributing 🤝

We welcome contributions from the community! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a pull request.

## License 📜

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Releases 📦

For the latest releases, visit our [Releases section](https://github.com/Athrv15/Dev-Bug-Coder-Blog--ReactVite/releases). Here, you can download the latest version of the application and execute it.

## Contact 📫

For any questions or feedback, feel free to reach out:

- **GitHub**: [Athrv15](https://github.com/Athrv15)
- **Email**: athrv15@example.com

Thank you for checking out the Dev Bug Coder Blog! We hope you find it useful in your development journey. Happy coding!