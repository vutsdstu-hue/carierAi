import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

const mockPrisma = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  job: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  jobApplication: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
  },
  jobApplicationLog: {
    create: vi.fn(),
    createMany: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock("@/utils/prisma", () => ({ prisma: mockPrisma }));

const JWT_SECRET = "test_secret";
process.env.JWT_SECRET = JWT_SECRET;

function makeToken(userId: string, role: "USER" | "MODERATOR" | "ADMIN") {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: "1h" });
}

describe("Admin panel: users, jobs, job application logs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/admin/users creates a user for ADMIN", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce({ id: "u-1", email: "test@example.com", name: "Test", role: "MODERATOR" });

    const { app } = await import("@/app");

    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${makeToken("admin-1", "ADMIN")}`)
      .send({
        email: "test@example.com",
        password: "super_secret_123",
        name: "Test",
        location: "Москва",
        avatar: "—",
        position: "Dev",
        experience: "2 года",
        level: "Middle",
        joinDate: "2026-03-25",
        role: "MODERATOR",
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "u-1", email: "test@example.com", name: "Test", role: "MODERATOR" });
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it("POST /api/admin/jobs creates job and GET /api/jobs returns it", async () => {
    const job = {
      id: "job-uuid-1",
      title: "Frontend React Developer",
      company: "TechCorp",
      location: "Москва",
      salary: "—",
      type: "Удаленно",
      description: "Описание",
      skills: ["React", "TypeScript"],
      postedTime: "1 день назад",
      aiMatch: 90,
      createdAt: new Date("2026-03-25T00:00:00.000Z"),
      updatedAt: new Date("2026-03-25T00:00:00.000Z"),
    };

    mockPrisma.job.create.mockResolvedValueOnce(job);
    mockPrisma.job.findMany.mockResolvedValueOnce([job]);

    const { app } = await import("@/app");

    const created = await request(app)
      .post("/api/admin/jobs")
      .set("Authorization", `Bearer ${makeToken("admin-1", "ADMIN")}`)
      .send({
        title: job.title,
        company: job.company,
        location: job.location,
        salary: "—",
        type: "Удаленно",
        description: "Описание",
        skills: job.skills,
        postedTime: "1 день назад",
        aiMatch: 90,
      });

    expect(created.status).toBe(200);
    expect(created.body.title).toBe(job.title);

    const list = await request(app)
      .get("/api/jobs")
      .set("Authorization", `Bearer ${makeToken("user-1", "USER")}`);

    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);
    expect(list.body[0].id).toBe("job-uuid-1");
  });

  it("PATCH /api/moderation/job-applications/:id creates status log", async () => {
    mockPrisma.jobApplication.findUnique.mockResolvedValueOnce({
      id: "app-1",
      userId: "applicant-1",
      jobId: "job-1",
      company: "Tech",
      position: "Frontend",
      status: "Отклик отправлен",
      date: "2026-03-20",
      createdAt: new Date(),
    });

    mockPrisma.jobApplication.update.mockResolvedValueOnce({
      id: "app-1",
      userId: "applicant-1",
      jobId: "job-1",
      company: "Tech",
      position: "Frontend",
      status: "Получен ответ",
      date: "2026-03-20",
      createdAt: new Date(),
    });

    mockPrisma.jobApplicationLog.create.mockResolvedValueOnce({ id: "log-1" });

    const { app } = await import("@/app");

    const res = await request(app)
      .patch("/api/moderation/job-applications/app-1")
      .set("Authorization", `Bearer ${makeToken("mod-1", "MODERATOR")}`)
      .send({ status: "Получен ответ" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "app-1", status: "Получен ответ" });

    expect(mockPrisma.jobApplicationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jobApplicationId: "app-1",
          jobId: "job-1",
          actorUserId: "mod-1",
          action: "STATUS_CHANGED",
          fromStatus: "Отклик отправлен",
          toStatus: "Получен ответ",
        }),
      })
    );

    mockPrisma.jobApplicationLog.findMany.mockResolvedValueOnce([
      {
        id: "log-1",
        jobApplicationId: "app-1",
        jobId: "job-1",
        action: "STATUS_CHANGED",
        fromStatus: "Отклик отправлен",
        toStatus: "Получен ответ",
        createdAt: new Date("2026-03-25T00:00:00.000Z"),
        actor: { id: "mod-1", name: "Moderator", email: "mod@example.com" },
        jobApplication: { user: { id: "applicant-1", name: "Applicant", email: "app@example.com" } },
      },
    ]);

    const logs = await request(app)
      .get("/api/admin/job-application-logs?jobId=job-1")
      .set("Authorization", `Bearer ${makeToken("admin-1", "ADMIN")}`);

    expect(logs.status).toBe(200);
    expect(logs.body.length).toBe(1);
    expect(logs.body[0].jobId).toBe("job-1");
    expect(logs.body[0].applicant.name).toBe("Applicant");
  });
});

