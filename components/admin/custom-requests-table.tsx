"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";

interface CustomRequest {
  id: string;
  name: string | null;
  email: string;
  topic: string;
  details: string | null;
  language: string;
  agreed_to_terms: boolean;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface CustomRequestsTableProps {
  requests: CustomRequest[];
}

export function CustomRequestsTable({ requests }: CustomRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);

  const filteredRequests = requests.filter(
    (request) =>
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.name && request.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      reviewing: "default",
      accepted: "default",
      rejected: "destructive",
      completed: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by email, name, or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <div className="text-sm text-[#5A6780]">
          {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-[#5A6780]">
                  No custom requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.name || "—"}
                  </TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {request.topic}
                  </TableCell>
                  <TableCell className="uppercase">{request.language}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-sm text-[#5A6780]">
                    {formatDate(request.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-serif text-[#051C2C]">
                  Request Details
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-[#5A6780] hover:text-[#051C2C]"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#5A6780]">Name</label>
                  <p className="text-[#051C2C]">{selectedRequest.name || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5A6780]">Email</label>
                  <p className="text-[#051C2C]">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5A6780]">Language</label>
                  <p className="text-[#051C2C] uppercase">{selectedRequest.language}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5A6780]">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#5A6780]">Topic</label>
                <p className="text-[#051C2C] mt-1">{selectedRequest.topic}</p>
              </div>

              {selectedRequest.details && (
                <div>
                  <label className="text-sm font-medium text-[#5A6780]">Details</label>
                  <p className="text-[#051C2C] mt-1 whitespace-pre-wrap">
                    {selectedRequest.details}
                  </p>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div>
                  <label className="text-sm font-medium text-[#5A6780]">Admin Notes</label>
                  <p className="text-[#051C2C] mt-1 whitespace-pre-wrap">
                    {selectedRequest.admin_notes}
                  </p>
                </div>
              )}

              <div className="text-xs text-[#5A6780] pt-4 border-t">
                Created: {formatDate(selectedRequest.created_at)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
