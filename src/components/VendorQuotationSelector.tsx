import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { FileText, Phone, User, Building2 } from 'lucide-react';

interface VendorQuotation {
  id: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  quotedPrice: string;
  notes: string;
  quotationFile?: File | null;
}

interface RequestItem {
  id: string;
  srNo: number;
  productName: string;
  vendorQuotations: VendorQuotation[];
  selectedVendor?: string;
}

interface VendorQuotationSelectorProps {
  requestItems: RequestItem[];
  onVendorSelect: (itemId: string, vendorId: string) => void;
  selectedVendors: Record<string, string>;
}

export const VendorQuotationSelector: React.FC<VendorQuotationSelectorProps> = ({
  requestItems,
  onVendorSelect,
  selectedVendors
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Vendor Selection</h3>
        <Badge variant="secondary">Required for Approval</Badge>
      </div>
      
      {requestItems.map((item) => (
        <Card key={item.id} className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                {String(item.srNo).padStart(2, '0')}
              </span>
              {item.productName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {item.vendorQuotations.length > 0 ? (
              <RadioGroup
                value={selectedVendors[item.id] || ''}
                onValueChange={(value) => onVendorSelect(item.id, value)}
                className="space-y-4"
              >
                {item.vendorQuotations.map((quotation) => (
                  <div key={quotation.id} className="flex items-start space-x-3">
                    <RadioGroupItem
                      value={quotation.id}
                      id={`${item.id}-${quotation.id}`}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={`${item.id}-${quotation.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <Card className="border border-gray-200 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Vendor Info */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                <span className="font-semibold">{quotation.vendorName}</span>
                              </div>
                              {quotation.contactPerson && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-3 h-3" />
                                  <span>{quotation.contactPerson}</span>
                                </div>
                              )}
                              {quotation.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  <span>{quotation.phone}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Price */}
                            <div className="flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Quoted Price</div>
                                <div className="text-xl font-bold text-primary">
                                  {quotation.quotedPrice}
                                </div>
                              </div>
                            </div>
                            
                            {/* Additional Info */}
                            <div className="space-y-2">
                              {quotation.quotationFile && (
                                <div className="flex items-center gap-2 text-sm">
                                  <FileText className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Quotation file attached</span>
                                </div>
                              )}
                              {quotation.notes && (
                                <div className="text-sm">
                                  <div className="text-muted-foreground mb-1">Notes:</div>
                                  <div className="text-xs bg-gray-50 p-2 rounded border">
                                    {quotation.notes}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No vendor quotations available for this item</p>
                <p className="text-sm">Request cannot be approved without quotations</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Selection Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Selection Status</h4>
              <p className="text-sm text-muted-foreground">
                {Object.keys(selectedVendors).length} of {requestItems.length} items have vendors selected
              </p>
            </div>
            <Badge 
              variant={Object.keys(selectedVendors).length === requestItems.length ? "default" : "secondary"}
            >
              {Object.keys(selectedVendors).length === requestItems.length ? "Complete" : "Incomplete"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 