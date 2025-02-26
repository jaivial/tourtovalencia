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
  strings: Record<string, string>
}

export const CancellationResultDialog: React.FC<CancellationResultProps> = ({
  open,
  onOpenChange,
  result,
  strings
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
                {isSuccess ? strings.bookingCancelledSuccessfully : strings.cancellationFailed}
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
                    {isRefundSuccess ? strings.refundProcessed : strings.refundFailed}
                  </h3>
                  <p className="text-sm mt-1 text-gray-600">
                    {isRefundSuccess 
                      ? isMockRefund ? strings.refundSimulatedSuccessfully : strings.refundProcessedSuccessfully
                      : result.refundResult?.error || strings.unknownErrorRefund}
                  </p>
                  
                  {isRefundSuccess && result.refundResult?.refundId && (
                    <p className="text-xs mt-2 text-gray-500">
                      {strings.refundId}: {result.refundResult.refundId}
                    </p>
                  )}
                  
                  {isMockRefund && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{strings.simulatedRefund}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            {isSuccess 
              ? strings.customerWillReceiveEmail
              : strings.tryAgainOrContact}
          </p>
        </div>
        
        <DialogFooter className="bg-gray-50 px-6 py-4 border-t">
          <Button 
            onClick={() => onOpenChange(false)}
            className={isSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {strings.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 