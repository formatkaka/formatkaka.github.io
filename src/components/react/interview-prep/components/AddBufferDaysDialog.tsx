import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';

type AddBufferDaysDialogProps = {
  open: boolean;
  onClose: () => void;
  onApply: (bufferDays: number) => void;
};

export const AddBufferDaysDialog = (props: AddBufferDaysDialogProps) => {
  const { open, onClose, onApply } = props;
  const [bufferDays, setBufferDays] = useState<string>('3');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = parseInt(bufferDays, 10);

    if (isNaN(days) || days < 1) {
      alert('Please enter a valid number of days (minimum 1)');
      return;
    }

    if (days > 30) {
      alert('Maximum buffer days is 30. Please enter a smaller number.');
      return;
    }

    onApply(days);
    onClose();
    setBufferDays('3');
  };

  const handleClose = () => {
    onClose();
    setBufferDays('3');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Buffer Days</DialogTitle>
            <DialogDescription className="text-gray-600 pt-2">
              This will shift all non-overdue tasks forward by the specified number of days. Overdue
              tasks will remain unchanged, giving you time to catch up.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <label htmlFor="bufferDays" className="block text-sm font-medium text-gray-700 mb-2">
              Number of buffer days:
            </label>
            <input
              id="bufferDays"
              type="number"
              min="1"
              max="30"
              value={bufferDays}
              onChange={(e) => setBufferDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter number of days"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              Example: Entering 3 will move all today and future tasks 3 days forward.
            </p>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Buffer
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
