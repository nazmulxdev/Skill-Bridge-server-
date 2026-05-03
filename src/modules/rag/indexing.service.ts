import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppErrors";
import { EmbeddingService } from "./embedding.service";

const toVectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;

export class IndexingService {
  private embeddingService: EmbeddingService;
  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  async indexDocument(
    chunkKey: string,
    sourceType: string,
    sourceId: string,
    content: string,
    sourceLabel?: string,
    metadata?: Record<string, unknown>,
  ) {
    try {
      const embedding = await this.embeddingService.generateEmbedding(content);
      const vectorLiteral = toVectorLiteral(embedding);

      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "document_embeddings"
        ("id", "chunkKey", "sourceType", "sourceId", "sourceLabel", "content", "metadata", "embedding", "updatedAt")
        VALUES (
          ${Prisma.raw("gen_random_uuid()::TEXT")}, ${chunkKey}, ${sourceType}, ${sourceId},
          ${sourceLabel || null}, ${content}, ${JSON.stringify(metadata || {})}::jsonb,
          CAST(${vectorLiteral} AS vector), NOW()
        )
        ON CONFLICT ("chunkKey") DO UPDATE SET
          "content" = EXCLUDED."content", "metadata" = EXCLUDED."metadata",
          "embedding" = EXCLUDED."embedding", "updatedAt" = NOW(), "isDeleted" = false
      `);
    } catch (error: any) {
      console.error(`Index error: ${error.message}`);
      throw new AppError(500, error.message);
    }
  }

  async indexTutorsData() {
    console.log("📚 Indexing tutors...");
    const tutors = await prisma.user.findMany({
      where: { role: "TUTOR", status: "UNBANNED" },
      include: {
        tutorProfiles: {
          include: {
            subjects: { include: { subject: { include: { category: true } } } },
            education: true,
            reviews: true,
          },
        },
      },
    });

    let count = 0;
    for (const tutor of tutors) {
      const profile = tutor.tutorProfiles;
      if (!profile) continue;

      const subjects = profile.subjects
        .map((s) => s.subject?.name)
        .filter(Boolean)
        .join(", ");
      const education = profile.education
        .map((e) => `${e.degree} in ${e.fieldOfStudy} from ${e.institute}`)
        .join("; ");
      const avgRating =
        profile.reviews.length > 0
          ? (
              profile.reviews.reduce(
                (a, r) => a + (r.rating as unknown as number),
                0,
              ) / profile.reviews.length
            ).toFixed(1)
          : "No ratings";

      const content = `Tutor: ${tutor.name}\nEmail: ${tutor.email}\nHourly Rate: $${profile.hourlyRate}/hr\nSubjects: ${subjects}\nEducation: ${education}\nAverage Rating: ${avgRating}/5\nFeatured: ${profile.isFeatured ? "Yes" : "No"}`;

      await this.indexDocument(
        `tutor-${tutor.id}`,
        "TUTOR",
        tutor.id,
        content,
        tutor.name,
        {
          tutorId: profile.id,
          userId: tutor.id,
          name: tutor.name,
          hourlyRate: profile.hourlyRate,
          subjects,
          averageRating: avgRating,
          isFeatured: profile.isFeatured,
        },
      );
      count++;
    }
    console.log(`✅ Indexed ${count} tutors`);
    return { success: true, indexedCount: count };
  }

  async indexSubjectsData() {
    console.log("📚 Indexing subjects...");
    const subjects = await prisma.subjects.findMany({
      include: { category: true },
    });
    let count = 0;

    for (const subject of subjects) {
      const content = `Subject: ${subject.name}\nCategory: ${subject.category?.name || "Uncategorized"}\nDescription: ${subject.category?.description || "No description"}`;
      await this.indexDocument(
        `subject-${subject.id}`,
        "SUBJECT",
        subject.id,
        content,
        subject.name,
        {
          subjectId: subject.id,
          categoryId: subject.category_id,
        },
      );
      count++;
    }
    console.log(`✅ Indexed ${count} subjects`);
    return { success: true, indexedCount: count };
  }

  async indexFAQsData() {
    console.log("📚 Indexing FAQs...");
    const faqs = [
      {
        id: "faq-1",
        q: "How do I book a session?",
        a: "Browse tutors, select one, pick a time slot, and confirm. First session is free!",
      },
      {
        id: "faq-2",
        q: "How do I become a tutor?",
        a: "Register as Tutor, complete your profile with hourly rate, education, subjects, and availability.",
      },
      {
        id: "faq-3",
        q: "How does pricing work?",
        a: "Tutors set rates ($15-$100/hr). Pay after session. Accept credit/debit cards.",
      },
      {
        id: "faq-4",
        q: "Can I cancel?",
        a: "Yes, cancel from Dashboard > Bookings. Free up to 24h before.",
      },
      {
        id: "faq-5",
        q: "What subjects?",
        a: "50+ subjects: Math, Physics, Chemistry, Biology, English, Programming, Data Science, and more!",
      },
      {
        id: "faq-6",
        q: "Refunds?",
        a: "Request refund within 24h if unsatisfied. Satisfaction guaranteed.",
      },
      {
        id: "faq-7",
        q: "Tutor vetting?",
        a: "Background checks, ID verification, qualification validation. <5% accepted.",
      },
    ];

    let count = 0;
    for (const faq of faqs) {
      const content = `Q: ${faq.q}\nA: ${faq.a}`;
      await this.indexDocument(`faq-${faq.id}`, "FAQ", faq.id, content, faq.q, {
        question: faq.q,
      });
      count++;
    }
    console.log(`✅ Indexed ${count} FAQs`);
    return { success: true, indexedCount: count };
  }

  async indexAllData() {
    const tutors = await this.indexTutorsData();
    const subjects = await this.indexSubjectsData();
    const faqs = await this.indexFAQsData();
    return {
      tutors: tutors.indexedCount,
      subjects: subjects.indexedCount,
      faqs: faqs.indexedCount,
      total: tutors.indexedCount + subjects.indexedCount + faqs.indexedCount,
    };
  }
}
