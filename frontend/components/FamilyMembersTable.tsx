
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";

interface Profile {
  id: number;
  data_of_birth: string;
  address: { full_address: string } | null;
  photo: string | null;
  blood_group: string | null;
  relationship: string | null;
  name_bn?: string | null;
}

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  status: string | null;
  profile: Profile | null;
  name: string;
}

interface FamilyMembersTableProps {
  children: Child[];
}

export function FamilyMembersTable({ children }: FamilyMembersTableProps) {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Linked Family Members
          </CardTitle>
          <CardDescription>
            Manage your family members' health cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Relationship</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {children.map((child) => (
                <TableRow key={child.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {child.profile?.photo ? (
                        <img
                          src={
                            child.profile.photo.startsWith("http")
                              ? child.profile.photo
                              : `${process.env.NEXT_PUBLIC_API_URL}${child.profile.photo}`
                          }
                          alt={child.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-lg">
                            {child.first_name?.[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{child.name}</p>
                        <p className="text-sm text-gray-500">
                          {child.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        child.status === "pending" ? "outline" : "default"
                      }
                      className={
                        child.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }
                    >
                      {child.status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {child.profile?.data_of_birth || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium text-red-500">
                    {child.profile?.blood_group || "N/A"}
                  </TableCell>
                  <TableCell>
                    {child.profile?.relationship || "N/A"}
                  </TableCell>
                </TableRow>
              ))}
              {children.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No linked family members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
