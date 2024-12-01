export const purchaseRequestTemplate = {
  id: 'purchase-request-workflow',
  name: 'Purchase Request Approval',
  description: 'Purchase request approval workflow with manager approval',
  nodes: [
    {
      id: 'trigger_1',
      type: 'trigger',
      position: { x: 250, y: 50 },
      data: {
        label: 'Purchase Request Form',
        type: 'form',
        triggerType: 'form',
        formId: 'purchase-request-form',
      }
    },
    {
      id: 'action_1',
      type: 'action',
      position: { x: 250, y: 150 },
      data: {
        label: 'Manager Approval',
        actionType: 'approval',
        assignee: {
          type: 'user',
          value: '{{currentUser.uid}}',
        },
        config: {
          approvalForm: {
            fields: [
              {
                id: 'decision',
                type: 'select',
                label: 'Decision',
                required: true,
                options: ['Approve', 'Reject'],
              },
              {
                id: 'comments',
                type: 'text',
                label: 'Comments',
                multiline: true,
                required: true,
              }
            ]
          },
          timeoutHours: 48,
        }
      }
    },
    {
      id: 'condition_1',
      type: 'condition',
      position: { x: 250, y: 250 },
      data: {
        label: 'Check Decision',
        field: 'decision',
        operator: 'equals',
        value: 'Approve',
      }
    },
    {
      id: 'action_2',
      type: 'action',
      position: { x: 100, y: 350 },
      data: {
        label: 'Send Approval Notification',
        actionType: 'notification',
        config: {
          template: 'purchase_request_approved',
          channel: 'email',
          to: '{{form.requester_email}}',
          data: {
            requesterName: '{{form.requester_name}}',
            itemName: '{{form.item_name}}',
            amount: '{{form.total_amount}}',
            approverComments: '{{approval.comments}}',
          }
        }
      }
    },
    {
      id: 'action_3',
      type: 'action',
      position: { x: 400, y: 350 },
      data: {
        label: 'Send Rejection Notification',
        actionType: 'notification',
        config: {
          template: 'purchase_request_rejected',
          channel: 'email',
          to: '{{form.requester_email}}',
          data: {
            requesterName: '{{form.requester_name}}',
            itemName: '{{form.item_name}}',
            amount: '{{form.total_amount}}',
            rejectionReason: '{{approval.comments}}',
          }
        }
      }
    },
    {
      id: 'action_4',
      type: 'action',
      position: { x: 250, y: 450 },
      data: {
        label: 'Update Request Status',
        actionType: 'api',
        config: {
          method: 'POST',
          url: '/api/purchase-requests/{{workflow.executionId}}/status',
          body: {
            status: '{{workflow.status}}',
            approvalChain: '{{workflow.approvals}}',
            finalDecision: '{{workflow.finalDecision}}',
          }
        }
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'trigger_1', target: 'action_1' },
    { id: 'e2', source: 'action_1', target: 'condition_1' },
    { id: 'e3', source: 'condition_1', target: 'action_2', label: 'Approved' },
    { id: 'e4', source: 'condition_1', target: 'action_3', label: 'Rejected' },
    { id: 'e5', source: 'action_2', target: 'action_4' },
    { id: 'e6', source: 'action_3', target: 'action_4' },
  ],
}; 