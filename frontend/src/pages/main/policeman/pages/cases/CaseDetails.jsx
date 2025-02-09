import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Clock, AlertCircle, FileText } from "lucide-react";

const CaseDetails = () => {
  const location = useLocation();
  const caseData = location.state?.caseData;
  const [notification, setNotification] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  if (!caseData) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p>No case data available. Please select a case from the overview.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeline = [
    { date: new Date(caseData.dateReported).toLocaleString(), event: "Case Created" },
    { date: new Date(caseData.updatedAt || caseData.dateReported).toLocaleString(), event: "Last Updated" }
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleSubmit = async (type, data) => {
    try {
      let endpoint;
      switch(type) {
        case 'witness':
          endpoint = 'http://localhost:8000/api/case/registerWitness';
          break;
        case 'evidence':
          endpoint = 'http://localhost:8000/api/case/registerEvidence';
          break;
        default:
          throw new Error('Invalid submission type');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, caseId: caseData._id }),
      });

      if (!response.ok) throw new Error('Submission failed');

      setNotification({
        type: 'success',
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      {notification && (
        <Alert variant={notification.type === 'success' ? 'default' : 'destructive'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-4">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-2">Case: {caseData.caseNumber}</h2>
          <p className="text-gray-600">{caseData.title}</p>
          <p className="mt-2">{caseData.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">Status: {caseData.status}</Badge>
            <Badge variant="secondary">Location: {caseData.location}</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="officer">Officer</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="witnesses">Witnesses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Case Information</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Update Status</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Case Status</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-investigation">Under Investigation</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea placeholder="Reason for status update" />
                    </div>
                    <DialogFooter>
                      <Button onClick={() => handleSubmit('status', {})}>Update Status</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Case No:</strong> {caseData.caseNumber}</p>
                <p><strong>Title:</strong> {caseData.title}</p>
                <p><strong>Description:</strong> {caseData.description}</p>
                <p><strong>Status:</strong> {caseData.status}</p>
                <p><strong>Location:</strong> {caseData.location}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Evidence</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Add Evidence</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Evidence</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input 
                        type="file" 
                        multiple 
                        accept="image/*,video/*,.pdf,.doc,.docx" 
                        onChange={handleFileChange}
                      />
                      <Textarea placeholder="Evidence Description" />
                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {file.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={() => handleSubmit('evidence', {})}>Submit Evidence</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {caseData.evidence && caseData.evidence.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {caseData.evidence.map((link, index) => (
                    <a key={index} href={link} target="_blank" rel="noreferrer" className="border rounded p-2 hover:shadow-lg">
                      {link}
                    </a>
                  ))}
                </div>
              ) : (
                <p>No evidence available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="witnesses">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Witness Statements</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Add Witness</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Witness Statement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Witness Name" required />
                      <Textarea placeholder="Witness Statement" required />
                      <Input type="datetime-local" />
                    </div>
                    <DialogFooter>
                      <Button onClick={() => handleSubmit('witness', {})}>Submit Statement</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {caseData.witnesses && caseData.witnesses.length > 0 ? (
                  <div className="space-y-4">
                    {caseData.witnesses.map((witness, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p className="font-semibold">{witness.witnessName}</p>
                          <p className="text-gray-600">{witness.statement}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Recorded: {new Date(witness.recordedAt).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p>No witness statements recorded.</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Reports</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Generate Report</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Case Report</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Report Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="investigation">Investigation Report</SelectItem>
                          <SelectItem value="evidence">Evidence Summary</SelectItem>
                          <SelectItem value="witness">Witness Statements</SelectItem>
                          <SelectItem value="progress">Progress Report</SelectItem>
                          <SelectItem value="full">Full Case Report</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="date" placeholder="Start Date" />
                        <Input type="date" placeholder="End Date" />
                      </div>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="doc">DOC</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button>Generate Report</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {caseData.reports ? (
                  <div className="space-y-4">
                    {caseData.reports.map((report, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p className="font-semibold">{report.type} Report</p>
                          <p className="text-sm text-gray-500">
                            Generated: {new Date(report.generatedAt).toLocaleString()}
                          </p>
                          <Button variant="outline" className="mt-2">
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p>No reports generated yet.</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="officer">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Officer</CardTitle>
            </CardHeader>
            <CardContent>
              {caseData.assignedTo ? (
                <p>{caseData.assignedTo}</p>
              ) : (
                <p>No officer assigned.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline of Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {timeline.map((entry, index) => (
                    <div key={index} className="flex items-start gap-4 border-l-2 border-gray-200 pl-4 pb-4">
                      <Clock className="h-4 w-4 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{entry.date}</p>
                        <p>{entry.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaseDetails;