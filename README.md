# Salary & Expense Tracker

A modern, user-friendly mobile app to track your income, expenses, and financial analytics. Built with React Native and Expo.

---

## 🚀 Features

- **Authentication:** Secure sign up and login with Firebase Auth
- **Add/Edit Transactions:** Track income and expenses with categories, descriptions, and dates
- **Analytics Dashboard:**
  - Pie chart for expense breakdown by category
  - Line chart for monthly income vs. expenses
  - Filter by month, year, or all time
- **Profile Management:** View and manage your profile
- **Clean UI:** Intuitive, beginner-friendly interface
- **Persistent Storage:** All data synced with Firebase Firestore

---

## 📱 Screenshots
<!-- Add screenshots here if available -->

---

## 🛠️ Tech Stack
- [Expo](https://expo.dev/) (React Native)
- [Firebase](https://firebase.google.com/) (Auth & Firestore)
- [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit) (Charts)
- [@react-navigation](https://reactnavigation.org/) (Navigation)

---

## ⚡ Getting Started

### 1. **Clone the repository**
```bash
git clone <your-repo-url>
cd salary-expense-tracker
```

### 2. **Install dependencies**
```bash
npm install
```

### 3. **Set up environment variables**
Create a `.env` file in the root with your Firebase config:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 4. **Start the app**
```bash
npm start
# or
expo start
```

Scan the QR code with Expo Go or run on an emulator.

---

## 💡 Usage
- **Sign up or log in** to your account
- **Add transactions** (income or expense) with details
- **View analytics** in the Analytics tab
- **Switch between income/expense, filter by period**
- **Edit or delete** transactions as needed

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
[MIT](LICENSE)

---

## 🙌 Acknowledgements
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Firebase](https://firebase.google.com/)
- [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit)
- [@react-navigation](https://reactnavigation.org/) 