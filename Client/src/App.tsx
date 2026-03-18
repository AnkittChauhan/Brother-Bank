import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import LoginPage from "@/components/LoginPage";
import LoanApplicationForm from "@/components/LoanApplicationForm";
import AdminDashboard from "@/components/AdminDashboard";
import Navbar from "@/components/Navbar";
import MyLoans from "@/components/MyLoans";
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <Router>
      <Toaster />
      <SignedIn>
        <Navbar />
      </SignedIn>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/apply"
          element={
            <>
              <SignedIn>
                <LoanApplicationForm />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/admin"
          element={
            <>
              <SignedIn>
                <AdminDashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/my-loans"
          element={
            <>
              <SignedIn>
                <MyLoans />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
