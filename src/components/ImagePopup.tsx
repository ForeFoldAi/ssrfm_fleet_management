import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface ImagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  title?: string;
}

export const ImagePopup: React.FC<ImagePopupProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onPrevious,
  onNext,
  title = 'Image Viewer',
}) => {
  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 flex items-center justify-center p-6">
          {/* Previous Button */}
          {images.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Image */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src={currentImage}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
            />
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {currentIndex + 1} of {images.length}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};