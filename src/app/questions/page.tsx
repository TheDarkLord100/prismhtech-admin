"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserStore } from "@/utils/store/userStore";
import { notify, Notification } from "@/utils/notify";

type AdminQuestion = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  status: "pending" | "answered";
  like_count: number;
  images: string[];
  tags: string[];
  answer?: { body: string };
};

export default function AdminQuestionsPage() {
  const token = useUserStore((s) => s.token);

  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<"all" | "pending" | "answered">("all");

  const [open, setOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] =
    useState<AdminQuestion | null>(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (!token) return;
    fetchQuestions();
  }, [token, search, status]);

  async function fetchQuestions() {
    setLoading(true);

    const params = new URLSearchParams({
      search,
      status,
      admin: "true", // 👈 important
    });

    const res = await fetch(`/api/questions?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      notify(Notification.FAILURE, data.error);
      setLoading(false);
      return;
    }

    setQuestions(data.questions);
    setLoading(false);
  }

  function openAnswerModal(q: AdminQuestion) {
    setActiveQuestion(q);
    setAnswer(q.answer?.body ?? "");
    setOpen(true);
  }

  async function saveAnswer() {
    if (!activeQuestion || !answer.trim()) return;

    const method = activeQuestion.answer ? "PUT" : "POST";
    const url = activeQuestion.answer
      ? `/api/answers/${activeQuestion.id}`
      : "/api/answers";

    const body =
      method === "POST"
        ? { question_id: activeQuestion.id, body: answer }
        : { body: answer };

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      notify(Notification.FAILURE, data.error);
      return;
    }

    notify(Notification.SUCCESS, "Answer saved");

    // Update UI state
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === activeQuestion.id
          ? {
              ...q,
              status: "answered",
              answer: { body: answer },
            }
          : q
      )
    );

    setOpen(false);
  }

  return (
    <div className="flex h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
      <Sidebar />

      <main className="flex-1 p-8 text-white overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">
          Questions & Answers
        </h1>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-3 py-2 rounded-md text-white bg-[#317A45]"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white text-black rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-200">
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="p-6 text-center">
                    Loading questions…
                  </TableCell>
                </TableRow>
              )}

              {!loading && questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="p-6 text-center text-gray-500">
                    No questions found
                  </TableCell>
                </TableRow>
              )}

              {questions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="max-w-[400px]">
                    <p className="font-medium">{q.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {q.body}
                    </p>

                    {q.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {q.tags.map((t) => (
                          <Badge key={t} variant="secondary">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {q.status === "answered" ? (
                      <Badge className="bg-green-600">Answered</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>

                  <TableCell>{q.like_count}</TableCell>

                  <TableCell>
                    {new Date(q.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => openAnswerModal(q)}
                    >
                      {q.status === "answered"
                        ? "Edit Answer"
                        : "Answer"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Answer modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Answer Question</DialogTitle>
            </DialogHeader>

            {activeQuestion && (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">
                    {activeQuestion.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activeQuestion.body}
                  </p>
                </div>

                {activeQuestion.images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto">
                    {activeQuestion.images.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        className="w-24 h-24 rounded object-cover"
                      />
                    ))}
                  </div>
                )}

                <Textarea
                  rows={6}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Write the official answer…"
                />
              </div>
            )}

            <DialogFooter>
              <Button onClick={saveAnswer}>Save Answer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
