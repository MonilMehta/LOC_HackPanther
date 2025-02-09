import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import mostWantedData from '../../../../../assets/most_wanted.json';

const MostWanted = () => {
  const [searchTerm, setSearchTerm] = useState(""); 
  console.log(mostWantedData.data);
  const filteredData = mostWantedData.data.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOrganizationBadgeColor = (org) => {
    switch (org.toLowerCase()) {
      case "jihadi":
        return "bg-red-500";
      case "ficn":
        return "bg-yellow-500";
      case "left wing extremism":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Most Wanted Criminals</h1>
        <Input
          placeholder="Search criminals..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Featured Most Wanted */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.slice(0, 6).map((person, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{person.name}</span>
                <Badge className={getOrganizationBadgeColor(person.organization)}>
                  {person.organization || 'Unknown'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={person.image_url}
                  alt={person.name}
                  className="w-24 h-24 rounded-md object-cover"
                  onError={(e) => {
                    e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + person.name;
                  }}
                />
                <div className="space-y-2">
                  {person.aliases && (
                    <p className="text-sm">
                      <span className="font-semibold">Aliases:</span> {person.aliases}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-semibold">Location:</span> {person.address || 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Complete Wanted List Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Wanted Criminals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Aliases</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Last Known Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((person, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <img
                        src={person.image_url}
                        alt={person.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + person.name;
                        }}
                      />
                      {person.name}
                    </div>
                  </TableCell>
                  <TableCell>{person.aliases || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getOrganizationBadgeColor(person.organization)}>
                      {person.organization || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{person.address || 'Unknown'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MostWanted;