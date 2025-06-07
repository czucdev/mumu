import { users, photos, photoSessions, type User, type InsertUser, type Photo, type InsertPhoto, type PhotoSession, type InsertPhotoSession } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  getPhotosByUser(userId: number): Promise<Photo[]>;
  createPhotoSession(session: InsertPhotoSession): Promise<PhotoSession>;
  getPhotoSessions(): Promise<PhotoSession[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const [photo] = await db
      .insert(photos)
      .values(insertPhoto)
      .returning();
    return photo;
  }

  async getPhotosByUser(userId: number): Promise<Photo[]> {
    return await db.select().from(photos).where(eq(photos.userId, userId));
  }

  async createPhotoSession(insertSession: InsertPhotoSession): Promise<PhotoSession> {
    const [session] = await db
      .insert(photoSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getPhotoSessions(): Promise<PhotoSession[]> {
    return await db.select().from(photoSessions);
  }
}

export const storage = new DatabaseStorage();
