
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, Search, UserCog, UserPlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Sample personnel data
const personnelData = [
  { 
    id: 1, 
    name: 'Alex Johnson', 
    role: 'Security Officer', 
    status: 'active', 
    location: 'Main Entrance', 
    lastActive: '2 minutes ago'
  },
  { 
    id: 2, 
    name: 'Maria Rodriguez', 
    role: 'Team Leader', 
    status: 'active', 
    location: 'Central Plaza', 
    lastActive: 'Just now'
  },
  { 
    id: 3, 
    name: 'James Smith', 
    role: 'Security Officer', 
    status: 'idle', 
    location: 'East Wing', 
    lastActive: '15 minutes ago'
  },
  { 
    id: 4, 
    name: 'Sarah Chen', 
    role: 'Control Room Operator', 
    status: 'active', 
    location: 'Control Room', 
    lastActive: '5 minutes ago'
  },
  { 
    id: 5, 
    name: 'David Miller', 
    role: 'Emergency Response', 
    status: 'away', 
    location: 'West Exit', 
    lastActive: '1 hour ago'
  },
  { 
    id: 6, 
    name: 'Lisa Brown', 
    role: 'Security Officer', 
    status: 'active', 
    location: 'Food Court', 
    lastActive: '3 minutes ago'
  },
];

const Personnel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter personnel based on search
  const filteredPersonnel = personnelData.filter(person => {
    return (
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Paginate results
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPersonnel = filteredPersonnel.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPersonnel.length / itemsPerPage);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-alert-low';
      case 'idle': return 'bg-alert-medium';
      case 'away': return 'bg-alert-high';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Personnel Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Personnel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Personnel</DialogTitle>
              <DialogDescription>
                Enter the details of the new staff member to add them to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">Role</label>
                <Input id="role" placeholder="Security Officer, Team Leader, etc." />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">Assigned Location</label>
                <Input id="location" placeholder="Main Entrance, Control Room, etc." />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="w-full">Add Staff Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search by name, role or location..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPersonnel.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.role}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(person.status)}`}></div>
                        <span className="capitalize">{person.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>{person.location}</TableCell>
                    <TableCell>{person.lastActive}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <UserCog className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit {person.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input defaultValue={person.name} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <Input defaultValue={person.role} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Location</label>
                                <Input defaultValue={person.location} />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">Cancel</Button>
                              <Button>Save Changes</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        href="#" 
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Personnel;
