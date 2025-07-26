import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ContactInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (contact: string) => void;
  initialContact?: string;
  title?: string;
  description?: string;
}

export const ContactInputDialog: React.FC<ContactInputDialogProps> = ({
  open, onOpenChange, onConfirm, initialContact = "", title = "Enter Contact Information", description = ""
}) => {
  const [contact, setContact] = useState(initialContact);

  useEffect(() => {
    setContact(initialContact);
  }, [initialContact]);

  const handleConfirm = () => {
    onConfirm(contact);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-gray-500 mt-2" dangerouslySetInnerHTML={{ __html: description }}></p>}

        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              Contact
            </Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="col-span-3"
              placeholder="Email or Phone Number"
              autoComplete="off"
              onPaste={(e) => e.preventDefault()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};