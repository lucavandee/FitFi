// Compat-laag: sommige routes gebruiken /blog -> forward naar index
import React from "react";
import { Navigate } from "react-router-dom";
export default function BlogPage(){ return <Navigate to="/blog/index" replace />; }