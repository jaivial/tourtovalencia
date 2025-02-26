import * as React from "react"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { Textarea } from "../ui/textarea"

interface CancellationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (refund: boolean, reason: string) => void
  bookingId?: string
  bookingReference: string
  amount?: number
  paymentMethod?: string
}

export const CancellationDialog: React.FC<CancellationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  bookingReference,
  amount,
  paymentMethod
}) => {
  const [refund, setRefund] = React.useState(false)
  const [reason, setReason] = React.useState("")

  const handleConfirm = () => {
    onConfirm(refund, reason)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel booking {bookingReference}?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {(amount && amount > 0 && paymentMethod) ? (
            <div className="flex items-center space-x-2">
              <Switch 
                id="refund" 
                checked={refund} 
                onCheckedChange={setRefund} 
              />
              <Label htmlFor="refund">
                Issue refund of ${amount.toFixed(2)} via {paymentMethod}
              </Label>
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="reason">Cancellation reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for cancellation"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 