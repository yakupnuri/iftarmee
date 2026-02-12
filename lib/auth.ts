import NextAuth from "next-auth";
import { db } from "@/db/index";
import { hosts, groupAssignments } from "@/db/schema";
import { nanoid } from "./nanoid";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";


export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const email = user.email.toLowerCase();
          // Host tablosuna kaydet (tüm Google kullanıcıları davet sahibi olabilir)
          const existingHost = await db.query.hosts.findFirst({
            where: eq(hosts.email, email),
          });

          if (!existingHost) {
            await db.insert(hosts).values({
              id: nanoid(),
              email: email,
              name: user.name || "İsimsiz Kullanıcı",
              image: user.image || null,
              createdAt: new Date(),
            });
          }
        } catch (error) {
          console.error("SignIn catch:", error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        const email = (token.email as string).toLowerCase();
        try {
          // Önce grup ataması var mı kontrol et
          const assignment = await db.query.groupAssignments.findFirst({
            where: eq(groupAssignments.email, email),
          });

          if (assignment) {
            // Eğer grup sorumlusuysa ismi grup ismi yapalım
            session.user.name = assignment.guestGroupName;
          } else {
            // Değilse (Admin veya eski host yapısı) normal ismi kullan
            const host = await db.query.hosts.findFirst({
              where: eq(hosts.email, email),
            });

            if (host) {
              session.user.id = host.id;
              session.user.name = host.name;
            }
          }
        } catch (error) {
          console.error("Session catch:", error);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
  },
});
