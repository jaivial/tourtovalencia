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
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

interface CancellationResultProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: {
    success: boolean
    message: string
    refundResult?: {
      success: boolean
      refundId?: string
      error?: string
      mockResponse?: boolean
    }
  } | null
}

export const CancellationResultDialog: React.FC<CancellationResultProps> = ({
  open,
  onOpenChange,
  result
}) => {
  if (!result) return null

  const isSuccess = result.success
  const hasRefund = !!result.refundResult
  const isRefundSuccess = hasRefund && result.refundResult?.success
  const isMockRefund = hasRefund && result.refundResult?.mockResponse

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className={`p-4 border-b ${isSuccess ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-gray-800">
              {isSuccess ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <DialogTitle className="text-xl">
                {isSuccess ? 'Booking Cancelled Successfully' : 'Cancellation Failed'}
              </DialogTitle>
            </div>
            <DialogDescription className={`mt-2 ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
              {result.message}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          {hasRefund && (
            <div className={`p-4 rounded-lg mb-4 ${
              isRefundSuccess 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {isRefundSuccess ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <h3 className="font-medium text-gray-800">
                    {isRefundSuccess ? 'Refund Processed' : 'Refund Failed'}
                  </h3>
                  <p className="text-sm mt-1 text-gray-600">
                    {isRefundSuccess 
                      ? `The refund has been ${isMockRefund ? 'simulated' : 'processed'} successfully.`
                      : result.refundResult?.error || 'An unknown error occurred while processing the refund.'}
                  </p>
                  
                  {isRefundSuccess && result.refundResult?.refundId && (
                    <p className="text-xs mt-2 text-gray-500">
                      Refund ID: {result.refundResult.refundId}
                    </p>
                  )}
                  
                  {isMockRefund && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>This is a simulated refund in development mode.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            {isSuccess 
              ? 'The customer will receive an email notification about this cancellation.'
              : 'Please try again or contact technical support if the issue persists.'}
          </p>
        </div>
        
        <DialogFooter className="bg-gray-50 px-6 py-4 border-t">
          <Button 
            onClick={() => onOpenChange(false)}
            className={isSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 