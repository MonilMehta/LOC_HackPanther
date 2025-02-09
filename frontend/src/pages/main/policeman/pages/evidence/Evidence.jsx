import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderOpen,
  FileText,
  Image,
  Video,
  Search,
  ChevronRight,
  ChevronDown,
  Upload,
  Loader2,
} from "lucide-react";
import {
  getAllCase,
  getCaseEvidence,
  uploadEvidence,
} from "../../../../../apis/evidence.api";
import axios from "axios";
import { useCookies } from "react-cookie";
import AWSHelper from "../../../../../services/aws";

const Evidence = () => {
  const [cases, setCases] = useState([]);
  const [expandedCaseId, setExpandedCaseId] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [uploadingStates, setUploadingStates] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState({});
  const [selectedTypes, setSelectedTypes] = useState({});
  const [cookies] = useCookies(["accessToken", "id"]);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await axios.get(getAllCase, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });
      setCases(response.data.data);
    } catch (error) {
      console.error("Error fetching cases:", error);
    }
  };

  const toggleCase = async (caseId) => {
    if (expandedCaseId === caseId) {
      setExpandedCaseId(null);
      return;
    }

    setExpandedCaseId(caseId);
    setLoadingStates((prev) => ({ ...prev, [caseId]: true }));

    try {
      const response = await axios.get(`${getCaseEvidence}/${caseId}`, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });
      console.log(response.data.data);

      setCases((prevCases) =>
        prevCases.map((c) =>
          c._id === caseId ? { ...c, evidence: response.data.data } : c
        )
      );
    } catch (error) {
      console.error("Error fetching evidence:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [caseId]: false }));
    }
  };

  const handleFileSelect = (caseId, event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [caseId]: file }));
    }
  };

  const handleTypeSelect = (caseId, value) => {
    setSelectedTypes((prev) => ({ ...prev, [caseId]: value }));
  };

  const handleUpload = async (caseId) => {
    const file = selectedFiles[caseId];
    const type = selectedTypes[caseId];

    if (!file || !type) {
      alert("Please select both a file and evidence type");
      return;
    }

    setUploadingStates((prev) => ({ ...prev, [caseId]: true }));

    try {
      const fileUrl = await AWSHelper.upload(file, cookies.id);

      // Append evidence object into the case's evidence array
      const response = await axios.post(
        uploadEvidence,
        { type, fileUrl, caseId: expandedCaseId },
        {
          headers: { Authorization: `Bearer ${cookies.accessToken}` },
        }
      );
      console.log(response);
      // Fetch updated case evidence
      const updatedCase = await axios.get(`${getCaseEvidence}/${caseId}`, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });

      // Update state with the new evidence
      setCases((prevCases) =>
        prevCases.map((c) =>
          c._id === caseId ? { ...c, evidence: updatedCase.data.data } : c
        )
      );

      // Reset input fields
      setSelectedFiles((prev) => ({ ...prev, [caseId]: null }));
      setSelectedTypes((prev) => ({ ...prev, [caseId]: null }));
    } catch (error) {
      console.error("Error uploading evidence:", error);
      alert("Failed to upload evidence. Please try again.");
    } finally {
      setUploadingStates((prev) => ({ ...prev, [caseId]: false }));
    }
  };

  const getEvidenceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "photo":
        return <Image className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredCases = cases.filter(
    (case_) =>
      case_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Digital Evidence Management
            </CardTitle>
            <Input
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCases.map((case_) => (
              <div key={case_._id} className="border rounded-lg">
                <div
                  className="flex items-center p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleCase(case_._id)}
                >
                  {loadingStates[case_._id] ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : expandedCaseId === case_._id ? (
                    <ChevronDown className="w-4 h-4 mr-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-2" />
                  )}
                  <FolderOpen className="w-5 h-5 mr-3 text-yellow-500" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{case_.title}</h3>
                    <p className="text-sm text-gray-500">
                      Created on {case_.createdAt.split("T")[0]}
                    </p>
                  </div>
                  <Badge>{case_.status}</Badge>
                </div>

                {expandedCaseId === case_._id && (
                  <div className="border-t p-4">
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-semibold mb-4">
                        Upload New Evidence
                      </h4>
                      <div className="flex gap-4 items-start">
                        <div className="flex-1">
                          <Input
                            type="file"
                            onChange={(e) => handleFileSelect(case_._id, e)}
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.mov"
                            className="mb-2"
                          />
                          <Select
                            value={selectedTypes[case_._id]}
                            onValueChange={(value) =>
                              handleTypeSelect(case_._id, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select evidence type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Photo">Photo</SelectItem>
                              <SelectItem value="Video">Video</SelectItem>
                              <SelectItem value="Document">Document</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => handleUpload(case_._id)}
                          disabled={
                            uploadingStates[case_._id] ||
                            !selectedFiles[case_._id] ||
                            !selectedTypes[case_._id]
                          }
                        >
                          {uploadingStates[case_._id] ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Upload
                        </Button>
                      </div>
                    </div>

                    {loadingStates[case_._id] ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {case_.evidence.map((evidence) => (
                          <div
                            key={evidence._id}
                            className="flex items-center p-3 rounded-lg hover:bg-gray-50 border"
                          >
                            {getEvidenceIcon(evidence.type)}
                            <div className="ml-3 flex-1">
                              <h5 className="font-medium">
                                {evidence.title || "Untitled"}
                              </h5>
                              <p className="text-sm text-gray-500">
                                {evidence.type}
                              </p>

                              {/* Render image if the evidence type is photo/image */}
                              {["photo", "image"].includes(
                                evidence.type.toLowerCase()
                              ) && (
                                <Link to={evidence.fileUrl}>
                                  <img
                                    src={evidence.fileUrl}
                                    alt="Evidence"
                                    className="mt-2 rounded-md w-20 h-20 object-cover border cursor-pointer"
                                  />
                                </Link>
                              )}

                              {/* Render video if the evidence type is video */}
                              {evidence.type.toLowerCase() === "video" && (
                                <video
                                  controls
                                  className="mt-2 rounded-md w-40 h-24 border"
                                >
                                  <source
                                    src={evidence.fileUrl}
                                    type="video/mp4"
                                  />
                                  Your browser does not support the video tag.
                                </video>
                              )}
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {evidence.uploadedBy.fullname}
                            </Badge>
                          </div>
                        ))}
                        {case_.evidence.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            No evidence found for this case
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Evidence;
