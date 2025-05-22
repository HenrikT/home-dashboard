import "@testing-library/jest-dom";

// Added as fix to: https://stackoverflow.com/questions/68239168/error-supabaseurl-is-required-supabase-postgresql
import dotenv from "dotenv";
dotenv.config({
  path: ".env.local",
});
