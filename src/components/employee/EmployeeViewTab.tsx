import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Loader2, 
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  MoreHorizontal,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  DollarSign,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Users,
  UserPlus,
  Settings,
  FileText,
  Star,
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { format } from 'date-fns';
import { EmployeeOnboardForm } from './EmployeeOnboardForm';

interface EmployeeViewTabProps {
  // Props can be added here if needed
}

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  nationality: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  
  // Employment Information
  department: string;
  position: string;
  reportingManager: string;
  joiningDate: string;
  contractType: 'permanent' | 'contract' | 'temporary' | 'intern';
  unit: string;
  
  // Contract Details
  probationPeriod?: string;
  noticePeriod?: string;
  salary?: string;
  benefits?: string;
  workingHours?: string;
  workLocation?: string;
  
  // Status and Additional Information
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  skills: string;
  experience: string;
  education: string;
  notes: string;
  
  // System Information
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastLogin?: string;
}

type SortField = 'fullName' | 'employeeId' | 'department' | 'position' | 'joiningDate' | 'status' | 'createdAt' | 'updatedAt';
type SortOrder = 'ASC' | 'DESC';

export const EmployeeViewTab = ({}: EmployeeViewTabProps) => {
  const { currentUser, hasPermission } = useRole();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterContractType, setFilterContractType] = useState('all');
  
  // Sorting and pagination
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mock employee data - Replace with actual API call
  const mockEmployees: Employee[] = [
    {
      id: '1',
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+1234567890',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      maritalStatus: 'single',
      nationality: 'American',
      address: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+1234567891',
      emergencyContactRelation: 'Sister',
      department: 'Engineering',
      position: 'Senior Software Engineer',
      reportingManager: 'Sarah Wilson',
      joiningDate: '2022-01-15',
      contractType: 'permanent',
      unit: 'Main Office',
      probationPeriod: '3-months',
      noticePeriod: '1-month',
      salary: '85000',
      benefits: 'Health Insurance, 401k, Paid Time Off',
      workingHours: '9:00 AM - 6:00 PM',
      workLocation: 'Office',
      status: 'active',
      skills: 'React, TypeScript, Node.js, Python',
      experience: '5 years in software development',
      education: 'Bachelor of Computer Science',
      notes: 'Excellent team player, leads technical initiatives',
      createdAt: '2022-01-15T09:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      createdBy: 'HR Manager',
      lastLogin: '2024-01-20T08:45:00Z'
    },
    {
      id: '2',
      employeeId: 'EMP002',
      firstName: 'Jane',
      lastName: 'Smith',
      fullName: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+1234567892',
      dateOfBirth: '1988-08-22',
      gender: 'female',
      maritalStatus: 'married',
      nationality: 'Canadian',
      address: '456 Oak Avenue',
      city: 'Toronto',
      state: 'ON',
      postalCode: 'M5V 3A8',
      country: 'Canada',
      emergencyContactName: 'Mike Smith',
      emergencyContactPhone: '+1234567893',
      emergencyContactRelation: 'Husband',
      department: 'Marketing',
      position: 'Marketing Manager',
      reportingManager: 'David Brown',
      joiningDate: '2021-06-01',
      contractType: 'permanent',
      unit: 'Branch Office',
      probationPeriod: '3-months',
      noticePeriod: '2-months',
      salary: '75000',
      benefits: 'Health Insurance, Dental, Vision, 401k',
      workingHours: '9:00 AM - 5:00 PM',
      workLocation: 'Hybrid',
      status: 'active',
      skills: 'Digital Marketing, SEO, Content Strategy, Analytics',
      experience: '7 years in marketing',
      education: 'Master of Business Administration',
      notes: 'Creative and strategic thinker',
      createdAt: '2021-06-01T09:00:00Z',
      updatedAt: '2024-01-10T14:20:00Z',
      createdBy: 'HR Manager',
      lastLogin: '2024-01-20T09:15:00Z'
    },
    {
      id: '3',
      employeeId: 'EMP003',
      firstName: 'Mike',
      lastName: 'Johnson',
      fullName: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      phone: '+1234567894',
      dateOfBirth: '1992-12-10',
      gender: 'male',
      maritalStatus: 'single',
      nationality: 'British',
      address: '789 Pine Street',
      city: 'London',
      state: 'England',
      postalCode: 'SW1A 1AA',
      country: 'UK',
      emergencyContactName: 'Lisa Johnson',
      emergencyContactPhone: '+1234567895',
      emergencyContactRelation: 'Mother',
      department: 'Sales',
      position: 'Sales Executive',
      reportingManager: 'Tom Wilson',
      joiningDate: '2023-03-01',
      contractType: 'contract',
      unit: 'Remote Office',
      probationPeriod: '2-months',
      noticePeriod: '1-month',
      salary: '60000',
      benefits: 'Health Insurance, Commission',
      workingHours: '8:30 AM - 5:30 PM',
      workLocation: 'Remote',
      status: 'active',
      skills: 'Sales, CRM, Negotiation, Customer Relations',
      experience: '3 years in sales',
      education: 'Bachelor of Business',
      notes: 'High performer, exceeds targets consistently',
      createdAt: '2023-03-01T09:00:00Z',
      updatedAt: '2024-01-18T16:45:00Z',
      createdBy: 'HR Manager',
      lastLogin: '2024-01-19T10:30:00Z'
    },
    {
      id: '4',
      employeeId: 'EMP004',
      firstName: 'Sarah',
      lastName: 'Wilson',
      fullName: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      phone: '+1234567896',
      dateOfBirth: '1985-04-18',
      gender: 'female',
      maritalStatus: 'married',
      nationality: 'Australian',
      address: '321 Elm Street',
      city: 'Sydney',
      state: 'NSW',
      postalCode: '2000',
      country: 'Australia',
      emergencyContactName: 'Robert Wilson',
      emergencyContactPhone: '+1234567897',
      emergencyContactRelation: 'Husband',
      department: 'HR',
      position: 'HR Manager',
      reportingManager: 'CEO',
      joiningDate: '2020-09-01',
      contractType: 'permanent',
      unit: 'Head Office',
      probationPeriod: '6-months',
      noticePeriod: '3-months',
      salary: '95000',
      benefits: 'Full Benefits Package',
      workingHours: '9:00 AM - 6:00 PM',
      workLocation: 'Office',
      status: 'active',
      skills: 'HR Management, Recruitment, Employee Relations, Compliance',
      experience: '10 years in HR',
      education: 'Master of Human Resources',
      notes: 'Experienced HR professional, team leader',
      createdAt: '2020-09-01T09:00:00Z',
      updatedAt: '2024-01-15T11:20:00Z',
      createdBy: 'CEO',
      lastLogin: '2024-01-20T08:00:00Z'
    },
    {
      id: '5',
      employeeId: 'EMP005',
      firstName: 'David',
      lastName: 'Brown',
      fullName: 'David Brown',
      email: 'david.brown@company.com',
      phone: '+1234567898',
      dateOfBirth: '1987-11-25',
      gender: 'male',
      maritalStatus: 'divorced',
      nationality: 'American',
      address: '654 Maple Drive',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'USA',
      emergencyContactName: 'Emily Brown',
      emergencyContactPhone: '+1234567899',
      emergencyContactRelation: 'Daughter',
      department: 'Finance',
      position: 'Senior Accountant',
      reportingManager: 'CFO',
      joiningDate: '2021-02-15',
      contractType: 'permanent',
      unit: 'Main Office',
      probationPeriod: '3-months',
      noticePeriod: '2-months',
      salary: '80000',
      benefits: 'Health Insurance, 401k, Stock Options',
      workingHours: '8:00 AM - 5:00 PM',
      workLocation: 'Office',
      status: 'active',
      skills: 'Accounting, Financial Analysis, Excel, QuickBooks',
      experience: '8 years in accounting',
      education: 'Bachelor of Accounting',
      notes: 'Detail-oriented, excellent with numbers',
      createdAt: '2021-02-15T09:00:00Z',
      updatedAt: '2024-01-12T13:15:00Z',
      createdBy: 'HR Manager',
      lastLogin: '2024-01-20T07:45:00Z'
    },
    {
      id: '6',
      employeeId: 'EMP006',
      firstName: 'Lisa',
      lastName: 'Garcia',
      fullName: 'Lisa Garcia',
      email: 'lisa.garcia@company.com',
      phone: '+1234567800',
      dateOfBirth: '1991-07-12',
      gender: 'female',
      maritalStatus: 'single',
      nationality: 'Spanish',
      address: '789 Pine Street',
      city: 'Madrid',
      state: 'Madrid',
      postalCode: '28001',
      country: 'Spain',
      emergencyContactName: 'Carlos Garcia',
      emergencyContactPhone: '+1234567801',
      emergencyContactRelation: 'Brother',
      department: 'Customer Service',
      position: 'Customer Support Manager',
      reportingManager: 'Sarah Wilson',
      joiningDate: '2023-01-10',
      contractType: 'permanent',
      unit: 'Branch Office',
      probationPeriod: '3-months',
      noticePeriod: '1-month',
      salary: '55000',
      benefits: 'Health Insurance, 401k',
      workingHours: '9:00 AM - 6:00 PM',
      workLocation: 'Office',
      status: 'active',
      skills: 'Customer Relations, CRM, Communication, Problem Solving',
      experience: '4 years in customer service',
      education: 'Bachelor of Business Administration',
      notes: 'Excellent customer service skills, multilingual',
      createdAt: '2023-01-10T09:00:00Z',
      updatedAt: '2024-01-18T14:30:00Z',
      createdBy: 'HR Manager',
      lastLogin: '2024-01-20T09:30:00Z'
    },
    {
      id: '7',
      employeeId: 'EMP007',
      firstName: 'Robert',
      lastName: 'Chen',
      fullName: 'Robert Chen',
      email: 'robert.chen@company.com',
      phone: '+1234567802',
      dateOfBirth: '1989-03-25',
      gender: 'male',
      maritalStatus: 'married',
      nationality: 'Chinese',
      address: '456 Oak Avenue',
      city: 'Beijing',
      state: 'Beijing',
      postalCode: '100000',
      country: 'China',
      emergencyContactName: 'Wei Chen',
      emergencyContactPhone: '+1234567803',
      emergencyContactRelation: 'Wife',
      department: 'Operations',
      position: 'Operations Manager',
      reportingManager: 'David Brown',
      joiningDate: '2021-08-15',
      contractType: 'permanent',
      unit: 'Head Office',
      probationPeriod: '6-months',
      noticePeriod: '2-months',
      salary: '90000',
      benefits: 'Full Benefits Package',
      workingHours: '8:00 AM - 6:00 PM',
      workLocation: 'Office',
      status: 'active',
      skills: 'Operations Management, Process Improvement, Team Leadership',
      experience: '8 years in operations',
      education: 'Master of Business Administration',
      notes: 'Strong leadership skills, process optimization expert',
      createdAt: '2021-08-15T09:00:00Z',
      updatedAt: '2024-01-16T11:45:00Z',
      createdBy: 'HR Manager',
      lastLogin: '2024-01-20T08:15:00Z'
    },
    {
      id: '8',
      employeeId: 'EMP008',
      firstName: 'Maria',
      lastName: 'Rodriguez',
      fullName: 'Maria Rodriguez',
      email: 'maria.rodriguez@company.com',
      phone: '+1234567804',
      dateOfBirth: '1993-11-08',
      gender: 'female',
      maritalStatus: 'single',
      nationality: 'Mexican',
      address: '321 Elm Street',
      city: 'Mexico City',
      state: 'CDMX',
      postalCode: '01000',
      country: 'Mexico',
      emergencyContactName: 'Jose Rodriguez',
      emergencyContactPhone: '+1234567805',
      emergencyContactRelation: 'Father',
      department: 'IT',
      position: 'Software Developer',
      reportingManager: 'John Doe',
      joiningDate: '2023-05-01',
      contractType: 'contract',
      unit: 'Remote Office',
      probationPeriod: '2-months',
      noticePeriod: '1-month',
      salary: '65000',
      benefits: 'Health Insurance, Flexible Hours',
      workingHours: 'Flexible',
      workLocation: 'Remote',
      status: 'active',
      skills: 'JavaScript, Python, React, Node.js, Database Design',
      experience: '3 years in software development',
      education: 'Bachelor of Computer Science',
      notes: 'Full-stack developer, remote work specialist',
      createdAt: '2023-05-01T09:00:00Z',
      updatedAt: '2024-01-19T16:20:00Z',
      createdBy: 'HR Manager',
      lastLogin: '2024-01-20T10:45:00Z'
    },
    {
      id: '9',
      employeeId: 'EMP009',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      fullName: 'Ahmed Hassan',
      email: 'ahmed.hassan@company.com',
      phone: '+1234567806',
      dateOfBirth: '1986-09-14',
      gender: 'male',
      maritalStatus: 'married',
      nationality: 'Egyptian',
      address: '654 Maple Drive',
      city: 'Cairo',
      state: 'Cairo',
      postalCode: '11511',
      country: 'Egypt',
      emergencyContactName: 'Fatima Hassan',
      emergencyContactPhone: '+1234567807',
      emergencyContactRelation: 'Wife',
      department: 'Finance',
      position: 'Financial Analyst',
      reportingManager: 'David Brown',
      joiningDate: '2022-03-20',
      contractType: 'permanent',
      unit: 'Main Office',
      probationPeriod: '3-months',
      noticePeriod: '2-months',
      salary: '70000',
      benefits: 'Health Insurance, 401k, Stock Options',
      workingHours: '9:00 AM - 5:00 PM',
      workLocation: 'Office',
      status: 'active',
      skills: 'Financial Analysis, Excel, SQL, Data Visualization',
      experience: '6 years in financial analysis',
      education: 'Master of Finance',
      notes: 'Expert in financial modeling and data analysis',
      createdAt: '2022-03-20T09:00:00Z',
      updatedAt: '2024-01-17T13:15:00Z',
      createdBy: 'HR Manager',
      lastLogin: '2024-01-20T07:30:00Z'
    },
    {
      id: '10',
      employeeId: 'EMP010',
      firstName: 'Emma',
      lastName: 'Thompson',
      fullName: 'Emma Thompson',
      email: 'emma.thompson@company.com',
      phone: '+1234567808',
      dateOfBirth: '1994-12-03',
      gender: 'female',
      maritalStatus: 'single',
      nationality: 'British',
      address: '987 Cedar Lane',
      city: 'Manchester',
      state: 'England',
      postalCode: 'M1 1AA',
      country: 'UK',
      emergencyContactName: 'James Thompson',
      emergencyContactPhone: '+1234567809',
      emergencyContactRelation: 'Brother',
      department: 'Marketing',
      position: 'Digital Marketing Specialist',
      reportingManager: 'Jane Smith',
      joiningDate: '2023-09-01',
      contractType: 'temporary',
      unit: 'Branch Office',
      probationPeriod: '1-month',
      noticePeriod: '1-week',
      salary: '45000',
      benefits: 'Health Insurance',
      workingHours: '9:00 AM - 5:00 PM',
      workLocation: 'Hybrid',
      status: 'active',
      skills: 'Digital Marketing, Social Media, Content Creation, Analytics',
      experience: '2 years in digital marketing',
      education: 'Bachelor of Marketing',
      notes: 'Creative marketer with strong social media presence',
      createdAt: '2023-09-01T09:00:00Z',
      updatedAt: '2024-01-20T12:00:00Z',
      createdBy: 'HR Manager',
      lastLogin: '2024-01-20T11:15:00Z'
    },
    {
      id: '11',
      employeeId: 'EMP011',
      firstName: 'Yuki',
      lastName: 'Tanaka',
      fullName: 'Yuki Tanaka',
      email: 'yuki.tanaka@company.com',
      phone: '+1234567810',
      dateOfBirth: '1992-06-18',
      gender: 'female',
      maritalStatus: 'single',
      nationality: 'Japanese',
      address: '555 Sakura Street',
      city: 'Tokyo',
      state: 'Tokyo',
      postalCode: '100-0001',
      country: 'Japan',
      emergencyContactName: 'Hiroshi Tanaka',
      emergencyContactPhone: '+1234567811',
      emergencyContactRelation: 'Father',
      department: 'Engineering',
      position: 'Frontend Developer',
      reportingManager: 'John Doe',
      joiningDate: '2023-11-15',
      contractType: 'intern',
      unit: 'Main Office',
      probationPeriod: '1-month',
      noticePeriod: '1-week',
      salary: '35000',
      benefits: 'Health Insurance, Learning Budget',
      workingHours: '9:00 AM - 6:00 PM',
      workLocation: 'Office',
      status: 'active',
      skills: 'React, Vue.js, TypeScript, CSS, UI/UX Design',
      experience: '1 year in frontend development',
      education: 'Bachelor of Computer Science',
      notes: 'Talented intern with strong design skills',
      createdAt: '2023-11-15T09:00:00Z',
      updatedAt: '2024-01-19T15:30:00Z',
      createdBy: 'HR Manager',
      lastLogin: '2024-01-20T09:45:00Z'
    },
    {
      id: '12',
      employeeId: 'EMP012',
      firstName: 'Carlos',
      lastName: 'Silva',
      fullName: 'Carlos Silva',
      email: 'carlos.silva@company.com',
      phone: '+1234567812',
      dateOfBirth: '1988-04-22',
      gender: 'male',
      maritalStatus: 'married',
      nationality: 'Brazilian',
      address: '777 Copacabana Avenue',
      city: 'Rio de Janeiro',
      state: 'RJ',
      postalCode: '22000-000',
      country: 'Brazil',
      emergencyContactName: 'Ana Silva',
      emergencyContactPhone: '+1234567813',
      emergencyContactRelation: 'Wife',
      department: 'Sales',
      position: 'Sales Manager',
      reportingManager: 'Mike Johnson',
      joiningDate: '2022-07-01',
      contractType: 'permanent',
      unit: 'Branch Office',
      probationPeriod: '3-months',
      noticePeriod: '2-months',
      salary: '75000',
      benefits: 'Health Insurance, Commission, Car Allowance',
      workingHours: '8:30 AM - 5:30 PM',
      workLocation: 'Office',
      status: 'active',
      skills: 'Sales Management, CRM, Negotiation, Team Leadership',
      experience: '7 years in sales',
      education: 'Bachelor of Business',
      notes: 'Top performer, consistently exceeds targets',
      createdAt: '2022-07-01T09:00:00Z',
      updatedAt: '2024-01-18T17:45:00Z',
      createdBy: 'HR Manager',
      lastLogin: '2024-01-20T08:30:00Z'
    }
  ];

  const departments = ['all', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Customer Service', 'IT'];
  const contractTypes = ['all', 'permanent', 'contract', 'temporary', 'intern'];


  const contractTypeConfig = {
    permanent: { label: 'Permanent', color: 'bg-blue-100 text-blue-800', icon: Shield },
    contract: { label: 'Contract', color: 'bg-orange-100 text-orange-800', icon: FileText },
    temporary: { label: 'Temporary', color: 'bg-purple-100 text-purple-800', icon: Clock },
    intern: { label: 'Intern', color: 'bg-green-100 text-green-800', icon: Star },
  };

  // Load employees
  useEffect(() => {
    loadEmployees();
  }, []);

  // Filter and search employees
  useEffect(() => {
    let filtered = employees;

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.fullName.toLowerCase().includes(searchLower) ||
        employee.employeeId.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower) ||
        employee.department.toLowerCase().includes(searchLower) ||
        employee.position.toLowerCase().includes(searchLower)
      );
    }

    // Apply department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(employee => employee.department === filterDepartment);
    }


    // Apply contract type filter
    if (filterContractType !== 'all') {
      filtered = filtered.filter(employee => employee.contractType === filterContractType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'joiningDate' || sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [employees, searchQuery, filterDepartment, filterContractType, sortField, sortOrder]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await employeesApi.getAll();
      // setEmployees(response.data);
      
      // Mock data for now
      setEmployees(mockEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employees. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: SortField) => {
    if (sortField === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(column);
      setSortOrder('DESC');
    }
  };

  const getSortIcon = (column: SortField) => {
    if (sortField !== column) {
      return <ArrowUpDown className='w-4 h-4 text-muted-foreground' />;
    }
    return sortOrder === 'ASC' ? (
      <ChevronUp className='w-4 h-4 text-primary' />
    ) : (
      <ChevronDown className='w-4 h-4 text-primary' />
    );
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setSelectedEmployee(null);
    setIsViewDialogOpen(false);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsAddEmployeeDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsAddEmployeeDialogOpen(true);
  };

  const handleCloseAddEmployeeDialog = () => {
    setEditingEmployee(null);
    setIsAddEmployeeDialogOpen(false);
  };

  const handleEmployeeSubmit = (employeeData: any) => {
    console.log('Employee submitted:', employeeData);
    // Here you would typically call an API to save the employee
    // For now, we'll just close the dialog and show a success message
    setIsAddEmployeeDialogOpen(false);
    setEditingEmployee(null);
    
    // Reload employees to show the new one
    loadEmployees();
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);


  return (
    <div className='space-y-6'>
      {/* Main Content */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle className='text-base flex items-center gap-2'>
              <Users className='w-4 h-4' />
              All Employees ({filteredEmployees.length})
            </CardTitle>
            
            <div className='flex items-center gap-2'>
              <div className='relative'>
                <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search employees...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10 w-64'
                />
              </div>
              
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='Department' />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              
              <Select value={filterContractType} onValueChange={setFilterContractType}>
                <SelectTrigger className='w-36'>
                  <SelectValue placeholder='Contract' />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action Buttons */}
              <div className='flex items-center gap-2 ml-2'>
                <Button variant='outline' size='sm'>
                  <Download className='w-4 h-4 mr-2' />
                  Export
                </Button>
                <Button variant='outline' size='sm'>
                  <Upload className='w-4 h-4 mr-2' />
                  Import
                </Button>
                <Button size='sm' onClick={handleAddEmployee}>
                  <UserPlus className='w-4 h-4 mr-2' />
                  Add Employee
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <Loader2 className='w-6 h-6 animate-spin' />
              <span className='ml-2'>Loading employees...</span>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-secondary/20 border-b-2 border-secondary/30'>
                    <TableHead className='min-w-[120px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('employeeId')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Employee ID
                        {getSortIcon('employeeId')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[200px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('fullName')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Employee
                        {getSortIcon('fullName')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[120px]'>Unit/Location</TableHead>
                    <TableHead className='min-w-[150px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('department')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Department
                        {getSortIcon('department')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[150px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('position')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Position
                        {getSortIcon('position')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[120px]'>Contact</TableHead>
                    <TableHead className='min-w-[100px]'>Contract</TableHead>
                    <TableHead className='min-w-[120px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('joiningDate')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Joining Date
                        {getSortIcon('joiningDate')}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.map((employee) => {
                    const employeeContractConfig = contractTypeConfig[employee.contractType];
                    
                    return (
                      <TableRow key={employee.id} className='hover:bg-muted/30'>
                        <TableCell className='font-mono text-sm'>
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className='text-primary hover:text-primary/80 hover:underline cursor-pointer'
                          >
                            {employee.employeeId}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className='font-medium'>{employee.fullName}</div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <MapPin className='w-4 h-4 text-muted-foreground' />
                            {employee.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          {employee.department}
                        </TableCell>
                        <TableCell>
                          {employee.position}
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='flex items-center gap-1 text-sm'>
                              <Mail className='w-3 h-3 text-muted-foreground' />
                              <span className='truncate max-w-32'>{employee.email}</span>
                            </div>
                            <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                              <Phone className='w-3 h-3' />
                              <span>{employee.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={employeeContractConfig.color}>
                            {React.createElement(employeeContractConfig.icon, { className: 'w-3 h-3 mr-1' })}
                            {employeeContractConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {format(new Date(employee.joiningDate), 'dd-MM-yyyy')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination - Hide when searching */}
          {!searchQuery.trim() && (
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
              {/* Page Info */}
              <div className='text-xs sm:text-sm text-muted-foreground'>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} entries
              </div>

              {/* Pagination Controls */}
              <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-2 w-full sm:w-auto'>
                {/* Items per page selector - Mobile optimized */}
                <div className='flex items-center gap-2 w-full sm:w-auto justify-center'>
                  <span className='text-xs sm:text-sm text-muted-foreground whitespace-nowrap'>Show:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      const newLimit = parseInt(value);
                      setItemsPerPage(newLimit);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className='w-16 sm:w-20 h-8 text-xs sm:text-sm'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='10'>10</SelectItem>
                      <SelectItem value='20'>20</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                      <SelectItem value='100'>100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className='text-xs sm:text-sm text-muted-foreground whitespace-nowrap'>per page</span>
                </div>

                {/* Page navigation - Mobile optimized */}
                <div className='flex items-center gap-1'>
                  {/* First page button */}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                  >
                    <ChevronsLeft className='w-3 h-3 sm:w-4 sm:h-4' />
                  </Button>

                  {/* Previous page button */}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                  >
                    <ChevronLeft className='w-3 h-3 sm:w-4 sm:h-4' />
                  </Button>

                  {/* Page numbers - Show up to 6 pages */}
                  <div className='flex items-center gap-1 mx-1 sm:mx-2'>
                    {Array.from(
                      { length: Math.min(6, totalPages) },
                      (_, i) => {
                        let pageNum;
                        
                        if (totalPages <= 6) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = currentPage - 3 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size='sm'
                            onClick={() => setCurrentPage(pageNum)}
                            className='h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs sm:text-sm'
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  {/* Next page button */}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                  >
                    <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4' />
                  </Button>

                  {/* Last page button */}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                  >
                    <ChevronsRight className='w-3 h-3 sm:w-4 sm:h-4' />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results Info - Show when searching and no error */}
      {searchQuery.trim() && filteredEmployees.length > 0 && (
        <div className='text-sm text-muted-foreground text-center py-2'>
          Showing {filteredEmployees.length} employee
          {filteredEmployees.length !== 1 ? 's' : ''} matching "{searchQuery}"
        </div>
      )}

      {/* Employee Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={handleCloseViewDialog}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <User className='w-5 h-5' />
              Employee Details - {selectedEmployee?.fullName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className='space-y-6'>
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Full Name</Label>
                    <p className='font-medium'>{selectedEmployee.fullName}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Employee ID</Label>
                    <p className='font-mono'>{selectedEmployee.employeeId}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Email</Label>
                    <p>{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Phone</Label>
                    <p>{selectedEmployee.phone}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Date of Birth</Label>
                    <p>{format(new Date(selectedEmployee.dateOfBirth), 'dd-MM-yyyy')}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Gender</Label>
                    <p className='capitalize'>{selectedEmployee.gender}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Marital Status</Label>
                    <p className='capitalize'>{selectedEmployee.maritalStatus}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Nationality</Label>
                    <p>{selectedEmployee.nationality}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Employment Information</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Unit/Location</Label>
                    <p>{selectedEmployee.unit}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Department</Label>
                    <p>{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Position</Label>
                    <p>{selectedEmployee.position}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Reporting Manager</Label>
                    <p>{selectedEmployee.reportingManager}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Joining Date</Label>
                    <p>{format(new Date(selectedEmployee.joiningDate), 'dd-MM-yyyy')}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Contract Type</Label>
                    <Badge className={contractTypeConfig[selectedEmployee.contractType].color}>
                      {contractTypeConfig[selectedEmployee.contractType].label}
                    </Badge>
                  </div>
                  {selectedEmployee.salary && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Salary</Label>
                      <p>${selectedEmployee.salary}</p>
                    </div>
                  )}
                  {selectedEmployee.workingHours && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Working Hours</Label>
                      <p>{selectedEmployee.workingHours}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Address Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <p>{selectedEmployee.address}</p>
                    <p>{selectedEmployee.city}, {selectedEmployee.state} {selectedEmployee.postalCode}</p>
                    <p>{selectedEmployee.country}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Name</Label>
                    <p>{selectedEmployee.emergencyContactName}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Phone</Label>
                    <p>{selectedEmployee.emergencyContactPhone}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Relationship</Label>
                    <p>{selectedEmployee.emergencyContactRelation}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              {(selectedEmployee.skills || selectedEmployee.experience || selectedEmployee.education || selectedEmployee.notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {selectedEmployee.skills && (
                      <div>
                        <Label className='text-sm font-medium text-muted-foreground'>Skills</Label>
                        <p>{selectedEmployee.skills}</p>
                      </div>
                    )}
                    {selectedEmployee.experience && (
                      <div>
                        <Label className='text-sm font-medium text-muted-foreground'>Experience</Label>
                        <p>{selectedEmployee.experience}</p>
                      </div>
                    )}
                    {selectedEmployee.education && (
                      <div>
                        <Label className='text-sm font-medium text-muted-foreground'>Education</Label>
                        <p>{selectedEmployee.education}</p>
                      </div>
                    )}
                    {selectedEmployee.notes && (
                      <div>
                        <Label className='text-sm font-medium text-muted-foreground'>Notes</Label>
                        <p>{selectedEmployee.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Employee Onboard Form Dialog */}
      <EmployeeOnboardForm
        isOpen={isAddEmployeeDialogOpen}
        onClose={handleCloseAddEmployeeDialog}
        onSubmit={handleEmployeeSubmit}
        editingEmployee={editingEmployee}
      />
    </div>
  );
};
