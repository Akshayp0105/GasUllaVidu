# GasUllaVidu

GasUllaVidu is a scalable and user-friendly platform built to solve real-world problems through an intuitive interface and efficient backend architecture. The project focuses on delivering a seamless user experience while maintaining performance, modularity, and clean design principles.


This application is designed with a strong emphasis on usability, responsiveness, and maintainability, making it suitable for both end-users and developers looking to extend or integrate the system.


Features
🔐 Secure authentication and user management
⚡ Fast and responsive UI
📱 Fully responsive design (mobile + desktop)
🧠 Smart data handling and structured backend
🔄 Real-time or dynamic updates (if applicable)
🧩 Modular and scalable architecture
🎯 Clean and modern UI/UX design

🛠️ Tech Stack
Frontend
HTML, CSS, Typescript, React
Backend
Python FastAPI
Database
Firebase Firestore 
Tools & Services
Git & GitHub
API integrations (Firebase api,map api)
Deployment platform (Vercel) 

📂 Project Structure
GasUllaVidu/
│── src/           # Frontend (Next.js)
│── backend/       # Backend (FastAPI)
│── public/        # Static assets
│── package.json
│── README.md

⚙️ Installation & Setup

1. Clone the repository
   ```bash
   git clone https://github.com/Akshayp0105/GasUllaVidu.git
   cd GasUllaVidu
   ```

2. Frontend Setup
   ```bash
   npm install
   npm run dev
   ```

3. Backend Setup
   ```bash
   cd backend
   pip install -r requirements.txt
   # Setup .env from .env.example
   uvicorn app.main:app --reload
   ```

### 🚀 Deployment

#### Frontend (Vercel)
1. Push your code to GitHub.
2. Import the project into Vercel.
3. Configure the following **Environment Variables** in Vercel:
   - `ASSISTANT_BACKEND_URL`: `https://gasullavidu-1.onrender.com/assistant/chat`
   - `OPENAI_API_KEY`: Your OpenAI API Key (for fallback logic).
   - `OPENAI_MODEL`: `gpt-4o-mini` (or your preferred model).
   - `NEXTAUTH_SECRET`: A random string for session security.
   - `NEXTAUTH_URL`: Your Vercel deployment URL.
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID.
   - `FIREBASE_CLIENT_EMAIL`: Your Firebase service account email.
   - `FIREBASE_PRIVATE_KEY`: Your Firebase service account private key.
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase public API key.
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain.

#### Backend (Render)
The backend is already deployed at `https://gasullavidu-1.onrender.com`. Ensure it has the `OPENAI_API_KEY` set in its Render environment settings.

6. Build for production
   ```bash
   npm run build
   ```
📸 Screenshots
<img width="1919" height="854" alt="image" src="https://github.com/user-attachments/assets/f9282f15-3f6b-4465-b59c-69ac14a8b4d7" />
<img width="1274" height="788" alt="image" src="https://github.com/user-attachments/assets/cf938154-1b2b-416f-b716-480200f13123" />



🤝 Contributing

Contributions are welcome!
1.Fork the repo
2.Create a new branch (feature/your-feature)
3.Commit your changes
4.Push to your branch
5.Open a Pull Request

🐛 Issues
If you find any bugs or issues, feel free to open an issue in the repository.

👨‍💻 Author
Akshay P.
GitHub: https://github.com/Akshayp0105
