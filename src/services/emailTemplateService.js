export const emailTemplates = {
  purchase_request_submitted: {
    subject: 'New Purchase Request Submitted',
    template: `
      <h2>New Purchase Request</h2>
      <p>A new purchase request has been submitted for your approval.</p>
      <div style="margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 5px;">
        <p><strong>Requestor:</strong> {{requestor}}</p>
        <p><strong>Amount:</strong> ${{amount}}</p>
        <p><strong>Department:</strong> {{department}}</p>
        <p><strong>Vendor:</strong> {{vendorName}}</p>
        <p><strong>Description:</strong> {{description}}</p>
        <p><strong>Urgency:</strong> {{urgency}}</p>
      </div>
      <p>Please review and take action on this request.</p>
      <div style="margin: 20px 0;">
        <a href="{{approvalUrl}}" style="padding: 10px 20px; background: #2196f3; color: white; text-decoration: none; border-radius: 5px;">Review Request</a>
      </div>
    `,
  },
  request_approved: {
    subject: 'Purchase Request Approved',
    template: `
      <h2>Purchase Request Approved</h2>
      <p>Your purchase request has been approved.</p>
      <div style="margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 5px;">
        <p><strong>Request ID:</strong> {{requestId}}</p>
        <p><strong>Amount:</strong> ${{amount}}</p>
        <p><strong>Approved By:</strong> {{approverName}}</p>
        <p><strong>Approval Date:</strong> {{approvalDate}}</p>
      </div>
      <p>The purchase order will be processed shortly.</p>
    `,
  },
  request_rejected: {
    subject: 'Purchase Request Rejected',
    template: `
      <h2>Purchase Request Rejected</h2>
      <p>Your purchase request has been rejected.</p>
      <div style="margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 5px;">
        <p><strong>Request ID:</strong> {{requestId}}</p>
        <p><strong>Rejected By:</strong> {{approverName}}</p>
        <p><strong>Rejection Date:</strong> {{rejectionDate}}</p>
        <p><strong>Reason:</strong> {{rejectionReason}}</p>
      </div>
      <p>Please contact your supervisor for more information.</p>
    `,
  },
};

export const renderEmailTemplate = (templateName, data) => {
  const template = emailTemplates[templateName];
  if (!template) throw new Error(`Template ${templateName} not found`);

  let rendered = template.template;
  Object.entries(data).forEach(([key, value]) => {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return {
    subject: template.subject,
    html: rendered,
  };
}; 