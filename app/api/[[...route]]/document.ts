import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import {
  createDocumentTableSchema,
  DocumentSchema,
  documentTable,
} from "@/db/schema/document";
import { getAuthUser } from "@/lib/kinde";
import { generateDocUUID } from "@/lib/helper";
import { db } from "@/db";

// Create document router
const documentRoute = new Hono()
  // Document creation endpoint
  .post(
    "/document/create",
    zValidator("json", createDocumentTableSchema),
    getAuthUser,
    async (c) => {
      try {
        console.log("Creating document: start");
        const user = c.get("user");
        if (!user) {
          console.log("No user found in request");
          return c.json(
            {
              success: false,
              message: "Authentication required",
            },
            401
          );
        }
        
        const { title } = c.req.valid("json") as DocumentSchema;
        const userId = user.id;
        const authorName = `${user.given_name} ${user?.family_name}`;
        const authorEmail = user.email as string;
        const documentId = generateDocUUID();

        console.log(`Creating document for user: ${userId}, title: ${title}`);
        
        const newDoc = {
          title: title,
          userId: userId,
          documentId: documentId,
          authorName: authorName,
          authorEmail: authorEmail,
        };

        const [data] = await db
          .insert(documentTable)
          .values(newDoc)
          .returning();
          
        console.log("Document created successfully:", documentId);
        
        return c.json(
          {
            success: true,
            data,
          },
          200
        );
      } catch (error) {
        console.error("Error creating document:", error);
        return c.json(
          {
            success: false,
            message: "Failed to create document",
            error: error instanceof Error ? error.message : String(error),
          },
          500
        );
      }
    }
  )
  // Get all documents endpoint
  .get("/document/all", getAuthUser, async (c) => {
    try {
      console.log("Fetching all documents: start");
      const user = c.get("user");
      
      if (!user) {
        console.log("No user found in request");
        return c.json(
          {
            success: false,
            message: "Authentication required",
          },
          401
        );
      }
      
      const userId = user.id;
      console.log(`Fetching documents for user: ${userId}`);
      
      const documents = await db
        .select()
        .from(documentTable)
        .orderBy(desc(documentTable.updatedAt))
        .where(
          and(
            eq(documentTable.userId, userId),
            ne(documentTable.status, "archived")
          )
        );
        
      console.log(`Found ${documents.length} documents`);
      
      return c.json({
        success: true,
        data: documents,
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
      return c.json(
        {
          success: false,
          message: "Failed to fetch documents",
          error: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  })
  // Get specific document by ID
  .get(
    "/document/:documentId",
    zValidator(
      "param",
      z.object({
        documentId: z.string(),
      })
    ),
    getAuthUser,
    async (c) => {
      try {
        const user = c.get("user");
        const { documentId } = c.req.valid("param");

        if (!user) {
          return c.json(
            {
              success: false,
              message: "Authentication required",
            },
            401
          );
        }

        const userId = user.id;
        const documentData = await db.query.documentTable.findFirst({
          where: and(
            eq(documentTable.userId, userId),
            eq(documentTable.documentId, documentId)
          ),
          with: {
            personalInfo: true,
            experiences: true,
            educations: true,
            skills: true,
          },
        });
        
        return c.json({
          success: true,
          data: documentData,
        });
      } catch (error) {
        console.error("Error fetching document:", error);
        return c.json(
          {
            success: false,
            message: "Failed to fetch document",
            error: error instanceof Error ? error.message : String(error),
          },
          500
        );
      }
    }
  )
  // Get public document
  .get(
    "/document/public/doc/:documentId",
    zValidator(
      "param",
      z.object({
        documentId: z.string(),
      })
    ),
    async (c) => {
      try {
        const { documentId } = c.req.valid("param");
        const documentData = await db.query.documentTable.findFirst({
          where: and(
            eq(documentTable.status, "public"),
            eq(documentTable.documentId, documentId)
          ),
          with: {
            personalInfo: true,
            experiences: true,
            educations: true,
            skills: true,
          },
        });

        if (!documentData) {
          return c.json(
            {
              error: true,
              message: "unauthorized",
            },
            401
          );
        }
        
        return c.json({
          success: true,
          data: documentData,
        });
      } catch (error) {
        console.error("Error fetching public document:", error);
        return c.json(
          {
            success: false,
            message: "Failed to fetch document",
            error: error instanceof Error ? error.message : String(error),
          },
          500
        );
      }
    }
  );

export default documentRoute;