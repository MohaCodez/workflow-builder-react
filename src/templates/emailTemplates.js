export const emailTemplates = {
  purchase_request_approved: {
    subject: 'Purchase Request Approved: {{itemName}}',
    body: `
      Dear {{requesterName}},

      Your purchase request for {{itemName}} (Amount: ${{amount}}) has been approved.

      Approver Comments: {{approverComments}}

      You can proceed with the purchase following the company procurement guidelines.

      Best regards,
      Purchase Request System
    `
  },
  purchase_request_rejected: {
    subject: 'Purchase Request Rejected: {{itemName}}',
    body: `
      Dear {{requesterName}},

      Your purchase request for {{itemName}} (Amount: ${{amount}}) has been rejected.

      Reason: {{rejectionReason}}

      Please contact your manager for more information.

      Best regards,
      Purchase Request System
    `
  }
}; 