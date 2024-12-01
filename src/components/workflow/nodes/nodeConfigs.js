export const nodeConfigs = {
  trigger: {
    types: ['form', 'schedule', 'webhook'],
    fields: {
      form: [
        {
          name: 'formFields',
          label: 'Form Fields',
          type: 'array',
          required: true,
          defaultValue: [
            'requestor',
            'amount',
            'description',
            'department',
            'vendorName',
            'urgency'
          ],
        },
        {
          name: 'title',
          label: 'Form Title',
          type: 'text',
          required: true,
          defaultValue: 'Purchase Request Form',
        },
      ],
    },
  },
  condition: {
    types: ['amount', 'approval'],
    fields: {
      amount: [
        {
          name: 'threshold',
          label: 'Amount Threshold',
          type: 'number',
          required: true,
        },
        {
          name: 'operator',
          label: 'Operator',
          type: 'select',
          options: ['greater than', 'less than', 'equal to'],
          required: true,
        },
      ],
      approval: [
        {
          name: 'approverRole',
          label: 'Approver Role',
          type: 'select',
          options: ['manager', 'director', 'finance', 'ceo'],
          required: true,
        },
        {
          name: 'decision',
          label: 'Decision Field',
          type: 'text',
          required: true,
          defaultValue: 'approved',
        },
      ],
    },
  },
  action: {
    types: ['email', 'notification', 'database', 'approval'],
    fields: {
      email: [
        {
          name: 'to',
          label: 'To',
          type: 'text',
          required: true,
        },
        {
          name: 'subject',
          label: 'Subject',
          type: 'text',
          required: true,
        },
        {
          name: 'template',
          label: 'Email Template',
          type: 'select',
          options: [
            'purchase_request_submitted',
            'request_approved',
            'request_rejected',
            'additional_approval_needed'
          ],
          required: true,
        },
      ],
      approval: [
        {
          name: 'approver',
          label: 'Approver Email',
          type: 'text',
          required: true,
        },
        {
          name: 'timeoutHours',
          label: 'Timeout (hours)',
          type: 'number',
          required: true,
          defaultValue: 48,
        },
        {
          name: 'reminderHours',
          label: 'Reminder (hours)',
          type: 'number',
          required: true,
          defaultValue: 24,
        },
      ],
      notification: [
        {
          name: 'message',
          label: 'Message',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          options: ['success', 'warning', 'error', 'info'],
          required: true,
        },
      ],
      database: [
        {
          name: 'operation',
          label: 'Operation',
          type: 'select',
          options: ['create', 'update', 'delete'],
          required: true,
        },
        {
          name: 'collection',
          label: 'Collection',
          type: 'select',
          options: ['purchase_requests', 'approvals', 'notifications'],
          required: true,
        },
        {
          name: 'data',
          label: 'Data',
          type: 'json',
          required: true,
        },
      ],
    },
  },
};

export const getNodeConfigs = () => nodeConfigs; 