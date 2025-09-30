// Compat-laag: sommige oude routes gebruiken /blog/:slug -> forward naar detail
import React from "react";
import { useParams, Navigate } from "react-router-dom";
export default function BlogPostPage(){
  const { slug } = useParams();
  return <Navigate to={`/blog/${slug}`} replace />;
}