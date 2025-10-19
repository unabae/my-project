/*
    Database connection setup using Drizzle ORM and Neon
    This file initializes the database client to interact with a Neon database.
    Make sure to set the DATABASE_URL in your environment variables.
*/

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { DATABASE_URL } from "../config/env";

const sql = neon(DATABASE_URL!);
export const db = drizzle({ client: sql });
