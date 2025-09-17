import { useState } from "react";
import { Clock, CheckCircle, XCircle, Eye, FileText, Plus, AlertTriangle, User, Calendar, Package, Truck, CheckSquare, List, Table as TableIcon, ChevronRight, ChevronDown, MoreVertical, Send, Search, FileEdit } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Link } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";
import { MaterialIssueForm } from "../components/MaterialIssueForm";
import { RequestStatusManager } from "../components/RequestStatusManager";
import { ResubmitForm } from "../components/ResubmitForm";
import { useRequestWorkflow } from "../hooks/useRequestWorkflow";


export const MaterialOrderBookTab = () => {
  const { currentUser } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "table">("table");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isIssueFormOpen, setIsIssueFormOpen] = useState(false);
  const [selectedRequestForStatus, setSelectedRequestForStatus] = useState<any>(null);
  const [isStatusManagerOpen, setIsStatusManagerOpen] = useState(false);
  const [selectedRequestForResubmit, setSelectedRequestForResubmit] = useState<any>(null);
  const [isResubmitFormOpen, setIsResubmitFormOpen] = useState(false);
  
  // Workflow management
  const {
    initializeRequest,
    updateRequestStatus,
    approveRequest,
    revertRequest,
    updateMaterialReceipt,
    getRequestWorkflow,
    canPerformAction
  } = useRequestWorkflow();
  const [issuedMaterials, setIssuedMaterials] = useState<any[]>([
    // Recent Material Issues - Including items from physical form
    {
      id: "ISS-2024-012",
      materialId: "MAT-001",
      materialName: "fevicol",
      specifications: "SH adhesive, MARINE brand",
      unit: "KG",
      existingStock: 1,
      issuedQuantity: "1",
      stockAfterIssue: 0,
      recipientName: "DBLU KUMAR (AJEET)",
      recipientId: "EMP-CH001",
      recipientDesignation: "CH-MISTRI",
      department: "Maintenance",
      machineId: "GENERAL",
      machineName: "General Maintenance",
      purpose: "Adhesive work for equipment repair",
      issuingPersonName: "SHARWAN",
      issuingPersonDesignation: "MAINTANCE -SUPERVISOR",
      issuedBy: "SHARWAN",
      issuedDate: "2024-01-22",
      materialIssueFormSrNo: "SSFM/IISFN/007",
      reqFormSrNo: "SSFM/MNT/RQ/0012",
      indFormSrNo: "SSFM/MNT/IND./0012",
      status: "issued",
      type: "material_issue",
      timestamp: "2024-01-22T09:15:00Z"
    },
    {
      id: "ISS-2024-011",
      materialId: "MAT-002",
      materialName: "wire brush",
      specifications: "0.01 mm thickness of wire, INDUSTRIAL",
      unit: "pieces",
      existingStock: 2,
      issuedQuantity: "2",
      stockAfterIssue: 0,
      recipientName: "RAVI SHARMA",
      recipientId: "EMP-MT002",
      recipientDesignation: "MAINTENANCE TECHNICIAN",
      department: "Maintenance",
      machineId: "MACHINE-003",
      machineName: "Flour Sifter #01",
      purpose: "Cleaning and maintenance of sifter components",
      issuingPersonName: "SHARWAN",
      issuingPersonDesignation: "MAINTANCE -SUPERVISOR",
      issuedBy: "SHARWAN",
      issuedDate: "2024-01-21",
      materialIssueFormSrNo: "SSFM/IISFN/006",
      reqFormSrNo: "SSFM/MNT/RQ/0011",
      indFormSrNo: "SSFM/MNT/IND./0011",
      status: "issued",
      type: "material_issue",
      timestamp: "2024-01-21T14:30:00Z"
    },
    {
      id: "ISS-2024-010",
      materialId: "MAT-003",
      materialName: "dholak ball",
      specifications: "PVC transparent, INDUSTRIAL",
      unit: "pieces",
      existingStock: 200,
      issuedQuantity: "200",
      stockAfterIssue: 0,
      recipientName: "SURESH KUMAR",
      recipientId: "EMP-OP003",
      recipientDesignation: "MACHINE OPERATOR",
      department: "Production Floor A",
      machineId: "MACHINE-001",
      machineName: "Main Flour Mill #01",
      purpose: "Production line component replacement",
      issuingPersonName: "SHARWAN",
      issuingPersonDesignation: "MAINTANCE -SUPERVISOR",
      issuedBy: "SHARWAN",
      issuedDate: "2024-01-20",
      materialIssueFormSrNo: "SSFM/IISFN/005",
      reqFormSrNo: "SSFM/MNT/RQ/0010",
      indFormSrNo: "SSFM/MNT/IND./0010",
      status: "issued",
      type: "material_issue",
      timestamp: "2024-01-20T11:45:00Z"
    },
    {
      id: "ISS-2024-009",
      materialId: "MAT-004",
      materialName: "triangle brush",
      specifications: "Cleaning brush, INDUSTRIAL",
      unit: "pieces",
      existingStock: 130,
      issuedQuantity: "60",
      stockAfterIssue: 70,
      recipientName: "MOHAN LAL",
      recipientId: "EMP-CL001",
      recipientDesignation: "CLEANING SUPERVISOR",
      department: "Housekeeping",
      machineId: "ALL-MACHINES",
      machineName: "General Cleaning Operations",
      purpose: "Daily cleaning and maintenance of all equipment",
      issuingPersonName: "SHARWAN",
      issuingPersonDesignation: "MAINTANCE -SUPERVISOR",
      issuedBy: "SHARWAN",
      issuedDate: "2024-01-19",
      materialIssueFormSrNo: "SSFM/IISFN/004",
      reqFormSrNo: "SSFM/MNT/RQ/0009",
      indFormSrNo: "SSFM/MNT/IND./0009",
      status: "issued",
      type: "material_issue",
      timestamp: "2024-01-19T16:20:00Z"
    },
    {
      id: "ISS-2024-008",
      materialId: "MAT-005",
      materialName: "gum tape",
      specifications: "1 inch width adhesive tape, INDUSTRIAL",
      unit: "pieces",
      existingStock: 14,
      issuedQuantity: "2",
      stockAfterIssue: 12,
      recipientName: "PRAKASH SINGH",
      recipientId: "EMP-PK001",
      recipientDesignation: "PACKAGING SUPERVISOR",
      department: "Packaging",
      machineId: "MACHINE-004",
      machineName: "Main Conveyor #01",
      purpose: "Packaging and sealing operations",
      issuingPersonName: "SHARWAN",
      issuingPersonDesignation: "MAINTANCE -SUPERVISOR",
      issuedBy: "SHARWAN",
      issuedDate: "2024-01-18",
      materialIssueFormSrNo: "SSFM/IISFN/003",
      reqFormSrNo: "SSFM/MNT/RQ/0008",
      indFormSrNo: "SSFM/MNT/IND./0008",
      status: "issued",
      type: "material_issue",
      timestamp: "2024-01-18T13:10:00Z"
    },
    {
      id: "ISS-2024-007",
      materialId: "MAT-006",
      materialName: "Bearings (SKF 6205-2RS)",
      specifications: "Deep Grove Ball Bearing, Inner: 25mm, Outer: 52mm",
      unit: "pieces",
      existingStock: 24,
      issuedQuantity: "4",
      stockAfterIssue: 20,
      recipientName: "RAJESH KUMAR",
      recipientId: "EMP-ME001",
      recipientDesignation: "MECHANICAL ENGINEER",
      department: "Production Floor A",
      machineId: "MACHINE-001",
      machineName: "Main Flour Mill #01",
      purpose: "Replace worn bearings in main grinding unit",
      issuingPersonName: "SHARWAN",
      issuingPersonDesignation: "MAINTANCE -SUPERVISOR",
      issuedBy: "SHARWAN",
      issuedDate: "2024-01-17",
      materialIssueFormSrNo: "SSFM/IISFN/002",
      reqFormSrNo: "SSFM/MNT/RQ/0007",
      indFormSrNo: "SSFM/MNT/IND./0007",
      status: "issued",
      type: "material_issue",
      timestamp: "2024-01-17T10:30:00Z"
    },
    {
      id: "ISS-2024-006",
      materialId: "MAT-007",
      materialName: "Motor Oil (SAE 10W-30)",
      specifications: "Industrial grade lubricant for machinery",
      unit: "liters",
      existingStock: 65,
      issuedQuantity: "15",
      stockAfterIssue: 50,
      recipientName: "VIKRAM SINGH",
      recipientId: "EMP-MT003",
      recipientDesignation: "MAINTENANCE TECHNICIAN",
      department: "Maintenance",
      machineId: "MACHINE-002",
      machineName: "Secondary Mill #02",
      purpose: "Scheduled maintenance and lubrication",
      issuingPersonName: "SHARWAN",
      issuingPersonDesignation: "MAINTANCE -SUPERVISOR",
      issuedBy: "SHARWAN",
      issuedDate: "2024-01-16",
      materialIssueFormSrNo: "SSFM/IISFN/001",
      reqFormSrNo: "SSFM/MNT/RQ/0006",
      indFormSrNo: "SSFM/MNT/IND./0006",
      status: "issued",
      type: "material_issue",
      timestamp: "2024-01-16T14:45:00Z"
    },
    {
      id: "ISS-2024-005",
      materialId: "MAT-008",
      materialName: "Conveyor Belts",
      specifications: "Rubber belt, 600mm width, food grade",
      unit: "meters",
      existingStock: 45,
      issuedQuantity: "8",
      stockAfterIssue: 37,
      recipientName: "ANIL KUMAR",
      recipientId: "EMP-CV001",
      recipientDesignation: "CONVEYOR TECHNICIAN",
      department: "Production Line",
      machineId: "MACHINE-004",
      machineName: "Main Conveyor #01",
      purpose: "Conveyor belt maintenance and repair",
      issuingPersonName: "SHARWAN",
      issuingPersonDesignation: "MAINTANCE -SUPERVISOR",
      issuedBy: "SHARWAN",
      issuedDate: "2024-01-15",
      materialIssueFormSrNo: "SSFM/IISFN/000",
      reqFormSrNo: "SSFM/MNT/RQ/0005",
      indFormSrNo: "SSFM/MNT/IND./0005",
      status: "issued",
      type: "material_issue",
      timestamp: "2024-01-15T11:20:00Z"
    }
  ]);

  // Handle status updates
  const handleStatusUpdate = (requestId: string, newStatus: string, updateData: any) => {
    updateRequestStatus(requestId, newStatus, updateData, {
      name: currentUser?.name || 'Unknown User',
      role: currentUser?.role || 'unknown'
    });
    
    // Update the local requests array
    setAllRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: newStatus,
          statusDescription: updateData.statusDescription || req.statusDescription,
          currentStage: updateData.currentStage || req.currentStage,
          progressStage: updateData.progressStage || req.progressStage,
          ...updateData
        };
      }
      return req;
    }));
  };

  const openStatusManager = (request: any) => {
    setSelectedRequestForStatus(request);
    setIsStatusManagerOpen(true);
  };

  const openResubmitForm = (request: any) => {
    setSelectedRequestForResubmit(request);
    setIsResubmitFormOpen(true);
  };

  const handleResubmitRequest = (updatedRequest: any) => {
    setAllRequests(prev => prev.map(req => 
      req.id === updatedRequest.id ? updatedRequest : req
    ));
    setIsResubmitFormOpen(false);
    setSelectedRequestForResubmit(null);
  };

  // SSRFM Status workflow: Pending Approval → Approved → Ordered → Issued → Completed
  const [allRequests, setAllRequests] = useState([
    // Pending Approval Requests
    {
      id: "REQ-2024-301",
      materialName: "Industrial Bearings",
      specifications: "SKF Deep Grove Ball Bearing 6205-2RS, Inner Dia: 25mm, Outer Dia: 52mm, Sealed Design",
      maker: "SKF",
      quantity: "6 pieces",
      value: "₹4,200",
      priority: "high",
      materialPurpose: "Emergency replacement for critical bearing failure in main grinding unit",
      machineId: "MACHINE-001",
      machineName: "Primary Flour Mill #1",
      date: "2024-01-20",
      status: "pending_approval",
      statusDescription: "Awaiting supervisor approval - urgent replacement needed",
      currentStage: "Pending Approval",
      progressStage: 1,
      requestedBy: "John Martinez",
      department: "Production",
      urgencyLevel: "Critical",
      estimatedDowntime: "4-6 hours",
      additionalNotes: "Machine currently running on backup bearing. Immediate replacement required to prevent production halt."
    },
    {
      id: "REQ-2024-302",
      materialName: "Hydraulic Oil",
      specifications: "ISO VG 46 Hydraulic Oil, Anti-wear properties, 20L container",
      maker: "Shell",
      quantity: "40 liters",
      value: "₹6,800",
      priority: "medium",
      materialPurpose: "Scheduled maintenance for hydraulic systems",
      machineId: "MACHINE-003",
      machineName: "Hydraulic Press Unit",
      date: "2024-01-19",
      status: "pending_approval",
      statusDescription: "Routine maintenance request pending approval",
      currentStage: "Pending Approval",
      progressStage: 1,
      requestedBy: "Sarah Wilson",
      department: "Maintenance",
      maintenanceType: "Preventive",
      scheduledDate: "2024-01-25",
      additionalNotes: "Part of quarterly maintenance schedule. Oil level currently at minimum threshold."
    },
    {
      id: "REQ-2024-303",
      materialName: "Safety Sensors",
      specifications: "Proximity Sensors M18, PNP Output, 8mm sensing distance, IP67 rated",
      maker: "Omron",
      quantity: "8 pieces",
      value: "₹12,400",
      priority: "medium",
      materialPurpose: "Replace faulty safety sensors in packaging line",
      machineId: "MACHINE-007",
      machineName: "Automated Packaging Line",
      date: "2024-01-18",
      status: "pending_approval",
      statusDescription: "Safety upgrade request under review",
      currentStage: "Pending Approval",
      progressStage: 1,
      requestedBy: "Mike Johnson",
      department: "Safety & Quality",
      safetyImplications: "High - affects emergency stop functionality",
      additionalNotes: "Two sensors currently malfunctioning, compromising safety protocols."
    },

    // Approved Requests
    {
      id: "REQ-2024-289",
      materialName: "Conveyor Belts",
      specifications: "Rubber Conveyor Belt, Width: 800mm, Length: 25m, Food Grade, Heat Resistant",
      maker: "Continental Belting",
      quantity: "25 meters",
      value: "₹32,500",
      priority: "high",
      materialPurpose: "Replace worn conveyor belt in main production line",
      machineId: "MACHINE-002",
      machineName: "Main Production Conveyor",
      date: "2024-01-15",
      status: "approved",
      statusDescription: "Approved by management, ready for procurement",
      currentStage: "Approved",
      progressStage: 2,
      requestedBy: "John Martinez",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-17",
      department: "Production",
      procurementTeam: "Industrial Supplies Division",
      expectedProcurementTime: "5-7 business days",
      additionalNotes: "High priority for production continuity. Current belt showing significant wear."
    },
    {
      id: "REQ-2024-290",
      materialName: "Air Filters",
      specifications: "HEPA Air Filters, 610x610x292mm, 99.97% efficiency, Aluminum frame",
      maker: "Camfil",
      quantity: "12 pieces",
      value: "₹18,600",
      priority: "medium",
      materialPurpose: "Replace air filtration system filters",
      machineId: "HVAC-001",
      machineName: "Production Area HVAC System",
      date: "2024-01-14",
      status: "approved",
      statusDescription: "Approved for procurement - air quality maintenance",
      currentStage: "Approved",
      progressStage: 2,
      requestedBy: "Lisa Anderson",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-16",
      department: "Facilities",
      environmentalImpact: "Improves air quality and worker safety",
      additionalNotes: "Current filters at 80% capacity. Replacement will ensure optimal air quality."
    },

    // Partially Received Requests
    {
      id: "REQ-2024-280",
      materialName: "Steel Bolts",
      specifications: "M12x50mm Hex Head Bolts, Grade 8.8, Zinc Plated",
      maker: "Fastener Industries",
      quantity: "100 pieces",
      value: "₹2,500",
      priority: "medium",
      materialPurpose: "Assembly and maintenance work",
      machineId: "MACHINE-005",
      machineName: "Assembly Station #2",
      date: "2024-01-12",
      status: "partially_received",
      statusDescription: "Partially received: 60 of 100 pieces delivered",
      currentStage: "Partially Received",
      progressStage: 4,
      requestedBy: "John Martinez",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-13",
      orderedDate: "2024-01-14",
      receivedDate: "2024-01-18",
      receivedBy: "John Martinez",
      department: "Production",
      purchasedPrice: 1500,
      purchasedQuantity: 60,
      purchasedFrom: "Fastener Industries Ltd",
      invoiceNumber: "FI-2024-0156",
      qualityCheck: "passed",
      notes: "First batch received. Remaining 40 pieces expected by Jan 25th",
      additionalNotes: "Partial delivery due to supplier stock shortage. Balance quantity confirmed for next week."
    },
    {
      id: "REQ-2024-281",
      materialName: "Electrical Cables",
      specifications: "3 Core Copper Cable, 2.5mm², PVC Insulated, IS 694 Standard",
      maker: "Havells",
      quantity: "50 meters",
      value: "₹3,200",
      priority: "high",
      materialPurpose: "Electrical panel rewiring project",
      machineId: "ELECTRICAL-PANEL-02",
      machineName: "Production Line 2 Control Panel",
      date: "2024-01-11",
      status: "partially_received",
      statusDescription: "Partially received: 30 of 50 meters delivered",
      currentStage: "Partially Received",
      progressStage: 4,
      requestedBy: "Mike Johnson",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-12",
      orderedDate: "2024-01-13",
      receivedDate: "2024-01-17",
      receivedBy: "Mike Johnson",
      department: "Electrical",
      purchasedPrice: 1920,
      purchasedQuantity: 30,
      purchasedFrom: "Havells Electrical Supplies",
      invoiceNumber: "HES-2024-0089",
      qualityCheck: "passed",
      notes: "Partial delivery received. Quality inspection passed. Remaining cable expected soon.",
      additionalNotes: "Project can proceed with received quantity. Balance required for completion."
    },

    // Material Received (Complete) Requests
    {
      id: "REQ-2024-270",
      materialName: "Industrial Lubricants",
      specifications: "Multi-purpose Lithium Grease, High Temperature Grade, 400g Cartridges",
      maker: "Mobil",
      quantity: "20 cartridges",
      value: "₹4,800",
      priority: "medium",
      materialPurpose: "Routine maintenance lubrication for all machinery",
      machineId: "ALL-MACHINES",
      machineName: "General Machinery Maintenance",
      date: "2024-01-08",
      status: "material_received",
      statusDescription: "Materials completely received and stored in inventory",
      currentStage: "Material Received",
      progressStage: 5,
      requestedBy: "Sarah Wilson",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-09",
      orderedDate: "2024-01-10",
      receivedDate: "2024-01-16",
      receivedBy: "Sarah Wilson",
      department: "Maintenance",
      purchasedPrice: 4800,
      purchasedQuantity: 20,
      purchasedFrom: "Mobil Industrial Lubricants",
      invoiceNumber: "MIL-2024-0234",
      qualityCheck: "passed",
      notes: "Complete order received. All cartridges in good condition. Stored in maintenance inventory.",
      additionalNotes: "Monthly maintenance supply fully restocked. Quality certification received."
    },
    {
      id: "REQ-2024-271",
      materialName: "Safety Gloves",
      specifications: "Cut Resistant Gloves, Level 5 Protection, Nitrile Coated Palm",
      maker: "Ansell",
      quantity: "50 pairs",
      value: "₹7,500",
      priority: "high",
      materialPurpose: "Worker safety equipment replacement",
      machineId: "GENERAL",
      machineName: "General Safety Requirements",
      date: "2024-01-07",
      status: "material_received",
      statusDescription: "Safety equipment completely received and distributed",
      currentStage: "Material Received",
      progressStage: 5,
      requestedBy: "John Martinez",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-08",
      orderedDate: "2024-01-09",
      receivedDate: "2024-01-15",
      receivedBy: "John Martinez",
      department: "Safety",
      purchasedPrice: 7500,
      purchasedQuantity: 50,
      purchasedFrom: "Ansell Safety Solutions",
      invoiceNumber: "ASS-2024-0167",
      qualityCheck: "passed",
      notes: "Complete order received. All gloves meet safety standards. Distributed to production teams.",
      additionalNotes: "Safety compliance maintained. All workers equipped with new protective gear."
    },

    // Ordered Requests
    {
      id: "REQ-2024-275",
      materialName: "Motor Oil",
      specifications: "SAE 20W-50 Heavy Duty Motor Oil, API CF-4/SG Grade, Synthetic blend",
      maker: "Castrol",
      quantity: "60 liters",
      value: "₹9,600",
      priority: "medium",
      materialPurpose: "Routine maintenance for all grinding motors",
      machineId: "MACHINE-GROUP-A",
      machineName: "Primary Grinding Motors",
      date: "2024-01-10",
      status: "ordered",
      statusDescription: "Order placed with supplier, awaiting delivery",
      currentStage: "Ordered",
      progressStage: 3,
      requestedBy: "John Martinez",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-12",
      orderedDate: "2024-01-14",
      orderNumber: "PO-2024-0875",
      expectedDelivery: "2024-01-22",
      supplierName: "Industrial Lubricants Co.",
      supplierContact: "+91-9876543210",
      trackingNumber: "TRK-IL-240114-001",
      additionalNotes: "Bulk order for quarterly maintenance cycle. Includes all motor grades."
    },
    {
      id: "REQ-2024-276",
      materialName: "Grinding Wheels",
      specifications: "Aluminum Oxide Grinding Wheel, 350mm diameter, 40mm width, 32mm bore",
      maker: "Norton",
      quantity: "8 pieces",
      value: "₹15,200",
      priority: "high",
      materialPurpose: "Replace worn grinding wheels in finishing department",
      machineId: "MACHINE-008",
      machineName: "Surface Grinding Machine",
      date: "2024-01-09",
      status: "ordered",
      statusDescription: "Expedited order placed due to high priority",
      currentStage: "Ordered",
      progressStage: 3,
      requestedBy: "David Chen",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-11",
      orderedDate: "2024-01-13",
      orderNumber: "PO-2024-0876",
      expectedDelivery: "2024-01-20",
      supplierName: "Precision Tools & Abrasives",
      supplierContact: "+91-9876543211",
      expeditedShipping: true,
      additionalNotes: "Express delivery requested. Current wheels at 15% remaining life."
    },

    // Issued Requests
    {
      id: "REQ-2024-260",
      materialName: "Grinding Stones",
      specifications: "Natural Grinding Stone, Diameter: 1200mm, Thickness: 150mm, Premium Grade",
      maker: "Stone Craft Industries",
      quantity: "2 pieces",
      value: "₹45,000",
      priority: "high",
      materialPurpose: "Replace worn grinding stones in main flour mill",
      machineId: "MACHINE-004",
      machineName: "Main Flour Mill",
      date: "2024-01-05",
      status: "issued",
      statusDescription: "Materials delivered and issued to maintenance team",
      currentStage: "Issued",
      progressStage: 4,
      requestedBy: "John Martinez",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-07",
      orderedDate: "2024-01-08",
      orderNumber: "PO-2024-0850",
      deliveredDate: "2024-01-15",
      issuedDate: "2024-01-16",
      issuedBy: "Store Manager",
      receivedBy: "Maintenance Team Lead",
      installationScheduled: "2024-01-18",
      additionalNotes: "Installation planned during weekend shutdown. Quality inspection completed."
    },
    {
      id: "REQ-2024-261",
      materialName: "Industrial Lubricants",
      specifications: "Multi-purpose Industrial Grease, Lithium based, High temperature grade",
      maker: "Mobil",
      quantity: "24 cartridges",
      value: "₹7,200",
      priority: "medium",
      materialPurpose: "Lubrication maintenance for all machinery",
      machineId: "ALL-MACHINES",
      machineName: "General Machinery Maintenance",
      date: "2024-01-04",
      status: "issued",
      statusDescription: "Bulk lubricants issued for maintenance schedule",
      currentStage: "Issued",
      progressStage: 4,
      requestedBy: "Sarah Wilson",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-06",
      orderedDate: "2024-01-07",
      deliveredDate: "2024-01-14",
      issuedDate: "2024-01-15",
      issuedBy: "Store Manager",
      receivedBy: "Maintenance Department",
      distributionPlan: "Allocated across all production lines",
      additionalNotes: "Monthly maintenance supply. Distributed to all maintenance stations."
    },

    // Completed Requests
    {
      id: "REQ-2024-245",
      materialName: "Safety Equipment",
      specifications: "Safety Helmets Class A, Safety Goggles, Work Gloves, High-vis vests - Complete PPE Set",
      maker: "3M Safety",
      quantity: "25 sets",
      value: "₹21,250",
      priority: "high",
      materialPurpose: "Annual safety equipment replacement for all production workers",
      machineId: "GENERAL",
      machineName: "General Safety Requirements",
      date: "2024-01-02",
      status: "completed",
      statusDescription: "Request completed successfully with full documentation",
      currentStage: "Completed",
      progressStage: 5,
      requestedBy: "John Martinez",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-03",
      orderedDate: "2024-01-04",
      deliveredDate: "2024-01-12",
      issuedDate: "2024-01-13",
      completedDate: "2024-01-15",
      issuedBy: "Store Manager",
      receivedBy: "HR Department",
      distributedBy: "Safety Officer",
      safetyTraining: "Completed for all recipients",
      completionNotes: "All safety equipment distributed with proper training. Compliance certificates issued.",
      additionalNotes: "100% compliance achieved. All workers equipped with new safety gear."
    },
    {
      id: "REQ-2024-246",
      materialName: "Electrical Components",
      specifications: "Circuit Breakers 32A, Contactors 25A, Cable glands M20, Terminal blocks",
      maker: "Schneider Electric",
      quantity: "1 set",
      value: "₹14,800",
      priority: "medium",
      materialPurpose: "Electrical panel upgrade for improved safety and efficiency",
      machineId: "ELECTRICAL-PANEL-03",
      machineName: "Production Line 3 Control Panel",
      date: "2024-01-01",
      status: "completed",
      statusDescription: "Electrical upgrade completed and tested successfully",
      currentStage: "Completed",
      progressStage: 5,
      requestedBy: "Mike Johnson",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-02",
      orderedDate: "2024-01-03",
      deliveredDate: "2024-01-10",
      issuedDate: "2024-01-11",
      completedDate: "2024-01-14",
      installedBy: "Electrical Maintenance Team",
      testingCompleted: "2024-01-14",
      certificationIssued: "Electrical Safety Certificate",
      completionNotes: "Panel upgrade completed successfully. All safety tests passed. System operational.",
      additionalNotes: "Improved electrical safety and added monitoring capabilities. 20% efficiency gain achieved."
    },

    // Reverted Requests
    {
      id: "REQ-2024-295",
      materialName: "Industrial Pumps",
      specifications: "Centrifugal Pump, 5HP, 3 Phase, Cast Iron Body, 2 inch inlet/outlet",
      maker: "Kirloskar",
      quantity: "2 pieces",
      value: "₹45,000",
      priority: "high",
      materialPurpose: "Replace failed pumps in water circulation system",
      machineId: "PUMP-SYSTEM-01",
      machineName: "Water Circulation System",
      date: "2024-01-16",
      status: "reverted",
      statusDescription: "Reverted by Owner - Specifications need clarification",
      currentStage: "Reverted - Resubmission Required",
      progressStage: 0,
      requestedBy: "John Martinez",
      department: "Maintenance",
      revertedBy: "Robert Williams",
      revertedDate: "2024-01-18",
      revertReason: "Pump specifications are unclear. Please specify exact model number, flow rate (GPM), and head pressure requirements. Also provide justification for 5HP requirement vs existing 3HP pumps.",
      additionalNotes: "Critical for production water supply. Current pumps showing signs of failure."
    },
    {
      id: "REQ-2024-296",
      materialName: "Electrical Transformers",
      specifications: "Step-down Transformer, 440V to 220V, 10KVA, Oil Cooled",
      maker: "Schneider Electric",
      quantity: "1 piece",
      value: "₹25,000",
      priority: "medium",
      materialPurpose: "Voltage regulation for new equipment installation",
      machineId: "ELECTRICAL-PANEL-04",
      machineName: "New Equipment Power Supply",
      date: "2024-01-14",
      status: "reverted",
      statusDescription: "Reverted by Owner - Budget approval required",
      currentStage: "Reverted - Resubmission Required",
      progressStage: 0,
      requestedBy: "Mike Johnson",
      department: "Electrical",
      revertedBy: "Robert Williams",
      revertedDate: "2024-01-16",
      revertReason: "Request exceeds department budget limit of ₹20,000. Please get budget approval from finance department or find alternative solution within budget. Also verify if existing transformers can be reconfigured.",
      additionalNotes: "Required for new packaging line installation scheduled for next month."
    },
    {
      id: "REQ-2024-297",
      materialName: "Precision Measuring Tools",
      specifications: "Digital Calipers 0-150mm, Micrometer Set 0-25mm, Dial Indicators",
      maker: "Mitutoyo",
      quantity: "1 set",
      value: "₹18,500",
      priority: "low",
      materialPurpose: "Quality control and precision measurement in production",
      machineId: "QC-STATION-01",
      machineName: "Quality Control Station",
      date: "2024-01-12",
      status: "reverted",
      statusDescription: "Reverted by Owner - Existing tools assessment needed",
      currentStage: "Reverted - Resubmission Required",
      progressStage: 0,
      requestedBy: "Sarah Wilson",
      department: "Quality Control",
      revertedBy: "Robert Williams",
      revertedDate: "2024-01-14",
      revertReason: "Please conduct assessment of existing measuring tools first. Provide calibration reports and condition assessment. If existing tools can be repaired or recalibrated, that should be considered first before new purchase.",
      additionalNotes: "Current tools showing accuracy issues during quality checks."
    },

    // Rejected Requests
    {
      id: "REQ-2024-285",
      materialName: "Electrical Wires",
      specifications: "Copper Wire 2.5mm² XLPE Insulated, IS 694 Standard, Flame retardant",
      maker: "Havells",
      quantity: "100 meters",
      value: "₹4,500",
      priority: "low",
      materialPurpose: "Electrical maintenance and rewiring of secondary systems",
      machineId: "MACHINE-005",
      machineName: "Secondary Control Panel Systems",
      date: "2024-01-08",
      status: "rejected",
      statusDescription: "Rejected - insufficient justification and budget constraints",
      currentStage: "Rejected",
      progressStage: 0,
      requestedBy: "John Martinez",
      rejectedBy: "Sarah Chen",
      rejectedDate: "2024-01-10",
      rejectedAt: "manager_level",
      reason: "Current wiring infrastructure is adequate for current operations. Defer to next fiscal year budget. Focus on critical maintenance items first.",
      budgetConstraints: "Q1 electrical budget 85% utilized",
      alternativeSuggestion: "Monitor current system performance and reassess in Q2",
      additionalNotes: "Request can be resubmitted with detailed justification if system performance degrades."
    },
    {
      id: "REQ-2024-286",
      materialName: "Decorative Lighting",
      specifications: "LED Strip Lights, RGB, 5m length, Remote controlled",
      maker: "Philips",
      quantity: "10 strips",
      value: "₹8,900",
      priority: "low",
      materialPurpose: "Improve workplace ambiance in break areas",
      machineId: "GENERAL",
      machineName: "Employee Break Areas",
      date: "2024-01-07",
      status: "rejected",
      statusDescription: "Rejected - non-essential item, not aligned with operational priorities",
      currentStage: "Rejected",
      progressStage: 0,
      requestedBy: "Lisa Anderson",
      rejectedBy: "Robert Williams",
      rejectedDate: "2024-01-09",
      rejectedAt: "supervisor_level",
      reason: "Request does not align with operational priorities. Focus budget on production-critical items. Consider as part of facility improvement plan in future.",
      policyViolation: "Non-production related expense outside approved categories",
      alternativeSuggestion: "Submit as part of annual facility improvement proposal",
      additionalNotes: "Consider energy-efficient lighting upgrades as part of comprehensive facility modernization plan."
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-500 hover:text-white';
      case 'approved': return 'bg-green-500 text-white border-green-600 hover:bg-green-500 hover:text-white';
      case 'ordered': return 'bg-blue-500 text-white border-blue-600 hover:bg-blue-500 hover:text-white';
      case 'partially_received': return 'bg-orange-500 text-white border-orange-600 hover:bg-orange-500 hover:text-white';
      case 'material_received': return 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-500 hover:text-white';
      case 'issued': return 'bg-purple-500 text-white border-purple-600 hover:bg-purple-500 hover:text-white';
      case 'completed': return 'bg-green-600 text-white border-green-700 hover:bg-green-600 hover:text-white';
      case 'rejected': return 'bg-red-500 text-white border-red-600 hover:bg-red-500 hover:text-white';
      case 'reverted': return 'bg-black text-white border-gray-800 hover:bg-black hover:text-white';
      default: return 'bg-gray-500 text-white border-gray-600 hover:bg-gray-500 hover:text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-secondary/100 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getProgressColor = (stage: number) => {
    switch (stage) {
      case 1: return 'bg-secondary/100';
      case 2: return 'bg-secondary/100';
      case 3: return 'bg-purple-500';
      case 4: return 'bg-orange-500';
      case 5: return 'bg-primary';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'ordered':
        return <Package className="w-4 h-4" />;
      case 'partially_received':
        return <Truck className="w-4 h-4" />;
      case 'material_received':
        return <CheckSquare className="w-4 h-4" />;
      case 'issued':
        return <Truck className="w-4 h-4" />;
      case 'completed':
        return <CheckSquare className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'reverted':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const toggleRowExpansion = (requestId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(requestId)) {
      newExpandedRows.delete(requestId);
    } else {
      newExpandedRows.add(requestId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleMaterialIssue = (issueData: any) => {
    setIssuedMaterials(prev => [...prev, issueData]);
  };

  const filteredRequests = allRequests.filter(request => {
    const matchesSearch = request.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.maker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesPriority = filterPriority === "all" || request.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingRequests = filteredRequests.filter(req => 
    req.status === 'pending_approval'
  );
  const approvedRequests = filteredRequests.filter(req => 
    req.status === 'approved' || req.status === 'ordered' || req.status === 'issued' || req.status === 'completed'
  );
  const rejectedRequests = filteredRequests.filter(req => req.status === 'rejected');

  // SSRFM Progress Bar: Submit → Approved → Ordered → Received → Complete
  const ProgressBar = ({ stage }: { stage: number }) => {
    const stages = ['Submit', 'Approved', 'Ordered', 'Received', 'Complete'];
    return (
      <div className="my-3">
        {/* Desktop Progress Bar */}
        <div className="hidden sm:flex items-center space-x-2">
        {stages.map((stageName, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
              index < stage ? getProgressColor(index + 1) : 'bg-gray-300'
            }`}>
              {index + 1}
            </div>
            {index < stages.length - 1 && (
              <div className={`w-12 h-1 mx-2 rounded-full ${
                index < stage - 1 ? getProgressColor(index + 1) : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
        </div>

        {/* Mobile Progress Bar - Vertical */}
        <div className="sm:hidden space-y-2">
          {stages.map((stageName, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                index < stage ? getProgressColor(index + 1) : 'bg-gray-300'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <span className={`text-xs font-medium ${
                  index < stage ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {stageName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced List View Component - Table-like format with expandable details
  const ListView = ({ requests }: { requests: any[] }) => (
    <Card className="rounded-lg shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/20 border-b-2 border-secondary/30">
                <TableHead className="w-12 text-foreground font-semibold"></TableHead>
                <TableHead className="min-w-[200px] text-foreground font-semibold">REQUEST</TableHead>
                <TableHead className="min-w-[120px] text-foreground font-semibold">CONTACT</TableHead>
                <TableHead className="min-w-[120px] text-foreground font-semibold">COMPANY</TableHead>
                <TableHead className="min-w-[100px] text-foreground font-semibold">STATUS</TableHead>
                <TableHead className="min-w-[140px] text-foreground font-semibold">SUBMITTED DATE</TableHead>
                <TableHead className="min-w-[140px] text-foreground font-semibold">LAST UPDATED</TableHead>
                <TableHead className="min-w-[140px] text-foreground font-semibold">NEXT ACTION DATE</TableHead>
                <TableHead className="min-w-[100px] text-foreground font-semibold">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <>
                  <TableRow key={request.id} className="hover:bg-muted/30 border-b border-secondary/20">
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 rounded-lg"
                        onClick={() => toggleRowExpansion(request.id)}
                      >
                        {expandedRows.has(request.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-sm">{request.materialName}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {request.materialPurpose}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {request.machineName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.requestedBy}</div>
                      <div className="text-xs text-muted-foreground">{request.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.maker}</div>
                      <div className="text-xs text-muted-foreground">Supplier</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(request.status)} border`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          <span className="text-xs">{request.currentStage}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.date}</div>
                      <div className="text-xs text-muted-foreground">Submitted</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {request.approvedDate || request.orderedDate || request.issuedDate || request.completedDate || request.rejectedDate || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.approvedBy || request.rejectedBy || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm px-2 py-1 rounded ${
                        request.status === 'pending_approval' ? 'bg-warning/20 text-warning-foreground' :
                        request.status === 'approved' ? 'bg-success/20 text-success-foreground' :
                        request.status === 'ordered' ? 'bg-primary/15 text-primary' :
                        request.status === 'partially_received' ? 'bg-warning/20 text-warning-foreground' :
                        request.status === 'material_received' ? 'bg-success/20 text-success-foreground' :
                        request.status === 'issued' ? 'bg-accent/20 text-accent-foreground' :
                        request.status === 'completed' ? 'bg-success/20 text-success-foreground' :
                        request.status === 'reverted' ? 'bg-destructive/20 text-destructive-foreground' :
                        'bg-destructive/20 text-destructive-foreground'
                      }`}>
                        {request.expectedDelivery || request.issuedDate || request.completedDate || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Detail Row */}
                  {expandedRows.has(request.id) && (
                    <TableRow>
                      <TableCell colSpan={9} className="p-0">
                        <div className="bg-muted/30 p-6 border-t">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Request Details */}
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold text-lg mb-3">Request Details</h3>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium text-muted-foreground">Request ID:</span>
                                      <div className="font-medium">{request.id}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Quantity:</span>
                                      <div className="font-medium">{request.quantity}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Value:</span>
                                      <div className="font-medium">{request.value}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Machine ID:</span>
                                      <div className="font-medium">{request.machineId}</div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <span className="font-medium text-muted-foreground">Specifications:</span>
                                    <div className="text-sm mt-1 p-3 bg-background rounded border">
                                      {request.specifications}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <span className="font-medium text-muted-foreground">Purpose:</span>
                                    <div className="text-sm mt-1">{request.materialPurpose}</div>
                                  </div>
                                  
                                  {request.additionalNotes && (
                                    <div>
                                      <span className="font-medium text-muted-foreground">Additional Notes:</span>
                                      <div className="text-sm mt-1 p-3 bg-background rounded border">
                                        {request.additionalNotes}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Right Column - Status & Progress */}
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold text-lg mb-3">Status & Progress</h3>
                                
                                {/* Progress Bar */}
                                <ProgressBar stage={request.progressStage} />
                                
                                {/* Status Information */}
                                <div className="space-y-3">
                                  <div className="p-3 bg-background rounded border">
                                    <div className="text-sm font-medium mb-2">Current Status</div>
                                    <div className="text-sm text-muted-foreground">{request.statusDescription}</div>
                                  </div>
                                  
                                  {/* Status-specific information */}
                                  {request.status === 'approved' && (
                                    <div className="bg-secondary/10 border border-secondary rounded-lg p-3">
                                      <div className="text-sm">
                                        <strong className="text-foreground">Approved:</strong> {request.approvedBy} on {request.approvedDate}
                                      </div>
                                      <div className="text-xs text-foreground mt-1">Ready for procurement</div>
                                    </div>
                                  )}

                                  {request.status === 'ordered' && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                      <div className="text-sm space-y-1">
                                        <div><strong className="text-purple-800">Ordered:</strong> {request.orderedDate}</div>
                                        <div><strong className="text-purple-800">Supplier:</strong> {request.supplierName}</div>
                                        <div><strong className="text-purple-800">Expected Delivery:</strong> {request.expectedDelivery}</div>
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'partially_received' && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                      <div className="text-sm space-y-1">
                                        <div><strong className="text-orange-800">Partially Received:</strong> {request.receivedDate}</div>
                                        <div><strong className="text-orange-800">Received Quantity:</strong> {request.purchasedQuantity} of {request.quantity}</div>
                                        <div><strong className="text-orange-800">Supplier:</strong> {request.purchasedFrom}</div>
                                        <div><strong className="text-orange-800">Invoice:</strong> {request.invoiceNumber}</div>
                                        {request.notes && <div><strong className="text-orange-800">Notes:</strong> {request.notes}</div>}
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'material_received' && (
                                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                                      <div className="text-sm space-y-1">
                                        <div><strong className="text-primary">Received:</strong> {request.receivedDate}</div>
                                        <div><strong className="text-primary">Quantity:</strong> {request.purchasedQuantity} {request.quantity.split(' ').slice(1).join(' ')}</div>
                                        <div><strong className="text-primary">Total Cost:</strong> ₹{request.purchasedPrice}</div>
                                        <div><strong className="text-primary">Supplier:</strong> {request.purchasedFrom}</div>
                                        <div><strong className="text-primary">Quality Check:</strong> {request.qualityCheck}</div>
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'issued' && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                      <div className="text-sm space-y-1">
                                        <div><strong className="text-orange-800">Issued:</strong> {request.issuedDate}</div>
                                        <div><strong className="text-orange-800">Received By:</strong> {request.receivedBy}</div>
                                        <div><strong className="text-orange-800">Delivered:</strong> {request.deliveredDate}</div>
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'completed' && (
                                    <div className="bg-secondary/10 border border-secondary rounded-lg p-3">
                                      <div className="text-sm space-y-1">
                                        <div><strong className="text-foreground">Completed:</strong> {request.completedDate}</div>
                                        <div><strong className="text-foreground">Received By:</strong> {request.receivedBy}</div>
                                        {request.completionNotes && (
                                          <div><strong className="text-foreground">Notes:</strong> {request.completionNotes}</div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'rejected' && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                      <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                          <strong className="text-red-800 text-sm">Rejected:</strong>
                                          <p className="text-red-700 text-sm mt-1 break-words">{request.reason}</p>
                                          <p className="text-red-600 text-xs mt-2">
                                            Rejected by {request.rejectedBy} on {request.rejectedDate}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'reverted' && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                      <div className="flex items-start gap-2">
                                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                          <strong className="text-red-800 text-sm">Reverted:</strong>
                                          <p className="text-red-700 text-sm mt-1 break-words">{request.revertReason}</p>
                                          <p className="text-red-600 text-xs mt-2">
                                            Reverted by {request.revertedBy} on {request.revertedDate}
                                          </p>
                                          <p className="text-red-600 text-xs mt-1">
                                            Indent form must be resubmitted with corrections.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t mt-6">
                            <Button variant="outline" className="gap-2 rounded-lg">
                              <Eye className="w-4 h-4" />
                              View Full Details
                            </Button>
                            
                            {/* Status Management Button */}
                            {(currentUser?.role === 'company_owner' || currentUser?.role === 'site_supervisor') && (
                              <Button 
                                variant="outline" 
                                className="gap-2 rounded-lg"
                                onClick={() => openStatusManager(request)}
                              >
                                <CheckSquare className="w-4 h-4" />
                                Manage Status
                              </Button>
                            )}
                            
                            {(request.status === 'rejected' || request.status === 'reverted') && (
                              <Button 
                                variant="outline" 
                                className="gap-2 rounded-lg"
                                onClick={() => request.status === 'reverted' ? openResubmitForm(request) : null}
                              >
                                <Plus className="w-4 h-4" />
                                {request.status === 'reverted' ? 'Resubmit Indent Form' : 'Resubmit Request'}
                              </Button>
                            )}
                            {(request.status === 'ordered' || request.status === 'issued' || request.status === 'completed') && (
                              <Button variant="outline" className="gap-2 rounded-lg">
                                <FileText className="w-4 h-4" />
                                Track Status
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  // Compact Table View Component
  const TableView = ({ requests }: { requests: any[] }) => (
    <Card className="rounded-lg shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/20 border-b-2 border-secondary/30">
                <TableHead className="min-w-[120px] text-foreground font-semibold">Request ID</TableHead>
                <TableHead className="min-w-[150px] text-foreground font-semibold">Material</TableHead>
                <TableHead className="min-w-[100px] text-foreground font-semibold">Quantity</TableHead>
                <TableHead className="min-w-[100px] text-foreground font-semibold">Value</TableHead>
                <TableHead className="min-w-[100px] text-foreground font-semibold">Status</TableHead>
                <TableHead className="min-w-[100px] text-foreground font-semibold">Date</TableHead>
                <TableHead className="min-w-[100px] text-foreground font-semibold">Machine</TableHead>
                <TableHead className="min-w-[120px] text-foreground font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/30 border-b border-secondary/20">
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.materialName}</div>
                      <div className="text-xs text-muted-foreground">{request.maker}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{request.quantity}</TableCell>
                  <TableCell className="text-sm font-medium">{request.value}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(request.status)} border`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(request.status)}
                        <span className="text-xs">{request.currentStage}</span>
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{request.date}</TableCell>
                  <TableCell className="text-sm">{request.machineName}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-lg">
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      {/* Status Management Button */}
                      {(currentUser?.role === 'company_owner' || currentUser?.role === 'site_supervisor') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 w-7 p-0 rounded-lg"
                          onClick={() => openStatusManager(request)}
                        >
                          <CheckSquare className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {(request.status === 'rejected' || request.status === 'reverted') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 w-7 p-0 rounded-lg"
                          onClick={() => request.status === 'reverted' ? openResubmitForm(request) : null}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 sm:p-0">
      {/* Main Heading */}
      

      {/* Search, Views, Status and Actions Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* List/Table Toggle */}
          <div className="flex rounded-lg border border-secondary overflow-hidden bg-secondary/10 w-fit shadow-sm">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-none px-3 sm:px-4 ${
                viewMode === "list" 
                  ? "bg-primary text-white hover:bg-primary-hover" 
                  : "text-foreground hover:text-foreground hover:bg-secondary/20"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm">List</span>
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`rounded-none px-3 sm:px-4 ${
                viewMode === "table" 
                  ? "bg-primary text-white hover:bg-primary-hover" 
                  : "text-foreground hover:text-foreground hover:bg-secondary/20"
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm">Table</span>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 lg:flex-1 lg:max-w-4xl lg:justify-end">
          {/* Search Bar */}
          <div className="flex-1 lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/80 w-4 h-4" />
              <Input
                placeholder="Search by material, request ID, or maker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 rounded-lg border-secondary focus:border-secondary focus:ring-0 outline-none"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48 rounded-lg border-secondary focus:border-secondary focus:ring-0">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="partially_received">Partially Received</SelectItem>
              <SelectItem value="material_received">Material Received</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="reverted">Reverted</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button asChild className="w-full sm:w-auto text-sm sm:text-base" size="sm">
              <Link to="/material-request">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">INDENT FORM</span>
                <span className="sm:hidden">INDENT FORM</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="order-status" className="w-full">
      
        {/* All Requests Tab */}
        <TabsContent value="all" className="space-y-3 sm:space-y-4">
          {viewMode === "table" ? (
            <TableView requests={filteredRequests} />
          ) : (
            <ListView requests={filteredRequests} />
          )}
        </TabsContent>

                 {/* Order Request Status Tab */}
         <TabsContent value="order-status" className="space-y-3 sm:space-y-4">
           {/* Request List */}
           {filteredRequests.length > 0 ? (
             viewMode === "table" ? (
               <TableView requests={filteredRequests} />
             ) : (
               <ListView requests={filteredRequests} />
             )
           ) : (
             <Card className="rounded-lg shadow-sm p-8 text-center">
               <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
               <h3 className="text-lg font-semibold text-foreground mb-2">No Order Requests</h3>
               <p className="text-muted-foreground mb-4">
                 You haven't submitted any order requests yet.
               </p>
               <Button asChild variant="outline">
                 <Link to="/material-request">
                   <FileEdit className="w-4 h-4 mr-2" />
                   Create Order Request
                 </Link>
               </Button>
             </Card>
           )}
         </TabsContent>
      </Tabs>

      {/* Material Issue Form */}
      <MaterialIssueForm
        isOpen={isIssueFormOpen}
        onClose={() => setIsIssueFormOpen(false)}
        onSubmit={handleMaterialIssue}
      />

      {/* Request Status Manager */}
      {selectedRequestForStatus && (
        <RequestStatusManager
          request={selectedRequestForStatus}
          onStatusUpdate={handleStatusUpdate}
          isOpen={isStatusManagerOpen}
          onClose={() => {
            setIsStatusManagerOpen(false);
            setSelectedRequestForStatus(null);
          }}
        />
      )}

      {/* Resubmit Form */}
      {selectedRequestForResubmit && (
        <ResubmitForm
          request={selectedRequestForResubmit}
          isOpen={isResubmitFormOpen}
          onClose={() => {
            setIsResubmitFormOpen(false);
            setSelectedRequestForResubmit(null);
          }}
          onSubmit={handleResubmitRequest}
        />
      )}
    </div>
  );
};
