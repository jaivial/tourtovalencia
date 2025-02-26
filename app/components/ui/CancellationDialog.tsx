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
import { AlertCircle, CheckCircle2, Ban } from "lucide-react"

interface CancellationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (refund: boolean, reason: string) => void
  bookingId?: string
  bookingReference: string
  amount?: number
  paymentMethod?: string
  strings: Record<string, string>
}

export const CancellationDialog: React.FC<CancellationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  bookingReference,
  amount,
  paymentMethod,
  strings
}) => {
  const [refund, setRefund] = React.useState(false)
  const [reason, setReason] = React.useState("")

  const handleConfirm = () => {
    onConfirm(refund, reason)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="bg-red-50 p-4 border-b border-red-100">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <DialogTitle className="text-xl">{strings.cancelBooking}</DialogTitle>
            </div>
            <DialogDescription className="text-red-600 mt-2">
              {strings.areYouSureCancel} <span className="font-medium">{bookingReference}</span>?
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          <div className="grid gap-5">
            {(amount && amount > 0 && paymentMethod) ? (
              <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <Switch 
                  id="refund" 
                  checked={refund} 
                  onCheckedChange={setRefund}
                  className="data-[state=checked]:bg-amber-500"
                />
                <Label htmlFor="refund" className="font-medium text-amber-800">
                  {strings.issueRefundOf} {amount.toFixed(2)}€ {strings.via} {paymentMethod}
                </Label>
              </div>
            ) : null}
            
            <div className="grid gap-3">
              <Label htmlFor="reason" className="text-gray-700">
                {strings.cancellationReason} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={strings.enterReasonForCancellation}
                className="min-h-[100px] resize-none"
                required
              />
              <p className="text-xs text-gray-500">
                {strings.reasonIncludedInEmail}
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex gap-3 w-full justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="gap-2"
            >
              <Ban className="h-4 w-4" />
              {strings.cancel}
            </Button>
            <Button 
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700 gap-2"
              disabled={!reason.trim()}
            >
              <CheckCircle2 className="h-4 w-4" />
              {strings.confirmCancellation}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 